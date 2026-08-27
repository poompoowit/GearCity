"""Engine calculation engine implementing official GearCity engineering and cost equations."""

from typing import Optional, Tuple

import pandas as pd

from gearcity.config import DEFAULT_DESIGN_RANDOM_VAL, DEFAULT_ENGINE_SKILL, YearFactors
from gearcity.data_loader import DataLoader
from gearcity.models import EngineComponents, EngineConfiguration, EnginePerformanceResult, EngineSliders


class EngineCalculator:
    """Calculates displacement, power, torque, RPM, dimensions, weight, and unit costs."""

    def __init__(self, data_loader: Optional[DataLoader] = None):
        self.data_loader = data_loader or DataLoader()

    def calculate_bore_stroke(
        self, bore_slide: float, stroke_slide: float, layout_name: str, year: int
    ) -> Tuple[float, float]:
        """Convert bore/stroke sliders (0..1000) to millimeters based on year and layout."""
        min_b, max_b, min_s, max_s = self.data_loader.get_bore_stroke_limits(layout_name, year)
        bore_mm = min_b + ((max_b - min_b) * (bore_slide / 1000.0))
        stroke_mm = min_s + ((max_s - min_s) * (stroke_slide / 1000.0))
        return bore_mm, stroke_mm

    def calculate_performance(
        self,
        config: EngineConfiguration,
        interest_rate: Optional[float] = None,
        carprice_rate: Optional[float] = None,
    ) -> EnginePerformanceResult:
        """Calculate complete performance and cost output for an EngineConfiguration."""
        year = config.year
        yf = YearFactors.from_year(year)
        comp = config.components
        sliders = config.sliders

        if interest_rate is None or carprice_rate is None:
            ir, cp = self.data_loader.get_world_rates(year)
            interest_rate = interest_rate if interest_rate is not None else ir
            carprice_rate = carprice_rate if carprice_rate is not None else cp

        # Retrieve component rows
        layout_row = self.data_loader.layouts[self.data_loader.layouts["Name"] == comp.layout].iloc[0]
        cylinder_row = self.data_loader.cylinders[self.data_loader.cylinders["Name"] == comp.cylinders].iloc[0]
        fuel_row = self.data_loader.fuel[self.data_loader.fuel["Name"] == comp.fuel].iloc[0]
        induction_row = self.data_loader.induction[self.data_loader.induction["Name"] == comp.induction].iloc[0]
        valve_row = self.data_loader.valvetrain[self.data_loader.valvetrain["Name"] == comp.valve].iloc[0]

        # Extract attributes
        layout_length = float(layout_row["Length"])
        layout_width = float(layout_row["Width"])
        layout_power = float(layout_row["Power"])
        layout_cost = float(layout_row["Costs"])
        layout_weight = float(layout_row["Weight"])
        cyl_arrangement = float(layout_row["Cylinder Arrangement"])

        cylinder_power = float(cylinder_row["Power"])
        cylinder_count = float(cylinder_row["Number of Cylinders"])
        cylinder_cost = float(cylinder_row["Cost"])
        cylinder_weight = float(cylinder_row["Weight"])

        fuel_rpm = float(fuel_row["RPM"])
        fuel_power = float(fuel_row["Power"])
        fuel_cost = float(fuel_row["Cost"])
        fuel_weight = float(fuel_row["Weight"])

        induction_power = float(induction_row["Power"])
        induction_cost = float(induction_row["Cost"])
        induction_weight = float(induction_row["Weight"])

        valve_rpm = float(valve_row["RPM"])
        valve_power = float(valve_row["Power"])
        valve_cost = float(valve_row["Costs"])
        valve_weight = float(valve_row["Weight"])
        valve_size = float(valve_row["Size"])

        # Bore & Stroke
        bore_mm, stroke_mm = self.calculate_bore_stroke(
            sliders.bore_slide, sliders.stroke_slide, comp.layout, year
        )

        # Displacement (CC)
        displacement_cc = 0.7854 * ((bore_mm / 10.0) ** 2) * (stroke_mm / 10.0) * cylinder_count

        # Torque
        torque = 10.0 + (config.design_skill / 20.0) + (
            (
                (25.0 * ((sliders.performance_torque - 0.4) * 1.5) * yf.ex_1d01p_year99)
                + (4.0 * (layout_length + layout_width) * yf.ex_1d005p_year99)
                - (14.0 * (sliders.performance_fuel_economy + sliders.design_focus_fuel_economy) * yf.ex_1d004p_year99)
                + (
                    layout_power * 5.0
                    + cylinder_power * 13.0
                    + fuel_power * 24.0
                    + 100.0 * induction_power
                    + (5.0 * yf.ex_1d004p_year99 * sliders.design_focus_performance)
                    + 8.0
                    * (
                        sliders.technology_components
                        + sliders.technology_materials
                        + sliders.technology_technologies
                        + sliders.technology_techniques
                    )
                )
                * yf.ex_1d0024p_year99
            )
        )

        torque = torque * ((cylinder_count * stroke_mm * 0.93 * bore_mm * 0.9) * 0.000027) + 5.0

        if year < 2050:
            torque = torque * yf.ex_0d996p_year50R

        torque = torque * valve_power

        # RPM
        tmp_ay = float(yf.adjusted_year)
        if tmp_ay > 80.0:
            tmp_ay = 80.0 + ((yf.adjusted_year - 80.0) / 5.0)

        rpm = (
            (
                ((tmp_ay**4) * 0.00000420875)
                - ((19.0 * (tmp_ay**3)) * 0.00016835)
                + ((427.0 * (tmp_ay**2)) * 0.00126)
                + ((1315.0 * tmp_ay) * 0.01515)
                + 620.0
            )
            + (265.0 * yf.ex_1d01p_year99 * sliders.design_focus_performance)
            + (465.0 * yf.ex_1d0105p_year99 * (sliders.performance_revolutions * 5.5))
            - (10.0 * yf.ex_1d01p_year99 * induction_power)
            + (55.0 * yf.ex_1d005p_year99 * (1.0 - sliders.layout_weight))
            - (30.0 * yf.ex_1d005p_year99 * (sliders.design_focus_fuel_economy + sliders.performance_fuel_economy))
            + (25.0 * yf.ex_1d01p_year99 * sliders.technology_components)
            + (25.0 * yf.ex_1d01p_year99 * sliders.technology_materials)
            + (25.0 * yf.ex_1d01p_year99 * sliders.technology_technologies)
        ) * fuel_rpm

        rpm = rpm * valve_rpm
        rpm = rpm - ((rpm / 1.5) * (stroke_mm / 221.136364))

        if rpm < 25.0:
            rpm = 25.0

        # Horsepower
        hp = (torque * rpm) / 5252.0

        # Dimensions
        if cyl_arrangement == 1:
            length = (
                (3.0 + (displacement_cc / (47.3 + 277.0))) * layout_length
                + (cylinder_count * (bore_mm / 130.0))
                + (cylinder_count + (5.0 * (bore_mm / 130.0)) + 2.0 * valve_size)
            )
            length = length + (0.16 * length * sliders.layout_length)
        elif cyl_arrangement < 0:
            bank = cyl_arrangement * -1.0
            length = 3.0 + (0.039 * (bore_mm * 2.0)) + 5.0 * sliders.layout_length
            length = length * bank
        else:
            banks = 0.5 if cyl_arrangement == 0 else (1.0 / cyl_arrangement)
            length = (
                (4.0 + ((displacement_cc * (banks * 2.0)) / (47.3 + 277.0))) * layout_length
                + ((cylinder_count * banks) * (bore_mm / 130.0))
                + ((cylinder_count * (banks * 2.0)) + (5.0 * (bore_mm / 130.0)) + 2.0 * valve_size)
            )
            length = length + (0.16 * length * sliders.layout_length)

        width = (
            (6.0 + (displacement_cc / (57.3 + 302.0))) * layout_width
            + ((6.0 * (bore_mm / 115.0)) + 5.0 * valve_size)
        )
        width = width + (0.16 * width * sliders.layout_width)
        if cyl_arrangement < -1:
            bank = 1.0 / (cyl_arrangement * -1.0)
            width = width * bank

        # Weight
        avg_weight_mult = (valve_weight + layout_weight + fuel_weight + induction_weight + cylinder_weight) / 5.0
        weight = (
            30.0
            + (55.0 * avg_weight_mult)
            + (100.0 * (stroke_mm / 80.0))
            + (
                ((length * 1.95 * width) / 80.0)
                + (
                    40.0
                    + (42.0 * (((sliders.layout_width + sliders.layout_length) / 2.0) + 0.05))
                    + ((15.0 + (15.0 * avg_weight_mult)) * (sliders.layout_weight + 0.1))
                    - (15.0 * sliders.technology_materials)
                    + (5.0 * induction_weight)
                    + (8.0 * (sliders.layout_width + sliders.layout_length))
                )
                * ((length * 1.78 * width) / 800.0)
            )
            + ((5.0 + (5.0 * cylinder_weight)) * cylinder_count)
        )
        if cyl_arrangement > 2:
            weight = weight * (cyl_arrangement / 2.9)

        length_cm = length * 2.54
        width_cm = width * 2.54
        weight_kg = weight * 0.45359237

        # Unit Costs
        slider_layout_disp = (sliders.bore_slide + sliders.stroke_slide) / 1000.0
        unit_cost = (
            (
                (
                    (
                        (70.0 * yf.ex_1d01p_year99 * (((1.0 - sliders.layout_length) + (1.0 - sliders.layout_width)) / 2.0))
                        + (
                            220.0
                            * yf.ex_1d004p_year99
                            * (
                                ((0.25 + (sliders.performance_revolutions**2) + (sliders.performance_torque**2)) / 2.0)
                                - (0.5 - (sliders.performance_fuel_economy**2))
                            )
                        )
                        + (60.0 * yf.ex_1d01p_year99)
                        * ((sliders.performance_revolutions**2) + (sliders.performance_torque**2))
                        + 220.0
                        * yf.ex_1d008p_year99
                        * (
                            0.1
                            + (
                                (sliders.technology_materials**2)
                                + (sliders.technology_techniques**2)
                                + (sliders.technology_components**2)
                            )
                        )
                        + 170.0 * yf.ex_1d008p_year99 * (sliders.technology_technologies**2)
                        + 50.0 * yf.ex_1d0035p_year99 * (sliders.design_focus_dependability**2)
                        + 180.0 * yf.ex_1d0035p_year99 * (sliders.design_focus_performance**2)
                        + (
                            260.0
                            * yf.ex_1d006p_year99
                            * (
                                2.168 * (slider_layout_disp**1.5)
                                - 4.44 * (slider_layout_disp**3)
                                + 2.646 * (slider_layout_disp**4.5)
                                + 3.126 * (slider_layout_disp**6)
                            )
                            + (
                                70.0 * yf.ex_1d005p_year99 * (cylinder_count / 6.0)
                                + (0.75 + (slider_layout_disp**1.5))
                                - (sliders.layout_weight**2)
                            )
                            + 10.0 * (sliders.design_focus_fuel_economy**2)
                            - 50.0
                        )
                        * yf.ex_1d003p_year99
                        + (160.0 * cylinder_cost) ** yf.ex_1d003p_year99
                        + (120.0 * layout_cost) ** yf.ex_1d004p_year99
                        + (140.0 * valve_cost) ** yf.ex_1d004p_year99
                        + (435.0 * induction_cost) ** yf.ex_1d004p_year99
                        + (120.0 * fuel_cost) ** yf.ex_1d004p_year99
                    )
                    * (0.125 + 0.12 * cylinder_count)
                )
                * (interest_rate / 2.0)
            )
            + 50.0
        ) * carprice_rate * DEFAULT_DESIGN_RANDOM_VAL

        hyper_sliders = (
            (
                slider_layout_disp * 2.0
                + (1.0 - sliders.layout_length)
                + (1.0 - sliders.layout_width)
                + (1.0 - sliders.layout_weight)
            )
            + (sliders.performance_revolutions + sliders.performance_torque + sliders.performance_fuel_economy)
            + (
                sliders.design_focus_performance
                + sliders.design_focus_fuel_economy
                + sliders.design_focus_dependability
            )
            + (
                sliders.technology_materials
                + sliders.technology_components
                + sliders.technology_techniques
                + sliders.technology_technologies
            )
        ) / 13.0

        hyper_costs = 475.0 * yf.ex_1d04p_year99 * (hyper_sliders**4)
        unit_cost = unit_cost + hyper_costs - ((unit_cost / 10.0) * (config.design_skill / 100.0))

        return EnginePerformanceResult(
            displacement_cc=displacement_cc,
            bore_mm=bore_mm,
            stroke_mm=stroke_mm,
            torque_ft_lb=torque,
            torque_nm=torque * 1.3558,
            rpm=rpm,
            horsepower=hp,
            length_cm=length_cm,
            width_cm=width_cm,
            weight_kg=weight_kg,
            unit_cost=unit_cost,
        )
