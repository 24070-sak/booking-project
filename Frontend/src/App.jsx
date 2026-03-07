import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import VerificationPage from "./pages/EmailVerification";
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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<Home />} />

        {/* Login page */}
        <Route path="/connexion" element={<Login />} />
        {/* Forgot Password page */}
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        {/* Reset Password Handle URL */}
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Verification page */}
        <Route path="/verification" element={<VerificationPage />} />
        {/* Register page */}
        <Route path="/inscription" element={<Register />} />
        {/* Social Callback page */}
        <Route path="/social-callback" element={<SocialCallback />} />
        {/* Dashboard page */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Control Center page */}
        <Route path="/control-center" element={<ControlCenter />} />
        {/* Settings page */}
        <Route path="/parametre" element={<Settings />} />
        {/* Settings page */}
        <Route path="/parametre" element={<Settings />} />
        {/* Profile page */}
        <Route path="/profile" element={<Profile />} />
        {/* Messages page */}
        <Route path="/messages" element={<Messages />} />

        {/* Hotel Details page */}
        <Route path="/hotel/:id" element={<HotelDetails />} />

        {/* Payment page */}
        <Route path="/payment/:bookingId" element={<Payment />} />

        {/* Room Details page */}
        <Route path="/room/:id" element={<RoomDetails />} />

        {/* Notifications page */}
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </>
  );
}

export default App;
