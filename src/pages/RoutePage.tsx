/**
 * 路线规划页面
 * 支持多途经点添加、移动模式选择和完整的路线模拟
 */
import { useState, useCallback, useEffect } from 'react';
import { useRouteStore, useMockStore, useHistoryStore } from '../store';
import MockLocation from '../plugins/MockLocationPlugin';
import { calculateDistance, formatDistance, formatDuration } from '../utils/map';
import type { MoveMode, Waypoint } from '../types';
import './RoutePage.css';

/** 移动模式对应的图标 */
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

/** 移动模式对应的中文标签 */
const MODE_LABELS: Record<MoveMode, string> = {
  walk: '步行',
  bike: '骑行',
  drive: '驾车',
  free: '自由',
};

/** 移动速度映射（米/秒） */
const MOVE_SPEEDS: Record<MoveMode, number> = {
  walk: 1.2,    // 步行约 4.3 km/h
  bike: 5,      // 骑行约 18 km/h
  drive: 15,    // 驾车约 54 km/h
  free: 10,     // 自由模式中等速度
};

export default function RoutePage() {
  const { waypoints, moveMode, addWaypoint, removeWaypoint, setMoveMode, clearRoute } = useRouteStore();
  const { setTarget, toggleMock } = useMockStore();
  const { addHistory } = useHistoryStore();
  
  // 路线模拟状态
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [routeStartTime, setRouteStartTime] = useState<number | null>(null);
  const [currentSegmentProgress, setCurrentSegmentProgress] = useState(0);

  /** 计算路线总距离和预计时间 */
  const calculateRouteStats = useCallback(() => {
    if (waypoints.length < 2) return { totalDistance: 0, totalTime: 0 };
    
    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      totalDistance += calculateDistance(
        waypoints[i].coordinate,
        waypoints[i + 1].coordinate
      );
    }
    
    const speed = MOVE_SPEEDS[moveMode];
    const travelTime = totalDistance / speed / 60; // 分钟
    const stayTime = waypoints.reduce((sum, wp) => sum + wp.stayDuration, 0);
    
    return {
      totalDistance,
      totalTime: Math.round(travelTime + stayTime),
    };
  }, [waypoints, moveMode]);

  const routeStats = calculateRouteStats();

  /** 线性插值计算两点之间的坐标 */
  const interpolateCoordinate = (
    start: Waypoint,
    end: Waypoint,
    t: number
  ) => {
    return {
      lat: start.coordinate.lat + (end.coordinate.lat - start.coordinate.lat) * t,
      lng: start.coordinate.lng + (end.coordinate.lng - start.coordinate.lng) * t,
    };
  };

  /** 执行单个路段的移动 */
  const moveToNextWaypoint = useCallback(async (
    from: Waypoint,
    to: Waypoint,
    onProgress: (progress: number) => void
  ) => {
    const distance = calculateDistance(from.coordinate, to.coordinate);
    const speed = MOVE_SPEEDS[moveMode];
    const duration = distance / speed * 1000; // 毫秒
    const startTime = Date.now();
    
    const updateInterval = 100; // 每100ms更新一次
    
    return new Promise<void>((resolve) => {
      const updatePosition = () => {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        
        onProgress(t);
        
        // 使用 ease-out 缓动函数
        const easedT = 1 - Math.pow(1 - t, 3);
        const currentCoord = interpolateCoordinate(from, to, easedT);
        
        // 更新模拟位置
        MockLocation.startMocking({
          lat: currentCoord.lat,
          lng: currentCoord.lng,
        }).catch(() => {});
        
        setTarget(currentCoord);
        
        if (t < 1) {
          setTimeout(updatePosition, updateInterval);
        } else {
          resolve();
        }
      };
      
      updatePosition();
    });
  }, [moveMode, setTarget]);

  /** 执行停留 */
  const stayAtWaypoint = useCallback(async (durationMinutes: number) => {
    if (durationMinutes <= 0) return;
    
    const durationMs = durationMinutes * 60 * 1000;
    await new Promise(resolve => setTimeout(resolve, durationMs));
  }, []);

  /** 完整的路线模拟流程 */
  const executeRouteSimulation = useCallback(async () => {
    if (waypoints.length < 2) return;
    
    setIsSimulating(true);
    setCurrentWaypointIndex(0);
    setProgress(0);
    setRouteStartTime(Date.now());
    
    try {
      // 启动模拟
      await MockLocation.startMocking({
        lat: waypoints[0].coordinate.lat,
        lng: waypoints[0].coordinate.lng,
      });
      toggleMock();
      setTarget(waypoints[0].coordinate);
      
      // 遍历途经点
      for (let i = 0; i < waypoints.length - 1; i++) {
        setCurrentWaypointIndex(i);
        
        // 移动到下一个途经点
        await moveToNextWaypoint(
          waypoints[i],
          waypoints[i + 1],
          (segmentProgress) => {
            const totalSegments = waypoints.length - 1;
            const baseProgress = i / totalSegments;
            const segmentWeight = 1 / totalSegments;
            setProgress(baseProgress + segmentProgress * segmentWeight);
            setCurrentSegmentProgress(segmentProgress);
          }
        );
        
        setCurrentSegmentProgress(0);
        
        // 在途经点停留（最后一个点不停留）
        if (i < waypoints.length - 2 && waypoints[i + 1].stayDuration > 0) {
          await stayAtWaypoint(waypoints[i + 1].stayDuration);
        }
      }
      
      // 完成路线
      setCurrentWaypointIndex(waypoints.length - 1);
      setProgress(1);
      
      // 记录历史
      if (routeStartTime) {
        const duration = Math.round((Date.now() - routeStartTime) / 60000);
        addHistory({
          name: `路线模拟 (${waypoints[0].name} → ${waypoints[waypoints.length - 1].name})`,
          coordinate: waypoints[waypoints.length - 1].coordinate,
          startTime: routeStartTime,
          duration,
        });
      }
      
    } catch (error) {
      console.error('路线模拟失败:', error);
    } finally {
      setIsSimulating(false);
    }
  }, [waypoints, moveToNextWaypoint, stayAtWaypoint, toggleMock, setTarget, addHistory]);

  /** 停止路线模拟 */
  const stopRouteSimulation = useCallback(async () => {
    setIsSimulating(false);
    try {
      await MockLocation.stopMocking();
      toggleMock();
      
      // 记录已完成的部分历史
      if (routeStartTime && currentWaypointIndex < waypoints.length) {
        const duration = Math.round((Date.now() - routeStartTime) / 60000);
        addHistory({
          name: `路线模拟 (已完成 ${currentWaypointIndex + 1}/${waypoints.length})`,
          coordinate: waypoints[currentWaypointIndex].coordinate,
          startTime: routeStartTime,
          duration,
        });
      }
    } catch (error) {
      console.error('停止模拟失败:', error);
    }
  }, [toggleMock, addHistory, routeStartTime, currentWaypointIndex, waypoints]);

  /** 添加新途经点（默认坐标为北京） */
  const handleAddWaypoint = useCallback(() => {
    addWaypoint({
      name: `途经点 ${waypoints.length + 1}`,
      coordinate: { lat: 39.9042, lng: 116.4074 },
      stayDuration: 0,
      type: waypoints.length === 0 ? 'start' : waypoints.length >= 1 && waypoints.length <= 2 ? 'waypoint' : 'end',
    });
  }, [addWaypoint, waypoints.length]);

  /** 切换移动模式 */
  const handleModeChange = useCallback((mode: MoveMode) => {
    setMoveMode(mode);
  }, [setMoveMode]);

  /** 删除途经点 */
  const handleRemove = useCallback((id: string) => {
    removeWaypoint(id);
  }, [removeWaypoint]);

  /** 组件卸载时停止模拟 */
  useEffect(() => {
    return () => {
      if (isSimulating) {
        stopRouteSimulation();
      }
    };
  }, [isSimulating, stopRouteSimulation]);

  return (
    <div className="page route-page">
      <div className="page-header">
        <h1>路线规划</h1>
        {waypoints.length > 0 && !isSimulating && (
          <button className="clear-btn" onClick={clearRoute}>
            清空
          </button>
        )}
      </div>

      {/* 移动模式选择器 */}
      <div className="route-mode-selector">
        {(Object.keys(MODE_ICONS) as MoveMode[]).map((mode) => (
          <button
            key={mode}
            className={`mode-btn ${moveMode === mode ? 'active' : ''} ${isSimulating ? 'disabled' : ''}`}
            onClick={() => !isSimulating && handleModeChange(mode)}
            aria-label={MODE_LABELS[mode]}
            disabled={isSimulating}
          >
            {MODE_ICONS[mode]}
            <span>{MODE_LABELS[mode]}</span>
          </button>
        ))}
      </div>

      {/* 路线模拟进度条（模拟中显示） */}
      {isSimulating && (
        <div className="route-progress">
          <div className="progress-header">
            <span>路线进度</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="progress-info">
            <span>
              当前：{waypoints[currentWaypointIndex]?.name || ''}
              {currentWaypointIndex < waypoints.length - 1 && (
                <span> → {waypoints[currentWaypointIndex + 1]?.name}</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* 途经点列表 */}
      <div className="route-waypoints">
        {waypoints.map((wp, index) => (
          <div key={wp.id}>
            <div className={`card waypoint-card ${isSimulating && index === currentWaypointIndex ? 'current' : ''} ${isSimulating && index < currentWaypointIndex ? 'completed' : ''}`}>
              <div className={`waypoint-number ${wp.type} ${isSimulating && index === currentWaypointIndex ? 'active' : ''}`}>
                {wp.type === 'start' ? 'A' : wp.type === 'end' ? 'B' : index}
              </div>
              <div className="waypoint-info">
                <h4>{wp.name}</h4>
                {wp.stayDuration > 0 && <p>停留 {wp.stayDuration} 分钟</p>}
                {index < waypoints.length - 1 && (
                  <span className="waypoint-distance">
                    {formatDistance(calculateDistance(wp.coordinate, waypoints[index + 1].coordinate))}
                  </span>
                )}
              </div>
              {!isSimulating && (
                <button className="waypoint-delete" onClick={() => handleRemove(wp.id)} aria-label="删除途经点">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            {/* 途经点之间的连接线 */}
            {index < waypoints.length - 1 && (
              <div className={`waypoint-connector ${isSimulating && index < currentWaypointIndex ? 'completed' : ''}`}>
                {isSimulating && index === currentWaypointIndex && (
                  <div className="connector-progress" style={{ width: `${currentSegmentProgress * 100}%` }} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 添加途经点按钮 */}
      {!isSimulating && (
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
      )}

      {/* 路线摘要和控制按钮（至少2个途经点时显示） */}
      {waypoints.length >= 2 && (
        <>
          <div className="route-summary card">
            <div className="route-summary-item">
              <div className="route-value">{formatDistance(routeStats.totalDistance)}</div>
              <div className="route-label">总距离</div>
            </div>
            <div className="route-summary-item">
              <div className="route-value">{formatDuration(routeStats.totalTime)}</div>
              <div className="route-label">预计时间</div>
            </div>
            <div className="route-summary-item">
              <div className="route-value">{waypoints.length}</div>
              <div className="route-label">途经点</div>
            </div>
          </div>

          {isSimulating ? (
            <button className="btn btn-danger stop-route-btn" onClick={stopRouteSimulation}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="6" y="4" width="12" height="16" rx="2" />
              </svg>
              停止模拟
            </button>
          ) : (
            <button className="btn btn-primary start-route-btn" onClick={executeRouteSimulation}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              开始模拟路线
            </button>
          )}
        </>
      )}

      {/* 空状态提示 */}
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