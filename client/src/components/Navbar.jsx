import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, LogOut, Menu, Users, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import api from "../services/api.js";

function Navbar() {
  const { token, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (
      !token ||
      !user?.id ||
      user.role === "admin" ||
      user.role === "brand"
    ) {
      return undefined;
    }

    let active = true;
    const userId = String(user.id);

    api
      .get("/creators")
      .then((response) => {
        if (!Array.isArray(response.data.creators)) {
          throw new Error("Creator response did not include a creator list");
        }

        const hasCreatorProfile = response.data.creators.some((creator) => {
          const ownerId = creator.user?._id || creator.user;
          return String(ownerId) === userId;
        });

        if (active) {
          setProfileStatus({
            userId,
            status: hasCreatorProfile ? "creator" : "customer",
          });
        }
      })
      .catch(() => {
        if (active) setProfileStatus({ userId, status: "error" });
      });

    return () => {
      active = false;
    };
  }, [token, user?.id, user?.role]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);
  const closeAccountMenu = () => {
    setAccountMenuOpen(false);
    closeMenu();
  };
  const currentProfileStatus =
    profileStatus?.userId === String(user?.id) ? profileStatus.status : null;
  const isCreator =
    user?.role === "creator" || currentProfileStatus === "creator";
  const isBrand =
    user?.role === "brand" ||
    (user?.role === "customer" && currentProfileStatus === "customer");

  return (
    <header className="site-nav">
      <Link
        className="brand"
        to="/"
        onClick={closeMenu}
        aria-label="CreatorCircle home"
      >
        <span className="brand-mark">
          <Users size={19} strokeWidth={2.3} />
        </span>
        <span>CreatorCircle</span>
      </Link>
      <nav
        className={`nav-links${menuOpen ? " is-open" : ""}`}
        aria-label="Main navigation"
      >
        <Link to="/" onClick={closeMenu}>
          Home
        </Link>
        {token && user?.role === "admin" && (
          <Link to="/admin/dashboard" onClick={closeMenu}>
            Admin Dashboard
          </Link>
        )}
        {token && isCreator && (
          <>
            <Link to="/campaigns" onClick={closeMenu}>
              Find Campaigns
            </Link>
            <Link to="/creators" onClick={closeMenu}>
              Creators
            </Link>
            <Link to="/creator-dashboard" onClick={closeMenu}>
            Creator Dashboard
            </Link>
          </>
        )}
        {token && isBrand && (
          <>
            <Link to="/creators" onClick={closeMenu}>
              Find Creators
            </Link>
            <Link to="/brand/campaigns" onClick={closeMenu}>
              My Campaigns
            </Link>
            <Link to="/shortlist" onClick={closeMenu}>
              My Shortlist
            </Link>
            <Link to="/inquiries" onClick={closeMenu}>
              My Inquiries
            </Link>
          </>
        )}
        {!token && (
          <Link to="/creators" onClick={closeMenu}>
            Creators
          </Link>
        )}
        {token && currentProfileStatus === "error" && (
          <span className="nav-account-status" role="status">
            Account links could not be loaded.
          </span>
        )}
      </nav>
      <div className={`nav-actions${menuOpen ? " is-open" : ""}`}>
        {token ? (
          <>
            <div className="nav-account-menu">
              <button
                className="nav-account-toggle"
                type="button"
                aria-expanded={accountMenuOpen}
                aria-haspopup="true"
                onClick={() => setAccountMenuOpen((open) => !open)}
              >
                Hi, {user?.name?.split(" ")[0] || "Creator"}
                <ChevronDown size={15} />
              </button>
              {accountMenuOpen && (
                <div className="nav-account-dropdown" role="menu">
                  <Link
                    to="/profile"
                    role="menuitem"
                    onClick={closeAccountMenu}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    role="menuitem"
                    onClick={closeAccountMenu}
                  >
                    Settings
                  </Link>
                </div>
              )}
            </div>
            <button
              className="nav-button is-quiet"
              type="button"
              onClick={handleLogout}
            >
              <LogOut size={15} /> Log out
            </button>
          </>
        ) : (
          <>
            <Link
              className="nav-button is-quiet"
              to="/login"
              onClick={closeMenu}
            >
              Log in
            </Link>
            <Link
              className="nav-button is-strong"
              to="/register"
              onClick={closeMenu}
            >
              Register <ArrowRight size={15} />
            </Link>
          </>
        )}
      </div>
      <button
        className="mobile-menu-button"
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={19} /> : <Menu size={19} />}
      </button>
    </header>
  );
}

export default Navbar;
