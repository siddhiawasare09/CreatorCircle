import { useEffect, useState } from "react";
import { ArrowUpRight, RefreshCw, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalCreators: 0 });
  const [users, setUsers] = useState([]);
  const [creators, setCreators] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadAdminData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [statsResponse, usersResponse, creatorsResponse, inquiriesResponse] =
          await Promise.all([
            api.get("/admin/stats"),
            api.get("/admin/users"),
            api.get("/admin/creators"),
            api.get("/admin/inquiries"),
          ]);

        if (!active) return;
        setStats(statsResponse.data.stats);
        setUsers(usersResponse.data.users || []);
        setCreators(creatorsResponse.data.creators || []);
        setInquiries(inquiriesResponse.data.inquiries || []);
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load admin data. Please refresh and try again.",
          );
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
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete this creator profile.",
      );
    } finally {
      setIsDeletingId("");
    }
  };

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
      {isLoading ? (
        <p className="admin-loading" role="status">
          Loading admin dashboard…
        </p>
      ) : (
        <>
          <div className="admin-stat-grid">
            <article className="admin-stat">
              <span>Total Users</span>
              <strong>{stats.totalUsers}</strong>
            </article>
            <article className="admin-stat admin-stat-accent">
              <span>Total Creators</span>
              <strong>{stats.totalCreators}</strong>
            </article>
          </div>

          <section className="admin-section">
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
          </section>

          <section className="admin-section">
            <div className="admin-section-heading">
              <div>
                <span className="eyebrow">Accounts</span>
                <h2>User Management</h2>
              </div>
              <span className="admin-record-count">{users.length} users</span>
            </div>
            {users.length === 0 ? (
              <p className="admin-empty">No users found.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table admin-user-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((listedUser) => (
                      <tr key={listedUser._id}>
                        <td>
                          <strong>{listedUser.name}</strong>
                        </td>
                        <td>{listedUser.email}</td>
                        <td>
                          <span
                            className={`admin-role ${listedUser.role === "admin" ? "is-admin" : ""}`}
                          >
                            {listedUser.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin-section">
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
                    <tr><th>Customer</th><th>Creator</th><th>Message</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {inquiries.map((inquiry) => (
                      <tr key={inquiry._id}>
                        <td><strong>{inquiry.name}</strong><br /><span>{inquiry.email}</span></td>
                        <td>{inquiry.creator?.name || "Creator removed"}</td>
                        <td className="admin-inquiry-message">{inquiry.message}</td>
                        <td>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}

export default AdminDashboard;
