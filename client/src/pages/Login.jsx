import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import api from "../services/api.js";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, token } = useAuth();
  const [apiError, setApiError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const successMessage = location.state?.message;

  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [navigate, token]);

  const submitLogin = async ({ email, password }) => {
    setApiError("");

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });
      login(response.data);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (error) {
      setApiError(
        error.response?.data?.message || "Unable to log in. Please try again.",
      );
    }
  };

  return (
    <section className="auth-page">
      <aside className="auth-aside">
        <span className="eyebrow">Your people are out there</span>
        <h2>Pick up where your creativity left off.</h2>
        <p>
          Sign in to return to your CreatorCircle space and keep the good ideas
          moving.
        </p>
        <div className="auth-aside-mark">
          <Users size={32} />
        </div>
      </aside>
      <div className="auth-panel">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to your CreatorCircle account.</p>
        {successMessage && (
          <div className="form-alert success" role="status">
            {successMessage}
          </div>
        )}
        {apiError && (
          <div className="form-alert" role="alert">
            <AlertCircle size={16} />
            {apiError}
          </div>
        )}
        <form onSubmit={handleSubmit(submitLogin)} noValidate>
          <div className="form-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
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
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              {...register("password", { required: "Enter your password." })}
            />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </div>
          <button
            className="button-primary submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in…" : "Log in"}{" "}
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
        </form>
        <p className="auth-switch">
          New to CreatorCircle? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
