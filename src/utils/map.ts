/** 腾讯地图工具类 */

// 腾讯地图 API Key
export const TENCENT_MAP_KEY = 'TJZBZ-OZLKM-XUE6R-6DEWE-SJD5H-3OBS5';

// 地图配置
export const MAP_CONFIG = {
  defaultCenter: { lat: 39.9042, lng: 116.4074 }, // 北京
  defaultZoom: 15,
};

// 坐标格式化
export function formatCoordinate(coord: { lat: number; lng: number }): string {
  const latDir = coord.lat >= 0 ? 'N' : 'S';
  const lngDir = coord.lng >= 0 ? 'E' : 'W';
  return `${Math.abs(coord.lat).toFixed(4)}°${latDir}, ${Math.abs(coord.lng).toFixed(4)}°${lngDir}`;
}

// 解析坐标字符串
export function parseCoordinate(str: string): { lat: number; lng: number } | null {
  // 支持格式: "39.9042, 116.4074" 或 "39.9042 116.4074"
  const match = str.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

// 加载腾讯地图 JS API
export function loadTencentMap(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).TMap) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${TENCENT_MAP_KEY}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('腾讯地图加载失败'));
    document.head.appendChild(script);
  });
}

// 计算两点距离（米）
export function calculateDistance(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const R = 6371000; // 地球半径（米）
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 格式化距离
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

// 格式化时长
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
}
