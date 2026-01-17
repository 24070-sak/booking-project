import React, { useState, useEffect } from 'react';
import { getMessages, sendMessage, markAsRead } from '../services/messageService';
import '../styles/components/dashboardMessages.css';

const DashboardMessages = () => {
    const [messages, setMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [showChatOnMobile, setShowChatOnMobile] = useState(false);

    // Composer State
    const [isComposing, setIsComposing] = useState(false);
    const [composeData, setComposeData] = useState({ subject: '', content: '' });

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const data = await getMessages();
            setMessages(data.messages);
            if (data.messages.length > 0 && !selectedChat) {
                setSelectedChat(data.messages[0]);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleChatSelect = async (chat) => {
        setSelectedChat(chat);
        setIsComposing(false);
        setShowChatOnMobile(true);
        if (!chat.is_read) {
            try {
                await markAsRead(chat.id);
                setMessages(prev => prev.map(m => m.id === chat.id ? { ...m, is_read: true } : m));
            } catch (error) {
                console.error("Error marking as read:", error);
            }
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const receiverId = selectedChat.sender_id === user?.id ? selectedChat.receiver_id : selectedChat.sender_id;

            const res = await sendMessage({
                subject: `Re: ${selectedChat.subject}`,
                content: newMessage,
                receiver_id: receiverId
            });
            alert("Message envoyé !");
            setNewMessage("");
            fetchMessages();
        } catch (error) {
            alert("Erreur: " + error.message);
        }
    };

    const handleComposeMessage = async () => {
        if (!composeData.subject || !composeData.content) {
            alert("Sujet et contenu requis");
            return;
        }
        try {
            // Note: If client, we might want to find an admin ID, but backend handles None as admin.
            await sendMessage({
                subject: composeData.subject,
                content: composeData.content,
                receiver_id: null // Backend handles null as sending to admin if sender is client
            });
            alert("Message envoyé à l'administration !");
            setIsComposing(false);
            setComposeData({ subject: '', content: '' });
            fetchMessages();
        } catch (error) {
            alert("Erreur: " + error.message);
        }
    };

    if (loading) return <div>Chargement des messages...</div>;

    return (
        <div className="dashboard-content dashboard-messages-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Messages</h2>
                <button className="btn-primary" onClick={() => { setIsComposing(true); setSelectedChat(null); }}>+ Nouveau message</button>
            </div>

            <div className={`messages-container ${showChatOnMobile ? 'show-chat' : ''}`}>
                <div className="messages-list">
                    {messages.length === 0 ? <p style={{ padding: '20px' }}>Aucun message</p> :
                        messages.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => handleChatSelect(chat)}
                                className={`message-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                            >
                                <div className="message-header">
                                    <strong>{chat.sender_name}</strong>
                                    <span>{new Date(chat.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className={`message-preview ${!chat.is_read ? 'unread' : ''}`}>
                                    {chat.subject}
                                </div>
                            </div>
                        ))}
                </div>

                <div className="chat-area">
                    {isComposing ? (
                        <div className="composer-area" style={{ padding: '20px' }}>
                            <h3>Nouveau message à l'administration</h3>
                            <div style={{ marginTop: '20px' }}>
                                <label>Sujet</label>
                                <input
                                    type="text"
                                    className="chat-input"
                                    style={{ marginBottom: '15px' }}
                                    value={composeData.subject}
                                    onChange={e => setComposeData({ ...composeData, subject: e.target.value })}
                                />
                                <label>Message</label>
                                <textarea
                                    className="chat-input"
                                    style={{ height: '150px', paddingTop: '10px' }}
                                    value={composeData.content}
                                    onChange={e => setComposeData({ ...composeData, content: e.target.value })}
                                />
                                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                    <button className="btn-secondary" onClick={() => setIsComposing(false)} style={{ marginRight: '10px' }}>Annuler</button>
                                    <button className="btn-primary" onClick={handleComposeMessage}>Envoyer</button>
                                </div>
                            </div>
                        </div>
                    ) : selectedChat ? (
                        <>
                            <div className="chat-header">
                                <button className="btn-back" onClick={() => setShowChatOnMobile(false)}>
                                    <i className="fa-solid fa-arrow-left"></i>
                                </button>
                                <div className="chat-info">
                                    <h3>{selectedChat.sender_name}</h3>
                                    <span>{selectedChat.subject}</span>
                                </div>
                            </div>

                            <div className="chat-messages">
                                <div className="message-bubble-container" style={{ alignSelf: 'flex-start' }}>
                                    <div className={`message-bubble other`}>
                                        {selectedChat.content}
                                    </div>
                                    <div className="message-time" style={{ textAlign: 'left' }}>
                                        {new Date(selectedChat.created_at).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>

                            <div className="chat-input-area">
                                <input
                                    type="text"
                                    placeholder="Répondre..."
                                    className="chat-input"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button className="btn-send" onClick={handleSendMessage}>
                                    <i className="fa-solid fa-paper-plane"></i>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <i className="fa-regular fa-comments" style={{ fontSize: '48px', color: '#cbd5e0' }}></i>
                            Sélectionnez un message ou commencez-en un nouveau
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardMessages;
