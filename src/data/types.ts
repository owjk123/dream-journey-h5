// 游戏数据类型定义

// 敌人数据
export interface EnemyData {
  id: number;
  name: string;
  gender: number;
  lv: number;
  hp: number;
  mp: number;
  atk: number;
  def: number;
  spd: number;
  evasion: number;
  crit: number;
  hit: number;
  toughness: number;
  ats: number;
  adf: number;
  evasion_rate: number;
  crit_rate: number;
  block_rate: number;
  atk_point: number;
  exp: number;
  soul: number;
  money: number;
  fixedskill_name: string;
  join_rate: number;
  join_rate_hard: number;
}

// 技能数据
export interface SkillData {
  id: number;
  skill_name: string;
  skill_point: number;
  skill_mp: number;
  item_name: string;
  item_number: number;
  type: number;
  camp: string;
  range: string;
  choice: string;
  damage_ratio: number;
  common: number;
  water: number;
  fire: number;
  poison: number;
  chaos: number;
  mp_down: number;
  hp_up: number;
  mp_up: number;
  Damage_time: number;
  choice_status_obj: number;
  drunk_status: number;
  syncope_status: number;
  poison_status: number;
  lime_status: number;
  asleep_status: number;
  confusion_status: number;
  status_time: number;
  atk_up: number;
  def_up: number;
  spd_up: number;
  evasion_up: number;
  crit_up: number;
  hit_up: number;
  toughness_up: number;
  ats_up: number;
  adf_up: number;
  description: string;
  effect: string;
  master: string;
}

// 装备数据
export interface EquipmentData {
  id: number;
  name: string;
  type: string;
  grade_limit: number;
  color: string;
  hp: string;
  mp: string;
  atk_space: string;
  def_space: string;
  spd_space: string;
  evasion: string;
  crit: string;
  hit: string;
  toughness: string;
  ats: string;
  adf: string;
  exclusive_character: string;
  sale_money: number;
  money_add: number;
}

// 天气数据
export interface WeatherData {
  id: number;
  wea_name: string;
  wea_start_rate: number;
  wea_inside_rate: number;
  wea_rain_rate: number;
  wea_night_rate: number;
  wea_time: number;
  wea_message: string;
}

// 状态数据
export interface StatusData {
  id: number;
  status_name: string;
  can_act: number;
  can_asleep: number;
  can_confusion: number;
  can_poison: number;
  hit_down: number;
  toughness_down: number;
  fire_damage: number;
  water_damage: number;
}

// 道具数据
export interface PropData {
  id: number;
  name: string;
  message: string;
  rate: number;
  coupon: number;
  type: number;
  restrict: number;
}

// 升级数据（角色成长）
export interface LevelUpData {
  id: number;
  name: string;
  hp: number;
  mp: number;
  atk: number;
  def: number;
  basic_exp: number;
  exp_add: number;
}

// 经验表数据
export interface LevelUpExpData {
  lv: number;
  exp: number;
  skill_id: number;
  prop: string;
  Dice_value: number;
  gold: number;
  soul: number;
  exp_3hours: number;
  exp_12hours: number;
  exp_conpou: number;
}

// 关卡敌人配置
export interface BattleDispositionData {
  id: number;
  level_name: string;
  difficulty: number;
  lowest_grade: number;
  highest_grade: number;
  first_in: number;
  second_in: number;
  third_in: number;
  enemy_name: string;
  elite_name: string;
  elite_grade: number;
  boss_name: string;
  boss_grade: number;
  boss_character: string;
  boss_character_rate: number;
  night_enemy_name: string;
  rain_enemy_name: string;
  thunder_enemy_name: string;
  wind_enemy_name: string;
}

// 关卡敌人等级成长
export interface LevelUpEnemyData {
  id: number;
  name: string;
  hp: number;
  mp: number;
  atk: number;
  def: number;
  exp_add: number;
  soul_add: number;
  money_add: number;
}

// 角色实例
export interface CharacterInstance {
  id: string;
  name: string;
  baseData: EnemyData;
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  spd: number;
  evasion: number;
  crit: number;
  hit: number;
  toughness: number;
  ats: number;
  adf: number;
  evasion_rate: number;
  crit_rate: number;
  block_rate: number;
  skills: number[];
  equipment: {
    weapon: number | null;
    armor: number | null;
    accessory: number | null;
  };
  status: Array<{ type: string; time: number }>;
}

// 游戏存档
export interface GameSave {
  version: number;
  currentChapter: number;
  currentLevel: string;
  difficulty: number;
  money: number;
  soul: number;
  props: { [propId: number]: number };
  characters: CharacterInstance[];
  currentWeather: number;
  playCount: number;
  lastPlayTime: number;
}

// 战斗回合
export interface BattleAction {
  actorId: string;
  skillId: number;
  targetIds: string[];
  damage: number;
  isCrit: boolean;
  isHit: boolean;
  statusEffects: string[];
  hpChange: number;
  mpChange: number;
}

// 战斗结果
export interface BattleResult {
  victory: boolean;
  expGained: number;
  moneyGained: number;
  soulGained: number;
  newCharacterJoined: string | null;
  droppedEquipment: number | null;
}

// 格子数据
export interface TileData {
  index: number;
  type: number;
  x: number;
  y: number;
  event?: number;
}
