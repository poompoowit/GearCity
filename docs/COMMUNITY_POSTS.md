# Ready-to-Use Community Post Templates

Use these copy-paste templates when sharing your project online on Steam, Reddit, or Discord.

---

## 1. Reddit Post Template (r/GearCity & r/tycoon)

**Title**: *I made an open-source Engineering Suite, Vehicle Assembly Planner & XML Blueprint Exporter for GearCity (with Web App!)*

**Body**:
```markdown
Hey everyone!

I built an open-source suite and web application for **GearCity** to help design optimal engines, evaluate complete vehicle assemblies, target demographics, and export direct in-game XML blueprint files for both engines and vehicles!

### 🌟 What it does:
1. **Interactive Engine Designer (Tab 1)**: Real-time 60 FPS slider engine modeling covering 15 design sliders, bore/stroke visualization, displacement, HP, Torque, Smoothness, and direct XML blueprint export.
2. **Engine Auto-Optimizer (Tab 2)**: Solves for the highest Horsepower or Torque engine configuration within your budget ($), weight (kg), and engine bay size limits.
3. **Vehicle Advisor & Assembly Planner (Tab 3)**:
   - Evaluates Chassis + Engine + Gearbox synergies across all 30 vehicle classes with 9 rating bars and buyer demand fit %.
   - **Vehicle Designer Sliders & XML Blueprints**: Solves all 23 in-game sliders across Design Focus, Interior Tuning, Materials & Build, and Testing Allocation.
   - **Live Wiki Rating Forecast**: Displays predicted Luxury, Quality, Safety, Dependability, and Market Fit according to canonical GearCity wiki mechanics.
   - **One-Click Vehicle XML Export**: Generates `.xml` blueprints you can load directly into the in-game Vehicle Designer!
4. **Target Demographic Analyzer (Tab 4)**: Calculates optimal buyer Gender, Age brackets, and Wealth Tiers (1–7) with active in-game stat modifier breakdowns (+0.05 Luxury, Quality, Safety) and recommended testing slider percentages.
5. **Vehicle-Guided Engine Optimizer (Tab 5)**:
   - Automatically tailors engine specifications to any selected vehicle class.
   - Supports both **V1 Classic** and the new **V2 Streamlined 4+2 Framework** (4 Budget + 2 Premium), improving average buyer fit from 65.7% to 68.9%!
   - Enforces realistic cylinder floors, era-scaled HP:Torque target ratios, and selective component filtering.

### 🌐 Try the Web App (Zero Install / Runs in Browser):
https://poompoowit.github.io/GearCity/

### 🔗 GitHub Repository (CLI & Python Source):
https://github.com/poompoowit/GearCity

### 📚 Source & Formulas:
All calculations and engineering models are derived from the formulas provided on the official [GearCity Wiki](https://wiki.gearcity.info/) (`gamemanual:gm_vehicles_design` and `gearcity:engine_design`).

Feedback and suggestions are very welcome! Hope this helps fellow players in their playthroughs.
```

---

## 2. Steam Community Guide Template

**Title**: *GearCity Engineering Suite: Engine Optimizer, Assembly Planner, Demographic Targeter & Blueprint Generator*

**Description**: *A comprehensive, free web tool and Python package to solve for optimal engine designs, assemble vehicles, predict in-game ratings, and export XML blueprints directly.*

**Content Sections**:
1. **Web App Link**: `https://poompoowit.github.io/GearCity/` (No install needed, works on mobile, tablet, desktop, Steam Deck browser).
2. **Features Overview**:
   - Tab 1: Interactive Engine Designer with live 60 FPS specs and bore/stroke charts.
   - Tab 2: Standalone Engine Auto-Optimizer with custom budget/weight/bay constraints.
   - Tab 3: Complete Vehicle Assembly Planner, 23 Vehicle Designer sliders, live wiki rating forecast, and XML blueprint export.
   - Tab 4: Vehicle Target Demographic Analyzer with Wealth Tiers, Age brackets, and active stat modifiers.
   - Tab 5: Vehicle-Guided Engine Optimizer with V1 Classic and V2 Streamlined 4+2 Framework.
3. **In-Game XML Import Guide**:
   - **Engine Blueprints**:
     - Windows: `Documents\My Games\GearCity\Designs\Engines\` or `<Steam>\steamapps\common\GearCity\GearCity\SavedSliders\`
     - Linux / Steam Deck: `~/.local/share/GearCity/Designs/Engines/` or `~/.local/share/GearCity/SavedSliders/`
     - macOS: `~/Library/Application Support/GearCity/Designs/Engines/` or `~/Library/Application Support/GearCity/SavedSliders/`
   - **Vehicle Blueprints**:
     - Windows: `<Steam>\steamapps\common\GearCity\GearCity\SavedSliders\`
     - Linux / Steam Deck: `~/.local/share/GearCity/SavedSliders/`
     - macOS: `~/Library/Application Support/GearCity/SavedSliders/`
4. **How to Load Blueprints In-Game**:
   - In Engine Designer: Click **Summary** $\rightarrow$ **Load Blueprint** (or Load SavedSliders).
   - In Vehicle Designer: Navigate to **Summary** $\rightarrow$ Click **Load SavedSliders** $\rightarrow$ Select vehicle file.

---

## 3. Discord Announcement Template

```markdown
**[Release] GearCity Engineering & Vehicle Optimization Suite** 🏎️⚙️
Hey everyone! I just released a major update to the open-source GearCity web app:
- 🌐 **Web App**: <https://poompoowit.github.io/GearCity/>
- 🎛️ **Interactive Engine Designer**: Real-time slider engine modeling and direct XML export.
- 🚀 **Engine Auto-Optimizer**: Solves for highest HP/Torque within custom budget, weight, and size limits.
- 🛠️ **Vehicle Assembly Planner & Vehicle Sliders**: Complete Chassis + Engine + Gearbox synergy evaluation, 23 Vehicle Designer sliders, live wiki rating forecast, and direct vehicle XML export.
- 👥 **Demographic Analyzer**: Optimal buyer Gender, Age, and Wealth Tiers (1–7) with active stat modifier breakdowns.
- 🏭 **Vehicle-Guided Engine Optimizer**: V1 Classic + V2 Streamlined (4 Budget + 2 Premium) concept architecture.
- 🧪 **178 Automated Tests**: Verified against canonical GearCity Wiki calculations.

GitHub: <https://github.com/poompoowit/GearCity>
```
