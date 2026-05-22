/**
 * MockGo 应用根组件
 * 配置路由和底部导航栏
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TabBar from './components/TabBar';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import HistoryPage from './pages/HistoryPage';
import RoutePage from './pages/RoutePage';
import SettingsPage from './pages/SettingsPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      {/* 页面路由配置 */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/route" element={<RoutePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      {/* 底部导航栏 */}
      <TabBar />
    </BrowserRouter>
  );
}
