import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api.js";

const senderId = (sender) =>
  sender && typeof sender === "object" ? sender._id : sender;
const participantUserId = (participant) =>
  participant && typeof participant === "object"
    ? participant.user?._id || participant.user || participant._id
    : participant;

function InquiryThread({
  inquiry,
  currentUserId,
  onInquiryChange,
}) {
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const savedMessages = Array.isArray(inquiry.messages) ? inquiry.messages : [];
  const hasInitialMessage = savedMessages.some(
    (message) =>
      message.text === inquiry.message &&
      String(senderId(message.sender) || "") ===
        String(participantUserId(inquiry.customer) || ""),
  );
  const messages =
    inquiry.message && !hasInitialMessage
      ? [
          {
            _id: `legacy-${inquiry._id}`,
            sender: inquiry.customer,
            text: inquiry.message,
            createdAt: inquiry.createdAt,
          },
          ...savedMessages,
        ]
      : savedMessages;
  const customerId = participantUserId(inquiry.customer);
  const creatorId = participantUserId(inquiry.creator);
  const customerLabel =
    (typeof inquiry.customer === "object" &&
      (inquiry.customer?.name || inquiry.customer?.email)) ||
    inquiry.name ||
    inquiry.email ||
    "Brand / Customer";
  const creatorLabel =
    (typeof inquiry.creator === "object" && inquiry.creator?.name) ||
    "Creator";

  const sendReply = async (event) => {
    event.preventDefault();
    const text = reply.trim();
    if (!text || isSending) return;

    const previousMessages = savedMessages;
    const optimisticMessage = {
      _id: `pending-${Date.now()}`,
      sender: currentUserId,
      text,
      createdAt: new Date().toISOString(),
    };
    const nextMessages = [...messages, optimisticMessage];
    onInquiryChange({ ...inquiry, messages: nextMessages });
    setReply("");
    setError("");
    setIsSending(true);

    try {
      const response = await api.post(
        `/inquiries/${inquiry._id}/messages`,
        { text },
      );
      onInquiryChange(response.data.inquiry);
      toast.success("Reply sent.");
    } catch (requestError) {
      onInquiryChange({ ...inquiry, messages: previousMessages });
      setReply(text);
      const message =
        requestError.response?.data?.message ||
        "Unable to send your reply. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="inquiry-thread">
      <div className="inquiry-thread-messages" aria-live="polite">
        {messages.map((message) => {
          const messageSenderId = String(senderId(message.sender) || "");
          const isCustomerMessage =
            messageSenderId !== "" &&
            messageSenderId === String(customerId || "");
          const isCreatorMessage =
            messageSenderId !== "" &&
            messageSenderId === String(creatorId || "");
          const isOwn =
            messageSenderId !== "" &&
            messageSenderId === String(currentUserId || "");
          const roleLabel = isCustomerMessage
            ? `Brand / Customer · ${customerLabel}`
            : isCreatorMessage
              ? `Creator · ${creatorLabel}`
              : isOwn
                ? "You"
                : "Conversation participant";
          const roleClass = isCustomerMessage
            ? "is-customer"
            : isCreatorMessage
              ? "is-creator"
              : "is-unknown";
          return (
            <article
              className={`inquiry-message ${roleClass}${isOwn ? " is-own" : ""}`}
              key={message._id}
            >
              <div className="inquiry-message-meta">
                <span className="inquiry-sender-badge">
                  {roleLabel}
                </span>
                {isOwn && (
                  <span className="inquiry-you-badge">You</span>
                )}
                <time dateTime={message.createdAt}>
                  {new Date(message.createdAt).toLocaleString()}
                </time>
              </div>
              <p>{message.text}</p>
            </article>
          );
        })}
        {messages.length === 0 && (
          <p className="inquiry-thread-empty">
            No messages in this conversation yet.
          </p>
        )}
      </div>
      {error && (
        <div className="form-alert inquiry-reply-error" role="alert">
          {error}
        </div>
      )}
      <form className="inquiry-reply-form" onSubmit={sendReply}>
        <label className="visually-hidden" htmlFor={`reply-${inquiry._id}`}>
          Write a reply
        </label>
        <textarea
          id={`reply-${inquiry._id}`}
          value={reply}
          maxLength={1000}
          rows={2}
          placeholder="Write a reply…"
          onChange={(event) => setReply(event.target.value)}
          disabled={isSending}
          required
        />
        <button
          className="button-primary"
          type="submit"
          disabled={isSending || !reply.trim()}
        >
          <Send size={14} />
          {isSending ? "Sending…" : "Reply"}
        </button>
      </form>
    </div>
  );
}

export default InquiryThread;
