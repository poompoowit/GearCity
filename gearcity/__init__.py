"""GearCity Calculation Suite.

A modular toolkit for engine optimization, performance simulation,
demographic matching, and XML blueprint export for GearCity.
"""

from gearcity.chassis_gearbox import ChassisGearboxAdvisor, VehicleArchetype
from gearcity.config import YearFactors
from gearcity.data_loader import DataLoader
from gearcity.demographics import DemographicCalculator
from gearcity.engine_calculator import EngineCalculator
from gearcity.models import (
    DemographicResult,
    EngineComponents,
    EngineConfiguration,
    EnginePerformanceResult,
    EngineSliders,
    OptimizationConstraints,
)
from gearcity.optimizer import EngineOptimizer
from gearcity.xml_exporter import XMLExporter

__version__ = "1.0.0"

__all__ = [
    "DataLoader",
    "EngineCalculator",
    "EngineOptimizer",
    "DemographicCalculator",
    "ChassisGearboxAdvisor",
    "XMLExporter",
    "EngineSliders",
    "EngineComponents",
    "EngineConfiguration",
    "EnginePerformanceResult",
    "OptimizationConstraints",
    "DemographicResult",
    "VehicleArchetype",
    "YearFactors",
]
