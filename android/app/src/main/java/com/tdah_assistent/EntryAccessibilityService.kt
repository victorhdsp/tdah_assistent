package com.tdah_assistent

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.ReactApplication

class EntryAccessibilityService : AccessibilityService() {
    override fun onServiceConnected() {
        super.onServiceConnected()
        android.util.Log.d("ACCESS_SERVICE", "Serviço iniciado!")
    }
    
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event != null) {
            val message = "Evento: ${event.eventType} - ${event.text}"
            
            // Enviar evento para JS via React Native Bridge
            val reactApp = applicationContext as ReactApplication
            val reactContext = reactApp.reactNativeHost.reactInstanceManager.currentReactContext

            reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("AccessibilityEvent", message)
        }
    }

    override fun onInterrupt() {}
}
