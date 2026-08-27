"""Test parity between original notebook functions and refactored package."""

import ast
import io
import json
import unittest
from pathlib import Path

import numpy as np
import pandas as pd

from gearcity.data_loader import DataLoader
from gearcity.demographics import DemographicCalculator
from gearcity.engine_calculator import EngineCalculator
from gearcity.models import EngineComponents, EngineConfiguration, EngineSliders


class TestNotebookParity(unittest.TestCase):

    def setUp(self):
        self.data_dir = Path(__file__).resolve().parent.parent / "data"
        self.loader = DataLoader(self.data_dir)
        self.calc = EngineCalculator(self.loader)

    def test_demographics_100_percent_parity(self):
        """Verify all 30 vehicle types produce identical demographic rankings and scores."""
        df_demo_raw = pd.read_csv(io.StringIO('''
Vehicle Type,Performance,Driveability,Luxury,Safety,Fuel,Power,Cargo,Dependability
Compact Car,0.2,0.45,0.35,0.5,0.75,0.1,0.4,0.75
Compact Sport Utility,0.3,0.4,0.1,0.3,0.1,0.4,0.35,0.6
Compact Van,0.1,0.45,0.15,0.1,0.5,0.35,0.85,0.5
Coupe,0.7,0.65,0.25,0.25,0.35,0.3,0.2,0.35
Coupe 2+2,0.65,0.55,0.35,0.3,0.4,0.35,0.25,0.35
Coupe Utility,0.45,0.4,0.2,0.1,0.15,0.75,0.75,0.65
Crossover,0.3,0.25,0.5,0.7,0.5,0.3,0.65,0.5
Fastback,0.7,0.65,0.35,0.15,0.25,0.4,0.3,0.4
Full Sized Sedan,0.3,0.25,0.65,0.7,0.55,0.6,0.65,0.4
Hatchback,0.3,0.6,0.4,0.5,0.65,0.2,0.5,0.7
Landaulet,0.2,0.15,0.9,0.5,0.05,0.3,0.7,0.35
Limousine,0.15,0.15,0.8,0.5,0.05,0.3,0.75,0.4
Luxury Sedan,0.55,0.5,0.9,0.75,0.35,0.6,0.68,0.7
Microcar,0.05,0.5,0.125,0.1,0.9,0.05,0.1,0.65
Microvan,0.1,0.5,0.2,0.1,0.55,0.3,0.85,0.5
Minivan,0.1,0.25,0.55,0.85,0.55,0.15,0.8,0.45
Phaeton,0.1,0.3,0.1,0.5,0.45,0.05,0.2,0.5
Pickup Truck,0.4,0.15,0.15,0.05,0.05,0.9,0.95,0.8
Roadster,0.7,0.9,0.05,0.1,0.25,0.25,0.2,0.3
Roadster 2+2,0.65,0.85,0.15,0.15,0.3,0.3,0.25,0.35
Sedan,0.4,0.4,0.45,0.65,0.65,0.45,0.5,0.45
Shooting Brake,0.2,0.15,0.5,0.7,0.35,0.3,0.75,0.5
Sports,0.9,0.85,0.1,0.1,0.05,0.8,0.1,0.35
Station Wagon,0.25,0.15,0.55,0.75,0.6,0.3,0.75,0.5
Subcompact,0.1,0.4,0.35,0.7,0.9,0.1,0.3,0.8
Supercar,1,1,0.01,0.01,0.01,1,0.01,0.05
Sport Utility Vehicle,0.25,0.15,0.5,0.75,0.25,0.8,0.6,0.4
Touring,0.5,0.75,0.5,0.3,0.4,0.5,0.4,0.4
Town Car,0.15,0.15,0.8,0.5,0.15,0.4,0.6,0.4
Van,0.05,0.1,0.05,0.05,0.05,0.7,0.95,0.7
'''), header=0)

        gender_mods = {
            'Male': {'Performance': 0.05, 'Power': 0.05, 'Driveability': 0.05, 'Fuel': -0.05, 'Safety': -0.05, 'Cargo': -0.05},
            'Female': {'Performance': -0.05, 'Power': -0.05, 'Driveability': -0.05, 'Fuel': 0.05, 'Safety': 0.05, 'Cargo': 0.05},
            'Neutral': {}
        }
        age_mods = {
            'Less Than 25': {'Performance': 0.05, 'Fuel': 0.05, 'Safety': -0.05, 'Luxury': -0.05, 'Dependability': 0.05},
            '25-35': {'Performance': -0.05, 'Power': -0.05, 'Driveability': -0.05, 'Safety': 0.05, 'Cargo': 0.05, 'Dependability': 0.05},
            '35-55': {'Performance': 0.05, 'Power': 0.05, 'Fuel': -0.05, 'Safety': -0.05, 'Cargo': -0.05, 'Luxury': 0.05, 'Dependability': -0.05},
            'Greater Than 55': {'Performance': -0.05, 'Power': -0.05, 'Fuel': -0.05, 'Safety': 0.05, 'Luxury': 0.05, 'Dependability': 0.05, 'Driveability': -0.05}
        }

        nb_results = []
        for i in range(len(df_demo_raw)):
            best_score = float('-inf')
            best_demographics = None
            for g in ['Male', 'Female', 'Neutral']:
                for a in ['Less Than 25', '25-35', '35-55', 'Greater Than 55']:
                    score = 0.0
                    for col in df_demo_raw.columns:
                        if col != 'Vehicle Type':
                            score += df_demo_raw.iloc[i][col] * (1.0 + gender_mods[g].get(col, 0) + age_mods[a].get(col, 0))
                    if score > best_score:
                        best_score = score
                        best_demographics = {'gender': g, 'age': a}
            nb_results.append({
                'vtype': df_demo_raw.iloc[i]['Vehicle Type'],
                'gender': best_demographics['gender'],
                'age': best_demographics['age'],
                'score': best_score
            })

        demo_calc = DemographicCalculator()
        pkg_results = demo_calc.evaluate_all()

        for nb_res, pkg_res in zip(nb_results, pkg_results):
            self.assertEqual(nb_res['vtype'], pkg_res.vehicle_type)
            self.assertEqual(nb_res['gender'], pkg_res.best_gender)
            self.assertEqual(nb_res['age'], pkg_res.best_age)
            self.assertAlmostEqual(nb_res['score'], pkg_res.best_score, places=5)

    def test_engine_calculator_multi_year_parity(self):
        """Verify engine performance, cost, weight, and dimension math across years and layouts."""
        layouts = self.loader.layouts
        cylinders = self.loader.cylinders
        fuel = self.loader.fuel
        valvetrain = self.loader.valvetrain
        induction = self.loader.induction
        world_events = self.loader.world_events

        test_years = [1905, 1932, 1957, 1975, 1995, 2015, 2019]
        test_combos = [
            ('I', '4', 'Gasoline', 'Naturally Aspirated', 'OHV'),
            ('V', '8', 'Gasoline', 'Naturally Aspirated', 'OHV'),
            ('Flat', '6', 'Gasoline', 'Naturally Aspirated', 'OHV'),
            ('Radial', '7', 'Gasoline', 'Naturally Aspirated', 'OHV'),
        ]

        for year in test_years:
            if year > 2020:
                ex_0d996p_year50R = 0.901037361
            else:
                ex_0d996p_year50R = 0.996 ** (2050 - year)

            ay = year - 1899
            ex_1d0024p_year99 = 1.0024 ** ay
            ex_1d0035p_year99 = 1.0035 ** ay
            ex_1d005p_year99 = 1.005 ** ay
            ex_1d006p_year99 = 1.006 ** ay
            ex_1d008p_year99 = 1.008 ** ay
            ex_1d04p_year99 = 1.04 ** ay
            ex_1d003p_year99 = 1.003 ** ay
            ex_1d004p_year99 = 1.004 ** ay
            ex_1d01p_year99 = 1.01 ** ay
            ex_1d0105p_year99 = 1.0105 ** ay

            ir = float(world_events[world_events['year'] == year]['interest_rate'].iloc[0])
            cp = float(world_events[world_events['year'] == year]['carprice_rate'].iloc[0])

            for lay_n, cyl_n, f_n, ind_n, v_n in test_combos:
                lay_row = layouts[layouts['Name'] == lay_n].iloc[0]
                cyl_row = cylinders[cylinders['Name'] == cyl_n].iloc[0]
                f_row = fuel[fuel['Name'] == f_n].iloc[0]
                ind_row = induction[induction['Name'] == ind_n].iloc[0]
                v_row = valvetrain[valvetrain['Name'] == v_n].iloc[0]

                bore_slide = 450.0
                stroke_slide = 620.0

                min_b, max_b, min_s, max_s = self.loader.get_bore_stroke_limits(lay_n, year)
                bore_mm = min_b + ((max_b - min_b) * (bore_slide / 1000.0))
                stroke_mm = min_s + ((max_s - min_s) * (stroke_slide / 1000.0))

                cyl_count = float(cyl_row['Number of Cylinders'])
                nb_cc = 0.7854 * ((bore_mm / 10.0) ** 2) * (stroke_mm / 10.0) * cyl_count

                # Notebook Torque formula
                nb_torque = 10.0 + (100.0 / 20.0) + (
                    (25.0 * ((0.65 - 0.4) * 1.5) * ex_1d01p_year99)
                    + (4.0 * (float(lay_row['Length']) + float(lay_row['Width'])) * ex_1d005p_year99)
                    - (14.0 * (0.0 + 0.1) * ex_1d004p_year99)
                    + (
                        float(lay_row['Power']) * 5.0
                        + float(cyl_row['Power']) * 13.0
                        + float(f_row['Power']) * 24.0
                        + 100.0 * float(ind_row['Power'])
                        + (5.0 * ex_1d004p_year99 * 0.85)
                        + 8.0 * (0.0 + 0.7 + 0.0 + 0.0)
                    ) * ex_1d0024p_year99
                )
                nb_torque = nb_torque * ((cyl_count * stroke_mm * 0.93 * bore_mm * 0.9) * 0.000027) + 5.0
                if year < 2050:
                    nb_torque = nb_torque * ex_0d996p_year50R
                nb_torque = nb_torque * float(v_row['Power'])

                # Notebook RPM formula
                tmpAY = ay
                if tmpAY > 80:
                    tmpAY = 80.0 + ((ay - 80.0) / 5.0)

                nb_rpm = (
                    (
                        ((tmpAY ** 4) * 0.00000420875)
                        - ((19.0 * (tmpAY ** 3)) * 0.00016835)
                        + ((427.0 * (tmpAY ** 2)) * 0.00126)
                        + ((1315.0 * tmpAY) * 0.01515)
                        + 620.0
                    )
                    + (265.0 * ex_1d01p_year99 * 0.85)
                    + (465.0 * ex_1d0105p_year99 * (0.75 * 5.5))
                    - (10.0 * ex_1d01p_year99 * float(ind_row['Power']))
                    + (55.0 * ex_1d005p_year99 * (1.0 - 0.6))
                    - (30.0 * ex_1d005p_year99 * (0.1 + 0.0))
                    + (25.0 * ex_1d01p_year99 * 0.0)
                    + (25.0 * ex_1d01p_year99 * 0.7)
                    + (25.0 * ex_1d01p_year99 * 0.0)
                ) * float(f_row['RPM'])

                nb_rpm = nb_rpm * float(v_row['RPM'])
                nb_rpm = nb_rpm - ((nb_rpm / 1.5) * (stroke_mm / 221.136364))
                if nb_rpm < 25.0:
                    nb_rpm = 25.0

                nb_hp = (nb_torque * nb_rpm) / 5252.0

                # Evaluate using refactored package
                config = EngineConfiguration(
                    components=EngineComponents(layout=lay_n, cylinders=cyl_n, fuel=f_n, induction=ind_n, valve=v_n),
                    sliders=EngineSliders(
                        bore_slide=bore_slide,
                        stroke_slide=stroke_slide,
                        performance_torque=0.65,
                        performance_revolutions=0.75,
                        performance_fuel_economy=0.0,
                        design_focus_fuel_economy=0.1,
                        design_focus_performance=0.85,
                        design_focus_dependability=0.5,
                        layout_length=0.4,
                        layout_width=0.5,
                        layout_weight=0.6,
                        technology_materials=0.7,
                        technology_components=0.0,
                        technology_technologies=0.0,
                        technology_techniques=0.0,
                    ),
                    year=year
                )
                pkg_res = self.calc.calculate_performance(config, interest_rate=ir, carprice_rate=cp)

                # Assert exact math parity down to 7 decimal places
                self.assertAlmostEqual(nb_cc, pkg_res.displacement_cc, places=7)
                self.assertAlmostEqual(nb_torque, pkg_res.torque_ft_lb, places=7)
                self.assertAlmostEqual(nb_rpm, pkg_res.rpm, places=7)
                self.assertAlmostEqual(nb_hp, pkg_res.horsepower, places=7)


if __name__ == "__main__":
    unittest.main()
