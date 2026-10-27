import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

function ProtectedRoute({ children, redirectAdmins = false }) {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (redirectAdmins && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default ProtectedRoute;
