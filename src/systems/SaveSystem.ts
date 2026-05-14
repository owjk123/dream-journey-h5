// 存档系统
import { CONFIG } from '../config';
import type { GameSave, CharacterInstance } from '../data/types';
import { Party } from '../entities/Party';

const SAVE_KEY = CONFIG.SAVE_KEY;
const SAVE_VERSION = 1;

export class SaveSystem {
  private static instance: SaveSystem;
  
  private constructor() {}
  
  static getInstance(): SaveSystem {
    if (!SaveSystem.instance) {
      SaveSystem.instance = new SaveSystem();
    }
    return SaveSystem.instance;
  }
  
  // 检查是否有存档
  hasSave(): boolean {
    const save = localStorage.getItem(SAVE_KEY);
    return save !== null && save.length > 0;
  }
  
  // 获取当前存档
  getSave(): GameSave | null {
    try {
      const saveStr = localStorage.getItem(SAVE_KEY);
      if (saveStr) {
        return JSON.parse(saveStr) as GameSave;
      }
    } catch (e) {
      console.error('读取存档失败:', e);
    }
    return null;
  }
  
  // 保存游戏
  save(
    currentChapter: number,
    currentLevel: string,
    difficulty: number,
    money: number,
    soul: number,
    props: { [propId: number]: number },
    currentWeather: number
  ): boolean {
    try {
      const party = Party.getInstance();
      
      const save: GameSave = {
        version: SAVE_VERSION,
        currentChapter,
        currentLevel,
        difficulty,
        money,
        soul,
        props,
        characters: party.toSaveData(),
        currentWeather,
        playCount: (this.getSave()?.playCount || 0) + 1,
        lastPlayTime: Date.now()
      };
      
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
      console.log('游戏已保存');
      return true;
    } catch (e) {
      console.error('保存游戏失败:', e);
      return false;
    }
  }
  
  // 加载存档
  load(): GameSave | null {
    const save = this.getSave();
    if (save) {
      const party = Party.getInstance();
      party.loadFromSave(save.characters);
      console.log('游戏已加载');
    }
    return save;
  }
  
  // 删除存档
  deleteSave(): void {
    localStorage.removeItem(SAVE_KEY);
    console.log('存档已删除');
  }
  
  // 创建新游戏
  createNewGame(): GameSave {
    const save: GameSave = {
      version: SAVE_VERSION,
      currentChapter: 1,
      currentLevel: '1p1',
      difficulty: 1,
      money: 100,
      soul: 50,
      props: {
        1: 10,  // 骰子初始10个
        2: 3,   // 满汉全席3个
        3: 1    // 雪山人参1个
      },
      characters: [],
      currentWeather: 1,
      playCount: 1,
      lastPlayTime: Date.now()
    };
    
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    return save;
  }
  
  // 获取游玩次数
  getPlayCount(): number {
    return this.getSave()?.playCount || 0;
  }
  
  // 更新游玩次数
  incrementPlayCount(): void {
    const save = this.getSave();
    if (save) {
      save.playCount++;
      save.lastPlayTime = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    }
  }
}
