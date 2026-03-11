import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { resetPassword } from "../services/authService";
import "../styles/pages/login.css";
import logo from "../assets/logos/logo.svg";

function ResetPassword() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!email) {
            setError("Veuillez entrer votre email.");
            return;
        }
        if (!code) {
            setError("Veuillez entrer le code de vérification.");
            return;
        }
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
            await resetPassword(email, code, password);
            setMessage(t("password_changed_success") || "Mot de passe modifié avec succès !");
            setTimeout(() => navigate("/connexion"), 3000);
        } catch (err) {
            setError(err.message || "Le code est invalide ou a expiré. Veuillez demander un nouveau code.");
        } finally {
            setLoading(false);
        }
    };

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

                {!message && (
                    <form className="login-form" onSubmit={handleSubmit}>
                        <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '14px', marginTop: '-10px', marginBottom: '20px' }}>
                            Veuillez entrer le code reçu par email ainsi que votre nouveau mot de passe.
                        </p>

                        {!searchParams.get("email") && (
                            <div>
                                <label className="form-label" htmlFor="email">Email</label>
                                <div className="input-container">
                                    <i className="fa-solid fa-envelope"></i>
                                    <input
                                        id="email"
                                        type="email"
                                        className="form-input"
                                        placeholder="Votre email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Code OTP */}
                        <div>
                            <label className="form-label" htmlFor="code">Code de vérification (6 chiffres)</label>
                            <div className="input-container">
                                <i className="fa-solid fa-key"></i>
                                <input
                                    id="code"
                                    type="text"
                                    className="form-input"
                                    placeholder="Ex: 123456"
                                    name="code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    maxLength={6}
                                    style={{ letterSpacing: '2px', fontWeight: 'bold' }}
                                    required
                                />
                            </div>
                        </div>

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
                            style={{ marginTop: "20px", display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                    Enregistrement...
                                </>
                            ) : "Enregistrer le mot de passe"}
                        </button>

                        <div style={{ textAlign: "center", marginTop: "15px" }}>
                            <Link to="/mot-de-passe-oublie" style={{ color: "#006233", fontSize: "14px", textDecoration: "none", fontWeight: "500" }}>
                                Renvoyer le code
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;
