"""Chassis, Gearbox, and Vehicle Archetype recommendations based on game balance data."""

from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass
class VehicleArchetype:
    """Design recommendations and target market synergies for a vehicle type."""
    vehicle_type: str
    chassis_style: str
    engine_style: str
    gearbox_style: str
    wealth_demographic: int
    military_fleet: bool
    civilian_fleet: bool


VEHICLE_ARCHETYPES: Dict[str, VehicleArchetype] = {
    "Compact Car": VehicleArchetype("Compact Car", "Balance", "SmallB/Balance", "Fuel", 2, False, True),
    "Compact Sport Utility": VehicleArchetype("Compact Sport Utility", "Drive", "Balance", "Drive", 3, True, True),
    "Compact Van": VehicleArchetype("Compact Van", "Tiny", "SmallB/Balance", "Balance", 2, False, True),
    "Coupe": VehicleArchetype("Coupe", "Sport, Drive", "Sport, Power", "Sport, Drive", 5, False, True),
    "Coupe 2+2": VehicleArchetype("Coupe 2+2", "Sport, Drive", "Sport, Power", "Sport, Drive", 4, False, True),
    "Coupe Utility": VehicleArchetype("Coupe Utility", "Drive", "Truck", "Truck", 4, False, True),
    "Crossover": VehicleArchetype("Crossover", "Balance", "Balance", "Lux", 4, False, True),
    "Fastback": VehicleArchetype("Fastback", "Sport, Drive", "Sport, Power", "Sport, Drive", 5, False, False),
    "Full Sized Sedan": VehicleArchetype("Full Sized Sedan", "SafLux", "Power/SafeLux", "Lux", 5, False, True),
    "Hatchback": VehicleArchetype("Hatchback", "Balance", "SmallB/Balance", "Balance", 2, False, True),
    "Landaulet": VehicleArchetype("Landaulet", "Lux", "Lux", "Lux", 6, False, False),
    "Limousine": VehicleArchetype("Limousine", "Lux", "Power/SafeLux", "Lux", 6, False, True),
    "Luxury Sedan": VehicleArchetype("Luxury Sedan", "CLux", "Power/SafeLux", "SportLux", 6, False, True),
    "Microcar": VehicleArchetype("Microcar", "Tiny", "SmallB", "Fuel", 1, False, False),
    "Microvan": VehicleArchetype("Microvan", "Tiny", "SmallB", "Balance", 1, False, True),
    "Minivan": VehicleArchetype("Minivan", "Balance", "Balance", "Balance", 3, False, True),
    "Phaeton": VehicleArchetype("Phaeton", "Balance", "Balance", "Fuel", 2, False, False),
    "Pickup Truck": VehicleArchetype("Pickup Truck", "Truck", "Truck", "Truck", 3, True, True),
    "Roadster": VehicleArchetype("Roadster", "Race/Sport", "Race/Sport", "Race/Sport", 4, False, False),
    "Roadster 2+2": VehicleArchetype("Roadster 2+2", "Race/Sport", "Race/Sport", "Race/Sport", 4, False, False),
    "Sedan": VehicleArchetype("Sedan", "Balance", "SmallB/Balance", "Balance", 3, False, True),
    "Shooting Brake": VehicleArchetype("Shooting Brake", "Balance", "Balance", "Balance", 4, False, False),
    "Sports": VehicleArchetype("Sports", "Race/Sport", "Race/Sport", "Race/Sport", 6, False, False),
    "Station Wagon": VehicleArchetype("Station Wagon", "Balance", "Balance", "Balance", 3, False, True),
    "Subcompact": VehicleArchetype("Subcompact", "Tiny/Balance", "SmallB/Balance", "Fuel", 1, False, True),
    "Supercar": VehicleArchetype("Supercar", "Race", "Race", "Race", 6, False, False),
    "Sport Utility Vehicle": VehicleArchetype("Sport Utility Vehicle", "Drive", "Power/Truck", "Drive/Truck", 5, True, True),
    "Touring": VehicleArchetype("Touring", "Drive", "Balance", "Drive", 4, False, False),
    "Town Car": VehicleArchetype("Town Car", "Lux", "Power/SafeLux", "Lux", 5, False, True),
    "Van": VehicleArchetype("Van", "Truck", "Truck", "Truck", 2, True, True),
}


class ChassisGearboxAdvisor:
    """Provides component upgrade timelines and recommended pairings for vehicles."""

    @staticmethod
    def get_vehicle_archetype(vehicle_type: str) -> Optional[VehicleArchetype]:
        return VEHICLE_ARCHETYPES.get(vehicle_type)

    @staticmethod
    def get_recommended_frame(year: int, target_style: str = "Balance") -> str:
        if "Race" in target_style and year >= 1924:
            return "Superleggera"
        if year >= 1930:
            return "Unibody"
        if year >= 1902:
            return "Ladder"
        return "Wood/Basic Frame"

    @staticmethod
    def get_recommended_suspension(year: int, target_style: str = "Balance") -> str:
        if "Lux" in target_style:
            if year >= 1990:
                return "Magnetorheological"
            if year >= 1944:
                return "Hydropneumatic"
            if year >= 1915:
                return "Air Suspension"
        if "Truck" in target_style:
            return "Leaf Spring"
        if year >= 1988:
            return "MultiLink"
        if year >= 1939 and "Tiny" in target_style:
            return "MacPherson"
        if year >= 1924:
            return "Wishbone"
        if year >= 1901:
            return "Swing Axle"
        return "Solid Axle / Leaf"

    @staticmethod
    def get_recommended_transmission(year: int, target_style: str = "Balance") -> str:
        if year >= 1950 and ("Race" in target_style or "Sport" in target_style):
            return "Dual Clutch Transmission (DCT)"
        if year >= 1935 and ("Fuel" in target_style or "Balance" in target_style):
            return "Semi-Automatic"
        if year >= 1925 and "Lux" in target_style:
            return "Automatic"
        if year >= 1912:
            return "Manual"
        return "Early Direct/Chain Drive"
