"""Differential Evolution optimization engine for designing optimal GearCity engines under constraints."""

import warnings
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from scipy.optimize import differential_evolution

from gearcity.data_loader import DataLoader
from gearcity.engine_calculator import EngineCalculator
from gearcity.models import (
    EngineComponents,
    EngineConfiguration,
    EnginePerformanceResult,
    EngineSliders,
    OptimizationConstraints,
)


class EngineOptimizer:
    """Solves for optimal component combinations and slider settings for a target year."""

    def __init__(self, data_loader: Optional[DataLoader] = None, calculator: Optional[EngineCalculator] = None):
        self.data_loader = data_loader or DataLoader()
        self.calculator = calculator or EngineCalculator(self.data_loader)

    def optimize(
        self,
        year: int,
        constraints: Optional[OptimizationConstraints] = None,
        model_name: str = "Optimized Engine",
        fixed_sliders: Optional[Dict[str, float]] = None,
        maxiter: int = 100,
        popsize: int = 15,
        tol: float = 0.01,
        workers: int = 1,
        seed: Optional[int] = 42,
    ) -> Tuple[EngineConfiguration, EnginePerformanceResult, Any]:
        """Run differential evolution optimization to find the best engine configuration."""
        constraints = constraints or OptimizationConstraints()
        fixed = fixed_sliders or {}

        # 1. Filter unlocked components up to target year
        allowed_layouts = constraints.allowed_layouts
        allowed_fuels = constraints.allowed_fuels
        allowed_cylinders = constraints.allowed_cylinders
        allowed_inductions = constraints.allowed_inductions
        allowed_valves = constraints.allowed_valves

        layouts_df = self.data_loader.layouts
        cylinders_df = self.data_loader.cylinders
        fuel_df = self.data_loader.fuel
        induction_df = self.data_loader.induction
        valve_df = self.data_loader.valvetrain

        # Layouts
        layouts_list = []
        cylinder_pairing: Dict[int, List[str]] = {}
        fuel_pairing: Dict[int, List[str]] = {}
        induction_pairing: Dict[int, List[str]] = {}
        valve_pairing_names: Dict[int, List[str]] = {}

        naw_index = 0
        for _, lay_row in layouts_df.iterrows():
            if lay_row["Year"] <= year:
                if allowed_layouts is None or lay_row["Name"] in allowed_layouts:
                    layouts_list.append(lay_row)
                    cylinder_pairing[naw_index] = lay_row["Cylinders"]
                    fuel_pairing[naw_index] = lay_row["Fuel Types"]
                    induction_pairing[naw_index] = lay_row["Inductions"]
                    valve_pairing_names[naw_index] = self.data_loader.get_valid_valvetrains_for_layout(lay_row, year)
                    naw_index += 1

        if not layouts_list:
            raise ValueError(f"No available engine layouts for year {year} matching criteria.")

        # Cylinders
        cylinders_list = []
        cylinder_mapping = {}
        naw_index = 0
        for _, cyl_row in cylinders_df.iterrows():
            if cyl_row["Year"] <= year + 1:
                if allowed_cylinders is None or cyl_row["Name"] in allowed_cylinders:
                    cylinders_list.append(cyl_row)
                    cylinder_mapping[cyl_row["Name"]] = naw_index
                    naw_index += 1

        # Fuel
        fuel_list = []
        fuel_mapping = {}
        naw_index = 0
        for _, f_row in fuel_df.iterrows():
            if f_row["Year"] <= year + 1:
                if allowed_fuels is None or f_row["Name"] in allowed_fuels:
                    fuel_list.append(f_row)
                    fuel_mapping[f_row["Name"]] = naw_index
                    naw_index += 1

        # Induction
        induction_list = []
        induction_mapping = {}
        naw_index = 0
        for _, ind_row in induction_df.iterrows():
            if ind_row["Year"] <= year + 1:
                if allowed_inductions is None or ind_row["Name"] in allowed_inductions:
                    induction_list.append(ind_row)
                    induction_mapping[ind_row["Name"]] = naw_index
                    naw_index += 1

        # Valvetrain
        valve_list = []
        valve_mapping = {}
        naw_index = 0
        for _, v_row in valve_df.iterrows():
            if v_row["Year"] <= year + 1:
                if allowed_valves is None or v_row["Name"] in allowed_valves:
                    valve_list.append(v_row)
                    valve_mapping[v_row["Name"]] = naw_index
                    naw_index += 1

        # Build index-based pairing lookups
        cylinder_pairing_idx = {
            k: [cylinder_mapping[item] for item in v if item in cylinder_mapping]
            for k, v in cylinder_pairing.items()
        }
        fuel_pairing_idx = {
            k: [fuel_mapping[item] for item in v if item in fuel_mapping]
            for k, v in fuel_pairing.items()
        }
        induction_pairing_idx = {
            k: [induction_mapping[item] for item in v if item in induction_mapping]
            for k, v in induction_pairing.items()
        }
        valve_pairing_idx = {
            k: [valve_mapping[item] for item in v if item in valve_mapping]
            for k, v in valve_pairing_names.items()
        }

        # Default fixed slider fallbacks
        default_perf_fuel_eco = fixed.get("performance_fuel_economy", 0.0)
        default_design_focus_dep = fixed.get("design_focus_dependability", 0.5)
        default_tech_comp = fixed.get("technology_components", 0.0)
        default_tech_tech = fixed.get("technology_technologies", 0.0)
        default_tech_techniques = fixed.get("technology_techniques", 0.0)

        # Bounds:
        bounds = [
            (0, len(layouts_list) - 1),
            (0, len(cylinders_list) - 1),
            (0, len(fuel_list) - 1),
            (0, len(induction_list) - 1),
            (0, len(valve_list) - 1),
            (0.0, 1000.0),
            (0.0, 1000.0),
            (0.0, 1.0),
            (0.0, 1.0),
            (0.0, 1.0),
            (0.0, 1.0),
            (0.0, 1.0),
            (0.0, 1.0),
            (0.0, 1.0),
            (0.0, 1.0),
        ]

        def objective(vars_vec: np.ndarray) -> float:
            lay_idx = int(round(vars_vec[0]))
            cyl_idx = int(round(vars_vec[1]))
            f_idx = int(round(vars_vec[2]))
            ind_idx = int(round(vars_vec[3]))
            v_idx = int(round(vars_vec[4]))

            # Clamp indices within range
            lay_idx = max(0, min(len(layouts_list) - 1, lay_idx))
            cyl_idx = max(0, min(len(cylinders_list) - 1, cyl_idx))
            f_idx = max(0, min(len(fuel_list) - 1, f_idx))
            ind_idx = max(0, min(len(induction_list) - 1, ind_idx))
            v_idx = max(0, min(len(valve_list) - 1, v_idx))

            # Validation check
            if cyl_idx not in cylinder_pairing_idx.get(lay_idx, []):
                return float("inf")
            if f_idx not in fuel_pairing_idx.get(lay_idx, []):
                return float("inf")
            if ind_idx not in induction_pairing_idx.get(lay_idx, []):
                return float("inf")
            if v_idx not in valve_pairing_idx.get(lay_idx, []):
                return float("inf")

            comp = EngineComponents(
                layout=layouts_list[lay_idx]["Name"],
                cylinders=cylinders_list[cyl_idx]["Name"],
                fuel=fuel_list[f_idx]["Name"],
                induction=induction_list[ind_idx]["Name"],
                valve=valve_list[v_idx]["Name"],
            )

            sliders = EngineSliders(
                bore_slide=float(vars_vec[5]),
                stroke_slide=float(vars_vec[6]),
                performance_torque=float(vars_vec[7]),
                performance_revolutions=float(vars_vec[8]),
                performance_fuel_economy=default_perf_fuel_eco,
                design_focus_fuel_economy=float(vars_vec[9]),
                design_focus_performance=float(vars_vec[10]),
                design_focus_dependability=default_design_focus_dep,
                layout_length=float(vars_vec[11]),
                layout_width=float(vars_vec[12]),
                layout_weight=float(vars_vec[13]),
                technology_materials=float(vars_vec[14]),
                technology_components=default_tech_comp,
                technology_technologies=default_tech_tech,
                technology_techniques=default_tech_techniques,
            )

            cfg = EngineConfiguration(components=comp, sliders=sliders, year=year)
            res = self.calculator.calculate_performance(cfg)

            # Penalties
            penalty = 0.0
            if constraints.max_cost is not None and res.unit_cost > constraints.max_cost:
                penalty += (res.unit_cost - constraints.max_cost) ** 2
            if constraints.max_cc is not None and res.displacement_cc > constraints.max_cc:
                penalty += (res.displacement_cc - constraints.max_cc) ** 2
            if constraints.max_weight_kg is not None and res.weight_kg > constraints.max_weight_kg:
                penalty += (res.weight_kg - constraints.max_weight_kg) ** 2
            if constraints.max_length_cm is not None and res.length_cm > constraints.max_length_cm:
                penalty += (res.length_cm - constraints.max_length_cm) ** 2
            if constraints.max_width_cm is not None and res.width_cm > constraints.max_width_cm:
                penalty += (res.width_cm - constraints.max_width_cm) ** 2
            if (
                constraints.max_hp_torque_ratio is not None
                and res.horsepower > 0
                and (res.torque_nm / res.horsepower) > constraints.max_hp_torque_ratio
            ):
                penalty += ((res.torque_nm / res.horsepower - constraints.max_hp_torque_ratio) * 10.0) ** 3
            if constraints.max_torque is not None and res.torque_nm > constraints.max_torque:
                penalty += ((res.torque_nm - constraints.max_torque) * 100.0) ** 3

            if constraints.design_focus == "Torque":
                return -res.torque_nm + penalty
            return -res.horsepower + penalty

        # Solve
        result = differential_evolution(
            objective,
            bounds,
            strategy="randtobest1bin",
            maxiter=maxiter,
            popsize=popsize,
            tol=tol,
            workers=workers,
            seed=seed,
            disp=False,
        )

        if not result.success:
            warnings.warn(f"Optimization finished with message: {result.message}. Returning best candidate.")

        best_vars = result.x
        best_lay_idx = max(0, min(len(layouts_list) - 1, int(round(best_vars[0]))))
        best_cyl_idx = max(0, min(len(cylinders_list) - 1, int(round(best_vars[1]))))
        best_f_idx = max(0, min(len(fuel_list) - 1, int(round(best_vars[2]))))
        best_ind_idx = max(0, min(len(induction_list) - 1, int(round(best_vars[3]))))
        best_v_idx = max(0, min(len(valve_list) - 1, int(round(best_vars[4]))))

        best_components = EngineComponents(
            layout=layouts_list[best_lay_idx]["Name"],
            cylinders=cylinders_list[best_cyl_idx]["Name"],
            fuel=fuel_list[best_f_idx]["Name"],
            induction=induction_list[best_ind_idx]["Name"],
            valve=valve_list[best_v_idx]["Name"],
        )

        best_sliders = EngineSliders(
            bore_slide=float(best_vars[5]),
            stroke_slide=float(best_vars[6]),
            performance_torque=float(best_vars[7]),
            performance_revolutions=float(best_vars[8]),
            performance_fuel_economy=default_perf_fuel_eco,
            design_focus_fuel_economy=float(best_vars[9]),
            design_focus_performance=float(best_vars[10]),
            design_focus_dependability=default_design_focus_dep,
            layout_length=float(best_vars[11]),
            layout_width=float(best_vars[12]),
            layout_weight=float(best_vars[13]),
            technology_materials=float(best_vars[14]),
            technology_components=default_tech_comp,
            technology_technologies=default_tech_tech,
            technology_techniques=default_tech_techniques,
        )

        final_config = EngineConfiguration(
            components=best_components,
            sliders=best_sliders,
            year=year,
            name=model_name,
        )
        perf_result = self.calculator.calculate_performance(final_config)

        return final_config, perf_result, result
