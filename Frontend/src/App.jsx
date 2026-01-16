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
        {/* Dashboard page */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Settings page */}
        <Route path="/parametre" element={<Settings />} />

        {/* Hotel Details page */}
        <Route path="/hotel/:id" element={<HotelDetails />} />

        {/* Room Details page */}
        <Route path="/room/:id" element={<RoomDetails />} />
      </Routes>
    </>
  );
}

export default App;
