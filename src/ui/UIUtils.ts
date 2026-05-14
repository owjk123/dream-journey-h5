// UI绘制工具 - 古风武侠风格
import Phaser from 'phaser';
import { CONFIG } from '../config';

export class UIUtils {
  // 绘制古风卷轴背景
  static drawScrollBackground(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number = CONFIG.COLORS.PRIMARY
  ): void {
    // 主背景
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(x, y, width, height, 8);
    
    // 金色边框
    graphics.lineStyle(2, CONFIG.COLORS.GOLD, 1);
    graphics.strokeRoundedRect(x + 2, y + 2, width - 4, height - 4, 6);
    
    // 内部装饰线
    graphics.lineStyle(1, CONFIG.COLORS.GOLD, 0.3);
    graphics.strokeRoundedRect(x + 6, y + 6, width - 12, height - 12, 4);
  }
  
  // 绘制古风按钮
  static drawButton(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    textColor: number = CONFIG.COLORS.GOLD,
    bgColor: number = CONFIG.COLORS.PRIMARY,
    isDisabled: boolean = false
  ): void {
    const alpha = isDisabled ? 0.5 : 1;
    
    // 按钮背景
    graphics.fillStyle(bgColor, alpha);
    graphics.fillRoundedRect(x, y, width, height, 8);
    
    // 按钮边框
    graphics.lineStyle(2, isDisabled ? CONFIG.COLORS.GRAY : CONFIG.COLORS.GOLD, alpha);
    graphics.strokeRoundedRect(x, y, width, height, 8);
    
    // 高光效果
    graphics.fillStyle(CONFIG.COLORS.GOLD, 0.1 * alpha);
    graphics.fillRoundedRect(x + 4, y + 4, width - 8, height / 3, 4);
  }
  
  // 绘制血条/蓝条
  static drawProgressBar(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    current: number,
    max: number,
    fillColor: number,
    bgColor: number = 0x333333
  ): void {
    const ratio = Math.min(1, Math.max(0, current / max));
    const fillWidth = width * ratio;
    
    // 背景
    graphics.fillStyle(bgColor, 1);
    graphics.fillRoundedRect(x, y, width, height, 4);
    
    // 填充
    graphics.fillStyle(fillColor, 1);
    if (fillWidth > 0) {
      graphics.fillRoundedRect(x, y, fillWidth, height, 4);
    }
    
    // 边框
    graphics.lineStyle(1, CONFIG.COLORS.GOLD, 0.8);
    graphics.strokeRoundedRect(x, y, width, height, 4);
    
    // 装饰点
    graphics.fillStyle(CONFIG.COLORS.GOLD, 0.5);
    graphics.fillCircle(x + 4, y + height / 2, 2);
    graphics.fillCircle(x + width - 4, y + height / 2, 2);
  }
  
  // 绘制角色头像
  static drawAvatar(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    size: number,
    name: string,
    gender: number = 0,
    level: number = 1
  ): void {
    const radius = size / 2;
    
    // 圆形边框（金色）
    graphics.lineStyle(3, CONFIG.COLORS.GOLD, 1);
    graphics.strokeCircle(x, y, radius);
    
    // 背景色（根据性别）
    const bgColor = gender === 1 ? 0xFFC0CB : (gender === 2 ? 0x9370DB : 0x87CEEB);
    graphics.fillStyle(bgColor, 0.8);
    graphics.fillCircle(x, y, radius - 2);
    
    // 角色标识（简化用文字）
    graphics.fillStyle(CONFIG.COLORS.WHITE, 1);
    const initial = name.charAt(0);
    graphics.fillCircle(x, y, radius * 0.4);
  }
  
  // 绘制骰子
  static drawDice(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    size: number,
    value: number,
    isRolling: boolean = false
  ): void {
    // 骰子背景
    const bgColor = isRolling ? CONFIG.COLORS.GOLD : CONFIG.COLORS.WHITE;
    graphics.fillStyle(bgColor, 1);
    graphics.fillRoundedRect(x - size / 2, y - size / 2, size, size, size * 0.15);
    
    // 骰子边框
    graphics.lineStyle(2, CONFIG.COLORS.PRIMARY, 1);
    graphics.strokeRoundedRect(x - size / 2, y - size / 2, size, size, size * 0.15);
    
    // 点数
    graphics.fillStyle(CONFIG.COLORS.RED, 1);
    const dotSize = size * 0.12;
    const dotPositions = this.getDiceDotPositions(value, size);
    dotPositions.forEach(([dx, dy]) => {
      graphics.fillCircle(x + dx, y + dy, dotSize);
    });
  }
  
  // 获取骰子点数位置
  private static getDiceDotPositions(value: number, size: number): Array<[number, number]> {
    const offset = size * 0.25;
    const positions: Array<[number, number]> = [];
    
    switch (value) {
      case 1:
        positions.push([0, 0]);
        break;
      case 2:
        positions.push([-offset, -offset], [offset, offset]);
        break;
      case 3:
        positions.push([-offset, -offset], [0, 0], [offset, offset]);
        break;
      case 4:
        positions.push([-offset, -offset], [offset, -offset], [-offset, offset], [offset, offset]);
        break;
      case 5:
        positions.push([-offset, -offset], [offset, -offset], [0, 0], [-offset, offset], [offset, offset]);
        break;
      case 6:
        positions.push([-offset, -offset], [offset, -offset], [-offset, 0], [offset, 0], [-offset, offset], [offset, offset]);
        break;
    }
    
    return positions;
  }
  
  // 绘制天气图标
  static drawWeatherIcon(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    size: number,
    weatherId: number
  ): void {
    const colors: Record<number, number> = {
      1: CONFIG.COLORS.YELLOW,  // 晴天
      2: CONFIG.COLORS.DARK_PURPLE,  // 黑夜
      3: CONFIG.COLORS.SKY_BLUE,  // 雨天
      4: CONFIG.COLORS.DEEP_BLUE,  // 雷雨
      5: CONFIG.COLORS.LIGHT_GREEN  // 大风
    };
    
    const color = colors[weatherId] || CONFIG.COLORS.YELLOW;
    
    // 背景圆
    graphics.fillStyle(color, 0.8);
    graphics.fillCircle(x, y, size / 2);
    
    // 边框
    graphics.lineStyle(2, CONFIG.COLORS.GOLD, 1);
    graphics.strokeCircle(x, y, size / 2);
    
    // 天气符号（简化）
    graphics.fillStyle(CONFIG.COLORS.WHITE, 1);
    graphics.fillCircle(x, y, size * 0.15);
  }
  
  // 绘制装备格子
  static drawEquipSlot(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    size: number,
    hasItem: boolean = false,
    color: string = '白'
  ): void {
    // 格子背景
    graphics.fillStyle(hasItem ? CONFIG.EQUIP_COLORS[color as keyof typeof CONFIG.EQUIP_COLORS] || CONFIG.COLORS.WHITE : 0x444444, 1);
    graphics.fillRoundedRect(x, y, size, size, 4);
    
    // 边框
    graphics.lineStyle(2, CONFIG.COLORS.GOLD, 1);
    graphics.strokeRoundedRect(x, y, size, size, 4);
    
    // 内部虚线
    if (!hasItem) {
      graphics.lineStyle(1, CONFIG.COLORS.GRAY, 0.5);
      graphics.strokeRoundedRect(x + 4, y + 4, size - 8, size - 8, 2);
    }
  }
  
  // 绘制状态图标
  static drawStatusIcon(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    size: number,
    statusType: string
  ): void {
    const statusColors: Record<string, number> = {
      'drunk': 0xFFD700,     // 醉酒 - 金色
      'syncope': 0x9370DB,  // 晕厥 - 紫色
      'lime': 0x808080,     // 石灰 - 灰色
      'asleep': 0x4169E1,   // 睡眠 - 蓝色
      'confusion': 0xFF69B4, // 混乱 - 粉色
      'poison': 0x32CD32    // 中毒 - 绿色
    };
    
    const color = statusColors[statusType] || CONFIG.COLORS.GRAY;
    
    // 背景
    graphics.fillStyle(color, 1);
    graphics.fillCircle(x, y, size / 2);
    
    // 边框
    graphics.lineStyle(1, CONFIG.COLORS.WHITE, 0.8);
    graphics.strokeCircle(x, y, size / 2);
  }
  
  // 绘制章节选择卡片
  static drawChapterCard(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    chapterNum: number,
    chapterName: string,
    isUnlocked: boolean = true,
    isCompleted: boolean = false
  ): void {
    const alpha = isUnlocked ? 1 : 0.5;
    
    // 卡片背景
    graphics.fillStyle(isCompleted ? 0x228B22 : CONFIG.COLORS.PRIMARY, alpha);
    graphics.fillRoundedRect(x, y, width, height, 12);
    
    // 金色边框
    graphics.lineStyle(2, CONFIG.COLORS.GOLD, alpha);
    graphics.strokeRoundedRect(x, y, width, height, 12);
    
    // 装饰角
    graphics.fillStyle(CONFIG.COLORS.GOLD, 0.3 * alpha);
    graphics.fillTriangle(x, y, x + 20, y, x, y + 20);
    graphics.fillTriangle(x + width, y + height, x + width - 20, y + height, x + width, y + height - 20);
  }
  
  // 绘制关卡节点
  static drawLevelNode(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    radius: number,
    levelNum: number,
    isBoss: boolean = false,
    isCompleted: boolean = false,
    isCurrent: boolean = false
  ): void {
    let fillColor: number;
    if (isCompleted) {
      fillColor = 0x228B22;
    } else if (isBoss) {
      fillColor = CONFIG.COLORS.RED;
    } else if (isCurrent) {
      fillColor = CONFIG.COLORS.GOLD;
    } else {
      fillColor = CONFIG.COLORS.PRIMARY;
    }
    
    // 圆形节点
    graphics.fillStyle(fillColor, 1);
    graphics.fillCircle(x, y, radius);
    
    // 外圈
    graphics.lineStyle(3, CONFIG.COLORS.GOLD, 1);
    graphics.strokeCircle(x, y, radius);
    
    // 关卡数字
    if (isBoss) {
      // BOSS标记
      graphics.fillStyle(CONFIG.COLORS.WHITE, 1);
      graphics.fillCircle(x, y, radius * 0.4);
    }
  }
  
  // 绘制弹窗
  static drawDialogBox(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    title: string = ''
  ): void {
    // 遮罩
    graphics.fillStyle(0x000000, 0.6);
    graphics.fillRect(x, y, width, height);
    
    // 弹窗主体
    const margin = 20;
    graphics.fillStyle(CONFIG.COLORS.DARK_BROWN, 1);
    graphics.fillRoundedRect(x + margin, y + margin, width - margin * 2, height - margin * 2, 16);
    
    // 金色边框
    graphics.lineStyle(3, CONFIG.COLORS.GOLD, 1);
    graphics.strokeRoundedRect(x + margin, y + margin, width - margin * 2, height - margin * 2, 16);
    
    // 标题装饰
    if (title) {
      const titleY = y + margin + 10;
      graphics.fillStyle(CONFIG.COLORS.GOLD, 0.2);
      graphics.fillRoundedRect(x + margin + 20, titleY - 5, width - margin * 2 - 40, 30, 8);
    }
  }
  
  // 创建渐变文字效果（使用多个文字对象叠加）
  static createGradientText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    fontSize: number = 24,
    color: string = '#D4AF37'
  ): Phaser.GameObjects.Text[] {
    const texts: Phaser.GameObjects.Text[] = [];
    
    // 阴影
    const shadow = scene.add.text(x + 2, y + 2, text, {
      fontSize: `${fontSize}px`,
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: '#000000'
    });
    shadow.setAlpha(0.5);
    texts.push(shadow);
    
    // 主文字
    const main = scene.add.text(x, y, text, {
      fontSize: `${fontSize}px`,
      fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
      color: color
    });
    texts.push(main);
    
    return texts;
  }
}
