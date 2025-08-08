import com.facebook.react.bridge.Promise
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import android.util.Log

class UseSendDataToNluTrain {
    private val JSON = "application/json; charset=utf-8".toMediaType()

    fun execute(projectId: String, apiKey: String, newValue: String, promise: Promise) {
        val url = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents:commit?key=$apiKey"

        val docName = "projects/$projectId/databases/(default)/documents/nluTrain/trainData"

        val itemValue = JSONObject().put("stringValue", newValue)

        val fieldTransform = JSONObject().apply {
            put("fieldPath", "content")
            put("appendMissingElements", JSONObject().apply {
                val vals = JSONArray()
                vals.put(itemValue)
                put("values", vals)
            })
        }

        val transform = JSONObject().apply {
            put("document", docName)
            val ft = JSONArray(); ft.put(fieldTransform)
            put("fieldTransforms", ft)
        }

        val write = JSONObject().put("transform", transform)

        val writes = JSONArray().put(write)
        val body = JSONObject().put("writes", writes)

        val reqBody = body.toString().toRequestBody(this.JSON)

        val request = Request.Builder()
            .url(url)
            .post(reqBody)
            .addHeader("Content-Type", "application/json")
            .build()

        OkHttpClient().newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("UseSendDataToNluTrain", "commit failed: ${e.message}")
                promise.reject("FIRESTORE_ERROR", "commit failed: ${e.message}")
            }

            override fun onResponse(call: Call, response: Response) {
                response.use { resp ->
                    val respBody = resp.body?.string()
                    if (resp.isSuccessful) {
                        Log.d("UseSendDataToNluTrain", "commit OK: $respBody")
                        promise.resolve(true)
                    } else {
                        Log.e("UseSendDataToNluTrain", "commit HTTP ${resp.code}: $respBody")
                        promise.reject("FIRESTORE_ERROR", "commit HTTP ${resp.code}: $respBody")
                    }
                }
            }
        })
    }
}
