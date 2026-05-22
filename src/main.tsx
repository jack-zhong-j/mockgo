/**
 * MockGo 应用入口文件
 * 使用 StrictMode 包裹以启用开发时的额外检查
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// 挂载应用到根节点
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
