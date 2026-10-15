import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Compass,
  Handshake,
  Search,
  Sparkles,
  Users,
  UserRoundPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import CreatorCard from "../components/CreatorCard.jsx";
import api from "../services/api.js";

function Home() {
  const { token } = useAuth();
  const [featuredCreators, setFeaturedCreators] = useState([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(true);
  const [creatorError, setCreatorError] = useState("");
  const [creatorRetry, setCreatorRetry] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    let active = true;

    api
      .get("/creators")
      .then((response) => {
        if (active) setFeaturedCreators(response.data.creators || []);
      })
      .catch((requestError) => {
        if (active) {
          setFeaturedCreators([]);
          setCreatorError(requestError.response?.data?.message || "Something went wrong. Please try again.");
        }
      })
      .finally(() => {
        if (active) setIsLoadingCreators(false);
      });

    return () => {
      active = false;
    };
  }, [creatorRetry]);

  const spotlight = featuredCreators[0];
  const scrollFeatured = (direction) => {
    if (!carouselRef.current) return;
    const card = carouselRef.current.querySelector(".featured-slide");
    const distance = card ? card.getBoundingClientRect().width + 14 : 320;
    carouselRef.current.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Creative partnerships, made easier</span>
          <h1 className="hero-title">Connect Brands with Creative Talent</h1>
          <p className="hero-description">
            CreatorCircle helps customers discover creators for campaigns and collaborations. Find the right skills, explore real profiles, and get your next idea moving.
          </p>
          <div className="hero-actions">
            <Link className="button-primary" to="/creators">
              Explore Creators <ArrowRight size={17} />
            </Link>
            <Link className="button-outline" to={token ? "/profile/create" : "/register"}>
              Create Profile <UserRoundPlus size={16} />
            </Link>
          </div>
        </div>
        <div className="hero-art" aria-label="CreatorCircle creator spotlight">
          <div className="art-circle" />
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          {spotlight ? (
            <article className="profile-tile home-spotlight">
              <div className="profile-topline">
                {spotlight.profileImage ? (
                  <img className="profile-avatar home-spotlight-image" src={spotlight.profileImage} alt={`${spotlight.name} profile`} />
                ) : (
                  <span className="profile-avatar home-spotlight-fallback" aria-hidden="true">
                    {spotlight.name?.trim().charAt(0).toUpperCase() || "C"}
                  </span>
                )}
                <div className="profile-lines">
                  <strong>{spotlight.name}</strong>
                  <span>{spotlight.category}{spotlight.location ? ` · ${spotlight.location}` : ""}</span>
                </div>
              </div>
              <p className="profile-bio">{spotlight.bio}</p>
              <div className="skill-row">
                {(spotlight.skills || []).slice(0, 3).map((skill) => <span className="skill-chip" key={skill}>{skill}</span>)}
                {!spotlight.skills?.length && <span className="skill-chip">Open to collaboration</span>}
              </div>
              <Link className="spotlight-link" to={`/creators/${spotlight._id}`}>View creator <ArrowRight size={14} /></Link>
            </article>
          ) : (
            <div className="home-art-message">
              <span className="home-art-icon"><BriefcaseBusiness size={26} /></span>
              <span className="eyebrow">Your next campaign</span>
              <strong>Starts with the right creative perspective.</strong>
              <span className="home-art-caption"><Sparkles size={15} /> Browse talent by skills and style</span>
            </div>
          )}
          <div className="floating-tag tag-top"><Search size={15} /> Find your fit</div>
          <div className="floating-tag tag-bottom"><Handshake size={16} /> Collaboration starts here</div>
        </div>
      </section>

      <section className="features-section" id="how-it-works">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A clearer path to collaboration</span>
            <h2>Why CreatorCircle?</h2>
          </div>
          <p>
            Everything you need to discover creative talent and make a confident first connection.
          </p>
        </div>
        <div className="feature-grid">
          <article className="feature-item">
            <div className="feature-icon">
              <Compass size={18} />
            </div>
            <h3>Discover Creators</h3>
            <p>
              Browse creator profiles and find fresh perspectives for your next campaign.
            </p>
          </article>
          <article className="feature-item">
            <div className="feature-icon">
              <UserRoundPlus size={18} />
            </div>
            <h3>Easy Profiles</h3>
            <p>
              Clear profiles make it easy to understand each creator’s work and experience.
            </p>
          </article>
          <article className="feature-item">
            <div className="feature-icon">
              <Search size={18} />
            </div>
            <h3>Find the Right Skills</h3>
            <p>Filter by category, location, and skills to build the right creative team.</p>
          </article>
          <article className="feature-item">
            <div className="feature-icon">
              <Handshake size={18} />
            </div>
            <h3>Connect Easily</h3>
            <p>
              Find creator links and move from discovery to your next conversation.
            </p>
          </article>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Real people, real skills</span>
            <h2>Featured Creators</h2>
          </div>
          <Link className="featured-browse-link" to="/creators">Browse all creators <ArrowRight size={15} /></Link>
        </div>
        {!isLoadingCreators && !creatorError && featuredCreators.length > 0 && (
          <div className="featured-controls">
            <span className="featured-state">A few profiles to get you started</span>
            <div className="featured-arrows">
              <button type="button" onClick={() => scrollFeatured(-1)} aria-label="Previous creators"><ChevronLeft size={18} /></button>
              <button type="button" onClick={() => scrollFeatured(1)} aria-label="Next creators"><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
        {isLoadingCreators ? (
          <div className="creator-skeleton-grid featured-skeleton" aria-label="Loading featured creators"><div /><div /><div /></div>
        ) : creatorError ? (
          <div className="featured-empty">
            <p>{creatorError}</p>
            <button
              className="inline-retry"
              type="button"
              onClick={() => {
                setIsLoadingCreators(true);
                setCreatorError("");
                setCreatorRetry((retry) => retry + 1);
              }}
            >
              Retry
            </button>
          </div>
        ) : featuredCreators.length > 0 ? (
          <div className="featured-carousel" ref={carouselRef}>
            {featuredCreators.map((creator) => <div className="featured-slide" key={creator._id}><CreatorCard creator={creator} /></div>)}
          </div>
        ) : (
          <div className="featured-empty">
            <p>Creator profiles will appear here as the community grows.</p>
            <Link to={token ? "/profile/create" : "/register"}>Introduce yourself <ArrowRight size={15} /></Link>
          </div>
        )}
      </section>

      <section className="home-cta-section">
        <div>
          <span className="eyebrow">Your next collaboration starts here</span>
          <h2>Ready to find your next creator?</h2>
          <p>Explore real profiles and find the perspective your project needs.</p>
        </div>
        <Link className="button-primary" to="/creators">Explore Creators <ArrowRight size={16} /></Link>
      </section>

      <footer className="home-footer">
        <Link className="brand" to="/" aria-label="CreatorCircle home">
          <span className="brand-mark"><Users size={18} /></span>
          <span>CreatorCircle</span>
        </Link>
        <p>Good collaborations start with the right connection.</p>
        <Link to="/creators">Explore the community <ArrowRight size={14} /></Link>
      </footer>
    </div>
  );
}

export default Home;
