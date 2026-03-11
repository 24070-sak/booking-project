import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyEmail, sendVerificationOtp } from '../services/authService';
import '../styles/pages/verification.css';
import logo from '../assets/logos/logo.svg';

function VerificationPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Lire l'email depuis les query params
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState('');
    const [countdown, setCountdown] = useState(0);

    // ─── Countdown pour renvoyer ──────────────────────────────────────────────
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // ─── Soumettre le code ───────────────────────────────────────────────────
    const handleVerify = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Adresse email inconnue. Veuillez vous réinscrire.');
            return;
        }
        if (!code) {
            setError('Veuillez entrer le code de vérification.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await verifyEmail(email, code);
            setSuccess('Email vérifié avec succès ! Redirection vers la connexion...');
            setTimeout(() => navigate('/connexion'), 3000);
        } catch (err) {
            setError(err.message || 'Code invalide ou expiré. Veuillez demander un nouveau code.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Renvoyer le code de vérification ────────────────────────────────────
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
            setResendSuccess(`Un nouveau code a été envoyé à ${email}.`);
            setCountdown(60); // attendre 60s avant de renvoyer
        } catch (err) {
            setError(err.message || "Erreur lors de l'envoi du code.");
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="body">
            <div className='verification-container' style={{ padding: '40px', maxWidth: '450px', width: '100%', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center' }}>
                    <img src={logo} alt="logo" className='logo' style={{ marginBottom: '20px', width: '120px' }} />
                    <h2 style={{ color: '#1a2e1f', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Vérification de compte</h2>
                </div>

                {/* ── Résultats ── */}
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
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #fecaca',
                            marginBottom: '20px',
                            fontSize: '14px',
                            fontWeight: 500
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Renvoyer success */}
                    {resendSuccess && (
                        <div style={{
                            color: '#059669',
                            backgroundColor: '#ecfdf5',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #a7f3d0',
                            fontSize: '13px',
                            marginBottom: '20px'
                        }}>
                            {resendSuccess}
                        </div>
                    )}

                    {!success && (
                        <>
                            <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '24px' }}>
                                Nous avons envoyé un code de vérification
                                {email && <span> à <strong>{email}</strong></span>}.<br />
                                Veuillez l'entrer ci-dessous.
                            </p>

                            <form onSubmit={handleVerify} style={{ textAlign: 'left' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1a2e1f', marginBottom: '8px' }}>
                                        Code de vérification
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 16px' }}>
                                        <i className="fa-solid fa-key" style={{ color: '#9ca3af', marginRight: '12px' }}></i>
                                        <input
                                            type="text"
                                            placeholder="Ex: 123456"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            maxLength={6}
                                            required
                                            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '16px', letterSpacing: '4px', fontWeight: 'bold' }}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        backgroundColor: '#006233',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1,
                                        transition: 'background 0.2s',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                            Vérification en cours...
                                        </>
                                    ) : 'Vérifier mon compte'}
                                </button>
                            </form>

                            <div style={{
                                backgroundColor: '#f8fafc',
                                borderRadius: '12px',
                                padding: '16px',
                            }}>
                                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 12px 0' }}>
                                    Vous n'avez pas reçu le code ?
                                </p>
                                <button
                                    onClick={handleResend}
                                    disabled={resendLoading || countdown > 0}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: 'transparent',
                                        color: countdown > 0 ? '#94a3b8' : '#006233',
                                        border: `1px solid ${countdown > 0 ? '#cbd5e1' : '#006233'}`,
                                        borderRadius: '8px',
                                        cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {resendLoading
                                        ? 'Envoi...'
                                        : countdown > 0
                                            ? `Renvoyer dans ${countdown}s`
                                            : '🔁 Renvoyer le code'}
                                </button>
                            </div>
                        </>
                    )}

                    <div style={{ marginTop: '24px' }}>
                        <Link to="/connexion" style={{
                            color: '#006233',
                            fontSize: '14px',
                            textDecoration: 'none',
                            fontWeight: 500
                        }}>
                            ⬅ Retour à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerificationPage;
