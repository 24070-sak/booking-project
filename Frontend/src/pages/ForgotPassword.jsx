import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { forgotPassword } from "../services/authService";
import logo from '../assets/logos/logo.svg';
import '../styles/pages/login.css';

function ForgotPassword() {
    const { t } = useLanguage();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    // Send reset link to email
    const handleSendLink = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email) {
            setError("Veuillez entrer une adresse email.");
            return;
        }

        setLoading(true);
        try {
            await forgotPassword(email);
            setSuccess("Un code de réinitialisation a été envoyé ! Veuillez vérifier vos emails.");
            setTimeout(() => {
                navigate(`/reset-password?email=${encodeURIComponent(email)}`);
            }, 2000);
        } catch (err) {
            setError(err.message || "Erreur lors de l'envoi de l'email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="body">
            <div className="login-container">
                <div className="login-header">
                    <img className="logo" src={logo} alt="logo" />
                    <h2 className="login-subtitle">
                        Mot de passe oublié
                    </h2>
                </div>

                <form className="login-form" onSubmit={handleSendLink}>
                    <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '14px', marginTop: '-10px', marginBottom: '20px' }}>
                        Entrez votre adresse email pour recevoir un code à 6 chiffres permettant de réinitialiser votre mot de passe.
                    </p>

                    {success && (
                        <div style={{ color: '#059669', backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '8px', border: '1px solid #a7f3d0', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
                            {success}
                        </div>
                    )}

                    {error && (
                        <div style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {!success && (
                        <>
                            <div>
                                <label className="form-label" htmlFor="email">Email</label>
                                <div className="input-container">
                                    <i className="fa-solid fa-envelope"></i>
                                    <input
                                        id="email"
                                        type="email"
                                        className="form-input"
                                        placeholder="Votre adresse email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="login-button" disabled={loading}>
                                {loading ? "Envoi en cours..." : "Envoyer le code"}
                            </button>
                        </>
                    )}

                    <p id="note" style={{ marginTop: '20px', textAlign: 'center' }}>
                        <span id="createAccount">
                            <Link to="/connexion">⬅ Retour à la connexion</Link>
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;
