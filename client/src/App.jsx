import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateProfile from "./pages/CreateProfile.jsx";
import Creators from "./pages/Creators.jsx";
import CreatorDetails from "./pages/CreatorDetails.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Shortlist from "./pages/Shortlist.jsx";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/creators" element={<Creators />} />
            <Route path="/creators/:id" element={<CreatorDetails />} />
            <Route path="/shortlist" element={<Shortlist />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/create"
              element={
                <ProtectedRoute>
                  <CreateProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit/:id"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
