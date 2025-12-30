import '../styles/pages/verification.css'
import logo from '../assets/logos/logo.png'

function VerificationPage() {
    return (
        <div className="body">
            <div className='verification-container'>
                <img src={logo} alt="logo" className='logo' />
                <p className='verification-title'>Code de verification</p>
                <div className="verification-message">
                    <p className='verification-subtitle'>Veuillez saisir le code envoyer a </p>
                    <span className='verification-email'>e**@example.com</span>
                </div>
                <div className='verification-div'>
                    <div className="otp-inputs">
                        <input type="number" className="otp-input" maxLength="1" />
                        <input type="number" className="otp-input" maxLength="1" />
                        <input type="number" className="otp-input" maxLength="1" />
                        <input type="number" className="otp-input" maxLength="1" />
                    </div>
                    <span name='continuer' id='continue'>Continuer</span>
                </div>
                <p className='renvoyer-code'>Renvoyer le code</p>
            </div>
        </div>
    )
}
export default VerificationPage;