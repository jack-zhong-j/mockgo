/** 腾讯地图工具类 */

// 腾讯地图 API Key（从环境变量读取，避免硬编码）
export const TENCENT_MAP_KEY = import.meta.env.VITE_TENCENT_MAP_KEY || '';

// 地图默认配置
export const MAP_CONFIG = {
  defaultCenter: { lat: 39.9042, lng: 116.4074 }, // 默认中心点：北京
  defaultZoom: 15, // 默认缩放级别
};

/** 坐标格式化：将坐标转为可读字符串（如 39.9042°N, 116.4074°E） */
export function formatCoordinate(coord: { lat: number; lng: number }): string {
  const latDir = coord.lat >= 0 ? 'N' : 'S';
  const lngDir = coord.lng >= 0 ? 'E' : 'W';
  return `${Math.abs(coord.lat).toFixed(4)}°${latDir}, ${Math.abs(coord.lng).toFixed(4)}°${lngDir}`;
}

/** 解析坐标字符串，支持格式: "39.9042, 116.4074" 或 "39.9042 116.4074" */
export function parseCoordinate(str: string): { lat: number; lng: number } | null {
  const match = str.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  if (isNaN(lat) || isNaN(lng)) return null;
  // 坐标范围校验
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

/** 加载腾讯地图 JS API，带超时和 TMap 对象校验 */
export function loadTencentMap(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 如果 TMap 已加载，直接返回
    if ((window as any).TMap) {
      resolve();
      return;
    }

    // 超时定时器：15秒
    const timeout = setTimeout(() => {
      reject(new Error('腾讯地图加载超时（15秒）'));
    }, 15000);

    const script = document.createElement('script');
    script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${TENCENT_MAP_KEY}`;

    script.onload = () => {
      clearTimeout(timeout);
      // 校验 TMap 对象是否正确加载
      if ((window as any).TMap) {
        resolve();
      } else {
        reject(new Error('腾讯地图加载失败：TMap 对象未找到'));
      }
    };

    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('腾讯地图脚本加载失败，请检查网络连接'));
    };

    document.head.appendChild(script);
  });
}

/** 使用 Haversine 公式计算两点之间的球面距离（单位：米） */
export function calculateDistance(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const R = 6371000; // 地球平均半径（米）
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

/** 格式化距离显示：小于1公里显示米，否则显示公里 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/** 格式化时长显示：小于60分钟显示分钟，否则显示小时和分钟 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
}
