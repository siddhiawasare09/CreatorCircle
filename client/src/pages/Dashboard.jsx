import {
  ArrowRight,
  ArrowUpRight,
  LogOut,
  MapPin,
  Plus,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/useAuth.js";
import AIPitchGeneratorModal from "../components/AIPitchGeneratorModal.jsx";
import InquiryThread from "../components/InquiryThread.jsx";
import { PortfolioGridSkeleton } from "../components/LoadingSkeletons.jsx";
import PostCard from "../components/PostCard.jsx";
import PostForm from "../components/PostForm.jsx";
import api from "../services/api.js";

const postToFormValues = (post) => ({
  title: post.title || "",
  description: post.description || "",
  mediaUrl: post.mediaUrl || "",
  mediaType: post.mediaType || "image",
  tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
});

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [creator, setCreator] = useState(null);
  const [activeDashboardTab, setActiveDashboardTab] = useState("work");
  const [applications, setApplications] = useState([]);
  const [applicationsError, setApplicationsError] = useState("");
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [applicationsRetryKey, setApplicationsRetryKey] = useState(0);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [posts, setPosts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesError, setInquiriesError] = useState("");
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(true);
  const [inquiriesRetryKey, setInquiriesRetryKey] = useState(0);
  const [updatingInquiryId, setUpdatingInquiryId] = useState("");
  const [inquiryFeedback, setInquiryFeedback] = useState("");
  const [postsError, setPostsError] = useState("");
  const [postActionError, setPostActionError] = useState("");
  const [postFormError, setPostFormError] = useState("");
  const [postSuccess, setPostSuccess] = useState("");
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsRetryKey, setPostsRetryKey] = useState(0);
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [proposalDraft, setProposalDraft] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState("");
  const creatorInitials =
    creator?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "CC";
  const editingPostValues = useMemo(
    () => (editingPost ? postToFormValues(editingPost) : undefined),
    [editingPost],
  );

  useEffect(() => {
    let active = true;

    api
      .get("/creators")
      .then((response) => {
        const ownProfile = (response.data.creators || []).find((item) => {
          const ownerId = item.user?._id || item.user;
          return String(ownerId) === String(user?.id);
        });

        if (active) setCreator(ownProfile || null);
      })
      .catch((error) => {
        if (active) {
          setProfileError(
            error.response?.data?.message ||
              "Unable to load your profile summary.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoadingProfile(false);
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    let active = true;

    api
      .get("/posts/mine")
      .then((response) => {
        if (!Array.isArray(response.data.posts)) {
          throw new Error("Portfolio response did not include a post list");
        }
        if (active) {
          setPosts(response.data.posts);
          setPostsError("");
        }
      })
      .catch((error) => {
        if (active) {
          setPostsError(
            error.response?.data?.message ||
              error.message ||
              "Unable to load your portfolio posts.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoadingPosts(false);
      });

    return () => {
      active = false;
    };
  }, [postsRetryKey]);

  useEffect(() => {
    let active = true;

    api
      .get("/inquiries/received")
      .then((response) => {
        if (!Array.isArray(response.data.inquiries)) {
          throw new Error("Inquiry response did not include an inquiry list");
        }
        if (active) {
          setInquiries(response.data.inquiries);
          setInquiriesError("");
        }
      })
      .catch((error) => {
        if (active) {
          setInquiriesError(
            error.response?.data?.message ||
              error.message ||
              "Unable to load your inquiries.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoadingInquiries(false);
      });

    return () => {
      active = false;
    };
  }, [inquiriesRetryKey]);

  useEffect(() => {
    if (isLoadingProfile) return undefined;

    if (!creator) return undefined;

    let active = true;
    api
      .get("/proposals/my-proposals")
      .then((response) => {
        if (!Array.isArray(response.data.proposals)) {
          throw new Error("Proposal response did not include an application list");
        }
        if (active) {
          setApplications(response.data.proposals);
          setApplicationsError("");
        }
      })
      .catch((error) => {
        if (active) {
          setApplicationsError(
            error.response?.data?.message ||
              error.message ||
              "Unable to load your applications.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoadingApplications(false);
      });

    return () => {
      active = false;
    };
  }, [creator, applicationsRetryKey, isLoadingProfile]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const savePost = async (postData) => {
    setPostFormError("");
    setPostSuccess("");
    setIsSavingPost(true);

    try {
      if (editingPost) {
        await api.put(`/posts/${editingPost._id}`, postData);
      } else {
        await api.post("/posts", postData);
      }

      setEditingPost(null);
      setIsPostFormOpen(false);
      setPostSuccess(
        editingPost
          ? "Your portfolio post was updated."
          : "Your portfolio post was added.",
      );
      toast.success(
        editingPost
          ? "Your portfolio post was updated."
          : "Your portfolio post was added.",
      );
      setPostsError("");

      try {
        const response = await api.get("/posts/mine");
        if (!Array.isArray(response.data.posts)) {
          throw new Error("Portfolio response did not include a post list");
        }
        setPosts(response.data.posts);
      } catch (error) {
        setPostsError(
          error.response?.data?.message ||
            error.message ||
            "Your post was saved, but the portfolio could not be refreshed.",
        );
      }
    } catch (error) {
      setPostFormError(
        error.response?.data?.message ||
          "Unable to save your portfolio post.",
      );
      toast.error(
        error.response?.data?.message ||
          "Unable to save your portfolio post.",
      );
    } finally {
      setIsSavingPost(false);
    }
  };

  const deletePost = async (post) => {
    if (!window.confirm(`Delete "${post.title}" from your portfolio?`)) return;

    setPostActionError("");
    setDeletingPostId(post._id);
    try {
      await api.delete(`/posts/${post._id}`);
      setPosts((current) => current.filter((item) => item._id !== post._id));
      toast.success("Portfolio post deleted.");
    } catch (error) {
      setPostActionError(
        error.response?.data?.message ||
          "Unable to delete your portfolio post.",
      );
      toast.error(
        error.response?.data?.message ||
          "Unable to delete your portfolio post.",
      );
    } finally {
      setDeletingPostId("");
    }
  };

  const updateInquiryStatus = async (inquiry, status) => {
    const previousStatus = inquiry.status || "pending";
    const optimisticInquiry = { ...inquiry, status };
    setInquiries((current) =>
      current.map((item) =>
        item._id === inquiry._id ? optimisticInquiry : item,
      ),
    );
    setUpdatingInquiryId(inquiry._id);
    setInquiryFeedback("");
    setInquiriesError("");

    try {
      const response = await api.patch(
        `/inquiries/${inquiry._id}/status`,
        { status },
      );
      setInquiries((current) =>
        current.map((item) =>
          item._id === inquiry._id ? response.data.inquiry : item,
        ),
      );
      setInquiryFeedback(`Inquiry marked ${status}.`);
      toast.success(`Inquiry marked ${status}.`);
    } catch (error) {
      setInquiries((current) =>
        current.map((item) =>
          item._id === inquiry._id
            ? { ...item, status: previousStatus }
            : item,
        ),
      );
      setInquiriesError(
        error.response?.data?.message ||
          "Unable to update this inquiry. Please try again.",
      );
      toast.error(
        error.response?.data?.message ||
          "Unable to update this inquiry. Please try again.",
      );
    } finally {
      setUpdatingInquiryId("");
    }
  };

  const useProposalDraft = (proposal) => {
    setProposalDraft(proposal);
    setIsPitchModalOpen(false);
    toast.success("Proposal added to your reusable draft.");
  };

  return (
    <section className="dashboard-page">
      <div className="dashboard-welcome">
        <span className="eyebrow">Your CreatorCircle</span>
        <h1 className="dashboard-title">Welcome, {user?.name || "creator"}.</h1>
        <p>
          You’re signed in. Your next good idea could start with a conversation.
        </p>
        {location.state?.message && (
          <div className="form-alert success dashboard-message" role="status">
            {location.state.message}
          </div>
        )}
      </div>
      {isLoadingProfile ? (
        <div className="dashboard-panel profile-loading" role="status">
          Loading your creator profile…
        </div>
      ) : creator ? (
        <div className="dashboard-panel dashboard-profile-panel">
          <div className="dashboard-panel-copy">
            <span className="eyebrow">Your creator profile</span>
            <h2>{creator.name}</h2>
            <p className="creator-summary-meta">
              {creator.category}
              {creator.location ? (
                <>
                  {" "}
                  <span>·</span> <MapPin size={14} /> {creator.location}
                </>
              ) : null}
            </p>
            <p>{creator.bio}</p>
            {creator.skills?.length > 0 && (
              <div className="creator-skills dashboard-skills">
                {creator.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            )}
          </div>
          <div className="dashboard-mark dashboard-creator-avatar">
            {creator.profileImage ? (
              <img src={creator.profileImage} alt={`${creator.name} profile`} />
            ) : (
              <span aria-hidden="true">{creatorInitials}</span>
            )}
          </div>
        </div>
      ) : (
        <div className="dashboard-panel">
          <div className="dashboard-panel-copy">
            <h2>Make space for your next idea.</h2>
            <p>
              Create a creator profile to share your skills and help
              collaborators find you.
            </p>
          </div>
          <div className="dashboard-mark">
            <Sparkles size={34} />
          </div>
        </div>
      )}
      {profileError && (
        <div className="form-alert dashboard-message" role="alert">
          {profileError}
        </div>
      )}
      <div className="dashboard-profile-actions">
        {!creator && !isLoadingProfile && (
          <Link className="button-primary" to="/profile/create">
            Create Profile <ArrowRight size={16} />
          </Link>
        )}
        {creator && (
          <Link className="button-primary" to={`/profile/edit/${creator._id}`}>
            Edit Profile <ArrowRight size={16} />
          </Link>
        )}
        {creator && (
          <button
            className="button-outline"
            type="button"
            onClick={() => setIsPitchModalOpen(true)}
          >
            <Sparkles size={16} /> Draft Pitch with AI
          </button>
        )}
        <Link className="button-outline" to="/creators">
          Browse Creators <ArrowUpRight size={16} />
        </Link>
      </div>
      {proposalDraft && (
        <section className="proposal-draft-panel" aria-labelledby="proposal-draft-title">
          <div className="proposal-draft-heading">
            <div>
              <span className="eyebrow">Saved for your application</span>
              <h2 id="proposal-draft-title">Proposal draft</h2>
            </div>
            <button
              className="button-outline"
              type="button"
              onClick={() => setProposalDraft(null)}
            >
              Clear draft
            </button>
          </div>
          <label className="form-field">
            Subject line
            <input
              value={proposalDraft.subjectLine}
              onChange={(event) =>
                setProposalDraft({
                  ...proposalDraft,
                  subjectLine: event.target.value,
                })
              }
            />
          </label>
          <label className="form-field">
            Proposal body
            <textarea
              rows={8}
              value={proposalDraft.proposalBody}
              onChange={(event) =>
                setProposalDraft({
                  ...proposalDraft,
                  proposalBody: event.target.value,
                })
              }
            />
          </label>
          {proposalDraft.keyHighlights.length > 0 && (
            <div className="proposal-draft-highlights">
              <strong>Key highlights</strong>
              <ul>
                {proposalDraft.keyHighlights.map((highlight, index) => (
                  <li key={`${highlight}-${index}`}>{highlight}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
      {creator && (
        <div className="creator-dashboard-tabs" role="tablist" aria-label="Creator dashboard sections">
          {[
            ["work", "My Work"],
            ["applications", "My Applications"],
            ["inquiries", "Inquiries"],
          ].map(([tab, label]) => (
            <button
              className={`creator-dashboard-tab${activeDashboardTab === tab ? " is-active" : ""}`}
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeDashboardTab === tab}
              onClick={() => setActiveDashboardTab(tab)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {activeDashboardTab === "work" && (
      <section className="dashboard-work-section">
        <div className="post-section-heading">
          <div>
            <span className="eyebrow">Show what you create</span>
            <h2>My work</h2>
          </div>
          {creator && !isPostFormOpen && (
            <button
              className="button-primary"
              type="button"
              onClick={() => {
                setEditingPost(null);
                setPostActionError("");
                setPostFormError("");
                setPostSuccess("");
                setIsPostFormOpen(true);
              }}
            >
              <Plus size={16} /> Add New Post
            </button>
          )}
        </div>
        {postActionError && (
          <div className="form-alert" role="alert">
            {postActionError}
          </div>
        )}
        {postSuccess && (
          <div className="form-alert success" role="status">
            {postSuccess}
          </div>
        )}
        {!creator && !isLoadingProfile ? (
          <div className="post-empty-state">
            <h3>Create a creator profile first</h3>
            <p>Your portfolio posts are connected to your creator profile.</p>
          </div>
        ) : (
          <>
            {isPostFormOpen && creator && (
              <div className="post-form-panel">
                <h3>{editingPost ? "Edit portfolio post" : "Add portfolio post"}</h3>
                <PostForm
                  key={editingPost?._id || "new-post"}
                  initialValues={editingPostValues}
                  onSubmit={savePost}
                  onCancel={() => {
                    setEditingPost(null);
                    setIsPostFormOpen(false);
                    setPostFormError("");
                  }}
                  error={postFormError}
                  isSubmitting={isSavingPost}
                  submitLabel={editingPost ? "Save changes" : "Add post"}
                />
              </div>
            )}
            {isLoadingPosts ? (
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
              !isPostFormOpen && (
                <div className="post-empty-state">
                  <h3>Your portfolio is ready for its first post</h3>
                  <p>Add an image, video, or link to a project you’ve worked on.</p>
                </div>
              )
            ) : (
              <div className="post-grid">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    showActions
                    isDeleting={deletingPostId === post._id}
                    onEdit={(selectedPost) => {
                      setEditingPost(selectedPost);
                      setPostActionError("");
                      setPostFormError("");
                      setPostSuccess("");
                      setIsPostFormOpen(true);
                    }}
                    onDelete={deletePost}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>
      )}
      {creator && activeDashboardTab === "inquiries" && (
        <m.section
          className="dashboard-inquiries-section"
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
        >
        <div className="post-section-heading">
          <div>
            <span className="eyebrow">Collaboration requests</span>
            <h2>Inquiries</h2>
          </div>
          {!isLoadingInquiries && !inquiriesError && (
            <span className="admin-record-count">
              {inquiries.length} received
            </span>
          )}
        </div>
        {inquiryFeedback && (
          <div className="form-alert success" role="status">
            {inquiryFeedback}
          </div>
        )}
        {inquiriesError && (
          <div className="form-alert" role="alert">
            {inquiriesError}
            <button
              className="inline-retry"
              type="button"
              onClick={() => {
                setIsLoadingInquiries(true);
                setInquiriesError("");
                setInquiriesRetryKey((key) => key + 1);
              }}
            >
              Retry
            </button>
          </div>
        )}
        {isLoadingInquiries ? (
          <p className="admin-loading" role="status">
            Loading your inquiries…
          </p>
        ) : !inquiriesError && inquiries.length === 0 ? (
          <div className="post-empty-state">
            <h3>No inquiries yet</h3>
            <p>Collaboration messages from customers will appear here.</p>
          </div>
        ) : !inquiriesError ? (
          <AnimatePresence mode="popLayout">
          <m.div className="creator-inquiry-list" layout>
            {inquiries.map((inquiry) => (
              <m.article
                className="creator-inquiry-card"
                key={inquiry._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
              >
                <div className="creator-inquiry-heading">
                  <div>
                    <h3>{inquiry.subject || "Collaboration inquiry"}</h3>
                    <p>
                      From {inquiry.name} ·{" "}
                      <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                    </p>
                  </div>
                  <span className={`inquiry-status is-${inquiry.status || "pending"}`}>
                    {(inquiry.status || "pending").replace(/^./, (letter) =>
                      letter.toUpperCase(),
                    )}
                  </span>
                </div>
                <InquiryThread
                  inquiry={inquiry}
                  currentUserId={user?.id}
                  onInquiryChange={(updatedInquiry) =>
                    setInquiries((current) =>
                      current.map((item) =>
                        item._id === inquiry._id ? updatedInquiry : item,
                      ),
                    )
                  }
                />
                <div className="creator-inquiry-footer">
                  <time dateTime={inquiry.createdAt}>
                    {new Date(inquiry.createdAt).toLocaleString()}
                  </time>
                  <div className="inquiry-status-actions">
                    {["pending", "accepted", "declined"].map((status) => (
                      <button
                        key={status}
                        className="button-outline"
                        type="button"
                        disabled={
                          updatingInquiryId === inquiry._id ||
                          (inquiry.status || "pending") === status
                        }
                        onClick={() => updateInquiryStatus(inquiry, status)}
                      >
                        {status.replace(/^./, (letter) => letter.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
              </m.article>
            ))}
          </m.div>
          </AnimatePresence>
        ) : null}
        </m.section>
      )}
      {creator && activeDashboardTab === "applications" && (
        <section className="dashboard-applications-section">
          <div className="post-section-heading">
            <div>
              <span className="eyebrow">Campaign responses</span>
              <h2>My Applications</h2>
            </div>
            {!isLoadingApplications && !applicationsError && (
              <span className="admin-record-count">
                {applications.length} applications
              </span>
            )}
          </div>
          {isLoadingApplications ? (
            <p className="admin-loading" role="status">
              Loading your applications…
            </p>
          ) : applicationsError ? (
            <div className="form-alert" role="alert">
              {applicationsError}
              <button
                className="inline-retry"
                type="button"
                onClick={() => {
                  setIsLoadingApplications(true);
                  setApplicationsError("");
                  setApplicationsRetryKey((key) => key + 1);
                }}
              >
                Retry
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="post-empty-state">
              <h3>No campaign applications yet</h3>
              <p>Proposals you submit to campaigns will appear here.</p>
              <Link className="button-primary" to="/campaigns">
                Find Campaigns
              </Link>
            </div>
          ) : (
            <div className="application-grid">
              {applications.map((application) => (
                <article className="application-card" key={application._id}>
                  <div className="application-card-heading">
                    <div>
                      <span className="eyebrow">
                        {application.brandName || application.brand?.name || "Brand"}
                      </span>
                      <h3>{application.campaignTitle || application.campaign?.title || "Campaign proposal"}</h3>
                    </div>
                    <span
                      className={`inquiry-status is-${application.status || "pending"}`}
                    >
                      {(application.status || "pending").replace(/^./, (letter) =>
                        letter.toUpperCase(),
                      )}
                    </span>
                  </div>
                  <h4>{application.subjectLine}</h4>
                  <p className="application-proposal-body">
                    {application.proposalBody}
                  </p>
                  {application.keyHighlights?.length > 0 && (
                    <div className="proposal-draft-highlights">
                      <strong>Key highlights</strong>
                      <ul>
                        {application.keyHighlights.map((highlight, index) => (
                          <li key={`${application._id}-${index}`}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <time dateTime={application.createdAt}>
                    Submitted {new Date(application.createdAt).toLocaleDateString()}
                  </time>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
      {isPitchModalOpen && creator && (
        <AIPitchGeneratorModal
          creator={creator}
          onClose={() => setIsPitchModalOpen(false)}
          onUseProposal={useProposalDraft}
        />
      )}
      <div className="dashboard-actions">
        <button className="button-dark" type="button" onClick={handleLogout}>
          <LogOut size={16} /> Log out <ArrowUpRight size={15} />
        </button>
      </div>
    </section>
  );
}

export default Dashboard;
