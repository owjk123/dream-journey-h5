extends Node

# 游戏状态枚举
enum GameState { MENU, BOARD, ROLLING, MOVING, BATTLE, DIALOG, RESULT }

# 当前游戏状态
var current_state: GameState = GameState.MENU

# 玩家数据
var player_data: Dictionary = {
	"gold": 0,
	"level": 1,
	"exp": 0,
	"chapter": 1,
	"current_position": 0,
	"partners": [],
	"equipment": {
		"weapon": null,
		"armor": null,
		"accessory": null
	}
}

# 当前关卡数据
var current_level_data: Dictionary = {}

# 战斗数据
var battle_data: Dictionary = {}

# 信号
signal state_changed(new_state: GameState)
signal level_completed(level_id: String)
signal battle_finished(victory: bool)

func _ready():
	# 初始化玩家数据
	init_player_data()
	pass

func init_player_data():
	# 韦小宝 - 主角初始数据
	var wei_xiaobao = {
		"name": "韦小宝",
		"hp": 100,
		"max_hp": 100,
		"mp": 50,
		"max_mp": 50,
		"atk": 10,
		"def": 5,
		"spd": 8,
		"level": 1,
		"exp": 0,
		"element": "none",  # 混沌属性
		"skills": ["攻击", "防御"],
		"is_leader": true
	}
	player_data["partners"].append(wei_xiaobao)
	
	# 初始装备
	player_data["gold"] = 100
	print("玩家数据初始化完成")

func change_state(new_state: GameState):
	current_state = new_state
	state_changed.emit(new_state)
	print("游戏状态切换: ", GameState.keys()[new_state])

# 关卡数据
func set_level_data(level_id: String):
	var levels = DataManager.get_level_data()
	for level in levels:
		if level.get("level_name") == level_id:
			current_level_data = level
			print("加载关卡数据: ", level_id)
			return
	print("未找到关卡: ", level_id)

# 获取当前章节的格子数量
func get_chapter_grid_count(chapter: int) -> int:
	match chapter:
		1: return 4  # 第一章4个格子
		2: return 4
		3: return 4
		4: return 4
		_: return 4

# 触发战斗
func start_battle(enemies: Array):
	battle_data = {
		"enemies": enemies,
		"turn": 0,
		"turn_order": []
	}
	change_state(GameState.BATTLE)
