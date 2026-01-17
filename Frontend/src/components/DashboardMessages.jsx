import React, { useState, useEffect } from 'react';
import { getMessages, sendMessage, markAsRead } from '../services/messageService';
import '../styles/components/dashboardMessages.css';

const DashboardMessages = () => {
    const [messages, setMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [showChatOnMobile, setShowChatOnMobile] = useState(false);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const data = await getMessages();
                setMessages(data.messages);
                if (data.messages.length > 0) {
                    setSelectedChat(data.messages[0]);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, []);

    const handleChatSelect = async (chat) => {
        setSelectedChat(chat);
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

    const handleBackToList = () => {
        setShowChatOnMobile(false);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;
        try {
            const res = await sendMessage({
                subject: `Re: ${selectedChat.subject}`,
                content: newMessage,
                receiver_id: selectedChat.sender_id === JSON.parse(localStorage.getItem('user'))?.id ? selectedChat.receiver_id : selectedChat.sender_id
            });
            setMessages([res.message_data, ...messages]);
            setNewMessage("");
            alert("Message envoyé !");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (loading) return <div>Chargement des messages...</div>;

    return (
        <div className="dashboard-content dashboard-messages-content">
            <h2>Messages</h2>

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
                    {selectedChat ? (
                        <>
                            <div className="chat-header">
                                <button className="btn-back" onClick={handleBackToList}>
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
                            Sélectionnez un message pour le lire
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardMessages;
