import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { confirmNewPassword } from "../services/authService";
import { useLanguage } from "../context/LanguageContext";
import "../styles/pages/login.css";
import logo from "../assets/logos/logo.svg";

function ResetPassword() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const oobCode = searchParams.get("oobCode");
    const mode = searchParams.get("mode");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [linkValid, setLinkValid] = useState(true);

    useEffect(() => {
        if (!oobCode || mode !== "resetPassword") {
            setLinkValid(false);
            setError("Le lien de réinitialisation est invalide ou a expiré.");
        }
    }, [oobCode, mode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }
        if (password !== confirmPassword) {
            setError(t("password_mismatch") || "Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);
        try {
            await confirmNewPassword(oobCode, password);
            setMessage(t("password_changed_success") || "Mot de passe modifié avec succès !");
            setTimeout(() => navigate("/connexion"), 3000);
        } catch (err) {
            setError(err.message || "Le lien est invalide ou a expiré.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="body">
            <div className="login-container">
                <div className="login-header">
                    <img className="logo" src={logo} alt="logo" />
                    <h2 className="login-subtitle">{t("new_password_title") || "Nouveau mot de passe"}</h2>
                </div>

                {error && <div style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>{error}</div>}
                {message && (
                    <div style={{ color: "green", textAlign: "center", marginBottom: "10px" }}>
                        {message}
                        <br />
                        <span style={{ fontSize: "0.85rem" }}>Redirection dans 3 secondes...</span>
                    </div>
                )}

                {linkValid && !message && (
                    <form className="login-form" onSubmit={handleSubmit}>

                        {/* Nouveau mot de passe */}
                        <div>
                            <label className="form-label" htmlFor="password">
                                {t("new_password_title") || "Nouveau mot de passe"}
                            </label>
                            <div className="input-container">
                                <i className="fa-solid fa-lock"></i>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="form-input"
                                    placeholder={t("new_password_placeholder") || "Entrez votre nouveau mot de passe"}
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <i
                                    className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} toggle-password`}
                                    onClick={() => setShowPassword(!showPassword)}
                                ></i>
                            </div>
                        </div>

                        {/* Confirmer mot de passe */}
                        <div>
                            <label className="form-label" htmlFor="confirmPassword">
                                {t("confirm_password") || "Confirmer le mot de passe"}
                            </label>
                            <div className="input-container">
                                <i className="fa-solid fa-lock"></i>
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="form-input"
                                    placeholder={t("confirm_password") || "Confirmer le mot de passe"}
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <i
                                    className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} toggle-password`}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                ></i>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            style={{ marginTop: "20px" }}
                            disabled={loading}
                        >
                            {loading ? (t("saving") || "Enregistrement...") : (t("save_password") || "Enregistrer")}
                        </button>
                    </form>
                )}

                {!linkValid && (
                    <div style={{ textAlign: "center" }}>
                        <Link to="/mot-de-passe-oublie">
                            <button className="login-button" style={{ marginTop: "10px" }}>
                                Demander un nouveau lien
                            </button>
                        </Link>
                    </div>
                )}

                <div className="line" style={{ marginTop: "30px" }}>
                    <hr />
                    <span>{t("or")}</span>
                    <hr />
                </div>

                <p id="note" style={{ marginTop: "20px" }}>
                    <span id="createAccount">
                        <Link to="/connexion">⬅ {t("back_to_login") || "Retour à la connexion"}</Link>
                    </span>
                </p>
            </div>
        </div>
    );
}

export default ResetPassword;
