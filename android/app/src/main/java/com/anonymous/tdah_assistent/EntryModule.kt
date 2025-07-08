package com.anonymous.tdah_assistent

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.provider.Settings
import android.content.Intent
import android.accessibilityservice.AccessibilityServiceInfo

class EntryModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val reactContext: ReactApplicationContext = reactContext

    companion object {
        var instance: EntryModule? = null
    }

    init {
        instance = this
    }

    override fun getName(): String {
        return "EntryModule"
    }

    @ReactMethod
    fun addListener(eventName: String?) {
        // Necessário para o NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Necessário para o NativeEventEmitter
    }

    fun emitAccessibilityEvent(params: WritableMap) {
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("AccessibilityEvent", params)
        } else {
            android.util.Log.w("EntryModule", "ReactContext ainda não está pronto")
        }
    }

    @ReactMethod
    fun isAccessibilityServiceEnabled(promise: Promise) {
        val accessibilityManager = reactApplicationContext
            .getSystemService(android.content.Context.ACCESSIBILITY_SERVICE) as android.view.accessibility.AccessibilityManager
        val enabledServices = accessibilityManager.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)
        var isEnabled = false
        if (reactContext.hasActiveCatalystInstance()) {
            for (service in enabledServices) {
                if (service.resolveInfo.serviceInfo.packageName == reactApplicationContext.packageName &&
                    service.resolveInfo.serviceInfo.name == EntryAccessibilityService::class.java.name) {
                    isEnabled = true
                    break
                }
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
