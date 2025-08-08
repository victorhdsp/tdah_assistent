import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import android.util.Log
import java.io.IOException

class UseGeminiEmbedding {
    private val JSON = "application/json; charset=utf-8".toMediaType()

    fun execute(apiKey: String, input: String, promise: Promise) {
        val url = "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent"

        val json = """
        {
            "model": "models/embedding-001",
            "content": {
                "parts": [
                    {
                        "text": "$input"
                    }
                ]
            }
        }
        """.trimIndent()

        val request = Request.Builder()
                .url(url)
                .addHeader("x-goog-api-key", apiKey)
                .addHeader("Content-Type", "application/json")
                .post(json.toRequestBody(JSON))
                .build()

        OkHttpClient().newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("UseGeminiEmbedding", "Erro ao chamar Gemini Embedding: ${e.message}")
                promise.reject("GENAI_ERROR", "Erro ao chamar Gemini Embedding: ${e.message}")
            }

            override fun onResponse(call: Call, response: Response) {
                val body = response.body?.string()
                Log.d("UseGeminiEmbedding", "HTTP ${response.code} - body: $body")

                if (!response.isSuccessful) {
                    promise.reject("GENAI_ERROR", "HTTP ${response.code}: $body")
                    return
                }

                if (body == null) {
                    promise.reject("GENAI_ERROR", "Empty response body")
                    return
                }

                try {
                    val embeddingsList = extractEmbeddingsFromJson(body)
                    if (embeddingsList == null || embeddingsList.isEmpty()) {
                        promise.reject("GENAI_ERROR", "No embedding found in response: $body")
                        return
                    }

                    if (embeddingsList.size == 1) {
                        val arr = Arguments.createArray()
                        val emb = embeddingsList[0]
                        for (v in emb) arr.pushDouble(v.toDouble())
                        promise.resolve(arr)
                        return
                    }

                    val outer = Arguments.createArray()
                    for (emb in embeddingsList) {
                        val inner = Arguments.createArray()
                        for (v in emb) inner.pushDouble(v.toDouble())
                        outer.pushArray(inner)
                    }
                    promise.resolve(outer)
                } catch (e: Exception) {
                    Log.e("UseGeminiEmbedding", "Erro ao processar resposta do Gemini Embedding: ${e.message}")
                    promise.reject("GENAI_ERROR", "Erro ao processar resposta do Gemini Embedding: ${e.message}")
                }
            }
        })
    }

    private fun extractEmbeddingsFromJson(body: String): List<FloatArray>? {
        try {
            val root = JSONObject(body)

            val candidates = mutableListOf<JSONArray>()

            if (root.has("embeddings")) root.optJSONArray("embeddings")?.let { candidates.add(it) }
            if (root.has("embedding")) root.optJSONArray("embedding")?.let { candidates.add(it) }
            if (root.has("data")) {
                val data = root.opt("data")
                if (data is JSONArray) {
                    for (i in 0 until data.length()) {
                        val el = data.opt(i)
                        if (el is JSONObject) {
                            listOf("embedding", "embeddings", "values").forEach { k ->
                                el.optJSONArray(k)?.let { candidates.add(it) }
                            }
                        } else if (el is JSONArray && isNumericArray(el)) {
                            candidates.add(el)
                        }
                    }
                }
            }

            if (candidates.isNotEmpty()) {
                val result = mutableListOf<FloatArray>()
                for (c in candidates) {
                    if (c.length() > 0 && c.opt(0) is JSONArray && isNumericArray(c.optJSONArray(0)!!)) {
                        for (i in 0 until c.length()) {
                            val arr = c.getJSONArray(i)
                            if (isNumericArray(arr)) result.add(jsonArrayToFloatArray(arr))
                        }
                    } else if (isNumericArray(c)) {
                        result.add(jsonArrayToFloatArray(c))
                    }
                }
                if (result.isNotEmpty()) return result
            }

            val found = findAllNumericArrays(root)
            if (found.isNotEmpty()) {
                return found.map { jsonArrayToFloatArray(it) }
            }
        } catch (e: Exception) {
            Log.w("UseGeminiEmbedding", "extractEmbeddingsFromJson parse error: ${e.message}")
        }
        return null
    }

    private fun isNumericArray(arr: JSONArray): Boolean {
        if (arr.length() == 0) return false
        for (i in 0 until arr.length()) {
            val v = arr.opt(i) ?: return false
            if (v !is Number) return false
        }
        return true
    }

    private fun jsonArrayToFloatArray(arr: JSONArray): FloatArray {
        val out = FloatArray(arr.length())
        for (i in 0 until arr.length()) {
            out[i] = arr.optDouble(i).toFloat()
        }
        return out
    }

    private fun findAllNumericArrays(value: Any?): List<JSONArray> {
        val result = mutableListOf<JSONArray>()
        when (value) {
            is JSONObject -> {
                val keys = value.keys()
                while (keys.hasNext()) {
                    val k = keys.next()
                    val v = value.opt(k)
                    result.addAll(findAllNumericArrays(v))
                }
            }
            is JSONArray -> {
                if (isNumericArray(value)) {
                    result.add(value)
                } else {
                    for (i in 0 until value.length()) {
                        val v = value.opt(i)
                        result.addAll(findAllNumericArrays(v))
                    }
                }
            }
        }
        return result
    }
}
