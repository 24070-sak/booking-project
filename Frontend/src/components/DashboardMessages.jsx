import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMessages,
  sendMessage,
  markAsRead,
  searchUsers,
} from "../services/messageService";
import { showError, showSuccess } from "../utils/alerts";
import { resolveImageUrl } from "../utils/urlHelper";
import "../styles/components/dashboardMessages.css";

const QUICK_REPLIES = [
  "D'accord, merci ! ",
  "Je vous contacte bientôt.",
  "Pouvez-vous m'en dire plus ?",
  "Merci pour votre réponse !",
  "Je vais vérifier ça.",
  "Bien reçu ",
];

const DashboardMessages = ({ targetSenderId, lastChatbotMsg }) => {
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const navigate = useNavigate();

  // Auto-select chat if targetSenderId is provided
  useEffect(() => {
    if (targetSenderId && messages.length > 0) {
      const chatToSelect = messages.find(
        (m) =>
          m.sender_id === Number(targetSenderId) ||
          m.receiver_id === Number(targetSenderId),
      );
      if (chatToSelect) {
        handleChatSelect(chatToSelect);
      }
    }
  }, [targetSenderId, messages]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const chatMessagesRef = useRef(null);

  // Composer State
  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState({
    subject: "",
    content: "",
    receiver_id: null,
  });

  // Search Users State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searching, setSearching] = useState(false);

  // Chatbot specific states
  const [chatbotMessages, setChatbotMessages] = useState([
    { from: "bot", text: "Comment puis-je vous aider ? " },
  ]);
  const [chatbotInput, setChatbotInput] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const SUGGESTED_QUESTIONS = [
    "Montrez-moi les hôtels les moins chers",
    "Quelles chambres sont disponibles cette semaine ?",
    "Trouvez des hôtels à Nouakchott",
    "Montrez-moi les photos des hôtels",
    "Quelles sont les meilleures offres du moment ?",
  ];

  useEffect(() => {
    if (selectedChat?.isChatbot) {
      chatMessagesRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [chatbotMessages, botTyping, selectedChat]);

  const handleChatbotSend = async (customMsg = null) => {
    const msgToSend = customMsg || chatbotInput;
    if (!msgToSend.trim()) return;

    const userMsg = msgToSend.trim();
    // 1. Afficher le message de l'utilisateur
    setChatbotMessages((prev) => [...prev, { from: "user", text: userMsg }]);
    setChatbotInput("");
    setBotTyping(true);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    try {
      // 2. Envoyer la question à TON serveur Flask (qui contient Langchain + Word)
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: userMsg,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      // 3. Afficher la réponse de Flask dans le chat
      setChatbotMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: data.answer || "Désolé, je n'ai pas pu générer une réponse.",
        },
      ]);
    } catch (err) {
      console.error("Erreur Chatbot:", err);
      setChatbotMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Désolé, je n'arrive pas à joindre le serveur. Vérifiez que l'API est lancée.",
        },
      ]);
    } finally {
      setBotTyping(false);
    }
  };

  // Derive unique conversations from messages
  const conversations = React.useMemo(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const groups = {};
    messages.forEach((msg) => {
      const isMeSender = msg.sender_id === user?.id;
      const role = isMeSender ? msg.receiver_role : msg.sender_role;
      const name = isMeSender ? msg.receiver_name : msg.sender_name;
      let otherId = isMeSender ? msg.receiver_id : msg.sender_id;

      const amAdmin = user?.role === "admin";
      const amManager = user?.role === "manager";

      // Hide System chats from Admin
      if (amAdmin && name === "Système") {
        return;
      }

      // For clients only: collapse all admin/system chats into a single unified thread.
      // Managers must see each individual conversation separately.
      if (
        !amAdmin &&
        !amManager &&
        (role === "admin" ||
          name === "Système" ||
          name === "Administration" ||
          name === "Administration Hotely" ||
          msg.receiver_id === null ||
          msg.sender_id === 0)
      ) {
        otherId = "admin-unified";
      }

      if (
        !groups[otherId] ||
        new Date(msg.created_at) > new Date(groups[otherId].created_at)
      ) {
        groups[otherId] = msg;
      }
    });

    const sortedConversations = Object.values(groups).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );

    // Pin Chatbot & Admin - virtual conversations (For clients and managers)
    if (user?.role === "client" || user?.role === "manager") {
      const adminChatIndex = sortedConversations.findIndex((c) => {
        const isMeSender = c.sender_id === user?.id;
        const role = isMeSender ? c.receiver_role : c.sender_role;
        const name = isMeSender ? c.receiver_name : c.sender_name;
        return (
          role === "admin" ||
          name === "Système" ||
          name === "Administration" ||
          name === "Administration Hotely" ||
          c.receiver_id === null ||
          c.sender_id === 0
        );
      });
      let adminConv;

      if (adminChatIndex !== -1) {
        adminConv = sortedConversations[adminChatIndex];
        sortedConversations.splice(adminChatIndex, 1);
      } else {
        const hasUnread = messages.some((m) => {
          const isMeSender = m.sender_id === user?.id;
          const role = isMeSender ? m.receiver_role : m.sender_role;
          const name = isMeSender ? m.receiver_name : m.sender_name;
          return (
            !m.is_read &&
            m.receiver_id === user?.id &&
            (role === "admin" ||
              name === "Système" ||
              name === "Administration" ||
              name === "Administration Hotely" ||
              m.sender_id === null ||
              m.sender_id === 0)
          );
        });
        adminConv = {
          id: "admin-conversation-virtual",
          sender_name: "Administration Hotely",
          sender_picture: null,
          content: "Contactez notre support ici",
          created_at: new Date().toISOString(),
          is_read: !hasUnread,
          receiver_id: null,
          subject: "Support Client",
        };
      }

      const conversations_to_return = [...sortedConversations];
      conversations_to_return.unshift(adminConv);

      // Pin Chatbot only for clients
      if (user?.role === "client") {
        const botPreviewContent =
          lastChatbotMsg ||
          localStorage.getItem("lastChatbotMsg") ||
          "Comment puis-je vous aider ?";
        const chatbotConv = {
          id: "chatbot-virtual",
          isChatbot: true,
          sender_name: "Assistant Hotely",
          sender_picture: null,
          content: botPreviewContent,
          created_at: new Date().toISOString(),
          is_read: true,
        };
        conversations_to_return.unshift(chatbotConv);
      }

      return conversations_to_return;
    }

    return sortedConversations;
  }, [messages, lastChatbotMsg]);

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
    if (chat.isChatbot) {
      setSelectedChat(chat);
      setShowChatOnMobile(true);
      // If on the messages page, trigger the chatbot open state if possible
      if (window.openChatbot) window.openChatbot();
      return;
    }
    setSelectedChat(chat);
    setIsComposing(false);
    setShowChatOnMobile(true);
    setShowSuggestions(false);
    if (!chat.is_read) {
      try {
        let idToMark = chat.id;
        if (chat.id === "admin-conversation-virtual") {
          const user = JSON.parse(localStorage.getItem("user"));
          const latestUnread = messages.find((m) => {
            const isMeSender = m.sender_id === user?.id;
            const role = isMeSender ? m.receiver_role : m.sender_role;
            const name = isMeSender ? m.receiver_name : m.sender_name;
            return (
              !m.is_read &&
              m.receiver_id === user?.id &&
              (role === "admin" ||
                name === "Système" ||
                name === "Administration" ||
                name === "Administration Hotely" ||
                m.sender_id === null ||
                m.sender_id === 0)
            );
          });
          if (latestUnread) idToMark = latestUnread.id;
          else return;
        }
        await markAsRead(idToMark);
        setMessages((prev) =>
          prev.map((m) => (m.id === idToMark ? { ...m, is_read: true } : m)),
        );
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
  };

  const handleSendMessage = async (content = null) => {
    const msgToSend = content || newMessage;
    if (!msgToSend.trim() || !selectedChat) return;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      let receiverId;
      if (selectedChat.id === "admin-conversation-virtual") {
        receiverId = null; // Target admin
      } else {
        receiverId =
          selectedChat.sender_id === user?.id
            ? selectedChat.receiver_id
            : selectedChat.sender_id;
      }

      let subject = selectedChat.subject || "Nouveau message";
      if (subject && !subject.startsWith("Re:")) {
        subject = `Re: ${subject} `;
      }

      await sendMessage({
        subject: subject,
        content: msgToSend,
        receiver_id: receiverId,
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
    setComposeData((prev) => ({ ...prev, receiver_id: user.id }));
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
        receiver_id: composeData.receiver_id, // null for admin, or specific user id
      });
      const target = selectedUser
        ? `${selectedUser.first_name} ${selectedUser.last_name}`
        : "l'administration";
      showSuccess(`Message envoyé à ${target} !`);
      setIsComposing(false);
      setComposeData({ subject: "", content: "", receiver_id: null });
      setSelectedUser(null);
      setSearchQuery("");
      setSearchResults([]);
      fetchMessages();
    } catch (error) {
      showError("Erreur: " + error.message);
    }
  };

  const openComposer = () => {
    setIsComposing(true);
    setSelectedUser(null);
    setSearchQuery("");
    setSearchResults([]);
    setComposeData({ subject: "", content: "", receiver_id: null });
  };

  if (loading)
    return (
      <div className="messages-loading">
        <div className="loading-spinner"></div>
        <span>Chargement des messages...</span>
      </div>
    );

  // Helper to get the "other person" info from a chat message
  const getOtherPerson = (chat) => {
    if (chat.isChatbot)
      return { name: "Assistant Hotely", picture: null, email: "" };
    const user = JSON.parse(localStorage.getItem("user"));
    const isMeSender = chat.sender_id === user?.id;
    const name = isMeSender ? chat.receiver_name : chat.sender_name;
    const role = isMeSender ? chat.receiver_role : chat.sender_role;

    let finalName = name || "Inconnu";
    // Standardize Admin/System names
    const amAdmin = user?.role === "admin";
    const amManager = user?.role === "manager";

    if (
      !amAdmin &&
      !amManager &&
      (role === "admin" ||
        name === "Système" ||
        name === "Administration" ||
        name === "Administration Hotely" ||
        chat.receiver_id === null ||
        chat.sender_id === 0)
    ) {
      finalName = "Administration Hotely";
    } else if (role === "manager") {
      finalName = finalName
        .replace(/Hôtel Manager/gi, "Hôtel")
        .replace(/Manager/gi, "")
        .trim();
      if (!finalName) finalName = "Hôtel";
    }

    return {
      name: finalName,
      picture: resolveImageUrl(
        isMeSender ? chat.receiver_picture : chat.sender_picture,
      ),
      email: isMeSender
        ? user?.role === "admin"
          ? chat.receiver_email
          : ""
        : chat.sender_email,
    };
  };

  return (
    <div className="dashboard-content dashboard-messages-content">
      <div
        className={`messages-container ${showChatOnMobile ? "show-chat" : ""}`}
      >
        {/* ========== CONVERSATIONS LIST ========== */}
        <div className="messages-list">
          {/* The NEW MESSAGE button has been removed by request */}

          {conversations.length === 0 ? (
            <div className="no-conversations">
              <i
                className="fa-regular fa-envelope"
                style={{ fontSize: "32px", color: "#c3d9cc" }}
              ></i>
              <p>Aucun message</p>
            </div>
          ) : (
            conversations.map((chat) => {
              const currentUser = JSON.parse(localStorage.getItem("user"));
              const other = getOtherPerson(chat);
              const thisOtherId =
                chat.sender_id === currentUser?.id
                  ? chat.receiver_id
                  : chat.sender_id;
              const selectedOtherId = selectedChat
                ? selectedChat.sender_id === currentUser?.id
                  ? selectedChat.receiver_id
                  : selectedChat.sender_id
                : null;
              const isActive =
                selectedOtherId === thisOtherId ||
                (selectedChat?.isChatbot && chat.isChatbot);

              return (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  className={`message-item ${isActive ? "active" : ""} ${!chat.is_read ? "unread-item" : ""} ${chat.isChatbot ? "chatbot-item" : ""}`}
                >
                  <div className="message-avatar-wrapper">
                    {chat.isChatbot ? (
                      <div
                        className="message-avatar-placeholder chatbot-avatar-bg"
                        style={{ backgroundColor: "#006233", color: "white" }}
                      >
                        <i className="fa-solid fa-robot"></i>
                      </div>
                    ) : (
                      <>
                        {other.picture ? (
                          <img
                            src={other.picture}
                            alt={other.name}
                            className="message-avatar-img"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="message-avatar-placeholder"
                          style={{ display: other.picture ? "none" : "flex" }}
                        >
                          <i className="fa-solid fa-user"></i>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="message-text-content">
                    <div className="message-header">
                      <strong>
                        {chat.isChatbot
                          ? "Assistant IA"
                          : other.name || "Inconnu"}
                      </strong>
                      {chat.isChatbot ? (
                        <span
                          className="chatbot-badge"
                          style={{
                            backgroundColor: "#006233",
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                          }}
                        >
                          IA
                        </span>
                      ) : (
                        <span>
                          {new Date(chat.created_at).toLocaleDateString(
                            "fr-FR",
                            { day: "2-digit", month: "short" },
                          )}
                        </span>
                      )}
                    </div>
                    <div
                      className={`message-preview ${!chat.is_read ? "unread" : ""}`}
                    >
                      {chat.content}
                    </div>
                  </div>
                  {chat.isChatbot && (
                    <i
                      className="fa-solid fa-thumbtack pin-icon"
                      style={{
                        color: "#006233",
                        marginLeft: "auto",
                        fontSize: "12px",
                      }}
                    ></i>
                  )}
                  {!chat.isChatbot && !chat.is_read && (
                    <div className="unread-dot"></div>
                  )}
                </div>
              );
            })
          )}
          {/* end conversation list */}
        </div>

        {/* ========== CHAT AREA ========== */}
        <div className="chat-area">
          {selectedChat ? (
            selectedChat.isChatbot ? (
              <div
                className="chatbot-integrated-view"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div className="chat-header">
                  <button
                    className="chat-btn-back-mobile"
                    onClick={() => setShowChatOnMobile(false)}
                  >
                    <i className="fa-solid fa-arrow-left"></i>
                  </button>
                  <div
                    className="chatbot-avatar"
                    style={{
                      background: "#006233",
                      color: "white",
                      padding: "8px",
                      borderRadius: "50%",
                    }}
                  >
                    <i className="fa-solid fa-robot"></i>
                  </div>
                  <div className="chat-info">
                    <h3>Assistant Hotely</h3>
                    <div
                      className="chatbot-status-pill"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        color: "#6b8c7a",
                      }}
                    >
                      <span
                        className="status-dot online"
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "#2ecc71",
                        }}
                      ></span>
                      <span>En ligne</span>
                    </div>
                  </div>
                </div>

                <div
                  className="chat-messages chatbot-messages-area"
                  ref={chatMessagesRef}
                  style={{ flex: 1, overflowY: "auto", padding: "20px" }}
                >
                  {chatbotMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`chatbot-msg-wrapper ${msg.from}`}
                      style={{
                        display: "flex",
                        marginBottom: "16px",
                        flexDirection:
                          msg.from === "user" ? "row-reverse" : "row",
                      }}
                    >
                      {msg.from === "bot" && (
                        <div
                          className="bot-msg-avatar-small"
                          style={{
                            background: "#006233",
                            color: "white",
                            minWidth: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "12px",
                          }}
                        >
                          <i className="fa-solid fa-robot"></i>
                        </div>
                      )}
                      <div
                        className={`chatbot-msg-bubble ${msg.from}`}
                        style={{
                          background:
                            msg.from === "user" ? "#006233" : "#f0f7f3",
                          color: msg.from === "user" ? "white" : "#1e3a2b",
                          padding: "12px 16px",
                          borderRadius: "16px",
                          borderBottomLeftRadius:
                            msg.from === "bot" ? "4px" : "16px",
                          borderBottomRightRadius:
                            msg.from === "user" ? "4px" : "16px",
                          maxWidth: "75%",
                        }}
                      >
                        {msg.text}
                        {/* Rich Hotels List */}
                        {msg.hotels && (
                          <div
                            className="bot-hotels-compact-grid"
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(140px, 1fr))",
                              gap: "10px",
                              marginTop: "12px",
                            }}
                          >
                            {msg.hotels.map((h) => (
                              <div
                                key={h.id}
                                className="bot-hotel-mini-card"
                                onClick={() => navigate(`/hotel/${h.id}`)}
                                style={{
                                  cursor: "pointer",
                                  transition: "transform 0.2s",
                                  background: "white",
                                  borderRadius: "8px",
                                  padding: "6px",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.transform =
                                    "scale(1.02)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.transform = "scale(1)")
                                }
                              >
                                <img
                                  src={resolveImageUrl(h.image_url)}
                                  alt={h.name}
                                  style={{
                                    width: "100%",
                                    height: "80px",
                                    objectFit: "cover",
                                    borderRadius: "6px",
                                    marginBottom: "8px",
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                                <div className="mini-card-text">
                                  <strong
                                    style={{
                                      fontSize: "12px",
                                      display: "block",
                                      color: "#1a1a1a",
                                    }}
                                  >
                                    {h.name}
                                  </strong>
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#666",
                                      display: "block",
                                    }}
                                  >
                                    {h.location}
                                  </span>
                                  {h.lowest_price != null && (
                                    <span
                                      style={{
                                        fontSize: "11px",
                                        color: "#006233",
                                        fontWeight: "600",
                                      }}
                                    >
                                      Dès {h.lowest_price} €
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Rooms List */}
                        {msg.rooms && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                              marginTop: "12px",
                            }}
                          >
                            {msg.rooms.map((r) => (
                              <div
                                key={r.id}
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  alignItems: "center",
                                  background: "#e3ece7",
                                  padding: "8px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  transition: "background 0.2s",
                                }}
                                onClick={() => navigate(`/room/${r.id}`)}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background = "#d0dfd7")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background = "#e3ece7")
                                }
                              >
                                <img
                                  src={resolveImageUrl(r.image_url)}
                                  alt={r.name}
                                  style={{
                                    width: "48px",
                                    height: "48px",
                                    objectFit: "cover",
                                    borderRadius: "6px",
                                    flexShrink: 0,
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                                <div style={{ flex: 1 }}>
                                  <strong
                                    style={{
                                      fontSize: "12px",
                                      color: "#006233",
                                      display: "block",
                                    }}
                                  >
                                    {r.name}
                                  </strong>
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#6b8c7a",
                                      display: "block",
                                    }}
                                  >
                                    {r.hotel_name} • {r.hotel_location}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: "700",
                                      color: "#1a1a1a",
                                    }}
                                  >
                                    {r.price_per_night} €/nuit
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Rich Hotel Details with Rooms */}
                        {msg.hotelDetails && (
                          <div
                            className="bot-hotel-details-view"
                            style={{ marginTop: "10px" }}
                          >
                            <div
                              style={{
                                position: "relative",
                                borderRadius: "8px",
                                overflow: "hidden",
                                cursor: "pointer",
                                transition: "transform 0.2s",
                              }}
                              onClick={() =>
                                navigate(`/hotel/${msg.hotelDetails.id}`)
                              }
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.transform =
                                  "scale(1.02)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.transform = "scale(1)")
                              }
                            >
                              <img
                                src={resolveImageUrl(
                                  msg.hotelDetails.image_url,
                                )}
                                alt={msg.hotelDetails.name}
                                style={{
                                  width: "100%",
                                  height: "120px",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  padding: "10px",
                                  background:
                                    "linear-gradient(transparent, rgba(0,0,0,0.8))",
                                  color: "white",
                                }}
                              >
                                <strong style={{ display: "block" }}>
                                  {msg.hotelDetails.name}
                                </strong>
                                <span style={{ fontSize: "11px" }}>
                                  <i className="fa-solid fa-location-dot"></i>{" "}
                                  {msg.hotelDetails.location}
                                </span>
                              </div>
                            </div>
                            {msg.hotelDetails.rooms?.length > 0 && (
                              <div
                                style={{
                                  marginTop: "10px",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "8px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "12px",
                                    color: "#6b8c7a",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Chambres recommandées :
                                </span>
                                {msg.hotelDetails.rooms.slice(0, 3).map((r) => (
                                  <div
                                    key={r.id}
                                    style={{
                                      display: "flex",
                                      gap: "8px",
                                      alignItems: "center",
                                      background: "#e3ece7",
                                      padding: "6px",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      transition: "background 0.2s",
                                    }}
                                    onClick={() => navigate(`/room/${r.id}`)}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.background =
                                        "#d0dfd7")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.background =
                                        "#e3ece7")
                                    }
                                  >
                                    <img
                                      src={resolveImageUrl(r.image_url)}
                                      alt={r.name}
                                      style={{
                                        width: "40px",
                                        height: "40px",
                                        objectFit: "cover",
                                        borderRadius: "4px",
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                    <div
                                      style={{
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                      }}
                                    >
                                      <strong
                                        style={{
                                          fontSize: "12px",
                                          color: "#006233",
                                        }}
                                      >
                                        {r.name}
                                      </strong>
                                      <span
                                        style={{
                                          fontSize: "10px",
                                          color: "#6b8c7a",
                                        }}
                                      >
                                        {r.max_guests} max • {r.price_per_night}{" "}
                                        €/nuit
                                      </span>
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
                    <div
                      className="chatbot-msg-wrapper bot"
                      style={{ display: "flex", marginBottom: "16px" }}
                    >
                      <div
                        className="bot-msg-avatar-small"
                        style={{
                          background: "#006233",
                          color: "white",
                          minWidth: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "12px",
                        }}
                      >
                        <i className="fa-solid fa-robot"></i>
                      </div>
                      <div
                        className="chatbot-msg-bubble bot typing"
                        style={{
                          background: "#f0f7f3",
                          padding: "12px 16px",
                          borderRadius: "16px",
                          borderBottomLeftRadius: "4px",
                          maxWidth: "75%",
                          display: "flex",
                          gap: "4px",
                        }}
                      >
                        <span
                          className="typing-dot"
                          style={{
                            width: "6px",
                            height: "6px",
                            backgroundColor: "#abc3b5",
                            borderRadius: "50%",
                            animation: "typing 1.4s infinite ease-in-out both",
                          }}
                        ></span>
                        <span
                          className="typing-dot"
                          style={{
                            width: "6px",
                            height: "6px",
                            backgroundColor: "#abc3b5",
                            borderRadius: "50%",
                            animation: "typing 1.4s infinite ease-in-out both",
                            animationDelay: "0.2s",
                          }}
                        ></span>
                        <span
                          className="typing-dot"
                          style={{
                            width: "6px",
                            height: "6px",
                            backgroundColor: "#abc3b5",
                            borderRadius: "50%",
                            animation: "typing 1.4s infinite ease-in-out both",
                            animationDelay: "0.4s",
                          }}
                        ></span>
                      </div>
                    </div>
                  )}

                  {/* Suggestions only visible if bot not typing */}
                  {!botTyping && (
                    <div
                      className="chatbot-interactive-suggestions"
                      style={{ marginTop: "20px" }}
                    >
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#6b8c7a",
                          marginBottom: "10px",
                        }}
                      >
                        Suggestions :
                      </p>
                      <div
                        className="suggestions-scroll"
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {SUGGESTED_QUESTIONS.map((q, idx) => (
                          <button
                            key={idx}
                            className="suggestion-pill"
                            onClick={() => handleChatbotSend(q)}
                            style={{
                              background: "#ffffff",
                              border: "1px solid #d0dfd7",
                              padding: "8px 14px",
                              borderRadius: "20px",
                              fontSize: "13px",
                              color: "#006233",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f0f7f3";
                              e.currentTarget.style.borderColor = "#006233";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#ffffff";
                              e.currentTarget.style.borderColor = "#d0dfd7";
                            }}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ height: "10px" }} />
                </div>

                <div
                  className="chat-input-wrapper integrated-bot-input"
                  style={{
                    padding: "16px",
                    background: "white",
                    borderTop: "1px solid #edf2f7",
                  }}
                >
                  <div
                    className="chat-input-area"
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="text"
                      className="chat-input"
                      placeholder={
                        botTyping
                          ? "L'assistant réfléchit..."
                          : "Posez votre question à l'assistant..."
                      }
                      value={chatbotInput}
                      onChange={(e) => setChatbotInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && !botTyping && handleChatbotSend()
                      }
                      disabled={botTyping}
                      style={{
                        flex: 1,
                        padding: "12px 18px",
                        borderRadius: "24px",
                        border: "1px solid #d0dfd7",
                        outline: "none",
                        background: botTyping ? "#f0f0f0" : "#f8faf9",
                        cursor: botTyping ? "not-allowed" : "text",
                      }}
                    />
                    <button
                      className="btn-send"
                      onClick={() => handleChatbotSend()}
                      disabled={!chatbotInput.trim() || botTyping}
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background:
                          botTyping || !chatbotInput.trim()
                            ? "#ccc"
                            : "#006233",
                        color: "white",
                        border: "none",
                        cursor:
                          botTyping || !chatbotInput.trim()
                            ? "not-allowed"
                            : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justify_content: "center",
                      }}
                    >
                      <i className="fa-solid fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              (() => {
                const currentUser = JSON.parse(localStorage.getItem("user"));
                const other = getOtherPerson(selectedChat);
                const otherPersonId = (() => {
                  if (selectedChat.id === "admin-conversation-virtual")
                    return null;
                  const isMeSender = selectedChat.sender_id === currentUser?.id;
                  if (isMeSender) return selectedChat.receiver_id;
                  return selectedChat.sender_id;
                })();

                const conversationMessages = messages
                  .filter((m) => {
                    const isMe = m.sender_id === currentUser?.id;
                    const isOther =
                      m.sender_id === otherPersonId && otherPersonId !== null;
                    const amAdmin = currentUser?.role === "admin";

                    if (otherPersonId === null) {
                      // For client/manager viewing Support chat
                      if (
                        isMe &&
                        (m.receiver_id === null || m.receiver_id === 0)
                      )
                        return true;
                      if (
                        m.receiver_id === currentUser?.id &&
                        (m.sender_id === null ||
                          m.sender_id === 0 ||
                          m.sender_role === "admin")
                      )
                        return true;
                      return false;
                    }

                    // For Admin viewing a specific user
                    if (amAdmin) {
                      return (
                        (isMe && m.receiver_id === otherPersonId) ||
                        (isOther &&
                          (m.receiver_id === currentUser?.id ||
                            m.receiver_id === null ||
                            m.receiver_id === 0))
                      );
                    }

                    return (
                      (isMe && m.receiver_id === otherPersonId) ||
                      (isOther && m.receiver_id === currentUser?.id)
                    );
                  })
                  .sort(
                    (a, b) => new Date(a.created_at) - new Date(b.created_at),
                  );

                return (
                  <>
                    {/* Chat Header */}
                    <div className="chat-header">
                      <button
                        className="chat-btn-back-mobile"
                        onClick={() => setShowChatOnMobile(false)}
                      >
                        <i className="fa-solid fa-arrow-left"></i>
                      </button>
                      <div className="chat-header-avatar">
                        {other.picture ? (
                          <img
                            src={other.picture}
                            alt={other.name}
                            className="chat-header-avatar-img"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="chat-header-avatar-placeholder"
                          style={{ display: other.picture ? "none" : "flex" }}
                        >
                          <i className="fa-solid fa-user"></i>
                        </div>
                        <span className="chat-online-dot"></span>
                      </div>
                      <div className="chat-info">
                        <h3>{other.name || "Inconnu"}</h3>
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
                          const showTime =
                            idx === 0 ||
                            new Date(msg.created_at) -
                              new Date(
                                conversationMessages[idx - 1].created_at,
                              ) >
                              5 * 60 * 1000;

                          return (
                            <React.Fragment key={msg.id}>
                              {showTime && (
                                <div className="msg-time-separator">
                                  {new Date(msg.created_at).toLocaleString(
                                    "fr-FR",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      day: "2-digit",
                                      month: "short",
                                    },
                                  )}
                                </div>
                              )}
                              <div
                                className={`message-bubble-wrapper ${isMe ? "me" : "other"}`}
                              >
                                {!isMe && (
                                  <div className="bubble-avatar">
                                    {other.picture ? (
                                      <img
                                        src={other.picture}
                                        alt=""
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                          e.target.nextSibling.style.display =
                                            "flex";
                                        }}
                                      />
                                    ) : null}
                                    <span
                                      style={{
                                        display: other.picture
                                          ? "none"
                                          : "flex",
                                      }}
                                    >
                                      <i className="fa-solid fa-user"></i>
                                    </span>
                                  </div>
                                )}
                                <div
                                  className={`message-bubble ${isMe ? "me" : "other"}`}
                                >
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
                        className={`btn-suggest ${showSuggestions ? "active" : ""}`}
                        onClick={() => setShowSuggestions((s) => !s)}
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
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
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
              })()
            )
          ) : (
            <div className="no-chat-selected">
              <i
                className="fa-regular fa-comments"
                style={{ fontSize: "52px", color: "#c3d9cc" }}
              ></i>
              <p>Sélectionnez une conversation</p>
              {/* Removed btn-start-new per user request */}
            </div>
          )}
        </div>
      </div>

      {/* ========== COMPOSE MODAL ========== */}
      {isComposing && (
        <div
          className="modern-modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains("modern-modal-overlay"))
              setIsComposing(false);
          }}
        >
          <div className="modern-compose-modal">
            <div className="modal-header-premium">
              <h3>Nouveau Message</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsComposing(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="modal-body-modern">
              {/* Search Section */}
              <div className="form-group-modern">
                <label>Destinataire</label>
                <div className="modern-search-wrapper">
                  <input
                    type="text"
                    placeholder="Nom ou email..."
                    className="modern-form-input no-icon"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (selectedUser) setSelectedUser(null);
                    }}
                  />
                  {searching && <div className="modern-spinner-mini"></div>}
                </div>

                {selectedUser && (
                  <div className="modern-selected-user">
                    <div className="user-info-pill">
                      <i className="fa-solid fa-user"></i>
                      <span>
                        {selectedUser.first_name} {selectedUser.last_name}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedUser(null);
                          setSearchQuery("");
                          setComposeData((prev) => ({
                            ...prev,
                            receiver_id: null,
                          }));
                        }}
                      >
                        <i className="fa-solid fa-x"></i>
                      </button>
                    </div>
                  </div>
                )}

                {!selectedUser && searchQuery.length >= 2 && (
                  <div className="modern-results-dropdown">
                    {searchResults.length > 0
                      ? searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="modern-result-item"
                            onClick={() => handleSelectUserForCompose(user)}
                          >
                            <img
                              src={
                                resolveImageUrl(user.profile_picture) ||
                                `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}`
                              }
                              alt=""
                              className="avatar-sm"
                            />
                            <div className="item-text">
                              <span className="name">
                                {user.first_name} {user.last_name}
                              </span>
                              <span className="email">{user.email}</span>
                            </div>
                          </div>
                        ))
                      : !searching && (
                          <div className="search-empty">
                            Aucun utilisateur trouvé
                          </div>
                        )}
                  </div>
                )}
              </div>

              {/* Message Body */}
              <div className="form-group-modern full-flex">
                <label>Message</label>
                <textarea
                  className="modern-form-textarea"
                  placeholder="Votre message ici..."
                  value={composeData.content}
                  onChange={(e) =>
                    setComposeData({ ...composeData, content: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="modal-footer-modern">
              <div className="footer-actions">
                <button
                  className="btn-cancel-flat"
                  onClick={() => setIsComposing(false)}
                >
                  Annuler
                </button>
                <button
                  className="btn-send-solid"
                  onClick={handleComposeMessage}
                  disabled={
                    !composeData.content ||
                    (searchQuery.length > 0 && !selectedUser)
                  }
                >
                  Envoyer <i className="fa-solid fa-paper-plane"></i>
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
