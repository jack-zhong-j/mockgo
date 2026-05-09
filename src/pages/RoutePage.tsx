import { useCallback } from 'react';
import { useRouteStore, useMockStore } from '../store';
import type { MoveMode } from '../types';
import './RoutePage.css';

// 静态数据移到组件外
const MODE_ICONS: Record<MoveMode, JSX.Element> = {
  walk: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M13 4v16m-4-4l4 4 4-4M7 4h10" />
    </svg>
  ),
  bike: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2" />
    </svg>
  ),
  drive: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  free: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
};

const MODE_LABELS: Record<MoveMode, string> = {
  walk: '步行',
  bike: '骑行',
  drive: '驾车',
  free: '自由',
};

export default function RoutePage() {
  const { waypoints, moveMode, addWaypoint, removeWaypoint, setMoveMode, clearRoute } = useRouteStore();
  const { setTarget } = useMockStore();

  const handleStartRoute = useCallback(() => {
    if (waypoints.length > 0) {
      setTarget(waypoints[0].coordinate);
    }
  }, [waypoints, setTarget]);

  const handleAddWaypoint = useCallback(() => {
    addWaypoint({
      name: `途经点 ${waypoints.length + 1}`,
      coordinate: { lat: 39.9042, lng: 116.4074 },
      stayDuration: 0,
      type: waypoints.length === 0 ? 'start' : 'waypoint',
    });
  }, [addWaypoint, waypoints.length]);

  const handleModeChange = useCallback((mode: MoveMode) => {
    setMoveMode(mode);
  }, [setMoveMode]);

  const handleRemove = useCallback((id: string) => {
    removeWaypoint(id);
  }, [removeWaypoint]);

  return (
    <div className="page route-page">
      <div className="page-header">
        <h1>路线规划</h1>
        {waypoints.length > 0 && (
          <button className="clear-btn" onClick={clearRoute}>
            清空
          </button>
        )}
      </div>

      <div className="route-mode-selector">
        {(Object.keys(MODE_ICONS) as MoveMode[]).map((mode) => (
          <button
            key={mode}
            className={`mode-btn ${moveMode === mode ? 'active' : ''}`}
            onClick={() => handleModeChange(mode)}
            aria-label={MODE_LABELS[mode]}
          >
            {MODE_ICONS[mode]}
            <span>{MODE_LABELS[mode]}</span>
          </button>
        ))}
      </div>

      <div className="route-waypoints">
        {waypoints.map((wp, index) => (
          <div key={wp.id}>
            <div className="card waypoint-card">
              <div className={`waypoint-number ${wp.type}`}>
                {wp.type === 'start' ? 'A' : wp.type === 'end' ? 'B' : index}
              </div>
              <div className="waypoint-info">
                <h4>{wp.name}</h4>
                {wp.stayDuration > 0 && <p>停留 {wp.stayDuration} 分钟</p>}
              </div>
              <button className="waypoint-delete" onClick={() => handleRemove(wp.id)} aria-label="删除途经点">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {index < waypoints.length - 1 && <div className="waypoint-connector" />}
          </div>
        ))}
      </div>

      <button
        className="add-waypoint-btn"
        onClick={handleAddWaypoint}
        aria-label="添加途经点"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        添加途经点
      </button>

      {waypoints.length >= 2 && (
        <>
          <div className="route-summary card">
            <div className="route-summary-item">
              <div className="route-value">5.2</div>
              <div className="route-label">公里</div>
            </div>
            <div className="route-summary-item">
              <div className="route-value">48</div>
              <div className="route-label">分钟</div>
            </div>
            <div className="route-summary-item">
              <div className="route-value">{waypoints.length}</div>
              <div className="route-label">途经点</div>
            </div>
          </div>

          <button className="btn btn-primary start-route-btn" onClick={handleStartRoute}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            开始模拟路线
          </button>
        </>
      )}

      {waypoints.length === 0 && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
          <p>点击上方添加途经点</p>
        </div>
      )}
    </div>
  );
}
