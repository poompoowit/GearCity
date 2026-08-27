"""Configuration and mathematical constants for GearCity calculations."""

from dataclasses import dataclass
from pathlib import Path

# Base Paths
PACKAGE_ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = PACKAGE_ROOT.parent
DEFAULT_DATA_DIR = PROJECT_ROOT / "data"

# Default GearCity Save Directory on Windows
DEFAULT_GEARCITY_WINDOWS_ENGINES_DIR = Path.home() / "Documents" / "My Games" / "GearCity" / "Designs" / "Engines"

# Default Design Constants
DEFAULT_ENGINE_SKILL = 100.0  # Marq_DesignEngineSkill
DEFAULT_DESIGN_RANDOM_VAL = 1.0  # designRandomVal
DEFAULT_DESIGN_PACE = 50.0

# Base Years
BASE_YEAR_1899 = 1899
BASE_YEAR_1900 = 1900
MAX_YEAR_LIMIT = 2050


@dataclass(frozen=True)
class YearFactors:
    """Mathematical exponential modifiers calculated from a given game year."""
    year: int
    adjusted_year: int
    ex_0d996p_year50R: float
    ex_1d0024p_year99: float
    ex_1d0035p_year99: float
    ex_1d005p_year99: float
    ex_1d006p_year99: float
    ex_1d008p_year99: float
    ex_1d025p_year99: float
    ex_1d033p_year99: float
    ex_1d038p_year99: float
    ex_1d04p_year99: float
    ex_1d0023p_year99: float
    ex_1d003p_year99: float
    ex_1d004p_year99: float
    ex_1d0051p_year99: float
    ex_1d007p_year99: float
    ex_1d01p_year99: float
    ex_1d03p_year99: float
    ex_1d035p_year99: float
    ex_1d039p_year99: float
    ex_1d05p_year99: float
    ex_1d0105p_year99: float

    @classmethod
    def from_year(cls, year: int) -> "YearFactors":
        ay = year - BASE_YEAR_1899
        ex_year50 = 0.901037361 if year > 2020 else (0.996 ** (MAX_YEAR_LIMIT - year))
        return cls(
            year=year,
            adjusted_year=ay,
            ex_0d996p_year50R=ex_year50,
            ex_1d0024p_year99=1.0024 ** ay,
            ex_1d0035p_year99=1.0035 ** ay,
            ex_1d005p_year99=1.005 ** ay,
            ex_1d006p_year99=1.006 ** ay,
            ex_1d008p_year99=1.008 ** ay,
            ex_1d025p_year99=1.025 ** ay,
            ex_1d033p_year99=1.033 ** ay,
            ex_1d038p_year99=1.038 ** ay,
            ex_1d04p_year99=1.04 ** ay,
            ex_1d0023p_year99=1.0023 ** ay,
            ex_1d003p_year99=1.003 ** ay,
            ex_1d004p_year99=1.004 ** ay,
            ex_1d0051p_year99=1.0051 ** ay,
            ex_1d007p_year99=1.007 ** ay,
            ex_1d01p_year99=1.01 ** ay,
            ex_1d03p_year99=1.03 ** ay,
            ex_1d035p_year99=1.035 ** ay,
            ex_1d039p_year99=1.039 ** ay,
            ex_1d05p_year99=1.05 ** ay,
            ex_1d0105p_year99=1.0105 ** ay,
        )
