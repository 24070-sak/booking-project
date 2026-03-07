import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import DashboardMessages from "../components/DashboardMessages";
import '../styles/pages/messages.css';
import '../styles/components/dashboardMessages.css';
import { useLanguage } from "../context/LanguageContext";

function Messages() {
    const { t } = useLanguage();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Chatbot state
    const [chatbotOpen, setChatbotOpen] = useState(false);
    const [chatbotMessages, setChatbotMessages] = useState([
        { from: "bot", text: "👋 Bonjour ! Je suis l'assistant Hotely. Comment puis-je vous aider ?" }
    ]);
    const [chatbotInput, setChatbotInput] = useState("");
    const [botTyping, setBotTyping] = useState(false);
    const chatbotEndRef = useRef(null);

    useEffect(() => {
        chatbotEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatbotMessages, botTyping]);

    const botResponses = [
        { keywords: ["bonjour", "salut", "hello", "hi"], reply: "Bonjour ! 😊 Comment puis-je vous aider aujourd'hui ?" },
        { keywords: ["réserver", "reservation", "réservation", "book"], reply: "Pour réserver un hôtel, rendez-vous sur la page d'accueil et utilisez la recherche pour trouver l'hôtel qui vous convient ! 🏨" },
        { keywords: ["prix", "tarif", "coût", "cout"], reply: "Les prix varient selon l'hôtel et la période. Consultez les pages hôtels pour voir les tarifs actuels. 💰" },
        { keywords: ["annuler", "annulation", "cancel"], reply: "Pour annuler une réservation, allez dans votre tableau de bord > Mes réservations et cliquez sur 'Annuler'. 🔄" },
        { keywords: ["paiement", "payer", "payment"], reply: "Nous acceptons les paiements en ligne sécurisés. Vous pouvez payer lors de la réservation. 💳" },
        { keywords: ["contact", "aide", "help", "support"], reply: "Vous pouvez nous contacter via la messagerie ou par email à support@hotely.mr 📧" },
        { keywords: ["merci", "thanks"], reply: "Avec plaisir ! N'hésitez pas si vous avez d'autres questions. 😊" },
        { keywords: ["mot de passe", "password", "mdp"], reply: "Pour réinitialiser votre mot de passe, cliquez sur 'Mot de passe oublié ?' sur la page de connexion. 🔑" },
    ];

    const getBotReply = (userText) => {
        const lower = userText.toLowerCase();
        for (const entry of botResponses) {
            if (entry.keywords.some(kw => lower.includes(kw))) {
                return entry.reply;
            }
        }
        return "Je ne suis pas sûr de comprendre votre question. Essayez de me demander sur les réservations, les prix, le paiement ou le support. 🤔";
    };

    const handleChatbotSend = () => {
        if (!chatbotInput.trim()) return;
        const userMsg = chatbotInput.trim();
        setChatbotMessages(prev => [...prev, { from: "user", text: userMsg }]);
        setChatbotInput("");
        setBotTyping(true);

        setTimeout(() => {
            const reply = getBotReply(userMsg);
            setChatbotMessages(prev => [...prev, { from: "bot", text: reply }]);
            setBotTyping(false);
        }, 800 + Math.random() * 700);
    };

    return (
        <div className="messages-page-wrapper">
            {/* Top Navigation */}
            <div className="messages-top-nav">
                <Link to="/" className="messages-back-btn">
                    <i className="fa-solid fa-arrow-left"></i>
                </Link>
                <h1 className="messages-page-title">Messages</h1>
            </div>

            {/* Main Messages Content */}
            <div className="messages-content">
                <DashboardMessages />
            </div>

            {/* Chatbot Floating Button */}
            <button
                className={`chatbot-fab ${chatbotOpen ? 'active' : ''}`}
                onClick={() => setChatbotOpen(!chatbotOpen)}
                title="Assistant Hotely"
            >
                <i className={`fa-solid ${chatbotOpen ? 'fa-xmark' : 'fa-robot'}`}></i>
            </button>

            {/* Chatbot Window */}
            {chatbotOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">
                                <i className="fa-solid fa-robot"></i>
                            </div>
                            <div>
                                <h4>Assistant Hotely</h4>
                                <span className="chatbot-status">
                                    <span className="status-dot"></span>
                                    En ligne
                                </span>
                            </div>
                        </div>
                        <button className="chatbot-close" onClick={() => setChatbotOpen(false)}>
                            <i className="fa-solid fa-minus"></i>
                        </button>
                    </div>

                    <div className="chatbot-body">
                        {chatbotMessages.map((msg, i) => (
                            <div key={i} className={`chatbot-msg ${msg.from}`}>
                                {msg.from === "bot" && (
                                    <div className="chatbot-msg-avatar">
                                        <i className="fa-solid fa-robot"></i>
                                    </div>
                                )}
                                <div className={`chatbot-msg-bubble ${msg.from}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {botTyping && (
                            <div className="chatbot-msg bot">
                                <div className="chatbot-msg-avatar">
                                    <i className="fa-solid fa-robot"></i>
                                </div>
                                <div className="chatbot-msg-bubble bot typing">
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                </div>
                            </div>
                        )}
                        <div ref={chatbotEndRef} />
                    </div>

                    <div className="chatbot-input-area">
                        <input
                            type="text"
                            className="chatbot-input"
                            placeholder="Tapez votre message..."
                            value={chatbotInput}
                            onChange={(e) => setChatbotInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleChatbotSend()}
                        />
                        <button className="chatbot-send-btn" onClick={handleChatbotSend}>
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Messages;
