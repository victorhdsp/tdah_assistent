import com.facebook.react.bridge.Promise
import java.io.IOException
import okhttp3.Callback
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Call

class UseGeminiLLM {
    fun execute(apiKey: String, input: String, promise: Promise) {
        val url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
        
        val json = """
        {"contents":[{"parts": [{"text": "$input"}]}]}
        """.trimIndent()

        val mediaType = "application/json".toMediaType()

        val request = Request.Builder()
        .url("$url?key=$apiKey")
        .addHeader("Content-Type", "application/json")
        .post(json.toRequestBody(mediaType))
        .build()

        val client = OkHttpClient()
        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                android.util.Log.e("EntryModule", "Erro ao chamar Gemini LLM: ${e.message}")
                promise.reject("GENAI_ERROR", "Erro ao chamar Gemini LLM: ${e.message}")
            }

            override fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    android.util.Log.e("EntryModule", "Resposta inválida do Gemini LLM: ${response.code}")
                    promise.reject("GENAI_ERROR", "Resposta inválida do Gemini LLM: ${response.code}")
                    return
                }
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    android.util.Log.d("EntryModule", "Resposta do Gemini LLM: $responseBody")
                    promise.resolve(responseBody)
                } else {
                    android.util.Log.e("EntryModule", "Resposta vazia do Gemini LLM")
                    promise.reject("GENAI_ERROR", "Resposta vazia do Gemini LLM")
                }
            }
        })
    }
}