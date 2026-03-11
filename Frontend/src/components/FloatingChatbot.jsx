import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resolveImageUrl } from '../utils/urlHelper';
import '../styles/components/floatingChatbot.css';

const FloatingChatbot = () => {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const [chatbotOpen, setChatbotOpen] = useState(false);
    const [chatbotMessages, setChatbotMessages] = useState([
        { from: "bot", text: "Comment puis-je vous aider ? 👋" }
    ]);
    const [chatbotInput, setChatbotInput] = useState("");
    const [botTyping, setBotTyping] = useState(false);
    const chatMessagesRef = useRef(null);

    // Draggable state
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const fabRef = useRef(null);

    const SUGGESTED_QUESTIONS = [
        "Quels hôtels sont disponibles actuellement ?",
        "Propose-moi des hôtels dans cette ville.",
        "Quelles chambres sont libres cette semaine ?",
        "Quels sont les hôtels les moins chers ?"
    ];

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        let shouldShow = true;
        
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && (user.role === 'admin' || user.role === 'manager')) {
                    shouldShow = false;
                }
            } catch (e) {
                console.error("Error parsing user data");
            }
        }
        setIsVisible(shouldShow);
    }, [location.pathname]);

    useEffect(() => {
        if (chatbotOpen) {
            chatMessagesRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [chatbotMessages, botTyping, chatbotOpen]);

    // Handle dragging
    const onMouseDown = (e) => {
        if (chatbotOpen) return;
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const onTouchStart = (e) => {
        if (chatbotOpen) return;
        setIsDragging(true);
        const touch = e.touches[0];
        setDragStart({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y
        });
    };

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!isDragging) return;
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        };

        const onTouchMove = (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            setPosition({
                x: touch.clientX - dragStart.x,
                y: touch.clientY - dragStart.y
            });
        };

        const onMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('touchmove', onTouchMove);
            window.addEventListener('touchend', onMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onMouseUp);
        };
    }, [isDragging, dragStart]);

    const handleChatbotSend = async (customMsg = null) => {
        const msgToSend = customMsg || chatbotInput;
        if (!msgToSend.trim()) return;

        const userMsg = msgToSend.trim();
        setChatbotMessages(prev => [...prev, { from: "user", text: userMsg }]);
        setChatbotInput("");
        setBotTyping(true);

        const lowerMsg = userMsg.toLowerCase();
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

        let allHotels = [];
        try {
            const dbRes = await fetch(`${API_URL}/hotels`);
            const data = await dbRes.json();
            if (data.hotels) allHotels = data.hotels;
        } catch(e) {}

        let hotelToFetch = null;
        const mentionedHotel = allHotels.find(h => lowerMsg.includes(h.name.toLowerCase()));
        
        if (mentionedHotel) {
            hotelToFetch = mentionedHotel.name;
        } else {
            const explicitMatch = lowerMsg.match(/(?:hôtel|hotel|chambres? d'|images? d'|photos? d'|infos? sur|voir|images? du)\s+(?:l'hôtel\s+|l'hotel\s+|l'|le\s+|la\s+|d'|de\s+|du\s+)?([a-zA-Z0-9éèêàâç]+(?:[\s-][a-zA-Z0-9éèêàâç]+)*)/i);
            if (explicitMatch) {
                const word = explicitMatch[1].toLowerCase();
                if (!['dispo', 'disponibles', 'pas cher', 'les moins chers', 'liste', 'belles'].includes(word) && allHotels.some(h => h.name.toLowerCase().includes(word))) {
                    hotelToFetch = word;
                }
            }
        }

        if (hotelToFetch) {
            try {
                const response = await fetch(`${API_URL}/hotels?search=${encodeURIComponent(hotelToFetch)}`);
                const data = await response.json();
                
                if (data.hotels && data.hotels.length > 0) {
                    const hotel = data.hotels[0];
                    const roomsRes = await fetch(`${API_URL}/hotels/${hotel.id}/rooms`);
                    const roomsData = await roomsRes.json();
                    
                    const detailsTexts = [
                        `Voici les images et détails pour **${hotel.name}** à ${hotel.location} :`,
                        `Découvrez tout ce qu'il faut savoir sur **${hotel.name}** :`,
                        `Super ! J'ai trouvé les infos pour **${hotel.name}** :`
                    ];
                    
                    setChatbotMessages(prev => [...prev, { 
                        from: "bot", 
                        text: detailsTexts[Math.floor(Math.random() * detailsTexts.length)],
                        hotelDetails: {
                            ...hotel,
                            rooms: roomsData.rooms || []
                        }
                    }]);
                } else {
                    setChatbotMessages(prev => [...prev, { from: "bot", text: `Je n'ai pas trouvé d'hôtel nommé "${hotelToFetch}". Essayez d'être plus précis !` }]);
                }
            } catch (err) {
                setChatbotMessages(prev => [...prev, { from: "bot", text: "Erreur lors de la recherche des détails de l'hôtel." }]);
            }
            setBotTyping(false);
            return;
        }

        const listingTexts = [
            "Bien sûr ! Voici une sélection d'hôtels disponibles :",
            "Avec plaisir ! Voici quelques hôtels qui pourraient vous intéresser :",
            "Voici les établissements actuellement disponibles :",
            "J'ai trouvé ces hôtels pour vous :"
        ];
        
        if (lowerMsg.includes("hotel") && (lowerMsg.includes("dispo") || lowerMsg.includes("liste") || lowerMsg.includes("propose") || lowerMsg.includes("quelles") || lowerMsg.includes("quels"))) {
            if (allHotels.length > 0) {
                setChatbotMessages(prev => [...prev, { 
                    from: "bot", 
                    text: listingTexts[Math.floor(Math.random() * listingTexts.length)],
                    hotels: allHotels.slice(0, 3)
                }]);
            } else {
                setChatbotMessages(prev => [...prev, { from: "bot", text: "Désolé, je ne trouve aucun hôtel disponible." }]);
            }
            setBotTyping(false);
            return;
        }

        const isGenericInquiry = lowerMsg.match(/(hôtels?|hotels?|chambres?|images?|photos?|dispo|liste|propose|quelles?|quels?|moins chers?|belles?|ville)/i);
        
        if (isGenericInquiry && allHotels.length > 0) {
            let selectedHotels = [...allHotels];
            
            const genericTexts = [
                "Voici une superbe sélection d'hôtels pour vous :",
                "J'ai trouvé ces magnifiques hôtels qui pourraient vous plaire :",
                "Explorez ces options exceptionnelles :"
            ];
            const cheapTexts = [
                "Voici les hôtels les plus abordables pour votre confort :",
                "J'ai trié les meilleures offres économiques :",
                "Ces options respectent votre budget :"
            ];
            const imageTexts = [
                "Voici quelques établissements en images pour vous inspirer :",
                "Découvrez la beauté de ces hôtels en photos :",
                "Ces images devraient vous plaire :"
            ];
            
            let textRep = genericTexts[Math.floor(Math.random() * genericTexts.length)];
            
            if (lowerMsg.includes("moins cher") || lowerMsg.includes("pas cher")) {
                selectedHotels.sort((a,b) => a.lowest_price - b.lowest_price);
                textRep = cheapTexts[Math.floor(Math.random() * cheapTexts.length)];
            } else if (lowerMsg.includes("image") || lowerMsg.includes("photo") || lowerMsg.includes("belle") || lowerMsg.includes("beau")) {
                textRep = imageTexts[Math.floor(Math.random() * imageTexts.length)];
            }
            
            setChatbotMessages(prev => [...prev, { 
                from: "bot", 
                text: textRep,
                hotels: selectedHotels.slice(0, 4)
            }]);
            setBotTyping(false);
            return;
        }

        try {
            const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
            let dbContext = "";
            try {
                const dbRes = await fetch(`${API_URL}/hotels`);
                const data = await dbRes.json();
                if (data.hotels) {
                    dbContext = `\n[BDD]: ${data.hotels.map(h => `${h.name} à ${h.location}`).join(", ")}.`;
                }
            } catch(e){}

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${groqApiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        { role: "system", content: `Tu es l'assistant de Hotely. Tes réponses DOIVENT être extrêmement courtes, maximum une à deux phrases courtes. Ne liste aucun hôtel, car les résultats de base de données s'affichent déjà en cartes. Sois chaleureux et concis.` },
                        ...chatbotMessages.map(m => ({ role: m.from === "bot" ? "assistant" : "user", content: m.text })),
                        { role: "user", content: userMsg }
                    ],
                    temperature: 0.5, max_tokens: 300
                })
            });
            const data = await response.json();
            setChatbotMessages(prev => [...prev, { from: "bot", text: data.choices[0].message.content }]);
        } catch (err) {
            setChatbotMessages(prev => [...prev, { from: "bot", text: "Oups, une erreur est survenue ! 🤖" }]);
        } finally {
            setBotTyping(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div 
            className="floating-chatbot-container"
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
        >
            {/* Chatbot Window */}
            {chatbotOpen && (
                <div className="fc-window slide-up-animation">
                    <div className="fc-header">
                        <div className="fc-header-info">
                            <div className="fc-avatar">
                                <i className="fa-solid fa-robot"></i>
                            </div>
                            <div className="fc-title">
                                <h4>Assistant Hotely</h4>
                                <span className="fc-status">
                                    <span className="fc-status-dot online"></span>
                                    En ligne
                                </span>
                            </div>
                        </div>
                        <button className="fc-close" onClick={() => setChatbotOpen(false)}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className="fc-body">
                        {chatbotMessages.map((msg, i) => (
                            <div key={i} className={`fc-msg-wrapper ${msg.from}`}>
                                {msg.from === 'bot' && (
                                    <div className="fc-msg-avatar-small">
                                        <i className="fa-solid fa-robot"></i>
                                    </div>
                                )}
                                <div className={`fc-msg-bubble ${msg.from}`}>
                                    {msg.text}
                                    {msg.hotels && (
                                        <div className="fc-hotels-compact-grid">
                                            {msg.hotels.map(h => (
                                                <div key={h.id} className="fc-hotel-mini-card" onClick={() => navigate(`/hotel/${h.id}`)}>
                                                    <img src={resolveImageUrl(h.image_url)} alt={h.name} />
                                                    <div className="fc-mini-card-text">
                                                        <strong>{h.name}</strong>
                                                        <span>{h.location} • Dès {h.lowest_price}€</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {msg.hotelDetails && (
                                        <div className="fc-hotel-details-view">
                                            <div className="fc-hotel-details-img-wrapper" onClick={() => navigate(`/hotel/${msg.hotelDetails.id}`)}>
                                                <img src={resolveImageUrl(msg.hotelDetails.image_url)} alt={msg.hotelDetails.name} />
                                                <div className="fc-hotel-details-overlay">
                                                    <strong>{msg.hotelDetails.name}</strong>
                                                    <span><i className="fa-solid fa-location-dot"></i> {msg.hotelDetails.location}</span>
                                                </div>
                                            </div>
                                            {msg.hotelDetails.rooms?.length > 0 && (
                                                <div className="fc-rooms-list">
                                                    <span className="fc-rooms-title">Chambres recommandées :</span>
                                                    {msg.hotelDetails.rooms.slice(0, 2).map(r => (
                                                        <div key={r.id} className="fc-room-item" onClick={() => navigate(`/room/${r.id}`)}>
                                                            <img src={resolveImageUrl(r.image_url)} alt={r.name} />
                                                            <div className="fc-room-info">
                                                                 <strong>{r.name}</strong>
                                                                 <span>{r.max_guests} max • {r.price_per_night}€/nuit</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {botTyping && (
                            <div className="fc-msg-wrapper bot">
                                <div className="fc-msg-avatar-small">
                                    <i className="fa-solid fa-robot"></i>
                                </div>
                                <div className="fc-msg-bubble bot typing">
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                </div>
                            </div>
                        )}

                        {chatbotMessages.length <= 2 && (
                            <div className="fc-suggestions">
                                <p>Suggestions d'aide :</p>
                                <div className="fc-suggestions-scroll">
                                    {SUGGESTED_QUESTIONS.map((q, idx) => (
                                        <button key={idx} className="fc-suggestion-pill" onClick={() => handleChatbotSend(q)}>
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={chatMessagesRef} style={{ height: '10px' }} />
                    </div>

                    <div className="fc-input-area">
                        <input
                            type="text"
                            placeholder="Posez votre question..."
                            value={chatbotInput}
                            onChange={(e) => setChatbotInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleChatbotSend()}
                        />
                        <button className="fc-send-btn" onClick={() => handleChatbotSend()} disabled={!chatbotInput.trim()}>
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Floating FAB Button */}
            {!chatbotOpen && (
                <button 
                    ref={fabRef}
                    className="fc-fab pulse-animation" 
                    onClick={() => { if (!isDragging) setChatbotOpen(true); }}
                    onMouseDown={onMouseDown}
                    onTouchStart={onTouchStart}
                    style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
                    title="Assistant Hotely"
                >
                    <i className="fa-solid fa-robot"></i>
                </button>
            )}
        </div>
    );
};

export default FloatingChatbot;
