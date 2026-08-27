# GearCity Engineering & Engine Optimization Suite 🏎️⚙️

[![Live Web App](https://img.shields.io/badge/Web_App-Live_on_GitHub_Pages-00F0FF?style=for-the-badge&logo=googlechrome&logoColor=black)](https://poompoowit.github.io/GearCity/)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Tests Passing](https://img.shields.io/badge/Tests-16%20Passing-brightgreen?style=for-the-badge)](tests/)

An open-source calculation suite, live interactive web app, and CLI toolkit designed for **[GearCity](https://store.steampowered.com/app/285110/GearCity/)** players. 

It models game mechanics to design optimal engines, export direct in-game XML blueprint files, calculate vehicle demographic targets, and provide chassis/gearbox upgrade advice.

---

## 🌐 Try the Web Application (No Installation Needed)

👉 **[https://poompoowit.github.io/GearCity/](https://poompoowit.github.io/GearCity/)**

- ⚡ **Instant Auto-Optimizer (< 100ms)**: Set your year, budget ($), weight (kg), and engine bay size $\rightarrow$ click Optimize.
- 🎛️ **Live 60 FPS Engine Designer**: Real-time recalculation of Horsepower, Torque, RPM, Weight, Dimensions, and Unit Cost as you move sliders.
- 💾 **Direct In-Game XML Download**: Click **"Download Blueprint (.xml)"** to generate a blueprint file you can immediately load in GearCity!
- 👥 **Demographic Targeter**: Interactive preference rankings for all 30 vehicle body types.
- 🛠️ **Chassis & Gearbox Guide**: Historical unlock timelines and vehicle synergy recommendations.

---

## ✨ Features

- **🚀 Differential Evolution Engine Optimizer**: Solves for optimal Layout, Cylinder count, Fuel type, Induction, Valvetrain, Bore/Stroke, and design sliders within constraints.
- **📄 Direct XML Blueprint Exporter**: Automatically generates valid `.xml` engine save files compatible with GearCity's `Designs/Engines/` folder.
- **👥 Vehicle Demographic Targeter**: Evaluates optimal buyer demographics (Gender and Age brackets) across all 30 vehicle classes.
- **🛠️ Chassis & Gearbox Advisor**: Recommends frame, drivetrain, suspension, and transmission upgrades based on vehicle archetypes.
- **📈 Historical Game Balances**: Game-accurate component unlock years (1900–2020), world economic modifiers, and 5-year bore/stroke metallurgical limit scaling.

---

## 📦 Python Installation (For CLI & Developer Use)

If you wish to use the CLI or integrate the Python package into your own scripts:

```bash
git clone https://github.com/poompoowit/GearCity.git
cd GearCity
pip install -r requirements.txt
```

---

## ⚡ CLI Quickstart

### 1. Optimize an Engine
Find the highest Horsepower engine in year **1957** under **$500** unit cost and **110 kg** weight:

```bash
python cli.py optimize --year 1957 --focus HP --max-cost 500 --max-weight 110 --export-xml MyEngine1957.xml
```

#### Output:
```
================== Optimization Result ====================
Model Name:      Engine_1957
Layout:          I
Cylinders:       4
Fuel Type:       Gasoline
Induction:       Supercharger
Valvetrain:      OHV
-----------------------------------------------------------
Displacement:    1,027 cc (Bore: 67.7mm, Stroke: 71.4mm)
Horsepower:      103.6 HP @ 7,088 RPM
Torque:          104.1 Nm (76.8 lb-ft)
Unit Cost:       $487.35
Weight:          103.5 kg
Dimensions:      48.0 cm (L) x 39.7 cm (W)
----------------- Recommended Sliders (0-100) -------------
Bore Slider:     35.0 %
Stroke Slider:   40.0 %
Torque Slider:   70.0 %
RPM Slider:      80.0 %
Perf Focus:      85.0 %
Eco Focus:        0.0 %
Materials:       30.0 %
===========================================================
Exported XML Blueprint to: MyEngine1957.xml
```

### 2. Vehicle Demographic Targeting
Look up ideal buyer demographics for a single body style or view the complete 30-class matrix:

```bash
python cli.py demographics --vehicle "Luxury Sedan"
python cli.py demographics
```

### 3. Chassis & Gearbox Suggestions
```bash
python cli.py archetype --vehicle "Coupe" --year 1935
```

---

## 💾 How to Import XML Blueprints In-Game

To import any generated XML engine blueprint into GearCity:

1. Download the `.xml` file from the [Web App](https://poompoowit.github.io/GearCity/) or export it via CLI (`--export-xml <filename>.xml`).
2. Move the XML file into your GearCity engine designs directory:
   - **🪟 Windows**: `Documents\My Games\GearCity\Designs\Engines\`
   - **🎮 Linux / Steam Deck**: `~/.local/share/GearCity/Designs/Engines/`
   - **🍏 macOS**: `~/Library/Application Support/GearCity/Designs/Engines/`
3. Launch GearCity $\rightarrow$ open the **Engine Designer** $\rightarrow$ click **Load Blueprint**. Your custom engine will load with all 15 sliders set automatically!

---

## 🐍 Python API Usage

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
├── index.html                 # Web app entrypoint for GitHub Pages
├── web/                       # Web application source files
│   ├── index.html             # Semantic responsive HTML interface
│   ├── style.css              # Authentic GearCity game styling
│   ├── data.js                # Game balance datasets bundle
│   ├── engine.js              # Pure JavaScript calculation & fast optimizer (<100ms)
│   └── app.js                 # Live 60 FPS slider controller & XML downloader
├── gearcity/                  # Modular Python calculation & optimization package
│   ├── config.py              # Mathematical constants & year multipliers
│   ├── data_loader.py         # CSV data loader & component compatibility manager
│   ├── models.py              # Strongly-typed Dataclasses
│   ├── engine_calculator.py   # Pure GearCity mathematical engine
│   ├── optimizer.py           # Differential Evolution optimization solver
│   ├── demographics.py        # Vehicle demographic preference evaluator
│   ├── chassis_gearbox.py     # Archetype synergies & component unlock timeline
│   └── xml_exporter.py        # XML blueprint save exporter
├── data/                      # GearCity game balance CSV datasets
├── tests/                     # Automated test suite (16 passing tests)
├── docs/                      # Ready-to-use community post templates
├── cli.py                     # Command-line interface
├── example_optimize.py        # Standalone optimization script
├── example_demographics.py    # Demographic targeting script
├── archive/notebooks/         # Historical research Colab notebooks
├── requirements.txt           # Minimal Python dependencies (numpy, scipy, pandas)
├── pyproject.toml             # Python packaging specification
├── CONTRIBUTING.md            # Contributor guide
├── LICENSE                    # MIT License
└── README.md
```

---

## 🧪 Running Tests

Run the test suite to verify calculation and cross-platform parity:

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
