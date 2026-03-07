import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import VerificationPage from "./pages/EmailVerification";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import HotelDetails from "./pages/HotelDetails";
import RoomDetails from "./pages/RoomDetails";
import SocialCallback from "./pages/SocialCallback";
import ControlCenter from "./pages/ControlCenter";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Payment from "./pages/Payment";
import Notifications from "./pages/Notifications";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<Home />} />

        {/* Auth pages */}
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Register />} />
        <Route path="/verification" element={<VerificationPage />} />

        {/* Password reset — both routes for compatibility */}
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Social OAuth callback */}
        <Route path="/social-callback" element={<SocialCallback />} />

        {/* Protected Dashboard page (Admin) */}
        <Route path="/dashboard" element={
          <ProtectedRoute requireDashboard={true}>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Protected Control Center page (Super Admin) */}
        <Route path="/control-center" element={
          <ProtectedRoute requireControlCenter={true}>
            <ControlCenter />
          </ProtectedRoute>
        } />

        {/* App pages */}
        <Route path="/parametre" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Hotel & Room pages */}
        <Route path="/hotel/:id" element={<HotelDetails />} />
        <Route path="/room/:id" element={<RoomDetails />} />

        {/* Payment page */}
        <Route path="/payment/:bookingId" element={<Payment />} />
      </Routes>
    </>
  );
}

export default App;
