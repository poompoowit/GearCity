# Ready-to-Use Community Post Templates

Use these copy-paste templates when sharing your project online on Steam, Reddit, or Discord.

---

## 1. Reddit Post Template (r/GearCity & r/tycoon)

**Title**: *I made an open-source Engine Optimizer & XML Save Generator for GearCity!*

**Body**:
```markdown
Hey everyone!

I created an open-source tool for **GearCity** that helps optimize engine designs and calculate vehicle demographics.

### 🌟 What it does:
1. **Engine Optimizer**: Uses Differential Evolution to find the best Layout, Cylinders, Fuel type, Induction, Valvetrain, Bore/Stroke, and Sliders to maximize Horsepower or Torque within your budget ($), weight (kg), and size constraints.
2. **Direct XML Save Generator**: Generates `.xml` engine blueprints that you can paste straight into your `Designs/Engines` folder—no need to manually tweak 15 sliders in-game!
3. **Vehicle Demographic Targeter**: Shows the optimal buyer demographics (Gender and Age brackets) for all 30 vehicle body types.
4. **Chassis & Gearbox Recommendations**: Up-to-date unlock timeline suggestions for frames, suspensions, and gearboxes.

### 📚 Source & Formulas:
All calculations and engineering models are estimated based on the formulas provided on the official **[GearCity Wiki](https://wiki.gearcity.info/)**.

### 🔗 GitHub Repository:
https://github.com/your-username/GearCity

### ⚡ Quick Example:
```bash
python cli.py optimize --year 1957 --focus HP --max-cost 500 --max-weight 110 --export-xml MyEngine1957.xml
```

Feedback and suggestions are very welcome! Hope this helps fellow players in their playthroughs.
```

---

## 2. Steam Community Guide Template

**Title**: *Automatic Engine Optimization & Blueprint Generator Tool*

**Description**: *A Python tool to automatically solve for the best engine configuration for any game year and export XML blueprints directly.*

**Content Sections**:
1. **Introduction**: Overview of the tool and why it was built.
2. **Installation**: Simple `git clone` & `pip install -r requirements.txt`.
3. **Optimizing Engines**: Example CLI commands for early-game budget engines vs late-game high-HP supercars.
4. **In-Game XML Import Guide**:
   - Save path on Windows: `Documents\My Games\GearCity\Designs\Engines\`
   - Save path on Linux / Steam Deck: `~/.local/share/GearCity/Designs/Engines/`
5. **Demographics Reference Table**: Best buyer age & gender for each body style.

---

## 3. Discord Announcement Template

```markdown
**[Release] GearCity Engine Optimizer & Blueprint Generator** 🏎️⚙️
Hey everyone! I just published an open-source calculation suite and engine optimizer for GearCity:
- 🚀 **Engine Optimizer**: Differential evolution solver under budget/weight/size limits.
- 📄 **Direct XML Blueprint Export**: Load designs directly in-game.
- 👥 **Demographic Targeter**: Optimal buyer analysis for all 30 vehicle body classes.

GitHub: <https://github.com/your-username/GearCity>
```
