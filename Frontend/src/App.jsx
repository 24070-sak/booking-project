import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import VerificationPage from "./pages/EmailVerification";
import Register from "./pages/Register";
import Home from "./pages/Home";
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
      </Routes>
    </>
  );
}

export default App;
