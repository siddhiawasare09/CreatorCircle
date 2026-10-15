import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import CreatorCard from "../components/CreatorCard.jsx";
import api from "../services/api.js";
import {
  calculateMatchScore,
  hasMatchPreferences,
} from "../utils/creatorMatching.js";

function CreatorMatch() {
  const [creators, setCreators] = useState([]);
  const [preferences, setPreferences] = useState({
    category: "",
    location: "",
    skillsText: "",
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    api
      .get("/creators")
      .then((response) => {
        if (active) setCreators(response.data.creators || []);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Something went wrong. Please try again.",
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

  const categories = useMemo(
    () =>
      [
        ...new Set(creators.map((creator) => creator.category).filter(Boolean)),
      ].sort(),
    [creators],
  );
  const locations = useMemo(
    () =>
      [
        ...new Set(creators.map((creator) => creator.location).filter(Boolean)),
      ].sort(),
    [creators],
  );
  const skills = preferences.skillsText
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
  const matchPreferences = { ...preferences, skills };
  const preferencesSelected = hasMatchPreferences(matchPreferences);
  const results =
    hasSearched && preferencesSelected
      ? creators
          .map((creator) => ({
            creator,
            score: calculateMatchScore(matchPreferences, creator),
          }))
          .filter((result) => result.score > 0)
          .sort((first, second) => second.score - first.score)
      : [];

  const updatePreference = (field, value) => {
    setPreferences((current) => ({ ...current, [field]: value }));
  };

  const clearPreferences = () => {
    setPreferences({ category: "", location: "", skillsText: "" });
    setHasSearched(false);
  };

  return (
    <section className="match-page">
      <header className="match-heading">
        <span className="eyebrow">Rule-based recommendations</span>
        <h1 className="dashboard-title">Find Your Perfect Creator</h1>
        <p>
          Choose what matters to your project. We’ll compare your preferences
          with creator profiles and rank the closest matches.
        </p>
      </header>

      <form
        className="match-preferences"
        onSubmit={(event) => {
          event.preventDefault();
          setHasSearched(true);
        }}
      >
        <div className="match-preference-fields">
          <label className="match-field">
            Category
            <select
              value={preferences.category}
              onChange={(event) =>
                updatePreference("category", event.target.value)
              }
            >
              <option value="">Any category</option>
              {categories.map((category) => (
                <option value={category} key={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="match-field">
            Location
            <select
              value={preferences.location}
              onChange={(event) =>
                updatePreference("location", event.target.value)
              }
            >
              <option value="">Any location</option>
              {locations.map((location) => (
                <option value={location} key={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>
          <label className="match-field match-skills-field">
            Skills
            <input
              value={preferences.skillsText}
              onChange={(event) =>
                updatePreference("skillsText", event.target.value)
              }
              placeholder="e.g. Reels, Instagram, Photography"
            />
            <span>Separate skills with commas.</span>
          </label>
        </div>
        <div className="match-form-actions">
          <button
            className="button-primary"
            type="submit"
            disabled={isLoading || creators.length === 0}
          >
            <Sparkles size={16} /> Find Best Matches
          </button>
          <button
            className="match-reset-button"
            type="button"
            onClick={clearPreferences}
          >
            <RotateCcw size={15} /> Clear Preferences
          </button>
        </div>
      </form>

      {isLoading && (
        <div
          className="creator-skeleton-grid"
          role="status"
          aria-label="Loading creators"
        >
          <div />
          <div />
          <div />
        </div>
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
      {!isLoading && !error && creators.length === 0 && (
        <div className="discovery-empty match-empty">
          <h2>No creator profiles yet</h2>
          <p>
            There aren’t any creators to match yet. Check back after profiles
            are added.
          </p>
        </div>
      )}
      {!isLoading &&
        !error &&
        creators.length > 0 &&
        hasSearched &&
        !preferencesSelected && (
          <div className="discovery-empty match-empty">
            <h2>Choose at least one preference</h2>
            <p>
              Select a category, location, or one or more skills to find
              relevant creators.
            </p>
          </div>
        )}
      {!isLoading && !error && hasSearched && preferencesSelected && (
        <section className="match-results" aria-live="polite">
          <div className="match-results-heading">
            <div>
              <span className="eyebrow">Ranked by preference fit</span>
              <h2>Recommended Creators</h2>
            </div>
            {results.length > 0 && <span>{results.length} matches</span>}
          </div>
          {results.length === 0 ? (
            <div className="discovery-empty match-empty">
              <h2>No matching creators found.</h2>
              <p>Try changing your category, location or skills.</p>
            </div>
          ) : (
            <div className="discovery-grid">
              {results.map(({ creator, score }) => (
                <CreatorCard
                  key={creator._id}
                  creator={creator}
                  matchScore={score}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  );
}

export default CreatorMatch;
