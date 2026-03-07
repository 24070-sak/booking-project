from flask_mail import Message
from app.extensions import mail
import os


def _base_email_html(title, icon, icon_color, body_html, button_href, button_label, link_label="Ou copiez ce lien"):
    """Template HTML de base pour tous les emails transactionnels."""
    return f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>{title}</title>
    </head>
    <body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.10);">

              <!-- Header / Logo -->
              <tr>
                <td style="background:linear-gradient(135deg,#004d27,#00843d);padding:28px 32px;text-align:center;">
                  <span style="color:#ffffff;font-size:26px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">STAYIN</span>
                  <br/>
                  <span style="color:rgba(255,255,255,0.7);font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-top:4px;display:block;">Réservation d'hôtels</span>
                </td>
              </tr>

              <!-- Icon + Title -->
              <tr>
                <td style="padding:36px 40px 0;text-align:center;">
                  <div style="width:72px;height:72px;border-radius:50%;background:{icon_color};margin:0 auto 18px;display:flex;align-items:center;justify-content:center;font-size:32px;line-height:72px;">
                    {icon}
                  </div>
                  <h1 style="color:#1a2e1f;font-size:22px;font-weight:700;margin:0 0 8px;">{title}</h1>
                  <div style="width:48px;height:3px;background:linear-gradient(90deg,#006233,#00b359);border-radius:2px;margin:0 auto 24px;"></div>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:0 40px 28px;color:#374151;font-size:15px;line-height:1.7;text-align:center;">
                  {body_html}
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td style="padding:0 40px 24px;text-align:center;">
                  <a href="{button_href}"
                     style="display:inline-block;background:linear-gradient(135deg,#006233,#00843d);color:#ffffff;font-size:16px;font-weight:700;padding:15px 40px;border-radius:10px;text-decoration:none;letter-spacing:0.5px;box-shadow:0 6px 18px rgba(0,98,51,0.25);">
                    {button_label}
                  </a>
                </td>
              </tr>

              <!-- Raw link fallback -->
              <tr>
                <td style="padding:0 40px 28px;text-align:center;">
                  <p style="color:#94a3b8;font-size:12px;margin:0 0 6px;">{link_label} :</p>
                  <a href="{button_href}" style="color:#006233;font-size:12px;word-break:break-all;">{button_href}</a>
                </td>
              </tr>

              <!-- Expire notice -->
              <tr>
                <td style="padding:0 40px 20px;text-align:center;">
                  <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:8px;padding:10px 16px;display:inline-block;">
                    <span style="color:#92400e;font-size:12px;font-weight:600;">⏱ Ce lien expire dans <strong>15 minutes</strong></span>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                  <p style="color:#94a3b8;font-size:12px;margin:0;">
                    Si vous n'avez pas effectué cette action, ignorez cet email en toute sécurité.
                  </p>
                  <p style="color:#cbd5e1;font-size:11px;margin:8px 0 0;">
                    © 2025 Stayin · Tous droits réservés
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """


def send_verification_email(to_email: str, verification_link: str):
    """Envoie un lien de vérification d'adresse email."""
    subject = "Vérifiez votre adresse email — Stayin"

    print(f"\n╔══════════════════════════════════════════════════════════╗")
    print(f"║  📧 EMAIL VÉRIFICATION → {to_email}")
    print(f"║  🔗 {verification_link}")
    print(f"╚══════════════════════════════════════════════════════════╝\n")

    body_html = """
        <p>Merci de vous être inscrit sur <strong>Stayin</strong> !</p>
        <p>Cliquez sur le bouton ci-dessous pour vérifier votre adresse email et activer votre compte.</p>
    """
    html = _base_email_html(
        title="Vérification de votre email",
        icon="✉️",
        icon_color="#ecfdf5",
        body_html=body_html,
        button_href=verification_link,
        button_label="Vérifier mon email",
        link_label="Ou copiez ce lien"
    )

    return _send_mail(to_email, subject, html)


def send_password_reset_email(to_email: str, reset_link: str):
    """Envoie un lien de réinitialisation de mot de passe."""
    subject = "Réinitialisation de votre mot de passe — Stayin"

    print(f"\n╔══════════════════════════════════════════════════════════╗")
    print(f"║  🔐 EMAIL RESET MDP → {to_email}")
    print(f"║  🔗 {reset_link}")
    print(f"╚══════════════════════════════════════════════════════════╝\n")

    body_html = """
        <p>Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte <strong>Stayin</strong>.</p>
        <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.</p>
    """
    html = _base_email_html(
        title="Réinitialisation du mot de passe",
        icon="🔐",
        icon_color="#fef3c7",
        body_html=body_html,
        button_href=reset_link,
        button_label="Réinitialiser mon mot de passe",
        link_label="Ou copiez ce lien"
    )

    return _send_mail(to_email, subject, html)


def send_verification_link_email(to_email: str, verification_link: str, subject: str = "Vérification de votre compte"):
    """
    Fonction de compatibilité (ancienne signature).
    Redirige vers la bonne fonction selon le sujet.
    """
    if "passe" in subject.lower() or "reset" in subject.lower() or "réinitialisation" in subject.lower():
        return send_password_reset_email(to_email, verification_link)
    return send_verification_email(to_email, verification_link)


def _send_mail(to_email: str, subject: str, html: str) -> bool:
    """Envoie l'email via Flask-Mail, ou affiche un avertissement si non configuré."""
    mail_username = os.environ.get('MAIL_USERNAME')
    mail_password = os.environ.get('MAIL_PASSWORD')

    if not mail_username or not mail_password:
        print("[EMAIL] ⚠️  MAIL_USERNAME ou MAIL_PASSWORD non configuré.")
        print("[EMAIL] ℹ️  Le lien est affiché dans les logs ci-dessus.")
        return False

    try:
        msg = Message(subject=subject, recipients=[to_email], html=html)
        mail.send(msg)
        print(f"[EMAIL] ✅ Email envoyé avec succès à {to_email}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] ❌ Échec de l'envoi à {to_email}: {e}")
        return False
