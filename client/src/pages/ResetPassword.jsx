import { useState } from "react";
import { AlertCircle, ArrowRight, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const submitResetPassword = async ({ password }) => {
    setApiError("");

    try {
      const response = await api.post(
        `/auth/reset-password/${encodeURIComponent(token)}`,
        { password },
      );
      navigate("/login", {
        replace: true,
        state: {
          message: response.data.message || "Your password has been reset.",
        },
      });
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          "Unable to reset your password. Please try again.",
      );
    }
  };

  return (
    <section className="auth-page">
      <aside className="auth-aside">
        <span className="eyebrow">Choose a new password</span>
        <h2>One small step, then you’re back in.</h2>
        <p>Use at least 8 characters for your new password.</p>
        <div className="auth-aside-mark">
          <Users size={32} />
        </div>
      </aside>
      <div className="auth-panel">
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-subtitle">Choose a new password for your account.</p>
        {apiError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={16} />
            {apiError}
          </div>
        )}
        <form onSubmit={handleSubmit(submitResetPassword)} noValidate>
          <div className="form-field">
            <label htmlFor="reset-password">New password</label>
            <input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              {...register("password", {
                required: "Create a password.",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long.",
                },
              })}
            />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </div>
          <div className="form-field">
            <label htmlFor="reset-confirm-password">Confirm new password</label>
            <input
              id="reset-confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter your new password again"
              {...register("confirmPassword", {
                required: "Confirm your password.",
                validate: (value, formValues) =>
                  value === formValues.password || "Passwords do not match.",
              })}
            />
            {errors.confirmPassword && (
              <span className="field-error">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>
          <button
            className="button-primary submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Resetting…" : "Reset password"}
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
        </form>
        <p className="auth-switch">
          <Link to="/login">Back to log in</Link>
        </p>
      </div>
    </section>
  );
}

export default ResetPassword;
