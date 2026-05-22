package com.mockgo.app.plugins;

import android.Manifest;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationManager;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import androidx.core.app.ActivityCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * 模拟定位插件
 * 通过 Android LocationManager 的 TestProvider 机制实现 GPS 位置模拟
 */
@CapacitorPlugin(name = "MockLocation")
public class MockLocationPlugin extends Plugin {

    private static final String TAG = "MockLocationPlugin";
    private LocationManager locationManager;
    private String providerName = LocationManager.GPS_PROVIDER;
    private boolean isMocking = false;
    private double currentLat = 0;
    private double currentLng = 0;

    /**
     * 启动模拟定位
     * @param call 包含 lat(纬度) 和 lng(经度) 参数
     */
    @PluginMethod
    public void startMocking(PluginCall call) {
        // 参数校验：检查参数是否存在
        if (!call.hasOption("lat") || !call.hasOption("lng")) {
            call.reject("缺少必要参数: lat 和 lng");
            return;
        }

        double lat = call.getDouble("lat");
        double lng = call.getDouble("lng");

        // 坐标范围校验
        if (lat < -90 || lat > 90) {
            call.reject("纬度范围无效，应在 -90 到 90 之间");
            return;
        }
        if (lng < -180 || lng > 180) {
            call.reject("经度范围无效，应在 -180 到 180 之间");
            return;
        }

        Log.d(TAG, "开始模拟位置: " + lat + ", " + lng);

        Context context = getContext();
        locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);

        // 检查模拟位置权限（兼容 Android 12+）
        if (!checkMockLocationPermission(context)) {
            call.reject("请在开发者选项中将本应用设为模拟位置应用");
            return;
        }

        // 检查定位权限
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            call.reject("需要定位权限");
            return;
        }

        try {
            // 移除已有的 test provider（忽略异常）
            try {
                locationManager.removeTestProvider(providerName);
            } catch (Exception e) {
                // Provider 不存在，忽略
            }

            // 添加 test provider
            locationManager.addTestProvider(
                    providerName,
                    false,  // 不需要网络
                    false,  // 不需要卫星
                    false,  // 不需要单元格
                    false,  // 不付费
                    true,   // 允许 altitude
                    true,   // 允许 speed
                    true,   // 允许 bearing
                    android.location.Criteria.POWER_LOW,
                    android.location.Criteria.ACCURACY_FINE
            );

            // 创建模拟位置
            Location mockLocation = new Location(providerName);
            mockLocation.setLatitude(lat);
            mockLocation.setLongitude(lng);
            mockLocation.setAccuracy(10); // 10米精度
            mockLocation.setTime(System.currentTimeMillis());

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                mockLocation.setElapsedRealtimeNanos(System.nanoTime());
            }

            // 启用并设置模拟位置
            locationManager.setTestProviderEnabled(providerName, true);
            locationManager.setTestProviderLocation(providerName, mockLocation);

            isMocking = true;
            currentLat = lat;
            currentLng = lng;

            call.resolve();
            Log.d(TAG, "模拟位置启动成功: " + lat + ", " + lng);

        } catch (Exception e) {
            Log.e(TAG, "启动模拟位置失败", e);
            call.reject("启动失败: " + e.getMessage());
        }
    }

    /**
     * 停止模拟定位
     */
    @PluginMethod
    public void stopMocking(PluginCall call) {
        Log.d(TAG, "停止模拟位置");

        if (locationManager != null && isMocking) {
            try {
                locationManager.removeTestProvider(providerName);
                isMocking = false;
                Log.d(TAG, "模拟位置停止成功");
            } catch (IllegalArgumentException e) {
                Log.w(TAG, "Provider 已被移除");
                isMocking = false;
            }
        }
        call.resolve();
    }

    /**
     * 查询当前模拟状态
     */
    @PluginMethod
    public void isMocking(PluginCall call) {
        JSObject result = new JSObject();
        result.put("isActive", isMocking);
        result.put("lat", currentLat);
        result.put("lng", currentLng);
        call.resolve(result);
    }

    /**
     * 检查模拟位置权限
     * Android 12+ (API 31): 通过 ApplicationInfo.isMockLocationProvider() 检测
     * Android 12 以下: 通过 Settings.Secure.ALLOW_MOCK_LOCATION 检测
     */
    private boolean checkMockLocationPermission(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Android 12+ 使用 isMockLocationProvider 检测
            try {
                ApplicationInfo appInfo = context.getApplicationInfo();
                return appInfo.isMockLocationProvider();
            } catch (Exception e) {
                Log.w(TAG, "检测模拟位置权限失败", e);
                return false;
            }
        } else {
            // Android 12 以下使用 ALLOW_MOCK_LOCATION 设置
            try {
                String mockLocationSetting = Settings.Secure.getString(
                        context.getContentResolver(),
                        Settings.Secure.ALLOW_MOCK_LOCATION
                );
                return "1".equals(mockLocationSetting);
            } catch (Exception e) {
                Log.w(TAG, "检测模拟位置权限失败", e);
                return false;
            }
        }
    }

    /**
     * 插件销毁时清理 test provider，防止残留模拟状态
     */
    @Override
    protected void handleOnDestroy() {
        if (locationManager != null && isMocking) {
            try {
                locationManager.removeTestProvider(providerName);
                isMocking = false;
                Log.d(TAG, "插件销毁，已清理模拟位置");
            } catch (Exception e) {
                Log.w(TAG, "清理模拟位置失败", e);
            }
        }
        super.handleOnDestroy();
    }
}
