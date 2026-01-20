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

function App() {
  return (
    <>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<Home />} />

        {/* Login page */}
        <Route path="/connexion" element={<Login />} />
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
        {/* Profile page */}
        <Route path="/profile" element={<Profile />} />

        {/* Hotel Details page */}
        <Route path="/hotel/:id" element={<HotelDetails />} />

        {/* Room Details page */}
        <Route path="/room/:id" element={<RoomDetails />} />
      </Routes>
    </>
  );
}

export default App;
