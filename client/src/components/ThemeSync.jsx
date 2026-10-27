import { useEffect } from "react";
import { useAuth } from "../context/useAuth.js";
import api from "../services/api.js";

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
};

function ThemeSync() {
  const { token } = useAuth();

  useEffect(() => {
    const storedTheme = localStorage.getItem("creatorcircle_theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      applyTheme(storedTheme);
    }

    if (!token) return undefined;
    let active = true;
    api
      .get("/users/settings/preferences")
      .then((response) => {
        const theme = response.data.preferences?.theme;
        if (active && (theme === "light" || theme === "dark")) {
          localStorage.setItem("creatorcircle_theme", theme);
          applyTheme(theme);
        }
      })
      .catch(() => {
        if (active && storedTheme !== "light" && storedTheme !== "dark") {
          applyTheme("light");
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  return null;
}

export default ThemeSync;
