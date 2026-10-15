import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  MapPin,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import { useShortlist } from "../context/useShortlist.js";
import api from "../services/api.js";

function CreatorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { creatorIds, toggleCreator } = useShortlist();
  const [creator, setCreator] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiry, setInquiry] = useState({
    name: user?.name || "",
    email: user?.email || "",
    message: "",
  });
  const [inquiryError, setInquiryError] = useState("");
  const [inquirySuccess, setInquirySuccess] = useState("");
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);

  const ownerId = creator?.user?._id || creator?.user;
  const isOwner = Boolean(
    user?.id && ownerId && String(user.id) === String(ownerId),
  );
  const isSaved = creatorIds.includes(id);

  useEffect(() => {
    let active = true;

    api
      .get(`/creators/${id}`)
      .then((response) => {
        if (active) setCreator(response.data.creator);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.status === 404
              ? "Creator profile not found."
              : requestError.response?.data?.message ||
                  "Unable to load this creator profile.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, retryKey]);

  const deleteProfile = async () => {
    const confirmed = window.confirm(
      "Delete this creator profile? This action cannot be undone.",
    );

    if (!confirmed) return;

    setError("");
    setIsDeleting(true);

    try {
      await api.delete(`/creators/${id}`);
      navigate("/creators", {
        replace: true,
        state: { message: "Creator profile deleted." },
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete this creator profile. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const submitInquiry = async (event) => {
    event.preventDefault();
    setInquiryError("");
    setInquirySuccess("");
    setIsSendingInquiry(true);

    try {
      const response = await api.post("/inquiries", {
        ...inquiry,
        creator: id,
      });
      setInquirySuccess(response.data.message || "Your inquiry was sent.");
      setInquiry((current) => ({ ...current, message: "" }));
    } catch (requestError) {
      setInquiryError(
        requestError.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSendingInquiry(false);
    }
  };

  const initials =
    creator?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "CC";

  return (
    <section className="creator-details-page">
      <Link className="creator-back-link" to="/creators">
        <ArrowLeft size={16} /> Back to creators
      </Link>
      {isLoading && (
        <div
          className="creator-detail-skeleton"
          role="status"
          aria-label="Loading creator profile"
        >
          <span />
          <span />
          <span />
          <span />
        </div>
      )}
      {error && !isLoading && (
        <div className="form-alert" role="alert">
          {error}
          <button
            className="inline-retry"
            type="button"
            onClick={() => setRetryKey((key) => key + 1)}
          >
            Retry
          </button>
        </div>
      )}
      {creator && !isLoading && (
        <article className="creator-details-panel">
          <div className="creator-details-heading">
            {creator.profileImage ? (
              <img
                className="creator-details-avatar"
                src={creator.profileImage}
                alt={`${creator.name} profile`}
              />
            ) : (
              <span
                className="creator-details-avatar discovery-avatar-fallback"
                aria-hidden="true"
              >
                {initials}
              </span>
            )}
            <div>
              <span className="discovery-category">{creator.category}</span>
              <h1>{creator.name}</h1>
              {creator.location && (
                <p className="discovery-location">
                  <MapPin size={15} />
                  {creator.location}
                </p>
              )}
            </div>
          </div>
          <div className="creator-detail-actions">
            <button
              className={`favorite-button detail-favorite${isSaved ? " is-saved" : ""}`}
              type="button"
              aria-label={
                isSaved ? "Remove from shortlist" : "Add to shortlist"
              }
              aria-pressed={isSaved}
              onClick={() => toggleCreator(id)}
            >
              <Heart size={17} fill={isSaved ? "currentColor" : "none"} />
              {isSaved ? "Saved" : "Shortlist"}
            </button>
            {!isOwner && (
              <button
                className="button-primary inquiry-open-button"
                type="button"
                onClick={() => setShowInquiry((shown) => !shown)}
              >
                <Send size={15} /> Send Inquiry
              </button>
            )}
          </div>
          {showInquiry && !isOwner && (
            <form className="inquiry-form" onSubmit={submitInquiry}>
              <h2>Send an inquiry</h2>
              {inquiryError && (
                <div className="form-alert" role="alert">
                  {inquiryError}
                </div>
              )}
              {inquirySuccess && (
                <div className="form-alert success" role="status">
                  {inquirySuccess}
                </div>
              )}
              <div className="inquiry-fields">
                <label>
                  Name
                  <input
                    required
                    value={inquiry.name}
                    onChange={(event) =>
                      setInquiry({ ...inquiry, name: event.target.value })
                    }
                  />
                </label>
                <label>
                  Email
                  <input
                    required
                    type="email"
                    value={inquiry.email}
                    onChange={(event) =>
                      setInquiry({ ...inquiry, email: event.target.value })
                    }
                  />
                </label>
                <label className="inquiry-message-field">
                  Message
                  <textarea
                    required
                    rows="4"
                    value={inquiry.message}
                    onChange={(event) =>
                      setInquiry({ ...inquiry, message: event.target.value })
                    }
                  />
                </label>
              </div>
              <button
                className="button-primary"
                type="submit"
                disabled={isSendingInquiry}
              >
                {isSendingInquiry ? "Sending…" : "Send Inquiry"}
              </button>
            </form>
          )}
          {isOwner && (
            <div className="creator-owner-actions">
              <Link
                className="button-outline"
                to={`/profile/edit/${creator._id}`}
              >
                <Pencil size={15} /> Edit Profile
              </Link>
              <button
                className="creator-delete-button"
                type="button"
                onClick={deleteProfile}
                disabled={isDeleting}
              >
                <Trash2 size={15} />{" "}
                {isDeleting ? "Deleting…" : "Delete Profile"}
              </button>
            </div>
          )}
          <section className="creator-details-section">
            <h2>About</h2>
            <p>{creator.bio}</p>
          </section>
          {creator.skills?.length > 0 && (
            <section className="creator-details-section">
              <h2>Skills</h2>
              <div className="discovery-skills">
                {creator.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </section>
          )}
          {Object.entries(creator.socialLinks || {}).some(
            ([, value]) => value,
          ) && (
            <section className="creator-details-section">
              <h2>Links</h2>
              <div className="creator-social-links">
                {Object.entries(creator.socialLinks || {})
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <a
                      key={label}
                      href={value}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {label === "instagram"
                        ? "Instagram"
                        : label === "linkedin"
                          ? "LinkedIn"
                          : label === "youtube"
                            ? "YouTube"
                            : label.charAt(0).toUpperCase() +
                              label.slice(1)}{" "}
                      <ExternalLink size={14} />
                    </a>
                  ))}
              </div>
            </section>
          )}
        </article>
      )}
    </section>
  );
}

export default CreatorDetails;
