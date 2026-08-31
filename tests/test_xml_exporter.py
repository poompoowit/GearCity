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
            self.assertGreater(out_file.stat().st_size, 0)

    def test_chassis_xml_generation(self):
        chassis_config = {
            "dimensions": {"length": 50.0, "width": 50.0, "height": 50.0, "weight": 50.0, "engWidth": 50.0, "engLength": 50.0},
            "suspensionTuning": {"stability": 65.0, "comfort": 55.0, "performance": 50.0, "braking": 60.0, "durability": 75.0},
            "designFocus": {"performance": 45.0, "control": 55.0, "strength": 80.0, "dependability": 80.0},
            "techSliders": {"materials": 30.0, "components": 30.0, "techniques": 30.0, "technology": 30.0},
            "designPace": 50.0,
            "frameType": "Unibody",
            "drivetrain": "FR",
            "frSuspension": "Wishbone",
            "rrSuspension": "Wishbone",
        }
        xml_str = self.exporter.generate_chassis_xml_string(chassis_config)
        root = ET.fromstring(xml_str)
        self.assertEqual(root.tag, "Chassis")
        self.assertEqual(root.find("Frame_Type").text, "Unibody")
        self.assertEqual(root.find("Drivetrain").text, "FR")
        self.assertEqual(root.find("Fr_Suspension").text, "Wishbone")
        self.assertEqual(root.find("SUS_Stability").text, "65.0")
        self.assertEqual(root.find("DE_Str").text, "80.0")

    def test_gearbox_xml_generation(self):
        gearbox_config = {
            "gearing": {"loRatio": 50.0, "hiRatio": 55.0, "torqueInputRatio": 55.0, "maxTorqueInput": 240.0},
            "features": {"gears": 4, "reverse": 1, "overdrive": 1, "limited": 0, "transaxle": 0},
            "designFocus": {"performance": 65.0, "fuel": 65.0, "dependability": 65.0, "comfort": 25.0},
            "techSliders": {"materials": 30.0, "components": 30.0, "techniques": 30.0, "technology": 30.0},
            "designPace": 50.0,
            "gearboxType": "Automatic",
        }
        xml_str = self.exporter.generate_gearbox_xml_string(gearbox_config)
        root = ET.fromstring(xml_str)
        self.assertEqual(root.tag, "Gearbox")
        self.assertEqual(root.find("GearboxType").text, "Automatic")
        self.assertEqual(root.find("Gears").text, "4")
        self.assertEqual(root.find("LoRatio").text, "50.0")
        self.assertEqual(root.find("MaxTorqueInput").text, "240.0")
        self.assertEqual(root.find("Overdrive").text, "1")

    def test_chassis_decade_benchmarks(self):
        benchmark_config = {
            "dimensions": {"length": 35.0, "width": 40.0, "height": 40.0, "weight": 80.0, "engWidth": 40.0, "engLength": 40.0},
            "suspensionTuning": {"stability": 60.0, "comfort": 25.0, "performance": 60.0, "braking": 65.0, "durability": 70.0},
            "designFocus": {"performance": 65.0, "control": 70.0, "strength": 55.0, "dependability": 80.0},
            "techSliders": {"materials": 15.0, "components": 20.0, "techniques": 0.0, "technology": 0.0},
            "frameType": "Carriage",
            "drivetrain": "RR",
            "frSuspension": "Swing Axle",
            "rrSuspension": "Swing Axle",
        }
        xml_str = self.exporter.generate_chassis_xml_string(benchmark_config)
        root = ET.fromstring(xml_str)
        self.assertEqual(root.find("Frame_Type").text, "Carriage")
        self.assertEqual(root.find("Drivetrain").text, "RR")
        self.assertEqual(root.find("FD_Weight").text, "80.0")


if __name__ == "__main__":
    unittest.main()
