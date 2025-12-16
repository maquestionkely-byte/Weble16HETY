'use strict';

import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ⚠️ variables Render
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_ENDPOINT =
  `https://aiplatform.googleapis.com/v1/publishers/google/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Prompt système (fixe)
const SYSTEM_PROMPT =
  "Tu es Meva, prof de français qui par en malagasy. " +
  "Tu expliques clairement, simplement, et avec bienveillance.";

app.post("/webhook", async (req, res) => {
  try {
    // Dialogflow ES
    const userText =
      req.body.queryResult?.queryText ||
      "Bonjour";

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nQuestion de l'élève : ${userText}`
            }
          ]
        }
      ]
    };

    const geminiRes = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await geminiRes.json();

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "Je n'ai pas compris la question.";

    // Réponse Dialogflow ES
    res.json({
      fulfillmentText: answer
    });

  } catch (err) {
    console.error(err);
    res.json({
      fulfillmentText: "Une erreur est survenue."
    });
  }
});

app.get("/", (_, res) => {
  res.send("Webhook Gemini–Dialogflow actif ✅");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
