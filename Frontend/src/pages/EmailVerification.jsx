import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyEmail, sendVerificationOtp } from '../services/authService';
import '../styles/pages/verification.css';
import logo from '../assets/logos/logo.svg';

function VerificationPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";
    
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    if (!email) {
        return (
            <div className="body">
                <div className='verification-container'>
                    <p style={{ textAlign: 'center', color: 'red' }}>Veuillez vous inscrire ou vous connecter d'abord.</p>
                </div>
            </div>
        );
    }

    const handleChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== "" && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleSubmit = async () => {
        const otpCode = otp.join("");
        if (otpCode.length < 6) {
            setError("Veuillez entrer les 6 chiffres.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            await verifyEmail(email, otpCode);
            setSuccess("Email vérifié avec succès ! Redirection...");
            setTimeout(() => navigate('/connexion'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setSuccess("");
        setError("");
        setLoading(true);
        try {
            await sendVerificationOtp(email);
            setSuccess("Un nouveau code a été envoyé !");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="body">
            <div className='verification-container'>
                <img src={logo} alt="logo" className='logo' />
                <p className='verification-title'>Vérification de l'email</p>

                <div className="verification-message">
                    <p className='verification-subtitle'>Veuillez saisir le code envoyé à</p>
                    <span className='verification-email' style={{ color: '#006233', fontWeight: 'bold' }}>{email}</span>
                </div>

                {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
                {success && <div style={{ color: 'green', textAlign: 'center' }}>{success}</div>}

                <div className='verification-div'>
                    <div className="otp-inputs">
                        {otp.map((digit, index) => (
                            <input 
                                key={index}
                                id={`otp-${index}`}
                                type="number" 
                                className="otp-input" 
                                maxLength="1" 
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                            />
                        ))}
                    </div>

                    <button 
                        id='continue' 
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{ border: 'none', cursor: 'pointer' }}
                    >
                        {loading ? 'Vérification...' : 'Continuer'}
                    </button>
                    
                    <p className='renvoyer-code' onClick={handleResend} style={{ fontSize: '16px', marginTop: '10px' }}>
                        Renvoyer le code
                    </p>
                </div>
            </div>
        </div>
    );
}

export default VerificationPage;