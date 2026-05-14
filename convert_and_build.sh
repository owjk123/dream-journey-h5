#!/bin/bash
set -e

SRC_DIR="src"
OUT_FILE="index.html"
TEMP_DIR=$(mktemp -d)

echo "=== Step 1: 转换TypeScript为JavaScript ==="

convert_ts_to_js() {
    local input=$1
    local output=$2
    python3 - "$input" "$output" << 'PYEOF'
import sys
import re

input_file = sys.argv[1]
output_file = sys.argv[2]

with open(input_file, 'r') as f:
    content = f.read()

# 移除 import 语句
content = re.sub(r"^import\s+\{[^}]*\}\s+from\s+['\"][^'\"]+['\"];", "", content, flags=re.MULTILINE)
content = re.sub(r"^import\s+Phaser\s+from\s+['\"]phaser['\"];", "", content, flags=re.MULTILINE)
content = re.sub(r"^import\s+type\s+\{[^}]+\}\s+from\s+['\"]phaser['\"];", "", content, flags=re.MULTILINE)
content = re.sub(r"^import\s+\*\s+as\s+\w+\s+from\s+['\"]phaser['\"];", "", content, flags=re.MULTILINE)

# 移除 export 关键字
content = re.sub(r"^export\s+const\s+", "const ", content, flags=re.MULTILINE)
content = re.sub(r"^export\s+class\s+", "class ", content, flags=re.MULTILINE)
content = re.sub(r"^export\s+function\s+", "function ", content, flags=re.MULTILINE)
content = re.sub(r"^export\s+interface\s+", "// interface ", content, flags=re.MULTILINE)

# 移除类型注解
content = re.sub(r":\s*(Phaser\.[^;,\)\s]+)", "", content)
content = re.sub(r":\s*(string|number|boolean|void|any)\b", "", content)
content = re.sub(r":\s*([A-Z][a-zA-Z0-9_]*)\b", "", content)
content = re.sub(r":\s*Record<[^>]+>", "", content)
content = re.sub(r":\s*Array<[^>]+>", "", content)
content = re.sub(r":\s*Promise<[^>]+>", "", content)
content = re.sub(r":\s*\w+\[\]", "", content)
content = re.sub(r"\s+as\s+[A-Za-z0-9_<>\[\]|]+", "", content)

# 移除 interface 声明行
content = re.sub(r"^\s*interface\s+\w+[^{]*\{?\s*$", "", content, flags=re.MULTILINE)

with open(output_file, 'w') as f:
    f.write(content)
PYEOF
}

files=(
    "config.ts"
    "data/types.ts"
    "utils/XMLParser.ts"
    "data/DataManager.ts"
    "entities/Character.ts"
    "entities/Party.ts"
    "systems/WeatherSystem.ts"
    "systems/BattleSystem.ts"
    "systems/SaveSystem.ts"
    "ui/UIUtils.ts"
    "scenes/BootScene.ts"
    "scenes/MenuScene.ts"
    "scenes/ChapterScene.ts"
    "scenes/DifficultyScene.ts"
    "scenes/BoardScene.ts"
    "scenes/BattleScene.ts"
    "main.ts"
)

for f in "${files[@]}"; do
    src="$SRC_DIR/$f"
    if [ -f "$src" ]; then
        echo "  Converting: $f"
        convert_ts_to_js "$src" "$TEMP_DIR/$(basename $f .ts).js"
    else
        echo "  SKIP: $f"
    fi
done

echo ""
echo "=== Step 2: 生成内嵌数据 ==="

python3 << 'PYEOF'
import xml.etree.ElementTree as ET
import os
import json

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

lines = []
lines.append("/* ===== 内嵌游戏数据 ===== */")
lines.append("(function() {")

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
            lines.append(f"const {js_var} = {json.dumps(records, ensure_ascii=False)};")
        except Exception as e:
            lines.append(f"const {js_var} = [];")
    else:
        lines.append(f"const {js_var} = [];")

lines.append("window.GAME_DATA = {")
for i, (xml_file, js_var) in enumerate(xml_files.items()):
    comma = "," if i < len(xml_files) - 1 else ""
    lines.append(f"  {js_var}: {js_var}{comma}")
lines.append("};")
lines.append("})();")

with open("/tmp/embedded_data.js", "w") as f:
    f.write("\n".join(lines))

print(f"Generated embedded data: {len(''.join(lines))} chars")
PYEOF

echo ""
echo "=== Step 3: 生成HTML ==="

cat > "$OUT_FILE" << 'HTMLEOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>造梦江湖1 - 小宝传奇</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:100%;height:100%;overflow:hidden;background:#1a0a00;touch-action:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
    #game-container{width:100%;height:100%;display:flex;justify-content:center;align-items:center}
    #loading{position:fixed;top:0;left:0;right:0;bottom:0;background:linear-gradient(180deg,#1a0a00,#2d1810);display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:1000;font-family:'Microsoft YaHei',sans-serif}
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
HTMLEOF

# 添加config
cat "$TEMP_DIR/config.js" >> "$OUT_FILE"
echo "" >> "$OUT_FILE"

# 添加内嵌数据
cat /tmp/embedded_data.js >> "$OUT_FILE"
echo "" >> "$OUT_FILE"

# 替换DataManager
python3 << 'PYEOF2'
with open("/tmp/embedded_data.js", "r") as f:
    pass  # 数据已生成

# 创建修改后的DataManager
dm_content = '''/* ===== 数据管理器 (DataManager) - 使用内嵌数据 ===== */
class DataManager {
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
  
  constructor() {
    this.loaded = false;
  }
  
  static getInstance() {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }
  
  async loadAll() {
    if (this.loaded) return;
    this.loadFromEmbeddedData();
    this.loaded = true;
    console.log('游戏数据加载完成');
    console.log(`敌人: ${this.enemies.size}, 技能: ${this.skills.size}, 装备: ${this.equipments.size}`);
  }
  
  loadFromEmbeddedData() {
    const data = window.GAME_DATA;
    
    // 加载敌人
    (data.ENEMY_DATA || []).forEach(record => {
      this.enemies.set(record.id, record);
      this.enemiesByName.set(record.name, record);
    });
    
    // 加载技能
    (data.SKILL_DATA || []).forEach(record => {
      this.skills.set(record.id, record);
      this.skillsByName.set(record.skill_name, record);
    });
    
    // 加载装备
    (data.EQUIPMENT_DATA || []).forEach(record => {
      this.equipments.set(record.id, record);
    });
    
    // 加载天气
    (data.WEATHER_DATA || []).forEach(record => {
      this.weathers.set(record.id, record);
    });
    
    // 加载状态
    (data.STATUS_DATA || []).forEach(record => {
      this.statuses.set(record.status_name, record);
    });
    
    // 加载道具
    (data.PROP_DATA || []).forEach(record => {
      this.props.set(record.id, record);
    });
    
    // 加载升级数据
    (data.LEVEL_UP_DATA || []).forEach(record => {
      this.levelUps.set(record.id, record);
    });
    
    // 加载经验表
    (data.LEVEL_UP_EXP_DATA || []).forEach(record => {
      this.levelUpExps.set(record.lv, record);
    });
    
    // 加载战斗配置
    this.battleDispositions = data.BATTLE_DISPOSITION_DATA || [];
    
    // 加载敌人升级
    (data.LEVEL_UP_ENEMY_DATA || []).forEach(record => {
      this.levelUpEnemies.set(record.id, record);
    });
  }
  
  getEnemy(id) {
    if (typeof id === 'string') return this.enemiesByName.get(id);
    return this.enemies.get(id);
  }
  
  getSkill(id) {
    if (typeof id === 'string') return this.skillsByName.get(id);
    return this.skills.get(id);
  }
  
  getEquipment(id) {
    return this.equipments.get(id);
  }
  
  getWeather(id) {
    return this.weathers.get(id);
  }
  
  getStatus(name) {
    return this.statuses.get(name);
  }
  
  getProp(id) {
    return this.props.get(id);
  }
  
  getLevelUp(name) {
    for (let v of this.levelUps.values()) {
      if (v.name === name) return v;
    }
    return null;
  }
  
  getExpForLevel(level) {
    const expData = this.levelUpExps.get(level);
    return expData ? expData.exp : 1000 * level;
  }
  
  getBattleDisposition(levelName, difficulty) {
    return this.battleDispositions.find(d => d.level_name === levelName && d.difficulty === difficulty);
  }
  
  getEnemyNameByWeather(disposition, weatherId) {
    if (!disposition) return ['小强'];
    switch(weatherId) {
      case 2: return disposition.night_enemy_name ? disposition.night_enemy_name.split(',') : [disposition.enemy_name];
      case 3: return disposition.rain_enemy_name ? disposition.rain_enemy_name.split(',') : [disposition.enemy_name];
      case 4: return disposition.thunder_enemy_name ? disposition.thunder_enemy_name.split(',') : [disposition.enemy_name];
      case 5: return disposition.wind_enemy_name ? disposition.wind_enemy_name.split(',') : [disposition.enemy_name];
      default: return disposition.enemy_name ? disposition.enemy_name.split(',') : [disposition.enemy_name];
    }
  }
}
'''
print(dm_content)
PYEOF2

echo "" >> "$OUT_FILE"

# 添加其他文件
for f in "Character" "Party" "WeatherSystem" "BattleSystem" "SaveSystem" "UIUtils"; do
    if [ -f "$TEMP_DIR/${f}.js" ]; then
        echo "/* ===== ${f} ===== */" >> "$OUT_FILE"
        cat "$TEMP_DIR/${f}.js" >> "$OUT_FILE"
        echo "" >> "$OUT_FILE"
    fi
done

# 添加场景
for f in "BootScene" "MenuScene" "ChapterScene" "DifficultyScene" "BoardScene" "BattleScene"; do
    if [ -f "$TEMP_DIR/${f}.js" ]; then
        echo "/* ===== ${f} ===== */" >> "$OUT_FILE"
        cat "$TEMP_DIR/${f}.js" >> "$OUT_FILE"
        echo "" >> "$OUT_FILE"
    fi
done

# 添加主入口
cat >> "$OUT_FILE" << 'HTMLEOF'

/* ===== 游戏主入口 ===== */

CONFIG.ELEMENT_COUNTER = {
  water: { strong: 'fire', weak: 'poison' },
  fire: { strong: 'poison', weak: 'water' },
  poison: { strong: 'water', weak: 'fire' }
};

CONFIG.ANIMATION = {
  MOVE_STEP: 300,
  BATTLE_ACTION: 500,
  DIALOG: 300
};

const gameConfig = {
  title: CONFIG.GAME_TITLE,
  type: Phaser.AUTO,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: CONFIG.BASE_WIDTH,
    height: CONFIG.BASE_HEIGHT
  },
  render: { antialias: true, pixelArt: false },
  physics: { default: 'arcade', arcade: { debug: false } },
  backgroundColor: '#1a0a00',
  scene: [BootScene, MenuScene, ChapterScene, DifficultyScene, BoardScene, BattleScene],
  input: { touch: true, keyboard: false }
};

function setupMobile() {
  document.addEventListener('dblclick', e => e.preventDefault());
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.body.addEventListener('touchmove', e => {
    if (e.target === document.body) e.preventDefault();
  }, { passive: false });
  setTimeout(() => window.scrollTo(0, 1), 100);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupMobile();
    new Phaser.Game(gameConfig);
  });
} else {
  setupMobile();
  new Phaser.Game(gameConfig);
}
console.log('造梦江湖1 H5版 初始化完成');
  </script>
</body>
</html>
HTMLEOF

rm -rf "$TEMP_DIR"
echo ""
echo "=== 完成! ==="
ls -lh "$OUT_FILE"
