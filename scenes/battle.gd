extends Control

# 战斗系统引用
var battle_system: Node

# UI组件
var battle_log: RichTextLabel
var turn_label: Label
var result_panel: Panel
var result_label: Label

# 状态
var is_battle_over: bool = false
var current_turn_count: int = 0

func _ready():
	_setup_ui()
	_init_battle()
	print("战斗场景初始化完成")

func _setup_ui():
	# 战斗日志
	battle_log = get_node_or_null("CanvasLayer/BattleLog")
	if battle_log:
		battle_log.bbcode_enabled = true
		battle_log.add_theme_color_override("default_color", Color(0.9, 0.9, 0.9))
		battle_log.clear()
	
	# 回合指示器
	turn_label = get_node_or_null("CanvasLayer/TurnLabel")
	if turn_label:
		turn_label.add_theme_font_size_override("font_size", 20)
	
	# 结果面板
	result_panel = get_node_or_null("CanvasLayer/ResultPanel")
	result_label = get_node_or_null("CanvasLayer/ResultPanel/ResultLabel")
	
	if result_panel:
		result_panel.visible = false

func _init_battle():
	# 清理旧的角色卡片
	_clear_character_cards()
	
	# 创建角色卡片
	_create_character_cards()
	
	# 创建战斗系统
	battle_system = Node.new()
	battle_system.set_script(load("res://scripts/battle_system.gd"))
	add_child(battle_system)
	
	# 连接信号
	battle_system.battle_ended.connect(_on_battle_ended)
	battle_system.log_updated.connect(_on_log_updated)
	battle_system.turn_changed.connect(_on_turn_changed)
	
	# 获取敌人
	var level_data = GameManager.current_level_data
	var enemies = []
	var enemy_names = level_data.get("enemies", [])
	for name in enemy_names:
		var enemy = DataManager.get_enemy_by_name(name)
		if enemy.size() > 0:
			enemies.append(enemy.duplicate())
	
	# 初始化战斗
	var players = GameManager.player_data.get("partners", [])
	battle_system.init_battle(players, enemies)
	
	_add_log("========== 战斗开始 ==========")
	_add_log("敌方: " + " ".join(enemy_names))
	_add_log("================================")
	
	# 延迟开始自动战斗
	await get_tree().create_timer(1.5).timeout
	_start_auto_battle()

func _clear_character_cards():
	var player_panel = get_node_or_null("CanvasLayer/PlayerPanel")
	var enemy_panel = get_node_or_null("CanvasLayer/EnemyPanel")
	
	for panel in [player_panel, enemy_panel]:
		if panel:
			for child in panel.get_children():
				if child is Panel:
					child.queue_free()

func _create_character_cards():
	var player_panel = get_node_or_null("CanvasLayer/PlayerPanel")
	var enemy_panel = get_node_or_null("CanvasLayer/EnemyPanel")
	
	if not player_panel or not enemy_panel:
		return
	
	# 获取玩家角色
	var players = GameManager.player_data.get("partners", [])
	for i in range(players.size()):
		var char_card = _create_character_card(players[i], true, i)
		char_card.position = Vector2(10, 20 + i * 110)
		player_panel.add_child(char_card)
	
	# 获取敌人
	var level_data = GameManager.current_level_data
	var enemy_names = level_data.get("enemies", [])
	for i in range(enemy_names.size()):
		var enemy_data = DataManager.get_enemy_by_name(enemy_names[i])
		if enemy_data.size() > 0:
			var char_card = _create_character_card(enemy_data, false, i)
			char_card.position = Vector2(10, 20 + i * 110)
			enemy_panel.add_child(char_card)

func _create_character_card(char_data: Dictionary, is_player: bool, index: int) -> Panel:
	var card = Panel.new()
	card.custom_minimum_size = Vector2(300, 100)
	
	# 卡片背景
	var card_bg = ColorRect.new()
	card_bg.color = Color(0.15, 0.25, 0.15, 0.9) if is_player else Color(0.25, 0.15, 0.15, 0.9)
	card_bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	card.add_child(card_bg)
	
	# 边框
	var border = ColorRect.new()
	border.color = Color(0.3, 1, 0.3, 0.5) if is_player else Color(1, 0.3, 0.3, 0.5)
	border.set_anchors_preset(Control.PRESET_FULL_RECT)
	border.size = Vector2(4, 0)
	card.add_child(border)
	
	# 名称
	var name_lbl = Label.new()
	name_lbl.text = char_data.get("name", "未知")
	name_lbl.position = Vector2(15, 8)
	name_lbl.add_theme_font_size_override("font_size", 20)
	name_lbl.add_theme_color_override("font_color", Color(1, 1, 0.5))
	card.add_child(name_lbl)
	
	# 等级
	var level_lbl = Label.new()
	level_lbl.text = "Lv.%d" % char_data.get("level", 1)
	level_lbl.position = Vector2(200, 8)
	level_lbl.add_theme_font_size_override("font_size", 14)
	level_lbl.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
	card.add_child(level_lbl)
	
	# HP条背景
	var hp_bg = ColorRect.new()
	hp_bg.color = Color(0.2, 0.1, 0.1)
	hp_bg.position = Vector2(15, 38)
	hp_bg.size = Vector2(220, 22)
	card.add_child(hp_bg)
	
	# HP条
	var hp_bar = ColorRect.new()
	hp_bar.name = "HPBar"
	hp_bar.color = Color(0.2, 0.8, 0.2)
	hp_bar.position = Vector2(15, 38)
	hp_bar.size = Vector2(220, 22)
	card.add_child(hp_bar)
	
	# HP文字
	var hp_lbl = Label.new()
	hp_lbl.name = "HPLabel"
	var max_hp = char_data.get("max_hp", char_data.get("hp", 100))
	var hp = char_data.get("hp", max_hp)
	hp_lbl.text = "%d / %d" % [hp, max_hp]
	hp_lbl.position = Vector2(15, 38)
	hp_lbl.add_theme_font_size_override("font_size", 14)
	hp_lbl.add_theme_color_override("font_color", Color.WHITE)
	card.add_child(hp_lbl)
	
	# 属性标签
	var attr_lbl = Label.new()
	var element = char_data.get("element", "none")
	var attr_text = ""
	match element:
		"fire": attr_text = "[火]"
		"water": attr_text = "[水]"
		"wind": attr_text = "[风]"
		"thunder": attr_text = "[雷]"
		"poison": attr_text = "[毒]"
		_: attr_text = "[无]"
	
	if char_data.get("is_boss", false):
		attr_text += " [BOSS]"
	
	attr_lbl.text = attr_text
	attr_lbl.position = Vector2(15, 68)
	attr_lbl.add_theme_font_size_override("font_size", 14)
	attr_lbl.add_theme_color_override("font_color", Color(0.8, 0.8, 0.8))
	card.add_child(attr_lbl)
	
	# 属性标签2 (战斗力)
	var stats_lbl = Label.new()
	stats_lbl.text = "攻:%d 防:%d 速:%d" % [
		char_data.get("atk", 10),
		char_data.get("def", 5),
		char_data.get("spd", 8)
	]
	stats_lbl.position = Vector2(120, 68)
	stats_lbl.add_theme_font_size_override("font_size", 12)
	stats_lbl.add_theme_color_override("font_color", Color(0.6, 0.6, 0.6))
	card.add_child(stats_lbl)
	
	return card

func _start_auto_battle():
	while not is_battle_over and battle_system != null:
		battle_system.execute_turn()
		await get_tree().create_timer(1.2).timeout

func _update_hp_display():
	var player_panel = get_node_or_null("CanvasLayer/PlayerPanel")
	var enemy_panel = get_node_or_null("CanvasLayer/EnemyPanel")
	
	var card_index = 0
	if player_panel:
		for card in player_panel.get_children():
			if card is Panel and card.has_node("HPBar"):
				var hp_bar = card.get_node("HPBar")
				var hp_lbl = card.get_node("HPLabel")
				var team = battle_system.player_team if battle_system else []
				if card_index < team.size():
					var unit = team[card_index]
					var max_hp = unit.get("max_hp", 100)
					var hp = unit.get("hp", max_hp)
					var ratio = clamp(float(hp) / float(max_hp), 0, 1)
					hp_bar.size.x = 220 * ratio
					hp_lbl.text = "%d / %d" % [hp, max_hp]
					# 血量低时变红
					if ratio < 0.3:
						hp_bar.color = Color(0.8, 0.2, 0.2)
					elif ratio < 0.6:
						hp_bar.color = Color(0.8, 0.6, 0.2)
					else:
						hp_bar.color = Color(0.2, 0.8, 0.2)
				card_index += 1
	
	card_index = 0
	if enemy_panel:
		for card in enemy_panel.get_children():
			if card is Panel and card.has_node("HPBar"):
				var hp_bar = card.get_node("HPBar")
				var hp_lbl = card.get_node("HPLabel")
				var team = battle_system.enemy_team if battle_system else []
				if card_index < team.size():
					var unit = team[card_index]
					var max_hp = unit.get("max_hp", 100)
					var hp = unit.get("hp", max_hp)
					var ratio = clamp(float(hp) / float(max_hp), 0, 1)
					hp_bar.size.x = 220 * ratio
					hp_lbl.text = "%d / %d" % [hp, max_hp]
					if ratio < 0.3:
						hp_bar.color = Color(0.8, 0.2, 0.2)
					elif ratio < 0.6:
						hp_bar.color = Color(0.8, 0.6, 0.2)
					else:
						hp_bar.color = Color(0.2, 0.8, 0.2)
				card_index += 1

func _add_log(message: String):
	if battle_log:
		battle_log.append_text(message + "\n")

func _on_battle_ended(victory: bool):
	is_battle_over = true
	
	if turn_label:
		turn_label.text = "战斗结束"
	
	_add_log("================================")
	_add_log("战斗结束！")
	
	if result_panel and result_label:
		result_panel.visible = true
		result_label.text = "胜利！" if victory else "失败..."
		result_label.add_theme_color_override("font_color", 
			Color(0.2, 1, 0.2) if victory else Color(1, 0.2, 0.2))
		
		if victory:
			var rewards = battle_system.get_rewards() if battle_system else {}
			var gold = rewards.get("gold", 0)
			var exp = rewards.get("exp", 0)
			
			GameManager.player_data["gold"] += gold
			
			var reward_info = Label.new()
			reward_info.text = "获得金币: %d\n获得经验: %d" % [gold, exp]
			reward_info.position = Vector2(80, 70)
			reward_info.add_theme_font_size_override("font_size", 16)
			reward_info.add_theme_color_override("font_color", Color(1, 0.9, 0.5))
			result_panel.add_child(reward_info)
			
			_add_log("获得金币: %d" % gold)
			_add_log("获得经验: %d" % exp)

func _on_log_updated(message: String):
	_add_log(message)
	_update_hp_display()

func _on_turn_changed(attacker: Dictionary):
	current_turn_count += 1
	if turn_label:
		turn_label.text = "回合: %d" % current_turn_count

func _on_continue_button_pressed():
	get_tree().change_scene_to_file("res://scenes/main.tscn")
