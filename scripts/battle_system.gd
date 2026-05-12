extends Node

# 战斗状态
enum BattleState { INIT, PLAYER_TURN, ENEMY_TURN, ANIMATING, RESULT }

var battle_state: BattleState = BattleState.INIT

# 战斗参与者
var player_team: Array = []  # 我方队伍
var enemy_team: Array = []   # 敌方队伍
var turn_order: Array = []   # 行动顺序
var current_turn: int = 0

# 战斗日志
var battle_log: Array = []

# 信号
signal battle_ended(victory: bool)
signal turn_changed(attacker: Dictionary)
signal damage_dealt(target: String, damage: int)
signal log_updated(message: String)

# 元素克制表: 火>风>雷>水>火, 毒独立
var element_advantage = {
	"fire": "wind",
	"wind": "thunder", 
	"thunder": "water",
	"water": "fire",
	"poison": "none",
	"none": "none"
}

func _ready():
	pass

# 初始化战斗
func init_battle(player_chars: Array, enemies: Array):
	player_team = player_chars.duplicate(true)
	enemy_team = enemies.duplicate(true)
	
	# 计算行动顺序
	calculate_turn_order()
	
	battle_log.clear()
	add_log("战斗开始！")
	battle_state = BattleState.PLAYER_TURN
	
	print("战斗初始化完成，我方: ", player_team.size(), " 敌方: ", enemy_team.size())

# 计算行动顺序（按速度SPD排序）
func calculate_turn_order():
	turn_order.clear()
	var all_units = player_team + enemy_team
	
	# 按速度降序排序
	all_units.sort_custom(func(a, b): return a.get("spd", 0) > b.get("spd", 0))
	
	turn_order = all_units
	print("行动顺序计算完成")

# 执行一回合
func execute_turn():
	if battle_state == BattleState.RESULT:
		return
	
	var attacker = turn_order[current_turn % turn_order.size()]
	var attacker_is_player = attacker in player_team
	var target_team = player_team if attacker_is_player else enemy_team
	
	# 检查是否死亡
	if attacker.get("hp", 0) <= 0:
		current_turn += 1
		return
	
	# 选择目标
	var target = select_target(attacker, target_team)
	if target == null:
		add_log(attacker.get("name") + " 没有可攻击的目标")
		current_turn += 1
		check_battle_end()
		return
	
	# 执行攻击
	execute_attack(attacker, target)
	
	turn_changed.emit(attacker)
	
	current_turn += 1
	
	# 检查战斗是否结束
	check_battle_end()

# 选择目标（随机选择存活目标）
func select_target(attacker: Dictionary, target_team: Array) -> Dictionary:
	var alive_targets = []
	for t in target_team:
		if t.get("hp", 0) > 0:
			alive_targets.append(t)
	
	if alive_targets.size() == 0:
		return null
	
	return alive_targets[randi() % alive_targets.size()]

# 执行攻击
func execute_attack(attacker: Dictionary, target: Dictionary):
	var damage = calculate_damage(attacker, target)
	
	# 应用伤害
	var new_hp = target.get("hp", 0) - damage
	target["hp"] = max(0, new_hp)
	
	add_log("%s 攻击 %s，造成 %d 点伤害！" % [attacker.get("name"), target.get("name"), damage])
	damage_dealt.emit(target.get("name"), damage)

# 计算伤害
func calculate_damage(attacker: Dictionary, target: Dictionary) -> int:
	var base_damage = attacker.get("atk", 10)
	var defense = target.get("def", 5)
	
	# 元素克制
	var element = attacker.get("element", "none")
	var target_element = target.get("element", "none")
	var advantage = element_advantage.get(element, "none")
	var elemental_modifier = 1.0 if advantage == target_element else 1.0
	# 克制时伤害增加20%
	if element_advantage.get(element) == target_element:
		elemental_modifier = 1.2
	
	# 最终伤害 = 攻击 * 元素克制 - 防御（最低为1）
	var damage = int(base_damage * elemental_modifier - defense * 0.5)
	return max(1, damage)

# 检查战斗是否结束
func check_battle_end():
	var player_alive = player_team.any(func(p): return p.get("hp", 0) > 0)
	var enemy_alive = enemy_team.any(func(e): return e.get("hp", 0) > 0)
	
	if not enemy_alive:
		battle_state = BattleState.RESULT
		add_log("胜利！")
		battle_ended.emit(true)
	elif not player_alive:
		battle_state = BattleState.RESULT
		add_log("失败...")
		battle_ended.emit(false)

# 添加战斗日志
func add_log(message: String):
	battle_log.append(message)
	log_updated.emit(message)
	print(message)

# 获取战斗结果奖励
func get_rewards() -> Dictionary:
	var total_exp = 0
	var total_gold = 0
	var dropped_equipment = null
	
	for enemy in enemy_team:
		if enemy.get("is_boss", false):
			total_exp += enemy.get("exp", 10)
			total_gold += enemy.get("gold", 10)
	
	return {
		"exp": total_exp,
		"gold": total_gold,
		"equipment": dropped_equipment
	}
