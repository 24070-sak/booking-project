import { useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardMessages from "../components/DashboardMessages";
import '../styles/components/dashboardMessages.css';

function Messages() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="messages-page-wrapper" style={{ height: '100vh', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'white',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    color: '#1a202c',
                    textDecoration: 'none'
                }}>
                    <i className="fa-solid fa-arrow-left"></i>
                </Link>
                <h1 style={{ margin: 0, fontSize: '20px', color: '#1a202c' }}>Retour à l'accueil</h1>
            </div>
            <div style={{ flex: 1, padding: '20px', overflow: 'hidden' }}>
                <DashboardMessages />
            </div>
        </div>
    )
}

export default Messages;
