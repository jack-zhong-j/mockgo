# MockGo - 模拟定位 APP

一款基于 React + Capacitor 的模拟定位应用，支持 Android 平台。

## 功能特性

- 🗺️ 腾讯地图集成
- 📍 坐标输入与地图选点
- ⭐ 收藏地点管理
- 📜 历史记录
- 🛤️ 路线规划
- ⚙️ 自定义设置

## 技术栈

- React 18 + TypeScript
- Capacitor 6
- 腾讯地图 JS API
- Zustand 状态管理

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build
```

## 构建 Android APK

```bash
# 同步到 Android
npx cap sync android

# 构建 APK
cd android && ./gradlew assembleDebug
```

## License

MIT
