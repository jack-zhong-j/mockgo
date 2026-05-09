# MockGo 代码审查报告

## 概览

| 项目 | 状态 |
|------|------|
| 审查日期 | 2026-05-09 |
| 技术栈 | React 18 + TypeScript + Zustand |
| 代码总行数 | ~1,200 行 |
| 严重问题 | 2 个 |
| 中等问题 | 5 个 |
| 建议优化 | 8 个 |

---

## 🔴 严重问题（需立即修复）

### 1. HomePage.tsx - 内存泄漏风险

**位置**: `src/pages/HomePage.tsx` 行 20-49

**问题**: 
- 地图实例清理逻辑存在竞态条件
- `mounted` 标志位在异步回调后检查，但 `mapInstance.current` 可能在清理后仍被引用

```typescript
// 当前代码（有风险）
return () => {
  mounted = false;
  if (mapInstance.current) {
    mapInstance.current.destroy();  // 可能重复调用
  }
};
```

**修复建议**:
```typescript
useEffect(() => {
  let isMounted = true;
  let map: any = null;
  
  loadTencentMap().then(() => {
    if (!isMounted) return;
    map = new TMap.Map(...);
    mapInstance.current = map;
  });
  
  return () => {
    isMounted = false;
    if (map) {
      map.destroy();
      mapInstance.current = null;
    }
  };
}, []);
```

---

### 2. 缺少错误边界（Error Boundary）

**位置**: 全局

**问题**: 
- 腾讯地图加载失败会导致整个应用白屏
- 没有降级 UI

**修复建议**:
```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div>地图加载失败，请检查网络连接</div>;
    }
    return this.props.children;
  }
}
```

---

## 🟡 中等问题（建议修复）

### 3. useEffect 依赖数组问题

**位置**: `HomePage.tsx` 行 49

**问题**:
```typescript
useEffect(() => { ... }, [setTarget]);  // setTarget 是稳定的，但逻辑上不需要
```

**修复**: 移除不必要的依赖，或使用 `// eslint-disable-next-line react-hooks/exhaustive-deps`

---

### 4. 频繁重渲染 - FavoritesPage

**位置**: `src/pages/FavoritesPage.tsx` 行 56-60

**问题**:
- `filteredFavorites` 每次渲染都重新计算
- 收藏列表大时影响性能

**修复建议**:
```typescript
const filteredFavorites = useMemo(() => {
  return favorites.filter((fav) => {
    const matchSearch = fav.name.includes(search) || fav.address.includes(search);
    const matchTag = activeTag === '全部' || categoryLabels[fav.category] === activeTag;
    return matchSearch && matchTag;
  });
}, [favorites, search, activeTag]);
```

---

### 5. 内联对象创建 - RoutePage

**位置**: `src/pages/RoutePage.tsx` 行 99-109

**问题**:
- `onClick` 中直接创建新对象，每次渲染都是新引用

**修复建议**:
```typescript
const handleAddWaypoint = useCallback(() => {
  addWaypoint({
    name: `途经点 ${waypoints.length + 1}`,
    coordinate: { lat: 39.9042, lng: 116.4074 },
    stayDuration: 0,
    type: waypoints.length === 0 ? 'start' : 'waypoint',
  });
}, [addWaypoint, waypoints.length]);
```

---

### 6. HistoryPage 重复计算

**位置**: `src/pages/HistoryPage.tsx` 行 8-19

**问题**:
- `groupedHistory` 和统计数据每次渲染都重新计算

**修复建议**:
```typescript
const { groupedHistory, stats } = useMemo(() => {
  const grouped = history.reduce(...);
  const totalDuration = history.reduce(...);
  return { groupedHistory: grouped, stats: { ... } };
}, [history]);
```

---

### 7. 静态 JSX 定义在组件内

**位置**: `FavoritesPage.tsx`, `RoutePage.tsx`

**问题**:
```typescript
const categoryIcons: Record<string, JSX.Element> = { ... };  // 每次渲染都创建
```

**修复建议**:
```typescript
// 移到组件外部
const CATEGORY_ICONS: Record<string, JSX.Element> = { ... };

function FavoritesPage() { ... }
```

---

## 🟢 建议优化

### 8. 状态管理优化

**位置**: `src/store/index.ts`

**现状**: 使用 Zustand 的 `persist` 中间件，但缺少以下优化：

**建议**:
```typescript
// 使用选择器减少重渲染
const useFavoriteCount = () => useFavoriteStore((s) => s.favorites.length);

// 分割 store 避免不必要的更新
const useMockActive = () => useMockStore((s) => s.isActive);
```

---

### 9. 类型定义改进

**位置**: `src/types/index.ts`

**建议**:
```typescript
// 使用更严格的类型
export type Category = 'home' | 'work' | 'travel' | 'other';

// 添加 readonly
export interface Favorite {
  readonly id: string;
  readonly createdAt: number;
  // ...
}
```

---

### 10. 组件懒加载

**位置**: `src/App.tsx`

**建议**:
```typescript
const HomePage = lazy(() => import('./pages/HomePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
// ...

<Suspense fallback={<div>Loading...</div>}>
  <Routes>...</Routes>
</Suspense>
```

---

### 11. 事件处理器优化

**位置**: 多处

**建议**: 使用 `useCallback` 包装事件处理器，避免子组件不必要的重渲染

---

### 12. CSS 优化

**建议**:
- 使用 CSS Modules 或 Styled Components 避免全局命名冲突
- 使用 `will-change` 优化动画性能

---

### 13. 可访问性（A11y）

**问题**:
- 按钮缺少 `aria-label`
- 表单没有关联的 `<label>`
- 颜色对比度可能不足

---

### 14. 测试覆盖

**建议**: 添加以下测试：
- 组件单元测试（React Testing Library）
- Store 逻辑测试
- 地图工具函数测试

---

### 15. 性能监控

**建议**: 添加 React DevTools Profiler 标记

```typescript
import { Profiler } from 'react';

<Profiler id="HomePage" onRender={onRenderCallback}>
  <HomePage />
</Profiler>
```

---

## 代码质量评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 功能正确性 | ⭐⭐⭐⭐⭐ | 功能完整，逻辑正确 |
| 性能优化 | ⭐⭐⭐ | 存在重渲染问题 |
| 代码规范 | ⭐⭐⭐⭐ | TypeScript 类型良好 |
| 可维护性 | ⭐⭐⭐⭐ | 结构清晰，需加注释 |
| 安全性 | ⭐⭐⭐ | 缺少错误边界 |

**综合评分**: 7.5/10

---

## 优先修复清单

1. [ ] 修复 HomePage 内存泄漏
2. [ ] 添加 Error Boundary
3. [ ] 使用 useMemo 优化列表过滤
4. [ ] 将静态 JSX 移出组件
5. [ ] 添加 useCallback 优化事件处理器
6. [ ] 实现组件懒加载
7. [ ] 完善可访问性支持

---

## 参考文档

- [React 性能优化](https://react.dev/reference/react)
- [Zustand 最佳实践](https://docs.pmnd.rs/zustand/guides/prevent-rerenders-with-equality-fn)
- [腾讯地图 JS API](https://lbs.qq.com/webApi/javascriptGL/glGuide/glOverview)
