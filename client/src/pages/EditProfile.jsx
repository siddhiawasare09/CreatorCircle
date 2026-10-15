import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CreatorProfileForm from "../components/CreatorProfileForm.jsx";
import { useAuth } from "../context/useAuth.js";
import api from "../services/api.js";

const emptyValues = {
  name: "",
  profileImage: "",
  bio: "",
  category: "",
  skills: "",
  location: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  website: "",
};

const toFormValues = (creator) => ({
  name: creator.name || "",
  profileImage: creator.profileImage || "",
  bio: creator.bio || "",
  category: creator.category || "",
  skills: Array.isArray(creator.skills) ? creator.skills.join(", ") : "",
  location: creator.location || "",
  instagram: creator.socialLinks?.instagram || "",
  linkedin: creator.socialLinks?.linkedin || "",
  youtube: creator.socialLinks?.youtube || "",
  website: creator.socialLinks?.website || "",
});

function EditProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [creator, setCreator] = useState(null);
  const [formValues, setFormValues] = useState(emptyValues);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get(`/creators/${id}`);
        const loadedCreator = response.data.creator;
        const ownerId = loadedCreator.user?._id || loadedCreator.user;

        if (String(ownerId) !== String(user?.id)) {
          setError("You can only edit your own creator profile.");
          return;
        }

        if (active) {
          setCreator(loadedCreator);
          setFormValues(toFormValues(loadedCreator));
        }
      } catch (requestError) {
        if (!active) return;

        if (requestError.response?.status === 401 || !token) {
          navigate("/login", {
            replace: true,
            state: { message: "Please log in again to edit your profile." },
          });
          return;
        }

        setError(
          requestError.response?.data?.message ||
            "Unable to load this creator profile.",
        );
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [id, navigate, token, user?.id]);

  const updateProfile = async (profile) => {
    setError("");
    setIsSubmitting(true);

    try {
      await api.put(`/creators/${id}`, profile);
      navigate("/dashboard", {
        replace: true,
        state: { message: "Your creator profile was updated successfully." },
      });
    } catch (requestError) {
      if (requestError.response?.status === 401 || !token) {
        navigate("/login", {
          replace: true,
          state: { message: "Please log in again to update your profile." },
        });
        return;
      }

      setError(
        requestError.response?.data?.message ||
          "Unable to update your profile. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="profile-page">
      <div className="profile-page-heading">
        <span className="eyebrow">Keep it current</span>
        <h1 className="dashboard-title">Edit your profile</h1>
        <p>Update the details collaborators see on your creator profile.</p>
      </div>
      {isLoading ? (
        <div className="profile-form-panel profile-loading" role="status">
          Loading your profile…
        </div>
      ) : creator ? (
        <div className="profile-form-panel">
          <CreatorProfileForm
            initialValues={formValues}
            onSubmit={updateProfile}
            error={error}
            isSubmitting={isSubmitting}
            submitLabel="Save changes"
          />
        </div>
      ) : (
        <div className="profile-form-panel">
          {error && (
            <div className="form-alert" role="alert">
              {error}
            </div>
          )}
        </div>
      )}
      <p className="profile-back-link">
        <Link to="/dashboard">Back to dashboard</Link>
      </p>
    </section>
  );
}

export default EditProfile;
