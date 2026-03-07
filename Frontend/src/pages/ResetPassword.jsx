import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { auth } from "../services/firebase";
import { confirmPasswordReset } from "firebase/auth";
import "../styles/pages/login.css";
import logo from "../assets/logos/logo.svg";

function ResetPassword() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Firebase envoie un oobCode pour la réinitialisation du mot de passe
    const oobCode = searchParams.get("oobCode");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [linkValid, setLinkValid] = useState(true);

    useEffect(() => {
        // Validation basique: vérifier si le oobCode existe
        if (!oobCode) {
            setLinkValid(false);
            setError("Le lien de réinitialisation est invalide ou a expiré.");
        }
    }, [oobCode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }
        if (password !== confirmPassword) {
            setError(t("password_mismatch") || "Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);
        try {
            await confirmPasswordReset(auth, oobCode, password);
            setMessage(t("password_changed_success") || "Mot de passe modifié avec succès !");
            setTimeout(() => navigate("/connexion"), 3000);
        } catch (err) {
            // Identifier l'erreur Firebase: expiré, etc.
            if (err.code === "auth/expired-action-code" || err.code === "auth/invalid-action-code") {
                setError("Le lien est invalide ou a expiré. Veuillez demander un nouveau lien.");
                setLinkValid(false);
            } else {
                setError(err.message || "Une erreur est survenue lors de la réinitialisation.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!linkValid && !message && !error) {
        // Rendu en cas de lien initialement invalide sans même soumettre
    }

    return (
        <div className="body">
            <div className="login-container">
                <div className="login-header">
                    <img className="logo" src={logo} alt="logo" />
                    <h2 className="login-subtitle">Nouveau mot de passe</h2>
                </div>

                {error && <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "12px", borderRadius: "8px", border: "1px solid #fecaca", textAlign: "center", marginBottom: "20px", fontSize: "14px" }}>{error}</div>}
                {message && (
                    <div style={{ color: "green", textAlign: "center", marginBottom: "20px", padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: "1px solid #a7f3d0", fontSize: "14px" }}>
                        {message}
                        <br />
                        <span style={{ fontSize: "0.85rem", color: "#065f46" }}>Redirection vers la connexion...</span>
                    </div>
                )}

                {linkValid && !message && (
                    <form className="login-form" onSubmit={handleSubmit}>
                        <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '14px', marginTop: '-10px', marginBottom: '20px' }}>
                            Veuillez entrer votre nouveau mot de passe.
                        </p>

                        {/* Nouveau mot de passe */}
                        <div>
                            <label className="form-label" htmlFor="password">Nouveau mot de passe</label>
                            <div className="input-container">
                                <i className="fa-solid fa-lock"></i>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="form-input"
                                    placeholder="Nouveau mot de passe"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <i
                                    className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} toggle-password`}
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ cursor: "pointer" }}
                                ></i>
                            </div>
                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>Min 8 car., 1 majuscule, 1 chiffre, 1 car. spécial</p>
                        </div>

                        {/* Confirmer mot de passe */}
                        <div>
                            <label className="form-label" htmlFor="confirmPassword">Confirmer le mot de passe</label>
                            <div className="input-container">
                                <i className="fa-solid fa-lock"></i>
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="form-input"
                                    placeholder="Confirmer le mot de passe"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <i
                                    className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} toggle-password`}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{ cursor: "pointer" }}
                                ></i>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            style={{ marginTop: "20px" }}
                            disabled={loading}
                        >
                            {loading ? "Enregistrement..." : "Enregistrer le mot de passe"}
                        </button>
                    </form>
                )}

                {!linkValid && !message && (
                    <div style={{ textAlign: "center", marginTop: "10px" }}>
                        <Link to="/mot-de-passe-oublie">
                            <button className="login-button" style={{ marginTop: "10px" }}>
                                Demander un nouveau lien
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;
