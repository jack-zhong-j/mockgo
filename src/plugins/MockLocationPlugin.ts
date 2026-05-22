import { registerPlugin } from '@capacitor/core';

/**
 * 模拟定位插件接口定义
 * 与 Android 原生 MockLocationPlugin 对应
 */
export interface MockLocationPlugin {
  /** 启动模拟定位 */
  startMocking(options: { lat: number; lng: number }): Promise<void>;
  /** 停止模拟定位 */
  stopMocking(): Promise<void>;
  /** 查询模拟状态，返回是否激活及当前坐标 */
  isMocking(): Promise<{ isActive: boolean; lat: number; lng: number }>;
}

/** 模拟定位插件实例 */
const MockLocation = registerPlugin<MockLocationPlugin>('MockLocation');

export default MockLocation;
