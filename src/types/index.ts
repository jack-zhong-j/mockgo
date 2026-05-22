/** MockGo 全局类型定义 */

/** 坐标点 */
export interface Coordinate {
  lat: number; // 纬度
  lng: number; // 经度
}

// ===== 腾讯地图类型定义 =====

/** 腾讯地图经纬度 */
export interface TMapLatLng {
  lat: number;
  lng: number;
}

/** 腾讯地图标记点几何信息 */
export interface TMapMarkerGeometry {
  id: string;
  position: TMapLatLng;
}

/** 腾讯地图多点标记配置 */
export interface TMapMultiMarkerOptions {
  map: any;
  geometries: TMapMarkerGeometry[];
}

/** 腾讯地图地理编码结果 */
export interface TMapGeocoderResult {
  result: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

/** 腾讯地图初始化配置 */
export interface TMapMapOptions {
  center: TMapLatLng;
  zoom: number;
  viewMode: '2D' | '3D';
}

/** 收藏地点分类类型 */
export type FavoriteCategory = 'home' | 'work' | 'travel' | 'other';

/** 收藏地点 */
export interface Favorite {
  id: string;
  name: string; // 地点名称
  address: string; // 地址描述
  coordinate: Coordinate; // 坐标
  category: FavoriteCategory; // 分类
  createdAt: number; // 创建时间戳
}

/** 历史记录项 */
export interface HistoryItem {
  id: string;
  name: string; // 地点名称
  coordinate: Coordinate; // 坐标
  startTime: number; // 开始时间戳
  duration: number; // 持续时长（分钟）
}

/** 途经点类型 */
export type WaypointType = 'start' | 'waypoint' | 'end';

/** 路线途经点 */
export interface Waypoint {
  id: string;
  name: string; // 途经点名称
  coordinate: Coordinate; // 坐标
  stayDuration: number; // 停留时长（分钟）
  type: WaypointType; // 途经点类型
}

/** 移动模式 */
export type MoveMode = 'walk' | 'bike' | 'drive' | 'free';

/** 应用设置 */
export interface AppSettings {
  theme: 'light' | 'dark'; // 主题
  privacyMode: boolean; // 隐私模式
  notification: boolean; // 通知提醒
  accuracy: number; // 模拟精度（米）
  moveSpeed: 'slow' | 'normal' | 'fast'; // 移动速度
}

/** 模拟定位状态 */
export interface MockState {
  isActive: boolean; // 是否正在模拟
  currentCoordinate: Coordinate | null; // 当前坐标
  targetCoordinate: Coordinate | null; // 目标坐标
}
