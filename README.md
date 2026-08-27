# GearCity Calculation & Engine Optimization Suite 🏎️⚙️

A high-performance Python toolkit and CLI designed for **[GearCity](https://store.steampowered.com/app/285110/GearCity/)** players. It uses mathematical modeling and Differential Evolution optimization to design optimal engines, export direct in-game XML blueprint files, calculate vehicle demographic targets, and provide chassis/gearbox upgrade advice.

---

## ✨ Features

- **🚀 Differential Evolution Engine Optimizer**: Solves for the optimal Layout, Cylinder count, Fuel type, Induction, Valvetrain, Bore/Stroke, and design sliders to maximize Horsepower or Torque while respecting budget, engine bay dimensions, displacement (CC), and weight limits.
- **📄 Direct XML Blueprint Exporter**: Automatically generates `.xml` engine save files that you can drop directly into your GearCity save folder—no need to manually adjust 15 sliders by hand!
- **👥 Vehicle Demographic Targeter**: Evaluates optimal buyer demographics (Gender and Age brackets) for all 30 vehicle body classes.
- **🛠️ Chassis & Gearbox Advisor**: Recommends frame, drivetrain, suspension, and gearbox upgrades based on vehicle archetypes and target game year.
- **📈 Historical Economics**: Integrated interest rates and car price modifiers based on game world events.

---

## 🌐 Live Web App & Free GitHub Pages Hosting

This repository includes a **100% free, zero-server Client-Side Web Application** located in the root / `web/` folder.

### How to Enable Free Web Hosting on GitHub Pages:
1. Push this repository to your GitHub account.
2. In your GitHub repository, navigate to **Settings** $\rightarrow$ **Pages** (in the left sidebar).
3. Under **Branch**, select `main` (or `master`) and `/ (root)` folder $\rightarrow$ click **Save**.
4. Within 1-2 minutes, your web application will be live at:
   ```
   https://<your-username>.github.io/GearCity/
   ```
5. Players can use the tool in any browser on their desktop, second monitor, tablet, or phone with **zero installation needed**!

---

## 📦 Python Installation (Optional for CLI / Scripting)

---

## ⚡ Quickstart

### 1. Optimize an Engine via CLI

Optimize an engine for maximum Horsepower in year **1957**, with a maximum unit cost of **$500** and weight under **110 kg**:

```bash
python cli.py optimize --year 1957 --focus HP --max-cost 500 --max-weight 110 --export-xml MyEngine1957.xml
```

#### Output Example:
```
================== Optimization Result ====================
Model Name:      Engine_1957
Layout:          I
Cylinders:       5
Fuel Type:       Gasoline
Induction:       Turbocharger Stage II (Power Focused)
Valvetrain:      OHV
-----------------------------------------------------------
Displacement:    801.0 cc (Bore: 50.1mm, Stroke: 81.3mm)
Horsepower:      99.5 HP @ 7179 RPM
Torque:          98.7 Nm (72.8 lb-ft)
Unit Cost:       $500.13
Weight:          106.7 kg
Dimensions:      47.0 cm (L) x 35.6 cm (W)
----------------- Recommended Sliders (0-100) -------------
Bore Slider:     0.0 %
Stroke Slider:   35.2 %
Torque Slider:   57.6 %
RPM Slider:      82.4 %
Perf Focus:      88.1 %
Eco Focus:       0.0 %
Materials:       65.0 %
Length Slider:   12.4 %
Width Slider:    28.9 %
Weight Slider:   45.0 %
===========================================================
Exported XML Blueprint to: MyEngine1957.xml
```

### 2. Vehicle Demographic Targeting

Look up the ideal buyer demographic for a vehicle type:

```bash
python cli.py demographics --vehicle "Luxury Sedan"
```

Or view the full demographic matrix for all 30 vehicle types:

```bash
python cli.py demographics
```

### 3. Chassis & Gearbox Suggestions

```bash
python cli.py archetype --vehicle "Coupe" --year 1935
```

---

## 💾 Importing Blueprints In-Game

To import the generated XML engine into GearCity:

1. Generate your blueprint XML with `--export-xml <filename>.xml`.
2. Copy the XML file into your GearCity saved engines folder:
   - **Windows**: `Documents\My Games\GearCity\Designs\Engines\`
   - **Linux / Steam Deck**: `~/.local/share/GearCity/Designs/Engines/`
   - **macOS**: `~/Library/Application Support/GearCity/Designs/Engines/`
3. Launch GearCity, open the Engine Designer, and load your custom blueprint directly!

---

## 🐍 Python API Example

You can easily integrate the calculation suite into your own scripts or applications:

```python
from gearcity import EngineOptimizer, OptimizationConstraints, XMLExporter

# 1. Define design constraints
constraints = OptimizationConstraints(
    max_cost=450.0,
    max_weight_kg=120.0,
    max_length_cm=60.0,
    design_focus="HP",
    allowed_fuels=["Gasoline"]
)

# 2. Run the optimizer
optimizer = EngineOptimizer()
config, performance, _ = optimizer.optimize(year=1960, constraints=constraints)

print(performance.summary())

# 3. Export XML blueprint
exporter = XMLExporter()
exporter.export_to_file(config, "Engine_1960.xml")
```

---

## 📁 Repository Structure

```
GearCity/
├── gearcity/
│   ├── config.py              # Mathematical constants & year multipliers
│   ├── data_loader.py         # CSV loader & component compatibility manager
│   ├── models.py              # Strongly-typed dataclasses
│   ├── engine_calculator.py   # Pure GearCity mathematical engine
│   ├── optimizer.py           # Differential evolution optimization solver
│   ├── demographics.py        # Demographic preference calculator
│   ├── chassis_gearbox.py     # Archetype synergies & component timeline
│   └── xml_exporter.py        # In-game XML blueprint generator
├── data/                      # GearCity game balance CSV datasets
├── tests/                     # Unit test suite
├── cli.py                     # Command-line interface
├── example_optimize.py        # Standalone optimization quickstart
├── example_demographics.py    # Demographic targeting quickstart
├── archive/notebooks/         # Original Colab research notebooks
├── requirements.txt           # Minimal dependencies (numpy, scipy, pandas)
├── pyproject.toml             # Package configuration
└── README.md
```

---

## 🧪 Running Tests

Run the test suite using Python's built-in `unittest`:

```bash
python -m unittest discover tests
```

---

## ⚖️ Disclaimer & Credits

This is an open-source, fan-created tool designed for the **GearCity** community.
- **Formulas & Game Logic**: All calculations, tech curves, component unlocking years, demographic preferences, and engineering equations are estimated based on the logic and formulas provided on the official **[GearCity Wiki](https://wiki.gearcity.info/)** (including [Engine Design](https://wiki.gearcity.info/doku.php?id=gearcity:engine_design) and vehicle ratings).
- **Game Credits**: All game mechanics, names, and assets belong to **Visual Entertainment Services / Eric B**, the developer of [GearCity](https://store.steampowered.com/app/285110/GearCity/).

---

## 📜 License

Distributed under the [MIT License](LICENSE).
