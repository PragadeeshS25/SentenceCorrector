const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "SentenceCorrector AI backend is running"
    });
});

// Sentence correction route
app.post("/api/correct", async (req, res) => {
    try {
        const { text, mode = "basic" } = req.body;

        // Check input
        if (!text || text.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Please enter a sentence."
            });
        }

        // Check token
        if (!process.env.HF_TOKEN) {
            return res.status(500).json({
                success: false,
                message: "Hugging Face token is missing."
            });
        }

        // Limit input length
        if (text.length > 5000) {
            return res.status(400).json({
                success: false,
                message: "Sentence is too long. Maximum 5000 characters allowed."
            });
        }

        // Determine correction mode
        let modeInstruction = "";

        if (mode === "professional") {
            modeInstruction = `
After correcting the sentence, make the wording professional
and suitable for workplace communication.
Do not change the original meaning.
`;
        } else if (mode === "academic") {
            modeInstruction = `
After correcting the sentence, make the wording appropriate
for academic writing.
Use clear and formal English.
Do not change the original meaning.
`;
        } else if (mode === "simple") {
            modeInstruction = `
After correcting the sentence, use simple and easy-to-understand English.
Do not change the original meaning.
`;
        } else {
            modeInstruction = `
Only correct the English sentence.
Do not unnecessarily rewrite a sentence that is already correct.
`;
        }

        const prompt = `
You are an expert English grammar and writing correction assistant.

Your task is to analyze and correct the user's English text.

${modeInstruction}

IMPORTANT:

1. Correct grammar.
2. Correct spelling.
3. Correct punctuation.
4. Correct capitalization.
5. Correct subject-verb agreement.
6. Correct verb tense.
7. Correct articles such as "a", "an", and "the".
8. Correct prepositions when necessary.
9. Correct incorrect verb forms.
10. Correct incorrect word order.
11. Correct sentence structure.
12. Improve unnatural English when necessary.
13. Preserve the user's original meaning.
14. Do not add new information.
15. Do not remove important information.

TENSE RULES:

- "yesterday", "last night", "last week", "last month", "ago"
  normally require an appropriate past tense.

- "tomorrow", "next week", "next month", "next year"
  normally require an appropriate future expression.

- "every day", "every week", "usually", "always", "often"
  normally indicate a habitual present tense.

- "now", "right now", "at the moment"
  normally indicate an appropriate present continuous form.

IMPORTANT:
Do not only fix capitalization.

For example:

Input:
i am going to college yesterday

Corrected:
I went to college yesterday.

Input:
i went to college tomorrow

Corrected:
I am going to college tomorrow.

Input:
she don't likes coffee

Corrected:
She doesn't like coffee.

Input:
he go to school every day

Corrected:
He goes to school every day.

Input:
i has completed my work

Corrected:
I have completed my work.

Input:
they was playing cricket

Corrected:
They were playing cricket.

Input:
yesterday i go to market

Corrected:
Yesterday, I went to the market.

Input:
i will visit my friend tomorrow

Corrected:
I will visit my friend tomorrow.

Now analyze this user text:

${text}

Return ONLY valid JSON.

The JSON must have exactly this structure:

{
  "correctedText": "corrected sentence or text",
  "issues": [
    {
      "type": "grammar",
      "original": "incorrect part",
      "correction": "correct part",
      "explanation": "short explanation"
    }
  ]
}

Issue type MUST be one of:

"grammar"
"spelling"
"style"

If there are no issues, return:

{
  "correctedText": "original sentence",
  "issues": []
}

Do not use Markdown.
Do not use code fences.
Do not add explanations outside the JSON.
`;

        // Call Hugging Face
        const response = await fetch(
            "https://router.huggingface.co/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.HF_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "meta-llama/Llama-3.1-8B-Instruct",
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: 500,
                    temperature: 0.1
                })
            }
        );

        const data = await response.json();

        // Hugging Face error
        if (!response.ok) {
            console.error("Hugging Face error:", data);

            return res.status(500).json({
                success: false,
                message:
                    data.error ||
                    "Hugging Face API request failed."
            });
        }

        const aiResponse =
            data.choices?.[0]?.message?.content?.trim();

        if (!aiResponse) {
            return res.status(500).json({
                success: false,
                message: "AI did not return a response."
            });
        }

        // Remove accidental Markdown code fences
        const cleanedResponse = aiResponse
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        // Convert AI response to JSON
        let result;

        try {
            result = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error("AI JSON parsing error:", aiResponse);

            return res.status(500).json({
                success: false,
                message: "AI returned an invalid response format."
            });
        }

        // Validate corrected text
        if (
            !result.correctedText ||
            typeof result.correctedText !== "string"
        ) {
            return res.status(500).json({
                success: false,
                message: "AI did not return corrected text."
            });
        }

        // Validate issues
        if (!Array.isArray(result.issues)) {
            result.issues = [];
        }

        res.json({
            success: true,
            originalText: text,
            correctedText: result.correctedText,
            issues: result.issues
        });

    } catch (error) {
        console.error("AI correction error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to correct the sentence right now."
        });
    }
});
// ========================================
// PARAPHRASE ROUTE
// ========================================

app.post("/api/paraphrase", async (req, res) => {
    try {
        const { text, style = "professional" } = req.body;

        // Check input
        if (!text || text.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Please provide text to paraphrase."
            });
        }

        // Check token
        if (!process.env.HF_TOKEN) {
            return res.status(500).json({
                success: false,
                message: "Hugging Face token is missing."
            });
        }

        // Limit input length
        if (text.length > 5000) {
            return res.status(400).json({
                success: false,
                message: "Text is too long. Maximum 5000 characters allowed."
            });
        }

        // Determine paraphrase style
        let styleInstruction = "";

        if (style === "professional") {
            styleInstruction = `
Rewrite the text in a professional and workplace-appropriate style.
`;
        } else if (style === "simple") {
            styleInstruction = `
Rewrite the text using simple, clear, and easy-to-understand English.
`;
        } else if (style === "formal") {
            styleInstruction = `
Rewrite the text in a formal and polished English style.
`;
        } else if (style === "concise") {
            styleInstruction = `
Rewrite the text in a concise way.
Keep the important meaning while using fewer unnecessary words.
`;
        } else {
            styleInstruction = `
Rewrite the text naturally while preserving its original meaning.
`;
        }

        const prompt = `
You are an expert English paraphrasing assistant.

Your task is to rewrite the user's text.

${styleInstruction}

IMPORTANT RULES:

1. Preserve the original meaning.
2. Do not add new information.
3. Do not remove important information.
4. Do not change names, places, numbers, or facts.
5. Use natural English.
6. Do not explain your changes.
7. Return only the paraphrased text.

User text:

${text}

Return only the rewritten text.
`;

        // Call Hugging Face
        const response = await fetch(
            "https://router.huggingface.co/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${process.env.HF_TOKEN}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    model: "meta-llama/Llama-3.1-8B-Instruct",

                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],

                    max_tokens: 500,
                    temperature: 0.3
                })
            }
        );

        const data = await response.json();

        // Hugging Face error
        if (!response.ok) {
            console.error(
                "Hugging Face paraphrase error:",
                data
            );

            return res.status(500).json({
                success: false,
                message:
                    data.error ||
                    "Hugging Face API request failed."
            });
        }

        // Get AI response
        const paraphrasedText =
            data.choices?.[0]?.message?.content?.trim();

        if (!paraphrasedText) {
            return res.status(500).json({
                success: false,
                message: "AI did not return paraphrased text."
            });
        }

        // Send response
        res.json({
            success: true,
            originalText: text,
            paraphrasedText: paraphrasedText
        });

    } catch (error) {
        console.error(
            "Paraphrase error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to paraphrase the text right now."
        });
    }
});
// Start server
app.listen(PORT, () => {
    console.log(
        `Server running at http://localhost:${PORT}`
    );
});