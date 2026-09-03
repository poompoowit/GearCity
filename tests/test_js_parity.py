"""Verify mathematical parity between Python gearcity package and JavaScript web/engine.js."""

import json
import subprocess
import unittest
from pathlib import Path

from gearcity.data_loader import DataLoader
from gearcity.engine_calculator import EngineCalculator
from gearcity.models import EngineComponents, EngineConfiguration, EngineSliders
from gearcity.demographics import DemographicCalculator, DEFAULT_VEHICLE_PROFILES

class TestJSParity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = Path(__file__).resolve().parent.parent
        cls.data_loader = DataLoader(cls.root / "data")
        cls.calc = EngineCalculator(cls.data_loader)
        cls.demo_calc = DemographicCalculator()

    def _eval_js(self, js_code: str):
        full_code = f"""
const GEARCITY_DATA = require('{self.root}/web/data.js');
global.GEARCITY_DATA = GEARCITY_DATA;
const GearCityEngine = require('{self.root}/web/engine.js');

{js_code}
"""
        res = subprocess.run(
            ["node", "-e", full_code],
            capture_output=True,
            text=True,
            check=True
        )
        return json.loads(res.stdout)

    def test_multi_year_engine_parity(self):
        """Test engine performance parity between Python and JS across multiple years and layouts."""
        test_cases = [
            (1905, "I", "4", "Gasoline", "Naturally Aspirated", "OHV", 450, 450, 0.5, 0.5, 0.3, 0.3, 0.5, 0.4),
            (1930, "V", "8", "Gasoline", "Naturally Aspirated", "OHV", 600, 600, 0.7, 0.6, 0.3, 0.3, 0.5, 0.5),
            (1957, "I", "4", "Gasoline", "Supercharger", "OHV", 350, 400, 0.8, 0.7, 0.3, 0.3, 0.5, 0.3),
            (1985, "Flat", "6", "Gasoline", "Turbocharger Stage I (Power Focused)", "DOHC", 700, 700, 0.9, 0.8, 0.3, 0.3, 0.5, 0.6),
            (2015, "V", "6", "Gasoline", "Twin-Turbocharger", "DOHC", 500, 500, 0.85, 0.85, 0.3, 0.3, 0.5, 0.7),
        ]

        for year, layout, cyl, fuel, ind, valve, bore_s, stroke_s, rpm_s, torq_s, l_len, l_wid, l_wt, mat in test_cases:
            # Python calculation
            py_config = EngineConfiguration(
                name="ParityTest",
                year=year,
                components=EngineComponents(
                    layout=layout,
                    cylinders=cyl,
                    fuel=fuel,
                    induction=ind,
                    valve=valve,
                ),
                sliders=EngineSliders(
                    bore_slide=bore_s,
                    stroke_slide=stroke_s,
                    performance_revolutions=rpm_s,
                    performance_torque=torq_s,
                    performance_fuel_economy=0.0,
                    design_focus_performance=0.8,
                    design_focus_fuel_economy=0.0,
                    design_focus_dependability=0.5,
                    layout_length=l_len,
                    layout_width=l_wid,
                    layout_weight=l_wt,
                    technology_materials=mat,
                    technology_components=0.0,
                    technology_technologies=0.0,
                    technology_techniques=0.0,
                ),
            )
            py_res = self.calc.calculate_performance(py_config)

            # JS calculation
            js_code = f"""
const config = {{
  components: {{ layout: '{layout}', cylinders: '{cyl}', fuel: '{fuel}', induction: '{ind}', valve: '{valve}' }},
  sliders: {{
    boreSlide: {bore_s},
    strokeSlide: {stroke_s},
    performanceRevolutions: {rpm_s},
    performanceTorque: {torq_s},
    performanceFuelEconomy: 0.0,
    designFocusPerformance: 0.8,
    designFocusFuelEconomy: 0.0,
    designFocusDependability: 0.5,
    layoutLength: {l_len},
    layoutWidth: {l_wid},
    layoutWeight: {l_wt},
    technologyMaterials: {mat},
    technologyComponents: 0.0,
    technologyTechnologies: 0.0,
    technologyTechniques: 0.0,
  }},
  year: {year},
  name: 'ParityTest'
}};
const res = GearCityEngine.calculatePerformance(config, {year});
console.log(JSON.stringify(res));
"""
            js_res = self._eval_js(js_code)

            # Assert strict parity across all key performance metrics
            self.assertAlmostEqual(py_res.horsepower, js_res['horsepower'], places=5, msg=f"HP mismatch in {year}")
            self.assertAlmostEqual(py_res.torque_ft_lb, js_res['torqueFtLb'], places=5, msg=f"Torque mismatch in {year}")
            self.assertAlmostEqual(py_res.torque_nm, js_res['torqueNm'], places=5, msg=f"Torque Nm mismatch in {year}")
            self.assertAlmostEqual(py_res.rpm, js_res['rpm'], places=4, msg=f"RPM mismatch in {year}")
            self.assertAlmostEqual(py_res.displacement_cc, js_res['displacementCc'], places=4, msg=f"Displacement mismatch in {year}")
            self.assertAlmostEqual(py_res.unit_cost, js_res['unitCost'], places=3, msg=f"Cost mismatch in {year}")
            self.assertAlmostEqual(py_res.weight_kg, js_res['weightKg'], places=4, msg=f"Weight mismatch in {year}")
            self.assertAlmostEqual(py_res.length_cm, js_res['lengthCm'], places=4, msg=f"Length mismatch in {year}")
            self.assertAlmostEqual(py_res.width_cm, js_res['widthCm'], places=4, msg=f"Width mismatch in {year}")

    def test_demographics_parity(self):
        """Test demographic scoring parity across all 30 vehicle classes."""
        for v_name in DEFAULT_VEHICLE_PROFILES.keys():
            py_res = self.demo_calc.evaluate_vehicle(v_name)
            js_code = f"""
const profiles = GEARCITY_DATA.vehicleProfiles;
const gMods = GEARCITY_DATA.genderModifiers;
const aMods = GEARCITY_DATA.ageModifiers;
const normName = '{v_name}' === 'Compact SUV' ? 'Compact Sport Utility' : ('{v_name}' === 'SUV' ? 'Sport Utility Vehicle' : '{v_name}');
const attr = profiles['{v_name}'] || profiles[normName];
let bestScore = -Infinity;
let bestGender = 'Neutral';
let bestAge = '25-35';
for (const [gName, gVal] of Object.entries(gMods)) {{
  for (const [aName, aVal] of Object.entries(aMods)) {{
    let score = 0;
    for (const [col, baseVal] of Object.entries(attr)) {{
      const mod = 1.0 + (gVal[col] || 0) + (aVal[col] || 0);
      score += baseVal * mod;
    }}
    if (score > bestScore) {{
      bestScore = score;
      bestGender = gName;
      bestAge = aName;
    }}
  }}
}}
console.log(JSON.stringify({{ bestGender, bestAge, bestScore: Math.round(bestScore * 10000) / 10000 }}));
"""
            js_res = self._eval_js(js_code)
            self.assertEqual(py_res.best_gender, js_res['bestGender'], f"Gender mismatch for {v_name}")
            self.assertEqual(py_res.best_age, js_res['bestAge'], f"Age mismatch for {v_name}")
            self.assertAlmostEqual(py_res.best_score, js_res['bestScore'], places=4, msg=f"Score mismatch for {v_name}")

if __name__ == "__main__":
    unittest.main()
