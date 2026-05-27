import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Favorite, HistoryItem, Waypoint, AppSettings, Coordinate, MoveMode } from '../types';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

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

export const useIsMockActive = () => useMockStore((s) => s.isActive);
export const useTargetCoordinate = () => useMockStore((s) => s.targetCoordinate);

interface FavoriteStore {
  favorites: Favorite[];
  addFavorite: (fav: Omit<Favorite, 'id' | 'createdAt'>) => void;
  removeFavorite: (id: string) => void;
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

export const useFavoriteCount = () => useFavoriteStore((s) => s.favorites.length);

interface HistoryStore {
  history: HistoryItem[];
  addHistory: (item: Omit<HistoryItem, 'id'>) => void;
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

export const useHistoryCount = () => useHistoryStore((s) => s.history.length);

interface RouteStore {
  waypoints: Waypoint[];
  moveMode: MoveMode;
  addWaypoint: (wp: Omit<Waypoint, 'id'>) => void;
  removeWaypoint: (id: string) => void;
  updateWaypoint: (id: string, updates: Partial<Waypoint>) => void;
  setMoveMode: (mode: MoveMode) => void;
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

export const useWaypointCount = () => useRouteStore((s) => s.waypoints.length);

const defaultSettings: AppSettings = {
  theme: 'light',
  privacyMode: true,
  notification: true,
  accuracy: 10,
  moveSpeed: 'normal',
};

interface SettingsStore {
  settings: AppSettings;
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