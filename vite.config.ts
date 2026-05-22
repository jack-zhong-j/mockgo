/**
 * Vite 构建配置
 * 配置 React 插件以支持 JSX 转换
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
