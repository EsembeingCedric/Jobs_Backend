"use client";

import { useState, useEffect, useRef } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { avatarFor } from "../lib/avatar";

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);

  const currentUserId = user?.id;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?redirect=/messages");
      return;
    }
    async function loadConversations() {
      try {
        const res = await fetch(`/api/messages?userId=${user.id}`);
        const data = await res.json();
        setConversations(data.conversations || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, [authLoading, user, router]);

  const openConversation = async (conv) => {
    setActiveConv(conv);
    try {
      const res = await fetch(`/api/messages?userId=${currentUserId}&otherUserId=${conv.otherUser.id}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setTimeout(() => {
        messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 100);
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv) return;
    setSending(true);
    const msgText = newMsg;
    setNewMsg("");
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: msgText,
          senderId: currentUserId,
          receiverId: activeConv.otherUser.id,
        }),
      });
      openConversation(activeConv);
    } catch (e) {
      console.error(e);
      setNewMsg(msgText);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return date.toLocaleDateString();
  };

  const handleBack = () => {
    setActiveConv(null);
    setMessages([]);
  };

  return (
    <AppShell activePage="messages">
      <div className="messages-layout">
        <div className={`conversations-list ${activeConv ? "hidden-mobile" : ""}`}>
          <div className="conversations-header">
            <h2>Messages</h2>
            <p>{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : conversations.length === 0 ? (
            <div className="empty-state" style={{ padding: "60px 20px" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.3 }}>&#9993;</div>
              <h3>No conversations yet</h3>
              <p>Start a conversation from a job listing.</p>
            </div>
          ) : (
            <div className="conversations-items">
              {conversations.map((conv) => (
                <div
                  key={conv.otherUser.id}
                  className={`conversation-item ${activeConv?.otherUser.id === conv.otherUser.id ? "active" : ""}`}
                  onClick={() => openConversation(conv)}
                >
                  <div className="conversation-avatar">
                    <img src={avatarFor(conv.otherUser, 96)} alt={conv.otherUser.name} className="conversation-avatar-img" />
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-name">{conv.otherUser.name}</div>
                    <div className="conversation-preview">{conv.lastMessage.text}</div>
                  </div>
                  <div className="conversation-meta">
                    <span className="conversation-time">{formatTime(conv.lastMessage.createdAt)}</span>
                    {!conv.lastMessage.read && conv.lastMessage.senderId !== currentUserId && (
                      <div className="conversation-unread" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`chat-panel ${activeConv ? "open" : ""}`}>
          {activeConv ? (
            <>
              <div className="chat-header">
                <button className="chat-back" onClick={handleBack} aria-label="Back to conversations">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <div className="chat-header-avatar">
                  <img src={avatarFor(activeConv.otherUser, 96)} alt={activeConv.otherUser.name} className="chat-header-avatar-img" />
                </div>
                <div className="chat-header-info">
                  <div className="chat-header-name">{activeConv.otherUser.name}</div>
                  <div className="chat-header-status">Online</div>
                </div>
              </div>

              <div className="chat-messages">
                {messages.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--gray-400)", fontSize: "0.85rem" }}>
                    No messages yet. Say hello!
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`message-bubble ${msg.senderId === currentUserId ? "message-sent" : "message-received"}`}>
                    {msg.text}
                    <div className="message-time">{formatTime(msg.createdAt)}</div>
                  </div>
                ))}
                <div ref={messagesEnd} />
              </div>

              <form className="chat-input-bar" onSubmit={sendMessage}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a message..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  autoComplete="off"
                />
                <button type="submit" className="chat-send" disabled={sending || !newMsg.trim()}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </form>
            </>
          ) : (
            <div className="empty-state" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "3rem", opacity: 0.15 }}>&#128172;</div>
              <h3 style={{ color: "var(--gray-500)" }}>Select a conversation</h3>
              <p style={{ color: "var(--gray-400)", fontSize: "0.88rem" }}>Choose from the list to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
