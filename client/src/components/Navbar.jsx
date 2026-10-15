import { useState } from "react";
import { ArrowRight, LogOut, Menu, Users, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

function Navbar() {
  const { token, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

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
        <Link to="/creators" onClick={closeMenu}>
          Creators
        </Link>
        {token && (
          <Link to="/dashboard" onClick={closeMenu}>
            Dashboard
          </Link>
        )}
        {token && (
          <Link to="/shortlist" onClick={closeMenu}>
            My Shortlist
          </Link>
        )}
        {token && user?.role === "admin" && (
          <Link to="/admin" onClick={closeMenu}>
            Admin Dashboard
          </Link>
        )}
      </nav>
      <div className={`nav-actions${menuOpen ? " is-open" : ""}`}>
        {token ? (
          <>
            <Link className="nav-user" to="/dashboard" onClick={closeMenu}>
              Hi, {user?.name?.split(" ")[0] || "Creator"}
            </Link>
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
