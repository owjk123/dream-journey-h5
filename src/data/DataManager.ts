// 数据管理器 - 加载和管理所有游戏数据
import { XMLParser } from '../utils/XMLParser';
import type {
  EnemyData,
  SkillData,
  EquipmentData,
  WeatherData,
  StatusData,
  PropData,
  LevelUpData,
  LevelUpExpData,
  BattleDispositionData,
  LevelUpEnemyData
} from './types';

// 导入XML数据（通过fetch加载）
const DATA_PATH = './data/dj-data/';

export class DataManager {
  private static instance: DataManager;
  
  enemies: Map<number, EnemyData> = new Map();
  enemiesByName: Map<string, EnemyData> = new Map();
  
  skills: Map<number, SkillData> = new Map();
  skillsByName: Map<string, SkillData> = new Map();
  
  equipments: Map<number, EquipmentData> = new Map();
  
  weathers: Map<number, WeatherData> = new Map();
  
  statuses: Map<string, StatusData> = new Map();
  
  props: Map<number, PropData> = new Map();
  
  levelUps: Map<number, LevelUpData> = new Map();
  
  levelUpExps: Map<number, LevelUpExpData> = new Map();
  
  battleDispositions: BattleDispositionData[] = [];
  
  levelUpEnemies: Map<number, LevelUpEnemyData> = new Map();
  
  private loaded = false;
  
  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }
  
  async loadAll(): Promise<void> {
    if (this.loaded) return;
    
    console.log('开始加载游戏数据...');
    
    // 直接从本地文件加载
    await Promise.all([
      this.loadEnemies(),
      this.loadSkills(),
      this.loadEquipments(),
      this.loadWeathers(),
      this.loadStatuses(),
      this.loadProps(),
      this.loadLevelUps(),
      this.loadLevelUpExps(),
      this.loadBattleDispositions(),
      this.loadLevelUpEnemies()
    ]);
    
    this.loaded = true;
    console.log('游戏数据加载完成');
    console.log(`敌人: ${this.enemies.size}, 技能: ${this.skills.size}, 装备: ${this.equipments.size}`);
  }
  
  private async loadEnemies(): Promise<void> {
    try {
      const response = await fetch(DATA_PATH + 'enemy.xml');
      const text = await response.text();
      const records = XMLParser.parseFromString(text);
      
      records.forEach((record: any) => {
        const enemy: EnemyData = {
          id: record.id,
          name: record.name,
          gender: record.gender,
          lv: record.lv,
          hp: record.hp,
          mp: record.mp,
          atk: record.atk,
          def: record.def,
          spd: record.spd,
          evasion: record.evasion,
          crit: record.crit,
          hit: record.hit,
          toughness: record.toughness,
          ats: record.ats,
          adf: record.adf,
          evasion_rate: record.evasion_rate,
          crit_rate: record.crit_rate,
          block_rate: record.block_rate,
          atk_point: record.atk_point,
          exp: record.exp,
          soul: record.soul,
          money: record.money,
          fixedskill_name: record.fixedskill_name || '',
          join_rate: record.join_rate,
          join_rate_hard: record.join_rate_hard
        };
        this.enemies.set(enemy.id, enemy);
        this.enemiesByName.set(enemy.name, enemy);
      });
    } catch (e) {
      console.error('加载敌人数据失败:', e);
    }
  }
  
  private async loadSkills(): Promise<void> {
    try {
      const response = await fetch(DATA_PATH + 'skill.xml');
      const text = await response.text();
      const records = XMLParser.parseFromString(text);
      
      records.forEach((record: any) => {
        const skill: SkillData = {
          id: record.id,
          skill_name: record.skill_name,
          skill_point: record.skill_point,
          skill_mp: record.skill_mp,
          item_name: record.item_name,
          item_number: record.item_number,
          type: record.type,
          camp: record.camp,
          range: record.range,
          choice: record.choice,
          damage_ratio: record.damage_ratio,
          common: record.common,
          water: record.water,
          fire: record.fire,
          poison: record.poison,
          chaos: record.chaos,
          mp_down: record.mp_down,
          hp_up: record.hp_up,
          mp_up: record.mp_up,
          Damage_time: record.Damage_time,
          choice_status_obj: record.choice_status_obj,
          drunk_status: record.drunk_status,
          syncope_status: record.syncope_status,
          poison_status: record.poison_status,
          lime_status: record.lime_status,
          asleep_status: record.asleep_status,
          confusion_status: record.confusion_status,
          status_time: record.status_time,
          atk_up: record.atk_up,
          def_up: record.def_up,
          spd_up: record.spd_up,
          evasion_up: record.evasion_up,
          crit_up: record.crit_up,
          hit_up: record.hit_up,
          toughness_up: record.toughness_up,
          ats_up: record.ats_up,
          adf_up: record.adf_up,
          description: record.description,
          effect: record.effect,
          master: record.master
        };
        this.skills.set(skill.id, skill);
        this.skillsByName.set(skill.skill_name, skill);
      });
    } catch (e) {
      console.error('加载技能数据失败:', e);
    }
  }
  
  private async loadEquipments(): Promise<void> {
    try {
      const response = await fetch(DATA_PATH + 'equipment.xml');
      const text = await response.text();
      const records = XMLParser.parseFromString(text);
      
      records.forEach((record: any) => {
        const equip: EquipmentData = {
          id: record.id,
          name: record.name,
          type: record.type,
          grade_limit: record.grade_limit,
          color: record.color,
          hp: record.hp || '0',
          mp: record.mp || '0',
          atk_space: record.atk_space || '0',
          def_space: record.def_space || '0',
          spd_space: record.spd_space || '0',
          evasion: record.evasion || '0',
          crit: record.crit || '0',
          hit: record.hit || '0',
          toughness: record.toughness || '0',
          ats: record.ats || '0',
          adf: record.adf || '0',
          exclusive_character: record.exclusive_character || '',
          sale_money: record.sale_money,
          money_add: record.money_add
        };
        this.equipments.set(equip.id, equip);
      });
    } catch (e) {
      console.error('加载装备数据失败:', e);
    }
  }
  
  private async loadWeathers(): Promise<void> {
    try {
      const response = await fetch(DATA_PATH + 'weather.xml');
      const text = await response.text();
      const records = XMLParser.parseFromString(text);
      
      records.forEach((record: any) => {
        const weather: WeatherData = {
          id: record.id,
          wea_name: record.wea_name,
          wea_start_rate: record.wea_start_rate,
          wea_inside_rate: record.wea_inside_rate,
          wea_rain_rate: record.wea_rain_rate,
          wea_night_rate: record.wea_night_rate,
          wea_time: record.wea_time,
          wea_message: record.wea_message
        };
        this.weathers.set(weather.id, weather);
      });
    } catch (e) {
      console.error('加载天气数据失败:', e);
    }
  }
  
  private async loadStatuses(): Promise<void> {
    try {
      const response = await fetch(DATA_PATH + 'status.xml');
      const text = await response.text();
      const records = XMLParser.parseFromString(text);
      
      records.forEach((record: any) => {
        const status: StatusData = {
          id: record.id,
          status_name: record.status_name,
          can_act: record.can_act,
          can_asleep: record.can_asleep,
          can_confusion: record.can_confusion,
          can_poison: record.can_poison,
          hit_down: record.hit_down,
          toughness_down: record.toughness_down,
          fire_damage: record.fire_damage,
          water_damage: record.water_damage
        };
        this.statuses.set(status.status_name, status);
      });
    } catch (e) {
      console.error('加载状态数据失败:', e);
    }
  }
  
  private async loadProps(): Promise<void> {
    try {
      const response = await fetch(DATA_PATH + 'prop.xml');
      const text = await response.text();
      const records = XMLParser.parseFromString(text);
      
      records.forEach((record: any) => {
        const prop: PropData = {
          id: record.id,
          name: record.name,
          message: record.message,
          rate: record.rate,
          coupon: record.coupon,
          type: record.type,
          restrict: record.restrict
        };
        this.props.set(prop.id, prop);
      });
    } catch (e) {
      console.error('加载道具数据失败:', e);
    }
  }
  
  private async loadLevelUps(): Promise<void> {
    try {
      const response = await fetch(DATA_PATH + 'level_up.xml');
      const text = await response.text();
      const records = XMLParser.parseFromString(text);
      
      records.forEach((record: any) => {
        const levelUp: LevelUpData = {
          id: record.id,
          name: record.name,
          hp: record.hp,
          mp: record.mp,
          atk: record.atk,
          def: record.def,
          basic_exp: record.basic_exp,
          exp_add: record.exp_add
        };
        this.levelUps.set(levelUp.id, levelUp);
      });
    } catch (e) {
      console.error('加载升级数据失败:', e);
    }
  }
  
  private async loadLevelUpExps(): Promise<void> {
    try {
      const response = await fetch(DATA_PATH + 'level_up_exp.xml');
      const text = await response.text();
      const records = XMLParser.parseFromString(text);
      
      records.forEach((record: any) => {
        const exp: LevelUpExpData = {
          lv: record.lv,
          exp: record.exp,
          skill_id: record.skill_id,
          prop: record.prop || '',
          Dice_value: record.Dice_value,
          gold: record.gold,
          soul: record.soul,
          exp_3hours: record.exp_3hours,
          exp_12hours: record.exp_12hours,
          exp_conpou: record.exp_conpou
        };
        this.levelUpExps.set(exp.lv, exp);
      });
    } catch (e) {
      console.error('加载经验数据失败:', e);
    }
  }
  
  private async loadBattleDispositions(): Promise<void> {
    try {
      const response = await fetch(DATA_PATH + 'battle_disposition.xml');
      const text = await response.text();
      this.battleDispositions = XMLParser.parseFromString(text);
    } catch (e) {
      console.error('加载战斗配置失败:', e);
    }
  }
  
  private async loadLevelUpEnemies(): Promise<void> {
    try {
      const response = await fetch(DATA_PATH + 'level_up_enemy.xml');
      const text = await response.text();
      const records = XMLParser.parseFromString(text);
      
      records.forEach((record: any) => {
        const levelUpEnemy: LevelUpEnemyData = {
          id: record.id,
          name: record.name,
          hp: record.hp,
          mp: record.mp,
          atk: record.atk,
          def: record.def,
          exp_add: record.exp_add,
          soul_add: record.soul_add,
          money_add: record.money_add
        };
        this.levelUpEnemies.set(levelUpEnemy.id, levelUpEnemy);
      });
    } catch (e) {
      console.error('加载敌人升级数据失败:', e);
    }
  }
  
  // 获取敌人数据
  getEnemy(idOrName: number | string): EnemyData | undefined {
    if (typeof idOrName === 'number') {
      return this.enemies.get(idOrName);
    }
    return this.enemiesByName.get(idOrName);
  }
  
  // 获取技能数据
  getSkill(idOrName: number | string): SkillData | undefined {
    if (typeof idOrName === 'number') {
      return this.skills.get(idOrName);
    }
    return this.skillsByName.get(idOrName);
  }
  
  // 获取装备数据
  getEquipment(id: number): EquipmentData | undefined {
    return this.equipments.get(id);
  }
  
  // 获取天气数据
  getWeather(id: number): WeatherData | undefined {
    return this.weathers.get(id);
  }
  
  // 获取状态数据
  getStatus(name: string): StatusData | undefined {
    return this.statuses.get(name);
  }
  
  // 获取道具数据
  getProp(id: number): PropData | undefined {
    return this.props.get(id);
  }
  
  // 获取升级数据
  getLevelUp(name: string): LevelUpData | undefined {
    const enemy = this.enemiesByName.get(name);
    if (enemy) {
      return this.levelUps.get(enemy.id);
    }
    // 按名称匹配
    for (const [, data] of this.levelUps) {
      if (data.name === name) {
        return data;
      }
    }
    return undefined;
  }
  
  // 获取经验需求
  getExpForLevel(level: number): number {
    const exp = this.levelUpExps.get(level);
    return exp ? exp.exp : 999999;
  }
  
  // 获取关卡配置
  getBattleDisposition(levelName: string, difficulty: number): BattleDispositionData | undefined {
    return this.battleDispositions.find(
      d => d.level_name === levelName && d.difficulty === difficulty
    );
  }
  
  // 根据天气获取敌人名称
  getEnemyNameByWeather(disposition: BattleDispositionData, weatherId: number): string[] {
    switch (weatherId) {
      case 2: // 黑夜
        return disposition.night_enemy_name.split('|');
      case 3: // 雨天
        return disposition.rain_enemy_name.split('|');
      case 4: // 雷雨
        return disposition.thunder_enemy_name.split('|');
      case 5: // 大风
        return disposition.wind_enemy_name.split('|');
      default:
        return disposition.enemy_name.split('|');
    }
  }
}
