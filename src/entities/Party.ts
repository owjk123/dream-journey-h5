// 玩家队伍管理
import { Character } from './Character';
import type { GameSave, CharacterInstance } from '../data/types';

export class Party {
  private static instance: Party;
  
  leader: Character | null = null;
  members: Character[] = [];
  maxMembers: number = 4;
  
  private constructor() {}
  
  static getInstance(): Party {
    if (!Party.instance) {
      Party.instance = new Party();
    }
    return Party.instance;
  }
  
  // 添加角色
  addMember(character: Character): boolean {
    if (this.members.length >= this.maxMembers) {
      return false;
    }
    if (!this.members.find(c => c.id === character.id)) {
      this.members.push(character);
      if (!this.leader) {
        this.leader = character;
      }
      return true;
    }
    return false;
  }
  
  // 移除角色
  removeMember(characterId: string): boolean {
    const index = this.members.findIndex(c => c.id === characterId);
    if (index !== -1) {
      const removed = this.members.splice(index, 1)[0];
      if (this.leader?.id === characterId) {
        this.leader = this.members[0] || null;
      }
      return true;
    }
    return false;
  }
  
  // 获取所有活着的角色
  getAliveMembers(): Character[] {
    return this.members.filter(c => !c.isDead());
  }
  
  // 获取所有成员
  getAllMembers(): Character[] {
    return [...this.members];
  }
  
  // 检查是否全灭
  isDefeated(): boolean {
    return this.getAliveMembers().length === 0;
  }
  
  // 复活所有成员
  reviveAll(): void {
    this.members.forEach(c => {
      c.hp = c.maxHp;
      c.mp = c.maxMp;
    });
  }
  
  // 恢复所有成员
  healAll(percent: number): void {
    this.members.forEach(c => {
      if (!c.isDead()) {
        c.heal(Math.floor(c.maxHp * percent));
      }
    });
  }
  
  // 获取可战斗角色（按速度排序）
  getBattleReady(): Character[] {
    return this.getAliveMembers()
      .filter(c => c.canAct())
      .sort((a, b) => b.spd - a.spd);
  }
  
  // 保存到存档
  toSaveData(): CharacterInstance[] {
    return this.members.map(c => c.toSaveData());
  }
  
  // 从存档加载
  loadFromSave(data: CharacterInstance[]): void {
    this.members = data.map(c => Character.fromSaveData(c));
    this.leader = this.members[0] || null;
  }
  
  // 清空队伍
  clear(): void {
    this.members = [];
    this.leader = null;
  }
}
