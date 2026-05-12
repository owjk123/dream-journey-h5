extends Node

# 游戏数据存储
var level_data: Array = []
var character_data: Array = []
var equipment_data: Array = []
var skill_data: Array = []
var enemy_data: Array = []

func _ready():
	load_game_data()

func load_game_data():
	# 从XML读取数据
	load_level_data_from_xml()
	load_character_data()
	load_equipment_data()
	load_enemy_data()
	print("游戏数据加载完成")

func load_level_data_from_xml():
	# 第一章丽春院关卡数据
	level_data = [
		{
			"id": 1,
			"level_name": "1_1",
			"difficulty": 1,
			"message": "拯救世界的第一步要先从走出房门开始！",
			"equipment": "烧火棒",
			"eq_rate": 1.0,
			"enemies": ["小厮"],
			"chapter": 1
		},
		{
			"id": 2,
			"level_name": "1_2",
			"difficulty": 1,
			"message": "打败了护院就可以离开丽春院了！不过楼道口好像有谁在那等着……",
			"equipment": "平民装",
			"eq_rate": 1.0,
			"enemies": ["护院"],
			"chapter": 1
		},
		{
			"id": 3,
			"level_name": "1_3",
			"difficulty": 1,
			"message": "小强到底是谁其实不重要，最主要的是在大门口还有拿着鸡毛掸子的老板娘…",
			"equipment": "护身符",
			"eq_rate": 1.0,
			"enemies": ["小强"],
			"chapter": 1
		},
		{
			"id": 4,
			"level_name": "1_4",
			"difficulty": 2,
			"message": "丽春院BOSS战",
			"equipment": "英雄刀",
			"eq_rate": 1.0,
			"enemies": ["老板娘"],
			"chapter": 1,
			"is_boss": true
		}
	]
	print("加载了 ", level_data.size(), " 个关卡")

func load_character_data():
	# 角色Buff数据
	character_data = [
		{"id": 1, "name": "战神附体", "hp_rate": 0.1, "mp_rate": 0.1, "atk_rate": 0.1, "def_rate": 0.1, "spd_rate": 0.1, "exp_rate": 0.0},
		{"id": 2, "name": "福星降临", "hp_rate": 0.0, "mp_rate": 0.0, "atk_rate": 0.0, "def_rate": 0.0, "spd_rate": 0.0, "exp_rate": 1.0},
		{"id": 3, "name": "财神归位", "hp_rate": 0.0, "mp_rate": 0.0, "atk_rate": 0.0, "def_rate": 0.0, "spd_rate": 0.0, "gold_rate": 1.0},
		{"id": 4, "name": "寿星附体", "hp_rate": 0.1, "mp_rate": 0.1, "atk_rate": 0.0, "def_rate": 0.0, "spd_rate": 0.0, "exp_rate": 0.0},
		{"id": 5, "name": "恶鬼附身", "hp_rate": -0.1, "mp_rate": -0.1, "atk_rate": 0.0, "def_rate": 0.0, "spd_rate": 0.0, "exp_rate": 0.0},
		{"id": 6, "name": "衰神附体", "hp_rate": -0.1, "mp_rate": -0.1, "atk_rate": -0.1, "def_rate": -0.1, "spd_rate": -0.1, "exp_rate": 0.0}
	]

func load_equipment_data():
	equipment_data = [
		{"id": 1, "name": "烧火棒", "type": "weapon", "atk": 5, "def": 0, "hp": 0, "quality": 1},
		{"id": 2, "name": "平民装", "type": "armor", "atk": 0, "def": 5, "hp": 10, "quality": 1},
		{"id": 3, "name": "护身符", "type": "accessory", "atk": 0, "def": 2, "hp": 5, "quality": 1},
		{"id": 4, "name": "英雄刀", "type": "weapon", "atk": 15, "def": 0, "hp": 0, "quality": 2}
	]

func load_enemy_data():
	enemy_data = [
		{"id": 1, "name": "小厮", "hp": 30, "atk": 5, "def": 2, "spd": 5, "element": "none", "exp": 10, "gold": 5},
		{"id": 2, "name": "护院", "hp": 50, "atk": 8, "def": 4, "spd": 6, "element": "none", "exp": 20, "gold": 10},
		{"id": 3, "name": "小强", "hp": 40, "atk": 6, "def": 3, "spd": 10, "element": "poison", "exp": 15, "gold": 8},
		{"id": 4, "name": "老板娘", "hp": 150, "atk": 15, "def": 10, "spd": 8, "element": "fire", "exp": 50, "gold": 30, "is_boss": true}
	]

func get_level_data() -> Array:
	return level_data

func get_level_by_name(level_name: String) -> Dictionary:
	for level in level_data:
		if level.get("level_name") == level_name:
			return level
	return {}

func get_enemy_by_name(name: String) -> Dictionary:
	for enemy in enemy_data:
		if enemy.get("name") == name:
			return enemy
	return {}

func get_equipment_by_name(name: String) -> Dictionary:
	for eq in equipment_data:
		if eq.get("name") == name:
			return eq
	return {}
