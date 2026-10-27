import { useCallback, useEffect, useState } from "react";
import { Check, LoaderCircle, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api.js";

const emptyForm = {
  title: "",
  campaignGoal: "",
  deliverables: "",
  budget: "",
  nicheCategory: "",
};

const campaignToForm = (campaign) => ({
  title: campaign.title || "",
  campaignGoal: campaign.campaignGoal || "",
  deliverables: (campaign.deliverables || []).join("\n"),
  budget: campaign.budget || "",
  nicheCategory: campaign.nicheCategory || "",
});

const toRequestBody = (form) => ({
  title: form.title.trim(),
  campaignGoal: form.campaignGoal.trim(),
  deliverables: form.deliverables
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean),
  budget: form.budget.trim(),
  nicheCategory: form.nicheCategory.trim(),
});

function BrandCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [applicantsByCampaign, setApplicantsByCampaign] = useState({});
  const [applicantsLoadingId, setApplicantsLoadingId] = useState("");
  const [applicantsError, setApplicantsError] = useState({});
  const [updatingProposalId, setUpdatingProposalId] = useState("");

  const loadCampaigns = useCallback(async () => {
    const response = await api.get("/campaigns/my-campaigns");
    if (!Array.isArray(response.data.campaigns)) {
      throw new Error("Campaign response did not include a campaign list");
    }
    setCampaigns(response.data.campaigns);
    setError("");
  }, []);

  useEffect(() => {
    let active = true;
    api
      .get("/campaigns/my-campaigns")
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
              "Unable to load your campaigns.",
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

  const openCreateForm = () => {
    setEditingCampaign(null);
    setForm(emptyForm);
    setFormError("");
    setIsFormOpen(true);
  };

  const openEditForm = (campaign) => {
    setEditingCampaign(campaign);
    setForm(campaignToForm(campaign));
    setFormError("");
    setIsFormOpen(true);
  };

  const saveCampaign = async (event) => {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setFormError("");

    try {
      const body = toRequestBody(form);
      if (editingCampaign) {
        body.status = editingCampaign.status;
        await api.put(`/campaigns/${editingCampaign._id}`, body);
        toast.success("Campaign updated.");
      } else {
        await api.post("/campaigns", body);
        toast.success("Campaign created.");
      }
      await loadCampaigns();
      setIsFormOpen(false);
      setEditingCampaign(null);
      setForm(emptyForm);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.message ||
        "Unable to save this campaign.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCampaign = async (campaign) => {
    if (
      !window.confirm(
        `Delete "${campaign.title}"? This removes the campaign from discovery.`,
      )
    ) {
      return;
    }
    setDeletingId(campaign._id);
    try {
      await api.delete(`/campaigns/${campaign._id}`);
      setCampaigns((current) =>
        current.filter((item) => item._id !== campaign._id),
      );
      setApplicantsByCampaign((current) => {
        const next = { ...current };
        delete next[campaign._id];
        return next;
      });
      toast.success("Campaign deleted.");
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Unable to delete this campaign.",
      );
    } finally {
      setDeletingId("");
    }
  };

  const toggleApplicants = async (campaign) => {
    if (Object.prototype.hasOwnProperty.call(applicantsByCampaign, campaign._id)) {
      setApplicantsByCampaign((current) => {
        const next = { ...current };
        delete next[campaign._id];
        return next;
      });
      return;
    }

    setApplicantsLoadingId(campaign._id);
    setApplicantsError((current) => ({ ...current, [campaign._id]: "" }));
    try {
      const response = await api.get(`/campaigns/${campaign._id}/applicants`);
      if (!Array.isArray(response.data.proposals)) {
        throw new Error("Applicant response did not include a proposal list");
      }
      setApplicantsByCampaign((current) => ({
        ...current,
        [campaign._id]: response.data.proposals,
      }));
    } catch (requestError) {
      setApplicantsError((current) => ({
        ...current,
        [campaign._id]:
          requestError.response?.data?.message ||
          requestError.message ||
          "Unable to load applicants.",
      }));
    } finally {
      setApplicantsLoadingId("");
    }
  };

  const updateProposalStatus = async (campaignId, proposal, status) => {
    setUpdatingProposalId(proposal._id);
    try {
      await api.patch(`/proposals/${proposal._id}/status`, {
        status,
      });
      setApplicantsByCampaign((current) => ({
        ...current,
        [campaignId]: current[campaignId].map((item) =>
          item._id === proposal._id ? { ...item, status } : item,
        ),
      }));
      toast.success(`Application ${status}.`);
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Unable to update application status.",
      );
    } finally {
      setUpdatingProposalId("");
    }
  };

  return (
    <section className="discovery-page brand-campaigns-page">
      <header className="profile-page-heading">
        <span className="eyebrow">Brand workspace</span>
        <h1 className="dashboard-title">My Campaigns</h1>
        <p>Create opportunities, review creator proposals, and manage your campaigns.</p>
        <button className="button-primary" type="button" onClick={openCreateForm}>
          <Plus size={16} /> Create Campaign
        </button>
      </header>

      {isLoading && (
        <p className="admin-loading" role="status">
          Loading your campaigns…
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
      {!isLoading && !error && campaigns.length === 0 && (
        <div className="discovery-empty">
          <h2>You haven’t posted a campaign yet</h2>
          <p>Create a campaign to invite creators to submit proposals.</p>
          <button className="button-primary" type="button" onClick={openCreateForm}>
            <Plus size={16} /> Create your first campaign
          </button>
        </div>
      )}
      {!isLoading && !error && campaigns.length > 0 && (
        <div className="brand-campaign-grid">
          {campaigns.map((campaign) => {
            const applicants = applicantsByCampaign[campaign._id];
            return (
              <article className="campaign-card brand-campaign-card" key={campaign._id}>
                <div className="campaign-card-heading">
                  <div>
                    <span className="eyebrow">
                      {campaign.nicheCategory || "General"}
                    </span>
                    <h2>{campaign.title}</h2>
                  </div>
                  <span
                    className={`campaign-status${campaign.status === "closed" ? " is-closed" : ""}`}
                  >
                    {campaign.status === "closed" ? "Closed" : "Active"}
                  </span>
                </div>
                <p className="campaign-goal">{campaign.campaignGoal}</p>
                <div className="campaign-card-details">
                  <div>
                    <strong>Deliverables</strong>
                    <ul>
                      {(campaign.deliverables || []).map((deliverable, index) => (
                        <li key={`${campaign._id}-${index}`}>{deliverable}</li>
                      ))}
                    </ul>
                  </div>
                  <p>
                    <strong>Budget</strong>
                    <span>{campaign.budget}</span>
                  </p>
                </div>
                <div className="brand-campaign-actions">
                  <button
                    className="button-outline"
                    type="button"
                    onClick={() => toggleApplicants(campaign)}
                    disabled={applicantsLoadingId === campaign._id}
                  >
                    {applicantsLoadingId === campaign._id ? (
                      <LoaderCircle className="spin-animation" size={15} />
                    ) : (
                      <Users size={15} />
                    )}
                    {applicants
                      ? `Hide Applicants (${applicants.length})`
                      : "Applicants"}
                  </button>
                  <button
                    className="button-outline"
                    type="button"
                    onClick={() => openEditForm(campaign)}
                    aria-label={`Edit ${campaign.title}`}
                  >
                    <Pencil size={15} /> Edit
                  </button>
                  <button
                    className="button-outline campaign-delete-button"
                    type="button"
                    onClick={() => deleteCampaign(campaign)}
                    disabled={deletingId === campaign._id}
                    aria-label={`Delete ${campaign.title}`}
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
                {applicantsError[campaign._id] && (
                  <div className="form-alert" role="alert">
                    {applicantsError[campaign._id]}
                    <button
                      className="inline-retry"
                      type="button"
                      onClick={() => {
                        setApplicantsByCampaign((current) => {
                          const next = { ...current };
                          delete next[campaign._id];
                          return next;
                        });
                        toggleApplicants(campaign);
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}
                {applicants && (
                  <section className="campaign-applicants" aria-label="Campaign applicants">
                    <h3>Creator proposals ({applicants.length})</h3>
                    {applicants.length === 0 ? (
                      <p className="campaign-applicants-empty">
                        No proposals have been submitted for this campaign yet.
                      </p>
                    ) : (
                      <div className="campaign-applicant-list">
                        {applicants.map((proposal) => (
                          <article className="campaign-applicant-card" key={proposal._id}>
                            <header className="campaign-applicant-heading">
                              <div>
                                <h4>{proposal.creator?.name || "Creator"}</h4>
                                <span>
                                  {proposal.creator?.category || "Creator"}
                                  {proposal.createdAt
                                    ? ` · ${new Date(proposal.createdAt).toLocaleDateString()}`
                                    : ""}
                                </span>
                              </div>
                              <span className={`inquiry-status is-${proposal.status || "pending"}`}>
                                {proposal.status || "pending"}
                              </span>
                            </header>
                            <h5>{proposal.subjectLine}</h5>
                            <p className="application-proposal-body">
                              {proposal.proposalBody}
                            </p>
                            {proposal.keyHighlights?.length > 0 && (
                              <ul className="campaign-applicant-highlights">
                                {proposal.keyHighlights.map((highlight, index) => (
                                  <li key={`${proposal._id}-${index}`}>{highlight}</li>
                                ))}
                              </ul>
                            )}
                            <div className="campaign-applicant-actions">
                              {["accepted", "declined"].map((status) => (
                                <button
                                  className={status === "accepted" ? "button-primary" : "button-outline"}
                                  type="button"
                                  key={status}
                                  disabled={
                                    updatingProposalId === proposal._id ||
                                    proposal.status === status
                                  }
                                  onClick={() =>
                                    updateProposalStatus(campaign._id, proposal, status)
                                  }
                                >
                                  {status === "accepted" && <Check size={15} />}
                                  {status[0].toUpperCase() + status.slice(1)}
                                </button>
                              ))}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </article>
            );
          })}
        </div>
      )}

      {isFormOpen && (
        <div
          className="ai-pitch-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) {
              setIsFormOpen(false);
            }
          }}
        >
          <section
            className="ai-pitch-modal brand-campaign-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="campaign-form-title"
          >
            <header className="ai-pitch-modal-header">
              <div>
                <span className="eyebrow">Campaign details</span>
                <h2 id="campaign-form-title">
                  {editingCampaign ? "Edit Campaign" : "Create Campaign"}
                </h2>
              </div>
              <button
                className="ai-pitch-close"
                type="button"
                aria-label="Close campaign form"
                onClick={() => setIsFormOpen(false)}
                disabled={isSaving}
              >
                <X size={19} />
              </button>
            </header>
            <form className="ai-pitch-form" onSubmit={saveCampaign}>
              <label className="form-field">
                Campaign title
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  maxLength={160}
                  required
                />
              </label>
              <label className="form-field">
                Description / campaign goal
                <textarea
                  rows={4}
                  value={form.campaignGoal}
                  onChange={(event) =>
                    setForm({ ...form, campaignGoal: event.target.value })
                  }
                  maxLength={2000}
                  required
                />
              </label>
              <label className="form-field">
                Niche category
                <input
                  value={form.nicheCategory}
                  onChange={(event) =>
                    setForm({ ...form, nicheCategory: event.target.value })
                  }
                  maxLength={120}
                  placeholder="For example: Beauty, Travel, Food"
                  required
                />
              </label>
              <label className="form-field">
                Deliverables (one per line)
                <textarea
                  rows={3}
                  value={form.deliverables}
                  onChange={(event) =>
                    setForm({ ...form, deliverables: event.target.value })
                  }
                  maxLength={2000}
                  placeholder={"One short video\nTwo story posts"}
                  required
                />
              </label>
              <label className="form-field">
                Budget
                <input
                  value={form.budget}
                  onChange={(event) => setForm({ ...form, budget: event.target.value })}
                  maxLength={120}
                  placeholder="For example: $500–$800"
                  required
                />
              </label>
              {editingCampaign && (
                <label className="form-field">
                  Campaign status
                  <select
                    value={editingCampaign.status}
                    onChange={(event) =>
                      setEditingCampaign({
                        ...editingCampaign,
                        status: event.target.value,
                      })
                    }
                  >
                    <option value="active">Active — accepting applications</option>
                    <option value="closed">Closed — stop applications</option>
                  </select>
                </label>
              )}
              {formError && (
                <div className="form-alert" role="alert">
                  {formError}
                </div>
              )}
              <button className="button-primary" type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <LoaderCircle className="spin-animation" size={16} />
                    Saving campaign…
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {editingCampaign ? "Save Changes" : "Publish Campaign"}
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

export default BrandCampaigns;
