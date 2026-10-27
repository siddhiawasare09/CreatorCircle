import { useEffect, useRef, useState } from "react";
import {
  Bot,
  LoaderCircle,
  Mic,
  Send,
  Square,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import api from "../services/api.js";

const MAX_RECORDING_BYTES = 7 * 1024 * 1024;
const MAX_MESSAGE_LENGTH = 4000;
const HISTORY_LIMIT = 12;

const toBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const separator = result.indexOf(",");
      if (separator < 0) {
        reject(new Error("Unable to read the audio recording"));
        return;
      }
      resolve(result.slice(separator + 1));
    };
    reader.onerror = () => reject(new Error("Unable to read the audio recording"));
    reader.readAsDataURL(blob);
  });

function AiAssistantWidget() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("text");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const messageListRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    const list = messageListRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, isOpen]);

  useEffect(
    () => () => {
      const recorder = recorderRef.current;
      if (recorder?.state === "recording") {
        recorder.onstop = null;
        recorder.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      window.speechSynthesis?.cancel();
    },
    [],
  );

  const speakReply = (text) => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setError("Voice replies are not supported by this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const sendRequest = async ({ message, audioBlob }) => {
    if (isSending) return;
    setError("");
    setIsSending(true);

    const priorHistory = messages
      .filter((item) => item.role === "user" || item.role === "assistant")
      .slice(-HISTORY_LIMIT)
      .map(({ role, text }) => ({ role, text }));

    try {
      let payload;
      if (audioBlob) {
        if (audioBlob.size > MAX_RECORDING_BYTES) {
          throw new Error("Recording exceeds the 7 MB size limit. Try a shorter recording.");
        }
        payload = {
          audioBase64: await toBase64(audioBlob),
          mimeType: audioBlob.type.split(";")[0] || "audio/webm",
          history: priorHistory,
        };
        setMessages((current) => [
          ...current,
          { role: "user", text: "🎙 Voice message" },
        ]);
      } else {
        payload = { message, history: priorHistory };
        setMessages((current) => [...current, { role: "user", text: message }]);
      }

      const response = await api.post("/ai/chat", payload);
      const replyText = response.data.replyText;
      if (typeof replyText !== "string" || !replyText.trim()) {
        throw new Error("The assistant returned an empty reply.");
      }
      setMessages((current) => [
        ...current,
        { role: "assistant", text: replyText.trim() },
      ]);
      if (audioBlob) speakReply(replyText.trim());
    } catch (requestError) {
      const messageText =
        requestError.response?.data?.message ||
        requestError.message ||
        "Unable to send your message. Please try again.";
      setError(messageText);
      setMessages((current) => [
        ...current,
        { role: "assistant", text: `I couldn't complete that request: ${messageText}` },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const sendText = (event) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || isSending) return;
    setInput("");
    sendRequest({ message });
  };

  const startRecording = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("Audio recording is not supported by this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const supportedTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ];
      const mimeType = supportedTypes.find((type) =>
        window.MediaRecorder.isTypeSupported(type),
      );
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        setError("Recording failed. Check your microphone and try again.");
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };
      recorder.onstop = () => {
        const recording = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setIsRecording(false);
        if (recording.size) {
          void sendRequest({ audioBlob: recording });
        } else {
          setError("No audio was recorded. Try again.");
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (recordingError) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsRecording(false);
      setError(
        recordingError.name === "NotAllowedError"
          ? "Microphone permission was denied. Allow microphone access to use Voice Mode."
          : recordingError.message || "Unable to start microphone recording.",
      );
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  };

  if (!token) return null;

  return (
    <div className="ai-assistant-widget">
      {isOpen && (
        <section
          className="ai-assistant-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="ai-assistant-title"
        >
          <header className="ai-assistant-header">
            <div className="ai-assistant-title">
              <span className="ai-assistant-icon">
                <Bot size={19} />
              </span>
              <div>
                <h2 id="ai-assistant-title">CreatorCircle AI</h2>
                <span>Your creator & campaign assistant</span>
              </div>
            </div>
            <button
              className="ai-assistant-close"
              type="button"
              aria-label="Close AI assistant"
              onClick={() => setIsOpen(false)}
            >
              <X size={18} />
            </button>
          </header>

          <div className="ai-assistant-modes" role="group" aria-label="Assistant mode">
            <button
              type="button"
              className={mode === "text" ? "is-active" : ""}
              aria-pressed={mode === "text"}
              onClick={() => {
                setMode("text");
                setError("");
              }}
              disabled={isRecording || isSending}
            >
              Text Mode
            </button>
            <button
              type="button"
              className={mode === "voice" ? "is-active" : ""}
              aria-pressed={mode === "voice"}
              onClick={() => {
                setMode("voice");
                setError("");
              }}
              disabled={isRecording || isSending}
            >
              Voice Mode
            </button>
          </div>

          <div className="ai-assistant-messages" ref={messageListRef} aria-live="polite">
            {messages.length === 0 && (
              <div className="ai-assistant-welcome">
                <Bot size={23} />
                <p>
                  Ask about creator profiles, portfolios, campaign planning, or
                  writing a great pitch.
                </p>
              </div>
            )}
            {messages.map((item, index) => (
              <div
                className={`ai-assistant-message is-${item.role}`}
                key={`${item.role}-${index}`}
              >
                <span>{item.role === "assistant" ? "Assistant" : "You"}</span>
                <p>{item.text}</p>
              </div>
            ))}
            {isSending && (
              <div className="ai-assistant-thinking" role="status">
                <LoaderCircle className="spin-animation" size={15} />
                Thinking…
              </div>
            )}
          </div>

          {error && (
            <p className="ai-assistant-error" role="alert">
              {error}
              {error.includes("log in") && (
                <>
                  {" "}
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    Log in
                  </Link>
                </>
              )}
            </p>
          )}

          {mode === "text" ? (
            <form className="ai-assistant-input" onSubmit={sendText}>
              <label className="visually-hidden" htmlFor="ai-assistant-text">
                Message the CreatorCircle AI assistant
              </label>
              <textarea
                id="ai-assistant-text"
                rows={2}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder="Ask CreatorCircle AI…"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={isSending}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <button
                className="ai-assistant-send"
                type="submit"
                aria-label="Send message"
                disabled={isSending || !input.trim()}
              >
                {isSending ? (
                  <LoaderCircle className="spin-animation" size={17} />
                ) : (
                  <Send size={17} />
                )}
              </button>
            </form>
          ) : (
            <div className="ai-assistant-voice">
              <p>
                {isRecording
                  ? "Recording… select Stop when you’re done speaking."
                  : "Tap the microphone and speak your request."}
              </p>
              <button
                className={`ai-assistant-mic${isRecording ? " is-recording" : ""}`}
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isSending}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? <Square size={17} /> : <Mic size={20} />}
                {isRecording ? "Stop Recording" : "Start Recording"}
              </button>
            </div>
          )}
        </section>
      )}
      <button
        className="ai-assistant-launcher"
        type="button"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close CreatorCircle AI assistant" : "Open CreatorCircle AI assistant"}
        onClick={() => setIsOpen((open) => !open)}
        disabled={isRecording}
      >
        {isOpen ? <X size={21} /> : <Bot size={21} />}
        <span>{isOpen ? "Close" : "AI Assistant"}</span>
      </button>
    </div>
  );
}

export default AiAssistantWidget;
