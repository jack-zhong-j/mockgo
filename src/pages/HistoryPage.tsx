import { useMemo, useCallback } from 'react';
import { useHistoryStore } from '../store';
import { formatCoordinate, formatDuration } from '../utils/map';
import './HistoryPage.css';

export default function HistoryPage() {
  const { history, clearHistory } = useHistoryStore();

  // 使用 useMemo 优化计算
  const { groupedHistory, stats } = useMemo(() => {
    // 按日期分组
    const grouped = history.reduce((acc, item) => {
      const date = new Date(item.startTime).toLocaleDateString('zh-CN');
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {} as Record<string, typeof history>);

    // 统计数据
    const totalDuration = history.reduce((sum, item) => sum + item.duration, 0);
    const uniqueLocations = new Set(history.map((h) => h.name)).size;

    return {
      groupedHistory: grouped,
      stats: {
        totalSimulations: history.length,
        totalDuration,
        uniqueLocations,
      },
    };
  }, [history]);

  const handleClear = useCallback(() => {
    if (confirm('确定要清空所有历史记录吗？')) {
      clearHistory();
    }
  }, [clearHistory]);

  return (
    <div className="page history-page">
      <div className="page-header">
        <h1>历史记录</h1>
        {history.length > 0 && (
          <button className="clear-btn" onClick={handleClear} aria-label="清空历史记录">
            清空
          </button>
        )}
      </div>

      <div className="history-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.totalSimulations}</div>
          <div className="stat-label">总模拟次数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatDuration(stats.totalDuration)}</div>
          <div className="stat-label">累计时长</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.uniqueLocations}</div>
          <div className="stat-label">不同地点</div>
        </div>
      </div>

      {Object.entries(groupedHistory).map(([date, items]) => (
        <div key={date} className="history-section">
          <div className="history-section-title">{date}</div>
          <div className="history-list">
            {items.map((item) => (
              <div key={item.id} className="card history-item">
                <div className="history-dot" />
                <div className="history-info">
                  <h4>{item.name}</h4>
                  <p>{formatCoordinate(item.coordinate)}</p>
                </div>
                <div className="history-meta">
                  <div className="history-time">
                    {new Date(item.startTime).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="history-duration">
                    持续 {formatDuration(item.duration)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {history.length === 0 && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p>暂无历史记录</p>
        </div>
      )}
    </div>
  );
}
