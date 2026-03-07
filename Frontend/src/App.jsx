import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
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

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<Home />} />

        {/* Login page */}
        <Route path="/connexion" element={<Login />} />
        {/* Forgot password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Verification page */}
        <Route path="/verification" element={<VerificationPage />} />
        {/* Register page */}
        <Route path="/inscription" element={<Register />} />
        {/* Social Callback page */}
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
