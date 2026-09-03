# GearCity Engineering Suite — Comprehensive User Guide & Manual 🏎️📖

This guide provides an in-depth walkthrough of all 5 modules of the **GearCity Engineering & Engine Optimization Suite**, detailing the underlying game mechanics, optimization algorithms, demographic strategies, and in-game XML blueprint import workflows.

---

## 📑 Table of Contents
1. [Web Application Quickstart](#1-web-application-quickstart)
2. [Module 1: Interactive Engine Designer](#2-module-1-interactive-engine-designer)
3. [Module 2: Standalone Engine Auto-Optimizer](#3-module-2-standalone-engine-auto-optimizer)
4. [Module 3: Vehicle Advisor, Assembly Planner & Vehicle Sliders](#4-module-3-vehicle-advisor-assembly-planner--vehicle-sliders)
5. [Module 4: Target Demographic Analyzer](#5-module-4-target-demographic-analyzer)
6. [Module 5: Vehicle-Guided Engine Auto-Optimizer](#6-module-5-vehicle-guided-engine-auto-optimizer)
7. [In-Game XML Blueprint Import Instructions](#7-in-game-xml-blueprint-import-instructions)
8. [Canonical Wiki Formulas Reference](#8-canonical-wiki-formulas-reference)

---

## 1. Web Application Quickstart

Access the suite directly in your browser with zero installation:
👉 **[https://poompoowit.github.io/GearCity/](https://poompoowit.github.io/GearCity/)**

- **Runs 100% Client-Side**: No backend servers, instantaneous 60 FPS slider reactivity.
- **Cross-Platform**: Compatible with Desktop browsers, Tablets, Smartphones, and Steam Deck browser mode.
- **Direct Blueprint Downloads**: Export ready-to-use XML blueprints for both engines and vehicles.

---

## 2. Module 1: Interactive Engine Designer

The **Engine Designer** tab lets you experiment with engine configurations in real time with live physical and economic feedback:

* **Component Selectors**:
  - **Layout**: Inline (I), Flat / Boxer, V, W, Rotary, Radial, Turbine.
  - **Cylinders**: 1 to 16 cylinders depending on layout and era.
  - **Valvetrains**: L Head, T Head, F Head, OHV, SOHC, DOHC, Desmodromic, Multi-valve.
  - **Induction**: Naturally Aspirated, Supercharger, Turbochargers (Stages I–IV: Fuel or Power focused), Twincharger, Twin-Turbo, Quad-Turbo.
  - **Fuel Types**: Gasoline, Diesel, Two Stroke, Natural Gas, Hybrid, Hydrogen, Autogas, E85.
* **Real-Time Sliders**:
  - **Bore & Stroke**: Constrained by historical metallurgical limits across decades (1900–2020).
  - **Torque & RPM Curve Sliders**: Fine-tune power band delivery.
  - **Performance, Economy, Reliability, Materials & Design Pace**: Direct cost and performance modeling.
* **One-Click Blueprint Export**: Download `Engine_<Name>_<Year>.xml` to load directly in GearCity's Engine Designer.

---

## 3. Module 2: Standalone Engine Auto-Optimizer

The **Engine Auto-Optimizer** solves for the optimal engine configuration when you have specific budget, size, or weight limits:

* **Optimization Goals**:
  - **Max Horsepower (HP)**: For sports cars, racing, and high-performance applications.
  - **Max Torque (Nm)**: For heavy trucks, industrial haulers, and commercial vehicles.
  - **Balanced Ratio**: Balanced performance per unit cost.
* **Custom Constraints**:
  - **Max Unit Cost ($)**: Hard price ceiling to maintain company profit margins.
  - **Max Weight (kg)**: Prevents chassis over-weight penalties.
  - **Engine Bay Limits (Length × Width cm)**: Ensures the engine physically fits into target vehicle body bays.

---

## 4. Module 3: Vehicle Advisor, Assembly Planner & Vehicle Sliders

This module offers a comprehensive 3-in-1 tool for vehicle design and assembly:

### A. 30-Class Vehicle Advisor
- Browse all 30 GearCity vehicle classes (Microcar to Supercar, Landaulet, Minivan, Pickup Truck).
- Step through decades from **1900 to 2020** to view game-accurate component unlock timelines for Chassis, Engines, and Gearboxes.

### B. Complete Vehicle Assembly & Synergy Evaluation
- Assembles Chassis + Engine + Gearbox to evaluate component synergies.
- Computes **9 Canonical Vehicle Ratings**: Performance, Drivability, Luxury, Safety, Fuel Economy, Power, Cargo, Dependability, and Overall Rating.
- Computes **Archetype Buyer Demand Fit %**: Verifies how closely the vehicle meets buyer expectations.

### C. 🚗 Vehicle Designer Sliders & XML Blueprints
Solves for all 23 Vehicle Designer sliders across 4 distinct panels:
1. **Design Focus**: Style, Luxury, Safety, Cargo, Dependability, Development Pace.
2. **Interior Tuning**: Interior Style, Innovation, Luxury, Comfort, Safety, Technology.
3. **Materials & Build**: Material Quality, Interior Quality, Paint Quality, Manufacturing Techniques.
4. **Testing Allocation**: Demographics Test, Performance, Fuel Economy, Comfort, Utility, Reliability.

### D. 📈 Live Wiki In-Game Rating Forecast
- Implements exact canonical formulas from GearCity's wiki (`gamemanual:gm_vehicles_design`).
- Displays predicted in-game showroom ratings:
  - ⭐ **Luxury Rating** (0–100%)
  - 💎 **Quality Rating** (0–100%)
  - 🛡️ **Safety Rating** (0–100%)
  - 🔧 **Dependability Rating** (0–100%)
  - 🎯 **Market Class Match** (0–100%)
  - **hyperCost Badge**: `Premium Prestige` (for Luxury/Wealth 5–7), `Balanced` (Wealth 3–4), or `Cost Optimized` (Wealth 1–2).
- **Download Vehicle XML**: Download `Car_<Class>_<Year>.xml` for direct in-game `SavedSliders` import.

---

## 5. Module 4: Target Demographic Analyzer

In GearCity, demographic alignment is critical for market success. This tab analyzes optimal buyer targeting for all 30 vehicle types:

### A. Key Demographic Dimensions
- **Optimal Buyer Age**:
  - `Less Than 25`: Boosts Performance (+0.05), Fuel (+0.05), Dependability (+0.05); Penalizes Luxury (-0.05), Safety (-0.05), Quality (-0.05).
  - `25-35`: Boosts Safety (+0.05), Cargo (+0.05), Dependability (+0.05); Penalizes Performance (-0.05), Power (-0.05), Drivability (-0.05).
  - `35-55`: Boosts Performance (+0.05), Power (+0.05), Luxury (+0.05), Quality (+0.05); Penalizes Fuel (-0.05), Safety (-0.05), Cargo (-0.05), Dependability (-0.05).
  - `Greater Than 55`: Boosts Safety (+0.05), Luxury (+0.05), Quality (+0.05), Dependability (+0.05); Penalizes Performance (-0.05), Power (-0.05), Drivability (-0.05), Fuel (-0.05).
- **Optimal Buyer Gender**:
  - `Male`: Boosts Performance (+0.05), Power (+0.05), Drivability (+0.05).
  - `Female`: Boosts Fuel Economy (+0.05), Safety (+0.05), Cargo (+0.05).
  - `Neutral`: 0 bonuses / 0 penalties (broad market appeal).
- **Target Wealth Tier**:
  - Tiers 1 to 7 (Ultra-Low to Ultra-Wealthy/Elite). Dictates purchasing power and price sensitivity.

### B. Market Demographics Testing Allocation
`Slider_Testing_Demographics` multiplies the demographic bonuses by up to **75 rating points**:
$$\text{Rating Bonus} = 75 \times \text{Demographic Modifier} \times \text{Slider\_Testing\_Demographics}$$
- The tool recommends the exact testing allocation percentage (e.g. 93.3% for Luxury Sedan, 71.7% for Pickup Truck) to maximize demographic returns without incurring runaway testing costs.

---

## 6. Module 5: Vehicle-Guided Engine Auto-Optimizer

Tailors optimal engine configurations directly for any vehicle class and year:

* **Dual Concept Framework Support**:
  - **V1 Classic**: 11 concept styles (`SmallB`, `Balance`, `Power`, `Sport`, `Race`, `Truck`, `Lux`, etc.).
  - **V2 Streamlined 4+2 Framework**:
    - **4 Budget Concepts**: `Eco`, `Balance`, `Sport`, `Truck`
    - **2 Premium Concepts**: `Lux`, `Race`
    - Increases average fleet buyer fit from **65.7% to 68.9%** while streamlining production.
* **Era-Scaled HP:Torque Target Ratios**:
  - Early 1900s engines require high torque-to-HP ratios (~2.2). As technology progresses toward modern eras, ratios smoothly scale down to balanced targets.
* **Minimum Cylinder Floor Enforcement**:
  - Prevents unrealistic single-cylinder engines from being generated for full-sized passenger cars.
* **Selective Component Filters**:
  - Filter specific Layouts, Valvetrains, Fuel types, or Induction systems before running the optimizer.

---

## 7. In-Game XML Blueprint Import Instructions

### 1. Engine Blueprints (`.xml`)
Move your downloaded `.xml` file to:
* **Windows**: `%USERPROFILE%\Documents\My Games\GearCity\Designs\Engines\` or `<Steam>\steamapps\common\GearCity\GearCity\SavedSliders\`
* **macOS**: `~/Library/Application Support/GearCity/Designs/Engines/` or `~/Library/Application Support/GearCity/SavedSliders/`
* **Linux / Steam Deck**: `~/.local/share/GearCity/Designs/Engines/` or `~/.local/share/GearCity/SavedSliders/`

*How to load*:
1. Open GearCity $\rightarrow$ Click **Engine Designer**.
2. Go to the **Summary** page $\rightarrow$ Click **Load Blueprint** (or Load SavedSliders).
3. Select your engine file. All 15 sliders and components load automatically!

### 2. Complete Vehicle Blueprints (`.xml`)
Move your downloaded `.xml` file to:
* **Windows**: `<Steam>\steamapps\common\GearCity\GearCity\SavedSliders\`
* **macOS**: `~/Library/Application Support/GearCity/SavedSliders/`
* **Linux / Steam Deck**: `~/.local/share/GearCity/SavedSliders/`

*How to load*:
1. Open GearCity $\rightarrow$ Click **Vehicle Designer**.
2. Go to the **Summary** tab $\rightarrow$ Click **Load SavedSliders**.
3. Select your vehicle file. All 23 sliders across Design Focus, Interior, Materials, and Testing load automatically!

---

## 8. Canonical Wiki Formulas Reference

All calculations implement formulas documented on the official **[GearCity Wiki](https://wiki.gearcity.info/)**:

### 1. Luxury Rating (`gamemanual:gm_vehicles_design`)
$$\text{Rating\_Luxury} = 7 \cdot S_{\text{DesLux}} + 7 \cdot S_{\text{DesStyle}} + 4 \cdot S_{\text{IntComf}} + 4 \cdot S_{\text{IntInnov}} + 8 \cdot S_{\text{IntLux}} + 4 \cdot S_{\text{IntStyle}} + 3 \cdot S_{\text{IntTech}} + 5 \cdot S_{\text{MatInt}} + 5 \cdot S_{\text{TestComf}} + 3 \cdot S_{\text{TestUtil}} + (75 \cdot \text{Demo\_Luxury} \cdot S_{\text{TestDemo}})$$

### 2. Quality Rating (`gamemanual:gm_vehicles_design`)
$$\text{Rating\_Quality} = 10 \cdot S_{\text{DesDepend}} + 5 \cdot S_{\text{DesLux}} + 5 \cdot S_{\text{DesStyle}} + 5 \cdot S_{\text{MatTech}} + 15 \cdot S_{\text{MatInt}} + 10 \cdot S_{\text{MatPaint}} + 10 \cdot S_{\text{TestReliab}} + 5 \cdot S_{\text{TestUtil}} + \left(75 \cdot \frac{\text{Wealth}}{15.0} \cdot S_{\text{TestDemo}}\right)$$

### 3. Safety Rating (`gamemanual:gm_vehicles_design`)
$$\text{Rating\_Safety} = 10 \cdot S_{\text{DesSafety}} + 10 \cdot S_{\text{IntSafety}} + 2 \cdot S_{\text{IntTech}} + 2 \cdot S_{\text{MatTech}} + 2 \cdot S_{\text{MatInt}} + 2 \cdot S_{\text{MatQual}} + 2 \cdot S_{\text{TestReliab}} + (75 \cdot \text{Demo\_Safety} \cdot S_{\text{TestDemo}})$$

### 4. hyperCosts (`gamemanual:gm_vehicles_design`)
$$\text{hyperSliders} = \frac{\sum_{i=1}^{21} S_i}{21.0}, \quad \text{hyperCosts} = 450 \cdot (1.04)^{\text{year}-1899} \cdot (\text{hyperSliders})^4$$
- Luxury cars absorb higher slider averages because wealthy buyers have high price tolerance.
- Budget cars keep slider averages $\le 45–48\%$ so hyperCosts remain $< 0.05$, maintaining healthy profit margins.
