"""GearCity XML blueprint generator for direct game import."""

from pathlib import Path
from typing import Optional, Union
import xml.etree.ElementTree as ET
from xml.dom import minidom

from gearcity.data_loader import DataLoader
from gearcity.engine_calculator import EngineCalculator
from gearcity.models import EngineConfiguration


class XMLExporter:
    """Exports EngineConfiguration instances to GearCity-compatible XML blueprint files."""

    def __init__(self, calculator: Optional[EngineCalculator] = None):
        self.calculator = calculator or EngineCalculator(DataLoader())

    def generate_xml_string(self, config: EngineConfiguration, pretty: bool = True) -> str:
        """Convert EngineConfiguration to a GearCity XML blueprint string."""
        comp = config.components
        sliders = config.sliders

        bore_mm, stroke_mm = self.calculator.calculate_bore_stroke(
            sliders.bore_slide, sliders.stroke_slide, comp.layout, config.year
        )

        root = ET.Element("Engine")

        # Dimensions & Sizing
        ET.SubElement(root, "slider_stroke").text = str(round(stroke_mm, 2))
        ET.SubElement(root, "slider_bore").text = str(round(bore_mm, 2))
        ET.SubElement(root, "slider_length").text = str(round(sliders.layout_length * 100.0, 1))
        ET.SubElement(root, "slider_width").text = str(round(sliders.layout_width * 100.0, 1))
        ET.SubElement(root, "slider_weight").text = str(round(sliders.layout_weight * 100.0, 1))

        # Performance Sliders
        ET.SubElement(root, "slider_rpm").text = str(round(sliders.performance_revolutions * 100.0, 1))
        ET.SubElement(root, "slider_torq").text = str(round(sliders.performance_torque * 100.0, 1))
        ET.SubElement(root, "slider_eco").text = str(round(sliders.performance_fuel_economy * 100.0, 1))

        # Technology Sliders
        ET.SubElement(root, "slider_materials").text = str(round(sliders.technology_materials * 100.0, 1))
        ET.SubElement(root, "slider_techniques").text = str(round(sliders.technology_techniques * 100.0, 1))
        ET.SubElement(root, "slider_tech").text = str(round(sliders.technology_technologies * 100.0, 1))
        # Note: GearCity XML format uses the spelling 'slider_compoenents'
        ET.SubElement(root, "slider_compoenents").text = str(round(sliders.technology_components * 100.0, 1))

        # Design Focus Sliders
        ET.SubElement(root, "slider_designperformance").text = str(round(sliders.design_focus_performance * 100.0, 1))
        ET.SubElement(root, "slider_designfueleco").text = str(round(sliders.design_focus_fuel_economy * 100.0, 1))
        ET.SubElement(root, "slider_designdependability").text = str(round(sliders.design_focus_dependability * 100.0, 1))

        # Meta & Layout
        ET.SubElement(root, "DesignPace").text = str(round(config.design_pace, 1))
        ET.SubElement(root, "lay_transverse").text = "1" if config.transverse else "0"

        # Components
        ET.SubElement(root, "Cylinders").text = str(comp.cylinders)
        ET.SubElement(root, "Fueltype").text = str(comp.fuel)
        ET.SubElement(root, "Induction").text = str(comp.induction)
        ET.SubElement(root, "Valve").text = str(comp.valve)
        ET.SubElement(root, "Layout").text = str(comp.layout)

        raw_xml = ET.tostring(root, encoding="utf-8")
        if pretty:
            reparsed = minidom.parseString(raw_xml)
            return reparsed.toprettyxml(indent="  ")
        return raw_xml.decode("utf-8")

    def export_to_file(self, config: EngineConfiguration, output_path: Union[str, Path]) -> Path:
        """Write the EngineConfiguration blueprint XML to a file."""
        target_path = Path(output_path)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        xml_content = self.generate_xml_string(config)
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(xml_content)
        return target_path
