import { useEffect, useRef, useState, useCallback } from 'react';
import { useMockStore } from '../store';
import { loadTencentMap, formatCoordinate, parseCoordinate, MAP_CONFIG } from '../utils/map';
import './HomePage.css';

// 腾讯地图类型声明
declare const TMap: any;

export default function HomePage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [coordInput, setCoordInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { isActive, targetCoordinate, setTarget, toggleMock } = useMockStore();

  // 处理地图点击选点
  const handleMapClick = useCallback((evt: any) => {
    const lat = evt.latLng.getLat().toFixed(6);
    const lng = evt.latLng.getLng().toFixed(6);
    setTarget({ lat: parseFloat(lat), lng: parseFloat(lng) });
    setCoordInput(`${lat}, ${lng}`);
  }, [setTarget]);

  // 初始化地图
  useEffect(() => {
    let isMounted = true;
    let map: any = null;
    
    loadTencentMap()
      .then(() => {
        if (!isMounted || !mapRef.current) return;
        
        try {
          map = new TMap.Map(mapRef.current, {
            center: new TMap.LatLng(MAP_CONFIG.defaultCenter.lat, MAP_CONFIG.defaultCenter.lng),
            zoom: MAP_CONFIG.defaultZoom,
            viewMode: '2D',
          });

          mapInstance.current = map;

          // 点击地图选点
          map.on('click', handleMapClick);
        } catch (err) {
          setError('地图初始化失败');
          console.error(err);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError('地图加载失败，请检查网络连接');
          console.error(err);
        }
      });

    return () => {
      isMounted = false;
      if (map) {
        map.off('click', handleMapClick);
        map.destroy();
        mapInstance.current = null;
      }
    };
  }, [handleMapClick]);

  // 更新标记点
  useEffect(() => {
    if (!mapInstance.current || !targetCoordinate) return;

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new TMap.MultiMarker({
      map: mapInstance.current,
      geometries: [{
        id: 'target',
        position: new TMap.LatLng(targetCoordinate.lat, targetCoordinate.lng),
      }],
    });

    mapInstance.current.setCenter(new TMap.LatLng(targetCoordinate.lat, targetCoordinate.lng));
  }, [targetCoordinate]);

  // 坐标输入处理
  const handleCoordSubmit = useCallback(() => {
    const coord = parseCoordinate(coordInput);
    if (coord) {
      setTarget(coord);
    }
  }, [coordInput, setTarget]);

  // 搜索地点
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() || !mapInstance.current) return;
    
    const geocoder = new TMap.service.Geocoder();
    geocoder.getLocation({ address: searchQuery }).then((result: any) => {
      const location = result.result.location;
      setTarget({ lat: location.lat, lng: location.lng });
      setCoordInput(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
    });
  }, [searchQuery, setTarget]);

  return (
    <div className="home-page">
      {/* 错误提示 */}
      {error && (
        <div className="error-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* 地图容器 */}
      <div ref={mapRef} className="map-container" />

      {/* 搜索栏 */}
      <div className="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="搜索地点..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      {/* 坐标输入 */}
      <div className="coord-input-bar">
        <input
          type="text"
          className="input"
          placeholder="输入坐标 (如: 39.9042, 116.4074)"
          value={coordInput}
          onChange={(e) => setCoordInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCoordSubmit()}
        />
        <button className="btn btn-primary" onClick={handleCoordSubmit}>
          定位
        </button>
      </div>

      {/* 当前坐标显示 */}
      {targetCoordinate && (
        <div className="coord-display">
          <div className="coord-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
            </svg>
          </div>
          <span className="coord-text">{formatCoordinate(targetCoordinate)}</span>
        </div>
      )}

      {/* 模拟状态指示 */}
      {isActive && (
        <div className="mock-indicator">
          <span className="pulse-dot" />
          模拟定位已开启
        </div>
      )}

      {/* 模拟开关 */}
      <div className="mock-toggle">
        <div className="mock-toggle-card">
          <div className="mock-toggle-info">
            <div className={`mock-toggle-icon ${isActive ? 'on' : 'off'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </div>
            <div className="mock-toggle-text">
              <h3>模拟定位</h3>
              <p>{isActive ? '当前：模拟位置' : '当前：真实位置'}</p>
            </div>
          </div>
          <div className={`toggle ${isActive ? 'on' : ''}`} onClick={toggleMock}>
            <div className="toggle-knob" />
          </div>
        </div>
      </div>
    </div>
  );
}
