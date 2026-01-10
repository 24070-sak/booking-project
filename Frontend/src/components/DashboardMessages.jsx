import React, { useState } from 'react';
import { messagesData } from '../data/mockData';
import '../styles/components/dashboardMessages.css';

const DashboardMessages = () => {
    const [selectedChat, setSelectedChat] = useState(messagesData[0]);
    const [showChatOnMobile, setShowChatOnMobile] = useState(false);

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        setShowChatOnMobile(true);
    };

    const handleBackToList = () => {
        setShowChatOnMobile(false);
    };

    return (
        <div className="dashboard-content dashboard-messages-content">
            <h2>Messages</h2>

            <div className={`messages-container ${showChatOnMobile ? 'show-chat' : ''}`}>
                {/* Sidebar List */}
                <div className="messages-list">
                    {messagesData.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => handleChatSelect(chat)}
                            className={`message-item ${selectedChat.id === chat.id ? 'active' : ''}`}
                        >
                            <div className="message-header">
                                <strong>{chat.sender}</strong>
                                <span>{chat.date}</span>
                            </div>
                            <div className={`message-preview ${!chat.read ? 'unread' : ''}`}>
                                {chat.subject}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chat Area */}
                <div className="chat-area">
                    {selectedChat ? (
                        <>
                            <div className="chat-header">
                                <button className="btn-back" onClick={handleBackToList}>
                                    <i className="fa-solid fa-arrow-left"></i>
                                </button>
                                <img src={selectedChat.avatar} alt={selectedChat.sender} className="chat-avatar" />
                                <div className="chat-info">
                                    <h3>{selectedChat.sender}</h3>
                                    <span>{selectedChat.subject}</span>
                                </div>
                            </div>

                            <div className="chat-messages">
                                {selectedChat.messages.map((msg, index) => (
                                    <div key={index} className="message-bubble-container" style={{ alignSelf: msg.isMe ? 'flex-end' : 'flex-start' }}>
                                        <div className={`message-bubble ${msg.isMe ? 'me' : 'other'}`}>
                                            {msg.text}
                                        </div>
                                        <div className="message-time" style={{ textAlign: msg.isMe ? 'right' : 'left' }}>{msg.time}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="chat-input-area">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="chat-input"
                                />
                                <button className="btn-send">
                                    <i className="fa-solid fa-paper-plane"></i>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <i className="fa-regular fa-comments" style={{ fontSize: '48px', color: '#cbd5e0' }}></i>
                            Select a message to view
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardMessages;
