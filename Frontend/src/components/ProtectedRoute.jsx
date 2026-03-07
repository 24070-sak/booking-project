import { Navigate } from "react-router-dom";

// Component to protect routes based on user roles
const ProtectedRoute = ({ children, requireDashboard = false, requireControlCenter = false }) => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    // If not logged in, redirect to login
    if (!token || !userStr) {
        return <Navigate to="/connexion" replace />;
    }

    try {
        const user = JSON.parse(userStr);

        // Check Control Center access (Super Admin only)
        if (requireControlCenter && !user.access_control_center) {
            return <Navigate to="/" replace />;
        }

        // Check Dashboard access (Super Admin or Full Admin)
        if (requireDashboard && !user.access_dashboard) {
            return <Navigate to="/" replace />;
        }

        // Passes all checks
        return children;

    } catch (e) {
        // Handle JSON parse error or malformed local storage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return <Navigate to="/connexion" replace />;
    }
};

export default ProtectedRoute;
