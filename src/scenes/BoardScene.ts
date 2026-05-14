// 棋盘走格子场景 - 核心玩法场景
import Phaser from 'phaser';
import { CONFIG } from '../config';
import { DataManager } from '../data/DataManager';
import { SaveSystem } from '../systems/SaveSystem';
import { WeatherSystem } from '../systems/WeatherSystem';
import { Party } from '../entities/Party';
import { Character } from '../entities/Character';
import { UIUtils } from '../ui/UIUtils';

export class BoardScene extends Phaser.Scene {
  // 关卡信息
  private chapterId!: number;
  private levelName!: string;
  private difficulty!: number;
  
  // 棋盘数据
  private tiles: Array<{ x: number; y: number; type: number; index: number }> = [];
  private boardGraphics!: Phaser.GameObjects.Graphics;
  
  // 玩家位置
  private playerPosition: number = 0;
  private playerSprite!: Phaser.GameObjects.Container;
  
  // 天气
  private weatherSystem!: WeatherSystem;
  
  // UI元素
  private diceValue: number = 0;
  private diceGraphics!: Phaser.GameObjects.Graphics;
  private diceText!: Phaser.GameObjects.Text;
  private diceButton!: Phaser.GameObjects.Container;
  private canRollDice: boolean = true;
  
  // HUD
  private hpBar!: Phaser.GameObjects.Graphics;
  private mpBar!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private mpText!: Phaser.GameObjects.Text;
  private weatherIcon!: Phaser.GameObjects.Graphics;
  private weatherText!: Phaser.GameObjects.Text;
  
  // 道具数量
  private props: { [id: number]: number } = {};
  
  // 金币/灵魂
  private money: number = 100;
  private soul: number = 50;
  
  // 对话框
  private dialogContainer!: Phaser.GameObjects.Container;
  
  constructor() {
    super({ key: 'BoardScene' });
  }
  
  init(data: any): void {
    this.chapterId = data.chapter || 1;
    this.levelName = data.level || '1p1';
    this.difficulty = data.difficulty || 1;
  }
  
  create(): void {
    const { width, height } = this.cameras.main;
    
    // 初始化系统
    this.weatherSystem = WeatherSystem.getInstance();
    this.weatherSystem.init();
    
    // 加载存档数据
    this.loadGameData();
    
    // 绘制背景
    this.drawBackground();
    
    // 绘制棋盘
    this.drawBoard();
    
    // 创建玩家角色
    this.createPlayer();
    
    // 创建骰子
    this.createDice();
    
    // 创建HUD
    this.createHUD();
    
    // 创建底部菜单
    this.createBottomMenu();
    
    // 初始化玩家队伍
    this.initPlayerParty();
    
    // 显示欢迎信息
    this.showWelcomeMessage();
  }
  
  private loadGameData(): void {
    const save = SaveSystem.getInstance().getSave();
    if (save) {
      this.props = save.props || {};
      this.money = save.money || 100;
      this.soul = save.soul || 50;
    }
  }
  
  private drawBackground(): void {
    const { width, height } = this.cameras.main;
    const graphics = this.add.graphics();
    
    // 根据天气设置背景
    const weatherId = this.weatherSystem.currentWeatherId;
    
    // 基础背景色
    let baseColor = { r: 34, g: 139, b: 34 }; // 草地绿
    
    switch (weatherId) {
      case 2: // 黑夜
        baseColor = { r: 20, g: 20, b: 50 };
        break;
      case 3: // 雨天
        baseColor = { r: 70, g: 130, b: 180 };
        break;
      case 4: // 雷雨
        baseColor = { r: 50, g: 50, b: 80 };
        break;
      case 5: // 大风
        baseColor = { r: 144, g: 238, b: 144 };
        break;
    }
    
    // 渐变背景
    for (let y = 0; y < height; y++) {
      const ratio = y / height;
      const r = Math.floor(baseColor.r + (100 - baseColor.r) * ratio * 0.3);
      const g = Math.floor(baseColor.g + (100 - baseColor.g) * ratio * 0.3);
      const b = Math.floor(baseColor.b + (100 - baseColor.b) * ratio * 0.3);
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
      graphics.fillRect(0, y, width, 1);
    }
    
    // 添加草地纹理
    if (weatherId !== 2) { // 非黑夜天气
      graphics.lineStyle(1, 0x228B22, 0.1);
      for (let x = 0; x < width; x += 20) {
        for (let y = 60; y < height - 120; y += 20) {
          if (Math.random() > 0.5) {
            graphics.lineBetween(x, y, x + 5, y - 8);
          }
        }
      }
    }
    
    // 添加雨滴效果（雨天/雷雨）
    if (weatherId === 3 || weatherId === 4) {
      this.createRainEffect();
    }
  }
  
  private createRainEffect(): void {
    const { width, height } = this.cameras.main;
    const graphics = this.add.graphics();
    
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const length = 10 + Math.random() * 15;
      
      graphics.lineStyle(1, 0xFFFFFF, 0.3);
      graphics.lineBetween(x, y, x - 2, y + length);
    }
  }
  
  private drawBoard(): void {
    const { width, height } = this.cameras.main;
    this.boardGraphics = this.add.graphics();
    
    // 生成棋盘路径 - 简化的蛇形路径
    const boardWidth = width - 40;
    const boardTop = 80;
    const boardBottom = height - 180;
    const boardHeight = boardBottom - boardTop;
    const tileSize = 45;
    const cols = Math.floor(boardWidth / (tileSize + 10));
    const rows = Math.ceil(20 / cols) * 2; // 约20格
    
    this.tiles = [];
    let index = 0;
    let direction = 1; // 1 = 右, -1 = 左
    
    for (let row = 0; row < Math.ceil(20 / cols) && index < 20; row++) {
      const y = boardTop + row * (tileSize + 15);
      const startX = direction === 1 ? 20 : width - 20 - tileSize;
      const endX = direction === 1 ? startX + (cols - 1) * (tileSize + 10) : startX - (cols - 1) * (tileSize + 10);
      
      for (let col = 0; col < cols && index < 20; col++) {
        const x = direction === 1 
          ? startX + col * (tileSize + 10)
          : startX - col * (tileSize + 10);
        
        // 随机格子类型
        let type = CONFIG.TILE_TYPES.NORMAL;
        if (index === 19) {
          type = CONFIG.TILE_TYPES.BOSS; // 最后一格是BOSS
        } else if (index % 5 === 0) {
          type = CONFIG.TILE_TYPES.BATTLE;
        } else if (index % 7 === 0) {
          type = CONFIG.TILE_TYPES.TREASURE;
        } else if (index % 4 === 0) {
          type = CONFIG.TILE_TYPES.QUESTION;
        }
        
        this.tiles.push({ x, y, type, index });
        
        // 绘制格子
        this.drawTile(x, y, tileSize, type, index === 19);
        
        index++;
      }
      
      direction *= -1;
    }
    
    // 绘制路径连接线
    this.boardGraphics.lineStyle(3, CONFIG.COLORS.GOLD, 0.3);
    for (let i = 0; i < this.tiles.length - 1; i++) {
      const curr = this.tiles[i];
      const next = this.tiles[i + 1];
      const currCenterX = curr.x + tileSize / 2;
      const currCenterY = curr.y + tileSize / 2;
      const nextCenterX = next.x + tileSize / 2;
      const nextCenterY = next.y + tileSize / 2;
      
      // 判断是否需要弯曲连接
      if (curr.y === next.y) {
        // 直线连接
        this.boardGraphics.lineBetween(currCenterX, currCenterY, nextCenterX, nextCenterY);
      } else {
        // 垂直连接带圆角
        const midY = (currCenterY + nextCenterY) / 2;
        this.boardGraphics.lineBetween(currCenterX, currCenterY, currCenterX, midY);
        this.boardGraphics.lineBetween(currCenterX, midY, nextCenterX, midY);
        this.boardGraphics.lineBetween(nextCenterX, midY, nextCenterX, nextCenterY);
      }
    }
  }
  
  private drawTile(x: number, y: number, size: number, type: number, isBoss: boolean): void {
    const colors: Record<number, number> = {
      [CONFIG.TILE_TYPES.NORMAL]: 0xDEB887,
      [CONFIG.TILE_TYPES.BATTLE]: 0xDC143C,
      [CONFIG.TILE_TYPES.TREASURE]: 0xFFD700,
      [CONFIG.TILE_TYPES.QUESTION]: 0x4169E1,
      [CONFIG.TILE_TYPES.GOLD]: 0xFFD700,
      [CONFIG.TILE_TYPES.BOSS]: 0x8B0000
    };
    
    const color = colors[type] || colors[CONFIG.TILE_TYPES.NORMAL];
    
    // 格子背景
    this.boardGraphics.fillStyle(color, 0.8);
    this.boardGraphics.fillRoundedRect(x, y, size, size, 6);
    
    // 金色边框
    this.boardGraphics.lineStyle(2, CONFIG.COLORS.GOLD, 1);
    this.boardGraphics.strokeRoundedRect(x, y, size, size, 6);
    
    // 格子内图标
    this.boardGraphics.fillStyle(CONFIG.COLORS.WHITE, 0.9);
    const iconX = x + size / 2;
    const iconY = y + size / 2;
    
    switch (type) {
      case CONFIG.TILE_TYPES.BATTLE:
        // 剑图标
        this.boardGraphics.lineStyle(2, CONFIG.COLORS.WHITE, 1);
        this.boardGraphics.lineBetween(iconX - 8, iconY + 8, iconX + 8, iconY - 8);
        break;
      case CONFIG.TILE_TYPES.TREASURE:
        // 箱子图标
        this.boardGraphics.fillRect(iconX - 8, iconY - 4, 16, 12);
        this.boardGraphics.lineStyle(1, CONFIG.COLORS.GOLD, 1);
        this.boardGraphics.strokeRect(iconX - 8, iconY - 4, 16, 12);
        break;
      case CONFIG.TILE_TYPES.QUESTION:
        // 问号
        const qText = this.add.text(iconX, iconY, '?', {
          fontSize: '20px',
          fontFamily: 'Arial',
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 2
        });
        qText.setOrigin(0.5);
        break;
      case CONFIG.TILE_TYPES.BOSS:
        // BOSS标记
        const bossText = this.add.text(iconX, iconY, 'BOSS', {
          fontSize: '10px',
          fontFamily: 'Arial',
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 1
        });
        bossText.setOrigin(0.5);
        break;
      default:
        // 数字
        const numText = this.add.text(iconX, iconY, `${this.tiles.length}`, {
          fontSize: '12px',
          fontFamily: 'Arial',
          color: '#5C3317'
        });
        numText.setOrigin(0.5);
    }
    
    // BOSS格子特殊效果
    if (isBoss) {
      this.boardGraphics.fillStyle(CONFIG.COLORS.RED, 0.3);
      this.boardGraphics.fillCircle(x + size / 2, y + size / 2, size * 0.8);
    }
  }
  
  private createPlayer(): void {
    const { width } = this.cameras.main;
    
    // 从队伍获取玩家
    const party = Party.getInstance();
    const player = party.leader;
    
    if (!player || this.tiles.length === 0) return;
    
    const startTile = this.tiles[0];
    const tileSize = 45;
    
    // 玩家容器
    this.playerSprite = this.add.container(startTile.x + tileSize / 2, startTile.y + tileSize / 2);
    
    // 玩家光环
    const glow = this.add.graphics();
    glow.fillStyle(CONFIG.COLORS.GOLD, 0.3);
    glow.fillCircle(0, 0, 22);
    
    // 玩家本体（简化表示）
    const body = this.add.graphics();
    body.fillStyle(0x87CEEB, 1); // 天蓝色代表主角
    body.fillCircle(0, 0, 16);
    body.lineStyle(2, CONFIG.COLORS.GOLD, 1);
    body.strokeCircle(0, 0, 16);
    
    // 玩家名称
    const nameText = this.add.text(0, -28, player.name, {
      fontSize: '12px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 1
    });
    nameText.setOrigin(0.5);
    
    // 玩家等级
    const lvText = this.add.text(12, -12, `Lv${player.level}`, {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 1
    });
    lvText.setOrigin(0.5);
    
    this.playerSprite.add([glow, body, nameText, lvText]);
    
    // 添加浮动动画
    this.tweens.add({
      targets: this.playerSprite,
      y: this.playerSprite.y - 5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  private createDice(): void {
    const { width, height } = this.cameras.main;
    const diceX = width / 2;
    const diceY = height - 100;
    const diceSize = 60;
    
    // 骰子容器
    this.diceButton = this.add.container(diceX, diceY);
    
    // 骰子背景
    this.diceGraphics = this.add.graphics();
    UIUtils.drawDice(this.diceGraphics, 0, 0, diceSize, 1, false);
    this.diceButton.add(this.diceGraphics);
    
    // 骰子文字
    this.diceText = this.add.text(0, 0, '?', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#8B4513',
      fontStyle: 'bold'
    });
    this.diceText.setOrigin(0.5);
    this.diceButton.add(this.diceText);
    
    // 点击区域
    const hitArea = this.add.zone(diceX, diceY, diceSize + 20, diceSize + 20)
      .setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerdown', () => {
      if (this.canRollDice) {
        this.rollDice();
      }
    });
    
    // 提示文字
    const hintText = this.add.text(diceX, diceY + 45, '点击投掷骰子', {
      fontSize: '14px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#D4AF37'
    });
    hintText.setOrigin(0.5);
  }
  
  private rollDice(): void {
    if (!this.canRollDice) return;
    this.canRollDice = false;
    
    // 随机1-6
    this.diceValue = Math.floor(Math.random() * 6) + 1;
    
    // 雨天移动×2
    if (this.weatherSystem.currentWeatherId === 3 || this.weatherSystem.currentWeatherId === 4) {
      // 显示天气提示
      this.showMessage('雨天效果：骰子点数 x2！', 0x4169E1);
    }
    
    // 骰子动画
    let rollCount = 0;
    const rollInterval = this.time.addEvent({
      delay: 80,
      callback: () => {
        const tempValue = Math.floor(Math.random() * 6) + 1;
        this.diceGraphics.clear();
        UIUtils.drawDice(this.diceGraphics, 0, 0, 60, tempValue, true);
        this.diceText.setText(tempValue.toString());
        
        rollCount++;
        if (rollCount >= 10) {
          rollInterval.remove();
          // 显示最终结果
          this.diceGraphics.clear();
          UIUtils.drawDice(this.diceGraphics, 0, 0, 60, this.diceValue, false);
          this.diceText.setText(this.diceValue.toString());
          
          // 移动玩家
          this.movePlayer();
        }
      },
      repeat: 10
    });
  }
  
  private movePlayer(): void {
    // 计算实际移动步数
    let moveSteps = this.diceValue;
    if (this.weatherSystem.currentWeatherId === 3 || this.weatherSystem.currentWeatherId === 4) {
      moveSteps *= 2;
    }
    
    const targetPosition = Math.min(this.playerPosition + moveSteps, this.tiles.length - 1);
    const tileSize = 45;
    
    // 逐步移动动画
    const moveStep = () => {
      if (this.playerPosition >= targetPosition) {
        // 到达目标，执行格子事件
        this.onTileEvent();
        return;
      }
      
      this.playerPosition++;
      const targetTile = this.tiles[this.playerPosition];
      
      this.tweens.add({
        targets: this.playerSprite,
        x: targetTile.x + tileSize / 2,
        y: targetTile.y + tileSize / 2,
        duration: CONFIG.ANIMATION.MOVE_STEP,
        ease: 'Sine.easeInOut',
        onComplete: moveStep
      });
    };
    
    moveStep();
  }
  
  private onTileEvent(): void {
    if (this.tiles.length === 0) return;
    
    const currentTile = this.tiles[this.playerPosition];
    const tileSize = 45;
    
    switch (currentTile.type) {
      case CONFIG.TILE_TYPES.BATTLE:
        this.triggerBattle();
        break;
      case CONFIG.TILE_TYPES.TREASURE:
        this.openTreasure();
        break;
      case CONFIG.TILE_TYPES.QUESTION:
        this.triggerQuestion();
        break;
      case CONFIG.TILE_TYPES.BOSS:
        this.triggerBossBattle();
        break;
      default:
        this.showMessage('平安无事，继续前进！', 0x228B22);
        this.canRollDice = true;
    }
  }
  
  private triggerBattle(): void {
    const party = Party.getInstance();
    const leader = party.leader;
    
    if (!leader) return;
    
    // 获取关卡敌人配置
    const dm = DataManager.getInstance();
    const disposition = dm.getBattleDisposition(this.levelName, this.difficulty);
    
    if (!disposition) {
      this.showMessage('战斗配置错误', 0xDC143C);
      this.canRollDice = true;
      return;
    }
    
    // 根据天气获取敌人
    const enemyNames = dm.getEnemyNameByWeather(disposition, this.weatherSystem.currentWeatherId);
    const enemyName = enemyNames[Math.floor(Math.random() * enemyNames.length)];
    const enemyData = dm.getEnemy(enemyName);
    
    if (!enemyData) {
      this.showMessage('未找到敌人数据', 0xDC143C);
      this.canRollDice = true;
      return;
    }
    
    // 随机敌人等级
    const enemyLevel = Phaser.Math.Between(disposition.lowest_grade, disposition.highest_grade);
    
    this.showMessage(`遭遇 ${enemyData.name} Lv.${enemyLevel}！`, 0xDC143C, () => {
      this.time.delayedCall(1000, () => {
        this.scene.start('BattleScene', {
          enemyName,
          enemyLevel,
          fromBoard: true
        });
      });
    });
  }
  
  private triggerBossBattle(): void {
    this.showMessage('BOSS关卡！准备战斗！', 0x8B0000, () => {
      this.time.delayedCall(1000, () => {
        this.scene.start('BattleScene', {
          isBoss: true,
          levelName: this.levelName,
          difficulty: this.difficulty,
          fromBoard: true
        });
      });
    });
  }
  
  private openTreasure(): void {
    // 随机奖励
    const rewards = [
      { type: 'money', amount: 50 + Math.floor(Math.random() * 100), message: '获得金币！' },
      { type: 'soul', amount: 10 + Math.floor(Math.random() * 20), message: '获得灵魂！' },
      { type: 'prop', item: 1, amount: 1, message: '获得骰子！' },
      { type: 'prop', item: 2, amount: 1, message: '获得满汉全席！' }
    ];
    
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    
    switch (reward.type) {
      case 'money':
        this.money += reward.amount;
        this.showMessage(`${reward.message} +${reward.amount}`, 0xFFD700);
        break;
      case 'soul':
        this.soul += reward.amount;
        this.showMessage(`${reward.message} +${reward.amount}`, 0x9932CC);
        break;
      case 'prop':
        if (reward.item !== undefined) {
          this.props[reward.item] = (this.props[reward.item] || 0) + (reward.amount || 1);
        }
        this.showMessage(`${reward.message}`, 0x4169E1);
        break;
    }
    
    this.time.delayedCall(1500, () => {
      this.canRollDice = true;
    });
  }
  
  private triggerQuestion(): void {
    // 问号格子事件
    const events = [
      { message: '好运气！敌人变弱了！', effect: 'debuff' },
      { message: '坏运气！敌人变强了！', effect: 'buff' },
      { message: '随机传送！', effect: 'teleport' },
      { message: '回复生命！', effect: 'heal' }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    this.showMessage(event.message, 0x4169E1);
    
    switch (event.effect) {
      case 'heal':
        Party.getInstance().healAll(0.3);
        this.showMessage('生命恢复30%！', 0x228B22);
        break;
      case 'teleport':
        this.playerPosition = Math.floor(Math.random() * (this.playerPosition - 3));
        if (this.playerPosition < 0) this.playerPosition = 0;
        const tileSize = 45;
        const targetTile = this.tiles[this.playerPosition];
        this.playerSprite.setPosition(targetTile.x + tileSize / 2, targetTile.y + tileSize / 2);
        this.showMessage(`传送到第${this.playerPosition + 1}格`, 0x4169E1);
        break;
    }
    
    this.time.delayedCall(1500, () => {
      this.canRollDice = true;
    });
  }
  
  private showWelcomeMessage(): void {
    const weatherName = this.weatherSystem.getWeatherName();
    this.showMessage(`${CONFIG.CHAPTERS[this.chapterId - 1]?.name || ''} - ${this.levelName}\n天气：${weatherName}`, 0xD4AF37);
  }
  
  private showMessage(text: string, color: number, callback?: () => void): void {
    const { width, height } = this.cameras.main;
    
    // 半透明遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.5);
    overlay.fillRect(0, height / 2 - 60, width, 120);
    
    // 消息背景
    const msgBg = this.add.graphics();
    UIUtils.drawScrollBackground(msgBg, width / 2 - 140, height / 2 - 50, 280, 100, CONFIG.COLORS.DARK_BROWN);
    
    // 消息文字
    const msgText = this.add.text(width / 2, height / 2, text, {
      fontSize: '16px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#' + color.toString(16).padStart(6, '0'),
      align: 'center',
      lineSpacing: 8
    });
    msgText.setOrigin(0.5);
    
    // 淡入动画
    this.tweens.add({
      targets: [overlay, msgBg, msgText],
      alpha: { from: 0, to: 1 },
      duration: 200
    });
    
    // 自动消失
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: [overlay, msgBg, msgText],
        alpha: 0,
        duration: 200,
        onComplete: () => {
          overlay.destroy();
          msgBg.destroy();
          msgText.destroy();
          if (callback) callback();
        }
      });
    });
  }
  
  private createHUD(): void {
    const { width } = this.cameras.main;
    const party = Party.getInstance();
    const player = party.leader;
    
    if (!player) return;
    
    // HUD背景
    const hudBg = this.add.graphics();
    hudBg.fillStyle(CONFIG.COLORS.DARK_BROWN, 0.9);
    hudBg.fillRoundedRect(10, 10, 160, 55, 8);
    hudBg.lineStyle(2, CONFIG.COLORS.GOLD, 0.8);
    hudBg.strokeRoundedRect(10, 10, 160, 55, 8);
    
    // 角色名称和等级
    const nameText = this.add.text(20, 18, `${player.name} Lv.${player.level}`, {
      fontSize: '14px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#FFD700'
    });
    
    // HP条
    this.hpBar = this.add.graphics();
    UIUtils.drawProgressBar(this.hpBar, 20, 40, 140, 10, player.hp, player.maxHp, CONFIG.COLORS.RED);
    this.hpText = this.add.text(90, 40, `${player.hp}/${player.maxHp}`, {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    });
    this.hpText.setOrigin(0.5);
    
    // MP条
    this.mpBar = this.add.graphics();
    UIUtils.drawProgressBar(this.mpBar, 20, 54, 140, 8, player.mp, player.maxMp, CONFIG.COLORS.BLUE);
    this.mpText = this.add.text(90, 54, `${player.mp}/${player.maxMp}`, {
      fontSize: '8px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    });
    this.mpText.setOrigin(0.5);
    
    // 天气显示（右上角）
    const weatherX = width - 60;
    const weatherY = 40;
    
    this.weatherIcon = this.add.graphics();
    UIUtils.drawWeatherIcon(this.weatherIcon, weatherX, weatherY, 36, this.weatherSystem.currentWeatherId);
    
    this.weatherText = this.add.text(weatherX, weatherY + 25, this.weatherSystem.getWeatherName(), {
      fontSize: '12px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#FFFFFF'
    });
    this.weatherText.setOrigin(0.5);
    
    // 资源显示（右上角下方）
    const moneyText = this.add.text(width - 20, 90, `金币: ${this.money}`, {
      fontSize: '14px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#FFD700'
    });
    moneyText.setOrigin(1, 0);
    
    const soulText = this.add.text(width - 20, 108, `灵魂: ${this.soul}`, {
      fontSize: '14px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#9932CC'
    });
    soulText.setOrigin(1, 0);
    
    // 道具显示
    const diceCount = this.props[1] || 0;
    const diceCountText = this.add.text(width - 20, 126, `骰子: ${diceCount}`, {
      fontSize: '12px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#FFFFFF'
    });
    diceCountText.setOrigin(1, 0);
  }
  
  private createBottomMenu(): void {
    const { width, height } = this.cameras.main;
    
    // 底部菜单背景
    const menuBg = this.add.graphics();
    menuBg.fillStyle(CONFIG.COLORS.PRIMARY, 0.9);
    menuBg.fillRect(0, height - 60, width, 60);
    menuBg.lineStyle(2, CONFIG.COLORS.GOLD, 1);
    menuBg.lineBetween(0, height - 60, width, height - 60);
    
    // 菜单按钮
    const buttons = [
      { text: '队伍', x: width * 0.25 },
      { text: '道具', x: width * 0.5 },
      { text: '菜单', x: width * 0.75 }
    ];
    
    buttons.forEach(btn => {
      const hitArea = this.add.zone(btn.x, height - 30, 80, 40)
        .setInteractive({ useHandCursor: true });
      
      const text = this.add.text(btn.x, height - 30, btn.text, {
        fontSize: '16px',
        fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
        color: '#D4AF37'
      });
      text.setOrigin(0.5);
      
      hitArea.on('pointerdown', () => {
        switch (btn.text) {
          case '队伍':
            this.showTeamMenu();
            break;
          case '道具':
            this.showPropsMenu();
            break;
          case '菜单':
            this.showMainMenu();
            break;
        }
      });
    });
  }
  
  private showTeamMenu(): void {
    const { width, height } = this.cameras.main;
    
    // 队伍面板
    const panel = this.add.graphics();
    UIUtils.drawScrollBackground(panel, width / 2 - 150, height / 2 - 150, 300, 300, CONFIG.COLORS.DARK_BROWN);
    
    const title = this.add.text(width / 2, height / 2 - 130, '队伍信息', {
      fontSize: '20px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#FFD700'
    });
    title.setOrigin(0.5);
    
    const party = Party.getInstance();
    party.getAllMembers().forEach((member, index) => {
      const y = height / 2 - 80 + index * 60;
      
      const memberText = this.add.text(width / 2 - 120, y, `${member.name} Lv.${member.level}`, {
        fontSize: '16px',
        fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
        color: '#FFFFFF'
      });
      
      const statusText = this.add.text(width / 2 - 120, y + 20, `HP: ${member.hp}/${member.maxHp}`, {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#90EE90'
      });
    });
    
    // 关闭按钮
    this.addCloseButton(width / 2, height / 2 + 120);
  }
  
  private showPropsMenu(): void {
    const { width, height } = this.cameras.main;
    
    const panel = this.add.graphics();
    UIUtils.drawScrollBackground(panel, width / 2 - 120, height / 2 - 120, 240, 240, CONFIG.COLORS.DARK_BROWN);
    
    const title = this.add.text(width / 2, height / 2 - 100, '道具', {
      fontSize: '20px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#FFD700'
    });
    title.setOrigin(0.5);
    
    // 显示道具
    const propNames: Record<number, string> = {
      1: '如意骰子',
      2: '满汉全席',
      3: '雪山人参'
    };
    
    let y = height / 2 - 60;
    for (const [id, count] of Object.entries(this.props)) {
      if (count > 0) {
        const propText = this.add.text(width / 2 - 100, y, `${propNames[parseInt(id)] || `道具${id}`}: ${count}`, {
          fontSize: '14px',
          fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
          color: '#FFFFFF'
        });
        y += 25;
      }
    }
    
    if (y === height / 2 - 60) {
      const emptyText = this.add.text(width / 2, y + 20, '暂无道具', {
        fontSize: '14px',
        fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
        color: '#808080'
      });
      emptyText.setOrigin(0.5);
    }
    
    this.addCloseButton(width / 2, height / 2 + 90);
  }
  
  private showMainMenu(): void {
    const { width, height } = this.cameras.main;
    
    // 确认对话框
    const dialog = this.add.graphics();
    UIUtils.drawDialogBox(dialog, width / 2 - 120, height / 2 - 80, 240, 160, '游戏菜单');
    
    const saveBtn = this.add.text(width / 2, height / 2 - 20, '保存游戏', {
      fontSize: '16px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#D4AF37'
    });
    saveBtn.setOrigin(0.5);
    saveBtn.setInteractive({ useHandCursor: true });
    saveBtn.on('pointerdown', () => {
      this.saveGame();
      this.showMessage('游戏已保存！', 0x228B22);
      this.scene.restart();
    });
    
    const quitBtn = this.add.text(width / 2, height / 2 + 20, '返回主菜单', {
      fontSize: '16px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#D4AF37'
    });
    quitBtn.setOrigin(0.5);
    quitBtn.setInteractive({ useHandCursor: true });
    quitBtn.on('pointerdown', () => {
      this.cameras.main.fade(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
    
    this.addCloseButton(width / 2, height / 2 + 55);
  }
  
  private addCloseButton(x: number, y: number): void {
    const closeBtn = this.add.graphics();
    UIUtils.drawButton(closeBtn, x - 30, y - 15, 60, 30, '关闭', CONFIG.COLORS.GOLD, CONFIG.COLORS.PRIMARY);
    
    const hitArea = this.add.zone(x, y, 60, 30)
      .setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerdown', () => {
      this.scene.restart();
    });
  }
  
  private saveGame(): void {
    const party = Party.getInstance();
    SaveSystem.getInstance().save(
      this.chapterId,
      this.levelName,
      this.difficulty,
      this.money,
      this.soul,
      this.props,
      this.weatherSystem.currentWeatherId
    );
  }
  
  private initPlayerParty(): void {
    const party = Party.getInstance();
    
    // 如果队伍为空，创建主角
    if (party.getAllMembers().length === 0) {
      const dm = DataManager.getInstance();
      const playerData = dm.getEnemy('韦小宝');
      
      if (playerData) {
        const player = new Character('player_1', playerData, true);
        player.level = 1;
        player.updateStats();
        party.addMember(player);
      }
    }
  }
  
  update(): void {
    // 更新HUD
    const party = Party.getInstance();
    const player = party.leader;
    
    if (player) {
      this.hpBar.clear();
      UIUtils.drawProgressBar(this.hpBar, 20, 40, 140, 10, player.hp, player.maxHp, CONFIG.COLORS.RED);
      this.hpText.setText(`${player.hp}/${player.maxHp}`);
      
      this.mpBar.clear();
      UIUtils.drawProgressBar(this.mpBar, 20, 54, 140, 8, player.mp, player.maxMp, CONFIG.COLORS.BLUE);
      this.mpText.setText(`${player.mp}/${player.maxMp}`);
    }
  }
}
