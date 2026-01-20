import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function SocialCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        const userId = searchParams.get("user_id");

        if (token && userId) {
            // Reconstituer l'objet user
            const user = {
                id: userId,
                email: searchParams.get("email"),
                first_name: searchParams.get("first_name"),
                last_name: searchParams.get("last_name"),
                username: searchParams.get("username"),
                role: searchParams.get("role") || "client",
                access_dashboard: searchParams.get("access_dashboard") === 'true',
                access_control_center: searchParams.get("access_control_center") === 'true',
            };

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            // Rediriger vers le dashboard ou l'accueil selon permissions
            if (user.access_dashboard) {
                navigate("/dashboard");
            } else {
                navigate("/");
            }
        } else {
            console.error("Missing token or userId in social callback");
            // En cas d'erreur, rediriger vers login
            navigate("/connexion");
        }
    }, [searchParams, navigate]);

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontSize: "1.2rem"
        }}>
            Traitement de la connexion...
        </div>
    );
}

export default SocialCallback;
