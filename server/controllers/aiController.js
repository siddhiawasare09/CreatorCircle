import { GoogleGenAI } from "@google/genai";

export const generateBio = async (req, res) => {
  const { category, skills } = req.body || {};
  const normalizedSkills = skills === undefined ? [] : skills;

  if (
    typeof category !== "string" ||
    !category.trim() ||
    category.trim().length > 100 ||
    !Array.isArray(normalizedSkills) ||
    normalizedSkills.length > 20 ||
    normalizedSkills.some(
      (skill) =>
        typeof skill !== "string" ||
        skill.trim().length === 0 ||
        skill.length > 60,
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide a category and up to 20 valid skills",
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      success: false,
      message: "AI bio generation is not configured on this server",
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash", // Updated to current standard model
      contents: [
        "Write a polished first-person creator profile bio in 2-3 sentences, under 80 words. " +
          "Only use the creator details below. Do not invent clients, awards, years of experience, or claims. " +
          "Return only the bio text, without a heading or quotation marks.\n" +
          `Category: ${category.trim()}\n` +
          `Skills: ${
            normalizedSkills
              .map((skill) => skill.trim())
              .filter(Boolean)
              .join(", ") || "Not provided"
          }`,
      ],
    });
    const bio = response.text?.trim();

    if (!bio) {
      return res.status(502).json({
        success: false,
        message: "The AI service did not return a bio. Please try again.",
      });
    }

    return res.status(200).json({ success: true, bio });
  } catch (error) {
    // Log the exact error object so we can see why Gemini rejected it
    console.error("Gemini bio generation failed:", error?.message || error);
    return res.status(502).json({
      success: false,
      message: "Unable to generate a bio right now. Please try again.",
    });
  }
};
