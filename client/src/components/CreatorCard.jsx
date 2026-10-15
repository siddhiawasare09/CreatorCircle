import { ArrowUpRight, Heart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useShortlist } from "../context/useShortlist.js";

function CreatorCard({ creator, matchScore }) {
  const { creatorIds, toggleCreator } = useShortlist();
  const isSaved = creatorIds.includes(creator._id);
  const initials =
    creator.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "CC";

  return (
    <article className="discovery-card">
      <div className="discovery-card-top">
        {creator.profileImage ? (
          <img
            className="discovery-avatar"
            src={creator.profileImage}
            alt={`${creator.name} profile`}
          />
        ) : (
          <span
            className="discovery-avatar discovery-avatar-fallback"
            aria-hidden="true"
          >
            {initials}
          </span>
        )}
        <span className="discovery-category">{creator.category}</span>
      </div>
      <button
        className={`favorite-button${isSaved ? " is-saved" : ""}`}
        type="button"
        aria-label={
          isSaved
            ? `Remove ${creator.name} from shortlist`
            : `Add ${creator.name} to shortlist`
        }
        aria-pressed={isSaved}
        onClick={() => toggleCreator(creator._id)}
      >
        <Heart size={17} fill={isSaved ? "currentColor" : "none"} />
      </button>
      <h2 className="discovery-name">{creator.name}</h2>
      {typeof matchScore === "number" && (
        <span className="match-score-badge">{matchScore}% Match</span>
      )}
      {creator.location && (
        <p className="discovery-location">
          <MapPin size={14} />
          {creator.location}
        </p>
      )}
      <p className="discovery-bio">{creator.bio}</p>
      {creator.skills?.length > 0 && (
        <div className="discovery-skills" aria-label="Skills">
          {creator.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      )}
      <Link className="discovery-view-link" to={`/creators/${creator._id}`}>
        View Profile <ArrowUpRight size={15} />
      </Link>
    </article>
  );
}

export default CreatorCard;
