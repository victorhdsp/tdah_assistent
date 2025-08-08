import android.content.Context

class BertTokenizer(context: Context) {
    private val vocab: Map<String, Int>;
    private val unkToken = "[UNK]"
    private val clsToken = "[CLS]"
    private val sepToken = "[SEP]"

    init {
        vocab = loadVocab(context)
    }

    fun execute(text: String): IntArray {
        val tokens = mutableListOf(clsToken)
        val words = text.lowercase().split("\\s+".toRegex())

        for (word in words) {
            tokens.addAll(wordPieceTokenize(word))
        }

        tokens.add(sepToken)

        return tokens.map { token -> vocab[token] ?: vocab[unkToken] ?: 0 }.toIntArray()
    }

    private fun loadVocab(context: Context): Map<String, Int> {
        val vocabMap = mutableMapOf<String, Int>()
        val inputStream = context.assets.open("dicts/bertVocab.txt")
        inputStream.bufferedReader().useLines { lines ->
            lines.forEachIndexed { index, token ->
                vocabMap[token.trim()] = index
            }
        }
        return vocabMap
    }

    private fun wordPieceTokenize(word: String): List<String> {
        val tokens = mutableListOf<String>()
        var start = 0

        while (start < word.length) {
            var end = word.length
            var curSubstr: String? = null

            while (start < end) {
                var substr = word.substring(start, end)
                if (start > 0) substr = "##$substr"

                if (vocab.containsKey(substr)) {
                    curSubstr = substr
                    break
                }
                end -= 1
            }

            if (curSubstr == null) {
                tokens.add(unkToken)
                break
            }

            tokens.add(curSubstr)
            start = end
        }

        return tokens
    }
}
