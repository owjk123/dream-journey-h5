extends Control

# UI组件
var title_label: Label
var subtitle_label: Label
var start_button: Button
var board_panel: Panel
var dice_button: Button
var dice_label: Label
var back_button: Button

# 当前状态
var current_chapter: int = 1
var current_position: int = 0
var can_roll: bool = true

func _ready():
	print("主场景初始化开始...")
	_setup_ui()
	_setup_board()
	GameManager.state_changed.connect(_on_game_state_changed)
	print("主场景初始化完成")

func _setup_ui():
	title_label = get_node_or_null("CanvasLayer/TitleLabel")
	if title_label:
		title_label.add_theme_font_size_override("font_size", 48)
		title_label.add_theme_color_override("font_color", Color(1, 0.8, 0.2))
	
	subtitle_label = get_node_or_null("CanvasLayer/SubtitleLabel")
	if subtitle_label:
		subtitle_label.add_theme_font_size_override("font_size", 20)
		subtitle_label.add_theme_color_override("font_color", Color(0.7, 0.7, 0.7))
	
	start_button = get_node_or_null("CanvasLayer/StartButton")
	if start_button:
		start_button.add_theme_font_size_override("font_size", 24)

func _setup_board():
	board_panel = get_node_or_null("CanvasLayer/BoardPanel")
	dice_button = get_node_or_null("CanvasLayer/BoardPanel/DiceButton")
	dice_label = get_node_or_null("CanvasLayer/BoardPanel/DiceLabel")
	back_button = get_node_or_null("CanvasLayer/BoardPanel/BackButton")
	
	if board_panel:
		board_panel.visible = false
	
	if dice_button:
		dice_button.add_theme_font_size_override("font_size", 20)
	
	if dice_label:
		dice_label.add_theme_font_size_override("font_size", 36)
	
	var chapter_label = get_node_or_null("CanvasLayer/BoardPanel/ChapterLabel")
	if chapter_label:
		chapter_label.text = "第一章：丽春院"
		chapter_label.add_theme_font_size_override("font_size", 28)
		chapter_label.add_theme_color_override("font_color", Color(1, 0.9, 0.5))
	
	update_player_info()
	_create_level_grids()

func _create_level_grids():
	var grid_container = get_node_or_null("CanvasLayer/BoardPanel/GridContainer")
	if not grid_container:
		return
	
	for child in grid_container.get_children():
		child.queue_free()
	
	var levels = DataManager.get_level_data()
	var row = HBoxContainer.new()
	row.add_theme_constant_override("separation", 20)
	grid_container.add_child(row)
	
	for i in range(min(levels.size(), 4)):
		var grid_cell = _create_grid_cell(levels[i], i)
		row.add_child(grid_cell)

func _create_grid_cell(level_data: Dictionary, index: int) -> Panel:
	var cell = Panel.new()
	cell.size = Vector2(180, 100)
	
	# 使用SizeFlags
	cell.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	
	var cell_bg = ColorRect.new()
	cell_bg.color = Color(0.3, 0.25, 0.2) if index != current_position else Color(0.6, 0.5, 0.2)
	cell_bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	cell.add_child(cell_bg)
	
	var border = ColorRect.new()
	border.color = Color(1, 0.8, 0.2) if index == current_position else Color(0.5, 0.4, 0.3)
	border.set_anchors_preset(Control.PRESET_FULL_RECT)
	border.position = Vector2(2, 2)
	border.size = Vector2(-4, -4)
	cell.add_child(border)
	
	var name_label = Label.new()
	name_label.text = "第%d关: %s" % [index + 1, level_data.get("level_name", "未知")]
	name_label.position = Vector2(10, 8)
	name_label.add_theme_font_size_override("font_size", 16)
	cell.add_child(name_label)
	
	var diff_label = Label.new()
	var diff = level_data.get("difficulty", 1)
	diff_label.text = "★★" if diff >= 2 else "★"
	diff_label.position = Vector2(10, 32)
	diff_label.add_theme_font_size_override("font_size", 14)
	diff_label.add_theme_color_override("font_color", Color(1, 0.8, 0))
	cell.add_child(diff_label)
	
	var reward_label = Label.new()
	reward_label.text = "奖励: " + level_data.get("equipment", "无")
	reward_label.position = Vector2(10, 55)
	reward_label.add_theme_font_size_override("font_size", 12)
	reward_label.add_theme_color_override("font_color", Color(0.7, 0.9, 0.7))
	cell.add_child(reward_label)
	
	var enemy_label = Label.new()
	var enemies = level_data.get("enemies", [])
	var enemy_text = "敌人: " + (" ".join(enemies)) if enemies.size() > 0 else "敌人: 无"
	enemy_label.text = enemy_text
	enemy_label.position = Vector2(10, 75)
	enemy_label.add_theme_font_size_override("font_size", 11)
	enemy_label.add_theme_color_override("font_color", Color(0.9, 0.6, 0.6))
	cell.add_child(enemy_label)
	
	return cell

func update_player_info():
	var info_panel = get_node_or_null("CanvasLayer/BoardPanel/PlayerInfoPanel")
	if not info_panel:
		return
	
	var info_label = info_panel.get_node_or_null("InfoLabel")
	if not info_label:
		info_label = Label.new()
		info_label.name = "InfoLabel"
		info_label.position = Vector2(10, 10)
		info_panel.add_child(info_label)
	
	var p = GameManager.player_data
	var partners = p.get("partners", [])
	var main_char = partners[0] if partners.size() > 0 else {}
	
	var equip = p.get("equipment", {})
	var weapon = equip.get("weapon", null)
	var armor = equip.get("armor", null)
	var accessory = equip.get("accessory", null)
	
	info_label.text = """%s
等级: %d
金币: %d

装备:
- 武器: %s
- 防具: %s
- 饰品: %s""" % [
		main_char.get("name", "韦小宝"),
		main_char.get("level", 1),
		p.get("gold", 0),
		weapon.get("name", "无") if weapon else "无",
		armor.get("name", "无") if armor else "无",
		accessory.get("name", "无") if accessory else "无"
	]
	
	info_label.add_theme_font_size_override("font_size", 14)
	info_label.add_theme_color_override("font_color", Color(0.9, 0.9, 0.9))

func _on_start_button_pressed():
	print("开始游戏按钮被点击")
	if title_label:
		title_label.visible = false
	if subtitle_label:
		subtitle_label.visible = false
	if start_button:
		start_button.visible = false
	if board_panel:
		board_panel.visible = true
	
	GameManager.change_state(GameManager.GameState.BOARD)

func _on_dice_button_pressed():
	if not can_roll:
		return
	
	can_roll = false
	if dice_button:
		dice_button.disabled = true
	
	var dice_value = randi() % 6 + 1
	_animate_dice(dice_value)

func _animate_dice(value: int):
	if dice_label:
		dice_label.text = str(value)
		dice_label.add_theme_color_override("font_color", Color(1, 0.9, 0.3))
	
	await get_tree().create_timer(0.8).timeout
	_move_to_position(value)

func _move_to_position(dice_value: int):
	var max_pos = DataManager.get_level_data().size()
	var new_pos = current_position + dice_value
	
	if new_pos >= max_pos:
		new_pos = max_pos - 1
	
	current_position = new_pos
	_create_level_grids()
	
	var level_data = DataManager.get_level_data()[current_position]
	_show_level_message(level_data)
	
	await get_tree().create_timer(1.0).timeout
	_start_level_battle(level_data)

func _show_level_message(level_data: Dictionary):
	var old_msg = board_panel.get_node_or_null("MessageLabel")
	if old_msg:
		old_msg.queue_free()
	
	var msg_label = Label.new()
	msg_label.name = "MessageLabel"
	msg_label.text = level_data.get("message", "")
	msg_label.position = Vector2(350, 300)
	msg_label.size = Vector2(550, 80)
	msg_label.add_theme_font_size_override("font_size", 16)
	msg_label.add_theme_color_override("font_color", Color(1, 1, 0.8))
	msg_label.autowrap_mode = TextServer.AUTOWRAP_WORD
	board_panel.add_child(msg_label)

func _start_level_battle(level_data: Dictionary):
	GameManager.set_level_data(level_data.get("level_name"))
	
	var enemy_names = level_data.get("enemies", [])
	var has_enemies = enemy_names.size() > 0
	
	if has_enemies:
		print("进入战斗: ", enemy_names)
		get_tree().change_scene_to_file("res://scenes/battle.tscn")
	else:
		_level_completed(level_data)

func _level_completed(level_data: Dictionary):
	var result_label = Label.new()
	result_label.text = "✓ 关卡通过！\n获得: " + level_data.get("equipment", "无")
	result_label.position = Vector2(300, 250)
	result_label.size = Vector2(340, 100)
	result_label.add_theme_font_size_override("font_size", 24)
	result_label.add_theme_color_override("font_color", Color(0.2, 1, 0.2))
	result_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	result_label.name = "ResultLabel"
	board_panel.add_child(result_label)
	
	var equip_name = level_data.get("equipment", "")
	if equip_name != "":
		var equip_data = DataManager.get_equipment_by_name(equip_name)
		if equip_data.size() > 0:
			var equip_type = equip_data.get("type", "")
			GameManager.player_data["equipment"][equip_type] = equip_data
			print("获得装备: ", equip_name)
	
	await get_tree().create_timer(2.0).timeout
	
	var rl = board_panel.get_node_or_null("ResultLabel")
	if rl:
		rl.queue_free()
	
	can_roll = true
	if dice_button:
		dice_button.disabled = false
	if dice_label:
		dice_label.text = "?"
	
	if current_position < DataManager.get_level_data().size() - 1:
		current_position += 1
		_create_level_grids()
	
	GameManager.level_completed.emit(level_data.get("level_name"))

func _on_back_button_pressed():
	print("返回菜单")
	if title_label:
		title_label.visible = true
	if subtitle_label:
		subtitle_label.visible = true
	if start_button:
		start_button.visible = true
	if board_panel:
		board_panel.visible = false
	
	GameManager.change_state(GameManager.GameState.MENU)

func _on_game_state_changed(new_state: GameManager.GameState):
	print("UI收到状态变化: ", GameManager.GameState.keys()[new_state])
