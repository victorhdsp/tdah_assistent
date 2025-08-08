package com.anonymous.tdah_assistent

import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

import org.json.JSONObject

import java.io.IOException

import UseGeminiLLM
import UseGeminiEmbedding
import UseLocalEmbedding
import UseSendDataToNluTrain
import BertTokenizer

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

    @ReactMethod fun addListener(eventName: String?) {}

    @ReactMethod fun removeListeners(count: Int) {}

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
    fun GeminiLLM(apiKey: String, input: String, promise: Promise) {
        UseGeminiLLM().execute(apiKey, input, promise)
    }

    @ReactMethod
    fun GeminiEmbedding(apiKey: String, input: String, promise: Promise) {
        UseGeminiEmbedding().execute(apiKey, input, promise)
    }

    @ReactMethod
    fun LocalEmbedding(input: String, promise: Promise) {
        val tokenizer = BertTokenizer(reactApplicationContext)
        UseLocalEmbedding(reactApplicationContext, tokenizer).execute(input, promise)
    }

    @ReactMethod
    fun SendDataToNLUTrain(firebaseProjectId: String, firebaseApiKey: String, input: String, promise: Promise) {
        UseSendDataToNluTrain().execute(firebaseProjectId, firebaseApiKey, input, promise)
    }

    @ReactMethod
    fun isAccessibilityServiceEnabled(promise: Promise) {
        val accessibilityManager =
                reactApplicationContext.getSystemService(
                        android.content.Context.ACCESSIBILITY_SERVICE
                ) as
                        android.view.accessibility.AccessibilityManager
        val enabledServices =
                accessibilityManager.getEnabledAccessibilityServiceList(
                        AccessibilityServiceInfo.FEEDBACK_ALL_MASK
                )
        var isEnabled = false
        android.util.Log.w("EntryModule", "Verificando serviços de acessibilidade habilitados...")
        for (service in enabledServices) {
            if (service.resolveInfo.serviceInfo.packageName ==
                            reactApplicationContext.packageName &&
                            service.resolveInfo.serviceInfo.name ==
                                    EntryAccessibilityService::class.java.name
            ) {
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
