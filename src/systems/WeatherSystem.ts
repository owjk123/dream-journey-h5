// 天气系统
import { DataManager } from '../data/DataManager';
import { CONFIG } from '../config';

export class WeatherSystem {
  private static instance: WeatherSystem;
  
  currentWeatherId: number = 1;
  turnCounter: number = 0;
  weatherChangeInterval: number = 5; // 每5回合可能变换天气
  
  private constructor() {}
  
  static getInstance(): WeatherSystem {
    if (!WeatherSystem.instance) {
      WeatherSystem.instance = new WeatherSystem();
    }
    return WeatherSystem.instance;
  }
  
  // 初始化天气
  init(weatherId?: number): void {
    if (weatherId) {
      this.currentWeatherId = weatherId;
    } else {
      this.currentWeatherId = this.randomWeather();
    }
    this.turnCounter = 0;
  }
  
  // 获取当前天气
  getCurrentWeather(): { id: number; name: string; moveMultiplier: number; visibleRange: number; lightning?: boolean; tornado?: boolean } {
    switch (this.currentWeatherId) {
      case 1: return CONFIG.WEATHER.SUNNY;
      case 2: return CONFIG.WEATHER.NIGHT;
      case 3: return CONFIG.WEATHER.RAIN;
      case 4: return CONFIG.WEATHER.THUNDER;
      case 5: return CONFIG.WEATHER.WIND;
      default: return CONFIG.WEATHER.SUNNY;
    }
  }
  
  // 获取天气名称
  getWeatherName(): string {
    const weather = this.getCurrentWeather();
    return weather.name;
  }
  
  // 获取移动倍率（雨天*2）
  getMoveMultiplier(): number {
    return this.getCurrentWeather().moveMultiplier;
  }
  
  // 获取视野范围（黑夜/大风只有2格）
  getVisibleRange(): number {
    return this.getCurrentWeather().visibleRange;
  }
  
  // 回合结束，可能变换天气
  onTurnEnd(): boolean {
    this.turnCounter++;
    
    // 检查是否可能变换天气
    if (this.turnCounter >= this.weatherChangeInterval) {
      this.turnCounter = 0;
      return this.tryChangeWeather();
    }
    
    return false;
  }
  
  // 尝试变换天气
  private tryChangeWeather(): boolean {
    const dm = DataManager.getInstance();
    const weatherData = dm.getWeather(this.currentWeatherId);
    
    if (!weatherData) return false;
    
    // 根据当前天气获取转换概率
    let rate: number;
    if (this.currentWeatherId === 1) {
      // 晴天
      rate = weatherData.wea_inside_rate;
    } else if (this.currentWeatherId === 2 || this.currentWeatherId === 5) {
      // 黑夜/大风
      rate = weatherData.wea_night_rate;
    } else {
      // 雨天/雷雨
      rate = weatherData.wea_rain_rate;
    }
    
    // 随机判定
    if (Math.random() < rate) {
      const newWeather = this.randomWeather();
      if (newWeather !== this.currentWeatherId) {
        this.currentWeatherId = newWeather;
        return true;
      }
    }
    
    return false;
  }
  
  // 随机生成天气
  private randomWeather(): number {
    const dm = DataManager.getInstance();
    
    // 晴天概率最高
    const sunny = dm.getWeather(1);
    const night = dm.getWeather(2);
    const rain = dm.getWeather(3);
    
    if (!sunny || !night || !rain) return 1;
    
    const rand = Math.random();
    let cumulative = 0;
    
    cumulative += sunny.wea_start_rate;
    if (rand < cumulative) return 1;
    
    cumulative += night.wea_start_rate;
    if (rand < cumulative) return 2;
    
    cumulative += rain.wea_start_rate;
    if (rand < cumulative) return 3;
    
    return 1; // 默认晴天
  }
  
  // 强制设置天气
  setWeather(weatherId: number): void {
    this.currentWeatherId = weatherId;
    this.turnCounter = 0;
  }
  
  // 检查是否有闪电（雷雨天气）
  hasLightning(): boolean {
    return this.currentWeatherId === 4;
  }
  
  // 检查是否有龙卷风（大风天气）
  hasTornado(): boolean {
    return this.currentWeatherId === 5;
  }
  
  // 雷雨天气是否被雷劈中（25%概率）
  checkLightningStrike(): boolean {
    if (this.hasLightning()) {
      return Math.random() < 0.25;
    }
    return false;
  }
  
  // 大风天气随机传送
  checkTornadoTeleport(): boolean {
    if (this.hasTornado()) {
      return Math.random() < 0.2;
    }
    return false;
  }
  
  // 获取天气消息
  getWeatherMessage(): string {
    const dm = DataManager.getInstance();
    const weatherData = dm.getWeather(this.currentWeatherId);
    return weatherData?.wea_message || '';
  }
}
