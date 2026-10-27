import { useEffect, useState } from "react";
import { Check, LoaderCircle, LockKeyhole, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "../context/useAuth.js";
import api from "../services/api.js";

const emptyProfile = {
  name: "",
  niche: "",
  strengths: "",
  bio: "",
  instagram: "",
  rateCard: "",
};

function ProfileSettingsPage({ initialTab = "profile" }) {
  const { updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [creatorProfileExists, setCreatorProfileExists] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({ defaultValues: emptyProfile });
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  useEffect(() => {
    let active = true;
    api
      .get("/users/profile")
      .then((response) => {
        if (!active) return;
        const profile = response.data.profile;
        setCreatorProfileExists(Boolean(response.data.creatorProfileExists));
        resetProfile({
          name: profile.name || "",
          niche: profile.niche || "",
          strengths: Array.isArray(profile.strengths)
            ? profile.strengths.join(", ")
            : "",
          bio: profile.bio || "",
          instagram: profile.socialLinks?.instagram || "",
          rateCard: profile.rateCard || "",
        });
      })
      .catch((requestError) => {
        if (active) {
          setProfileError(
            requestError.response?.data?.message ||
              "Unable to load your profile.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoadingProfile(false);
      });

    return () => {
      active = false;
    };
  }, [resetProfile]);

  const saveProfile = async (values) => {
    setIsSavingProfile(true);
    setProfileError("");
    setProfileSuccess("");
    const body = { name: values.name.trim() };
    if (creatorProfileExists) {
      body.niche = values.niche.trim();
      body.strengths = values.strengths
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      body.bio = values.bio.trim();
      body.socialLinks = {
        instagram: values.instagram.trim(),
      };
      body.rateCard = values.rateCard.trim();
    }

    try {
      const response = await api.put("/users/profile", body);
      updateUser({ name: response.data.profile.name });
      setProfileSuccess("Your profile has been saved.");
      toast.success("Profile saved successfully.");
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Unable to save your profile. Please try again.";
      setProfileError(message);
      toast.error(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const savePassword = async (values) => {
    setIsSavingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");
    try {
      const response = await api.put("/users/settings", values);
      setPasswordSuccess(response.data.message || "Password updated successfully.");
      toast.success("Password updated successfully.");
      resetPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Unable to update your password. Please try again.";
      setPasswordError(message);
      toast.error(message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <section className="profile-page profile-settings-page">
      <header className="profile-page-heading">
        <span className="eyebrow">Your account</span>
        <h1 className="dashboard-title">
          {activeTab === "profile" ? "My Profile" : "Account Settings"}
        </h1>
        <p>Manage your public creator details and keep your account secure.</p>
      </header>

      <div className="profile-settings-tabs" role="tablist" aria-label="Profile and settings">
        <button
          className={`profile-settings-tab${activeTab === "profile" ? " is-active" : ""}`}
          id="profile-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "profile"}
          aria-controls="profile-panel"
          onClick={() => setActiveTab("profile")}
        >
          <UserRound size={16} /> My Profile
        </button>
        <button
          className={`profile-settings-tab${activeTab === "settings" ? " is-active" : ""}`}
          id="settings-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === "settings"}
          aria-controls="settings-panel"
          onClick={() => setActiveTab("settings")}
        >
          <LockKeyhole size={16} /> Account Settings
        </button>
      </div>

      {activeTab === "profile" && (
        <section
          className="profile-settings-panel"
          id="profile-panel"
          role="tabpanel"
          aria-labelledby="profile-tab"
        >
          {isLoadingProfile ? (
            <p className="admin-loading" role="status">
              Loading your profile…
            </p>
          ) : (
            <form
              className="profile-settings-form"
              onSubmit={handleProfileSubmit(saveProfile)}
            >
              {profileError && (
                <div className="form-alert" role="alert">
                  {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="form-alert success" role="status">
                  {profileSuccess}
                </div>
              )}
              {!creatorProfileExists && (
                <p className="field-hint">
                  Creator details become editable after you create a creator profile.
                  You can still update your account name here.
                </p>
              )}
              <div className="creator-form-grid">
                <div className="form-field">
                  <label htmlFor="settings-full-name">Full Name</label>
                  <input
                    id="settings-full-name"
                    maxLength={120}
                    {...registerProfile("name", {
                      required: "Full name is required.",
                      maxLength: {
                        value: 120,
                        message: "Name must be 120 characters or fewer.",
                      },
                    })}
                  />
                  {profileErrors.name && (
                    <span className="field-error">{profileErrors.name.message}</span>
                  )}
                </div>
                <div className="form-field">
                  <label htmlFor="settings-niche">Primary Niche / Category</label>
                  <input
                    id="settings-niche"
                    maxLength={120}
                    disabled={!creatorProfileExists}
                    {...registerProfile("niche", {
                      required: creatorProfileExists ? "Niche is required." : false,
                    })}
                  />
                  {profileErrors.niche && (
                    <span className="field-error">{profileErrors.niche.message}</span>
                  )}
                </div>
                <div className="form-field creator-form-wide">
                  <label htmlFor="settings-strengths">Core Strengths</label>
                  <input
                    id="settings-strengths"
                    placeholder="Photography, storytelling, video editing"
                    disabled={!creatorProfileExists}
                    {...registerProfile("strengths")}
                  />
                  <span className="field-hint">Separate strengths with commas.</span>
                </div>
                <div className="form-field creator-form-wide">
                  <label htmlFor="settings-bio">Bio</label>
                  <textarea
                    id="settings-bio"
                    rows={5}
                    maxLength={2000}
                    disabled={!creatorProfileExists}
                    {...registerProfile("bio", {
                      required: creatorProfileExists ? "Bio is required." : false,
                    })}
                  />
                  {profileErrors.bio && (
                    <span className="field-error">{profileErrors.bio.message}</span>
                  )}
                </div>
                <div className="form-field">
                  <label htmlFor="settings-instagram">Instagram handle</label>
                  <input
                    id="settings-instagram"
                    placeholder="@yourhandle"
                    maxLength={500}
                    disabled={!creatorProfileExists}
                    {...registerProfile("instagram")}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="settings-rate-card">Starting Rate</label>
                  <input
                    id="settings-rate-card"
                    placeholder="For example: $250 per post"
                    maxLength={120}
                    disabled={!creatorProfileExists}
                    {...registerProfile("rateCard")}
                  />
                </div>
              </div>
              <button
                className="button-primary profile-settings-submit"
                type="submit"
                disabled={isSavingProfile || isLoadingProfile}
              >
                {isSavingProfile ? (
                  <>
                    <LoaderCircle className="spin-animation" size={16} />
                    Saving profile…
                  </>
                ) : (
                  <>
                    <Check size={16} /> Save Profile
                  </>
                )}
              </button>
            </form>
          )}
        </section>
      )}

      {activeTab === "settings" && (
        <section
          className="profile-settings-panel"
          id="settings-panel"
          role="tabpanel"
          aria-labelledby="settings-tab"
        >
          <div className="profile-settings-copy">
            <h2>Change password</h2>
            <p>Choose a password with at least 8 characters.</p>
          </div>
          <form
            className="profile-settings-form password-settings-form"
            onSubmit={handlePasswordSubmit(savePassword)}
          >
            {passwordError && (
              <div className="form-alert" role="alert">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="form-alert success" role="status">
                {passwordSuccess}
              </div>
            )}
            <div className="form-field">
              <label htmlFor="settings-current-password">Current Password</label>
              <input
                id="settings-current-password"
                type="password"
                autoComplete="current-password"
                {...registerPassword("currentPassword", {
                  required: "Current password is required.",
                })}
              />
              {passwordErrors.currentPassword && (
                <span className="field-error">
                  {passwordErrors.currentPassword.message}
                </span>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="settings-new-password">New Password</label>
              <input
                id="settings-new-password"
                type="password"
                autoComplete="new-password"
                {...registerPassword("newPassword", {
                  required: "New password is required.",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters.",
                  },
                })}
              />
              {passwordErrors.newPassword && (
                <span className="field-error">
                  {passwordErrors.newPassword.message}
                </span>
              )}
            </div>
            <button
              className="button-primary profile-settings-submit"
              type="submit"
              disabled={isSavingPassword}
            >
              {isSavingPassword ? (
                <>
                  <LoaderCircle className="spin-animation" size={16} />
                  Updating password…
                </>
              ) : (
                <>
                  <Check size={16} /> Update Password
                </>
              )}
            </button>
          </form>
        </section>
      )}
    </section>
  );
}

export default ProfileSettingsPage;
