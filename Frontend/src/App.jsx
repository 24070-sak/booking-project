import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import VerificationPage from "./pages/EmailVerification";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
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
      </Routes>
    </>
  );
}

export default App;
