"""Unit tests for the EngineOptimizer module."""

import unittest
from gearcity.models import OptimizationConstraints
from gearcity.optimizer import EngineOptimizer


class TestEngineOptimizer(unittest.TestCase):

    def setUp(self):
        self.optimizer = EngineOptimizer()

    def test_optimization_convergence(self):
        constraints = OptimizationConstraints(
            max_cost=600,
            max_weight_kg=150,
            design_focus="HP",
            allowed_layouts=["I", "V"],
            allowed_fuels=["Gasoline"],
        )

        config, result, raw = self.optimizer.optimize(
            year=1935,
            constraints=constraints,
            maxiter=15,
            popsize=8,
            seed=123,
        )

        self.assertIsNotNone(config)
        self.assertIsNotNone(result)
        self.assertIn(config.components.layout, ["I", "V"])
        self.assertEqual(config.components.fuel, "Gasoline")
        self.assertGreater(result.horsepower, 0)


if __name__ == "__main__":
    unittest.main()
