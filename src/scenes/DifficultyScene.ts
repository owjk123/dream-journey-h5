// 难度选择场景
import Phaser from 'phaser';
import { CONFIG } from '../config';
import { UIUtils } from '../ui/UIUtils';

export class DifficultyScene extends Phaser.Scene {
  private chapterId!: number;
  private chapterName!: string;
  private levels!: string[];
  
  constructor() {
    super({ key: 'DifficultyScene' });
  }
  
  init(data: any): void {
    this.chapterId = data.chapter?.id || 1;
    this.chapterName = data.chapter?.name || '';
    this.levels = data.chapter?.levels || [];
  }
  
  create(): void {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    
    // 绘制背景
    this.drawBackground();
    
    // 绘制标题
    this.drawHeader(centerX);
    
    // 绘制难度选项
    this.drawDifficultyOptions(centerX, height);
    
    // 返回按钮
    this.addBackButton();
  }
  
  private drawBackground(): void {
    const { width, height } = this.cameras.main;
    const graphics = this.add.graphics();
    
    // 渐变背景
    for (let y = 0; y < height; y++) {
      const ratio = y / height;
      const r = Math.floor(20 + (40 - 20) * ratio);
      const g = Math.floor(8 + (20 - 8) * ratio);
      const b = Math.floor(0 + (10 - 0) * ratio);
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
      graphics.fillRect(0, y, width, 1);
    }
  }
  
  private drawHeader(centerX: number): void {
    const graphics = this.add.graphics();
    const headerHeight = 70;
    
    graphics.fillStyle(CONFIG.COLORS.PRIMARY, 0.95);
    graphics.fillRect(0, 0, this.cameras.main.width, headerHeight);
    graphics.lineStyle(3, CONFIG.COLORS.GOLD, 1);
    graphics.lineBetween(0, headerHeight, this.cameras.main.width, headerHeight);
    
    const title = this.add.text(centerX, 35, `第${this.getChineseNumber(this.chapterId)}章 - ${this.chapterName}`, {
      fontSize: '24px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#D4AF37',
      stroke: '#5C3317',
      strokeThickness: 3
    });
    title.setOrigin(0.5);
  }
  
  private drawDifficultyOptions(centerX: number, height: number): void {
    const options = [
      { difficulty: 1, name: '简单', color: 0x228B22, desc: '适合新手玩家' },
      { difficulty: 2, name: '困难', color: 0xDC143C, desc: '更具挑战性' }
    ];
    
    const startY = 120;
    const cardWidth = 280;
    const cardHeight = 120;
    const spacing = 30;
    
    options.forEach((option, index) => {
      const y = startY + index * (cardHeight + spacing);
      
      // 卡片背景
      const card = this.add.graphics();
      card.fillStyle(option.color, 0.3);
      card.fillRoundedRect(centerX - cardWidth / 2, y, cardWidth, cardHeight, 12);
      card.lineStyle(3, option.color, 1);
      card.strokeRoundedRect(centerX - cardWidth / 2, y, cardWidth, cardHeight, 12);
      
      // 难度名称
      const name = this.add.text(centerX, y + 30, option.name, {
        fontSize: '32px',
        fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 2
      });
      name.setOrigin(0.5);
      
      // 描述
      const desc = this.add.text(centerX, y + 70, option.desc, {
        fontSize: '16px',
        fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
        color: '#CCCCCC'
      });
      desc.setOrigin(0.5);
      
      // 选择提示
      const hint = this.add.text(centerX, y + 95, '点击开始挑战', {
        fontSize: '14px',
        fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
        color: '#D4AF37'
      });
      hint.setOrigin(0.5);
      
      // 点击区域
      const hitArea = this.add.zone(centerX, y + cardHeight / 2, cardWidth, cardHeight)
        .setInteractive({ useHandCursor: true });
      
      // 动画
      this.tweens.add({
        targets: [card, name, desc, hint],
        alpha: { from: 0, to: 1 },
        y: { from: y + 20, to: y },
        duration: 300,
        delay: index * 100,
        ease: 'Back.easeOut'
      });
      
      hitArea.on('pointerover', () => {
        this.tweens.add({
          targets: [card],
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 100
        });
      });
      
      hitArea.on('pointerout', () => {
        this.tweens.add({
          targets: [card],
          scaleX: 1,
          scaleY: 1,
          duration: 100
        });
      });
      
      hitArea.on('pointerdown', () => {
        this.startLevel(option.difficulty);
      });
    });
  }
  
  private getChineseNumber(num: number): string {
    const chinese = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    if (num <= 10) return chinese[num];
    return num.toString();
  }
  
  private addBackButton(): void {
    const backBtn = this.add.graphics();
    UIUtils.drawButton(backBtn, 15, 15, 50, 40, '', CONFIG.COLORS.GOLD, CONFIG.COLORS.PRIMARY);
    
    const arrow = this.add.text(40, 35, '<', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#D4AF37'
    });
    arrow.setOrigin(0.5);
    
    const hitArea = this.add.zone(40, 35, 50, 40)
      .setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerdown', () => {
      this.cameras.main.fade(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('ChapterScene');
      });
    });
  }
  
  private startLevel(difficulty: number): void {
    // 选择第一个关卡
    const levelName = this.levels[0];
    
    this.cameras.main.fade(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('BoardScene', {
        chapter: this.chapterId,
        level: levelName,
        difficulty
      });
    });
  }
}
