import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import InquiryThread from "../components/InquiryThread.jsx";
import api from "../services/api.js";
import { useAuth } from "../context/useAuth.js";

function MyInquiries() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    api
      .get("/inquiries/mine")
      .then((response) => {
        if (!Array.isArray(response.data.inquiries)) {
          throw new Error("Inquiry response did not include an inquiry list");
        }
        if (active) {
          setInquiries(response.data.inquiries);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Unable to load your inquiries.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryKey]);

  return (
    <section className="discovery-page customer-inquiries-page">
      <div className="profile-page-heading">
        <span className="eyebrow">Your collaborations</span>
        <h1 className="dashboard-title">My Inquiries</h1>
        <p>Keep in touch with creators about your collaboration requests.</p>
      </div>
      {isLoading && (
        <p className="admin-loading" role="status">
          Loading your conversations…
        </p>
      )}
      {error && (
        <div className="form-alert" role="alert">
          {error}
          <button
            className="inline-retry"
            type="button"
            onClick={() => {
              setIsLoading(true);
              setError("");
              setRetryKey((key) => key + 1);
            }}
          >
            Retry
          </button>
        </div>
      )}
      {!isLoading && !error && inquiries.length === 0 && (
        <div className="discovery-empty">
          <h2>No inquiries yet</h2>
          <p>
            When you contact a creator, your message and replies will appear
            here.
          </p>
          <Link className="button-primary" to="/creators">
            Discover creators
          </Link>
        </div>
      )}
      {!isLoading && !error && inquiries.length > 0 && (
        <div className="customer-inquiry-list">
          {inquiries.map((inquiry) => (
            <article className="customer-inquiry-card" key={inquiry._id}>
              <header className="customer-inquiry-heading">
                <div>
                  <span className="eyebrow">Collaboration inquiry</span>
                  <h2>{inquiry.subject}</h2>
                  <p>
                    To{" "}
                    {inquiry.creator?._id ? (
                      <Link to={`/creators/${inquiry.creator._id}`}>
                        {inquiry.creator.name}
                      </Link>
                    ) : (
                      inquiry.creator?.name || "Creator"
                    )}
                    {inquiry.creator?.category
                      ? ` · ${inquiry.creator.category}`
                      : ""}
                  </p>
                </div>
                <span
                  className={`inquiry-status is-${inquiry.status || "pending"}`}
                >
                  {(inquiry.status || "pending").replace(/^./, (letter) =>
                    letter.toUpperCase(),
                  )}
                </span>
              </header>
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
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyInquiries;
