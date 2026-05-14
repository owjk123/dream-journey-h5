// 战斗系统
import { Character } from '../entities/Character';
import { DataManager } from '../data/DataManager';
import { CONFIG } from '../config';
import type { BattleAction, BattleResult, SkillData } from '../data/types';

export class BattleSystem {
  private static instance: BattleSystem;
  
  // 战斗中的角色
  players: Character[] = [];
  enemies: Character[] = [];
  
  // 战斗状态
  isPlayerTurn: boolean = true;
  currentActor: Character | null = null;
  turnOrder: Character[] = [];
  currentTurnIndex: number = 0;
  battleLog: string[] = [];
  battleActions: BattleAction[] = [];
  
  // 回调
  onBattleEnd: ((result: BattleResult) => void) | null = null;
  onTurnStart: ((actor: Character) => void) | null = null;
  onActionComplete: ((action: BattleAction) => void) | null = null;
  
  private constructor() {}
  
  static getInstance(): BattleSystem {
    if (!BattleSystem.instance) {
      BattleSystem.instance = new BattleSystem();
    }
    return BattleSystem.instance;
  }
  
  // 开始战斗
  startBattle(playerTeam: Character[], enemyTeam: Character[]): void {
    this.players = playerTeam;
    this.enemies = enemyTeam;
    this.battleLog = [];
    this.battleActions = [];
    
    // 计算行动顺序（按速度排序）
    this.calculateTurnOrder();
    
    // 开始第一回合
    this.currentTurnIndex = 0;
    this.nextTurn();
  }
  
  // 计算行动顺序
  calculateTurnOrder(): void {
    const allCharacters = [...this.players, ...this.enemies]
      .filter(c => !c.isDead());
    
    this.turnOrder = allCharacters.sort((a, b) => {
      // 速度高的先行动
      const spdDiff = b.spd - a.spd;
      if (spdDiff !== 0) return spdDiff;
      // 速度相同则随机
      return Math.random() - 0.5;
    });
  }
  
  // 执行下一回合
  nextTurn(): void {
    // 检查战斗是否结束
    if (this.checkBattleEnd()) {
      return;
    }
    
    // 获取下一个角色
    while (this.currentTurnIndex < this.turnOrder.length) {
      const actor = this.turnOrder[this.currentTurnIndex];
      this.currentTurnIndex++;
      
      // 如果角色死亡或不能行动，跳过
      if (actor.isDead() || !actor.canAct()) {
        if (actor.isDead()) {
          this.battleLog.push(`${actor.name} 已阵亡`);
        } else {
          this.battleLog.push(`${actor.name} 被状态阻止行动`);
        }
        continue;
      }
      
      this.currentActor = actor;
      this.isPlayerTurn = actor.isPlayer;
      
      // 触发回合开始回调
      if (this.onTurnStart) {
        this.onTurnStart(actor);
      }
      
      // 执行AI/玩家行动
      this.executeAction(actor);
      return;
    }
    
    // 所有角色行动完毕，回合结束
    this.onRoundEnd();
  }
  
  // 执行行动
  private executeAction(actor: Character): void {
    const action: BattleAction = {
      actorId: actor.id,
      skillId: 0,
      targetIds: [],
      damage: 0,
      isCrit: false,
      isHit: true,
      statusEffects: [],
      hpChange: 0,
      mpChange: 0
    };
    
    // 选择技能
    const skill = this.selectSkill(actor);
    action.skillId = skill?.id || 0;
    
    // 选择目标
    const targets = this.selectTargets(actor, skill);
    action.targetIds = targets.map(t => t.id);
    
    if (targets.length === 0) {
      // 没有有效目标，跳过
      this.battleLog.push(`${actor.name} 没有可攻击目标`);
      this.nextTurn();
      return;
    }
    
    // 执行技能
    if (skill) {
      this.executeSkill(actor, targets, skill, action);
    } else {
      // 普通攻击
      this.executeNormalAttack(actor, targets, action);
    }
    
    // 记录行动
    this.battleActions.push(action);
    
    // 触发行动完成回调
    if (this.onActionComplete) {
      this.onActionComplete(action);
    }
    
    // 延迟后继续下一回合
    setTimeout(() => {
      this.nextTurn();
    }, CONFIG.ANIMATION.BATTLE_ACTION);
  }
  
  // 选择技能
  private selectSkill(actor: Character): SkillData | null {
    if (actor.fixedSkill) {
      const skill = DataManager.getInstance().getSkill(actor.fixedSkill);
      if (skill && actor.mp >= skill.skill_mp) {
        return skill;
      }
    }
    
    // 随机选择可用技能
    const availableSkills = actor.skills
      .map(id => DataManager.getInstance().getSkill(id))
      .filter(s => s && actor.mp >= (s?.skill_mp || 0));
    
    if (availableSkills.length > 0) {
      // 优先使用专属技能
      if (actor.fixedSkill) {
        const fixed = availableSkills.find(s => s?.id === actor.fixedSkill);
        if (fixed) return fixed;
      }
      // 随机选择
      return availableSkills[Math.floor(Math.random() * availableSkills.length)] || null;
    }
    
    return null;
  }
  
  // 选择目标
  private selectTargets(actor: Character, skill: SkillData | null): Character[] {
    const enemies = actor.isPlayer ? this.enemies : this.players;
    const allies = actor.isPlayer ? this.players : this.enemies;
    
    // 过滤存活的敌人
    const aliveEnemies = enemies.filter(e => !e.isDead());
    const aliveAllies = allies.filter(a => !a.isDead());
    
    if (aliveEnemies.length === 0) return [];
    
    // 判断技能类型
    if (!skill) {
      // 普通攻击
      return [this.selectSingleTarget(aliveEnemies)];
    }
    
    // 判断是敌我
    if (skill.camp === '敌') {
      if (skill.range === '群体') {
        return aliveEnemies;
      } else {
        return [this.selectSingleTarget(aliveEnemies)];
      }
    } else {
      // 治疗/增益技能
      if (skill.range === '群体') {
        return aliveAllies;
      } else {
        return [this.selectSingleTarget(aliveAllies)];
      }
    }
  }
  
  // 选择单个目标
  private selectSingleTarget(targets: Character[]): Character {
    if (targets.length === 0) {
      throw new Error('No targets available');
    }
    // 随机选择
    return targets[Math.floor(Math.random() * targets.length)];
  }
  
  // 执行技能
  private executeSkill(actor: Character, targets: Character[], skill: SkillData, action: BattleAction): void {
    // 消耗MP
    actor.consumeMp(skill.skill_mp);
    action.mpChange = -skill.skill_mp;
    
    // 判断是攻击还是治疗
    if (skill.camp === '敌') {
      // 攻击技能
      targets.forEach(target => {
        const damage = this.calculateDamage(actor, target, skill);
        action.damage += damage;
        const actualDamage = target.takeDamage(damage);
        action.hpChange -= actualDamage;
        
        this.battleLog.push(`${actor.name} 对 ${target.name} 使用 ${skill.skill_name}，造成 ${actualDamage} 点伤害`);
        
        // 应用状态效果
        this.applyStatusEffects(target, skill, action);
      });
    } else {
      // 治疗技能
      targets.forEach(target => {
        const healAmount = Math.floor(target.maxHp * skill.hp_up);
        const actualHeal = target.heal(healAmount);
        action.hpChange += actualHeal;
        
        this.battleLog.push(`${actor.name} 对 ${target.name} 使用 ${skill.skill_name}，恢复 ${actualHeal} 点生命`);
      });
    }
  }
  
  // 执行普通攻击
  private executeNormalAttack(actor: Character, targets: Character[], action: BattleAction): void {
    targets.forEach(target => {
      // 检查是否命中
      const hitChance = (actor.hit - target.evasion) / 1000;
      if (Math.random() > hitChance) {
        action.isHit = false;
        this.battleLog.push(`${actor.name} 攻击 ${target.name}，未命中！`);
        return;
      }
      
      // 计算伤害
      let damage = Math.floor(actor.atk * 1.0);
      
      // 检查暴击
      if (Math.random() < actor.critRate) {
        damage = Math.floor(damage * CONFIG.DAMAGE.CRIT_BONUS);
        action.isCrit = true;
        this.battleLog.push(`${actor.name} 攻击 ${target.name}，暴击！造成 ${damage} 点伤害`);
      } else {
        this.battleLog.push(`${actor.name} 攻击 ${target.name}，造成 ${damage} 点伤害`);
      }
      
      const actualDamage = target.takeDamage(damage);
      action.damage += actualDamage;
      action.hpChange -= actualDamage;
    });
  }
  
  // 计算伤害
  private calculateDamage(attacker: Character, defender: Character, skill: SkillData): number {
    let baseDamage = Math.floor(attacker.atk * skill.damage_ratio);
    
    // 属性克制
    const element = this.getSkillElement(skill);
    const defenderElement = this.getDefenderElement(defender);
    
    if (element && defenderElement) {
      const counter = CONFIG.ELEMENT_COUNTER[element];
      if (counter?.strong === defenderElement) {
        baseDamage = Math.floor(baseDamage * CONFIG.DAMAGE.ELEMENT_BONUS);
      } else if (counter?.weak === defenderElement) {
        baseDamage = Math.floor(baseDamage * CONFIG.DAMAGE.ELEMENT_PENALTY);
      }
    }
    
    // 防御减伤
    baseDamage = Math.max(1, baseDamage - defender.def * 0.5);
    
    // 随机波动
    baseDamage = Math.floor(baseDamage * (0.9 + Math.random() * 0.2));
    
    return baseDamage;
  }
  
  // 获取技能属性
  private getSkillElement(skill: SkillData): string | null {
    if (skill.water > 0) return 'water';
    if (skill.fire > 0) return 'fire';
    if (skill.poison > 0) return 'poison';
    if (skill.chaos > 0) return 'chaos';
    return null;
  }
  
  // 获取角色属性（简化版本）
  private getDefenderElement(_defender: Character): string | null {
    // 简化：敌人没有元素属性，只有技能才有
    return null;
  }
  
  // 应用状态效果
  private applyStatusEffects(target: Character, skill: SkillData, action: BattleAction): void {
    const statuses: Array<{ name: string; time: number }> = [];
    
    if (skill.drunk_status > 0) {
      target.addStatus('drunk', skill.status_time);
      statuses.push({ name: '醉酒', time: skill.status_time });
    }
    if (skill.syncope_status > 0) {
      target.addStatus('syncope', skill.status_time);
      statuses.push({ name: '晕厥', time: skill.status_time });
    }
    if (skill.poison_status > 0) {
      target.addStatus('poison', skill.status_time);
      statuses.push({ name: '中毒', time: skill.status_time });
    }
    if (skill.lime_status > 0) {
      target.addStatus('lime', skill.status_time);
      statuses.push({ name: '石灰', time: skill.status_time });
    }
    if (skill.asleep_status > 0) {
      target.addStatus('asleep', skill.status_time);
      statuses.push({ name: '睡眠', time: skill.status_time });
    }
    if (skill.confusion_status > 0) {
      target.addStatus('confusion', skill.status_time);
      statuses.push({ name: '混乱', time: skill.status_time });
    }
    
    statuses.forEach(s => {
      this.battleLog.push(`${target.name} 进入 ${s.name} 状态 (${s.time}回合)`);
      action.statusEffects.push(s.name);
    });
  }
  
  // 回合结束
  private onRoundEnd(): void {
    // 状态回合减少
    [...this.players, ...this.enemies].forEach(c => {
      c.tickStatus();
    });
    
    // 重新计算行动顺序
    this.calculateTurnOrder();
    this.currentTurnIndex = 0;
    
    // 继续下一回合
    setTimeout(() => {
      this.nextTurn();
    }, 200);
  }
  
  // 检查战斗是否结束
  private checkBattleEnd(): boolean {
    const playersAlive = this.players.filter(p => !p.isDead()).length;
    const enemiesAlive = this.enemies.filter(e => !e.isDead()).length;
    
    if (playersAlive === 0) {
      // 玩家失败
      this.endBattle(false);
      return true;
    }
    
    if (enemiesAlive === 0) {
      // 玩家胜利
      this.endBattle(true);
      return true;
    }
    
    return false;
  }
  
  // 结束战斗
  private endBattle(victory: boolean): void {
    let result: BattleResult = {
      victory,
      expGained: 0,
      moneyGained: 0,
      soulGained: 0,
      newCharacterJoined: null,
      droppedEquipment: null
    };
    
    if (victory) {
      // 计算奖励
      this.enemies.forEach(enemy => {
        result.expGained += enemy.expValue;
        result.moneyGained += enemy.moneyValue;
        result.soulGained += enemy.soulValue;
        
        // 检查是否能收服
        if (enemy.name === '小强' || enemy.name === '茅十八' || enemy.name === '双儿') {
          if (Math.random() < enemy.toSaveData().baseData.join_rate) {
            result.newCharacterJoined = enemy.name;
          }
        }
      });
      
      this.battleLog.push(`战斗胜利！获得经验: ${result.expGained}, 金币: ${result.moneyGained}, 灵魂: ${result.soulGained}`);
      
      if (result.newCharacterJoined) {
        this.battleLog.push(`${result.newCharacterJoined} 加入队伍！`);
      }
    } else {
      this.battleLog.push('战斗失败...');
    }
    
    if (this.onBattleEnd) {
      this.onBattleEnd(result);
    }
  }
  
  // 获取战斗日志
  getBattleLog(): string[] {
    return this.battleLog;
  }
  
  // 获取当前行动的角色
  getCurrentActor(): Character | null {
    return this.currentActor;
  }
  
  // 获取行动顺序
  getTurnOrder(): Character[] {
    return this.turnOrder;
  }
  
  // 是否是玩家回合
  isPlayerTurnNow(): boolean {
    return this.isPlayerTurn;
  }
}
