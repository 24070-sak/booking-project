import React, { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage, markAsRead, searchUsers } from '../services/messageService';
import { showError, showSuccess } from '../utils/alerts';
import '../styles/components/dashboardMessages.css';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Fix image URL : if it's a relative path, prefix with backend base URL
const getProfileUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Quick reply suggestions
const QUICK_REPLIES = [
    "D'accord, merci ! 👍",
    "Je vous contacte bientôt.",
    "Pouvez-vous m'en dire plus ?",
    "Merci pour votre réponse !",
    "Je vais vérifier ça.",
    "Bien reçu ✅",
];

const DashboardMessages = () => {
    const [messages, setMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [showChatOnMobile, setShowChatOnMobile] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const chatMessagesRef = useRef(null);

    // Composer State
    const [isComposing, setIsComposing] = useState(false);
    const [composeData, setComposeData] = useState({ subject: '', content: '', receiver_id: null });

    // Search Users State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searching, setSearching] = useState(false);

    // Derive unique conversations from messages
    const conversations = React.useMemo(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        const groups = {};
        messages.forEach(msg => {
            const otherId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
            if (!groups[otherId] || new Date(msg.created_at) > new Date(groups[otherId].created_at)) {
                groups[otherId] = msg;
            }
        });
        return Object.values(groups).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [messages]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const data = await getMessages();
            setMessages(data.messages);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        if (!selectedChat && conversations.length > 0) {
            setSelectedChat(conversations[0]);
        }
    }, [conversations, selectedChat]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [messages, selectedChat]);

    // Debounced user search
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setSearching(true);
                const data = await searchUsers(searchQuery);
                setSearchResults(data.users || []);
            } catch (error) {
                console.error("Search error:", error);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleChatSelect = async (chat) => {
        setSelectedChat(chat);
        setIsComposing(false);
        setShowChatOnMobile(true);
        setShowSuggestions(false);
        if (!chat.is_read) {
            try {
                await markAsRead(chat.id);
                setMessages(prev => prev.map(m => m.id === chat.id ? { ...m, is_read: true } : m));
            } catch (error) {
                console.error("Error marking as read:", error);
            }
        }
    };

    const handleSendMessage = async (content = null) => {
        const msgToSend = content || newMessage;
        if (!msgToSend.trim() || !selectedChat) return;
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const receiverId = selectedChat.sender_id === user?.id ? selectedChat.receiver_id : selectedChat.sender_id;

            let subject = selectedChat.subject;
            if (!subject.startsWith('Re:')) {
                subject = `Re: ${subject} `;
            }

            await sendMessage({
                subject: subject,
                content: msgToSend,
                receiver_id: receiverId
            });
            setNewMessage("");
            setShowSuggestions(false);
            fetchMessages();
        } catch (error) {
            showError("Erreur: " + error.message);
        }
    };

    const handleSelectUserForCompose = (user) => {
        setSelectedUser(user);
        setSearchQuery(`${user.first_name} ${user.last_name}`);
        setSearchResults([]);
        setComposeData(prev => ({ ...prev, receiver_id: user.id }));
    };

    const handleComposeMessage = async () => {
        if (!composeData.content) {
            showError("Contenu requis");
            return;
        }
        try {
            await sendMessage({
                subject: "Message",
                content: composeData.content,
                receiver_id: composeData.receiver_id // null for admin, or specific user id
            });
            const target = selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : "l'administration";
            showSuccess(`Message envoyé à ${target} !`);
            setIsComposing(false);
            setComposeData({ subject: '', content: '', receiver_id: null });
            setSelectedUser(null);
            setSearchQuery('');
            setSearchResults([]);
            fetchMessages();
        } catch (error) {
            showError("Erreur: " + error.message);
        }
    };

    const openComposer = () => {
        setIsComposing(true);
        setSelectedUser(null);
        setSearchQuery('');
        setSearchResults([]);
        setComposeData({ subject: '', content: '', receiver_id: null });
    };

    if (loading) return (
        <div className="messages-loading">
            <div className="loading-spinner"></div>
            <span>Chargement des messages...</span>
        </div>
    );

    // Helper to get the "other person" info from a chat message
    const getOtherPerson = (chat) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const isMeSender = chat.sender_id === user?.id;
        return {
            name: isMeSender ? chat.receiver_name : chat.sender_name,
            picture: getProfileUrl(isMeSender ? chat.receiver_picture : chat.sender_picture),
            email: isMeSender ? chat.receiver_email : chat.sender_email,
        };
    };

    return (
        <div className="dashboard-content dashboard-messages-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h2>Messages</h2>
            </div>

            <div className={`messages-container ${showChatOnMobile ? 'show-chat' : ''}`}>
                {/* ========== CONVERSATIONS LIST ========== */}
                <div className="messages-list">
                    {conversations.length === 0 ? (
                        <div className="no-conversations">
                            <i className="fa-regular fa-envelope" style={{ fontSize: '32px', color: '#c3d9cc' }}></i>
                            <p>Aucun message</p>
                        </div>
                    ) : (
                        conversations.map(chat => {
                            const currentUser = JSON.parse(localStorage.getItem('user'));
                            const other = getOtherPerson(chat);
                            const thisOtherId = chat.sender_id === currentUser?.id ? chat.receiver_id : chat.sender_id;
                            const selectedOtherId = selectedChat
                                ? (selectedChat.sender_id === currentUser?.id ? selectedChat.receiver_id : selectedChat.sender_id)
                                : null;
                            const isActive = selectedOtherId === thisOtherId;

                            return (
                                <div
                                    key={chat.id}
                                    onClick={() => handleChatSelect(chat)}
                                    className={`message-item ${isActive ? 'active' : ''} ${!chat.is_read ? 'unread-item' : ''}`}
                                >
                                    <div className="message-avatar-wrapper">
                                        {other.picture ? (
                                            <img
                                                src={other.picture}
                                                alt={other.name}
                                                className="message-avatar-img"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="message-avatar-placeholder"
                                            style={{ display: other.picture ? 'none' : 'flex' }}
                                        >
                                            {other.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="message-text-content">
                                        <div className="message-header">
                                            <strong>{other.name || 'Inconnu'}</strong>
                                            <span>{new Date(chat.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                                        </div>
                                        <div className={`message-preview ${!chat.is_read ? 'unread' : ''}`}>
                                            {chat.content}
                                        </div>
                                    </div>
                                    {!chat.is_read && <div className="unread-dot"></div>}
                                </div>
                            );
                        })
                    )}
                    <button className="fab-new-message" onClick={openComposer} title="Nouveau message">
                        <i className="fa-solid fa-plus"></i>
                    </button>
                </div>

                {/* ========== CHAT AREA ========== */}
                <div className="chat-area">
                    {selectedChat ? (() => {
                        const currentUser = JSON.parse(localStorage.getItem('user'));
                        const other = getOtherPerson(selectedChat);
                        const otherPersonId = selectedChat.sender_id === currentUser?.id
                            ? selectedChat.receiver_id
                            : selectedChat.sender_id;

                        const conversationMessages = messages.filter(m =>
                            (m.sender_id === currentUser?.id && m.receiver_id === otherPersonId) ||
                            (m.sender_id === otherPersonId && m.receiver_id === currentUser?.id)
                        ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

                        return (
                            <>
                                {/* Chat Header */}
                                <div className="chat-header">
                                    <button className="btn-back" onClick={() => setShowChatOnMobile(false)}>
                                        <i className="fa-solid fa-arrow-left"></i>
                                    </button>
                                    <div className="chat-header-avatar">
                                        {other.picture ? (
                                            <img
                                                src={other.picture}
                                                alt={other.name}
                                                className="chat-header-avatar-img"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="chat-header-avatar-placeholder"
                                            style={{ display: other.picture ? 'none' : 'flex' }}
                                        >
                                            {other.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <span className="chat-online-dot"></span>
                                    </div>
                                    <div className="chat-info">
                                        <h3>{other.name || 'Inconnu'}</h3>
                                        {other.email && <span>{other.email}</span>}
                                    </div>
                                </div>

                                {/* Messages Bubbles */}
                                <div className="chat-messages" ref={chatMessagesRef}>
                                    {conversationMessages.length === 0 ? (
                                        <div className="no-msgs-yet">
                                            <i className="fa-regular fa-comments"></i>
                                            <span>Commencez la conversation !</span>
                                        </div>
                                    ) : (
                                        conversationMessages.map((msg, idx) => {
                                            const isMe = msg.sender_id === currentUser?.id;
                                            const showTime = idx === 0 ||
                                                (new Date(msg.created_at) - new Date(conversationMessages[idx - 1].created_at)) > 5 * 60 * 1000;

                                            return (
                                                <React.Fragment key={msg.id}>
                                                    {showTime && (
                                                        <div className="msg-time-separator">
                                                            {new Date(msg.created_at).toLocaleString('fr-FR', {
                                                                hour: '2-digit', minute: '2-digit',
                                                                day: '2-digit', month: 'short'
                                                            })}
                                                        </div>
                                                    )}
                                                    <div className={`message-bubble-wrapper ${isMe ? 'me' : 'other'}`}>
                                                        {!isMe && (
                                                            <div className="bubble-avatar">
                                                                {other.picture ? (
                                                                    <img
                                                                        src={other.picture}
                                                                        alt=""
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                            e.target.nextSibling.style.display = 'flex';
                                                                        }}
                                                                    />
                                                                ) : null}
                                                                <span style={{ display: other.picture ? 'none' : 'flex' }}>
                                                                    {other.name?.charAt(0)?.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className={`message-bubble ${isMe ? 'me' : 'other'}`}>
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Quick Suggestions */}
                                {showSuggestions && (
                                    <div className="quick-suggestions">
                                        {QUICK_REPLIES.map((s, i) => (
                                            <button
                                                key={i}
                                                className="suggestion-chip"
                                                onClick={() => handleSendMessage(s)}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Input Area */}
                                <div className="chat-input-area">
                                    <button
                                        className={`btn-suggest ${showSuggestions ? 'active' : ''}`}
                                        onClick={() => setShowSuggestions(s => !s)}
                                        title="Suggestions rapides"
                                    >
                                        <i className="fa-solid fa-bolt"></i>
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Répondre..."
                                        className="chat-input"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        onFocus={() => setShowSuggestions(false)}
                                    />
                                    <button
                                        className="btn-send"
                                        onClick={() => handleSendMessage()}
                                        disabled={!newMessage.trim()}
                                    >
                                        <i className="fa-solid fa-paper-plane"></i>
                                    </button>
                                </div>
                            </>
                        );
                    })() : (
                        <div className="no-chat-selected">
                            <i className="fa-regular fa-comments" style={{ fontSize: '52px', color: '#c3d9cc' }}></i>
                            <p>Sélectionnez une conversation<br />ou commencez-en une nouvelle</p>
                            <button className="btn-start-new" onClick={openComposer}>
                                <i className="fa-solid fa-plus"></i> Nouveau message
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ========== COMPOSE MODAL ========== */}
            {isComposing && (
                <div className="modal-overlay" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setIsComposing(false); }}>
                    <div className="modal-content-mac">
                        <div className="modal-header-mac">
                            <div className="window-controls">
                                <div className="control-dot dot-red" onClick={() => setIsComposing(false)}></div>
                                <div className="control-dot dot-yellow"></div>
                                <div className="control-dot dot-green"></div>
                            </div>
                            <h3>Nouveau Message</h3>
                            <div style={{ width: '40px' }}></div>
                        </div>
                        <div className="modal-body-mac">
                            {/* User Search */}
                            <div className="search-user-wrapper">
                                <i className="fa-solid fa-search search-icon"></i>
                                <input
                                    type="text"
                                    placeholder="Rechercher un utilisateur par nom ou email..."
                                    className="search-user-input"
                                    value={searchQuery}
                                    onChange={e => {
                                        setSearchQuery(e.target.value);
                                        if (selectedUser) setSelectedUser(null);
                                    }}
                                />

                                {/* Selected user badge */}
                                {selectedUser && (
                                    <div className="selected-user-badge">
                                        <div className="badge-avatar">
                                            {selectedUser.profile_picture ? (
                                                <img src={getProfileUrl(selectedUser.profile_picture)} alt="" />
                                            ) : (
                                                <span>{selectedUser.first_name?.charAt(0)}</span>
                                            )}
                                        </div>
                                        <span>{selectedUser.first_name} {selectedUser.last_name}</span>
                                        <button onClick={() => {
                                            setSelectedUser(null);
                                            setSearchQuery('');
                                            setComposeData(prev => ({ ...prev, receiver_id: null }));
                                        }}>
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                )}

                                {/* Search Results Dropdown */}
                                {searchQuery.length >= 2 && !selectedUser && (
                                    <div className="search-results-dropdown">
                                        {searching ? (
                                            <div className="search-loading">
                                                <i className="fa-solid fa-spinner fa-spin"></i>
                                                Recherche...
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map(user => (
                                                <div
                                                    key={user.id}
                                                    className="search-result-item"
                                                    onClick={() => handleSelectUserForCompose(user)}
                                                >
                                                    <div className="search-result-avatar">
                                                        {user.profile_picture ? (
                                                            <img src={getProfileUrl(user.profile_picture)} alt="" />
                                                        ) : (
                                                            <span>{user.first_name?.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div className="search-result-info">
                                                        <strong>{user.first_name} {user.last_name}</strong>
                                                        <span>{user.email}</span>
                                                    </div>
                                                    {user.role !== 'client' && (
                                                        <span className="search-result-role">{user.role}</span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="search-no-results">
                                                <i className="fa-solid fa-user-slash"></i>
                                                Aucun utilisateur trouvé
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Subject */}
                            <div style={{ marginBottom: '12px' }}>
                                <input
                                    type="text"
                                    placeholder="Sujet du message..."
                                    className="search-user-input"
                                    style={{ paddingLeft: '16px' }}
                                    value={composeData.subject}
                                    onChange={e => setComposeData({ ...composeData, subject: e.target.value })}
                                />
                            </div>

                            {/* Message Body */}
                            <div className="modal-message-area">
                                <textarea
                                    className="modal-textarea"
                                    placeholder="Votre message..."
                                    value={composeData.content}
                                    onChange={e => setComposeData({ ...composeData, content: e.target.value })}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', color: '#718096' }}>
                                        {selectedUser
                                            ? `→ ${selectedUser.first_name} ${selectedUser.last_name}`
                                            : '→ Administration (par défaut)'
                                        }
                                    </span>
                                    <button className="btn-send-mac" onClick={handleComposeMessage}>
                                        Envoyer <i className="fa-solid fa-paper-plane"></i>
                                    </button>
                                </div>
                                <button className="btn-send-premium" onClick={handleComposeMessage}>
                                    Envoyer <i className="fa-solid fa-paper-plane" style={{ marginLeft: '8px' }}></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardMessages;
