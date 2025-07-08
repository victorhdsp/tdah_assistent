package com.anonymous.tdah_assistent

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.util.Log
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments

fun mapNodeToWritableMap(node: AccessibilityNodeInfo): WritableMap {
    return Arguments.createMap().apply {
        putString("viewIdResourceName", node.viewIdResourceName)
        putString("className", node.className?.toString())
        putString("text", node.text?.toString())
        putString("contentDescription", node.contentDescription?.toString())
        putBoolean("isClickable", node.isClickable)
        putBoolean("isEnabled", node.isEnabled)
        putBoolean("isFocusable", node.isFocusable)
        putBoolean("isFocused", node.isFocused)
        putBoolean("isVisibleToUser", node.isVisibleToUser)
        putBoolean("isAccessibilityFocused", node.isAccessibilityFocused)
        putBoolean("isSelected", node.isSelected)
        putBoolean("isCheckable", node.isCheckable)
        putBoolean("isChecked", node.isChecked)
        putBoolean("isScrollable", node.isScrollable)
        putBoolean("isLongClickable", node.isLongClickable)
        putBoolean("isPassword", node.isPassword)
        putBoolean("isEditable", node.isEditable)
        putBoolean("isDismissable", node.isDismissable)
        putBoolean("isImportantForAccessibility", node.isImportantForAccessibility)
        putInt("inputType", node.inputType)
        putInt("liveRegion", node.liveRegion)
        putInt("movementGranularities", node.movementGranularities)
        putInt("childCount", node.childCount)

        // Bounds do elemento na tela (útil para análise espacial)
        val rect = android.graphics.Rect()
        node.getBoundsInScreen(rect)
        val bounds = Arguments.createMap().apply {
            putInt("left", rect.left)
            putInt("top", rect.top)
            putInt("right", rect.right)
            putInt("bottom", rect.bottom)
        }
        putMap("boundsInScreen", bounds)
    }
}

fun mapNodeWithChildren(node: AccessibilityNodeInfo): WritableMap {
    val map = mapNodeToWritableMap(node)
    val childrenArray = Arguments.createArray()

    for (i in 0 until node.childCount) {
        val childNode = node.getChild(i)
        if (childNode != null) {
            childrenArray.pushMap(mapNodeWithChildren(childNode))
            childNode.recycle() // ⚠️ Liberar memória
        }
    }

    map.putArray("children", childrenArray)
    return map
}

class EntryAccessibilityService : AccessibilityService() {
    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d("ACCESS_SERVICE", "Serviço de acessibilidade iniciado")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        Log.d("ACCESS_SERVICE", "onAccessibilityEvent chamado")
        if (event == null || EntryModule.instance == null) return

        Log.d("ACCESS_SERVICE", "Evento recebido: ${event.eventType}")

        val node: AccessibilityNodeInfo? = rootInActiveWindow ?: event.source
        val appPackage = event.packageName?.toString() ?: "Desconhecido"

        if (node != null) {
            try {
                val serialized = mapNodeWithChildren(node)
                serialized.putString("eventType", AccessibilityEvent.eventTypeToString(event.eventType))
                serialized.putString("packageName", appPackage)
                EntryModule.instance?.emitAccessibilityEvent(serialized)
                Log.d("ACCESS_SERVICE", "Evento emitido para JS com árvore")
            } catch (e: Exception) {
                Log.e("ACCESS_SERVICE", "Erro ao mapear árvore de acessibilidade", e)
            } finally {
                node.recycle() // ⚠️ SEMPRE libere!
            }
        } else {
            Log.w("ACCESS_SERVICE", "Nenhum node disponível (root e source são null)")
        }
    }

    override fun onInterrupt() {
        Log.w("ACCESS_SERVICE", "Serviço de acessibilidade interrompido")
    }
}
