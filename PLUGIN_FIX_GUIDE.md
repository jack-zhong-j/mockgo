# 插件未注册问题诊断与修复指南

## 问题原因分析

"插件未注册"错误通常由以下原因引起：

1. **MainActivity 手动注册冲突**：在 Capacitor 8.x 中，使用 `@CapacitorPlugin` 注解的插件会自动注册，手动注册会导致冲突
2. **插件类路径不匹配**：`capacitor.plugins.json` 中的类路径必须与实际文件路径完全一致
3. **Android 项目未同步**：修改插件后需要运行 `npx cap sync android`

## 已执行的修复

### 1. 修复 MainActivity.java
移除了手动插件注册代码，让 Capacitor 自动注册：

```java
package com.mockgo.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
}
```

### 2. 同步插件
已执行 `npx cap sync android` 同步插件到 Android 项目

## 验证插件配置

### 检查点 1：插件类路径
- 配置文件：`capacitor.plugins.json`
- 实际路径：`android/app/src/main/java/com/mockgo/app/plugins/MockLocationPlugin.java`
- 配置值：`com.mockgo.app.plugins.MockLocationPlugin` ✅ 匹配

### 检查点 2：插件注解
```java
@CapacitorPlugin(name = "MockLocation")
public class MockLocationPlugin extends Plugin {
    // ...
}
```

### 检查点 3：前端插件注册
```typescript
const MockLocation = registerPlugin<MockLocationPlugin>('MockLocation');
```

## 用户需要执行的步骤

### 步骤 1：重新构建 Android 项目
```bash
# 清理构建缓存
cd android
./gradlew clean

# 重新构建
./gradlew assembleDebug
```

### 步骤 2：重新安装应用
```bash
# 卸载旧版本
adb uninstall com.mockgo.app

# 安装新版本
adb install app/build/outputs/apk/debug/app-debug.apk
```

### 步骤 3：检查开发者选项设置
在 Android 设备上：
1. 进入「设置」→「开发者选项」
2. 找到「选择模拟位置应用」
3. 选择「MockGo」应用

### 步骤 4：授予定位权限
首次启动应用时，授予「精确位置」权限

## 调试方法

### 方法 1：查看日志
```bash
adb logcat | grep -E "MockLocation|Capacitor|Plugin"
```

### 方法 2：检查插件列表
在应用中添加调试代码：
```typescript
console.log('Available plugins:', Plugins);
console.log('MockLocation plugin:', MockLocation);
```

### 方法 3：测试插件方法
```typescript
try {
  await MockLocation.isMocking();
  console.log('插件调用成功');
} catch (error) {
  console.error('插件调用失败:', error);
}
```

## 常见错误及解决方案

### 错误 1：`Plugin not found`
**原因**：插件未正确注册
**解决**：运行 `npx cap sync android` 并重新构建

### 错误 2：`not implemented`
**原因**：插件方法未在 Android 端实现
**解决**：检查 `@PluginMethod` 注解是否正确

### 错误 3：`请在开发者选项中将本应用设为模拟位置应用`
**原因**：未在开发者选项中设置模拟位置应用
**解决**：按照步骤 3 设置

### 错误 4：`需要定位权限`
**原因**：未授予定位权限
**解决**：在应用设置中授予权限或重新安装应用

## 验证清单

- [ ] 已运行 `npx cap sync android`
- [ ] 已重新构建 Android 项目
- [ ] 已重新安装应用到设备
- [ ] 已在开发者选项中设置模拟位置应用
- [ ] 已授予定位权限
- [ ] 日志中无插件注册错误

## 联系支持

如果以上步骤都无法解决问题，请提供以下信息：
1. Android 设备型号和系统版本
2. 完整的错误日志
3. `adb logcat` 输出
4. 插件调用时的具体代码