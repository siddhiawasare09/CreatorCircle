import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import {
  ArrowUpRight,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import { toast } from "sonner";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCreators: 0,
    totalBrands: 0,
    totalCampaigns: 0,
    totalInquiries: 0,
    pendingInquiries: 0,
    acceptedInquiries: 0,
    declinedInquiries: 0,
  });
  const [users, setUsers] = useState([]);
  const [creators, setCreators] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState("");
  const [isDeletingPostId, setIsDeletingPostId] = useState("");
  const [isDeletingInquiryId, setIsDeletingInquiryId] = useState("");
  const [activeTab, setActiveTab] = useState("creators");
  const [refreshKey, setRefreshKey] = useState(0);
  const [accessDenied, setAccessDenied] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState("");

  useEffect(() => {
    let active = true;

    const loadAdminData = async () => {
      setIsLoading(true);
      setError("");
      setAccessDenied(false);

      try {
        const [
          statsResponse,
          usersResponse,
          creatorsResponse,
          inquiriesResponse,
          postsResponse,
        ] =
          await Promise.all([
            api.get("/admin/stats"),
            api.get("/admin/users"),
            api.get("/admin/creators"),
            api.get("/admin/inquiries"),
            api.get("/admin/posts"),
          ]);

        if (!active) return;
        setStats(statsResponse.data.stats);
        setUsers(usersResponse.data.users || []);
        setCreators(creatorsResponse.data.creators || []);
        setInquiries(inquiriesResponse.data.inquiries || []);
        setPosts(postsResponse.data.posts || []);
      } catch (requestError) {
        if (active) {
          if (requestError.response?.status === 403) {
            setAccessDenied(true);
            setError(
              "You do not have permission to access the admin dashboard.",
            );
          } else if (requestError.response?.status === 401) {
            setError("Your session is invalid. Please log in again.");
          } else {
            setError(
              requestError.response?.data?.message ||
                "Unable to load admin data. Please refresh and try again.",
            );
          }
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadAdminData();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const deleteCreator = async (creator) => {
    const confirmed = window.confirm(
      `Delete the creator profile for ${creator.name}? This cannot be undone.`,
    );

    if (!confirmed) return;

    setIsDeletingId(creator._id);
    setError("");

    try {
      await api.delete(`/admin/creators/${creator._id}`);
      setRefreshKey((current) => current + 1);
      toast.success("Creator profile deleted.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete this creator profile.",
      );
      toast.error(
        requestError.response?.data?.message ||
          "Unable to delete this creator profile.",
      );
    } finally {
      setIsDeletingId("");
    }
  };

  const deletePost = async (post) => {
    const confirmed = window.confirm(
      `Delete "${post.title}" from the portfolio? This cannot be undone.`,
    );

    if (!confirmed) return;

    setIsDeletingPostId(post._id);
    setError("");
    try {
      await api.delete(`/admin/posts/${post._id}`);
      setPosts((current) => current.filter((item) => item._id !== post._id));
      toast.success("Portfolio post deleted.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete this portfolio post.",
      );
      toast.error(
        requestError.response?.data?.message ||
          "Unable to delete this portfolio post.",
      );
    } finally {
      setIsDeletingPostId("");
    }
  };

  const deleteInquiry = async (inquiry) => {
    const confirmed = window.confirm(
      "Delete this inquiry? This action cannot be undone.",
    );

    if (!confirmed) return;

    setIsDeletingInquiryId(inquiry._id);
    setError("");
    try {
      await api.delete(`/admin/inquiries/${inquiry._id}`);
      setInquiries((current) =>
        current.filter((item) => item._id !== inquiry._id),
      );
      setStats((current) => ({
        ...current,
        totalInquiries: Math.max(0, current.totalInquiries - 1),
        [`${inquiry.status || "pending"}Inquiries`]: Math.max(
          0,
          current[`${inquiry.status || "pending"}Inquiries`] - 1,
        ),
      }));
      toast.success("Inquiry deleted.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete this inquiry.",
      );
      toast.error(
        requestError.response?.data?.message ||
          "Unable to delete this inquiry.",
      );
    } finally {
      setIsDeletingInquiryId("");
    }
  };

  const toggleUserSuspension = async (listedUser) => {
    const isSuspending = !listedUser.isSuspended;
    const confirmed = window.confirm(
      `${isSuspending ? "Suspend" : "Reactivate"} ${listedUser.name} (${listedUser.email})?`,
    );
    if (!confirmed) return;

    setUpdatingUserId(listedUser._id);
    try {
      const response = await api.put(
        `/admin/users/${listedUser._id}/status`,
        { isSuspended: isSuspending },
      );
      setUsers((current) =>
        current.map((item) =>
          item._id === listedUser._id
            ? { ...item, isSuspended: response.data.user.isSuspended }
            : item,
        ),
      );
      toast.success(
        response.data.user.isSuspended ? "User suspended." : "User reactivated.",
      );
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Unable to update this user’s status.";
      setError(message);
      toast.error(message);
    } finally {
      setUpdatingUserId("");
    }
  };

  const filteredUsers = users.filter((listedUser) => {
    const query = userSearch.trim().toLowerCase();
    return (
      !query ||
      [listedUser.name, listedUser.email, listedUser.accountType, listedUser.role]
        .some((value) => value?.toLowerCase().includes(query))
    );
  });

  return (
    <section className="admin-page">
      <header className="admin-heading">
        <div>
          <span className="eyebrow">CreatorCircle administration</span>
          <h1>Admin Dashboard</h1>
          <p>Manage creator profiles and review registered users.</p>
        </div>
        <button
          className="admin-refresh-button"
          type="button"
          onClick={() => setRefreshKey((current) => current + 1)}
          disabled={isLoading}
          aria-label="Refresh admin data"
          title="Refresh"
        >
          <RefreshCw size={17} />
        </button>
      </header>

      {error && (
        <div className="form-alert" role="alert">
          {error}
        </div>
      )}
      {accessDenied ? (
        <div className="post-empty-state">
          <h2>Admin access required</h2>
          <p>Your account does not have permission to view this dashboard.</p>
          <Link className="button-outline" to="/">
            Return home
          </Link>
        </div>
      ) : isLoading ? (
        <p className="admin-loading" role="status">
          Loading admin dashboard…
        </p>
      ) : (
        <>
          <div className="admin-stat-grid">
            {[
              ["Total Users", stats.totalUsers],
              ["Total Creators", stats.totalCreators],
              ["Total Brands", stats.totalBrands],
              ["Posted Campaigns", stats.totalCampaigns],
              ["Total Inquiries", stats.totalInquiries],
              ["Pending Inquiries", stats.pendingInquiries],
              ["Accepted Inquiries", stats.acceptedInquiries],
              ["Declined Inquiries", stats.declinedInquiries],
            ].map(([label, count], index) => (
              <article
                className={`admin-stat${index === 0 || index === 3 ? " admin-stat-accent" : ""}`}
                key={label}
              >
                <span>{label}</span>
                <strong>{count}</strong>
              </article>
            ))}
          </div>

          <div className="admin-tabs" role="tablist" aria-label="Admin sections">
            {[
              ["creators", "Creators"],
              ["users", "Users"],
              ["inquiries", "Inquiries"],
              ["posts", "Posts"],
            ].map(([tab, label]) => (
              <m.button
                className={`admin-tab${activeTab === tab ? " is-active" : ""}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                key={tab}
                layout
                onClick={() => setActiveTab(tab)}
              >
                {label}
              </m.button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={activeTab}
            className="admin-tab-panel"
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
          {activeTab === "creators" && <section className="admin-section">
            <div className="admin-section-heading">
              <div>
                <span className="eyebrow">Creator directory</span>
                <h2>Creator Management</h2>
              </div>
              <span className="admin-record-count">
                {creators.length} profiles
              </span>
            </div>
            {creators.length === 0 ? (
              <p className="admin-empty">No creator profiles yet.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Creator</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creators.map((creator) => {
                      const initials =
                        creator.name?.trim().charAt(0).toUpperCase() || "C";
                      return (
                        <tr key={creator._id}>
                          <td>
                            <div className="admin-creator-cell">
                              {creator.profileImage ? (
                                <img src={creator.profileImage} alt="" />
                              ) : (
                                <span
                                  className="admin-avatar-fallback"
                                  aria-hidden="true"
                                >
                                  {initials}
                                </span>
                              )}
                              <strong>{creator.name}</strong>
                            </div>
                          </td>
                          <td>{creator.category}</td>
                          <td>{creator.location || "—"}</td>
                          <td>
                            <div className="admin-row-actions">
                              <Link
                                className="admin-view-link"
                                to={`/creators/${creator._id}`}
                              >
                                View <ArrowUpRight size={14} />
                              </Link>
                              <button
                                className="admin-delete-button"
                                type="button"
                                onClick={() => deleteCreator(creator)}
                                disabled={isDeletingId === creator._id}
                              >
                                <Trash2 size={14} />{" "}
                                {isDeletingId === creator._id
                                  ? "Deleting"
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>}

          {activeTab === "users" && <section className="admin-section">
            <div className="admin-section-heading">
              <div>
                <span className="eyebrow">Accounts</span>
                <h2>User Management</h2>
              </div>
              <span className="admin-record-count">{users.length} users</span>
            </div>
            <label className="admin-user-search">
              <Search size={16} aria-hidden="true" />
              <span className="visually-hidden">Search users</span>
              <input
                type="search"
                placeholder="Search by name, email, or account type"
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
              />
            </label>
            {users.length === 0 ? (
              <p className="admin-empty">No users found.</p>
            ) : filteredUsers.length === 0 ? (
              <p className="admin-empty">No users match your search.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table admin-user-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Account Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((listedUser) => (
                      <tr key={listedUser._id}>
                        <td>
                          <strong>{listedUser.name}</strong>
                        </td>
                        <td>{listedUser.email}</td>
                        <td>
                          <span
                            className={`admin-role ${listedUser.role === "admin" ? "is-admin" : ""}`}
                          >
                            {listedUser.accountType === "creator"
                              ? "Creator"
                              : listedUser.accountType === "admin"
                                ? "Admin"
                                : "Brand / Client"}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-user-status${listedUser.isSuspended ? " is-suspended" : ""}`}>
                            {listedUser.isSuspended ? "Suspended" : "Active"}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`admin-suspend-button${listedUser.isSuspended ? " is-reactivate" : ""}`}
                            type="button"
                            onClick={() => toggleUserSuspension(listedUser)}
                            disabled={
                              updatingUserId === listedUser._id ||
                              listedUser.role === "admin"
                            }
                            title={
                              listedUser.role === "admin"
                                ? "Admin accounts cannot be suspended here"
                                : undefined
                            }
                          >
                            {listedUser.isSuspended ? (
                              <><ShieldCheck size={14} /> Reactivate</>
                            ) : (
                              <><ShieldOff size={14} /> Suspend</>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>}

          {activeTab === "inquiries" && <section className="admin-section">
            <div className="admin-section-heading">
              <div>
                <span className="eyebrow">Customer messages</span>
                <h2>Inquiries</h2>
              </div>
              <span className="admin-record-count">{inquiries.length} inquiries</span>
            </div>
            {inquiries.length === 0 ? (
              <p className="admin-empty">No inquiries received yet.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table admin-inquiry-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Creator</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((inquiry) => (
                      <tr key={inquiry._id}>
                        <td>
                          <strong>{inquiry.name}</strong>
                          <br />
                          <span>{inquiry.email}</span>
                        </td>
                        <td>{inquiry.creator?.name || "Creator removed"}</td>
                        <td>{inquiry.subject || "Collaboration inquiry"}</td>
                        <td className="admin-inquiry-message">{inquiry.message}</td>
                        <td>
                          <span className={`inquiry-status is-${inquiry.status || "pending"}`}>
                            {(inquiry.status || "pending").replace(/^./, (letter) =>
                              letter.toUpperCase(),
                            )}
                          </span>
                        </td>
                        <td>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="admin-delete-button"
                            type="button"
                            onClick={() => deleteInquiry(inquiry)}
                            disabled={isDeletingInquiryId === inquiry._id}
                          >
                            <Trash2 size={14} />{" "}
                            {isDeletingInquiryId === inquiry._id
                              ? "Deleting"
                              : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>}

          {activeTab === "posts" && (
            <section className="admin-section">
              <div className="admin-section-heading">
                <div>
                  <span className="eyebrow">Creator portfolios</span>
                  <h2>Portfolio Posts</h2>
                </div>
                <span className="admin-record-count">{posts.length} posts</span>
              </div>
              {posts.length === 0 ? (
                <p className="admin-empty">No portfolio posts found.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table admin-post-table">
                    <thead>
                      <tr>
                        <th>Post</th>
                        <th>Creator</th>
                        <th>Type</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((post) => (
                        <tr key={post._id}>
                          <td>
                            <strong>{post.title}</strong>
                            {post.description && (
                              <p className="admin-post-description">
                                {post.description}
                              </p>
                            )}
                          </td>
                          <td>{post.creator?.name || "Creator removed"}</td>
                          <td>{post.mediaType}</td>
                          <td>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="admin-row-actions">
                              <a
                                className="admin-view-link"
                                href={post.mediaUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                View <ArrowUpRight size={14} />
                              </a>
                              <button
                                className="admin-delete-button"
                                type="button"
                                onClick={() => deletePost(post)}
                                disabled={isDeletingPostId === post._id}
                              >
                                <Trash2 size={14} />{" "}
                                {isDeletingPostId === post._id
                                  ? "Deleting"
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
          </m.div>
          </AnimatePresence>
        </>
      )}
    </section>
  );
}

export default AdminDashboard;
