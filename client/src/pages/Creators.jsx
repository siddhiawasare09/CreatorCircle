import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import CreatorCard from "../components/CreatorCard.jsx";
import api from "../services/api.js";

function Creators() {
  const [creators, setCreators] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
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
              "Unable to load creator profiles right now.",
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

  const categories = [
    ...new Set(creators.map((creator) => creator.category).filter(Boolean)),
  ].sort();
  const locations = [
    ...new Set(creators.map((creator) => creator.location).filter(Boolean)),
  ].sort();
  const query = search.trim().toLowerCase();
  const filteredCreators = creators.filter((creator) => {
    const matchesSearch =
      !query ||
      [
        creator.name,
        creator.category,
        creator.location,
        ...(creator.skills || []),
      ].some((value) => value?.toLowerCase().includes(query));
    const matchesCategory =
      !categoryFilter || creator.category === categoryFilter;
    const matchesLocation =
      !locationFilter || creator.location === locationFilter;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <section className="discovery-page">
      <div className="profile-page-heading">
        <span className="eyebrow">Community directory</span>
        <h1 className="dashboard-title">Discover Creators</h1>
        <p>
          Find people with the perspective and skills to make something great
          together.
        </p>
      </div>
      <div className="discovery-tools">
        <label className="discovery-search" htmlFor="creator-search">
          <Search size={18} />
          <input
            id="creator-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, category, skills, or location"
          />
        </label>
        <div className="discovery-filter-label">
          <SlidersHorizontal size={15} /> Filters
        </div>
        <label className="discovery-select-label" htmlFor="category-filter">
          Category
        </label>
        <select
          id="category-filter"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <label className="discovery-select-label" htmlFor="location-filter">
          Location
        </label>
        <select
          id="location-filter"
          value={locationFilter}
          onChange={(event) => setLocationFilter(event.target.value)}
        >
          <option value="">All locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>
      {isLoading && (
        <div className="creator-skeleton-grid" role="status" aria-label="Loading creators">
          <div /><div /><div />
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
        <div className="discovery-empty">
          <h2>No creator profiles yet</h2>
          <p>
            Creator profiles will appear here when creators join the community.
          </p>
        </div>
      )}
      {!isLoading &&
        !error &&
        creators.length > 0 &&
        filteredCreators.length === 0 && (
          <div className="discovery-empty">
            <h2>No creators match these filters</h2>
            <p>Try another search or clear one of the filters.</p>
            <button
              className="discovery-clear-button"
              type="button"
              onClick={() => {
                setSearch("");
                setCategoryFilter("");
                setLocationFilter("");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      {!isLoading && !error && filteredCreators.length > 0 && (
        <>
          <p className="discovery-count">
            {filteredCreators.length}{" "}
            {filteredCreators.length === 1 ? "creator" : "creators"}
          </p>
          <div className="discovery-grid">
            {filteredCreators.map((creator) => (
              <CreatorCard creator={creator} key={creator._id} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default Creators;
