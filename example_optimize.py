"""Example script: Optimize a 1957 sports engine and export a GearCity XML blueprint."""

from gearcity import EngineOptimizer, OptimizationConstraints, XMLExporter

def main():
    print("=== GearCity Engine Optimization Example ===")
    
    # 1. Configure design constraints for a 1957 compact performance engine
    constraints = OptimizationConstraints(
        max_cost=500.0,            # Maximum unit cost in dollars ($)
        max_cc=4000.0,             # Maximum displacement
        max_weight_kg=110.0,       # Maximum engine weight (kg)
        max_length_cm=65.0,        # Maximum engine bay length
        max_width_cm=40.0,         # Maximum engine bay width
        design_focus="HP",         # Optimize for maximum horsepower
        allowed_fuels=["Gasoline"] # Gasoline only
    )

    optimizer = EngineOptimizer()
    
    print("Running optimization for year 1957...")
    config, perf, _ = optimizer.optimize(
        year=1957,
        constraints=constraints,
        model_name="Veloce_57",
        maxiter=60,
        popsize=12,
        seed=42
    )

    print("\n--- Optimized Engine Blueprint ---")
    print(f"Model Name:  {config.name}")
    print(f"Layout:      {config.components.layout} ({config.components.cylinders} Cylinders)")
    print(f"Fuel:        {config.components.fuel}")
    print(f"Induction:   {config.components.induction}")
    print(f"Valvetrain:  {config.components.valve}")
    print("\n--- Performance Metrics ---")
    print(f"Output:      {perf.horsepower:.1f} HP @ {perf.rpm:.0f} RPM")
    print(f"Torque:      {perf.torque_nm:.1f} Nm ({perf.torque_ft_lb:.1f} lb-ft)")
    print(f"Displacement:{perf.displacement_cc:.0f} cc (Bore: {perf.bore_mm:.1f}mm, Stroke: {perf.stroke_mm:.1f}mm)")
    print(f"Weight:      {perf.weight_kg:.1f} kg")
    print(f"Dimensions:  {perf.length_cm:.1f} x {perf.width_cm:.1f} cm")
    print(f"Unit Cost:   ${perf.unit_cost:.2f}")

    # 2. Export direct GearCity XML save blueprint
    exporter = XMLExporter()
    xml_path = exporter.export_to_file(config, "Engine_Veloce_57_1957.xml")
    print(f"\nSaved GearCity XML blueprint to: {xml_path.resolve()}")
    print("Copy this XML file into your GearCity Designs/Engines folder to use in-game!")

if __name__ == "__main__":
    main()
