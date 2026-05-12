# 造梦江湖1 H5复刻版

基于 Godot 4.6.2 引擎重建的《造梦江湖1》网页游戏。

## 项目概述

本项目旨在使用 Godot 4.6.2 引擎完整还原经典Flash游戏《造梦江湖1》的游戏体验。

### 核心系统

- **棋盘系统**: 掷骰子走格子的RPG玩法
- **自动回合制战斗**: SPD决定出手顺序，AI自动选技能/目标
- **元素克制**: 火>风>雷>水>火，毒独立
- **伙伴系统**: 韦小宝必带，最多3人出战
- **装备系统**: 武器/衣着/饰品

### 第一章：丽春院

| 关卡 | 名称 | 难度 | 敌人 | 奖励 |
|------|------|------|------|------|
| 1_1 | 拯救第一步 | ★ | 小厮 | 烧火棒 |
| 1_2 | 离开丽春院 | ★ | 护院 | 平民装 |
| 1_3 | 小强是谁 | ★ | 小强 | 护身符 |
| 1_4 | BOSS战 | ★★ | 老板娘 | 英雄刀 |

## 技术栈

- **引擎**: Godot 4.6.2
- **语言**: GDScript 2.0
- **目标平台**: Web (HTML5)
- **分辨率**: 940×590

## 项目结构

```
godot_project/
├── project.godot          # 项目配置
├── export_presets.cfg     # 导出配置
├── build_web.sh          # Web构建脚本
├── scenes/
│   ├── main.tscn          # 主场景（菜单+棋盘）
│   └── battle.tscn        # 战斗场景
├── scripts/
│   ├── game_manager.gd    # 游戏状态管理
│   ├── data_manager.gd    # 游戏数据
│   ├── audio_manager.gd   # 音频管理
│   └── battle_system.gd   # 战斗系统
└── assets/                # 资源目录
```

## 构建说明

### Web版本

```bash
./build_web.sh
```

或者在Godot编辑器中:
1. 打开项目
2. 点击 Project > Export
3. 选择 Web 预设
4. 点击 Export Project

### 导出模板

需要先下载 Godot 4.6.2 的 Web 导出模板。

## 运行测试

```bash
godot --headless --script-check
```

## 原版资源

原始Flash资源来自: https://github.com/owjk123/dream-journey-original-resources

## 状态

🚧 **开发中** - 第一章丽春院基础框架已完成

- [x] 项目结构搭建
- [x] 核心游戏管理器
- [x] 数据加载系统
- [x] 主菜单界面
- [x] 棋盘系统
- [x] 骰子系统
- [x] 战斗系统框架
- [ ] 完整UI美术
- [ ] 战斗特效
- [ ] 音效系统
- [ ] 存档系统
- [ ] 后续章节

## License

MIT License
