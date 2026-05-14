// 游戏配置
export const CONFIG = {
  // 游戏标题
  GAME_TITLE: '造梦江湖1 - 小宝传奇',
  
  // 屏幕尺寸（竖屏9:16适配）
  BASE_WIDTH: 360,
  BASE_HEIGHT: 640,
  
  // 颜色定义（武侠古风配色）
  COLORS: {
    PRIMARY: 0x8B4513,      // 暗红棕色
    GOLD: 0xD4AF37,         // 金色
    DARK_BROWN: 0x2D1810,   // 深棕色
    RED: 0xC41E3A,          // 中国红
    BLUE: 0x4169E1,         // 蓝色
    GREEN: 0x228B22,        // 绿色
    WHITE: 0xFFFFFF,
    BLACK: 0x000000,
    GRAY: 0x808080,
    YELLOW: 0xFFD700,
    PURPLE: 0x9932CC,       // 紫色装备
    ORANGE: 0xFF8C00,       // 橙色装备
    SKY_BLUE: 0x87CEEB,     // 雨属性
    DARK_PURPLE: 0x4B0082,  // 夜属性
    DEEP_BLUE: 0x191970,    // 雷属性
    LIGHT_GREEN: 0x90EE90   // 风属性
  },
  
  // 装备品质颜色
  EQUIP_COLORS: {
    '白': 0xFFFFFF,
    '绿': 0x32CD32,
    '蓝': 0x4169E1,
    '紫': 0x9932CC,
    '橙': 0xFF8C00,
    '夜': 0x4B0082,
    '雨': 0x87CEEB,
    '雷': 0x191970,
    '风': 0x90EE90
  },
  
  // 天气效果
  WEATHER: {
    SUNNY: { id: 1, name: '晴天', moveMultiplier: 1, visibleRange: 999 },
    NIGHT: { id: 2, name: '黑夜', moveMultiplier: 1, visibleRange: 2 },
    RAIN: { id: 3, name: '雨天', moveMultiplier: 2, visibleRange: 999 },
    THUNDER: { id: 4, name: '雷雨', moveMultiplier: 2, visibleRange: 999, lightning: true },
    WIND: { id: 5, name: '大风', moveMultiplier: 1, visibleRange: 2, tornado: true }
  },
  
  // 格子类型
  TILE_TYPES: {
    NORMAL: 0,      // 普通格
    BATTLE: 1,      // 战斗格
    TREASURE: 2,    // 宝箱格
    QUESTION: 3,    // 问号格
    GOLD: 4,        // 金币格
    BOSS: 5,        // BOSS格
    HEAL: 6,        // 恢复格
    SIGN: 7         // 求签格
  },
  
  // 状态效果
  STATUS: {
    DRUNK: { id: 'drunk', name: '醉酒', canAct: false, hitDown: -600 },
    SYNCOPE: { id: 'syncope', name: '晕厥', canAct: true, hitDown: 0 },
    LIME: { id: 'lime', name: '石灰', canAct: false, toughnessDown: -600 },
    ASLEEP: { id: 'asleep', name: '睡眠', canAct: false, hitDown: 0 },
    CONFUSION: { id: 'confusion', name: '混乱', canAct: false, hitDown: 0 },
    POISON: { id: 'poison', name: '中毒', canAct: false, hitDown: 0 }
  },
  
  // 伤害计算相关
  DAMAGE: {
    CRIT_BONUS: 1.5,      // 暴击伤害倍率
    ELEMENT_BONUS: 1.5,   // 属性克制倍率
    ELEMENT_PENALTY: 0.5  // 属性被克制倍率
  },
  
  // 属性克制关系: 水>火, 火>毒, 毒>水, 混沌无克制
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ELEMENT_COUNTER: {} as Record<string, any>,
  
  // 角色性别
  GENDER: {
    MALE: 0,
    FEMALE: 1,
    UNKNOWN: 2
  },
  
  // 章节配置
  CHAPTERS: [
    { id: 1, name: '扬州城', levels: ['1p1', '1p2', '1p3', '1p4'] },
    { id: 2, name: '京城', levels: ['2p1', '2p2', '2p3', '2p4'] },
    { id: 3, name: '皇宫', levels: ['3p1', '3p2', '3p3', '3p4'] },
    { id: 4, name: '五台山', levels: ['4p1', '4p2', '4p3', '4p4'] },
    { id: 5, name: '神龙岛', levels: ['5p1', '5p2', '5p3', '5p4'] },
    { id: 6, name: '洪教總壇', levels: ['6p1', '6p2'] }
  ],
  
  // 存档键名
  SAVE_KEY: 'dream_journey_save',
  
  // 动画时间
  ANIMATION: {
    DICE_ROLL: 800,
    MOVE_STEP: 300,
    BATTLE_ACTION: 500,
    DIALOG_SHOW: 300
  }
};

// 缩放适配
export function getScaleFactor(scene: Phaser.Scene): { scaleX: number; scaleY: number } {
  const { BASE_WIDTH, BASE_HEIGHT } = CONFIG;
  const width = scene.scale.width;
  const height = scene.scale.height;
  
  const scaleX = width / BASE_WIDTH;
  const scaleY = height / BASE_HEIGHT;
  
  return { scaleX, scaleY };
}

// 适配尺寸到实际屏幕
export function fitToScreen(scene: Phaser.Scene): void {
  const { BASE_WIDTH, BASE_HEIGHT } = CONFIG;
  const parent = scene.scale.parent;
  
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  let gameWidth: number, gameHeight: number;
  
  if (windowWidth / windowHeight > BASE_WIDTH / BASE_HEIGHT) {
    gameHeight = windowHeight;
    gameWidth = gameHeight * (BASE_WIDTH / BASE_HEIGHT);
  } else {
    gameWidth = windowWidth;
    gameHeight = gameWidth * (BASE_HEIGHT / BASE_WIDTH);
  }
  
  scene.scale.resize(gameWidth, gameHeight);
}
// 初始化ELEMENT_COUNTER
CONFIG.ELEMENT_COUNTER = {
  'water': { strong: 'fire', weak: 'poison' },
  'fire': { strong: 'poison', weak: 'water' },
  'poison': { strong: 'water', weak: 'fire' },
  'chaos': { strong: null, weak: null }
};