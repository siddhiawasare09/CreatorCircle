import { useEffect, useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import AIPitchGeneratorModal from "../components/AIPitchGeneratorModal.jsx";
import { useAuth } from "../context/useAuth.js";
import api from "../services/api.js";

function Campaigns() {
  const { token, user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [creatorLookup, setCreatorLookup] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    api
      .get("/campaigns")
      .then((response) => {
        if (!Array.isArray(response.data.campaigns)) {
          throw new Error("Campaign response did not include a campaign list");
        }
        if (active) {
          setCampaigns(response.data.campaigns);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Unable to load campaigns.",
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

  useEffect(() => {
    if (!token || !user?.id || user.role === "admin") {
      return undefined;
    }

    let active = true;
    api
      .get("/creators")
      .then((response) => {
        const ownCreator = (response.data.creators || []).find((item) => {
          const ownerId = item.user?._id || item.user;
          return String(ownerId) === String(user.id);
        });
        if (active) {
          setCreatorLookup({
            userId: String(user.id),
            creator: ownCreator || null,
          });
        }
      })
      .catch((requestError) => {
        if (active) {
          toast.error(
            requestError.response?.data?.message ||
              "Unable to verify your creator profile.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [token, user?.id, user?.role]);

  const creator =
    creatorLookup?.userId === String(user?.id) ? creatorLookup.creator : null;

  return (
    <section className="discovery-page">
      <div className="profile-page-heading">
        <span className="eyebrow">Opportunities for creators</span>
        <h1 className="dashboard-title">Find Campaigns</h1>
        <p>
          Explore active brand campaigns and send a proposal tailored to the
          opportunity.
        </p>
      </div>

      {isLoading && (
        <div className="creator-skeleton-grid" role="status" aria-label="Loading campaigns">
          <div />
          <div />
          <div />
        </div>
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
      {!isLoading && !error && campaigns.length === 0 && (
        <div className="discovery-empty">
          <h2>No active campaigns yet</h2>
          <p>New brand opportunities will appear here when they are published.</p>
        </div>
      )}
      {!isLoading && !error && campaigns.length > 0 && (
        <div className="campaign-grid">
          {campaigns.map((campaign) => (
            <article className="campaign-card" key={campaign._id}>
              <div className="campaign-card-heading">
                <div>
                  <span className="eyebrow">
                    {campaign.brandName || campaign.brand?.name || "Brand"}
                  </span>
                  <h2>{campaign.title}</h2>
                </div>
                <span className="campaign-status">Active</span>
              </div>
              <p className="campaign-goal">{campaign.campaignGoal}</p>
              <div className="campaign-card-details">
                <div>
                  <strong>Deliverables</strong>
                  <ul>
                    {(campaign.deliverables || []).map((deliverable) => (
                      <li key={deliverable}>{deliverable}</li>
                    ))}
                  </ul>
                </div>
                <p>
                  <strong>Budget</strong>
                  <span>{campaign.budget}</span>
                </p>
              </div>
              {creator ? (
                <button
                  className="button-primary campaign-apply-button"
                  type="button"
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <Sparkles size={16} /> Apply with AI Pitch
                </button>
              ) : token ? (
                <Link className="button-outline campaign-apply-button" to="/dashboard">
                  Complete creator profile <ArrowUpRight size={15} />
                </Link>
              ) : (
                <Link
                  className="button-outline campaign-apply-button"
                  to="/login"
                  state={{ message: "Log in as a creator to apply to campaigns." }}
                >
                  Log in to apply <ArrowUpRight size={15} />
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
      {selectedCampaign && creator && (
        <AIPitchGeneratorModal
          creator={creator}
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </section>
  );
}

export default Campaigns;
