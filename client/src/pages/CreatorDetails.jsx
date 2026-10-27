import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  MapPin,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import PostCard from "../components/PostCard.jsx";
import { PortfolioGridSkeleton } from "../components/LoadingSkeletons.jsx";
import { useAuth } from "../context/useAuth.js";
import { useShortlist } from "../context/useShortlist.js";
import api from "../services/api.js";

function CreatorDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { creatorIds, toggleCreator } = useShortlist();
  const [creator, setCreator] = useState(null);
  const [creatorLoadedForId, setCreatorLoadedForId] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const [posts, setPosts] = useState([]);
  const [postsCreatorId, setPostsCreatorId] = useState(null);
  const [postsError, setPostsError] = useState("");
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsRetryKey, setPostsRetryKey] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showInquiry, setShowInquiry] = useState(
    () => Boolean(location.state?.openInquiry),
  );
  const [shortlistFeedback, setShortlistFeedback] = useState("");
  const [inquiry, setInquiry] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [inquiryError, setInquiryError] = useState("");
  const [inquirySuccess, setInquirySuccess] = useState("");
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);

  const ownerId = creator?.user?._id || creator?.user;
  const isOwner = Boolean(
    user?.id && ownerId && String(user.id) === String(ownerId),
  );
  const canSendInquiry = !isOwner && user?.role === "customer";
  const isSaved = creatorIds.includes(id);

  useEffect(() => {
    let active = true;

    api
      .get(`/creators/${id}`)
      .then((response) => {
        if (!response.data.creator) {
          throw new Error("Creator response did not include a profile");
        }
        if (active) {
          setCreator(response.data.creator);
          setCreatorLoadedForId(id);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setCreator(null);
          setCreatorLoadedForId(id);
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
  const isLoadingCurrentCreator =
    isLoading || creatorLoadedForId !== id;

  useEffect(() => {
    if (!creator || String(creator._id) !== id) return undefined;

    let active = true;
    api
      .get(`/creators/${id}/posts`)
      .then((response) => {
        if (!Array.isArray(response.data.posts)) {
          throw new Error("Portfolio response did not include a post list");
        }
        if (active) {
          setPosts(response.data.posts);
          setPostsCreatorId(id);
          setPostsError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setPostsCreatorId(id);
          setPostsError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Unable to load this creator’s portfolio.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoadingPosts(false);
      });

    return () => {
      active = false;
    };
  }, [creator, id, postsRetryKey]);
  const isLoadingCurrentPosts = isLoadingPosts || postsCreatorId !== id;

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
      setInquirySuccess(response.data.message || "Inquiry sent successfully.");
      toast.success("Inquiry sent successfully.");
      setInquiry((current) => ({
        ...current,
        subject: "",
        message: "",
      }));
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
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
      {isLoadingCurrentCreator && (
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
      {error && !isLoadingCurrentCreator && (
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
      {creator && String(creator._id) === id && !isLoadingCurrentCreator && (
        <m.article
          className="creator-details-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          layout
        >
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
              onClick={() => {
                toggleCreator(id);
                const message = isSaved
                  ? "Creator removed from shortlist."
                  : "Creator added to shortlist.";
                setShortlistFeedback(message);
                toast.success(
                  isSaved
                    ? `${creator.name} removed from your shortlist.`
                    : `${creator.name} added to your shortlist.`,
                );
              }}
            >
              <Heart size={17} fill={isSaved ? "currentColor" : "none"} />
              {isSaved ? "Saved" : "Shortlist"}
            </button>
            {canSendInquiry && (
              <button
                className="button-primary inquiry-open-button"
                type="button"
                onClick={() => setShowInquiry((shown) => !shown)}
              >
                <Send size={15} /> Send Inquiry
              </button>
            )}
            {!user && !isOwner && (
              <Link
                className="button-primary inquiry-open-button"
                to="/login"
                state={{ message: "Log in to start a collaboration inquiry." }}
              >
                <Send size={15} /> Log in to inquire
              </Link>
            )}
          </div>
          {shortlistFeedback && (
            <div className="form-alert success shortlist-feedback" role="status">
              {shortlistFeedback}{" "}
              <Link to="/shortlist">View My Shortlist</Link>
            </div>
          )}
          {showInquiry && canSendInquiry && (
            <form className="inquiry-form" onSubmit={submitInquiry}>
              <h2>Send an inquiry</h2>
              {inquiryError && (
                <div className="form-alert" role="alert">
                  {inquiryError}
                </div>
              )}
              {inquirySuccess && (
                <div className="form-alert success" role="status">
                  {inquirySuccess}{" "}
                  <Link to="/inquiries">View your conversations</Link>
                </div>
              )}
              <div className="inquiry-fields">
                <label className="inquiry-message-field">
                  Subject
                  <input
                    required
                    maxLength={120}
                    value={inquiry.subject}
                    onChange={(event) =>
                      setInquiry({ ...inquiry, subject: event.target.value })
                    }
                  />
                </label>
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
                    maxLength={1000}
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
          <section className="creator-details-section creator-portfolio-section">
            <div className="post-section-heading">
              <div>
                <span className="eyebrow">Selected projects</span>
                <h2>Portfolio</h2>
              </div>
            </div>
            {isLoadingCurrentPosts ? (
              <PortfolioGridSkeleton />
            ) : postsError ? (
              <div className="form-alert" role="alert">
                {postsError}
                <button
                  className="inline-retry"
                  type="button"
                  onClick={() => {
                    setIsLoadingPosts(true);
                    setPostsError("");
                    setPostsRetryKey((key) => key + 1);
                  }}
                >
                  Retry
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="post-empty-state">
                <h3>No portfolio posts yet</h3>
                <p>This creator’s work will appear here when they share it.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <m.div className="post-grid" layout>
                  {posts.map((post) => (
                    <m.div
                      key={post._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                    >
                      <PostCard post={post} />
                    </m.div>
                  ))}
                </m.div>
              </AnimatePresence>
            )}
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
        </m.article>
      )}
    </section>
  );
}

export default CreatorDetails;
