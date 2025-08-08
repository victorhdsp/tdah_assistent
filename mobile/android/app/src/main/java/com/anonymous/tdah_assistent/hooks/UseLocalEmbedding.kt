import ai.onnxruntime.*
import android.content.Context
import com.facebook.react.bridge.Promise
import java.nio.LongBuffer
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray

class UseLocalEmbedding(val context: Context, val tokenizer: BertTokenizer) {
    private val session: OrtSession
    private val env: OrtEnvironment
    private val inputName: String

    init {
        val modelInputStream = context.assets.open("models/tinybert-qin8.onnx")
        val modelBytes = modelInputStream.readBytes()

        env = OrtEnvironment.getEnvironment()
        session = env.createSession(modelBytes, OrtSession.SessionOptions())

        inputName = session.inputNames.first()
    }

    fun execute(input: String, promise: Promise) {
        val poolingStrategy = "cls" 

        try {
            val inputIds = tokenizer.execute(input)
            val seqLength = inputIds.size

            val inputIdsLong = LongArray(seqLength) { idx -> inputIds[idx].toLong() }
            val attentionMaskLong = LongArray(seqLength) { 1L }
            val tokenTypeIdsLong = LongArray(seqLength) { 0L }

            val inputIdsTensor =
                    OnnxTensor.createTensor(
                            env,
                            LongBuffer.wrap(inputIdsLong),
                            longArrayOf(1, seqLength.toLong())
                    )
            val attentionMaskTensor =
                    OnnxTensor.createTensor(
                            env,
                            LongBuffer.wrap(attentionMaskLong),
                            longArrayOf(1, seqLength.toLong())
                    )
            val tokenTypeIdsTensor =
                    OnnxTensor.createTensor(
                            env,
                            LongBuffer.wrap(tokenTypeIdsLong),
                            longArrayOf(1, seqLength.toLong())
                    )

            val inputNames = session.inputNames.toList()
            val inputs =
                    mapOf(
                            inputNames[0] to inputIdsTensor,
                            inputNames[1] to attentionMaskTensor,
                            inputNames[2] to tokenTypeIdsTensor
                    )

            session.run(inputs).use { results ->
                val value = results[0].value

                val flattened: FloatArray =
                        when {
                            value is FloatArray -> value

                            value is Array<*> && value.isNotEmpty() && value[0] is FloatArray -> {
                                (value[0] as FloatArray).copyOf()
                            }

                            value is Array<*> &&
                                    value.isNotEmpty() &&
                                    value[0] is Array<*> &&
                                    (value[0] as Array<*>).isNotEmpty() &&
                                    (value[0] as Array<*>)[0] is FloatArray -> {
                                val batch = value as Array<Array<FloatArray>>
                                val seqVectors = batch[0] 
                                val hiddenSize = seqVectors[0].size
                                when (poolingStrategy) {
                                    "cls" -> {
                                        seqVectors[0].copyOf()
                                    }
                                    "mean" -> {
                                        val acc = FloatArray(hiddenSize) { 0f }
                                        for (tokenVec in seqVectors) {
                                            for (i in tokenVec.indices) acc[i] += tokenVec[i]
                                        }
                                        val seqLen = seqVectors.size.toFloat()
                                        for (i in acc.indices) acc[i] = acc[i] / seqLen
                                        acc
                                    }
                                    else ->
                                            throw IllegalStateException(
                                                    "Unknown poolingStrategy: $poolingStrategy"
                                            )
                                }
                            }
                            else ->
                                    throw IllegalStateException(
                                            "Unsupported array structure: ${value?.javaClass}"
                                    )
                        }

                inputIdsTensor.close()
                attentionMaskTensor.close()
                tokenTypeIdsTensor.close()

                val outArray: WritableArray = Arguments.createArray()
                for (f in flattened) outArray.pushDouble(f.toDouble())

                promise.resolve(outArray)
            }
        } catch (e: Exception) {
            promise.reject("ONNX_EXECUTION_ERROR", e)
        }
    }
}
