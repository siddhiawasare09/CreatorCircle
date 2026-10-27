import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LazyMotion, MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import CreateProfile from "./pages/CreateProfile.jsx";
import Creators from "./pages/Creators.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Shortlist from "./pages/Shortlist.jsx";
import MyInquiries from "./pages/MyInquiries.jsx";
import Campaigns from "./pages/Campaigns.jsx";
import BrandCampaigns from "./pages/BrandCampaigns.jsx";
import ProfileSettingsPage from "./pages/ProfileSettingsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import AiAssistantWidget from "./components/AiAssistantWidget.jsx";
import ThemeSync from "./components/ThemeSync.jsx";
import "./App.css";

const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const CreatorDetails = lazy(() => import("./pages/CreatorDetails.jsx"));
const loadMotionFeatures = () =>
  import("framer-motion").then(({ domMax }) => domMax);

function App() {
  return (
    <BrowserRouter>
      <LazyMotion features={loadMotionFeatures}>
        <MotionConfig reducedMotion="user">
          <div className="app-shell">
            <Toaster position="top-right" richColors closeButton />
            <Navbar />
            <AiAssistantWidget />
            <ThemeSync />
            <main className="main-content">
              <Suspense
                fallback={
                  <div className="route-loading" role="status">
                    Loading page…
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                  />
                  <Route
                    path="/reset-password/:token"
                    element={<ResetPassword />}
                  />
                  <Route path="/creators" element={<Creators />} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route
                    path="/brand/campaigns"
                    element={
                      <ProtectedRoute redirectAdmins>
                        <BrandCampaigns />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/creators/:id"
                    element={<CreatorDetails />}
                  />
                  <Route path="/shortlist" element={<Shortlist />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfileSettingsPage key="profile" initialTab="profile" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inquiries"
                    element={
                      <ProtectedRoute>
                        <MyInquiries />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute redirectAdmins>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/creator-dashboard"
                    element={
                      <ProtectedRoute redirectAdmins>
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
              </Suspense>
            </main>
          </div>
        </MotionConfig>
      </LazyMotion>
    </BrowserRouter>
  );
}

export default App;
