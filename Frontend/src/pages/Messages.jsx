import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import DashboardMessages from "../components/DashboardMessages";
import '../styles/pages/messages.css';
import '../styles/components/dashboardMessages.css';

function Messages() {
    const { t } = useLanguage();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="msg-page">
            <div className="msg-page-card">
                <div className="msg-page-header">
                    <Link to="/" className="msg-back-link">
                        <i className="fa-solid fa-chevron-left"></i>
                    </Link>
                    <div className="msg-page-brand">
                        <h1 className="msg-page-heading">Messages</h1>
                    </div>
                </div>
                <div className="msg-page-content">
                    <DashboardMessages />
                </div>
            </div>
        </div>
    )
}

export default Messages;
