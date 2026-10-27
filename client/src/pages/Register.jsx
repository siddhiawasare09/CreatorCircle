import { useState } from "react";
import { AlertCircle, ArrowRight, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";

function Register() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const submitRegistration = async ({ name, email, password }) => {
    setApiError("");

    try {
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate("/login", {
        replace: true,
        state: { message: "Your account is ready. Log in to continue." },
      });
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    }
  };

  return (
    <section className="auth-page">
      <aside className="auth-aside">
        <span className="eyebrow">Make room for good ideas</span>
        <h2>Your next collaboration starts with a hello.</h2>
        <p>
          Join a community built around sharing your craft and finding people
          who make you think bigger.
        </p>
        <div className="auth-aside-mark">
          <Users size={32} />
        </div>
      </aside>
      <div className="auth-panel">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">
          A fresh start for your next creative chapter.
        </p>
        {apiError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={16} />
            {apiError}
          </div>
        )}
        <form onSubmit={handleSubmit(submitRegistration)} noValidate>
          <div className="form-field">
            <label htmlFor="register-name">Name</label>
            <input
              id="register-name"
              autoComplete="name"
              placeholder="Your name"
              {...register("name", { required: "Enter your name." })}
            />
            {errors.name && (
              <span className="field-error">{errors.name.message}</span>
            )}
          </div>
          <div className="form-field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
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
          <div className="form-field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
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
            <label htmlFor="register-confirm">Confirm password</label>
            <input
              id="register-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Enter your password again"
              {...register("confirmPassword", {
                required: "Confirm your password.",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match.",
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
            {isSubmitting ? "Creating account…" : "Create account"}{" "}
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
