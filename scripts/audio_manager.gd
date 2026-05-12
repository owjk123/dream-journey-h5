extends Node

# 背景音乐播放器
var bgm_player: AudioStreamPlayer
# 音效播放器
var sfx_player: AudioStreamPlayer

# 音频文件路径
var audio_path = "/tmp/dream-journey-original-resources/assets-audio/"

func _ready():
	# 创建音频播放器
	bgm_player = AudioStreamPlayer.new()
	bgm_player.volume_db = -10  # 背景音乐音量
	add_child(bgm_player)
	
	sfx_player = AudioStreamPlayer.new()
	sfx_player.volume_db = -5  # 音效音量
	add_child(sfx_player)
	
	print("音频管理器初始化完成")

func play_bgm(scene_name: String):
	# 根据场景播放对应音乐
	var music_file = ""
	match scene_name:
		"menu":
			music_file = "fight.mp3"  # 使用战斗音乐作为背景
		"board":
			music_file = "fight.mp3"
		"battle":
			music_file = "fight.mp3"
	
	# 尝试加载音频
	var full_path = audio_path + music_file
	if FileAccess.file_exists(full_path):
		# 注意：Godot可能需要转换为ogg格式
		# 这里先打印信息，实际使用时需要格式转换
		print("准备播放: ", full_path)
	else:
		print("音频文件不存在: ", full_path)

func play_sfx(sfx_name: String):
	print("播放音效: ", sfx_name)
	# 后续添加音效播放逻辑

func stop_bgm():
	bgm_player.stop()

func stop_all():
	bgm_player.stop()
	sfx_player.stop()
