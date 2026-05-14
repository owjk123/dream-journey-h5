// 加载场景 - 初始化游戏资源
import Phaser from 'phaser';
import { DataManager } from '../data/DataManager';

export class BootScene extends Phaser.Scene {
  private loadingBar!: HTMLElement;
  private loadingText!: HTMLElement;
  
  constructor() {
    super({ key: 'BootScene' });
  }
  
  preload(): void {
    // 获取loading元素
    this.loadingBar = document.getElementById('loading-progress')!;
    this.loadingText = document.getElementById('loading-text')!;
    
    // 监听加载进度
    this.load.on('progress', (value: number) => {
      this.updateLoadingBar(value);
    });
    
    // 加载数据文件
    this.loadData();
  }
  
  updateLoadingBar(value: number): void {
    const percent = Math.floor(value * 100);
    if (this.loadingBar) {
      this.loadingBar.style.width = `${percent}%`;
    }
    if (this.loadingText) {
      this.loadingText.textContent = `加载中... ${percent}%`;
    }
  }
  
  async loadData(): Promise<void> {
    try {
      this.updateLoadingText('加载游戏数据...');
      const dataManager = DataManager.getInstance();
      await dataManager.loadAll();
      
      this.updateLoadingText('数据加载完成！');
      this.updateLoadingBar(1);
      
      // 隐藏loading界面
      setTimeout(() => {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
          loadingEl.style.display = 'none';
        }
      }, 500);
      
    } catch (error) {
      console.error('数据加载失败:', error);
      this.updateLoadingText('数据加载失败，请刷新重试');
    }
  }
  
  updateLoadingText(text: string): void {
    if (this.loadingText) {
      this.loadingText.textContent = text;
    }
  }
  
  create(): void {
    // 数据加载完成后跳转
    this.time.delayedCall(800, () => {
      this.scene.start('MenuScene');
    });
  }
}
