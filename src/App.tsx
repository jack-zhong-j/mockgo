import { lazy, Suspense, Profiler, type ProfilerOnRenderCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TabBar from './components/TabBar';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const RoutePage = lazy(() => import('./pages/RoutePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration
) => {
  console.log(`[Profiler] ${id} - ${phase}: ${actualDuration.toFixed(2)}ms`);
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<div className="loading">加载中...</div>}>
          <Routes>
            <Route
              path="/"
              element={
                <Profiler id="HomePage" onRender={onRenderCallback}>
                  <HomePage />
                </Profiler>
              }
            />
            <Route
              path="/favorites"
              element={
                <Profiler id="FavoritesPage" onRender={onRenderCallback}>
                  <FavoritesPage />
                </Profiler>
              }
            />
            <Route
              path="/history"
              element={
                <Profiler id="HistoryPage" onRender={onRenderCallback}>
                  <HistoryPage />
                </Profiler>
              }
            />
            <Route
              path="/route"
              element={
                <Profiler id="RoutePage" onRender={onRenderCallback}>
                  <RoutePage />
                </Profiler>
              }
            />
            <Route
              path="/settings"
              element={
                <Profiler id="SettingsPage" onRender={onRenderCallback}>
                  <SettingsPage />
                </Profiler>
              }
            />
          </Routes>
        </Suspense>
        <TabBar />
      </BrowserRouter>
    </ErrorBoundary>
  );
}