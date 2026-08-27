"""Command Line Interface for GearCity calculations and engine optimization."""

import argparse
import sys
from pathlib import Path

from gearcity.chassis_gearbox import ChassisGearboxAdvisor
from gearcity.demographics import DemographicCalculator
from gearcity.models import OptimizationConstraints
from gearcity.optimizer import EngineOptimizer
from gearcity.xml_exporter import XMLExporter


def command_optimize(args: argparse.Namespace) -> None:
    print(f"\n================ GearCity Engine Optimizer ================")
    print(f"Target Year: {args.year}")
    print(f"Goal Focus:  {args.focus}")
    if args.max_cost:
        print(f"Max Cost:    ${args.max_cost}")
    if args.max_cc:
        print(f"Max CC:      {args.max_cc} cc")
    if args.max_weight:
        print(f"Max Weight:  {args.max_weight} kg")
    if args.max_length:
        print(f"Max Length:  {args.max_length} cm")
    if args.max_width:
        print(f"Max Width:   {args.max_width} cm")
    print("-----------------------------------------------------------")
    print("Optimizing engine configuration (Differential Evolution)...")

    constraints = OptimizationConstraints(
        max_cost=args.max_cost,
        max_cc=args.max_cc,
        max_weight_kg=args.max_weight,
        max_length_cm=args.max_length,
        max_width_cm=args.max_width,
        max_torque=args.max_torque,
        max_hp_torque_ratio=args.max_hp_torque_ratio,
        design_focus=args.focus,
        allowed_layouts=args.layouts.split(",") if args.layouts else None,
        allowed_fuels=args.fuels.split(",") if args.fuels else None,
    )

    optimizer = EngineOptimizer()
    config, perf, _ = optimizer.optimize(
        year=args.year,
        constraints=constraints,
        model_name=args.name or f"Engine_{args.year}",
        maxiter=args.maxiter,
        popsize=args.popsize,
        seed=args.seed,
    )

    print("\n================== Optimization Result ====================")
    comp = config.components
    sliders = config.sliders
    print(f"Model Name:      {config.name}")
    print(f"Layout:          {comp.layout}")
    print(f"Cylinders:       {comp.cylinders}")
    print(f"Fuel Type:       {comp.fuel}")
    print(f"Induction:       {comp.induction}")
    print(f"Valvetrain:      {comp.valve}")
    print("-----------------------------------------------------------")
    print(f"Displacement:    {perf.displacement_cc:.1f} cc (Bore: {perf.bore_mm:.1f}mm, Stroke: {perf.stroke_mm:.1f}mm)")
    print(f"Horsepower:      {perf.horsepower:.1f} HP @ {perf.rpm:.0f} RPM")
    print(f"Torque:          {perf.torque_nm:.1f} Nm ({perf.torque_ft_lb:.1f} lb-ft)")
    print(f"Unit Cost:       ${perf.unit_cost:.2f}")
    print(f"Weight:          {perf.weight_kg:.1f} kg")
    print(f"Dimensions:      {perf.length_cm:.1f} cm (L) x {perf.width_cm:.1f} cm (W)")
    print("----------------- Recommended Sliders (0-100) -------------")
    print(f"Bore Slider:     {sliders.bore_slide / 10.0:.1f} %")
    print(f"Stroke Slider:   {sliders.stroke_slide / 10.0:.1f} %")
    print(f"Torque Slider:   {sliders.performance_torque * 100.0:.1f} %")
    print(f"RPM Slider:      {sliders.performance_revolutions * 100.0:.1f} %")
    print(f"Perf Focus:      {sliders.design_focus_performance * 100.0:.1f} %")
    print(f"Eco Focus:       {sliders.design_focus_fuel_economy * 100.0:.1f} %")
    print(f"Materials:       {sliders.technology_materials * 100.0:.1f} %")
    print(f"Length Slider:   {sliders.layout_length * 100.0:.1f} %")
    print(f"Width Slider:    {sliders.layout_width * 100.0:.1f} %")
    print(f"Weight Slider:   {sliders.layout_weight * 100.0:.1f} %")
    print("===========================================================")

    if args.export_xml:
        exporter = XMLExporter()
        out_path = exporter.export_to_file(config, args.export_xml)
        print(f"Exported XML Blueprint to: {out_path.resolve()}")


def command_demographics(args: argparse.Namespace) -> None:
    calc = DemographicCalculator()
    print("\n============== GearCity Demographic Targeter ==============")
    if args.vehicle:
        res = calc.evaluate_vehicle(args.vehicle)
        print(f"Vehicle Class:    {res.vehicle_type}")
        print(f"Best Demographic: {res.best_gender} | Age: {res.best_age}")
        print(f"Preference Score: {res.best_score:.4f}")
        print("\nAll Demographic Breakdown:")
        for demographic, score in sorted(res.all_scores.items(), key=lambda x: x[1], reverse=True):
            print(f"  - {demographic:<22}: {score:.4f}")
    else:
        df = calc.to_dataframe()
        print(df.to_string(index=False))
    print("===========================================================\n")


def command_archetype(args: argparse.Namespace) -> None:
    advisor = ChassisGearboxAdvisor()
    print("\n============== Vehicle Archetype & Synergies ==============")
    arch = advisor.get_vehicle_archetype(args.vehicle)
    if not arch:
        print(f"Vehicle '{args.vehicle}' not found.")
        return

    print(f"Vehicle:           {arch.vehicle_type}")
    print(f"Chassis Style:     {arch.chassis_style}")
    print(f"Engine Style:      {arch.engine_style}")
    print(f"Gearbox Style:     {arch.gearbox_style}")
    print(f"Target Wealth:     Tier {arch.wealth_demographic}")
    print(f"Military Fleet:    {'Yes' if arch.military_fleet else 'No'}")
    print(f"Civilian Fleet:    {'Yes' if arch.civilian_fleet else 'No'}")

    if args.year:
        print(f"\n--- Recommended Upgrades for Year {args.year} ---")
        print(f"Frame:             {advisor.get_recommended_frame(args.year, arch.chassis_style)}")
        print(f"Suspension:        {advisor.get_recommended_suspension(args.year, arch.chassis_style)}")
        print(f"Transmission:      {advisor.get_recommended_transmission(args.year, arch.gearbox_style)}")
    print("===========================================================\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="GearCity Calculation & Engine Optimization Suite",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # Optimize command
    opt_parser = subparsers.add_parser("optimize", help="Optimize engine design under constraints")
    opt_parser.add_argument("--year", type=int, required=True, help="Target game year (e.g. 1957)")
    opt_parser.add_argument("--name", type=str, default=None, help="Engine model name")
    opt_parser.add_argument("--focus", type=str, default="HP", choices=["HP", "Torque"], help="Optimization goal")
    opt_parser.add_argument("--max-cost", type=float, default=None, help="Max unit cost ($)")
    opt_parser.add_argument("--max-cc", type=float, default=None, help="Max displacement (cc)")
    opt_parser.add_argument("--max-weight", type=float, default=None, help="Max engine weight (kg)")
    opt_parser.add_argument("--max-length", type=float, default=None, help="Max length (cm)")
    opt_parser.add_argument("--max-width", type=float, default=None, help="Max width (cm)")
    opt_parser.add_argument("--max-torque", type=float, default=None, help="Max torque constraint")
    opt_parser.add_argument("--max-hp-torque-ratio", type=float, default=None, help="Max ratio of torque to HP")
    opt_parser.add_argument("--layouts", type=str, default=None, help="Comma-separated allowed layouts (e.g. 'I,V,Flat')")
    opt_parser.add_argument("--fuels", type=str, default=None, help="Comma-separated allowed fuels (e.g. 'Gasoline')")
    opt_parser.add_argument("--maxiter", type=int, default=80, help="DE optimizer max iterations")
    opt_parser.add_argument("--popsize", type=int, default=15, help="DE population multiplier")
    opt_parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    opt_parser.add_argument("--export-xml", type=str, default=None, help="Path to export GearCity XML blueprint")

    # Demographics command
    demo_parser = subparsers.add_parser("demographics", help="Evaluate optimal demographic targeting")
    demo_parser.add_argument("--vehicle", type=str, default=None, help="Specific vehicle class name (e.g. 'Luxury Sedan')")

    # Archetype command
    arch_parser = subparsers.add_parser("archetype", help="View archetype synergies and chassis/gearbox suggestions")
    arch_parser.add_argument("--vehicle", type=str, required=True, help="Vehicle class name (e.g. 'Compact Car')")
    arch_parser.add_argument("--year", type=int, default=None, help="Game year for tech recommendations")

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(1)

    if args.command == "optimize":
        command_optimize(args)
    elif args.command == "demographics":
        command_demographics(args)
    elif args.command == "archetype":
        command_archetype(args)


if __name__ == "__main__":
    main()
