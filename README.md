# GearCity Engineering & Engine Optimization Suite 🏎️⚙️

[![Live Web App](https://img.shields.io/badge/Web_App-Live_on_GitHub_Pages-00F0FF?style=for-the-badge&logo=googlechrome&logoColor=black)](https://poompoowit.github.io/GearCity/)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Tests Passing](https://img.shields.io/badge/Tests-178%20Passing-brightgreen?style=for-the-badge)](tests/)

An open-source calculation engine, responsive web application, and CLI toolkit designed for **[GearCity](https://store.steampowered.com/app/285110/GearCity/)** players and automotive modders. 

It implements canonical game mechanics derived from the official **[GearCity Wiki](https://wiki.gearcity.info/)** (`gamemanual:gm_vehicles_design`, `gearcity:engine_design`) to model engine performance, evaluate vehicle component synergies, calculate optimal demographic targeting, predict in-game vehicle ratings, and generate direct in-game XML blueprint files for both **Engines** and **Complete Vehicles**.

---

## 🌐 Live Web Application

👉 **[https://poompoowit.github.io/GearCity/](https://poompoowit.github.io/GearCity/)**

The web application runs entirely client-side in pure JavaScript with zero dependencies and sub-second calculation times.

📖 **Looking for full documentation?** Check out the **[Comprehensive User Guide & Manual](docs/USER_GUIDE.md)** for deep dives into formulas, slider mechanics, demographic strategies, and in-game import tutorials.

---

## 🌟 The 5 Core Modules

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           GEARCITY SUITE ARCHITECTURE                           │
├─────────────────┬─────────────────┬─────────────────┬─────────────┬─────────────┤
│     TAB 1       │      TAB 2      │      TAB 3      │    TAB 4    │    TAB 5    │
│   Interactive   │   Engine Auto   │ Vehicle Advisor │ Demographic │   Vehicle   │
│ Engine Designer │    Optimizer    │ & Assembly Fit  │  Analyzer   │ Engine Opt  │
└─────────────────┴─────────────────┴─────────────────┴─────────────┴─────────────┘
```

### 1. 🎛️ Interactive Engine Designer (Tab 1)
- Real-time 60 FPS slider engine modeling covering 15 design sliders, bore/stroke visualization, displacement, HP, Torque, Smoothness, Materials, and Development Pace.
- Game-accurate metallurgical limit constraints scaling across decades (1900–2020).
- One-click direct **XML Engine Blueprint** export (`.xml`).

### 2. ⚡ Engine Auto-Optimizer (Tab 2)
- Solves for the optimal Layout, Cylinder count, Fuel type, Induction, Valvetrain, Bore/Stroke, and design sliders to maximize **Horsepower** or **Torque**.
- Respects custom design limits: Unit Budget ($), Maximum Weight (kg), Engine Bay Length & Width limits (cm), and RPM thresholds.

### 3. 🛠️ Vehicle Advisor, Assembly Planner & Vehicle Sliders (Tab 3)
- **30-Class Vehicle Advisor**: Era progression (1900–2020) for all 30 GearCity vehicle classes, recommending compatible Chassis, Engine, and Gearbox designs.
- **Complete Vehicle Assembly & Synergy Evaluation**: Assembles Chassis + Engine + Gearbox to calculate 9 canonical vehicle ratings (Performance, Drivability, Luxury, Safety, Fuel Economy, Power, Cargo, Dependability, and Overall) and buyer demand fit %.
- **🚗 Vehicle Designer Sliders & XML Blueprints**: Solves all 23 in-game sliders across **Design Focus**, **Interior Tuning**, **Materials & Build**, and **Testing Allocation**.
- **📈 Live Wiki In-Game Rating Forecast**: Simulates predicted Luxury, Quality, Safety, Dependability, and Market Fit according to canonical GearCity wiki mechanics (`gamemanual:gm_vehicles_design`), with hyperCost index classification (`Premium Prestige`, `Balanced`, `Cost Optimized`).
- **Export Vehicle XML**: Direct one-click download of `Vehicle_<Type>_<Year>.xml` for in-game `SavedSliders` import.
- **📚 Design Concepts Reference Directory**: Full interactive reference tables for Gearbox Concepts, Chassis Concepts, and Engine Concepts with complete slider setups, compatibility, and blueprint downloads.

### 4. 👥 Vehicle Target Demographic Analyzer (Tab 4)
- Analyzes optimal buyer demographics across all 30 vehicle classes:
  - **Optimal Buyer Age Bracket** (`Less Than 25`, `25-35`, `35-55`, `Greater Than 55`)
  - **Target Wealth Tier** (Tiers 1–7: Low, Middle, Wealthy, Ultra-Wealthy, etc.)
  - **Optimal Buyer Gender** (`Neutral`, `Male`, `Female`)
- **Active In-Game Demographic Stat Modifiers**: Displays live bonus pills (`+0.05 Luxury`, `+0.05 Quality`, `+0.05 Safety`) based on official wiki formulas.
- **Market Testing Allocation**: Recommends the exact `Slider_Testing_Demographics` percentage to maximize demographic returns without runaway prototyping costs.

### 5. 🏭 Vehicle-Guided Engine Auto-Optimizer (Tab 5)
- Automatically tailors engine specifications to any selected vehicle class and year.
- **Dual Concept Framework Support**:
  - **V1 Classic**: 11 design concepts (`SmallB`, `Balance`, `Power`, `Sport`, `Race`, `Truck`, `Lux`, etc.).
  - **V2 Streamlined (4+2 Framework)**: 4 Budget (`Eco`, `Balance`, `Sport`, `Truck`) + 2 Premium (`Lux`, `Race`), improving average buyer fit from **65.7% to 68.9%**!
- **Era-Scaled Ratios**: Automatically scales HP:Torque target ratios from early 1900s (~2.2 ratio) down to mid-century baselines.
- **Minimum Cylinder Floors**: Enforces realistic multi-cylinder minimums (e.g. 2-cylinder floor for Sedans, preventing unrealistic single-cylinder engines).
- **Soft Budget Fallbacks**: Ensures viable results even during early-game low-skill eras.
- **Selective Component Filters**: Filter by Layout (Flat, Inline, V, W, etc.), Valvetrain (L Head, OHV, DOHC), Fuel (Gasoline, Diesel, Two Stroke), and Induction (Naturally Aspirated, Turbochargers, Superchargers).
- Direct one-click XML blueprint generation for in-game import.

---

## 💾 How to Import XML Blueprints In-Game

GearCity allows importing XML blueprints directly into the game to save time during design phases:

### 1. Engine Blueprints (`.xml`)
Move downloaded engine XML files into your GearCity engine directory:
- **🪟 Windows**: `Documents\My Games\GearCity\Designs\Engines\` or `<Steam>\steamapps\common\GearCity\GearCity\SavedSliders\`
- **🍏 macOS**: `~/Library/Application Support/GearCity/Designs/Engines/` or `~/Library/Application Support/GearCity/SavedSliders/`
- **🎮 Linux / Steam Deck**: `~/.local/share/GearCity/Designs/Engines/` or `~/.local/share/GearCity/SavedSliders/`

*In-Game*: Open the **Engine Designer** $\rightarrow$ click **Summary** $\rightarrow$ click **Load Blueprint** (or Load SavedSliders). All 15 sliders and components will be configured automatically!

### 2. Complete Vehicle Blueprints (`.xml`)
Move downloaded vehicle XML files into your GearCity `SavedSliders` directory:
- **🪟 Windows**: `<Steam>\steamapps\common\GearCity\GearCity\SavedSliders\`
- **🍏 macOS**: `~/Library/Application Support/GearCity/SavedSliders/`
- **🎮 Linux / Steam Deck**: `~/.local/share/GearCity/SavedSliders/`

*In-Game*: Open the **Vehicle Designer** $\rightarrow$ navigate to the **Summary** tab $\rightarrow$ click **Load SavedSliders** $\rightarrow$ select your vehicle file. All 23 sliders across Design Focus, Interior, Materials, and Testing are set instantly!

---

## 📦 Python Installation & CLI Usage

For CLI or script integration:

```bash
git clone https://github.com/poompoowit/GearCity.git
cd GearCity
pip install -r requirements.txt
```

### CLI Quickstart

#### 1. Optimize an Engine
Find the highest Horsepower engine in year **1957** under **$500** unit cost and **110 kg** weight:
```bash
python cli.py optimize --year 1957 --focus HP --max-cost 500 --max-weight 110 --export-xml MyEngine1957.xml
```

#### 2. Vehicle Demographic Targeting
Look up ideal buyer demographics for a single body style or view the complete 30-class matrix:
```bash
python cli.py demographics --vehicle "Luxury Sedan"
python cli.py demographics
```

#### 3. Chassis & Gearbox Suggestions
```bash
python cli.py archetype --vehicle "Coupe" --year 1935
```

---

## 🧪 Automated Testing Suite

The suite contains **178 automated unit and regression tests** verifying calculation correctness across platforms:

```bash
# Run Vehicle Assembly, Sliders, and Demographic Tests (63 tests)
node tests/test_vehicle_assembly.js

# Run Vehicle Engine Optimizer Logic Tests (69 tests)
node tests/test_tab5_optimizer.js

# Run V2 Streamlined 4+2 Framework Tests (46 tests)
node tests/test_v2_framework.js
```

---

## 📁 Repository Structure

```
GearCity/
├── index.html                 # Main web app entrypoint for GitHub Pages
├── web/                       # Web application client code
│   ├── index.html             # Responsive semantic interface (Tabs 1-5)
│   ├── style.css              # Authentic GearCity dark game styling
│   ├── data.js                # Game balance datasets & V2 framework bundle
│   ├── engine.js              # Pure JavaScript calculation & simulation engine
│   └── app.js                 # Reactive UI controllers & XML file exporters
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
├── tests/                     # 178 passing test suites (Node.js & Python)
├── docs/                      # Ready-to-use community post templates
├── cli.py                     # Command-line interface
├── requirements.txt           # Minimal Python dependencies (numpy, scipy, pandas)
├── pyproject.toml             # Python packaging specification
├── CONTRIBUTING.md            # Contributor guide
├── LICENSE                    # MIT License
└── README.md
```

---

## ⚖️ Disclaimer & Credits

This is an open-source, fan-created tool designed for the **GearCity** community.
- **Formulas & Game Logic**: All calculations, tech curves, component unlocking years, demographic preferences, and engineering equations are estimated based on logic and formulas provided on the official **[GearCity Wiki](https://wiki.gearcity.info/)** (including [Engine Design](https://wiki.gearcity.info/doku.php?id=gearcity:engine_design) and [Vehicle Design](https://wiki.gearcity.info/doku.php?id=gamemanual:gm_vehicles_design)).
- **Game Credits**: All game mechanics, names, and assets belong to **Visual Entertainment Services / Eric B**, the developer of [GearCity](https://store.steampowered.com/app/285110/GearCity/).

---

## 📜 License

Distributed under the [MIT License](LICENSE).
