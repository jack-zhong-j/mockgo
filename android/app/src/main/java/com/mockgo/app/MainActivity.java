package com.mockgo.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.mockgo.app.plugins.MockLocationPlugin;

/**
 * 应用主 Activity
 * 显式注册 MockLocation 插件以确保可靠性
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // 显式注册模拟定位插件
        registerPlugin(MockLocationPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
