#!/usr/bin/env python3
import xml.etree.ElementTree as ET
import re
import os

# 1. 提取XML数据为JS对象
def xml_to_js(xml_file, js_var_name):
    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
        records = []
        for rec in root.findall('RECORD'):
            obj = {}
            for attr_name, attr_value in rec.attrib.items():
                try:
                    if '.' in attr_value:
                        obj[attr_name] = float(attr_value)
                    else:
                        obj[attr_name] = int(attr_value)
                except:
                    obj[attr_name] = attr_value
            records.append(obj)
        return f"const {js_var_name} = {records};"
    except Exception as e:
        return f"// Error loading {xml_file}: {e}\nconst {js_var_name} = [];"

# XML文件映射
xml_files = {
    'enemy.xml': 'ENEMY_DATA',
    'skill.xml': 'SKILL_DATA', 
    'equipment.xml': 'EQUIPMENT_DATA',
    'weather.xml': 'WEATHER_DATA',
    'status.xml': 'STATUS_DATA',
    'prop.xml': 'PROP_DATA',
    'level_up.xml': 'LEVEL_UP_DATA',
    'level_up_exp.xml': 'LEVEL_UP_EXP_DATA',
    'battle_disposition.xml': 'BATTLE_DISPOSITION_DATA',
    'level_up_enemy.xml': 'LEVEL_UP_ENEMY_DATA',
    'characters.xml': 'CHARACTERS_DATA',
    'buff.xml': 'BUFF_DATA',
    'skill_up.xml': 'SKILL_UP_DATA'
}

# 生成内嵌数据代码
embedded_data = []
embedded_data.append("/* ===== 内嵌游戏数据 ===== */")
embedded_data.append("(function() {")
for xml_file, js_var in xml_files.items():
    xml_path = f"/app/data/dj-data/{xml_file}"
    if os.path.exists(xml_path):
        js_code = xml_to_js(xml_path, js_var)
        embedded_data.append(js_code)
    else:
        embedded_data.append(f"// {xml_file} not found\nconst {js_var} = [];")
embedded_data.append("window.GAME_DATA = {")
for i, (xml_file, js_var) in enumerate(xml_files.items()):
    comma = "," if i < len(xml_files) - 1 else ""
    embedded_data.append(f"  {js_var}: {js_var}{comma}")
embedded_data.append("};")
embedded_data.append("})();")

data_code = "\n".join(embedded_data)
print(f"Generated {len(data_code)} chars of embedded data")
