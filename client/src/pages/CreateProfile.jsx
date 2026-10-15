import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CreatorProfileForm from "../components/CreatorProfileForm.jsx";
import { useAuth } from "../context/useAuth.js";
import api from "../services/api.js";

function CreateProfile() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProfile = async (profile) => {
    setError("");
    setIsSubmitting(true);

    try {
      await api.post("/creators", profile);
      navigate("/dashboard", {
        replace: true,
        state: { message: "Your creator profile was created successfully." },
      });
    } catch (requestError) {
      if (requestError.response?.status === 401 || !token) {
        navigate("/login", {
          replace: true,
          state: { message: "Please log in again to create your profile." },
        });
        return;
      }

      setError(
        requestError.response?.data?.message ||
          "Unable to create your profile. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="profile-page">
      <div className="profile-page-heading">
        <span className="eyebrow">Your introduction</span>
        <h1 className="dashboard-title">Create your profile</h1>
        <p>
          Share what you make and give your next collaborator a place to start.
        </p>
      </div>
      <div className="profile-form-panel">
        <CreatorProfileForm
          onSubmit={createProfile}
          error={error}
          isSubmitting={isSubmitting}
          submitLabel="Create profile"
        />
      </div>
      <p className="profile-back-link">
        <Link to="/dashboard">Back to dashboard</Link>
      </p>
    </section>
  );
}

export default CreateProfile;
