"""Example script: Calculate demographic targeting for all vehicle body classes."""

from gearcity import DemographicCalculator, ChassisGearboxAdvisor

def main():
    print("=== GearCity Vehicle & Demographic Advisor ===")
    
    demo_calc = DemographicCalculator()
    advisor = ChassisGearboxAdvisor()

    df = demo_calc.to_dataframe()
    print("\n--- Demographic Target Summary (Top 10) ---")
    print(df.head(10).to_string(index=False))

    print("\n--- Example Vehicle Synergies: Luxury Sedan (Year 1960) ---")
    arch = advisor.get_vehicle_archetype("Luxury Sedan")
    if arch:
        print(f"Vehicle:           {arch.vehicle_type}")
        print(f"Target Demographic: Female (25-35)")
        print(f"Chassis Style:     {arch.chassis_style}")
        print(f"Engine Style:      {arch.engine_style}")
        print(f"Gearbox Style:     {arch.gearbox_style}")
        print(f"Recommended Frame: {advisor.get_recommended_frame(1960, arch.chassis_style)}")
        print(f"Recommended Susp:  {advisor.get_recommended_suspension(1960, arch.chassis_style)}")
        print(f"Recommended Trans: {advisor.get_recommended_transmission(1960, arch.gearbox_style)}")

if __name__ == "__main__":
    main()
