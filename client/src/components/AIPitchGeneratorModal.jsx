import { useEffect, useState } from "react";
import { LoaderCircle, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api.js";

function AIPitchGeneratorModal({
  creator,
  campaign,
  onClose,
  onUseProposal,
}) {
  const [brandName, setBrandName] = useState(campaign?.brandName || "");
  const [savedCreator, setSavedCreator] = useState(creator);
  const [profileLoadError, setProfileLoadError] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [campaignGoal, setCampaignGoal] = useState(
    campaign?.campaignGoal || "",
  );
  const [deliverables, setDeliverables] = useState(
    campaign?.deliverables?.join("\n") || "",
  );
  const [proposal, setProposal] = useState(null);
  const [highlightsText, setHighlightsText] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get("/users/profile")
      .then((response) => {
        const profile = response.data.profile;
        if (active && profile) {
          setSavedCreator({
            ...creator,
            name: profile.name,
            category: profile.niche,
            skills: profile.strengths,
          });
          setProfileLoadError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setProfileLoadError(
            requestError.response?.data?.message ||
              "Could not refresh your saved creator profile. Using the profile currently loaded.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoadingProfile(false);
      });

    return () => {
      active = false;
    };
  }, [creator]);

  const generateProposal = async (event) => {
    event?.preventDefault();
    if (isGenerating || isLoadingProfile) return;
    setError("");
    setIsGenerating(true);

    try {
      const response = await api.post("/proposals/generate-ai-pitch", {
        brandName,
        campaignGoal,
        deliverables,
        creatorName: savedCreator.name,
        creatorNiche: savedCreator.category,
        creatorStrengths: savedCreator.skills || [],
      });
      setProposal({
        subjectLine: response.data.subjectLine,
        proposalBody: response.data.proposalBody,
        keyHighlights: response.data.keyHighlights,
      });
      setHighlightsText(response.data.keyHighlights.join("\n"));
      toast.success("Your proposal draft is ready.");
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Unable to generate a proposal. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const useProposal = () => {
    if (!proposal) return;
    onUseProposal({
      ...proposal,
      keyHighlights: highlightsText
        .split("\n")
        .map((highlight) => highlight.trim())
        .filter(Boolean),
    });
  };

  const submitProposal = async () => {
    if (!proposal || !campaign?._id || isGenerating) return;
    setError("");
    setIsGenerating(true);

    try {
      await api.post("/proposals", {
        campaignId: campaign._id,
        subjectLine: proposal.subjectLine,
        proposalBody: proposal.proposalBody,
        keyHighlights: highlightsText
          .split("\n")
          .map((highlight) => highlight.trim())
          .filter(Boolean),
      });
      toast.success("Your campaign application was submitted.");
      onClose();
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Unable to submit your application. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="ai-pitch-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isGenerating) onClose();
      }}
    >
      <section
        className="ai-pitch-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-pitch-title"
      >
        <header className="ai-pitch-modal-header">
          <div>
            <span className="eyebrow">Creator proposal assistant</span>
            <h2 id="ai-pitch-title">
              <Sparkles size={20} /> Draft Pitch with AI
            </h2>
            <p>
              Share a few campaign details to create a tailored proposal for{" "}
              {savedCreator.name}.
            </p>
          </div>
          <button
            className="ai-pitch-close"
            type="button"
            aria-label="Close proposal generator"
            onClick={onClose}
            disabled={isGenerating}
          >
            <X size={19} />
          </button>
        </header>

        <form className="ai-pitch-form" onSubmit={generateProposal}>
          {isLoadingProfile && (
            <p className="admin-loading" role="status">
              Loading your saved creator profile…
            </p>
          )}
          {profileLoadError && (
            <div className="form-alert" role="status">
              {profileLoadError}
            </div>
          )}
          <label className="form-field">
            Brand name
            <input
              value={brandName}
              onChange={(event) => setBrandName(event.target.value)}
              maxLength={120}
              required
              disabled={isGenerating}
              readOnly={Boolean(campaign)}
            />
          </label>
          <label className="form-field">
            Campaign goal
            <textarea
              rows={3}
              value={campaignGoal}
              onChange={(event) => setCampaignGoal(event.target.value)}
              maxLength={2000}
              required
              disabled={isGenerating}
              readOnly={Boolean(campaign)}
              placeholder="What should this campaign achieve?"
            />
          </label>
          <label className="form-field">
            Deliverables
            <textarea
              rows={2}
              value={deliverables}
              onChange={(event) => setDeliverables(event.target.value)}
              maxLength={2000}
              required
              disabled={isGenerating}
              readOnly={Boolean(campaign)}
              placeholder="For example: one short video, two story posts"
            />
          </label>

          {error && (
            <div className="form-alert" role="alert">
              {error}
            </div>
          )}

          <button
            className="button-primary ai-pitch-generate"
            type="submit"
            disabled={isLoadingProfile || isGenerating || !brandName.trim() || !campaignGoal.trim() || !deliverables.trim()}
          >
            {isGenerating ? (
              <>
                <LoaderCircle className="spin-animation" size={16} />
                Generating your personalized pitch...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate proposal
              </>
            )}
          </button>
        </form>

        {proposal && (
          <div className="ai-pitch-preview">
            <label className="form-field">
              Subject line
              <input
                value={proposal.subjectLine}
                onChange={(event) =>
                  setProposal({ ...proposal, subjectLine: event.target.value })
                }
                maxLength={200}
              />
            </label>
            <label className="form-field">
              Proposal body
              <textarea
                rows={9}
                value={proposal.proposalBody}
                onChange={(event) =>
                  setProposal({ ...proposal, proposalBody: event.target.value })
                }
              />
            </label>
            <label className="form-field">
              Key highlights (one per line)
              <textarea
                rows={3}
                value={highlightsText}
                onChange={(event) => setHighlightsText(event.target.value)}
              />
            </label>
            <div className="ai-pitch-actions">
              <button
                className="button-outline"
                type="button"
                onClick={generateProposal}
                disabled={isGenerating}
              >
                Regenerate
              </button>
              <button
                className="button-primary"
                type="button"
                onClick={campaign ? submitProposal : useProposal}
                disabled={!proposal.subjectLine.trim() || !proposal.proposalBody.trim()}
              >
                {campaign ? "Submit Application" : "Use This Proposal"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default AIPitchGeneratorModal;
