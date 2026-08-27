"""Unit tests for the DemographicCalculator module."""

import unittest
from gearcity.demographics import DemographicCalculator


class TestDemographics(unittest.TestCase):

    def setUp(self):
        self.calc = DemographicCalculator()

    def test_evaluate_vehicle(self):
        res = self.calc.evaluate_vehicle("Luxury Sedan")
        self.assertEqual(res.vehicle_type, "Luxury Sedan")
        self.assertEqual(res.best_gender, "Female")
        self.assertEqual(res.best_age, "25-35")
        self.assertAlmostEqual(res.best_score, 5.0605, places=3)

    def test_evaluate_all_count(self):
        all_res = self.calc.evaluate_all()
        self.assertEqual(len(all_res), 30)

    def test_dataframe_export(self):
        df = self.calc.to_dataframe()
        self.assertEqual(len(df), 30)
        self.assertIn("Vehicle Type", df.columns)
        self.assertIn("Best Score", df.columns)


if __name__ == "__main__":
    unittest.main()
