// 游戏主入口
import { CONFIG } from './config';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { ChapterScene } from './scenes/ChapterScene';
import { DifficultyScene } from './scenes/DifficultyScene';
import { BoardScene } from './scenes/BoardScene';
import { BattleScene } from './scenes/BattleScene';

// 获取全局Phaser
declare const Phaser: typeof import('phaser');

// 游戏配置
const gameConfig: Phaser.Types.Core.GameConfig = {
  title: CONFIG.GAME_TITLE,
  type: Phaser.AUTO,
  
  // 移动端适配
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: CONFIG.BASE_WIDTH,
    height: CONFIG.BASE_HEIGHT,
    min: {
      width: 270,
      height: 480
    },
    max: {
      width: 540,
      height: 960
    }
  },
  
  // 渲染配置
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false
  },
  
  // 物理系统
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  
  // 背景色
  backgroundColor: '#1a0a00',
  
  // 场景
  scene: [
    BootScene,
    MenuScene,
    ChapterScene,
    DifficultyScene,
    BoardScene,
    BattleScene
  ],
  
  // 输入配置
  input: {
    touch: true,
    keyboard: false
  },
  
  // DOM配置
  dom: {
    createContainer: false
  }
};

// 创建设置移动端视口
function setupMobileViewport(): void {
  const meta = document.querySelector('meta[name="viewport"]');
  if (meta) {
    meta.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    );
  }
  
  document.addEventListener('dblclick', (e) => {
    e.preventDefault();
  }, { passive: false });
  
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  }, { passive: false });
}

// 隐藏地址栏
function hideAddressBar(): void {
  setTimeout(() => {
    window.scrollTo(0, 1);
  }, 100);
  
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 100);
  });
}

// 初始化游戏
function initGame(): void {
  setupMobileViewport();
  hideAddressBar();
  
  new Phaser.Game(gameConfig);
  
  console.log('造梦江湖1 H5版 初始化完成');
  console.log(`屏幕尺寸: ${CONFIG.BASE_WIDTH}x${CONFIG.BASE_HEIGHT}`);
  
  window.addEventListener('resize', () => {
    console.log('窗口大小改变');
  });
  
  document.body.addEventListener('touchmove', (e) => {
    if (e.target === document.body) {
      e.preventDefault();
    }
  }, { passive: false });
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initGame();
  });
} else {
  initGame();
}
