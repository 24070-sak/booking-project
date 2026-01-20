import React, { useState, useEffect } from 'react';
import { getMessages, sendMessage, markAsRead } from '../services/messageService';
import '../styles/components/dashboardMessages.css';

const DashboardMessages = () => {
    const [messages, setMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null); // This acts as the "selected conversation" (holding the latest message)
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [showChatOnMobile, setShowChatOnMobile] = useState(false);

    // Composer State
    const [isComposing, setIsComposing] = useState(false);
    const [composeData, setComposeData] = useState({ subject: '', content: '' });

    // Derive unique conversations from messages
    const conversations = React.useMemo(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        const groups = {};
        messages.forEach(msg => {
            const otherId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
            // Keep the latest message for the group preview
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

            // Auto-select first conversation if exists and none selected
            // We need to calculate conversations here manually or rely on effect? 
            // Better to rely on the effect of messages changing, but we want to select the FIRST conversation.
            // Let's just do it in useEffect or after setting messages if we can derive it quickly.
            // Actually, we can just wait for user action or select the first one if the list was empty.
            // The previous logic selected data.messages[0], which might be random message.
            // Let's defer selection logic or keep it simple.
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    // Effect to select the first conversation if nothing is selected and we have conversations
    useEffect(() => {
        if (!selectedChat && conversations.length > 0) {
            setSelectedChat(conversations[0]);
        }
    }, [conversations, selectedChat]);


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

            // Avoid "Re: Re:" pileup
            let subject = selectedChat.subject;
            if (!subject.startsWith('Re:')) {
                subject = `Re: ${subject}`;
            }

            const res = await sendMessage({
                subject: subject,
                content: newMessage,
                receiver_id: receiverId
            });
            // Don't alert on every message in a chat flow
            // alert("Message envoyé !"); 
            setNewMessage("");
            fetchMessages();
        } catch (error) {
            alert("Erreur: " + error.message);
        }
    };

    const handleComposeMessage = async () => {
        if (!composeData.content) {
            alert("Contenu requis");
            return;
        }
        try {
            await sendMessage({
                subject: composeData.subject || "Message",
                content: composeData.content,
                receiver_id: null
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
            </div>

            <div className={`messages-container ${showChatOnMobile ? 'show-chat' : ''}`}>
                <div className="messages-list">
                    {conversations.length === 0 ? <p style={{ padding: '20px' }}>Aucun message</p> :
                        conversations.map(chat => {
                            const user = JSON.parse(localStorage.getItem('user'));
                            const isMeSender = chat.sender_id === user?.id;
                            const otherName = isMeSender ? chat.receiver_name : chat.sender_name;
                            const otherPic = isMeSender ? chat.receiver_picture : chat.sender_picture;
                            // Identify if the selected chat partner is the same as this item's partner
                            const selectedUser = JSON.parse(localStorage.getItem('user'));
                            const selectedOtherId = selectedChat ? (selectedChat.sender_id === selectedUser?.id ? selectedChat.receiver_id : selectedChat.sender_id) : null;
                            const thisOtherId = chat.sender_id === user?.id ? chat.receiver_id : chat.sender_id;
                            const isActive = selectedOtherId === thisOtherId;

                            return (
                                <div
                                    key={chat.id}
                                    onClick={() => handleChatSelect(chat)}
                                    className={`message-item ${isActive ? 'active' : ''}`}
                                >
                                    <div className="message-avatar-wrapper">
                                        {otherPic ? (
                                            <img
                                                src={otherPic}
                                                alt="Avatar"
                                                className="message-avatar-img"
                                            />
                                        ) : (
                                            <div className="message-avatar-placeholder">
                                                {otherName?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="message-text-content">
                                        <div className="message-header">
                                            <strong>{otherName}</strong>
                                            <span>{new Date(chat.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className={`message-preview ${!chat.is_read ? 'unread' : ''}`}>
                                            {chat.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    <button className="fab-new-message" onClick={() => setIsComposing(true)}>
                        <i className="fa-solid fa-plus"></i>
                    </button>
                </div>

                <div className="chat-area">
                    {selectedChat ? (
                        <>
                            <div className="chat-header">
                                <button className="btn-back" onClick={() => setShowChatOnMobile(false)}>
                                    <i className="fa-solid fa-arrow-left"></i>
                                </button>
                                <div className="chat-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    {(() => {
                                        const user = JSON.parse(localStorage.getItem('user'));
                                        const isMeSender = selectedChat.sender_id === user?.id;
                                        const otherName = isMeSender ? selectedChat.receiver_name : selectedChat.sender_name;
                                        const otherPic = isMeSender ? selectedChat.receiver_picture : selectedChat.sender_picture;
                                        const otherEmail = isMeSender ? selectedChat.receiver_email : selectedChat.sender_email;

                                        return (
                                            <>
                                                {otherPic ? (
                                                    <img src={otherPic} alt="Avatar" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div className="user-avatar" style={{ background: '#0b6ad6', color: 'white', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold' }}>
                                                        {otherName?.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 style={{ margin: 0 }}>{otherName}</h3>
                                                    {otherEmail && <span style={{ fontSize: '13px', color: '#64748b', display: 'block' }}>{otherEmail}</span>}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="chat-messages">
                                {(() => {
                                    const currentUser = JSON.parse(localStorage.getItem('user'));
                                    // Identify the other person in the current conversation
                                    const otherPersonId = selectedChat.sender_id === currentUser?.id ? selectedChat.receiver_id : selectedChat.sender_id;

                                    // Filter all messages between current user and the other person
                                    const conversationMessages = messages.filter(m =>
                                        (m.sender_id === currentUser?.id && m.receiver_id === otherPersonId) ||
                                        (m.sender_id === otherPersonId && m.receiver_id === currentUser?.id)
                                    ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

                                    return conversationMessages.map(msg => (
                                        <div key={msg.id} className="message-bubble-container" style={{ alignSelf: msg.sender_id === currentUser?.id ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                            <div className={`message-bubble ${msg.sender_id === currentUser?.id ? 'me' : 'other'}`}>
                                                {msg.content}
                                            </div>
                                            <div className="message-time" style={{ textAlign: msg.sender_id === currentUser?.id ? 'right' : 'left' }}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ));
                                })()}
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

            {
                isComposing && (
                    <div className="modal-overlay">
                        <div className="modal-content-mac">
                            <div className="modal-header-mac">
                                <div className="window-controls">
                                    <div className="control-dot dot-red" onClick={() => setIsComposing(false)}></div>
                                    <div className="control-dot dot-yellow"></div>
                                    <div className="control-dot dot-green"></div>
                                </div>
                                <h3>Nouveau Message</h3>
                                <div style={{ width: '40px' }}></div> {/* Spacer */}
                            </div>
                            <div className="modal-body-mac">
                                <div className="search-user-wrapper">
                                    <i className="fa-solid fa-search search-icon"></i>
                                    <input
                                        type="text"
                                        placeholder="Rechercher un utilisateur (Admin par défaut)"
                                        className="search-user-input"
                                        value={composeData.subject} // Using subject as user search query for now
                                        onChange={e => setComposeData({ ...composeData, subject: e.target.value })}
                                    />
                                </div>

                                <div className="modal-message-area">
                                    <textarea
                                        className="modal-textarea"
                                        placeholder="Votre message..."
                                        value={composeData.content}
                                        onChange={e => setComposeData({ ...composeData, content: e.target.value })}
                                    />
                                    <button className="btn-send-mac" onClick={handleComposeMessage}>
                                        Envoyer <i className="fa-solid fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default DashboardMessages;
