#!/usr/bin/env python3
import xml.etree.ElementTree as ET
import os
import re
import json

# === 1. 生成内嵌数据 ===
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

embedded_data_lines = []
embedded_data_lines.append("/* ===== 内嵌游戏数据 ===== */")
embedded_data_lines.append("(function() {")

for xml_file, js_var in xml_files.items():
    xml_path = f"/app/data/dj-data/{xml_file}"
    if os.path.exists(xml_path):
        try:
            tree = ET.parse(xml_path)
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
            embedded_data_lines.append(f"const {js_var} = {json.dumps(records, ensure_ascii=False)};")
        except Exception as e:
            embedded_data_lines.append(f"const {js_var} = []; // {e}")
    else:
        embedded_data_lines.append(f"const {js_var} = [];")

embedded_data_lines.append("window.GAME_DATA = {")
for i, (xml_file, js_var) in enumerate(xml_files.items()):
    comma = "," if i < len(xml_files) - 1 else ""
    embedded_data_lines.append(f"  {js_var}: {js_var}{comma}")
embedded_data_lines.append("};")
embedded_data_lines.append("})();")

embedded_data_code = "\n".join(embedded_data_lines)

# === 2. 转换TypeScript文件 ===
def convert_ts(content):
    # 移除import
    content = re.sub(r"^import\s+\{[^}]*\}\s+from\s+['\"][^'\"]+['\"];?\s*$", "", content, flags=re.MULTILINE)
    content = re.sub(r"^import\s+Phaser\s+from\s+['\"]phaser['\"];?\s*$", "", content, flags=re.MULTILINE)
    content = re.sub(r"^import\s+type\s+\{[^}]+\}\s+from\s+['\"]phaser['\"];?\s*$", "", content, flags=re.MULTILINE)
    # 移除export
    content = re.sub(r"^export\s+(const|class|function|interface)\s+", r"\1 ", content, flags=re.MULTILINE)
    # 移除类型注解
    content = re.sub(r":\s*(Phaser\.[^;,\)\s]+)", "", content)
    content = re.sub(r":\s*(string|number|boolean|void|any)\b", "", content)
    content = re.sub(r":\s*([A-Z][a-zA-Z0-9_<>]+)\b", "", content)
    content = re.sub(r":\s*Record<[^>]+>", "", content)
    content = re.sub(r":\s*Array<[^>]+>", "", content)
    content = re.sub(r":\s*Promise<[^>]+>", "", content)
    content = re.sub(r":\s*\w+\[\]", "", content)
    content = re.sub(r"\s+as\s+[A-Za-z0-9_<>\[\]|]+", "", content)
    # 移除interface声明行
    content = re.sub(r"^\s*interface\s+\w+[^{]*$", "", content, flags=re.MULTILINE)
    # 移除函数返回类型 { xxx; yyy }
    content = re.sub(r"function\s+\w+\([^)]*\):\s*\{[^}]*\}\s*\{", lambda m: m.group(0).split('):')[0] + ' {', content)
    # 移除数组类型注解 []
    content = re.sub(r'(const|let|var)\s+\w+\[\]\s*=', r'\1 ', content)
    return content

src_dir = "src"
files = ["config.ts", "data/types.ts", "utils/XMLParser.ts", "entities/Character.ts",
         "entities/Party.ts", "systems/WeatherSystem.ts", "systems/BattleSystem.ts",
         "systems/SaveSystem.ts", "ui/UIUtils.ts", "scenes/BootScene.ts",
         "scenes/MenuScene.ts", "scenes/ChapterScene.ts", "scenes/DifficultyScene.ts",
         "scenes/BoardScene.ts", "scenes/BattleScene.ts", "main.ts"]

converted_code = {}
for f in files:
    path = os.path.join(src_dir, f)
    if os.path.exists(path):
        with open(path, 'r') as fh:
            converted_code[f] = convert_ts(fh.read())

# === 3. DataManager (使用内嵌数据) ===
dm_code = '''class DataManager {
  static instance = null;
  enemies = new Map();
  enemiesByName = new Map();
  skills = new Map();
  skillsByName = new Map();
  equipments = new Map();
  weathers = new Map();
  statuses = new Map();
  props = new Map();
  levelUps = new Map();
  levelUpExps = new Map();
  battleDispositions = [];
  levelUpEnemies = new Map();
  loaded = false;
  
  static getInstance() {
    if (!DataManager.instance) DataManager.instance = new DataManager();
    return DataManager.instance;
  }
  
  async loadAll() {
    if (this.loaded) return;
    this.loadFromEmbeddedData();
    this.loaded = true;
    console.log('游戏数据加载完成');
  }
  
  loadFromEmbeddedData() {
    const data = window.GAME_DATA;
    if (!data) { console.error('GAME_DATA not loaded!'); return; }
    (data.ENEMY_DATA || []).forEach(r => { this.enemies.set(r.id, r); this.enemiesByName.set(r.name, r); });
    (data.SKILL_DATA || []).forEach(r => { this.skills.set(r.id, r); this.skillsByName.set(r.skill_name, r); });
    (data.EQUIPMENT_DATA || []).forEach(r => this.equipments.set(r.id, r));
    (data.WEATHER_DATA || []).forEach(r => this.weathers.set(r.id, r));
    (data.STATUS_DATA || []).forEach(r => this.statuses.set(r.status_name, r));
    (data.PROP_DATA || []).forEach(r => this.props.set(r.id, r));
    (data.LEVEL_UP_DATA || []).forEach(r => this.levelUps.set(r.id, r));
    (data.LEVEL_UP_EXP_DATA || []).forEach(r => this.levelUpExps.set(r.lv, r));
    this.battleDispositions = data.BATTLE_DISPOSITION_DATA || [];
    (data.LEVEL_UP_ENEMY_DATA || []).forEach(r => this.levelUpEnemies.set(r.id, r));
  }
  
  getEnemy(id) { return typeof id === 'string' ? this.enemiesByName.get(id) : this.enemies.get(id); }
  getSkill(id) { return typeof id === 'string' ? this.skillsByName.get(id) : this.skills.get(id); }
  getEquipment(id) { return this.equipments.get(id); }
  getWeather(id) { return this.weathers.get(id); }
  getStatus(name) { return this.statuses.get(name); }
  getProp(id) { return this.props.get(id); }
  getLevelUp(name) { for (let v of this.levelUps.values()) if (v.name === name) return v; return null; }
  getExpForLevel(level) { const d = this.levelUpExps.get(level); return d ? d.exp : 1000 * level; }
  getBattleDisposition(levelName, difficulty) { return this.battleDispositions.find(d => d.level_name === levelName && d.difficulty === difficulty); }
  getEnemyNameByWeather(disposition, weatherId) {
    if (!disposition) return ['小强'];
    const map = {2:'night_enemy_name',3:'rain_enemy_name',4:'thunder_enemy_name',5:'wind_enemy_name'};
    const key = map[weatherId] || 'enemy_name';
    const val = disposition[key];
    return val ? val.split(',') : [disposition.enemy_name || '小强'];
  }
}
'''

# === 4. 生成HTML ===
html = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>造梦江湖1 - 小宝传奇</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:100%;height:100%;overflow:hidden;background:#1a0a00;touch-action:none;-webkit-touch-callout:none;-webkit-user-select:none}
    #game-container{width:100%;height:100%;display:flex;justify-content:center;align-items:center}
    #loading{position:fixed;top:0;left:0;right:0;bottom:0;background:linear-gradient(180deg,#1a0a00,#2d1810);display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:1000;font-family:Microsoft YaHei,sans-serif}
    #loading-title{color:#D4AF37;font-size:28px;margin-bottom:30px;text-shadow:2px 2px 4px #000}
    #loading-bar-container{width:280px;height:20px;background:#333;border-radius:10px;border:2px solid #D4AF37;overflow:hidden}
    #loading-progress{height:100%;width:0%;background:linear-gradient(90deg,#8B4513,#D4AF37);transition:width .3s}
    #loading-text{color:#FFF;margin-top:15px;font-size:14px}
  </style>
</head>
<body>
  <div id="loading">
    <div id="loading-title">造梦江湖</div>
    <div id="loading-bar-container"><div id="loading-progress"></div></div>
    <div id="loading-text">加载中... 0%</div>
  </div>
  <div id="game-container"></div>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
  <script>
'''

# 添加CONFIG
html += converted_code.get('config.ts', '') + "\n"

# 修复CONFIG中的问题
html = html.replace("ELEMENT_COUNTER: {}, any>", "ELEMENT_COUNTER: {}")

# 添加内嵌数据
html += embedded_data_code + "\n"

# 添加XMLParser
html += converted_code.get('utils/XMLParser.ts', '') + "\n"

# 添加DataManager
html += "/* ===== 数据管理器 ===== */\n" + dm_code + "\n"

# 添加其他类
for name, key in [('Character', 'entities/Character.ts'), ('Party', 'entities/Party.ts'),
                   ('WeatherSystem', 'systems/WeatherSystem.ts'), ('BattleSystem', 'systems/BattleSystem.ts'),
                   ('SaveSystem', 'systems/SaveSystem.ts'), ('UIUtils', 'ui/UIUtils.ts')]:
    if key in converted_code:
        html += f"/* ===== {name} ===== */\n" + converted_code[key] + "\n"

# 添加场景
for name, key in [('BootScene', 'scenes/BootScene.ts'), ('MenuScene', 'scenes/MenuScene.ts'),
                   ('ChapterScene', 'scenes/ChapterScene.ts'), ('DifficultyScene', 'scenes/DifficultyScene.ts'),
                   ('BoardScene', 'scenes/BoardScene.ts'), ('BattleScene', 'scenes/BattleScene.ts')]:
    if key in converted_code:
        html += f"/* ===== {name} ===== */\n" + converted_code[key] + "\n"

# 添加主入口
html += converted_code.get('main.ts', '') + "\n"

# 修复函数返回类型
html = re.sub(r'function\s+\w+\([^)]*\):\s*\{[^}]*\}\s*\{', lambda m: m.group(0).split('):')[0] + ' {', html)

# 结尾
html += '''
CONFIG.ELEMENT_COUNTER = {water:{strong:'fire',weak:'poison'},fire:{strong:'poison',weak:'water'},poison:{strong:'water',weak:'fire'}};

const gameConfig = {
  title: CONFIG.GAME_TITLE, type: Phaser.AUTO, parent: 'game-container',
  scale: {mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: CONFIG.BASE_WIDTH, height: CONFIG.BASE_HEIGHT},
  render: {antialias: true}, physics: {default: 'arcade', arcade: {debug: false}},
  backgroundColor: '#1a0a00',
  scene: [BootScene, MenuScene, ChapterScene, DifficultyScene, BoardScene, BattleScene],
  input: {touch: true, keyboard: false}
};

function setupMobile() {
  document.addEventListener('dblclick', e => e.preventDefault());
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.body.addEventListener('touchmove', e => { if (e.target === document.body) e.preventDefault(); }, {passive: false});
  setTimeout(() => window.scrollTo(0, 1), 100);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { setupMobile(); new Phaser.Game(gameConfig); });
} else {
  setupMobile(); new Phaser.Game(gameConfig);
}
console.log('造梦江湖1 H5版 初始化完成');
  </script>
</body>
</html>
'''

# 写入文件
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Generated index.html: {len(html)} bytes ({len(html)//1024}KB)")
print(f"Embedded data: {len(embedded_data_code)} bytes")

# 验证语法
import subprocess
result = subprocess.run(['node', '--check'], input=html[html.find('<script>')+8:html.rfind('</script>')].encode(), capture_output=True, text=True)
if result.returncode == 0:
    print("JS syntax: OK")
else:
    print("JS syntax error:", result.stderr[:500])
