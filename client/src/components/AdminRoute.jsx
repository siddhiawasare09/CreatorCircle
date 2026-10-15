import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

function AdminRoute({ children }) {
  const { token, user } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;
