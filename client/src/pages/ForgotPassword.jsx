import { useState } from "react";
import { AlertCircle, ArrowRight, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import api from "../services/api.js";

function ForgotPassword() {
  const [apiError, setApiError] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const submitForgotPassword = async ({ email }) => {
    setApiError("");
    setIsComplete(false);

    try {
      await api.post("/auth/forgot-password", {
        email: email.trim(),
      });
      setIsComplete(true);
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          "Unable to request a reset link. Please try again.",
      );
    }
  };

  return (
    <section className="auth-page">
      <aside className="auth-aside">
        <span className="eyebrow">A fresh start</span>
        <h2>Let’s get you back to your creative space.</h2>
        <p>Enter the email address associated with your account.</p>
        <div className="auth-aside-mark">
          <Users size={32} />
        </div>
      </aside>
      <div className="auth-panel">
        <h1 className="auth-title">Forgot your password?</h1>
        <p className="auth-subtitle">
          We’ll send a password reset link if an account exists for that email.
        </p>
        {isComplete && (
          <div className="form-alert success" role="status">
            If that email exists, a reset link has been sent.
          </div>
        )}
        {apiError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={16} />
            {apiError}
          </div>
        )}
        <form onSubmit={handleSubmit(submitForgotPassword)} noValidate>
          <div className="form-field">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Enter your email.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address.",
                },
              })}
            />
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </div>
          <button
            className="button-primary submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending…" : "Send reset link"}
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
        </form>
        <p className="auth-switch">
          Remember your password? <Link to="/login">Log in</Link>
        </p>
      </div>
    </section>
  );
}

export default ForgotPassword;
