import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import VerificationPage from "./pages/EmailVerification";
import Register from "./pages/Register";

function App() {
  return (
    <>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<h1>Bienvenu a Hotely!</h1>} />

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
