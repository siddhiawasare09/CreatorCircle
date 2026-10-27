import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "../services/api.js";

const defaults = {
  theme: "light",
  notifications: {
    proposalAccepted: true,
    newMessages: true,
  },
};

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
};

function SettingsPage() {
  const [preferences, setPreferences] = useState(defaults);
  const [accountDetails, setAccountDetails] = useState(null);
  const [accountError, setAccountError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [preferencesSuccess, setPreferencesSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    let active = true;
    api
      .get("/users/profile")
      .then((response) => {
        if (!active) return;
        const profile = response.data.profile || {};
        setAccountDetails({
          email: profile.email || "",
          role: profile.role || "",
          accountType:
            response.data.accountType ||
            (response.data.creatorProfileExists ? "creator" : "brand"),
        });
        setAccountError("");
      })
      .catch((requestError) => {
        if (active) {
          setAccountError(
            requestError.response?.data?.message ||
              "Unable to load your account details.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    api
      .get("/users/settings/preferences")
      .then((response) => {
        const saved = response.data.preferences || defaults;
        const next = {
          theme: saved.theme === "dark" ? "dark" : "light",
          notifications: {
            proposalAccepted:
              saved.notifications?.proposalAccepted ?? true,
            newMessages: saved.notifications?.newMessages ?? true,
          },
        };
        if (active) {
          setPreferences(next);
          setPreferencesLoaded(true);
          applyTheme(next.theme);
          localStorage.setItem("creatorcircle_theme", next.theme);
          setLoadError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setLoadError(
            requestError.response?.data?.message ||
              "Unable to load your settings.",
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

  const changeTheme = (theme) => {
    setPreferences((current) => ({ ...current, theme }));
    applyTheme(theme);
    setPreferencesSuccess("");
  };

  const toggleNotification = (name) => {
    setPreferences((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [name]: !current.notifications[name],
      },
    }));
    setPreferencesSuccess("");
  };

  const savePreferences = async () => {
    setIsSavingPreferences(true);
    setLoadError("");
    setPreferencesSuccess("");
    try {
      const response = await api.put(
        "/users/settings/preferences",
        preferences,
      );
      const saved = response.data.preferences;
      const next = {
        theme: saved.theme,
        notifications: {
          proposalAccepted: saved.notifications.proposalAccepted,
          newMessages: saved.notifications.newMessages,
        },
      };
      setPreferences(next);
      applyTheme(next.theme);
      localStorage.setItem("creatorcircle_theme", next.theme);
      setPreferencesSuccess("Your preferences have been saved.");
      toast.success("Settings saved.");
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Unable to save your preferences. Please try again.";
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const savePassword = async (values) => {
    setIsSavingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");
    try {
      const response = await api.put("/users/settings", values);
      setPasswordSuccess(
        response.data.message || "Password updated successfully.",
      );
      toast.success("Password updated successfully.");
      reset({ currentPassword: "", newPassword: "" });
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
    <section className="profile-page settings-page">
      <header className="profile-page-heading">
        <span className="eyebrow">Make CreatorCircle yours</span>
        <h1 className="dashboard-title">Settings</h1>
        <p>Set your appearance, choose which updates you receive, and secure your account.</p>
      </header>

      {loadError && (
        <div className="form-alert" role="alert">
          {loadError}
          <button
            className="inline-retry"
            type="button"
            onClick={() => {
              setIsLoading(true);
              setLoadError("");
              setRetryKey((current) => current + 1);
            }}
          >
            Retry
          </button>
        </div>
      )}
      {isLoading ? (
        <p className="admin-loading" role="status">
          Loading your settings…
        </p>
      ) : (
        <>
          {preferencesSuccess && (
            <div className="form-alert success" role="status">
              {preferencesSuccess}
            </div>
          )}
          <section className="settings-card account-details-card" aria-labelledby="account-details-heading">
            <div className="settings-card-heading">
              <span className="settings-section-icon"><ShieldCheck size={18} /></span>
              <div>
                <h2 id="account-details-heading">Account Details</h2>
                <p>Your account type is assigned by CreatorCircle and cannot be changed here.</p>
              </div>
            </div>
            {accountError ? (
              <p className="settings-account-error" role="alert">{accountError}</p>
            ) : !accountDetails ? (
              <p className="admin-loading" role="status">Loading account details…</p>
            ) : (
              <div className="settings-account-details">
                <div className="settings-account-email">
                  <Mail size={17} aria-hidden="true" />
                  <div>
                    <span>Email address</span>
                    <strong>{accountDetails.email || "Email unavailable"}</strong>
                  </div>
                </div>
                <div
                  className={`settings-account-badge is-${accountDetails.accountType}`}
                  aria-label={`Read-only account type: ${accountDetails.accountType}`}
                >
                  {accountDetails.accountType === "creator"
                    ? "✨ Creator Account"
                    : accountDetails.accountType === "admin"
                      ? "Admin Account"
                      : "🏢 Brand / Client Account"}
                </div>
              </div>
            )}
          </section>
          <section className="settings-card" aria-labelledby="appearance-heading">
            <div className="settings-card-heading">
              <span className="settings-section-icon"><Sun size={18} /></span>
              <div>
                <h2 id="appearance-heading">Appearance</h2>
                <p>Choose how CreatorCircle looks on this device.</p>
              </div>
            </div>
            <div className="settings-theme-options" role="radiogroup" aria-label="Theme">
              {[
                { value: "light", label: "Light", Icon: Sun },
                { value: "dark", label: "Dark", Icon: Moon },
              ].map(({ value, label, Icon }) => (
                <button
                  className={`settings-theme-option${preferences.theme === value ? " is-selected" : ""}`}
                  type="button"
                  role="radio"
                  aria-checked={preferences.theme === value}
                  key={value}
                  onClick={() => changeTheme(value)}
                  disabled={isSavingPreferences}
                >
                  <Icon size={17} />
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className="settings-card" aria-labelledby="notifications-heading">
            <div className="settings-card-heading">
              <span className="settings-section-icon"><Bell size={18} /></span>
              <div>
                <h2 id="notifications-heading">Notification Preferences</h2>
                <p>Choose which collaboration updates you want to receive.</p>
              </div>
            </div>
            <div className="settings-notification-options">
              <label className="settings-checkbox-row">
                <span>
                  <strong>Proposal accepted</strong>
                  <small>Get updates when a brand accepts your proposal.</small>
                </span>
                <input
                  type="checkbox"
                  checked={preferences.notifications.proposalAccepted}
                  onChange={() => toggleNotification("proposalAccepted")}
                  disabled={isSavingPreferences}
                />
              </label>
              <label className="settings-checkbox-row">
                <span>
                  <strong>New messages</strong>
                  <small>Get updates when someone replies to your inquiry.</small>
                </span>
                <input
                  type="checkbox"
                  checked={preferences.notifications.newMessages}
                  onChange={() => toggleNotification("newMessages")}
                  disabled={isSavingPreferences}
                />
              </label>
            </div>
            <button
              className="button-primary profile-settings-submit"
              type="button"
              onClick={savePreferences}
              disabled={isSavingPreferences || !preferencesLoaded}
            >
              {isSavingPreferences ? (
                <>
                  <LoaderCircle className="spin-animation" size={16} />
                  Saving preferences…
                </>
              ) : (
                <>
                  <Check size={16} /> Save Preferences
                </>
              )}
            </button>
          </section>

          <section className="settings-card" aria-labelledby="security-heading">
            <div className="settings-card-heading">
              <span className="settings-section-icon"><LockKeyhole size={18} /></span>
              <div>
                <h2 id="security-heading">Security</h2>
                <p>Change your password to keep your account secure.</p>
              </div>
            </div>
            <form
              className="profile-settings-form password-settings-form"
              onSubmit={handleSubmit(savePassword)}
            >
              {passwordError && (
                <div className="form-alert" role="alert">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="form-alert success" role="status">{passwordSuccess}</div>
              )}
              <div className="form-field">
                <label htmlFor="settings-current-password">Current Password</label>
                <input
                  id="settings-current-password"
                  type="password"
                  autoComplete="current-password"
                  {...register("currentPassword", {
                    required: "Current password is required.",
                  })}
                />
                {errors.currentPassword && (
                  <span className="field-error">{errors.currentPassword.message}</span>
                )}
              </div>
              <div className="form-field">
                <label htmlFor="settings-new-password">New Password</label>
                <input
                  id="settings-new-password"
                  type="password"
                  autoComplete="new-password"
                  {...register("newPassword", {
                    required: "New password is required.",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters.",
                    },
                  })}
                />
                {errors.newPassword && (
                  <span className="field-error">{errors.newPassword.message}</span>
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
        </>
      )}
    </section>
  );
}

export default SettingsPage;
