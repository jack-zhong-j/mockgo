/**
 * Capacitor 配置文件
 * 定义应用 ID、名称和 Web 资源目录
 */
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mockgo.app', // 应用包名
  appName: 'MockGo', // 应用名称
  webDir: 'dist', // Web 构建产物目录
};

export default config;
