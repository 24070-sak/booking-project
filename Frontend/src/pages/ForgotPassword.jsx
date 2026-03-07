import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../services/authService";
import logo from '../assets/logos/logo.svg';
import '../styles/pages/verification.css';

function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

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

        if (value !== "" && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

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
            <div className="verification-container" style={{ width: '480px' }}>
                <img src={logo} alt="logo" className="logo" style={{ marginBottom: '10px' }} />
                
                {step === 1 && (
                    <form className="verification-div" onSubmit={handleSendCode}>
                        <h2 className="verification-title">Mot de passe oublié</h2>
                        <p style={{ textAlign: 'center', color: '#4b5563', padding: '0 20px', marginBottom: '10px' }}>
                            Entrez votre adresse email pour recevoir un code de réinitialisation.
                        </p>
                        
                        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
                        
                        <input
                            type="email"
                            className="form-input"
                            placeholder="Votre email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', marginBottom: '15px' }}
                        />
                        
                        <button type="submit" id="continue" disabled={loading}>
                            {loading ? "Envoi..." : "Envoyer le code"}
                        </button>
                        
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <Link to="/connexion" style={{ color: '#006233', textDecoration: 'none', fontWeight: 600 }}>Retour à la connexion</Link>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form className="verification-div" onSubmit={handleReset}>
                        <h2 className="verification-title">Nouveau mot de passe</h2>
                        
                        {success && <div style={{ color: 'green', textAlign: 'center' }}>{success}</div>}
                        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

                        <p style={{ textAlign: 'center', color: '#4b5563', marginBottom: '20px' }}>
                            Entrez le code à 6 chiffres envoyé à <strong>{email}</strong>
                        </p>

                        <div className="otp-inputs" style={{ marginBottom: '20px' }}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    id={`otp-${i}`}
                                    type="number"
                                    className="otp-input"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    style={{ width: '45px', height: '50px' }}
                                />
                            ))}
                        </div>

                        <div style={{ width: '100%', marginBottom: '15px' }}>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Nouveau mot de passe"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                                Min 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial.
                            </p>
                        </div>
                        
                        <div style={{ width: '100%', marginBottom: '20px' }}>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Confirmer le mot de passe"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" id="continue" disabled={loading}>
                            {loading ? "Chargement..." : "Réinitialiser"}
                        </button>

                        <p className="renvoyer-code" onClick={handleSendCode} style={{ marginTop: '20px', fontSize: '15px' }}>
                            Renvoyer le code
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;
