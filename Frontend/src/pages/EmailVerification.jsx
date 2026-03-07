import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyEmail, sendVerificationOtp } from '../services/authService';
import '../styles/pages/verification.css';
import logo from '../assets/logos/logo.svg';

function VerificationPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Lire le token et l'email depuis les query params
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const email = queryParams.get('email');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(!!token); // si token présent → auto-vérification
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState('');
    const [countdown, setCountdown] = useState(0);

    // ─── Auto-vérification si token présent dans l'URL ───────────────────────
    useEffect(() => {
        if (!token) {
            // Pas de token → afficher la page "vérifiez votre email" avec bouton renvoyer
            setVerifying(false);
            return;
        }

        if (!email) {
            setError('Lien de vérification invalide ou incomplet.');
            setVerifying(false);
            return;
        }

        const verifyAccount = async () => {
            setLoading(true);
            try {
                await verifyEmail(email, token);
                setSuccess('Email vérifié avec succès ! Redirection vers la connexion...');
                setTimeout(() => navigate('/connexion'), 3000);
            } catch (err) {
                setError(err.message || 'Lien invalide ou expiré. Veuillez demander un nouveau lien.');
            } finally {
                setLoading(false);
                setVerifying(false);
            }
        };

        verifyAccount();
    }, [token, email, navigate]);

    // ─── Countdown pour renvoyer ──────────────────────────────────────────────
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // ─── Renvoyer le lien de vérification ────────────────────────────────────
    const handleResend = async () => {
        if (!email) {
            setError("Adresse email inconnue. Veuillez vous réinscrire.");
            return;
        }
        setResendLoading(true);
        setResendSuccess('');
        setError('');
        try {
            await sendVerificationOtp(email);
            setResendSuccess(`Un nouveau lien a été envoyé à ${email}.`);
            setCountdown(60); // attendre 60s avant de renvoyer
        } catch (err) {
            setError(err.message || "Erreur lors de l'envoi du lien.");
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="body">
            <div className='verification-container' style={{ padding: '40px' }}>
                <img src={logo} alt="logo" className='logo' style={{ marginBottom: '20px' }} />
                <p className='verification-title'>Vérification de compte</p>

                {/* ── Auto-vérification en cours ── */}
                {verifying && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <div className="spinner" style={{
                            margin: '0 auto',
                            width: '48px',
                            height: '48px',
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #006233',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <p style={{ marginTop: '15px', color: '#666', fontSize: '15px' }}>
                            Vérification de votre lien en cours...
                        </p>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                )}

                {/* ── Résultats ── */}
                {!verifying && (
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>

                        {/* Succès */}
                        {success && (
                            <div style={{
                                color: '#059669',
                                backgroundColor: '#ecfdf5',
                                padding: '20px',
                                borderRadius: '12px',
                                border: '1px solid #a7f3d0',
                                marginBottom: '20px'
                            }}>
                                <i className="fa-solid fa-circle-check" style={{ fontSize: '36px', marginBottom: '12px', display: 'block' }} />
                                <div style={{ fontSize: '15px', fontWeight: 500 }}>{success}</div>
                            </div>
                        )}

                        {/* Erreur */}
                        {error && (
                            <div style={{
                                color: '#dc2626',
                                backgroundColor: '#fef2f2',
                                padding: '20px',
                                borderRadius: '12px',
                                border: '1px solid #fecaca',
                                marginBottom: '20px'
                            }}>
                                <i className="fa-solid fa-circle-xmark" style={{ fontSize: '36px', marginBottom: '12px', display: 'block' }} />
                                <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '12px' }}>{error}</div>
                            </div>
                        )}

                        {/* Page "Vérifiez vos emails" — quand pas de token ou après erreur */}
                        {!success && (
                            <div style={{
                                backgroundColor: '#f0f9ff',
                                border: '1px solid #bae6fd',
                                borderRadius: '12px',
                                padding: '24px',
                                marginBottom: '20px'
                            }}>
                                <i className="fa-solid fa-envelope-open-text" style={{ fontSize: '40px', color: '#0284c7', marginBottom: '14px', display: 'block' }} />
                                <p style={{ color: '#0369a1', fontSize: '15px', fontWeight: 500, margin: '0 0 8px 0' }}>
                                    Un lien de vérification a été envoyé
                                </p>
                                {email && (
                                    <p style={{ color: '#0369a1', fontSize: '13px', margin: '0 0 16px 0' }}>
                                        à <strong>{email}</strong>
                                    </p>
                                )}
                                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px 0' }}>
                                    Cliquez sur le lien dans l'email pour activer votre compte.<br />
                                    Le lien expire dans <strong>15 minutes</strong>.
                                </p>

                                {/* Bouton Renvoyer */}
                                {resendSuccess && (
                                    <div style={{
                                        color: '#059669',
                                        backgroundColor: '#ecfdf5',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #a7f3d0',
                                        fontSize: '13px',
                                        marginBottom: '14px'
                                    }}>
                                        {resendSuccess}
                                    </div>
                                )}

                                <button
                                    onClick={handleResend}
                                    disabled={resendLoading || countdown > 0}
                                    style={{
                                        padding: '10px 22px',
                                        backgroundColor: countdown > 0 ? '#94a3b8' : '#006233',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    {resendLoading
                                        ? 'Envoi...'
                                        : countdown > 0
                                            ? `Renvoyer dans ${countdown}s`
                                            : '🔁 Renvoyer le lien'}
                                </button>
                            </div>
                        )}

                        <Link to="/connexion" style={{
                            color: '#006233',
                            fontSize: '14px',
                            textDecoration: 'none',
                            fontWeight: 500
                        }}>
                            ⬅ Retour à la connexion
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerificationPage;
