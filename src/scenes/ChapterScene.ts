// 章节选择场景
import Phaser from 'phaser';
import { CONFIG } from '../config';
import { SaveSystem } from '../systems/SaveSystem';
import { UIUtils } from '../ui/UIUtils';

interface ChapterInfo {
  id: number;
  name: string;
  levels: string[];
  unlocked: boolean;
  completedLevels: number;
}

export class ChapterScene extends Phaser.Scene {
  private chapters: ChapterInfo[] = [];
  private currentChapter: number = 1;
  private scrollY: number = 0;
  private container!: Phaser.GameObjects.Container;
  
  constructor() {
    super({ key: 'ChapterScene' });
  }
  
  create(): void {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    
    // 加载章节信息
    this.loadChapterInfo();
    
    // 绘制背景
    this.drawBackground();
    
    // 绘制标题栏
    this.drawHeader(centerX);
    
    // 绘制章节列表
    this.drawChapterList(centerX);
    
    // 绘制底部栏
    this.drawFooter(centerX, height);
    
    // 添加返回按钮
    this.addBackButton();
  }
  
  private loadChapterInfo(): void {
    const save = SaveSystem.getInstance().getSave();
    const currentLevel = save?.currentLevel || '1p1';
    const playCount = save?.playCount || 0;
    
    // 解析当前进度
    const levelMatch = currentLevel.match(/(\d)p(\d)/);
    if (levelMatch) {
      this.currentChapter = parseInt(levelMatch[1]);
    }
    
    // 构建章节信息
    CONFIG.CHAPTERS.forEach((chapter, index) => {
      const chapterInfo: ChapterInfo = {
        id: chapter.id,
        name: chapter.name,
        levels: chapter.levels,
        unlocked: index < this.currentChapter || playCount === 0,
        completedLevels: index < this.currentChapter - 1 ? chapter.levels.length : 
                         (index === this.currentChapter - 1 ? this.getCompletedLevelsInChapter(currentLevel) : 0)
      };
      this.chapters.push(chapterInfo);
    });
  }
  
  private getCompletedLevelsInChapter(currentLevel: string): number {
    const levelMatch = currentLevel.match(/(\d)p(\d)/);
    if (!levelMatch) return 0;
    
    const chapter = parseInt(levelMatch[1]);
    const level = parseInt(levelMatch[2]);
    
    // 第一章第一关未完成时为0
    if (chapter === 1 && level === 1 && this.currentChapter === 1) {
      return 0;
    }
    
    // 当前章完成的关卡数
    return Math.min(level - 1, CONFIG.CHAPTERS[chapter - 1].levels.length);
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
    
    // 标题栏背景
    graphics.fillStyle(CONFIG.COLORS.PRIMARY, 0.95);
    graphics.fillRect(0, 0, this.cameras.main.width, headerHeight);
    
    // 金色底边
    graphics.lineStyle(3, CONFIG.COLORS.GOLD, 1);
    graphics.lineBetween(0, headerHeight, this.cameras.main.width, headerHeight);
    
    // 标题文字
    const title = this.add.text(centerX, 35, '选择关卡', {
      fontSize: '28px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#D4AF37',
      stroke: '#5C3317',
      strokeThickness: 3
    });
    title.setOrigin(0.5);
  }
  
  private drawChapterList(centerX: number): void {
    const startY = 100;
    const cardHeight = 160;
    const spacing = 20;
    
    // 创建容器用于滚动
    this.container = this.add.container(0, startY);
    
    this.chapters.forEach((chapter, index) => {
      const y = index * (cardHeight + spacing);
      const card = this.createChapterCard(centerX, y, chapter);
      this.container.add(card);
    });
    
    // 计算总高度
    const totalHeight = this.chapters.length * (cardHeight + spacing);
    
    // 添加滚动（如果内容超出）
    if (totalHeight > this.cameras.main.height - startY - 100) {
      this.input.on('wheel', (_pointer: any, _gameObjects: any, _deltaX: any, deltaY: number) => {
        this.scrollY += deltaY * 0.5;
        this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, Math.max(0, totalHeight - (this.cameras.main.height - startY - 100)));
        this.container.setY(startY - this.scrollY);
      });
    }
  }
  
  private createChapterCard(centerX: number, y: number, chapter: ChapterInfo): Phaser.GameObjects.Container {
    const container = this.add.container(centerX, y);
    const cardWidth = 320;
    const cardHeight = 150;
    
    // 卡片背景
    const bg = this.add.graphics();
    const bgColor = chapter.unlocked ? CONFIG.COLORS.PRIMARY : 0x3a3a3a;
    bg.fillStyle(bgColor, chapter.unlocked ? 0.9 : 0.5);
    bg.fillRoundedRect(-cardWidth / 2, 0, cardWidth, cardHeight, 12);
    bg.lineStyle(2, chapter.unlocked ? CONFIG.COLORS.GOLD : CONFIG.COLORS.GRAY, 1);
    bg.strokeRoundedRect(-cardWidth / 2, 0, cardWidth, cardHeight, 12);
    container.add(bg);
    
    // 章节标题
    const chapterTitle = this.add.text(-cardWidth / 2 + 20, 15, `第${this.getChineseNumber(chapter.id)}章`, {
      fontSize: '20px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: chapter.unlocked ? '#FFD700' : '#808080'
    });
    container.add(chapterTitle);
    
    // 章节名称
    const chapterName = this.add.text(-cardWidth / 2 + 100, 15, chapter.name, {
      fontSize: '20px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: chapter.unlocked ? '#FFFFFF' : '#606060'
    });
    container.add(chapterName);
    
    // 关卡进度
    const progressText = this.add.text(cardWidth / 2 - 20, 15, `${chapter.completedLevels}/${chapter.levels.length}`, {
      fontSize: '16px',
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: chapter.unlocked ? '#90EE90' : '#606060'
    });
    progressText.setOrigin(1, 0);
    container.add(progressText);
    
    // 关卡节点
    this.drawLevelNodes(container, -cardWidth / 2 + 20, 70, chapter, cardWidth - 40);
    
    // 锁定图标
    if (!chapter.unlocked) {
      const lock = this.add.text(0, cardHeight / 2, 'LOCKED', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#808080'
      });
      lock.setOrigin(0.5);
      container.add(lock);
    }
    
    // 点击事件
    if (chapter.unlocked) {
      const hitArea = this.add.zone(0, cardHeight / 2, cardWidth, cardHeight)
        .setInteractive({ useHandCursor: true });
      container.add(hitArea);
      
      hitArea.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(CONFIG.COLORS.PRIMARY, 1);
        bg.fillRoundedRect(-cardWidth / 2, 0, cardWidth, cardHeight, 12);
        bg.lineStyle(3, CONFIG.COLORS.GOLD, 1);
        bg.strokeRoundedRect(-cardWidth / 2, 0, cardWidth, cardHeight, 12);
      });
      
      hitArea.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(CONFIG.COLORS.PRIMARY, 0.9);
        bg.fillRoundedRect(-cardWidth / 2, 0, cardWidth, cardHeight, 12);
        bg.lineStyle(2, CONFIG.COLORS.GOLD, 1);
        bg.strokeRoundedRect(-cardWidth / 2, 0, cardWidth, cardHeight, 12);
      });
      
      hitArea.on('pointerdown', () => {
        this.selectChapter(chapter);
      });
    }
    
    return container;
  }
  
  private drawLevelNodes(container: Phaser.GameObjects.Container, startX: number, y: number, chapter: ChapterInfo, totalWidth: number): void {
    const nodeRadius = 18;
    const spacing = totalWidth / (chapter.levels.length + 1);
    
    chapter.levels.forEach((level, index) => {
      const x = startX + spacing * (index + 1);
      const isCompleted = index < chapter.completedLevels;
      const isBoss = level.includes('4') || level === chapter.levels[chapter.levels.length - 1];
      
      // 连接线
      if (index > 0) {
        const prevX = startX + spacing * index;
        const graphics = this.add.graphics();
        graphics.lineStyle(3, isCompleted ? CONFIG.COLORS.GOLD : CONFIG.COLORS.GRAY, 0.6);
        graphics.lineBetween(prevX, y, x - nodeRadius - 5, y);
        container.add(graphics);
      }
      
      // 节点
      const node = this.add.graphics();
      let fillColor = isCompleted ? 0x228B22 : (isBoss ? CONFIG.COLORS.RED : CONFIG.COLORS.PRIMARY);
      if (!chapter.unlocked) fillColor = 0x444444;
      
      node.fillStyle(fillColor, 1);
      node.fillCircle(x, y, nodeRadius);
      node.lineStyle(2, CONFIG.COLORS.GOLD, 1);
      node.strokeCircle(x, y, nodeRadius);
      
      // 节点数字
      const numText = this.add.text(x, y, `${index + 1}`, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#FFFFFF'
      });
      numText.setOrigin(0.5);
      numText.setY(numText.y - 2);
      
      container.add(node);
      container.add(numText);
      
      // BOSS标记
      if (isBoss) {
        const bossMark = this.add.text(x, y + 30, 'BOSS', {
          fontSize: '10px',
          fontFamily: 'Arial',
          color: '#FF4444'
        });
        bossMark.setOrigin(0.5);
        container.add(bossMark);
      }
    });
  }
  
  private getChineseNumber(num: number): string {
    const chinese = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    if (num <= 10) return chinese[num];
    return num.toString();
  }
  
  private drawFooter(centerX: number, height: number): void {
    const graphics = this.add.graphics();
    const footerHeight = 60;
    
    // 底部栏
    graphics.fillStyle(CONFIG.COLORS.PRIMARY, 0.95);
    graphics.fillRect(0, height - footerHeight, this.cameras.main.width, footerHeight);
    graphics.lineStyle(3, CONFIG.COLORS.GOLD, 1);
    graphics.lineBetween(0, height - footerHeight, this.cameras.main.width, height - footerHeight);
  }
  
  private addBackButton(): void {
    const backBtn = this.add.graphics();
    UIUtils.drawButton(backBtn, 15, 15, 50, 40, '', CONFIG.COLORS.GOLD, CONFIG.COLORS.PRIMARY);
    
    // 返回箭头
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
        this.scene.start('MenuScene');
      });
    });
  }
  
  private selectChapter(chapter: ChapterInfo): void {
    // 跳转难度选择
    this.scene.start('DifficultyScene', { chapter });
  }
}
