import { useEffect, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import CreatorCard from "../components/CreatorCard.jsx";
import { CreatorGridSkeleton } from "../components/LoadingSkeletons.jsx";
import { useShortlist } from "../context/useShortlist.js";
import api from "../services/api.js";

function Shortlist() {
  const { creatorIds, removeCreator } = useShortlist();
  const [creators, setCreators] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    api
      .get("/creators")
      .then((response) => {
        if (active) setCreators(response.data.creators || []);
      })
      .catch((requestError) => {
        if (active)
          setError(
            requestError.response?.data?.message ||
              "Something went wrong. Please try again.",
          );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryKey]);

  const shortlisted = creators.filter((creator) =>
    creatorIds.includes(creator._id),
  );

  return (
    <section className="discovery-page">
      <div className="profile-page-heading">
        <span className="eyebrow">Saved for later</span>
        <h1 className="dashboard-title">My Shortlist</h1>
        <p>Keep the creators you’re considering close at hand.</p>
      </div>
      {isLoading && (
        <CreatorGridSkeleton />
      )}
      {error && (
        <div className="form-alert" role="alert">
          {error}{" "}
          <button
            type="button"
            className="inline-retry"
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
      {feedback && (
        <div className="form-alert success" role="status">
          {feedback}
        </div>
      )}
      {!isLoading && !error && shortlisted.length === 0 && (
        <div className="discovery-empty shortlist-empty">
          <span className="shortlist-empty-icon">
            <Heart size={22} />
          </span>
          <h2>Your shortlist is ready to fill</h2>
          <p>Save creators with the heart button while browsing profiles.</p>
          <Link className="button-primary" to="/creators">
            Explore creators
          </Link>
        </div>
      )}
      {!isLoading && !error && shortlisted.length > 0 && (
        <div className="shortlist-grid">
          {shortlisted.map((creator) => (
            <div className="shortlist-item" key={creator._id}>
              <CreatorCard creator={creator} />
              <button
                className="shortlist-remove"
                type="button"
                onClick={() => {
                  removeCreator(creator._id);
                  setFeedback(`${creator.name} removed from your shortlist.`);
                  toast.success(`${creator.name} removed from your shortlist.`);
                }}
              >
                <Trash2 size={14} /> Remove from shortlist
              </button>
              <Link
                className="shortlist-inquiry-link"
                to={`/creators/${creator._id}`}
                state={{ openInquiry: true }}
              >
                Send an inquiry
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Shortlist;
