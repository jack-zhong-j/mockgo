/** MockGo 类型定义 */

// 坐标点
export interface Coordinate {
  lat: number;
  lng: number;
}

// 收藏地点
export interface Favorite {
  id: string;
  name: string;
  address: string;
  coordinate: Coordinate;
  category: 'home' | 'work' | 'travel' | 'other';
  createdAt: number;
}

// 历史记录
export interface HistoryItem {
  id: string;
  name: string;
  coordinate: Coordinate;
  startTime: number;
  duration: number; // 分钟
}

// 路线途经点
export interface Waypoint {
  id: string;
  name: string;
  coordinate: Coordinate;
  stayDuration: number; // 分钟
  type: 'start' | 'waypoint' | 'end';
}

// 移动模式
export type MoveMode = 'walk' | 'bike' | 'drive' | 'free';

// 应用设置
export interface AppSettings {
  theme: 'light' | 'dark';
  privacyMode: boolean;
  notification: boolean;
  accuracy: number; // 米
  moveSpeed: 'slow' | 'normal' | 'fast';
}

// 模拟状态
export interface MockState {
  isActive: boolean;
  currentCoordinate: Coordinate | null;
  targetCoordinate: Coordinate | null;
}
