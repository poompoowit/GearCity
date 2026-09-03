"""Vehicle demographic preferences and market target calculator for GearCity."""

from typing import Dict, List, Optional, Tuple
import pandas as pd

from gearcity.models import DemographicResult

# Vehicle base preference profiles
DEFAULT_VEHICLE_PROFILES: Dict[str, Dict[str, float]] = {
    "Compact Car": {
        "Performance": 0.20, "Driveability": 0.45, "Luxury": 0.35, "Safety": 0.50,
        "Fuel": 0.75, "Power": 0.10, "Cargo": 0.40, "Dependability": 0.75
    },
    "Compact Sport Utility": {
        "Performance": 0.30, "Driveability": 0.40, "Luxury": 0.10, "Safety": 0.30,
        "Fuel": 0.10, "Power": 0.40, "Cargo": 0.35, "Dependability": 0.60
    },
    "Compact Van": {
        "Performance": 0.10, "Driveability": 0.45, "Luxury": 0.15, "Safety": 0.10,
        "Fuel": 0.50, "Power": 0.35, "Cargo": 0.85, "Dependability": 0.50
    },
    "Coupe": {
        "Performance": 0.70, "Driveability": 0.65, "Luxury": 0.25, "Safety": 0.25,
        "Fuel": 0.35, "Power": 0.30, "Cargo": 0.20, "Dependability": 0.35
    },
    "Coupe 2+2": {
        "Performance": 0.65, "Driveability": 0.55, "Luxury": 0.35, "Safety": 0.30,
        "Fuel": 0.40, "Power": 0.35, "Cargo": 0.25, "Dependability": 0.35
    },
    "Coupe Utility": {
        "Performance": 0.45, "Driveability": 0.40, "Luxury": 0.20, "Safety": 0.10,
        "Fuel": 0.15, "Power": 0.75, "Cargo": 0.75, "Dependability": 0.65
    },
    "Crossover": {
        "Performance": 0.30, "Driveability": 0.25, "Luxury": 0.50, "Safety": 0.70,
        "Fuel": 0.50, "Power": 0.30, "Cargo": 0.65, "Dependability": 0.50
    },
    "Fastback": {
        "Performance": 0.70, "Driveability": 0.65, "Luxury": 0.35, "Safety": 0.15,
        "Fuel": 0.25, "Power": 0.40, "Cargo": 0.30, "Dependability": 0.40
    },
    "Full Sized Sedan": {
        "Performance": 0.30, "Driveability": 0.25, "Luxury": 0.65, "Safety": 0.70,
        "Fuel": 0.55, "Power": 0.60, "Cargo": 0.65, "Dependability": 0.40
    },
    "Hatchback": {
        "Performance": 0.30, "Driveability": 0.60, "Luxury": 0.40, "Safety": 0.50,
        "Fuel": 0.65, "Power": 0.20, "Cargo": 0.50, "Dependability": 0.70
    },
    "Landaulet": {
        "Performance": 0.20, "Driveability": 0.15, "Luxury": 0.90, "Safety": 0.50,
        "Fuel": 0.05, "Power": 0.30, "Cargo": 0.70, "Dependability": 0.35
    },
    "Limousine": {
        "Performance": 0.15, "Driveability": 0.15, "Luxury": 0.80, "Safety": 0.50,
        "Fuel": 0.05, "Power": 0.30, "Cargo": 0.75, "Dependability": 0.40
    },
    "Luxury Sedan": {
        "Performance": 0.55, "Driveability": 0.50, "Luxury": 0.90, "Safety": 0.75,
        "Fuel": 0.35, "Power": 0.60, "Cargo": 0.68, "Dependability": 0.70
    },
    "Microcar": {
        "Performance": 0.05, "Driveability": 0.50, "Luxury": 0.125, "Safety": 0.10,
        "Fuel": 0.90, "Power": 0.05, "Cargo": 0.10, "Dependability": 0.65
    },
    "Microvan": {
        "Performance": 0.10, "Driveability": 0.50, "Luxury": 0.20, "Safety": 0.10,
        "Fuel": 0.55, "Power": 0.30, "Cargo": 0.85, "Dependability": 0.50
    },
    "Minivan": {
        "Performance": 0.10, "Driveability": 0.25, "Luxury": 0.55, "Safety": 0.85,
        "Fuel": 0.55, "Power": 0.15, "Cargo": 0.80, "Dependability": 0.45
    },
    "Phaeton": {
        "Performance": 0.10, "Driveability": 0.30, "Luxury": 0.10, "Safety": 0.50,
        "Fuel": 0.45, "Power": 0.05, "Cargo": 0.20, "Dependability": 0.50
    },
    "Pickup Truck": {
        "Performance": 0.40, "Driveability": 0.15, "Luxury": 0.15, "Safety": 0.05,
        "Fuel": 0.05, "Power": 0.90, "Cargo": 0.95, "Dependability": 0.80
    },
    "Roadster": {
        "Performance": 0.70, "Driveability": 0.90, "Luxury": 0.05, "Safety": 0.10,
        "Fuel": 0.25, "Power": 0.25, "Cargo": 0.20, "Dependability": 0.30
    },
    "Roadster 2+2": {
        "Performance": 0.65, "Driveability": 0.85, "Luxury": 0.15, "Safety": 0.15,
        "Fuel": 0.30, "Power": 0.30, "Cargo": 0.25, "Dependability": 0.35
    },
    "Sedan": {
        "Performance": 0.40, "Driveability": 0.40, "Luxury": 0.45, "Safety": 0.65,
        "Fuel": 0.65, "Power": 0.45, "Cargo": 0.50, "Dependability": 0.45
    },
    "Shooting Brake": {
        "Performance": 0.20, "Driveability": 0.15, "Luxury": 0.50, "Safety": 0.70,
        "Fuel": 0.35, "Power": 0.30, "Cargo": 0.75, "Dependability": 0.50
    },
    "Sports": {
        "Performance": 0.90, "Driveability": 0.85, "Luxury": 0.10, "Safety": 0.10,
        "Fuel": 0.05, "Power": 0.80, "Cargo": 0.10, "Dependability": 0.35
    },
    "Station Wagon": {
        "Performance": 0.25, "Driveability": 0.15, "Luxury": 0.55, "Safety": 0.75,
        "Fuel": 0.60, "Power": 0.30, "Cargo": 0.75, "Dependability": 0.50
    },
    "Subcompact": {
        "Performance": 0.10, "Driveability": 0.40, "Luxury": 0.35, "Safety": 0.70,
        "Fuel": 0.90, "Power": 0.10, "Cargo": 0.30, "Dependability": 0.80
    },
    "Supercar": {
        "Performance": 1.00, "Driveability": 1.00, "Luxury": 0.01, "Safety": 0.01,
        "Fuel": 0.01, "Power": 1.00, "Cargo": 0.01, "Dependability": 0.05
    },
    "Sport Utility Vehicle": {
        "Performance": 0.25, "Driveability": 0.15, "Luxury": 0.50, "Safety": 0.75,
        "Fuel": 0.25, "Power": 0.80, "Cargo": 0.60, "Dependability": 0.40
    },
    "Touring": {
        "Performance": 0.50, "Driveability": 0.75, "Luxury": 0.50, "Safety": 0.30,
        "Fuel": 0.40, "Power": 0.50, "Cargo": 0.40, "Dependability": 0.40
    },
    "Town Car": {
        "Performance": 0.15, "Driveability": 0.15, "Luxury": 0.80, "Safety": 0.50,
        "Fuel": 0.15, "Power": 0.40, "Cargo": 0.60, "Dependability": 0.40
    },
    "Van": {
        "Performance": 0.05, "Driveability": 0.10, "Luxury": 0.05, "Safety": 0.05,
        "Fuel": 0.05, "Power": 0.70, "Cargo": 0.95, "Dependability": 0.70
    },
}

GENDER_MODIFIERS: Dict[str, Dict[str, float]] = {
    "Male": {"Performance": 0.05, "Power": 0.05, "Driveability": 0.05, "Fuel": -0.05, "Safety": -0.05, "Cargo": -0.05},
    "Female": {"Performance": -0.05, "Power": -0.05, "Driveability": -0.05, "Fuel": 0.05, "Safety": 0.05, "Cargo": 0.05},
    "Neutral": {},
}

AGE_MODIFIERS: Dict[str, Dict[str, float]] = {
    "Less Than 25": {"Performance": 0.05, "Fuel": 0.05, "Safety": -0.05, "Luxury": -0.05, "Dependability": 0.05, "Quality": -0.05},
    "25-35": {"Performance": -0.05, "Power": -0.05, "Driveability": -0.05, "Safety": 0.05, "Cargo": 0.05, "Dependability": 0.05},
    "35-55": {"Performance": 0.05, "Power": 0.05, "Fuel": -0.05, "Safety": -0.05, "Cargo": -0.05, "Luxury": 0.05, "Dependability": -0.05, "Quality": 0.05},
    "Greater Than 55": {"Performance": -0.05, "Power": -0.05, "Fuel": -0.05, "Safety": 0.05, "Luxury": 0.05, "Dependability": 0.05, "Driveability": -0.05, "Quality": 0.05},
}


class DemographicCalculator:
    """Calculates customer preference match and best demographic targeting for GearCity vehicles."""

    def __init__(self, profiles: Optional[Dict[str, Dict[str, float]]] = None):
        self.profiles = profiles or DEFAULT_VEHICLE_PROFILES

    def evaluate_vehicle(self, vehicle_type: str) -> DemographicResult:
        """Find the optimal gender and age demographic for a single vehicle type."""
        if vehicle_type not in self.profiles:
            raise KeyError(f"Unknown vehicle type '{vehicle_type}'. Valid types: {list(self.profiles.keys())}")

        attr_dict = self.profiles[vehicle_type]
        best_score = float("-inf")
        best_gender = "Neutral"
        best_age = "25-35"
        all_scores: Dict[str, float] = {}

        for gender_name, g_mods in GENDER_MODIFIERS.items():
            for age_name, a_mods in AGE_MODIFIERS.items():
                combo_key = f"{gender_name} ({age_name})"
                score = 0.0
                for col, base_val in attr_dict.items():
                    mod = 1.0 + g_mods.get(col, 0.0) + a_mods.get(col, 0.0)
                    score += base_val * mod

                all_scores[combo_key] = round(score, 5)
                if score > best_score:
                    best_score = score
                    best_gender = gender_name
                    best_age = age_name

        return DemographicResult(
            vehicle_type=vehicle_type,
            best_gender=best_gender,
            best_age=best_age,
            best_score=round(best_score, 5),
            all_scores=all_scores,
        )

    def evaluate_all(self) -> List[DemographicResult]:
        """Evaluate all 30 vehicle classes."""
        return [self.evaluate_vehicle(v) for v in self.profiles]

    def to_dataframe(self) -> pd.DataFrame:
        """Return full summary table as a Pandas DataFrame."""
        results = self.evaluate_all()
        return pd.DataFrame([
            {
                "Vehicle Type": r.vehicle_type,
                "Best Demographics Gender": r.best_gender,
                "Best Demographics Age": r.best_age,
                "Best Score": r.best_score,
            }
            for r in results
        ])
