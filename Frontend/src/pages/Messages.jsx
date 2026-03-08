import { useState, useEffect, useRef } from "react";
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
        return "Je ne suis pas sûr de comprendre votre question. Essayez de me demander sur les réservations, les prix, les hôtels disponibles, le paiement ou le support. 🤔";
    };

    const handleChatbotSend = async () => {
        if (!chatbotInput.trim()) return;
        const userMsg = chatbotInput.trim();
        setChatbotMessages(prev => [...prev, { from: "user", text: userMsg }]);
        setChatbotInput("");
        setBotTyping(true);

        const lowerMsg = userMsg.toLowerCase();
        
        // Dynamic Response for available hotels
        if (lowerMsg.includes("hotel") && (lowerMsg.includes("dispo") || lowerMsg.includes("liste") || lowerMsg.includes("quelles") || lowerMsg.includes("quels"))) {
            try {
                const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                const response = await fetch(`${API_URL}/hotels`);
                const data = await response.json();
                
                if (data.hotels && data.hotels.length > 0) {
                    const hotelList = data.hotels.slice(0, 5).map(h => `• ${h.name} (${h.location}) - dès ${h.lowest_price || 'N/A'}€`).join("\n");
                    let reply = `Bien sûr ! Voici quelques hôtels disponibles actuellement :\n\n${hotelList}`;
                    if (data.total > 5) reply += `\n\n... et ${data.total - 5} autres !`;
                    
                    setChatbotMessages(prev => [...prev, { from: "bot", text: reply }]);
                } else {
                    setChatbotMessages(prev => [...prev, { from: "bot", text: "Désolé, je ne trouve aucun hôtel disponible pour le moment. 🏨" }]);
                }
            } catch (err) {
                console.error("Chatbot API Error:", err);
                setChatbotMessages(prev => [...prev, { from: "bot", text: "Désolé, j'ai rencontré une petite erreur technique en cherchant les hôtels. 😅" }]);
            }
            setBotTyping(false);
            return;
        }

        // Call Groq API directly using the provided Key
        try {
            // ⚠️ Il faut mettre la clé API dans le fichier .env (VITE_GROQ_API_KEY=gsk_...)
            const groqApiKey = import.meta.env.VITE_GROQ_API_KEY || "VOTRE_CLE_API_GROQ_ICI";
            
            // 1. Fetch live database data to feed the AI
            let dbContext = "";
            try {
                const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                const dbRes = await fetch(`${API_URL}/hotels`);
                if (dbRes.ok) {
                    const data = await dbRes.json();
                    if (data.hotels) {
                        const hotelsInfo = data.hotels.map(h => `${h.name} à ${h.location} (Prix: ${h.lowest_price || 'N/A'}€)`).join(", ");
                        dbContext = `\n[DONNÉES DE LA BASE DE DONNÉES]: Voici les hôtels actuellement disponibles : ${hotelsInfo}.`;
                    }
                }
            } catch (e) {
                console.error("Impossible de récupérer la BDD pour l'IA", e);
            }

            const systemPrompt = {
                role: "system",
                content: `Tu es l'assistant IA officiel du support client de Hotely. Tu représentes uniquement Hotely. Ne mentionne jamais 'Vibepi'. 
RÈGLES IMPORTANTES :
1. Garde tes réponses TOUJOURS COURTES ET DIRECTES, sauf si une explication détaillée est absolument nécessaire.
2. Utilise les données réelles de la base de données ci-dessous pour répondre aux questions sur les hôtels et les prix. Ne les invente jamais.${dbContext}
Si tu ne connais pas la réponse, dis: 'Je suis désolé, je n'ai pas cette information. Veuillez contacter notre support technique au 24041@supnum.mr'. RÉPONDS TOUJOURS EN FRANÇAIS. Utilise des emojis.`
            };

            // Prepare conversation history for the API
            const apiMessages = [systemPrompt];
            chatbotMessages.forEach(msg => {
                if (msg.from !== 'bot' || !msg.text.includes("Bonjour !")) { // Skip generic intro
                    apiMessages.push({
                        role: msg.from === "bot" ? "assistant" : "user",
                        content: msg.text
                    });
                }
            });
            apiMessages.push({ role: "user", content: userMsg });

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${groqApiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: apiMessages,
                    temperature: 0.5,
                    max_tokens: 500
                })
            });

            if (!response.ok) throw new Error("Groq API error");
            
            const data = await response.json();
            const aiReply = data.choices[0].message.content;
            
            setChatbotMessages(prev => [...prev, { from: "bot", text: aiReply }]);
        } catch (err) {
            console.error("Erreur Groq:", err);
            setChatbotMessages(prev => [...prev, { from: "bot", text: "Désolé, je rencontre des problèmes de connexion avec mon réseau neuronal. Veuillez réessayer dans un instant ! 🤖❌" }]);
        } finally {
            setBotTyping(false);
        }
    };

    return (
        <div className="messages-page-wrapper">
            {/* Top Navigation (Desktop) */}
            <div className="messages-top-nav">
                <Link to="/" className="messages-back-btn" title="Accueil">
                    <i className="fa-solid fa-arrow-left"></i>
                </Link>
                <h1 className="messages-page-title">Messages</h1>
            </div>

            {/* Mobile Header (Only visible on small screens when chat not open) */}
            <div className="mobile-only-header">
                <Link to="/" className="mobile-header-back" title="Accueil">
                    <i className="fa-solid fa-arrow-left"></i>
                </Link>
                <h2>Messages</h2>
            </div>

            {/* Pinned Chatbot Banner for Mobile */}
            <div className="mobile-chatbot-pin" onClick={() => setChatbotOpen(true)}>
                <div className="pin-avatar">
                    <i className="fa-solid fa-robot"></i>
                </div>
                <div className="pin-text">
                    <strong>Assistant Hotely</strong>
                    <span>Toujours là pour vous aider</span>
                </div>
                <div className="pin-icon-wrap">
                    <i className="fa-solid fa-thumbtack"></i>
                </div>
            </div>

            {/* Main Messages Content */}
            <div className="messages-content">
                <DashboardMessages />
            </div>

            {/* Chatbot Floating Button (Desktop) */}
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

            {/* Mobile Bottom Navigation (Only visible on small screens when chat not open) */}
            <div className="mobile-bottom-nav">
                <Link to="/" className="mobile-nav-item">
                    <i className="fa-solid fa-house"></i>
                    <span>Accueil</span>
                </Link>
                <Link to="/notifications" className="mobile-nav-item">
                    <i className="fa-solid fa-bell"></i>
                    <span>Alertes</span>
                </Link>
                <Link to="/messages" className="mobile-nav-item active">
                    <i className="fa-solid fa-envelope"></i>
                    <span>Messages</span>
                </Link>
                <Link to="/profile" className="mobile-nav-item">
                    <i className="fa-solid fa-user"></i>
                    <span>Profil</span>
                </Link>
            </div>
        </div>
    );
}

export default Messages;