// 主菜单场景
import Phaser from 'phaser';
import { CONFIG } from '../config';
import { SaveSystem } from '../systems/SaveSystem';
import { UIUtils } from '../ui/UIUtils';

export class MenuScene extends Phaser.Scene {
  private hasSave: boolean = false;
  
  constructor() {
    super({ key: 'MenuScene' });
  }
  
  create(): void {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 检查存档
    this.hasSave = SaveSystem.getInstance().hasSave();
    
    // 绘制背景
    this.drawBackground();
    
    // 绘制标题
    this.drawTitle(centerX, 120);
    
    // 绘制主菜单
    this.drawMenu(centerX, centerY);
    
    // 绘制底部装饰
    this.drawDecorations();
  }
  
  private drawBackground(): void {
    const { width, height } = this.cameras.main;
    const graphics = this.add.graphics();
    
    // 渐变背景
    for (let y = 0; y < height; y++) {
      const ratio = y / height;
      const r = Math.floor(26 + (45 - 26) * ratio);
      const g = Math.floor(10 + (24 - 10) * ratio);
      const b = Math.floor(0 + (16 - 0) * ratio);
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
      graphics.fillRect(0, y, width, 1);
    }
    
    // 添加装饰纹理
    graphics.lineStyle(1, CONFIG.COLORS.GOLD, 0.05);
    for (let x = 0; x < width; x += 40) {
      for (let y = 0; y < height; y += 40) {
        graphics.strokeRect(x, y, 40, 40);
      }
    }
    
    // 顶部装饰条
    graphics.fillStyle(CONFIG.COLORS.PRIMARY, 0.8);
    graphics.fillRect(0, 0, width, 80);
    
    // 底部装饰条
    graphics.fillRect(0, height - 60, width, 60);
    
    // 金色分割线
    graphics.lineStyle(2, CONFIG.COLORS.GOLD, 0.5);
    graphics.strokeRect(10, 10, width - 20, height - 20);
  }
  
  private drawTitle(centerX: number, y: number): void {
    // 主标题
    const title = this.add.text(centerX, y, '造梦江湖', {
      fontSize: '48px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#D4AF37',
      stroke: '#8B4513',
      strokeThickness: 4
    });
    title.setOrigin(0.5);
    title.setShadow(2, 2, '#000000', 4);
    
    // 副标题
    const subtitle = this.add.text(centerX, y + 50, '小宝传奇', {
      fontSize: '28px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#FFD700',
      stroke: '#5C3317',
      strokeThickness: 2
    });
    subtitle.setOrigin(0.5);
    
    // 装饰线
    const graphics = this.add.graphics();
    graphics.lineStyle(2, CONFIG.COLORS.GOLD, 0.6);
    graphics.lineBetween(centerX - 120, y + 80, centerX + 120, y + 80);
    
    // 装饰点
    graphics.fillStyle(CONFIG.COLORS.GOLD, 0.8);
    graphics.fillCircle(centerX - 130, y + 80, 4);
    graphics.fillCircle(centerX + 130, y + 80, 4);
  }
  
  private drawMenu(centerX: number, centerY: number): void {
    const menuItems = [
      { text: '开始游戏', action: () => this.startGame() },
      { text: '继续游戏', action: () => this.continueGame(), disabled: !this.hasSave }
    ];
    
    const buttonWidth = 180;
    const buttonHeight = 50;
    const spacing = 70;
    const startY = centerY - 20;
    
    menuItems.forEach((item, index) => {
      const y = startY + index * spacing;
      
      // 按钮背景
      const btn = this.add.graphics();
      UIUtils.drawButton(
        btn,
        centerX - buttonWidth / 2,
        y - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        item.text,
        item.disabled ? CONFIG.COLORS.GRAY : CONFIG.COLORS.GOLD,
        CONFIG.COLORS.PRIMARY,
        item.disabled
      );
      
      // 按钮文字
      const text = this.add.text(centerX, y, item.text, {
        fontSize: '22px',
        fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
        color: item.disabled ? '#808080' : '#D4AF37'
      });
      text.setOrigin(0.5);
      
      // 添加点击区域
      const hitArea = this.add.zone(centerX, y, buttonWidth, buttonHeight)
        .setInteractive({ useHandCursor: true });
      
      if (!item.disabled) {
        hitArea.on('pointerover', () => {
          btn.clear();
          UIUtils.drawButton(
            btn,
            centerX - buttonWidth / 2,
            y - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            item.text,
            CONFIG.COLORS.GOLD,
            0xA0522D, // 加深颜色表示悬停
            false
          );
        });
        
        hitArea.on('pointerout', () => {
          btn.clear();
          UIUtils.drawButton(
            btn,
            centerX - buttonWidth / 2,
            y - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            item.text,
            CONFIG.COLORS.GOLD,
            CONFIG.COLORS.PRIMARY,
            false
          );
        });
        
        hitArea.on('pointerdown', () => {
          item.action();
        });
      }
      
      // 按钮动画
      this.tweens.add({
        targets: [btn, text],
        alpha: { from: 0, to: 1 },
        y: { from: y + 20, to: y },
        duration: 300,
        delay: index * 100,
        ease: 'Back.easeOut'
      });
    });
  }
  
  private drawDecorations(): void {
    const { width, height } = this.cameras.main;
    const graphics = this.add.graphics();
    
    // 底部版本信息
    const version = this.add.text(width / 2, height - 30, 'H5复刻版 v1.0', {
      fontSize: '14px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#8B7355'
    });
    version.setOrigin(0.5);
    
    // 角落装饰
    const cornerSize = 30;
    graphics.lineStyle(2, CONFIG.COLORS.GOLD, 0.4);
    
    // 左上角
    graphics.lineBetween(10, 90, 10, 90 + cornerSize);
    graphics.lineBetween(10, 90, 10 + cornerSize, 90);
    
    // 右上角
    graphics.lineBetween(width - 10, 90, width - 10, 90 + cornerSize);
    graphics.lineBetween(width - 10 - cornerSize, 90, width - 10, 90);
    
    // 左下角
    graphics.lineBetween(10, height - 70, 10, height - 70 - cornerSize);
    graphics.lineBetween(10, height - 70, 10 + cornerSize, height - 70);
    
    // 右下角
    graphics.lineBetween(width - 10, height - 70, width - 10, height - 70 - cornerSize);
    graphics.lineBetween(width - 10 - cornerSize, height - 70, width - 10, height - 70);
  }
  
  private startGame(): void {
    // 创建新游戏
    SaveSystem.getInstance().createNewGame();
    
    // 淡出效果
    this.cameras.main.fade(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('ChapterScene');
    });
  }
  
  private continueGame(): void {
    // 加载存档
    SaveSystem.getInstance().load();
    
    // 淡出效果
    this.cameras.main.fade(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('ChapterScene');
    });
  }
}
