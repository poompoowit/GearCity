"""Unit tests for the EngineCalculator module."""

import unittest
from gearcity.data_loader import DataLoader
from gearcity.engine_calculator import EngineCalculator
from gearcity.models import EngineComponents, EngineConfiguration, EngineSliders


class TestEngineCalculator(unittest.TestCase):

    def setUp(self):
        self.loader = DataLoader()
        self.calculator = EngineCalculator(self.loader)

    def test_bore_stroke_calculation(self):
        bore, stroke = self.calculator.calculate_bore_stroke(500, 500, "I", 1935)
        self.assertGreater(bore, 50)
        self.assertGreater(stroke, 50)

    def test_engine_performance_metrics(self):
        config = EngineConfiguration(
            components=EngineComponents(
                layout="I",
                cylinders="4",
                fuel="Gasoline",
                induction="Naturally Aspirated",
                valve="OHV",
            ),
            sliders=EngineSliders(
                bore_slide=500,
                stroke_slide=500,
                performance_torque=0.5,
                performance_revolutions=0.5,
                layout_length=0.5,
                layout_width=0.5,
                layout_weight=0.5,
            ),
            year=1935,
        )

        result = self.calculator.calculate_performance(config)

        self.assertGreater(result.displacement_cc, 1000)
        self.assertGreater(result.horsepower, 10)
        self.assertGreater(result.torque_nm, 10)
        self.assertGreater(result.rpm, 500)
        self.assertGreater(result.weight_kg, 50)
        self.assertGreater(result.unit_cost, 50)
        self.assertGreater(result.length_cm, 20)
        self.assertGreater(result.width_cm, 20)


if __name__ == "__main__":
    unittest.main()
