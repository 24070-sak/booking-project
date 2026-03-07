import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../services/authService";
import { useLanguage } from "../context/LanguageContext";
import logo from '../assets/logos/logo.svg';
import '../styles/pages/login.css';
import '../styles/pages/verification.css';

function ForgotPassword() {
    const { t } = useLanguage();
    const [step, setStep] = useState(1); // step 1 = email, step 2 = otp + new password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    // Step 1: Send OTP to email
    const handleSendCode = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await forgotPassword(email);
            setStep(2);
            setSuccess("Code envoyé (si l'email existe).");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        // Auto-focus next
        if (value !== "" && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    // Step 2: Verify OTP + Set new password
    const handleReset = async (e) => {
        e.preventDefault();
        setError("");

        const fullOtp = otp.join("");
        if (fullOtp.length < 6) {
            setError("Veuillez entrer les 6 chiffres du code.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email, fullOtp, newPassword);
            setSuccess("Mot de passe réinitialisé avec succès !");
            setTimeout(() => navigate('/connexion'), 2000);
        } catch (err) {
            setError(err.message);
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
                        {step === 1 ? "Mot de passe oublié" : "Réinitialiser le mot de passe"}
                    </h2>
                </div>

                {/* ── STEP 1: Email ── */}
                {step === 1 && (
                    <form className="login-form" onSubmit={handleSendCode}>
                        <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '14px', marginTop: '-10px' }}>
                            Entrez votre adresse email pour recevoir un code de réinitialisation.
                        </p>

                        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

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

                        <p id="note">
                            <span id="createAccount">
                                <Link to="/connexion">⬅ Retour à la connexion</Link>
                            </span>
                        </p>
                    </form>
                )}

                {/* ── STEP 2: OTP + New Password ── */}
                {step === 2 && (
                    <form className="login-form" onSubmit={handleReset}>
                        {success && <div style={{ color: 'green', textAlign: 'center', padding: '8px', background: '#f0fdf4', borderRadius: '8px' }}>{success}</div>}
                        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

                        <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '14px', marginTop: '-10px' }}>
                            Code envoyé à <strong>{email}</strong>
                        </p>

                        {/* OTP inputs */}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '4px 0' }}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    id={`otp-${i}`}
                                    type="number"
                                    inputMode="numeric"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    style={{
                                        width: '46px', height: '52px',
                                        textAlign: 'center', fontSize: '22px', fontWeight: '700',
                                        borderRadius: '10px', border: '2px solid rgba(0,98,51,0.2)',
                                        outline: 'none', color: '#003d20',
                                        transition: '0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#006233'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(0,98,51,0.2)'}
                                />
                            ))}
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="form-label" htmlFor="newPassword">Nouveau mot de passe</label>
                            <div className="input-container">
                                <i className="fa-solid fa-lock"></i>
                                <input
                                    id="newPassword"
                                    type="password"
                                    className="form-input"
                                    placeholder="Nouveau mot de passe"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px', textAlign: 'left' }}>
                                Min 8 car., 1 majuscule, 1 chiffre, 1 caractère spécial
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="form-label" htmlFor="confirmPassword">Confirmer le mot de passe</label>
                            <div className="input-container">
                                <i className="fa-solid fa-lock"></i>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className="form-input"
                                    placeholder="Confirmer le mot de passe"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? "Chargement..." : "Réinitialiser le mot de passe"}
                        </button>

                        <p id="note" style={{ cursor: 'pointer' }} onClick={handleSendCode}>
                            <span style={{ color: '#006233', fontWeight: 600, fontSize: '13.5px' }}>
                                🔄 Renvoyer le code
                            </span>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;
