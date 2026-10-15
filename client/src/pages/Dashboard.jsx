import {
  ArrowRight,
  ArrowUpRight,
  LogOut,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth.js";
import api from "../services/api.js";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [creator, setCreator] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const creatorInitials =
    creator?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "CC";

  useEffect(() => {
    let active = true;

    api
      .get("/creators")
      .then((response) => {
        const ownProfile = (response.data.creators || []).find((item) => {
          const ownerId = item.user?._id || item.user;
          return String(ownerId) === String(user?.id);
        });

        if (active) setCreator(ownProfile || null);
      })
      .catch((error) => {
        if (active) {
          setProfileError(
            error.response?.data?.message ||
              "Unable to load your profile summary.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoadingProfile(false);
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <section className="dashboard-page">
      <div className="dashboard-welcome">
        <span className="eyebrow">Your CreatorCircle</span>
        <h1 className="dashboard-title">Welcome, {user?.name || "creator"}.</h1>
        <p>
          You’re signed in. Your next good idea could start with a conversation.
        </p>
        {location.state?.message && (
          <div className="form-alert success dashboard-message" role="status">
            {location.state.message}
          </div>
        )}
      </div>
      {isLoadingProfile ? (
        <div className="dashboard-panel profile-loading" role="status">
          Loading your creator profile…
        </div>
      ) : creator ? (
        <div className="dashboard-panel dashboard-profile-panel">
          <div className="dashboard-panel-copy">
            <span className="eyebrow">Your creator profile</span>
            <h2>{creator.name}</h2>
            <p className="creator-summary-meta">
              {creator.category}
              {creator.location ? (
                <>
                  {" "}
                  <span>·</span> <MapPin size={14} /> {creator.location}
                </>
              ) : null}
            </p>
            <p>{creator.bio}</p>
            {creator.skills?.length > 0 && (
              <div className="creator-skills dashboard-skills">
                {creator.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            )}
          </div>
          <div className="dashboard-mark dashboard-creator-avatar">
            {creator.profileImage ? (
              <img src={creator.profileImage} alt={`${creator.name} profile`} />
            ) : (
              <span aria-hidden="true">{creatorInitials}</span>
            )}
          </div>
        </div>
      ) : (
        <div className="dashboard-panel">
          <div className="dashboard-panel-copy">
            <h2>Make space for your next idea.</h2>
            <p>
              Create a creator profile to share your skills and help
              collaborators find you.
            </p>
          </div>
          <div className="dashboard-mark">
            <Sparkles size={34} />
          </div>
        </div>
      )}
      {profileError && (
        <div className="form-alert dashboard-message" role="alert">
          {profileError}
        </div>
      )}
      <div className="dashboard-profile-actions">
        {!creator && !isLoadingProfile && (
          <Link className="button-primary" to="/profile/create">
            Create Profile <ArrowRight size={16} />
          </Link>
        )}
        {creator && (
          <Link className="button-primary" to={`/profile/edit/${creator._id}`}>
            Edit Profile <ArrowRight size={16} />
          </Link>
        )}
        <Link className="button-outline" to="/creators">
          Browse Creators <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="dashboard-actions">
        <button className="button-dark" type="button" onClick={handleLogout}>
          <LogOut size={16} /> Log out <ArrowUpRight size={15} />
        </button>
      </div>
    </section>
  );
}

export default Dashboard;
