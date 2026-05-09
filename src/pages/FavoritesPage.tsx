import { useState, useMemo, useCallback } from 'react';
import { useFavoriteStore, useMockStore } from '../store';
import { formatCoordinate } from '../utils/map';
import type { Favorite } from '../types';
import './FavoritesPage.css';

// 静态数据移到组件外
const CATEGORY_ICONS: Record<string, JSX.Element> = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  work: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  travel: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  other: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

const CATEGORY_COLORS: Record<string, string> = {
  home: 'blue',
  work: 'green',
  travel: 'orange',
  other: 'purple',
};

const CATEGORY_LABELS: Record<string, string> = {
  home: '家',
  work: '公司',
  travel: '旅行',
  other: '其他',
};

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavoriteStore();
  const { setTarget } = useMockStore();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('全部');

  // 使用 useMemo 优化过滤计算
  const filteredFavorites = useMemo(() => {
    return favorites.filter((fav) => {
      const matchSearch = fav.name.includes(search) || fav.address.includes(search);
      const matchTag = activeTag === '全部' || CATEGORY_LABELS[fav.category] === activeTag;
      return matchSearch && matchTag;
    });
  }, [favorites, search, activeTag]);

  const handleSelect = useCallback((fav: Favorite) => {
    setTarget(fav.coordinate);
  }, [setTarget]);

  const handleRemove = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeFavorite(id);
  }, [removeFavorite]);

  return (
    <div className="page favorites-page">
      <div className="page-header">
        <h1>收藏地点</h1>
        <p>共 {favorites.length} 个收藏</p>
      </div>

      <div className="search-filter">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="搜索收藏地点..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="fav-tags">
        {['全部', '家', '公司', '旅行', '其他'].map((tag) => (
          <span
            key={tag}
            className={`tag ${activeTag === tag ? 'active' : ''}`}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="fav-list">
        {filteredFavorites.map((fav) => (
          <div key={fav.id} className="card fav-card" onClick={() => handleSelect(fav)}>
            <div className={`fav-icon ${CATEGORY_COLORS[fav.category]}`}>
              {CATEGORY_ICONS[fav.category]}
            </div>
            <div className="fav-info">
              <h4>{fav.name}</h4>
              <p>{fav.address}</p>
              <span className="fav-coord">{formatCoordinate(fav.coordinate)}</span>
            </div>
            <button
              className="fav-delete"
              onClick={(e) => handleRemove(e, fav.id)}
              aria-label="删除收藏"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}

        {filteredFavorites.length === 0 && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <p>暂无收藏地点</p>
          </div>
        )}
      </div>
    </div>
  );
}
