"""Dataset loader and component compatibility manager for GearCity."""

import ast
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd

from gearcity.config import DEFAULT_DATA_DIR


class DataLoader:
    """Loads and caches GearCity game CSV data with lookup utilities."""

    def __init__(self, data_dir: Optional[Path] = None):
        self.data_dir = Path(data_dir) if data_dir else DEFAULT_DATA_DIR
        self._load_datasets()

    def _load_datasets(self) -> None:
        """Load all CSVs and process JSON/list strings."""
        layouts_df = pd.read_csv(self.data_dir / "Engine_Layouts.csv")
        cylinders_df = pd.read_csv(self.data_dir / "Engine_Cylinders.csv")
        fuel_df = pd.read_csv(self.data_dir / "Engine_Fuel.csv")
        induction_df = pd.read_csv(self.data_dir / "Engine_Induction.csv")
        valve_df = pd.read_csv(self.data_dir / "Engine_Valvetrain.csv")
        engine_size_df = pd.read_csv(self.data_dir / "engine_size.csv")
        world_events_df = pd.read_csv(self.data_dir / "world_event.csv")

        # Clean layouts and parse lists
        def parse_str_list(val: Any) -> List[str]:
            if isinstance(val, list):
                return val
            if pd.isna(val):
                return []
            try:
                parsed = ast.literal_eval(str(val))
                return [str(x) for x in parsed]
            except Exception:
                return [s.strip(" []\"'") for s in str(val).split(",")]

        layouts_df["Cylinders"] = layouts_df["Cylinders"].apply(parse_str_list)
        layouts_df["Fuel Types"] = layouts_df["Fuel Types"].apply(parse_str_list)
        layouts_df["Inductions"] = layouts_df["Inductions"].apply(parse_str_list)

        # Filter out steam/electric/water items for standard combustion engine calculations
        self.layouts = layouts_df[~layouts_df["Name"].isin(["Steam", "Electric"])].reset_index(drop=True)
        self.cylinders = cylinders_df[~cylinders_df["Name"].isin(["Steam", "Electric"])].reset_index(drop=True)
        self.fuel = fuel_df[
            ~fuel_df["Name"].isin(["Electric I", "Electric II", "Electric III", "Electric IV", "Electric V", "Water"])
        ].reset_index(drop=True)
        self.induction = induction_df[~induction_df["Name"].isin(["No Induction"])].reset_index(drop=True)
        self.valvetrain = valve_df.reset_index(drop=True)
        self.engine_size = engine_size_df.reset_index(drop=True)
        self.world_events = world_events_df.reset_index(drop=True)

    def get_world_rates(self, year: int) -> Tuple[float, float]:
        """Return (interest_rate, carprice_rate) for a given year."""
        year_row = self.world_events[self.world_events["year"] == year]
        if not year_row.empty:
            return float(year_row["interest_rate"].iloc[0]), float(year_row["carprice_rate"].iloc[0])
        # Fallback to nearest available year
        if year < int(self.world_events["year"].min()):
            earliest = self.world_events.iloc[0]
            return float(earliest["interest_rate"]), float(earliest["carprice_rate"])
        latest = self.world_events.iloc[-1]
        return float(latest["interest_rate"]), float(latest["carprice_rate"])

    def get_bore_stroke_limits(self, layout_name: str, year: int) -> Tuple[float, float, float, float]:
        """Interpolate min/max bore and stroke for a layout at a given year."""
        check_layout = "Radial" if layout_name == "Rotary" else layout_name
        df = self.engine_size

        if year % 5 == 0 or year > 2020:
            limit_year = 2020 if year > 2020 else (year // 5 * 5)
            row = df[(df["Name"] == check_layout) & (df["Year"] == limit_year)]
            if row.empty:
                # Fallback to layout general values
                row = df[df["Name"] == check_layout]
            if row.empty:
                return (50.0, 150.0, 50.0, 150.0)
            return (
                float(row["Min_Bore"].iloc[0]),
                float(row["Max_Bore"].iloc[0]),
                float(row["Min_Stroke"].iloc[0]),
                float(row["Max_Stroke"].iloc[0]),
            )

        # Linear interpolation between 5-year brackets
        limit_year_min = year // 5 * 5
        limit_year_max = (year // 5 + 1) * 5
        row_min = df[(df["Name"] == check_layout) & (df["Year"] == limit_year_min)]
        row_max = df[(df["Name"] == check_layout) & (df["Year"] == limit_year_max)]

        if row_min.empty or row_max.empty:
            return (50.0, 150.0, 50.0, 150.0)

        min_bore_min = float(row_min["Min_Bore"].iloc[0])
        max_bore_min = float(row_min["Max_Bore"].iloc[0])
        min_stroke_min = float(row_min["Min_Stroke"].iloc[0])
        max_stroke_min = float(row_min["Max_Stroke"].iloc[0])

        min_bore_max = float(row_max["Min_Bore"].iloc[0])
        max_bore_max = float(row_max["Max_Bore"].iloc[0])
        min_stroke_max = float(row_max["Min_Stroke"].iloc[0])
        max_stroke_max = float(row_max["Max_Stroke"].iloc[0])

        factor = (5 - (year % 5)) * 0.2
        min_bore = min_bore_max + ((min_bore_min - min_bore_max) * factor)
        max_bore = max_bore_max + ((max_bore_min - max_bore_max) * factor)
        min_stroke = min_stroke_max + ((min_stroke_min - min_stroke_max) * factor)
        max_stroke = max_stroke_max + ((max_stroke_min - max_stroke_max) * factor)

        return min_bore, max_bore, min_stroke, max_stroke

    def get_valid_valvetrains_for_layout(self, layout_row: pd.Series, year: int) -> List[str]:
        """Return valid valvetrain names for a layout and year."""
        valve_type = int(layout_row["Valve"])
        if valve_type == 1:
            return ["No Valve"]
        if valve_type == 3:
            return ["Poppet Valve", "Sleeve Valve"]
        if valve_type == 2:
            valves = ["F Head", "L Head", "OHV", "SOHC", "T Head", "Two Stroke"]
            if year >= 1904:
                valves.append("DOHC")
            return valves
        return ["OHV"]
