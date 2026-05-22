/**
 * 设置页面
 * 包含用户信息、通用设置、模拟设置和关于信息
 */
import { useSettingsStore } from '../store';
import './SettingsPage.css';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettingsStore();

  return (
    <div className="page settings-page">
      <div className="page-header">
        <h1>设置</h1>
      </div>

      {/* 用户信息卡片 */}
      <div className="settings-profile card">
        <div className="settings-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="settings-profile-info">
          <h3>MockGo 用户</h3>
          <p>mockgo@example.com</p>
        </div>
        <span className="settings-badge">Pro</span>
      </div>

      {/* 通用设置组 */}
      <div className="settings-group">
        <div className="settings-group-title">通用</div>
        <div className="settings-group-card">
          {/* 外观设置 */}
          <div className="setting-item">
            <div className="setting-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
              </svg>
            </div>
            <div className="setting-text">
              <h4>外观</h4>
              <p>浅色模式</p>
            </div>
            <span className="setting-value">浅色</span>
          </div>

          {/* 隐私保护开关 */}
          <div className="setting-item">
            <div className="setting-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="setting-text">
              <h4>隐私保护</h4>
              <p>隐藏真实位置信息</p>
            </div>
            <div
              className={`mini-toggle ${settings.privacyMode ? 'on' : ''}`}
              onClick={() => updateSettings({ privacyMode: !settings.privacyMode })}
            >
              <div className="mini-knob" />
            </div>
          </div>

          {/* 通知提醒开关 */}
          <div className="setting-item">
            <div className="setting-icon orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div className="setting-text">
              <h4>通知提醒</h4>
              <p>模拟状态变更通知</p>
            </div>
            <div
              className={`mini-toggle ${settings.notification ? 'on' : ''}`}
              onClick={() => updateSettings({ notification: !settings.notification })}
            >
              <div className="mini-knob" />
            </div>
          </div>
        </div>
      </div>

      {/* 模拟设置组 */}
      <div className="settings-group">
        <div className="settings-group-title">模拟设置</div>
        <div className="settings-group-card">
          {/* 模拟精度 */}
          <div className="setting-item">
            <div className="setting-icon purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div className="setting-text">
              <h4>模拟精度</h4>
              <p>位置偏移随机范围</p>
            </div>
            <span className="setting-value">±{settings.accuracy}m</span>
          </div>

          {/* 移动速度 */}
          <div className="setting-item">
            <div className="setting-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="setting-text">
              <h4>移动速度</h4>
              <p>模拟移动时的速度</p>
            </div>
            <span className="setting-value">
              {settings.moveSpeed === 'slow' ? '慢速' : settings.moveSpeed === 'fast' ? '快速' : '正常'}
            </span>
          </div>
        </div>
      </div>

      {/* 关于信息 */}
      <div className="settings-group">
        <div className="settings-group-title">关于</div>
        <div className="settings-group-card">
          <div className="setting-item">
            <div className="setting-icon orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div className="setting-text">
              <h4>关于 MockGo</h4>
            </div>
            <span className="setting-value">v1.0.0</span>
          </div>
        </div>
      </div>

      <div className="settings-version">MockGo v1.0.0 · Made with ❤️</div>
    </div>
  );
}
