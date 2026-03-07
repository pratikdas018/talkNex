import axios from "axios"

const PROVIDER_TIMEOUT_MS = Number(process.env.AI_PROVIDER_TIMEOUT_MS || 7000)
const TOTAL_TIMEOUT_MS = Number(process.env.AI_TOTAL_TIMEOUT_MS || 15000)

const resolveGeminiUrl = () => {
    const configured = process.env.GEMINI_API_URL || ""
    if (!configured) return null

    if (configured.startsWith("http://") || configured.startsWith("https://")) {
        return configured
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash"
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${configured}`
}

const getGroqKey = () => process.env.GROQ_API_KEY

const getGroqModels = () => {
    const configured = process.env.GROQ_MODELS
    if (!configured) {
        return ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
    }
    return configured
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean)
}

const buildPrompt = (command, assistantName, userName) => `You are a virtual assistant named ${assistantName} created by ${userName}. 
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month"|"calculator-open" | "instagram-open" |"facebook-open" |"weather-show",
  "userInput": "<original user input>",
  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- "type": determine the intent of the user.
- "userInput": original sentence the user spoke.
- "response": a short voice-friendly reply.
- Use ${userName} if user asks who created you.
- Respond with JSON object only.

now your userInput- ${command}`

const parseModelResponse = (text, originalCommand) => {
    if (!text || typeof text !== "string") return null

    let parsed = null
    try {
        parsed = JSON.parse(text)
    } catch {
        const startIndex = text.indexOf("{")
        const endIndex = text.lastIndexOf("}")
        if (startIndex === -1 || endIndex === -1) return null
        try {
            parsed = JSON.parse(text.substring(startIndex, endIndex + 1))
        } catch {
            return null
        }
    }

    if (!parsed || typeof parsed !== "object") return null
    if (!parsed.userInput) parsed.userInput = originalCommand
    if (!parsed.type) parsed.type = "general"
    if (!parsed.response) {
        parsed.response = "I understood your request but could not generate a full answer."
    }
    return parsed
}

const queryGemini = async (prompt, command, timeoutMs) => {
    const apiUrl = resolveGeminiUrl()
    if (!apiUrl) return null

    const result = await axios.post(
        apiUrl,
        { contents: [{ parts: [{ text: prompt }] }] },
        {
            headers: { "Content-Type": "application/json" },
            timeout: timeoutMs,
        }
    )

    const text = result?.data?.candidates?.[0]?.content?.parts?.[0]?.text
    return parseModelResponse(text, command)
}

const queryGroq = async (prompt, command, startedAt) => {
    const groqKey = getGroqKey()
    if (!groqKey) return null

    const models = getGroqModels()
    for (const model of models) {
        try {
            const elapsed = Date.now() - startedAt
            const remainingBudget = TOTAL_TIMEOUT_MS - elapsed
            if (remainingBudget <= 0) return null
            const timeoutMs = Math.max(1500, Math.min(PROVIDER_TIMEOUT_MS, remainingBudget))

            const result = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model,
                    messages: [
                        {
                            role: "system",
                            content:
                                "Return only valid JSON object. Do not add markdown or extra text.",
                        },
                        { role: "user", content: prompt },
                    ],
                    temperature: 0.2,
                    max_tokens: 300,
                },
                {
                    headers: {
                        Authorization: `Bearer ${groqKey}`,
                        "Content-Type": "application/json",
                    },
                    timeout: timeoutMs,
                }
            )

            const text = result?.data?.choices?.[0]?.message?.content
            const parsed = parseModelResponse(text, command)
            if (parsed) return parsed
        } catch (error) {
            console.error(`Groq API Error (${model}):`, error?.response?.data || error.message)
        }
    }

    return null
}

const geminiResponse = async (command, assistantName, userName) => {
    const prompt = buildPrompt(command, assistantName, userName)
    const startedAt = Date.now()

    try {
        const geminiTimeoutMs = Math.min(PROVIDER_TIMEOUT_MS, TOTAL_TIMEOUT_MS)
        const geminiResult = await queryGemini(prompt, command, geminiTimeoutMs)
        if (geminiResult) return geminiResult
    } catch (error) {
        console.error("Gemini API Error:", error?.response?.data || error.message)
    }

    try {
        const groqResult = await queryGroq(prompt, command, startedAt)
        if (groqResult) return groqResult
    } catch (error) {
        console.error("Groq fallback failed:", error?.response?.data || error.message)
    }

    return null
}

export default geminiResponse
