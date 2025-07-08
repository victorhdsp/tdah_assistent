package com.anonymous.tdah_assistent

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments


fun mapAccessibilityEventToWritableMap(event: AccessibilityEvent): WritableMap {
    return Arguments.createMap().apply {
        putInt("eventType", event.eventType)
        putString("eventText", event.text?.toString())
        putString("packageName", event.packageName?.toString())
        putString("className", event.className?.toString())
        putInt("itemCount", event.itemCount)
        putInt("currentItemIndex", event.currentItemIndex)
        putInt("fromIndex", event.fromIndex)
        putInt("toIndex", event.toIndex)
        putInt("scrollX", event.scrollX)
        putInt("scrollY", event.scrollY)
        putBoolean("isChecked", event.isChecked)
        putBoolean("isEnabled", event.isEnabled)
        putBoolean("isPassword", event.isPassword)
    }
}

class EntryAccessibilityService : AccessibilityService() {
    override fun onServiceConnected() {
        super.onServiceConnected()
        android.util.Log.d("ACCESS_SERVICE", "Serviço iniciado!")
    }
    
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event != null) {
            android.util.Log.d("ACCESS_SERVICE", "Evento de acessibilidade recebido: ${event?.eventType}")
            val params = mapAccessibilityEventToWritableMap(event)
            if (EntryModule.instance != null) {
                EntryModule.instance!!.emitAccessibilityEvent(params)
            } else {
                android.util.Log.w("ACCESS_SERVICE", "Módulo EntryModule ainda não está pronto")
            }
        }
    }

    override fun onInterrupt() {}
}