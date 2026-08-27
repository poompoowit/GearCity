"""Export GearCity datasets and game balance constants to web/data.js for the client-side web app."""

import json
import sys
from pathlib import Path
import pandas as pd

root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root))

from gearcity.data_loader import DataLoader
from gearcity.demographics import DEFAULT_VEHICLE_PROFILES, GENDER_MODIFIERS, AGE_MODIFIERS
from gearcity.chassis_gearbox import VEHICLE_ARCHETYPES

def main():
    root = Path(__file__).resolve().parent.parent
    data_dir = root / "data"
    web_dir = root / "web"
    web_dir.mkdir(parents=True, exist_ok=True)

    dl = DataLoader(data_dir)

    layouts = dl.layouts.to_dict(orient="records")
    cylinders = dl.cylinders.to_dict(orient="records")
    fuel = dl.fuel.to_dict(orient="records")
    induction = dl.induction.to_dict(orient="records")
    valvetrain = dl.valvetrain.to_dict(orient="records")
    engine_sizes = dl.engine_size.to_dict(orient="records")
    world_events = dl.world_events.to_dict(orient="records")

    archetypes = {k: v.__dict__ for k, v in VEHICLE_ARCHETYPES.items()}

    js_content = f"""// GearCity Static Dataset Bundle (Generated from verified CSV data)
const GEARCITY_DATA = {{
  layouts: {json.dumps(layouts, indent=2)},
  cylinders: {json.dumps(cylinders, indent=2)},
  fuel: {json.dumps(fuel, indent=2)},
  induction: {json.dumps(induction, indent=2)},
  valvetrain: {json.dumps(valvetrain, indent=2)},
  engineSizes: {json.dumps(engine_sizes, indent=2)},
  worldEvents: {json.dumps(world_events, indent=2)},
  vehicleProfiles: {json.dumps(DEFAULT_VEHICLE_PROFILES, indent=2)},
  genderModifiers: {json.dumps(GENDER_MODIFIERS, indent=2)},
  ageModifiers: {json.dumps(AGE_MODIFIERS, indent=2)},
  archetypes: {json.dumps(archetypes, indent=2)}
}};

if (typeof module !== 'undefined' && module.exports) {{
  module.exports = GEARCITY_DATA;
}}
"""
    out_file = web_dir / "data.js"
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"Exported web dataset to: {out_file.resolve()}")

if __name__ == "__main__":
    main()
