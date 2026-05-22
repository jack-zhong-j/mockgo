# MockGo - 模拟定位 APP

一款基于 React + Capacitor 的 Android 模拟定位应用，支持地图选点、坐标输入、收藏管理、路线规划等功能。

## 功能特性

- 🗺️ 腾讯地图集成，支持点击选点和地址搜索
- 📍 坐标输入与地图选点
- ⭐ 收藏地点管理（支持分类）
- 📜 模拟历史记录
- 🛤️ 路线规划（多途经点）
- ⚙️ 自定义设置（精度、速度、隐私模式）

## 技术栈

- React 19 + TypeScript
- Vite 8
- Capacitor 8
- Zustand 5 状态管理
- 腾讯地图 JS API (GL版)
- React Router 7

## 环境准备

1. 安装依赖：
```bash
npm install
```

2. 配置腾讯地图 API Key：
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的腾讯地图 Key
# VITE_TENCENT_MAP_KEY=你的腾讯地图Key
```

> 腾讯地图 Key 申请地址：https://lbs.qq.com/dev/console/application/mine

## 本地开发

```bash
# 启动开发服务器
npm run dev

# 类型检查
npm run typecheck

# 构建
npm run build
```

## 构建 Android APK

```bash
# 同步到 Android
npx cap sync android

# 构建 Debug APK
cd android && ./gradlew assembleDebug
```

> 构建产物位于 `android/app/build/outputs/apk/debug/app-debug.apk`

## 使用说明

1. 在 Android 开发者选项中开启「允许模拟位置」
2. 将 MockGo 设为模拟位置应用
3. 在地图上选择目标位置或输入坐标
4. 开启模拟定位开关

## License

MIT
