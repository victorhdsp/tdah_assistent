package com.tdah_assistent

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.provider.Settings
import android.content.Intent

class EntryModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val reactContext: ReactApplicationContext = reactContext

    override fun getName(): String {
        return "EntryModule"
    }

    @ReactMethod
    fun addListener(eventName: String?) {
        // Necessário pro NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Necessário pro NativeEventEmitter
    }

    fun sendAccessibilityEvent(data: String) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("AccessibilityEvent", data)
    }

    @ReactMethod
    fun isAccessibilityServiceEnabled(promise: Promise) {
        val accessibilityManager = reactApplicationContext.getSystemService(android.content.Context.ACCESSIBILITY_SERVICE) as android.accessibilityservice.AccessibilityManager
        val enabledServices = accessibilityManager.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)
        var isEnabled = false
        for (service in enabledServices) {
            if (service.resolveInfo.serviceInfo.packageName == reactApplicationContext.packageName &&
                service.resolveInfo.serviceInfo.name == EntryAccessibilityService::class.java.name) {
                isEnabled = true
                break
            }
        }
        promise.resolve(isEnabled)
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
    }
}
