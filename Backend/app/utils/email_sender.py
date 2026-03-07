from flask_mail import Message
from app.extensions import mail

def send_otp_email(to_email, otp_code, subject="Code de vérification"):
    """Envoie un code OTP par email."""
    try:
        msg = Message(
            subject=subject,
            recipients=[to_email],
            html=f"""
            <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f0f7f2; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 28px;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #006233, #00843d); border-radius: 12px; padding: 14px 28px;">
                        <span style="color: white; font-size: 22px; font-weight: 800; letter-spacing: 1px;">STAYIN</span>
                    </div>
                </div>
                <div style="background: white; border-radius: 12px; padding: 32px; border-top: 4px solid #006233; box-shadow: 0 4px 20px rgba(0,98,51,0.1);">
                    <h2 style="color: #003d20; font-size: 22px; font-weight: 700; margin: 0 0 12px 0; text-align: center;">{subject}</h2>
                    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 28px; text-align: center;">
                        Voici votre code de vérification. Il expire dans <strong>15 minutes</strong>.
                    </p>
                    <div style="text-align: center; margin: 24px 0;">
                        <span style="display: inline-block; font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #006233; background: #f0fdf4; padding: 20px 32px; border-radius: 12px; border: 2px dashed rgba(0,98,51,0.3);">
                            {otp_code}
                        </span>
                    </div>
                    <p style="color: #64748b; font-size: 13px; text-align: center; margin-top: 24px;">
                        Si vous n'avez pas demandé ce code, ignorez cet email.
                    </p>
                </div>
            </div>
            """
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email to {to_email}: {e}")
        return False
