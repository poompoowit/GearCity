"""Unit tests for the DataLoader module."""

import unittest
from gearcity.data_loader import DataLoader


class TestDataLoader(unittest.TestCase):

    def setUp(self):
        self.loader = DataLoader()

    def test_datasets_loaded(self):
        self.assertFalse(self.loader.layouts.empty)
        self.assertFalse(self.loader.cylinders.empty)
        self.assertFalse(self.loader.fuel.empty)
        self.assertFalse(self.loader.induction.empty)
        self.assertFalse(self.loader.valvetrain.empty)
        self.assertFalse(self.loader.world_events.empty)

    def test_world_rates(self):
        ir, cp = self.loader.get_world_rates(1900)
        self.assertAlmostEqual(ir, 1.02)
        self.assertAlmostEqual(cp, 1.4)

    def test_bore_stroke_limits(self):
        min_b, max_b, min_s, max_s = self.loader.get_bore_stroke_limits("I", 1935)
        self.assertGreater(max_b, min_b)
        self.assertGreater(max_s, min_s)
        self.assertGreater(min_b, 0)

    def test_valvetrain_unlock_logic(self):
        layout_row = self.loader.layouts[self.loader.layouts["Name"] == "I"].iloc[0]
        valves_1900 = self.loader.get_valid_valvetrains_for_layout(layout_row, 1900)
        self.assertNotIn("DOHC", valves_1900)
        valves_1910 = self.loader.get_valid_valvetrains_for_layout(layout_row, 1910)
        self.assertIn("DOHC", valves_1910)


if __name__ == "__main__":
    unittest.main()
