import { GoogleGenAI } from "@google/genai";

const MAX_AUDIO_BYTES = 7 * 1024 * 1024;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_ITEMS = 12;
const ALLOWED_AUDIO_TYPES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/wav",
  "audio/mpeg",
  "audio/mp4",
  "audio/aac",
  "audio/flac",
]);

const systemInstruction =
  "You are the CreatorCircle AI Assistant, a helpful assistant for creators and brands using a creator collaboration platform. Help with creator profiles, portfolios, campaign planning, applications, proposals, and collaboration best practices. Be clear, friendly, and practical. Do not claim to perform actions in CreatorCircle or access private account data. Ask a concise follow-up question when essential details are missing.";

const isValidHistory = (history) =>
  history === undefined ||
  (Array.isArray(history) &&
    history.length <= MAX_HISTORY_ITEMS &&
    history.every(
      (item) =>
        item &&
        ["user", "assistant"].includes(item.role) &&
        typeof item.text === "string" &&
        item.text.trim().length > 0 &&
        item.text.length <= MAX_MESSAGE_LENGTH,
    ));

const decodeBase64Audio = (value) => {
  if (
    typeof value !== "string" ||
    !value.length ||
    value.length > Math.ceil((MAX_AUDIO_BYTES * 4) / 3) ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      value,
    )
  ) {
    return null;
  }

  const buffer = Buffer.from(value, "base64");
  return buffer.length > 0 && buffer.length <= MAX_AUDIO_BYTES ? buffer : null;
};

export const chat = async (req, res) => {
  const message =
    typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const hasAudio = Boolean(req.file || req.body?.audioBase64);

  if (Boolean(message) === hasAudio) {
    return res.status(400).json({
      success: false,
      message: "Send either a text message or an audio recording",
    });
  }

  if (message.length > MAX_MESSAGE_LENGTH || !isValidHistory(req.body?.history)) {
    return res.status(400).json({
      success: false,
      message: "Message or conversation history is invalid or too long",
    });
  }

  let audioBuffer;
  let mimeType;
  if (hasAudio) {
    mimeType = req.file?.mimetype || req.body?.mimeType;
    if (!ALLOWED_AUDIO_TYPES.has(mimeType)) {
      return res.status(400).json({
        success: false,
        message: "Use a supported audio format such as WebM, WAV, OGG, or MP4",
      });
    }

    audioBuffer = req.file?.buffer || decodeBase64Audio(req.body?.audioBase64);
    if (!audioBuffer || audioBuffer.length > MAX_AUDIO_BYTES) {
      return res.status(400).json({
        success: false,
        message: "Audio is empty, invalid, or exceeds the 7 MB limit",
      });
    }
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      success: false,
      message: "The AI assistant is not configured on this server",
    });
  }

  const history = (req.body?.history || []).map((item) => ({
    role: item.role,
    parts: [{ text: item.text.trim() }],
  }));
  const currentParts = hasAudio
    ? [
        {
          inlineData: {
            mimeType,
            data: audioBuffer.toString("base64"),
          },
        },
        {
          text: "Listen to the user's spoken request and respond helpfully as the CreatorCircle assistant.",
        },
      ]
    : [{ text: message }];

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        ...history,
        {
          role: "user",
          parts: currentParts,
        },
      ],
      config: {
        systemInstruction,
      },
    });
    const replyText = response.text?.trim();

    if (!replyText) {
      return res.status(502).json({
        success: false,
        message: "The AI assistant did not return a reply. Please try again.",
      });
    }

    return res.status(200).json({ success: true, replyText });
  } catch (error) {
    console.error("[AI Assistant] Gemini request failed:", {
      name: error instanceof Error ? error.name : "Unknown error",
      message: error instanceof Error ? error.message : "Unknown failure",
    });
    return res.status(502).json({
      success: false,
      message: "Unable to get an AI assistant reply right now. Please try again.",
    });
  }
};
