"""Unit tests for the XMLExporter module."""

import tempfile
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

from gearcity.models import EngineComponents, EngineConfiguration, EngineSliders
from gearcity.xml_exporter import XMLExporter


class TestXMLExporter(unittest.TestCase):

    def setUp(self):
        self.exporter = XMLExporter()

    def test_xml_generation(self):
        config = EngineConfiguration(
            components=EngineComponents(
                layout="Flat",
                cylinders="6",
                fuel="Gasoline",
                induction="Naturally Aspirated",
                valve="OHV",
            ),
            sliders=EngineSliders(),
            year=1950,
            name="Flat6_1950",
        )

        xml_str = self.exporter.generate_xml_string(config)
        root = ET.fromstring(xml_str)

        self.assertEqual(root.tag, "Engine")
        self.assertEqual(root.find("Layout").text, "Flat")
        self.assertEqual(root.find("Cylinders").text, "6")
        self.assertEqual(root.find("Fueltype").text, "Gasoline")
        self.assertEqual(root.find("Induction").text, "Naturally Aspirated")
        self.assertEqual(root.find("Valve").text, "OHV")
        self.assertIsNotNone(root.find("slider_bore"))
        self.assertIsNotNone(root.find("slider_stroke"))
        self.assertIsNotNone(root.find("slider_compoenents"))

    def test_export_to_file(self):
        config = EngineConfiguration(
            components=EngineComponents(
                layout="V",
                cylinders="8",
                fuel="Gasoline",
                induction="Supercharger",
                valve="OHV",
            ),
            sliders=EngineSliders(),
            year=1960,
            name="V8_Supercharged",
        )

        with tempfile.TemporaryDirectory() as tmpdir:
            out_file = Path(tmpdir) / "engine_test.xml"
            self.exporter.export_to_file(config, out_file)
            self.assertTrue(out_file.exists())
            self.assertGreater(out_file.stat().st_size, 100)


if __name__ == "__main__":
    unittest.main()
