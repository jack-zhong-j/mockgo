import { useEffect, useRef, useState, useCallback } from 'react';
import { useMockStore, useHistoryStore } from '../store';
import { loadTencentMap, formatCoordinate, parseCoordinate, MAP_CONFIG } from '../utils/map';
import MockLocation from '../plugins/MockLocationPlugin';
import type { TMapGeocoderResult, TMapLatLng, TMapMapOptions } from '../types';
import './HomePage.css';

// 腾讯地图类型声明
declare const TMap: {
  Map: new (container: HTMLDivElement, options: TMapMapOptions) => any;
  LatLng: new (lat: number, lng: number) => TMapLatLng;
  MultiMarker: new (options: { map: any; geometries: Array<{ id: string; position: TMapLatLng }> }) => any;
  service: {
    Geocoder: new () => {
      getLocation: (options: { address: string }) => Promise<TMapGeocoderResult>;
    };
  };
};

export default function HomePage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [coordInput, setCoordInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mockError, setMockError] = useState<string | null>(null);
  // 模拟开始时间（用于记录历史）
  const [mockStartTime, setMockStartTime] = useState<number | null>(null);
  
  const { isActive, targetCoordinate, setTarget, toggleMock } = useMockStore();
  const { addHistory } = useHistoryStore();

  // 处理模拟开关切换
  const handleToggleMock = useCallback(async () => {
    if (isActive) {
      // 停止模拟
      try {
        await MockLocation.stopMocking();
        toggleMock();
        setMockError(null);
        
        // 记录历史记录
        if (mockStartTime && targetCoordinate) {
          const duration = Math.round((Date.now() - mockStartTime) / 60000);
          addHistory({
            name: '单点模拟定位',
            coordinate: targetCoordinate,
            startTime: mockStartTime,
            duration,
          });
        }
        setMockStartTime(null);
      } catch (err: any) {
        console.error('停止模拟失败:', err);
        const msg = err.message || '停止模拟失败';
        if (msg.includes('not implemented')) {
          setMockError('插件未正确安装，请重新安装应用');
        } else {
          setMockError(msg);
        }
      }
    } else {
      // 启动模拟
      if (!targetCoordinate) {
        setMockError('请先选择一个位置');
        return;
      }
      try {
        await MockLocation.startMocking({
          lat: targetCoordinate.lat,
          lng: targetCoordinate.lng,
        });
        toggleMock();
        setMockError(null);
        // 记录模拟开始时间
        setMockStartTime(Date.now());
      } catch (err: any) {
        console.error('启动模拟失败:', err);
        let msg = err.message || '启动模拟位置失败';
        if (msg.includes('not implemented')) {
          msg = '插件未正确安装，请重新安装应用';
        } else if (msg.includes('开发者选项')) {
          msg = '请在开发者选项中开启允许模拟位置';
        } else if (msg.includes('权限')) {
          msg = '请授予定位权限';
        }
        setMockError(msg);
      }
    }
  }, [isActive, targetCoordinate, toggleMock, mockStartTime, addHistory]);

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

    // 组件卸载时清理标记点，防止内存泄漏
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [targetCoordinate]);

  // 坐标输入处理
  const handleCoordSubmit = useCallback(() => {
    const coord = parseCoordinate(coordInput);
    if (coord) {
      setTarget(coord);
    }
  }, [coordInput, setTarget]);

  // 获取当前真实位置
  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('您的浏览器不支持地理定位');
      return;
    }
    
    setError('正在获取位置...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setTarget({ lat, lng });
        setCoordInput(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setError(null);
      },
      (error) => {
        console.error('获取位置失败:', error);
        const errorMessages: Record<number, string> = {
          1: '用户拒绝了位置权限',
          2: '无法获取位置信息',
          3: '获取位置超时',
        };
        setError(errorMessages[error.code] || '获取位置失败，请检查定位权限');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [setTarget]);

  // 搜索地点
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() || !mapInstance.current) return;
    
    const geocoder = new TMap.service.Geocoder();
    geocoder.getLocation({ address: searchQuery })
      .then((result: any) => {
        if (result && result.result && result.result.location) {
          const location = result.result.location;
          setTarget({ lat: location.lat, lng: location.lng });
          setCoordInput(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
          setError(null);
        } else {
          setError('未找到该地点');
        }
      })
      .catch((err: any) => {
        console.error('搜索失败:', err);
        setError('搜索失败，请检查网络或尝试其他地点');
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
        <button className="btn btn-secondary" onClick={handleGetCurrentLocation} aria-label="获取当前位置">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </button>
        <button className="btn btn-primary" onClick={handleCoordSubmit} aria-label="定位到该坐标">
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
          <div className={`toggle ${isActive ? 'on' : ''}`} onClick={handleToggleMock}>
            <div className="toggle-knob" />
          </div>
          
          {mockError && (
            <div className="mock-error">
              {mockError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}