// 战斗场景 - 自动回合制战斗
import Phaser from 'phaser';
import { CONFIG } from '../config';
import { DataManager } from '../data/DataManager';
import { BattleSystem } from '../systems/BattleSystem';
import { WeatherSystem } from '../systems/WeatherSystem';
import { Party } from '../entities/Party';
import { Character } from '../entities/Character';
import { UIUtils } from '../ui/UIUtils';
import type { BattleAction, BattleResult } from '../data/types';

export class BattleScene extends Phaser.Scene {
  private battleSystem!: BattleSystem;
  private weatherSystem!: WeatherSystem;
  
  // 战斗信息
  private enemyName!: string;
  private enemyLevel!: number;
  private isBoss!: boolean;
  
  // UI元素
  private battleLogTexts: Phaser.GameObjects.Text[] = [];
  private currentTurnIndicator!: Phaser.GameObjects.Text;
  private actionIndicator!: Phaser.GameObjects.Text;
  
  // 角色显示
  private playerSlots: Array<{ container: Phaser.GameObjects.Container; character: Character }> = [];
  private enemySlots: Array<{ container: Phaser.GameObjects.Container; character: Character }> = [];
  
  // 战斗状态
  private battleStarted: boolean = false;
  private battleEnded: boolean = false;
  
  constructor() {
    super({ key: 'BattleScene' });
  }
  
  init(data: any): void {
    this.enemyName = data.enemyName || '小强';
    this.enemyLevel = data.enemyLevel || 1;
    this.isBoss = data.isBoss || false;
    this.battleSystem = BattleSystem.getInstance();
    this.weatherSystem = WeatherSystem.getInstance();
  }
  
  create(): void {
    const { width, height } = this.cameras.main;
    
    // 绘制战斗背景
    this.drawBattleBackground();
    
    // 创建战斗UI
    this.createBattleUI();
    
    // 初始化战斗
    this.initBattle();
    
    // 开始战斗
    this.startBattle();
  }
  
  private drawBattleBackground(): void {
    const { width, height } = this.cameras.main;
    const graphics = this.add.graphics();
    
    // 战斗背景（深色）
    graphics.fillStyle(0x1a0a00, 1);
    graphics.fillRect(0, 0, width, height);
    
    // 添加战斗场景装饰
    // 地面
    graphics.fillStyle(0x3d2817, 1);
    graphics.fillRect(0, height - 150, width, 150);
    
    // 草地纹理
    graphics.lineStyle(1, 0x228B22, 0.2);
    for (let x = 0; x < width; x += 15) {
      graphics.lineBetween(x, height - 150, x + 5, height - 160);
    }
    
    // 背景雾气效果
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const y = 100 + Math.random() * 300;
      graphics.fillStyle(0xffffff, 0.03);
      graphics.fillCircle(x, y, 50 + Math.random() * 100);
    }
  }
  
  private createBattleUI(): void {
    const { width, height } = this.cameras.main;
    
    // 顶部信息栏
    const topBar = this.add.graphics();
    topBar.fillStyle(CONFIG.COLORS.DARK_BROWN, 0.95);
    topBar.fillRect(0, 0, width, 50);
    topBar.lineStyle(2, CONFIG.COLORS.GOLD, 1);
    topBar.lineBetween(0, 50, width, 50);
    
    // 天气信息
    const weatherText = this.add.text(20, 25, `天气: ${this.weatherSystem.getWeatherName()}`, {
      fontSize: '14px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#FFFFFF'
    });
    weatherText.setOrigin(0, 0.5);
    
    // BOSS标记
    if (this.isBoss) {
      const bossText = this.add.text(width / 2, 25, 'BOSS战', {
        fontSize: '20px',
        fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
        color: '#FF4444',
        stroke: '#000000',
        strokeThickness: 2
      });
      bossText.setOrigin(0.5);
    }
    
    // 回合指示器
    this.currentTurnIndicator = this.add.text(width - 20, 25, '', {
      fontSize: '14px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#FFD700'
    });
    this.currentTurnIndicator.setOrigin(1, 0.5);
    
    // 战斗日志区域
    const logArea = this.add.graphics();
    logArea.fillStyle(0x000000, 0.5);
    logArea.fillRoundedRect(10, height - 140, width - 20, 80, 8);
    logArea.lineStyle(1, CONFIG.COLORS.GOLD, 0.5);
    logArea.strokeRoundedRect(10, height - 140, width - 20, 80, 8);
    
    const logTitle = this.add.text(20, height - 132, '战斗日志', {
      fontSize: '12px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#D4AF37'
    });
    
    // 行动指示器
    this.actionIndicator = this.add.text(width / 2, height / 2, '', {
      fontSize: '18px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.actionIndicator.setOrigin(0.5);
    this.actionIndicator.setAlpha(0);
  }
  
  private initBattle(): void {
    const party = Party.getInstance();
    const dm = DataManager.getInstance();
    
    // 获取玩家队伍
    const players = party.getAliveMembers();
    
    // 创建敌人队伍
    const enemies: Character[] = [];
    
    if (this.isBoss) {
      // BOSS战斗
      const bossData = dm.getEnemy('鳌拜');
      if (bossData) {
        const boss = new Character('boss_1', bossData, false);
        boss.level = Math.max(1, players[0]?.level || 1);
        boss.updateStats();
        enemies.push(boss);
      }
    } else {
      // 普通战斗 - 根据等级范围创建多个敌人
      const enemyCount = Math.min(3, 1 + Math.floor(Math.random() * 2));
      
      for (let i = 0; i < enemyCount; i++) {
        const enemyData = dm.getEnemy(this.enemyName);
        if (enemyData) {
          const enemy = new Character(`enemy_${i + 1}`, enemyData, false);
          enemy.level = this.enemyLevel;
          enemy.updateStats();
          enemies.push(enemy);
        }
      }
    }
    
    // 布置角色位置
    this.layoutCharacters(players, enemies);
  }
  
  private layoutCharacters(players: Character[], enemies: Character[]): void {
    const { width, height } = this.cameras.main;
    
    // 玩家角色位置（左侧）
    const playerStartX = 60;
    const playerStartY = height - 300;
    const playerSpacing = 80;
    
    players.forEach((player, index) => {
      const y = playerStartY - index * playerSpacing;
      const container = this.createCharacterDisplay(player, playerStartX, y, true);
      this.playerSlots.push({ container, character: player });
    });
    
    // 敌人位置（右侧）
    const enemyStartX = width - 80;
    const enemyStartY = height - 300;
    const enemySpacing = 80;
    
    enemies.forEach((enemy, index) => {
      const y = enemyStartY - index * enemySpacing;
      const container = this.createCharacterDisplay(enemy, enemyStartX, y, false);
      this.enemySlots.push({ container, character: enemy });
    });
  }
  
  private createCharacterDisplay(character: Character, x: number, y: number, isPlayer: boolean): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // 角色光环
    const glow = this.add.graphics();
    glow.fillStyle(isPlayer ? CONFIG.COLORS.BLUE : CONFIG.COLORS.RED, 0.2);
    glow.fillCircle(0, 0, 40);
    container.add(glow);
    
    // 角色本体
    const body = this.add.graphics();
    const bodyColor = isPlayer ? 0x4169E1 : (this.isBoss ? 0x8B0000 : 0xDC143C);
    body.fillStyle(bodyColor, 1);
    body.fillCircle(0, 0, 30);
    body.lineStyle(2, CONFIG.COLORS.GOLD, 1);
    body.strokeCircle(0, 0, 30);
    
    // 角色图标
    const iconColor = isPlayer ? '#FFFFFF' : '#FFD700';
    const initial = character.name.charAt(0);
    container.add(body);
    
    // 名称标签
    const nameBg = this.add.graphics();
    nameBg.fillStyle(0x000000, 0.7);
    nameBg.fillRoundedRect(-35, -55, 70, 18, 4);
    container.add(nameBg);
    
    const nameText = this.add.text(0, -46, `${character.name}`, {
      fontSize: '11px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#FFFFFF'
    });
    nameText.setOrigin(0.5);
    container.add(nameText);
    
    // 等级
    const lvText = this.add.text(20, -40, `Lv${character.level}`, {
      fontSize: '9px',
      fontFamily: 'Arial',
      color: '#FFD700'
    });
    container.add(lvText);
    
    // HP条
    const hpBg = this.add.graphics();
    hpBg.fillStyle(0x333333, 1);
    hpBg.fillRoundedRect(-30, 35, 60, 8, 2);
    container.add(hpBg);
    
    const hpFill = this.add.graphics();
    container.add(hpFill);
    
    // 存储HP条引用
    container.setData('hpFill', hpFill);
    container.setData('hpBg', hpBg);
    
    // 状态图标
    const statusContainer = this.add.container(-25, 15);
    container.add(statusContainer);
    container.setData('statusContainer', statusContainer);
    
    // 入场动画
    container.setAlpha(0);
    container.setScale(0.5);
    
    const targetX = isPlayer ? -30 : 30;
    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      x: x + targetX,
      duration: 300,
      delay: isPlayer ? 100 : 200,
      ease: 'Back.easeOut'
    });
    
    return container;
  }
  
  private startBattle(): void {
    // 初始化战斗系统回调
    this.battleSystem.onTurnStart = (actor: Character) => {
      this.showTurnIndicator(actor);
    };
    
    this.battleSystem.onActionComplete = (action: BattleAction) => {
      this.showActionResult(action);
    };
    
    this.battleSystem.onBattleEnd = (result: BattleResult) => {
      this.onBattleEnd(result);
    };
    
    // 开始战斗
    this.time.delayedCall(800, () => {
      this.battleSystem.startBattle(
        this.playerSlots.map(s => s.character),
        this.enemySlots.map(s => s.character)
      );
      this.battleStarted = true;
    });
  }
  
  private showTurnIndicator(actor: Character): void {
    const text = actor.isPlayer ? '我方回合' : '敌方回合';
    const color = actor.isPlayer ? '#4169E1' : '#DC143C';
    
    this.currentTurnIndicator.setText(`${actor.name} - ${text}`);
    this.currentTurnIndicator.setColor(color);
    
    // 高亮当前行动的角色
    const slots = actor.isPlayer ? this.playerSlots : this.enemySlots;
    const slot = slots.find(s => s.character.id === actor.id);
    
    if (slot) {
      // 闪烁效果
      this.tweens.add({
        targets: slot.container,
        scale: 1.1,
        duration: 200,
        yoyo: true
      });
    }
  }
  
  private showActionResult(action: BattleAction): void {
    const dm = DataManager.getInstance();
    const actor = [...this.playerSlots, ...this.enemySlots].find(s => s.character.id === action.actorId)?.character;
    const skill = action.skillId > 0 ? dm.getSkill(action.skillId) : null;
    
    // 更新战斗日志
    let logText = actor ? actor.name : '未知';
    if (skill) {
      logText += ` 使用 ${skill.skill_name}`;
    } else {
      logText += ' 普通攻击';
    }
    
    if (action.damage > 0) {
      logText += `，造成 ${Math.floor(action.damage)} 伤害`;
      if (action.isCrit) {
        logText += ' (暴击!)';
      }
    }
    
    if (action.statusEffects.length > 0) {
      logText += `，施加 ${action.statusEffects.join('/')}`;
    }
    
    this.addBattleLog(logText);
    
    // 显示伤害数字
    if (action.hpChange < 0) {
      const targetSlot = this.enemySlots.find(s => s.character.id === action.targetIds[0]) ||
                        this.playerSlots.find(s => s.character.id === action.targetIds[0]);
      
      if (targetSlot) {
        this.showDamageNumber(targetSlot.container.x, targetSlot.container.y, Math.abs(action.hpChange), action.isCrit);
      }
    }
    
    // 更新HP条
    this.updateAllHPBars();
    
    // 更新状态图标
    this.updateAllStatusIcons();
    
    // 更新角色颜色（受伤变红）
    if (action.hpChange < 0) {
      const targetSlot = [...this.playerSlots, ...this.enemySlots].find(s => 
        action.targetIds.includes(s.character.id)
      );
      
      if (targetSlot) {
        const flash = this.add.graphics();
        flash.fillStyle(CONFIG.COLORS.RED, 0.5);
        flash.fillCircle(0, 0, 35);
        targetSlot.container.add(flash);
        
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 300,
          onComplete: () => flash.destroy()
        });
      }
    }
  }
  
  private showDamageNumber(x: number, y: number, damage: number, isCrit: boolean): void {
    const color = isCrit ? '#FF4444' : '#FFFFFF';
    const text = this.add.text(x, y - 50, `-${damage}`, {
      fontSize: isCrit ? '24px' : '18px',
      fontFamily: 'Arial',
      color: color,
      stroke: '#000000',
      strokeThickness: 2
    });
    text.setOrigin(0.5);
    
    this.tweens.add({
      targets: text,
      y: y - 100,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }
  
  private updateAllHPBars(): void {
    [...this.playerSlots, ...this.enemySlots].forEach(slot => {
      const hpFill = slot.container.getData('hpFill') as Phaser.GameObjects.Graphics;
      if (hpFill) {
        hpFill.clear();
        const ratio = Math.max(0, slot.character.hp / slot.character.maxHp);
        const fillColor = ratio > 0.5 ? CONFIG.COLORS.GREEN : (ratio > 0.25 ? CONFIG.COLORS.YELLOW : CONFIG.COLORS.RED);
        hpFill.fillStyle(fillColor, 1);
        hpFill.fillRoundedRect(-30, 35, 60 * ratio, 8, 2);
      }
      
      // 如果角色死亡，灰色化
      if (slot.character.isDead()) {
        slot.container.setAlpha(0.3);
        this.tweens.add({
          targets: slot.container,
          alpha: 0.3,
          duration: 300
        });
      }
    });
  }
  
  private updateAllStatusIcons(): void {
    [...this.playerSlots, ...this.enemySlots].forEach(slot => {
      const statusContainer = slot.container.getData('statusContainer') as Phaser.GameObjects.Container;
      if (statusContainer) {
        statusContainer.removeAll(true);
        
        let offsetX = 0;
        slot.character.statusEffects.forEach((status, index) => {
          const icon = this.add.graphics();
          UIUtils.drawStatusIcon(icon, offsetX, 0, 16, status.type);
          statusContainer.add(icon);
          offsetX += 18;
        });
      }
    });
  }
  
  private addBattleLog(text: string): void {
    const { height } = this.cameras.main;
    
    // 限制日志数量
    if (this.battleLogTexts.length >= 3) {
      const oldText = this.battleLogTexts.shift();
      if (oldText) {
        this.tweens.add({
          targets: oldText,
          alpha: 0,
          y: oldText.y + 15,
          duration: 200,
          onComplete: () => oldText.destroy()
        });
      }
    }
    
    // 添加新日志
    const logText = this.add.text(20, height - 110, text, {
      fontSize: '12px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#FFFFFF',
      wordWrap: { width: 340 }
    });
    
    // 向上移动现有日志
    this.battleLogTexts.forEach(t => {
      this.tweens.add({
        targets: t,
        y: t.y - 15,
        duration: 200
      });
    });
    
    this.battleLogTexts.push(logText);
  }
  
  private onBattleEnd(result: BattleResult): void {
    if (this.battleEnded) return;
    this.battleEnded = true;
    
    const { width, height } = this.cameras.main;
    
    // 显示战斗结果
    const resultBg = this.add.graphics();
    resultBg.fillStyle(0x000000, 0.8);
    resultBg.fillRect(0, height / 2 - 100, width, 200);
    
    const resultTitle = result.victory ? '战斗胜利!' : '战斗失败...';
    const resultColor = result.victory ? '#FFD700' : '#DC143C';
    
    const title = this.add.text(width / 2, height / 2 - 60, resultTitle, {
      fontSize: '32px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: resultColor,
      stroke: '#000000',
      strokeThickness: 3
    });
    title.setOrigin(0.5);
    
    // 奖励信息
    if (result.victory) {
      const rewards: string[] = [];
      if (result.expGained > 0) rewards.push(`经验 +${result.expGained}`);
      if (result.moneyGained > 0) rewards.push(`金币 +${result.moneyGained}`);
      if (result.soulGained > 0) rewards.push(`灵魂 +${result.soulGained}`);
      
      const rewardText = this.add.text(width / 2, height / 2 - 10, rewards.join('\n'), {
        fontSize: '16px',
        fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      });
      rewardText.setOrigin(0.5);
      
      if (result.newCharacterJoined) {
        const joinText = this.add.text(width / 2, height / 2 + 30, `${result.newCharacterJoined} 加入队伍!`, {
          fontSize: '18px',
          fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
          color: '#90EE90'
        });
        joinText.setOrigin(0.5);
      }
      
      // 分配经验
      const party = Party.getInstance();
      party.getAliveMembers().forEach(member => {
        member.addExp(result.expGained);
      });
    }
    
    // 继续按钮
    const continueBtn = this.add.graphics();
    UIUtils.drawButton(continueBtn, width / 2 - 60, height / 2 + 60, 120, 40, '继续', CONFIG.COLORS.GOLD, CONFIG.COLORS.PRIMARY);
    
    const hitArea = this.add.zone(width / 2, height / 2 + 80, 120, 40)
      .setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerdown', () => {
      this.cameras.main.fade(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        if (result.victory) {
          // 返回棋盘
          this.scene.start('BoardScene');
        } else {
          // 重新开始战斗或返回
          this.scene.start('BoardScene');
        }
      });
    });
    
    // 动画
    this.tweens.add({
      targets: [resultBg, title],
      alpha: { from: 0, to: 1 },
      duration: 300
    });
  }
  
  update(): void {
    // 持续更新HP条
    if (this.battleStarted && !this.battleEnded) {
      this.updateAllHPBars();
    }
  }
}
