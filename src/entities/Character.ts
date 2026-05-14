// 角色类 - 玩家和敌人共享的基础类
import { DataManager } from '../data/DataManager';
import type { EnemyData, CharacterInstance } from '../data/types';

export class Character {
  id: string;
  name: string;
  level: number = 1;
  exp: number = 0;
  
  // 基础属性
  baseHp: number = 0;
  baseMp: number = 0;
  baseAtk: number = 0;
  baseDef: number = 0;
  baseSpd: number = 0;
  baseEvasion: number = 0;
  baseCrit: number = 0;
  baseHit: number = 0;
  baseToughness: number = 0;
  baseAts: number = 0;
  baseAdf: number = 0;
  
  // 当前属性（含装备/buff加成）
  hp: number = 0;
  maxHp: number = 0;
  mp: number = 0;
  maxMp: number = 0;
  atk: number = 0;
  def: number = 0;
  spd: number = 0;
  evasion: number = 0;
  crit: number = 0;
  hit: number = 0;
  toughness: number = 0;
  ats: number = 0;
  adf: number = 0;
  
  // 战斗比率
  evasionRate: number = 0;
  critRate: number = 0;
  blockRate: number = 0;
  
  // 技能列表
  skills: number[] = [];
  
  // 专属技能
  fixedSkill: number | null = null;
  
  // 状态效果
  statusEffects: Array<{ type: string; time: number }> = [];
  
  // 性别
  gender: number = 0;
  
  // 是否是玩家角色
  isPlayer: boolean = false;
  
  // 经验/灵魂/金钱
  expValue: number = 0;
  soulValue: number = 0;
  moneyValue: number = 0;
  
  // 等级成长数据
  private levelUpData: { hp: number; mp: number; atk: number; def: number } | null = null;
  
  constructor(id: string, baseData: EnemyData, isPlayer: boolean = false) {
    this.id = id;
    this.name = baseData.name;
    this.gender = baseData.gender;
    this.isPlayer = isPlayer;
    
    // 初始化基础属性
    this.baseHp = baseData.hp;
    this.baseMp = baseData.mp;
    this.baseAtk = baseData.atk;
    this.baseDef = baseData.def;
    this.baseSpd = baseData.spd;
    this.baseEvasion = baseData.evasion;
    this.baseCrit = baseData.crit;
    this.baseHit = baseData.hit;
    this.baseToughness = baseData.toughness;
    this.baseAts = baseData.ats;
    this.baseAdf = baseData.adf;
    
    this.evasionRate = baseData.evasion_rate;
    this.critRate = baseData.crit_rate;
    this.blockRate = baseData.block_rate;
    
    this.expValue = baseData.exp;
    this.soulValue = baseData.soul;
    this.moneyValue = baseData.money;
    
    // 加载专属技能
    if (baseData.fixedskill_name) {
      const skillData = DataManager.getInstance().getSkill(baseData.fixedskill_name);
      if (skillData) {
        this.fixedSkill = skillData.id;
        this.skills.push(skillData.id);
      }
    }
    
    // 加载成长数据
    const dm = DataManager.getInstance();
    const levelUp = dm.getLevelUp(baseData.name);
    if (levelUp) {
      this.levelUpData = {
        hp: levelUp.hp,
        mp: levelUp.mp,
        atk: levelUp.atk,
        def: levelUp.def
      };
    }
    
    // 初始化当前属性
    this.updateStats();
  }
  
  // 更新属性
  updateStats(): void {
    const levelBonus = this.isPlayer ? this.calculateLevelBonus() : 0;
    
    this.maxHp = Math.floor(this.baseHp + levelBonus * (this.baseHp * (this.levelUpData?.hp || 0.1)));
    this.maxMp = Math.floor(this.baseMp + levelBonus * (this.baseMp * (this.levelUpData?.mp || 0.08)));
    this.atk = Math.floor(this.baseAtk + levelBonus * (this.baseAtk * (this.levelUpData?.atk || 0.13)));
    this.def = Math.floor(this.baseDef + levelBonus * (this.baseDef * (this.levelUpData?.def || 0.13)));
    this.spd = this.baseSpd;
    this.evasion = this.baseEvasion;
    this.crit = this.baseCrit;
    this.hit = this.baseHit;
    this.toughness = this.baseToughness;
    this.ats = this.baseAts;
    this.adf = this.baseAdf;
    
    // 如果当前hp超过上限，调整
    if (this.hp > this.maxHp) {
      this.hp = this.maxHp;
    }
    if (this.mp > this.maxMp) {
      this.mp = this.maxMp;
    }
    
    // 如果hp为0，设置为满血
    if (this.hp <= 0) {
      this.hp = this.maxHp;
      this.mp = this.maxMp;
    }
  }
  
  // 计算等级加成
  private calculateLevelBonus(): number {
    return Math.max(0, this.level - 1);
  }
  
  // 升级
  levelUp(newLevel: number): boolean {
    const dm = DataManager.getInstance();
    const targetExp = dm.getExpForLevel(newLevel);
    
    if (this.exp >= targetExp && newLevel <= 161) {
      this.level = newLevel;
      this.updateStats();
      
      // 升级时恢复满血满蓝
      this.hp = this.maxHp;
      this.mp = this.maxMp;
      
      // 检查是否学习新技能
      const expData = dm.levelUpExps.get(newLevel);
      if (expData && expData.skill_id > 0) {
        this.learnSkill(expData.skill_id);
      }
      
      return true;
    }
    return false;
  }
  
  // 添加经验
  addExp(amount: number): number {
    const dm = DataManager.getInstance();
    let levelsGained = 0;
    
    this.exp += amount;
    
    // 检查升级
    let newLevel = this.level;
    while (newLevel < 161) {
      const requiredExp = dm.getExpForLevel(newLevel);
      if (this.exp >= requiredExp) {
        newLevel++;
        if (this.levelUp(newLevel)) {
          levelsGained++;
        }
      } else {
        break;
      }
    }
    
    return levelsGained;
  }
  
  // 学习技能
  learnSkill(skillId: number): boolean {
    if (!this.skills.includes(skillId)) {
      this.skills.push(skillId);
      return true;
    }
    return false;
  }
  
  // 添加状态
  addStatus(type: string, time: number): void {
    // 检查是否已有该状态
    const existing = this.statusEffects.find(s => s.type === type);
    if (existing) {
      existing.time = Math.max(existing.time, time);
    } else {
      this.statusEffects.push({ type, time });
    }
  }
  
  // 移除状态
  removeStatus(type: string): void {
    this.statusEffects = this.statusEffects.filter(s => s.type !== type);
  }
  
  // 回合结束，减少状态时间
  tickStatus(): void {
    this.statusEffects = this.statusEffects.filter(s => {
      s.time--;
      return s.time > 0;
    });
  }
  
  // 检查是否能行动
  canAct(): boolean {
    for (const status of this.statusEffects) {
      const statusData = DataManager.getInstance().getStatus(status.type);
      if (statusData && statusData.can_act === 0) {
        return false;
      }
    }
    return this.hp > 0;
  }
  
  // 获取当前状态名称
  getStatusNames(): string[] {
    const statusNames: Record<string, string> = {
      'drunk': '醉',
      'syncope': '晕',
      'lime': '石',
      'asleep': '睡',
      'confusion': '乱',
      'poison': '毒'
    };
    
    return this.statusEffects.map(s => statusNames[s.type] || s.type);
  }
  
  // 受到伤害
  takeDamage(damage: number): number {
    const actualDamage = Math.max(1, damage - this.def * 0.5);
    this.hp = Math.max(0, this.hp - actualDamage);
    return actualDamage;
  }
  
  // 治疗
  heal(amount: number): number {
    const actualHeal = Math.min(amount, this.maxHp - this.hp);
    this.hp += actualHeal;
    return actualHeal;
  }
  
  // 恢复MP
  restoreMp(amount: number): number {
    const actualRestore = Math.min(amount, this.maxMp - this.mp);
    this.mp += actualRestore;
    return actualRestore;
  }
  
  // 消耗MP
  consumeMp(amount: number): boolean {
    if (this.mp >= amount) {
      this.mp -= amount;
      return true;
    }
    return false;
  }
  
  // 是否死亡
  isDead(): boolean {
    return this.hp <= 0;
  }
  
  // 复制实例（用于存档）
  toSaveData(): CharacterInstance {
    return {
      id: this.id,
      name: this.name,
      baseData: {
        id: 0,
        name: this.name,
        gender: this.gender,
        lv: 1,
        hp: this.baseHp,
        mp: this.baseMp,
        atk: this.baseAtk,
        def: this.baseDef,
        spd: this.baseSpd,
        evasion: this.baseEvasion,
        crit: this.baseCrit,
        hit: this.baseHit,
        toughness: this.baseToughness,
        ats: this.baseAts,
        adf: this.baseAdf,
        evasion_rate: this.evasionRate,
        crit_rate: this.critRate,
        block_rate: this.blockRate,
        atk_point: 100,
        exp: this.expValue,
        soul: this.soulValue,
        money: this.moneyValue,
        fixedskill_name: '',
        join_rate: 0,
        join_rate_hard: 0
      },
      level: this.level,
      exp: this.exp,
      hp: this.hp,
      maxHp: this.maxHp,
      mp: this.mp,
      maxMp: this.maxMp,
      atk: this.atk,
      def: this.def,
      spd: this.spd,
      evasion: this.evasion,
      crit: this.crit,
      hit: this.hit,
      toughness: this.toughness,
      ats: this.ats,
      adf: this.adf,
      evasion_rate: this.evasionRate,
      crit_rate: this.critRate,
      block_rate: this.blockRate,
      skills: [...this.skills],
      equipment: {
        weapon: null,
        armor: null,
        accessory: null
      },
      status: [...this.statusEffects]
    };
  }
  
  // 从存档恢复
  static fromSaveData(data: CharacterInstance): Character {
    const dm = DataManager.getInstance();
    const baseData = dm.getEnemy(data.name);
    
    if (!baseData) {
      throw new Error(`无法找到角色数据: ${data.name}`);
    }
    
    const char = new Character(data.id, baseData, true);
    char.level = data.level;
    char.exp = data.exp;
    char.hp = data.hp;
    char.maxHp = data.maxHp;
    char.mp = data.mp;
    char.maxMp = data.maxMp;
    char.skills = [...data.skills];
    char.statusEffects = [...data.status];
    
    return char;
  }
}
