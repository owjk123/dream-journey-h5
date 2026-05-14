# 造梦江湖1 H5复刻版 - 项目说明

## 项目概述

本项目是对4399经典Flash页游《造梦江湖1 小宝传奇》的H5复刻版，使用Phaser 3 + TypeScript + Vite技术栈开发。

## 技术架构

### 核心模块

1. **数据层** (`src/data/`)
   - `DataManager.ts` - 游戏数据管理器，统一管理所有XML数据
   - `types.ts` - TypeScript类型定义
   - `XMLParser.ts` - XML解析工具

2. **场景层** (`src/scenes/`)
   - `BootScene.ts` - 加载场景，数据预加载
   - `MenuScene.ts` - 主菜单
   - `ChapterScene.ts` - 章节选择
   - `DifficultyScene.ts` - 难度选择
   - `BoardScene.ts` - 棋盘走格子（核心玩法）
   - `BattleScene.ts` - 自动回合制战斗

3. **系统层** (`src/systems/`)
   - `BattleSystem.ts` - 战斗引擎
   - `WeatherSystem.ts` - 天气系统
   - `SaveSystem.ts` - 存档系统

4. **实体层** (`src/entities/`)
   - `Character.ts` - 角色类（玩家/敌人共享）
   - `Party.ts` - 队伍管理

5. **UI层** (`src/ui/`)
   - `UIUtils.ts` - 古风武侠UI绘制工具

## 核心玩法

### 1. 大富翁式走格子
- 掷骰子前进
- 踩格触发事件（战斗/宝箱/问号/BOSS）
- 天气影响移动

### 2. 自动回合制战斗
- SPD排序决定行动顺序
- AI自动选技能
- 伤害计算含属性克制
- 6种状态效果

### 3. 天气系统
- 晴天(正常)
- 黑夜(视野限制)
- 雨天(移动x2)
- 雷雨(可能被雷劈)
- 大风(随机传送)

### 4. 伙伴收服
- 击败特定敌人概率收服
- 可收服角色：小强、茅十八、双儿等

## 运行方式

### 开发模式
```bash
cd /app/data/dream-journey-h5
npm install
npm run dev
```

### 构建
```bash
npm run build
```

## 目录结构

```
dream-journey-h5/
├── index.html          # 入口HTML
├── package.json        # 项目配置
├── vite.config.ts     # Vite配置
├── tsconfig.json      # TypeScript配置
├── public/
│   └── data/
│       └── dj-data/   # 游戏数据(XML)
└── src/
    ├── main.ts        # 入口文件
    ├── config.ts      # 游戏配置
    ├── data/          # 数据层
    ├── scenes/        # 场景
    ├── systems/       # 系统
    ├── entities/      # 实体
    ├── ui/            # UI组件
    └── utils/         # 工具
```

## 游戏数据

游戏数据位于 `/app/data/dj-data/`，包含：
- `enemy.xml` - 敌人数据(108+)
- `skill.xml` - 技能数据(54+)
- `equipment.xml` - 装备数据(159+)
- `weather.xml` - 天气数据(5种)
- `prop.xml` - 道具数据
- `level_up*.xml` - 升级数据
- `battle_disposition.xml` - 关卡配置

## UI风格

采用武侠古风Q版风格：
- 暗红+金色+深棕配色
- 圆角古风按钮
- 金色描边边框
- HP/MP/EXP条带金色边框
- 角色头像圆形金色边框

## 移动端适配

- 竖屏9:16优先
- 触摸操作支持
- 响应式缩放
- 禁用缩放/双击

## 后续开发计划

1. 完善SWF资源提取
2. 添加音效支持
3. 实现更多场景交互
4. 优化战斗动画
5. 添加更多游戏内容

## 注意事项

- 所有UI用Phaser Graphics API绘制
- 不使用外部图片资源
- localStorage存档
- 移动端优先设计
