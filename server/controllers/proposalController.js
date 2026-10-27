import { GoogleGenAI, Type } from "@google/genai";

const normalizeList = (value, fieldName) => {
  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  ) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  throw new TypeError(`${fieldName} must be a string or an array of strings`);
};

const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateAiPitch = async (req, res) => {
  const {
    brandName,
    campaignGoal,
    deliverables,
  } = req.body || {};
  const creatorName = req.creator?.name;
  const creatorNiche = req.creator?.category;
  const creatorStrengths = req.creator?.skills || [];

  let normalizedDeliverables = [];
  let normalizedStrengths = [];

  try {
    normalizedDeliverables = normalizeList(deliverables, "deliverables");
    // Default to empty array if strengths aren't provided
    if (creatorStrengths) {
      normalizedStrengths = normalizeList(creatorStrengths, "creatorStrengths");
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (
    typeof brandName !== "string" ||
    !brandName.trim() ||
    brandName.trim().length > 120 ||
    typeof campaignGoal !== "string" ||
    !campaignGoal.trim() ||
    campaignGoal.trim().length > 2000 ||
    typeof creatorName !== "string" ||
    !creatorName.trim() ||
    creatorName.trim().length > 120 ||
    typeof creatorNiche !== "string" ||
    !creatorNiche.trim() ||
    creatorNiche.trim().length > 120 ||
    normalizedDeliverables.length === 0 ||
    normalizedDeliverables.length > 20 ||
    normalizedDeliverables.some((item) => item.length > 300) ||
    normalizedStrengths.length > 20 ||
    normalizedStrengths.some((item) => item.length > 120)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Provide a brand, campaign goal, creator details, and valid deliverables and strengths",
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      success: false,
      message: "AI proposal generation is not configured on this server",
    });
  }

  const modelsToTry = ["gemini-3.8-flash", "gemini-3.6-flash"];
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let lastError = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[AI Pitch] Requesting ${modelName} (Attempt ${attempt})...`);

        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            "You are writing a creator partnership proposal ON BEHALF OF AND IN THE FIRST PERSON AS the creator, " +
              `${creatorName.trim()}. You are writing directly to the brand team at ${brandName.trim()}.\n\n` +
              "CRITICAL PERSPECTIVE & WRITING RULES:\n" +
              "1. Write strictly in the FIRST PERSON ('I', 'my', 'me'). Do NOT write about the creator in the third person.\n" +
              "2. Introduce yourself naturally as " + creatorName.trim() + ", mention your niche (" + creatorNiche.trim() + "), and explain how you will achieve the campaign goal using the deliverables.\n" +
              "3. proposalBody target: ~160-180 words (2 thorough paragraphs).\n" +
              "4. Return ONLY valid JSON matching the schema.\n\n" +
              `Brand: ${brandName.trim()}\n` +
              `Campaign goal: ${campaignGoal.trim()}\n` +
              `Deliverables: ${normalizedDeliverables.join("; ")}\n` +
              `Creator Name: ${creatorName.trim()}\n` +
              `Creator Niche: ${creatorNiche.trim()}\n` +
              `Creator Strengths: ${normalizedStrengths.join(", ") || "Aesthetic visual styling and high-engagement content execution"}`,
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                subjectLine: { type: Type.STRING },
                proposalBody: { type: Type.STRING },
                keyHighlights: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["subjectLine", "proposalBody", "keyHighlights"],
            },
          },
        });

        const rawText = response.text || "{}";
        const generated = JSON.parse(rawText);

        if (
          typeof generated.subjectLine !== "string" ||
          !generated.subjectLine.trim() ||
          typeof generated.proposalBody !== "string" ||
          !Array.isArray(generated.keyHighlights) ||
          !generated.keyHighlights.every(
            (highlight) => typeof highlight === "string" && highlight.trim()
          ) ||
          generated.keyHighlights.length === 0
        ) {
          console.warn(`[AI Pitch] ${modelName} returned invalid schema. Retrying...`);
          continue;
        }

        return res.status(200).json({
          subjectLine: generated.subjectLine.trim(),
          proposalBody: generated.proposalBody.trim(),
          keyHighlights: generated.keyHighlights.map((h) => h.trim()),
        });
      } catch (err) {
        lastError = err;
        console.warn(`[AI Pitch] Error on ${modelName}:`, err.message || err);

        const isBusy =
          err.status === 503 ||
          err.status === 429 ||
          (err.message && (err.message.includes("503") || err.message.includes("high demand")));

        if (isBusy && attempt < 2) {
          await sleep(1200);
        } else {
          break;
        }
      }
    }
  }

  return res.status(503).json({
    success: false,
    message: "Unable to generate proposal right now. Please try again.",
    errorDetails: lastError?.message,
  });
};