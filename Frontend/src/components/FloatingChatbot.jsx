import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resolveImageUrl } from '../utils/urlHelper';
import '../styles/components/floatingChatbot.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SUGGESTED_QUESTIONS = [
    'Montrez-moi les hôtels les moins chers',
    'Quelles chambres sont disponibles cette semaine ?',
    'Trouvez des hôtels à Nouakchott',
    'Montrez-moi les photos des hôtels',
    'Quelles sont les meilleures offres du moment ?',
];

// --- Helper: fetch all hotels with rooms from API ---
async function fetchPlatformData() {
    const res = await fetch(`${API_URL}/hotels?limit=50`);
    const data = await res.json();
    return data.hotels || [];
}

// --- Helper: fetch rooms for a hotel ---
async function fetchHotelRooms(hotelId) {
    try {
        const res = await fetch(`${API_URL}/hotels/${hotelId}/rooms`);
        const data = await res.json();
        return data.rooms || [];
    } catch {
        return [];
    }
}

// --- Smart intent engine ---
function detectIntent(msg, hotels) {
    const lower = msg.toLowerCase();

    // Photo/image request
    const photoMatch = lower.match(/photo|image|voir|montrer?\s+(?:moi\s+)?(?:les\s+)?(?:photos?|images?)/i);

    // Cheapest hotels
    const cheapHotelMatch = lower.match(/moins\s+cher|pas\s+cher|abordable|économique|budget|prix\s+bas|meilleur\s+prix|offre/i);

    // Cheapest rooms
    const cheapRoomMatch = lower.match(/chambre.*moins\s+cher|moins\s+cher.*chambre|chambre.*pas\s+cher|chambre.*abordable|chambre.*budget|chambre.*prix/i);

    // Location search
    const locationKeywords = ['à ', 'dans ', 'en ', 'near ', 'proche ', 'région ', 'ville '];
    let detectedLocation = null;
    for (const kw of locationKeywords) {
        const idx = lower.indexOf(kw);
        if (idx !== -1) {
            const rest = lower.slice(idx + kw.length).trim();
            const word = rest.split(/[\s,\.!?]/)[0];
            if (word && word.length > 2) {
                // verify it's a real location in our data
                const match = hotels.find(h => h.location && h.location.toLowerCase().includes(word));
                if (match) {
                    detectedLocation = word;
                    break;
                }
            }
        }
    }

    // Specific hotel name mentioned
    const mentionedHotel = hotels.find(h => lower.includes(h.name.toLowerCase()));

    // Available hotels general
    const availableMatch = lower.match(/disponible|dispo|available|liste|hôtels?|hotels?|voir\s+tous|all\s+hotels?/i);

    if (cheapRoomMatch) return { type: 'cheapRooms' };
    if (mentionedHotel) return { type: 'hotelDetail', hotel: mentionedHotel };
    if (cheapHotelMatch) return { type: 'cheapHotels' };
    if (detectedLocation) return { type: 'locationSearch', location: detectedLocation };
    if (photoMatch) return { type: 'photos' };
    if (availableMatch) return { type: 'listHotels' };

    return { type: 'ai' };
}

// --- Groq AI call with robust error handling ---
async function callGroqAI(userMsg, history, hotelContext) {
    const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!groqApiKey) {
        return "Je suis l'assistant Hotely ! Je peux vous aider à trouver des hôtels, chambres et les meilleures offres sur la plateforme. Posez-moi une question spécifique ! ";
    }

    const systemPrompt = `Tu es l'assistant IA de la plateforme hôtelière "Hotely". 
Tu aides les utilisateurs à trouver des hôtels, chambres et tarifs.
Données actuelles de la plateforme : ${hotelContext}
Réponds TOUJOURS en français. Sois chaleureux, concis (max 2 phrases). 
N'invente pas de données — utilise uniquement les données fournies.`;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-6).map(m => ({
            role: m.from === 'bot' ? 'assistant' : 'user',
            content: m.text || ''
        })),
        { role: 'user', content: userMsg }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages,
            temperature: 0.6,
            max_tokens: 250
        })
    });

    if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid Groq response structure');
    }

    return data.choices[0].message.content;
}

// =====================================================================
const FloatingChatbot = () => {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const [chatbotOpen, setChatbotOpen] = useState(false);
    const [chatbotMessages, setChatbotMessages] = useState([
        { from: 'bot', text: 'Bonjour ! Je suis votre assistant Hotely. Comment puis-je vous aider à trouver votre hébergement idéal ?' }
    ]);
    const [chatbotInput, setChatbotInput] = useState('');
    const [botTyping, setBotTyping] = useState(false);
    const chatMessagesRef = useRef(null);

    // Draggable state
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const fabRef = useRef(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        let shouldShow = true;
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && (user.role === 'admin' || user.role === 'manager')) {
                    shouldShow = false;
                }
            } catch (e) { /* ignore */ }
        }
        setIsVisible(shouldShow);
    }, [location.pathname]);

    useEffect(() => {
        if (chatbotOpen && chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chatbotMessages, botTyping, chatbotOpen]);

    // ---- Drag logic ----
    const onMouseDown = (e) => {
        if (chatbotOpen) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const onTouchStart = (e) => {
        if (chatbotOpen) return;
        setIsDragging(true);
        const touch = e.touches[0];
        setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    };

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!isDragging) return;
            setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        };
        const onTouchMove = (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            setPosition({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
        };
        const onMouseUp = () => {
            if (!isDragging) return;
            setIsDragging(false);
            if (fabRef.current) {
                const rect = fabRef.current.getBoundingClientRect();
                const winW = window.innerWidth;
                const winH = window.innerHeight;
                const pad = 24;
                const cx = rect.left + rect.width / 2;
                const targetX = cx < winW / 2 ? pad : winW - rect.width - pad;
                let targetY = rect.top;
                if (targetY < pad) targetY = pad;
                if (targetY > winH - rect.height - pad) targetY = winH - rect.height - pad;
                setPosition({ x: targetX, y: targetY });
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('touchmove', onTouchMove, { passive: true });
            window.addEventListener('touchend', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onMouseUp);
        };
    }, [isDragging, dragStart]);

    // ---- Main chat handler ----
    const handleChatbotSend = async (customMsg = null) => {
        const msgToSend = (customMsg || chatbotInput).trim();
        if (!msgToSend || botTyping) return;

        const userMsg = msgToSend;
        setChatbotMessages(prev => [...prev, { from: 'user', text: userMsg }]);
        setChatbotInput('');
        setBotTyping(true);

        try {
            // Fetch platform data first
            let hotels = [];
            try {
                hotels = await fetchPlatformData();
            } catch {
                hotels = [];
            }

            const intent = detectIntent(userMsg, hotels);

            if (intent.type === 'cheapHotels') {
                const sorted = [...hotels]
                    .filter(h => h.lowest_price != null)
                    .sort((a, b) => (a.lowest_price || 0) - (b.lowest_price || 0))
                    .slice(0, 5);

                if (sorted.length > 0) {
                    setChatbotMessages(prev => [...prev, {
                        from: 'bot',
                        text: `Voici les ${sorted.length} hôtels les plus abordables de la plateforme :`,
                        hotels: sorted
                    }]);
                } else {
                    setChatbotMessages(prev => [...prev, {
                        from: 'bot',
                        text: "Je n'ai pas pu trouver des hôtels avec des prix disponibles. Essayez de rafraîchir la page."
                    }]);
                }

            } else if (intent.type === 'cheapRooms') {
                // Fetch rooms from all hotels
                let allRooms = [];
                for (const hotel of hotels.slice(0, 8)) {
                    const rooms = await fetchHotelRooms(hotel.id);
                    rooms.forEach(r => allRooms.push({ ...r, hotel_name: hotel.name, hotel_location: hotel.location }));
                }
                const sorted = allRooms
                    .filter(r => r.is_available && r.price_per_night != null)
                    .sort((a, b) => a.price_per_night - b.price_per_night)
                    .slice(0, 5);

                if (sorted.length > 0) {
                    setChatbotMessages(prev => [...prev, {
                        from: 'bot',
                        text: `Voici les chambres les moins chères disponibles en ce moment :`,
                        rooms: sorted
                    }]);
                } else {
                    setChatbotMessages(prev => [...prev, {
                        from: 'bot',
                        text: "Aucune chambre disponible trouvée. Revenez plus tard !"
                    }]);
                }

            } else if (intent.type === 'locationSearch') {
                const loc = intent.location;
                const matched = hotels
                    .filter(h => h.location && h.location.toLowerCase().includes(loc))
                    .slice(0, 5);

                if (matched.length > 0) {
                    const locationName = matched[0].location;
                    setChatbotMessages(prev => [...prev, {
                        from: 'bot',
                        text: `J'ai trouvé ${matched.length} hôtel(s) à **${locationName}** :`,
                        hotels: matched
                    }]);
                } else {
                    setChatbotMessages(prev => [...prev, {
                        from: 'bot',
                        text: `Je n'ai pas trouvé d'hôtels dans cette localisation. Essayez une autre ville comme Nouakchott, Kiffa ou Rosso.`
                    }]);
                }

            } else if (intent.type === 'hotelDetail') {
                const hotel = intent.hotel;
                const rooms = await fetchHotelRooms(hotel.id);
                setChatbotMessages(prev => [...prev, {
                    from: 'bot',
                    text: `Voici les détails pour **${hotel.name}** à ${hotel.location} :`,
                    hotelDetails: { ...hotel, rooms }
                }]);

            } else if (intent.type === 'photos') {
                const withImages = hotels.filter(h => h.image_url).slice(0, 5);
                if (withImages.length > 0) {
                    setChatbotMessages(prev => [...prev, {
                        from: 'bot',
                        text: 'Voici quelques hôtels en images :',
                        hotels: withImages
                    }]);
                } else {
                    setChatbotMessages(prev => [...prev, {
                        from: 'bot',
                        text: "Je ne trouve pas de photos disponibles pour le moment."
                    }]);
                }

            } else if (intent.type === 'listHotels') {
                const available = hotels.filter(h => h.has_availability).slice(0, 5);
                const toShow = available.length > 0 ? available : hotels.slice(0, 5);
                setChatbotMessages(prev => [...prev, {
                    from: 'bot',
                    text: `Voici ${toShow.length} hôtels disponibles sur la plateforme :`,
                    hotels: toShow
                }]);

            } else {
                // AI fallback
                const hotelContext = hotels.length > 0
                    ? hotels.slice(0, 10).map(h => `${h.name} (${h.location}, dès ${h.lowest_price || '?'}€)`).join(', ')
                    : 'Aucun hôtel disponible.';

                try {
                    const aiText = await callGroqAI(userMsg, chatbotMessages, hotelContext);
                    setChatbotMessages(prev => [...prev, { from: 'bot', text: aiText }]);
                } catch (aiErr) {
                    console.error('AI error:', aiErr);
                    // Smart fallback - show hotels if we have them
                    if (hotels.length > 0) {
                        setChatbotMessages(prev => [...prev, {
                            from: 'bot',
                            text: "Je n'ai pas pu obtenir une réponse précise, mais voici nos hôtels disponibles :",
                            hotels: hotels.slice(0, 4)
                        }]);
                    } else {
                        setChatbotMessages(prev => [...prev, {
                            from: 'bot',
                            text: "Désolé, je rencontre un problème technique momentané. Essayez de me demander : 'Montrez-moi les hôtels disponibles' ou 'Hôtels les moins chers'. "
                        }]);
                    }
                }
            }
        } catch (err) {
            // Top-level error guard - NEVER let this crash the page
            console.error('Chatbot error:', err);
            setChatbotMessages(prev => [...prev, {
                from: 'bot',
                text: "Une erreur inattendue s'est produite. Veuillez réessayer dans quelques instants."
            }]);
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

                    <div className="fc-body" ref={chatMessagesRef}>
                        {chatbotMessages.map((msg, i) => (
                            <div key={i} className={`fc-msg-wrapper ${msg.from}`}>
                                {msg.from === 'bot' && (
                                    <div className="fc-msg-avatar-small">
                                        <i className="fa-solid fa-robot"></i>
                                    </div>
                                )}
                                <div className={`fc-msg-bubble ${msg.from}`}>
                                    {/* Render text with basic bold support */}
                                    <span>{msg.text?.replace(/\*\*(.*?)\*\*/g, '$1')}</span>

                                    {/* Hotels grid */}
                                    {msg.hotels && msg.hotels.length > 0 && (
                                        <div className="fc-hotels-compact-grid">
                                            {msg.hotels.map(h => (
                                                <div key={h.id} className="fc-hotel-mini-card" onClick={() => navigate(`/hotel/${h.id}`)}>
                                                    <img src={resolveImageUrl(h.image_url)} alt={h.name} onError={(e) => { e.target.src = '/placeholder-hotel.png'; }} />
                                                    <div className="fc-mini-card-text">
                                                        <strong>{h.name}</strong>
                                                        <span>{h.location}</span>
                                                        {h.lowest_price != null && (
                                                            <span className="fc-price-badge">Dès {h.lowest_price} €/nuit</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Rooms list */}
                                    {msg.rooms && msg.rooms.length > 0 && (
                                        <div className="fc-rooms-compact-list">
                                            {msg.rooms.map(r => (
                                                <div key={r.id} className="fc-room-item" onClick={() => navigate(`/room/${r.id}`)}>
                                                    <img src={resolveImageUrl(r.image_url)} alt={r.name} onError={(e) => { e.target.src = '/placeholder-hotel.png'; }} />
                                                    <div className="fc-room-info">
                                                        <strong>{r.name}</strong>
                                                        <span>{r.hotel_name} • {r.hotel_location}</span>
                                                        <span className="fc-price-badge">{r.price_per_night} €/nuit</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Hotel detail card */}
                                    {msg.hotelDetails && (
                                        <div className="fc-hotel-details-view">
                                            <div className="fc-hotel-details-img-wrapper" onClick={() => navigate(`/hotel/${msg.hotelDetails.id}`)}>
                                                <img src={resolveImageUrl(msg.hotelDetails.image_url)} alt={msg.hotelDetails.name} onError={(e) => { e.target.src = '/placeholder-hotel.png'; }} />
                                                <div className="fc-hotel-details-overlay">
                                                    <strong>{msg.hotelDetails.name}</strong>
                                                    <span><i className="fa-solid fa-location-dot"></i> {msg.hotelDetails.location}</span>
                                                    {msg.hotelDetails.rating > 0 && (
                                                        <span><i className="fa-solid fa-star" style={{ color: '#FFD700' }}></i> {msg.hotelDetails.rating}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {msg.hotelDetails.rooms?.length > 0 && (
                                                <div className="fc-rooms-list">
                                                    <span className="fc-rooms-title"> Chambres disponibles :</span>
                                                    {msg.hotelDetails.rooms.slice(0, 3).map(r => (
                                                        <div key={r.id} className="fc-room-item" onClick={() => navigate(`/room/${r.id}`)}>
                                                            <img src={resolveImageUrl(r.image_url)} alt={r.name} onError={(e) => { e.target.src = '/placeholder-hotel.png'; }} />
                                                            <div className="fc-room-info">
                                                                <strong>{r.name}</strong>
                                                                <span className="fc-price-badge">{r.price_per_night} €/nuit • {r.max_guests} pers. max</span>
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

                        {/* Suggested questions — shown always at the bottom */}
                        {chatbotMessages.length <= 2 && !botTyping && (
                            <div className="fc-suggestions">
                                <p>Suggestions :</p>
                                <div className="fc-suggestions-scroll">
                                    {SUGGESTED_QUESTIONS.map((q, idx) => (
                                        <button key={idx} className="fc-suggestion-pill" onClick={() => handleChatbotSend(q)}>
                                                {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="fc-input-area">
                        <input
                            type="text"
                            placeholder={botTyping ? "L'assistant réfléchit..." : "Posez votre question..."}
                            value={chatbotInput}
                            onChange={(e) => setChatbotInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !botTyping && handleChatbotSend()}
                            disabled={botTyping}
                            style={{ 
                                opacity: botTyping ? 0.7 : 1,
                                cursor: botTyping ? 'not-allowed' : 'text'
                            }}
                        />
                        <button
                            className="fc-send-btn"
                            onClick={() => handleChatbotSend()}
                            disabled={!chatbotInput.trim() || botTyping}
                        >
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
                    style={{
                        cursor: isDragging ? 'grabbing' : 'pointer',
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        right: 'auto',
                        bottom: 'auto',
                        position: 'fixed'
                    }}
                    title="Assistant Hotely"
                >
                    <i className="fa-solid fa-robot"></i>
                </button>
            )}
        </div>
    );
};

export default FloatingChatbot;
