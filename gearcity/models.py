"""Data models and schemas for GearCity engine, vehicle, and optimization configurations."""

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class EngineSliders:
    """Engine slider settings in normalized ranges (0.0 to 1.0, or 0 to 1000 for bore/stroke)."""
    bore_slide: float = 500.0  # 0 to 1000
    stroke_slide: float = 500.0  # 0 to 1000
    performance_torque: float = 0.5  # 0.0 to 1.0
    performance_revolutions: float = 0.5  # 0.0 to 1.0
    performance_fuel_economy: float = 0.0  # 0.0 to 1.0
    design_focus_performance: float = 0.5  # 0.0 to 1.0
    design_focus_fuel_economy: float = 0.0  # 0.0 to 1.0
    design_focus_dependability: float = 0.5  # 0.0 to 1.0
    layout_length: float = 0.5  # 0.0 to 1.0
    layout_width: float = 0.5  # 0.0 to 1.0
    layout_weight: float = 0.5  # 0.0 to 1.0
    technology_materials: float = 0.5  # 0.0 to 1.0
    technology_components: float = 0.0  # 0.0 to 1.0
    technology_technologies: float = 0.0  # 0.0 to 1.0
    technology_techniques: float = 0.0  # 0.0 to 1.0


@dataclass
class EngineComponents:
    """Selected component names for an engine build."""
    layout: str
    cylinders: str
    fuel: str
    induction: str
    valve: str


@dataclass
class EngineConfiguration:
    """Complete blueprint specification of a GearCity engine."""
    components: EngineComponents
    sliders: EngineSliders
    year: int
    name: str = "Custom Engine"
    transverse: bool = False
    design_pace: float = 50.0
    design_skill: float = 100.0


@dataclass
class EnginePerformanceResult:
    """Calculated engineering output metrics for an engine."""
    displacement_cc: float
    bore_mm: float
    stroke_mm: float
    torque_ft_lb: float
    torque_nm: float
    rpm: float
    horsepower: float
    length_cm: float
    width_cm: float
    weight_kg: float
    unit_cost: float

    def summary(self) -> str:
        return (
            f"Power: {self.horsepower:.1f} HP @ {self.rpm:.0f} RPM | "
            f"Torque: {self.torque_nm:.1f} Nm ({self.torque_ft_lb:.1f} lb-ft) | "
            f"Displacement: {self.displacement_cc:.0f} cc | "
            f"Dimensions: {self.length_cm:.1f}x{self.width_cm:.1f} cm | "
            f"Weight: {self.weight_kg:.1f} kg | "
            f"Unit Cost: ${self.unit_cost:.2f}"
        )


@dataclass
class OptimizationConstraints:
    """Optimization bounds and penalty thresholds."""
    max_cost: Optional[float] = None
    max_cc: Optional[float] = None
    max_weight_kg: Optional[float] = None
    max_length_cm: Optional[float] = None
    max_width_cm: Optional[float] = None
    max_torque: Optional[float] = None
    max_hp_torque_ratio: Optional[float] = None
    design_focus: str = "HP"  # 'HP' or 'Torque'
    allowed_layouts: Optional[List[str]] = None
    allowed_fuels: Optional[List[str]] = None
    allowed_cylinders: Optional[List[str]] = None
    allowed_inductions: Optional[List[str]] = None
    allowed_valves: Optional[List[str]] = None
    design_skill: float = 70.0


@dataclass
class DemographicResult:
    """Demographic targeting results for a vehicle type."""
    vehicle_type: str
    best_gender: str
    best_age: str
    best_score: float
    all_scores: Dict[str, float] = field(default_factory=dict)
