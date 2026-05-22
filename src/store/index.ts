import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Favorite, HistoryItem, Waypoint, AppSettings, Coordinate, MoveMode } from '../types';

/** 生成唯一ID */
const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

// ===== 模拟状态 Store =====
interface MockStore {
  isActive: boolean;
  currentCoordinate: Coordinate | null;
  targetCoordinate: Coordinate | null;
  setTarget: (coord: Coordinate) => void;
  toggleMock: () => void;
  reset: () => void;
}

export const useMockStore = create<MockStore>()(
  persist(
    (set) => ({
      isActive: false,
      currentCoordinate: null,
      targetCoordinate: null,
      setTarget: (coord) => set({ targetCoordinate: coord }),
      toggleMock: () => set((state) => ({ isActive: !state.isActive })),
      reset: () => set({ isActive: false, currentCoordinate: null, targetCoordinate: null }),
    }),
    { name: 'mockgo-mock-state' }
  )
);

// ===== 收藏 Store =====
interface FavoriteStore {
  favorites: Favorite[];
  /** 添加收藏 */
  addFavorite: (fav: Omit<Favorite, 'id' | 'createdAt'>) => void;
  /** 删除收藏 */
  removeFavorite: (id: string) => void;
  /** 更新收藏信息 */
  updateFavorite: (id: string, updates: Partial<Favorite>) => void;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set) => ({
      favorites: [],
      addFavorite: (fav) =>
        set((state) => ({
          favorites: [
            ...state.favorites,
            { ...fav, id: generateId(), createdAt: Date.now() },
          ],
        })),
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        })),
      updateFavorite: (id, updates) =>
        set((state) => ({
          favorites: state.favorites.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        })),
    }),
    { name: 'mockgo-favorites' }
  )
);

// ===== 历史记录 Store =====
interface HistoryStore {
  history: HistoryItem[];
  /** 添加历史记录（最多保留100条） */
  addHistory: (item: Omit<HistoryItem, 'id'>) => void;
  /** 清空所有历史记录 */
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (item) =>
        set((state) => ({
          history: [{ ...item, id: generateId() }, ...state.history].slice(0, 100),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    { name: 'mockgo-history' }
  )
);

// ===== 路线 Store =====
interface RouteStore {
  waypoints: Waypoint[];
  moveMode: MoveMode;
  /** 添加途经点 */
  addWaypoint: (wp: Omit<Waypoint, 'id'>) => void;
  /** 删除途经点 */
  removeWaypoint: (id: string) => void;
  /** 更新途经点信息 */
  updateWaypoint: (id: string, updates: Partial<Waypoint>) => void;
  /** 设置移动模式 */
  setMoveMode: (mode: MoveMode) => void;
  /** 清空路线 */
  clearRoute: () => void;
}

export const useRouteStore = create<RouteStore>((set) => ({
  waypoints: [],
  moveMode: 'walk',
  addWaypoint: (wp) =>
    set((state) => ({
      waypoints: [...state.waypoints, { ...wp, id: generateId() }],
    })),
  removeWaypoint: (id) =>
    set((state) => ({
      waypoints: state.waypoints.filter((w) => w.id !== id),
    })),
  updateWaypoint: (id, updates) =>
    set((state) => ({
      waypoints: state.waypoints.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    })),
  setMoveMode: (mode) => set({ moveMode: mode }),
  clearRoute: () => set({ waypoints: [] }),
}));

// ===== 设置 Store =====
/** 默认应用设置 */
const defaultSettings: AppSettings = {
  theme: 'light',
  privacyMode: true,
  notification: true,
  accuracy: 10,
  moveSpeed: 'normal',
};

interface SettingsStore {
  settings: AppSettings;
  /** 更新设置项 */
  updateSettings: (updates: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
    }),
    { name: 'mockgo-settings' }
  )
);
