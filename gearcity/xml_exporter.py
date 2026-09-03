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

    def generate_chassis_xml_string(self, config: dict, pretty: bool = True) -> str:
        """Convert Chassis configuration dictionary to a GearCity XML blueprint string."""
        root = ET.Element("Chassis")
        dim = config.get("dimensions", {})
        sus = config.get("suspensionTuning", {})
        de = config.get("designFocus", {})
        tech = config.get("techSliders", {})

        ET.SubElement(root, "FD_Length").text = str(round(dim.get("length", 50.0), 1))
        ET.SubElement(root, "FD_Width").text = str(round(dim.get("width", 50.0), 1))
        ET.SubElement(root, "FD_Height").text = str(round(dim.get("height", 50.0), 1))
        ET.SubElement(root, "FD_Weight").text = str(round(dim.get("weight", 50.0), 1))
        ET.SubElement(root, "FD_ENG_Width").text = str(round(dim.get("engWidth", 50.0), 1))
        ET.SubElement(root, "FD_ENG_Length").text = str(round(dim.get("engLength", 50.0), 1))

        ET.SubElement(root, "SUS_Stability").text = str(round(sus.get("stability", 50.0), 1))
        ET.SubElement(root, "SUS_Comfort").text = str(round(sus.get("comfort", 50.0), 1))
        ET.SubElement(root, "SUS_Performance").text = str(round(sus.get("performance", 50.0), 1))
        ET.SubElement(root, "SUS_Braking").text = str(round(sus.get("braking", 50.0), 1))
        ET.SubElement(root, "SUS_Durability").text = str(round(sus.get("durability", 50.0), 1))

        ET.SubElement(root, "DE_Performance").text = str(round(de.get("performance", 50.0), 1))
        ET.SubElement(root, "DE_Control").text = str(round(de.get("control", 50.0), 1))
        ET.SubElement(root, "DE_Str").text = str(round(de.get("strength", 50.0), 1))
        ET.SubElement(root, "DE_Depend").text = str(round(de.get("dependability", 50.0), 1))

        ET.SubElement(root, "TECH_Materials").text = str(round(tech.get("materials", 30.0), 1))
        ET.SubElement(root, "TECH_Compoenents").text = str(round(tech.get("components", 30.0), 1))
        ET.SubElement(root, "TECH_Techniques").text = str(round(tech.get("techniques", 30.0), 1))
        ET.SubElement(root, "TECH_Tech").text = str(round(tech.get("technology", 30.0), 1))

        ET.SubElement(root, "DesignPace").text = str(round(config.get("designPace", 50.0), 1))
        ET.SubElement(root, "Frame_Type").text = str(config.get("frameType", "Ladder Frame"))
        ET.SubElement(root, "Drivetrain").text = str(config.get("drivetrain", "FR"))
        ET.SubElement(root, "Fr_Suspension").text = str(config.get("frSuspension", "Leaf Spring"))
        ET.SubElement(root, "Rr_Suspension").text = str(config.get("rrSuspension", config.get("frSuspension", "Leaf Spring")))

        raw_xml = ET.tostring(root, encoding="utf-8")
        if pretty:
            reparsed = minidom.parseString(raw_xml)
            return reparsed.toprettyxml(indent="  ")
        return raw_xml.decode("utf-8")

    def generate_gearbox_xml_string(self, config: dict, pretty: bool = True) -> str:
        """Convert Gearbox configuration dictionary to a GearCity XML blueprint string."""
        root = ET.Element("Gearbox")
        gr = config.get("gearing", {})
        de = config.get("designFocus", {})
        tech = config.get("techSliders", {})
        feat = config.get("features", {})

        ET.SubElement(root, "LoRatio").text = str(round(gr.get("loRatio", 50.0), 1))
        ET.SubElement(root, "HiRatio").text = str(round(gr.get("hiRatio", 50.0), 1))
        ET.SubElement(root, "TorqueInputRatio").text = str(round(gr.get("torqueInputRatio", 50.0), 1))
        ET.SubElement(root, "MaxTorqueInput").text = str(round(gr.get("maxTorqueInput", 200.0), 1))

        ET.SubElement(root, "Tech_Material").text = str(round(tech.get("materials", 30.0), 1))
        ET.SubElement(root, "Tech_Parts").text = str(round(tech.get("components", 30.0), 1))
        ET.SubElement(root, "Tech_Techniques").text = str(round(tech.get("techniques", 30.0), 1))
        ET.SubElement(root, "Tech_Tech").text = str(round(tech.get("technology", 30.0), 1))

        ET.SubElement(root, "de_performance").text = str(round(de.get("performance", 50.0), 1))
        ET.SubElement(root, "de_fuel").text = str(round(de.get("fuel", 50.0), 1))
        ET.SubElement(root, "de_depend").text = str(round(de.get("dependability", 50.0), 1))
        ET.SubElement(root, "de_comfort").text = str(round(de.get("comfort", 50.0), 1))

        ET.SubElement(root, "DesignPace").text = str(round(config.get("designPace", 50.0), 1))
        ET.SubElement(root, "Gears").text = str(feat.get("gears", 4))
        ET.SubElement(root, "GearboxType").text = str(config.get("gearboxType", "Manual"))
        ET.SubElement(root, "Reverse").text = str(feat.get("reverse", 1))
        ET.SubElement(root, "Overdrive").text = "1" if feat.get("overdrive") else "0"
        ET.SubElement(root, "Limited").text = "1" if feat.get("limited") else "0"
        ET.SubElement(root, "Transaxle").text = "1" if feat.get("transaxle") else "0"

        raw_xml = ET.tostring(root, encoding="utf-8")
        if pretty:
            reparsed = minidom.parseString(raw_xml)
            return reparsed.toprettyxml(indent="  ")
        return raw_xml.decode("utf-8")

    def generate_vehicle_xml_string(self, config: dict, pretty: bool = False) -> str:
        """Convert Vehicle configuration dictionary to GearCity SavedSliders Car XML blueprint string."""
        it = config.get("interior", {})
        mat = config.get("materials", {})
        df = config.get("designFocus", {})
        dg = config.get("demographics", {})
        ts = config.get("testing", {})

        def v(val, def_val=50.0):
            return f"{float(val if val is not None else def_val):.1f}"

        # Gender enum: 0 = Male, 1 = Female, 2 = Neutral
        gender_map = {"Male": 0, "Female": 1, "Neutral": 2}
        demo_gender = gender_map.get(dg.get("gender"), 2)

        # Age enum: 0 = Less Than 25, 1 = 25-35, 2 = 35-55, 3 = Greater Than 55
        age_map = {"Less Than 25": 0, "<25": 0, "25-35": 1, "35-55": 2, "Greater Than 55": 3, ">55": 3}
        demo_age = age_map.get(dg.get("age"), 2)

        # Wealth tier: integer 1 to 7 (default 4)
        wealth_raw = dg.get("wealth", 4)
        try:
            demo_wealth = int(wealth_raw)
            if demo_wealth < 1 or demo_wealth > 7:
                demo_wealth = 4
        except (ValueError, TypeError):
            demo_wealth = 4

        return (
            f"\t<Car>\n"
            f"\t<Scroll_InteriorStyle>{v(it.get('style'))}</Scroll_InteriorStyle>\n"
            f"\t<Scroll_InteriorInno>{v(it.get('innovation'))}</Scroll_InteriorInno>\n"
            f"\t<Scroll_InteriorLux>{v(it.get('luxury'))}</Scroll_InteriorLux>\n"
            f"\t<Scroll_InteriorComf>{v(it.get('comfort'))}</Scroll_InteriorComf>\n"
            f"\t<Scroll_InteriorSafe>{v(it.get('safety'))}</Scroll_InteriorSafe>\n"
            f"\t<Scroll_InteriorTech>{v(it.get('technology'))}</Scroll_InteriorTech>\n"
            f"\t<Scroll_MatMatQual>{v(mat.get('materialQuality'))}</Scroll_MatMatQual>\n"
            f"\t<Scroll_MatMatInterQual >{v(mat.get('interiorQuality'))}</Scroll_MatMatInterQual>\n"
            f"\t<Scroll_MatPaintQual>{v(mat.get('paintQuality'))}</Scroll_MatPaintQual>\n"
            f"\t<Scroll_MatManuTech>{v(mat.get('techniques'))}</Scroll_MatManuTech>\n"
            f"\t<Scroll_DesignStyle>{v(df.get('style'))}</Scroll_DesignStyle>\n"
            f"\t<Scroll_DesignLux>{v(df.get('luxury'))}</Scroll_DesignLux>\n"
            f"\t<Scroll_DesignSafety>{v(df.get('safety'))}</Scroll_DesignSafety>\n"
            f"\t<Scroll_DesignCargo>{v(df.get('cargo'))}</Scroll_DesignCargo>\n"
            f"\t<Scroll_DesignDepend>{v(df.get('dependability'))}</Scroll_DesignDepend>\n"
            f"\t<Scroll_TestDemo>{v(ts.get('demographics'))}</Scroll_TestDemo>\n"
            f"\t<Scroll_TestPerform>{v(ts.get('performance'))}</Scroll_TestPerform>\n"
            f"\t<Scroll_TestFuel>{v(ts.get('fuelEconomy'))}</Scroll_TestFuel>\n"
            f"\t<Scroll_TestComf>{v(ts.get('comfort'))}</Scroll_TestComf>\n"
            f"\t<Scroll_TestUtil>{v(ts.get('utility'))}</Scroll_TestUtil>\n"
            f"\t<Scroll_TestReli>{v(ts.get('reliability'))}</Scroll_TestReli>\n"
            f"\t<DesignPace>{v(df.get('designPace', 50.0))}</DesignPace>\n"
            f"\t<DemoGender>{demo_gender}</DemoGender>\n"
            f"\t<DemoAge>{demo_age}</DemoAge>\n"
            f"\t<DemoWealth>{demo_wealth}</DemoWealth>\n"
            f"\t</Car>\n"
        )

    def export_to_file(self, config: Union[EngineConfiguration, dict], output_path: Union[str, Path], comp_type: str = "engine") -> Path:
        """Write blueprint XML to a file."""
        target_path = Path(output_path)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        if comp_type == "chassis":
            xml_content = self.generate_chassis_xml_string(config)
        elif comp_type == "gearbox":
            xml_content = self.generate_gearbox_xml_string(config)
        elif comp_type == "vehicle":
            xml_content = self.generate_vehicle_xml_string(config)
        else:
            xml_content = self.generate_xml_string(config)
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(xml_content)
        return target_path
