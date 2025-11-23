import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

function App() {
  return (
    <>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<h1>Bienvenu a Hotely!</h1>} />

        {/* Login page */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
