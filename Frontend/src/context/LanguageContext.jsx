import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('fr'); // Default to French
    const currency = '€'; // Euro

    const toggleLanguage = () => {
        setLanguage((prevLang) => {
            const newLang = prevLang === 'fr' ? 'ar' : 'fr';
            document.documentElement.lang = newLang;
            document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
            return newLang;
        });
    };

    const translations = {
        fr: {
            // General
            home: "Accueil",
            dashboard: "Tableau de bord",
            messages: "Messages",
            settings: "Paramètres",
            login: "Se connecter",
            logout: "Se déconnecter",
            profile: "Profil",
            explore: "Explorez les hotels de Mauritanie",
            compare: "Nous comparons les prix des plusieurs hotels",
            search: "Rechercher",
            previous: "Voir précédent",
            more: "Voir plus",
            or: "ou",

            // Home
            home_offers_title: "Offres des hotels en ce moment",
            loading_offers: "Chargement des offres...",
            error_loading_hotels: "Impossible de charger les hôtels.",
            price_unavailable: "Prix indisponible",
            from: "dès",
            available: "Disponible",
            full: "Complet",
            save_big: "Economisez gros",
            save_big_desc: "Economisez gros sur vos reservations Proftez des meilleures offres des maintenant!",
            reliable_service: "Fiable service",
            reliable_service_desc: "Profitez d’un service fiable à chaque réservation Votre confiance est notre priorité",
            simple_search: "Simple Recherche",
            simple_search_desc: "Recherche simple et intuitive pour trouver votre hotel parfait",

            // Footer
            footer_desc: "Découvrez les meilleurs hôtels de Mauritanie. Réservation simple, rapide et sécurisée.",
            navigation: "Navigation",
            hotels: "Hôtels",
            offers: "Offres",
            contact: "Contact",
            support: "Support",
            help_faq: "Aide & FAQ",
            terms_conditions: "Conditions générales",
            privacy: "Confidentialité",
            cookie_policy: "Politique de cookies",
            all_rights_reserved: "Tous droits réservés.",

            // Auth (Login/Register)
            login_title: "Connexion",
            email: "Email",
            password: "Mot de passe",
            forgot_password: "Mot de passe oublié ?",
            login_button: "Se connecter",
            logging_in: "Connexion...",
            login_google: "Se connecter avec Google",
            login_facebook: "Se connecter avec Facebook",
            no_account: "Tu n'as pas de compte ?",
            create_account: "Créer un compte",
            register_title: "Inscription",
            firstname: "Prénom",
            lastname: "Nom",
            phone: "Numéro de téléphone",
            confirm_password: "Confirmer Mot de passe",
            register_button: "S'inscrire",
            registering: "Inscription...",
            register_google: "S'inscrire avec Google",
            register_facebook: "S'inscrire avec Facebook",
            already_have_account: "Tu as déjà un compte ?",
        },
        ar: {
            // General
            home: "الرئيسية",
            dashboard: "لوحة التحكم",
            messages: "الرسائل",
            settings: "الإعدادات",
            login: "تسجيل الدخول",
            logout: "تسجيل الخروج",
            profile: "الملف الشخصي",
            explore: "اكتشف فنادق موريتانيا",
            compare: "نقارن أسعار العديد من الفنادق",
            search: "بحث",
            previous: "السابق",
            more: "المزيد",
            or: "أو",

            // Home
            home_offers_title: "عروض الفنادق الحالية",
            loading_offers: "جاري تحميل العروض...",
            error_loading_hotels: "تعذر تحميل الفنادق.",
            price_unavailable: "السعر غير متاح",
            from: "من",
            available: "متاح",
            full: "مكتمل",
            save_big: "وفر الكثير",
            save_big_desc: "وفر الكثير على حجوزاتك، استمتع بأفضل العروض الآن!",
            reliable_service: "خدمة موثوقة",
            reliable_service_desc: "استمتع بخدمة موثوقة في كل حجز، ثقتكم هي أولويتنا",
            simple_search: "بحث بسيط",
            simple_search_desc: "بحث بسيط وبديهي للعثور على فندقك المثالي",

            // Footer
            footer_desc: "اكتشف أفضل فنادق موريتانيا. حجز بسيط، سريع وآمن.",
            navigation: "تصفح",
            hotels: "فنادق",
            offers: "عروض",
            contact: "اتصل بنا",
            support: "دعم",
            help_faq: "المساعدة والأسئلة الشائعة",
            terms_conditions: "الشروط والأحكام",
            privacy: "الخصوصية",
            cookie_policy: "سياسة ملفات تعريف الارتباط",
            all_rights_reserved: "جميع الحقوق محفوظة.",

            // Auth (Login/Register)
            login_title: "تسجيل الدخول",
            email: "البريد الإلكتروني",
            password: "كلمة المرور",
            forgot_password: "نسيت كلمة المرور؟",
            login_button: "تسجيل الدخول",
            logging_in: "جاري الدخول...",
            login_google: "دخول باستخدام جوجل",
            login_facebook: "دخول باستخدام فيسبوك",
            no_account: "ليس لديك حساب؟",
            create_account: "إنشاء حساب",
            register_title: "إنشاء حساب",
            firstname: "الاسم الأول",
            lastname: "اسم العائلة",
            phone: "رقم الهاتف",
            confirm_password: "تأكيد كلمة المرور",
            register_button: "تسجيل",
            registering: "جاري التسجيل...",
            register_google: "التسجيل عبر جوجل",
            register_facebook: "التسجيل عبر فيسبوك",
            already_have_account: "لدي حساب بالفعل؟",
        }
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, currency, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
