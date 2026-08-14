"use client";

import { useState, useEffect, useRef } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { avatarFor } from "../lib/avatar";

export default function FeedPage() {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [toast, setToast] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    try {
      const res = await fetch("/api/statuses?limit=50");
      const data = await res.json();
      setStatuses(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePostStatus = async (e) => {
    e.preventDefault();
    if (!newContent.trim() || !user) return;
    setPosting(true);
    try {
      const res = await fetch("/api/statuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent, userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post");
      setStatuses((prev) => [data.data, ...prev]);
      setNewContent("");
      showToast("Status posted!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (statusId) => {
    if (!user) return showToast("Sign in to like", "error");
    try {
      const res = await fetch(`/api/statuses/${statusId}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed");
      setStatuses((prev) =>
        prev.map((s) => {
          if (s.id !== statusId) return s;
          const likedByMe = data.liked;
          return {
            ...s,
            likes: likedByMe
              ? [...s.likes, { userId: user.id }]
              : s.likes.filter((l) => l.userId !== user.id),
            _count: {
              ...s._count,
              likes: likedByMe ? s._count.likes + 1 : s._count.likes - 1,
            },
          };
        })
      );
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const toggleComments = (statusId) => {
    setExpandedComments((prev) => ({ ...prev, [statusId]: !prev[statusId] }));
  };

  const handleComment = async (statusId) => {
    const text = commentText[statusId];
    if (!text?.trim() || !user) return;
    setSubmittingComment((prev) => ({ ...prev, [statusId]: true }));
    try {
      const res = await fetch(`/api/statuses/${statusId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed");
      setStatuses((prev) =>
        prev.map((s) => {
          if (s.id !== statusId) return s;
          return {
            ...s,
            comments: [...s.comments, data.data],
            _count: { ...s._count, comments: s._count.comments + 1 },
          };
        })
      );
      setCommentText((prev) => ({ ...prev, [statusId]: "" }));
      showToast("Comment added!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [statusId]: false }));
    }
  };

  const handleDeleteStatus = async (statusId) => {
    if (!user || !confirm("Delete this status?")) return;
    try {
      const res = await fetch(`/api/statuses/${statusId}?userId=${user.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setStatuses((prev) => prev.filter((s) => s.id !== statusId));
      showToast("Status deleted");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const formatTime = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const isLiked = (status) => user && status.likes?.some((l) => l.userId === user.id);

  return (
    <AppShell activePage="feed">
      <div className="page-container">
        <div className="page-header">
          <h1>Feed</h1>
          <p>See what everyone is up to</p>
        </div>

        {user && (
          <>
            <form className="status-post-box" onSubmit={handlePostStatus}>
              <div className="status-post-avatar">
                <img src={avatarFor(user, 96)} alt={user.name} className="spa" />
              </div>
              <div className="status-post-input">
                <textarea
                  ref={inputRef}
                  placeholder="What's on your mind?"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={2}
                />
                <div className="status-post-actions">
                  <span className="status-post-hint">{newContent.length} / 500</span>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={posting || !newContent.trim()}>
                    {posting ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </form>
            <button className="status-fab" onClick={() => inputRef.current?.focus()} title="Post a status">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </>
        )}

        {loading ? (
          <div className="loading"><div className="spinner" /><p>Loading feed...</p></div>
        ) : statuses.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.2 }}>&#128172;</div>
            <h3>No statuses yet</h3>
            <p>Be the first to post something!</p>
          </div>
        ) : (
          <div className="statuses-feed">
            {statuses.map((status) => (
              <div key={status.id} className="status-card">
                <div className="status-header">
                  <div className="status-user">
                    <img src={avatarFor(status.user, 96)} alt={status.user.name} className="status-avatar-img" />
                    <div className="status-user-info">
                      <div className="status-user-name">{status.user.name}</div>
                      <div className="status-time">{formatTime(status.createdAt)}</div>
                    </div>
                  </div>
                  {user && user.id === status.userId && (
                    <button className="status-delete" onClick={() => handleDeleteStatus(status.id)} title="Delete">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  )}
                </div>

                <div className="status-content">{status.content}</div>

                <div className="status-stats">
                  <span>{status._count.likes > 0 && `${status._count.likes} like${status._count.likes !== 1 ? "s" : ""}`}</span>
                  <span>{status._count.comments > 0 && `${status._count.comments} comment${status._count.comments !== 1 ? "s" : ""}`}</span>
                </div>

                <div className="status-actions">
                  <button
                    className={`status-action-btn ${isLiked(status) ? "liked" : ""}`}
                    onClick={() => handleLike(status.id)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked(status) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <span>Like</span>
                  </button>
                  <button className="status-action-btn" onClick={() => toggleComments(status.id)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span>Comment</span>
                  </button>
                </div>

                {expandedComments[status.id] && (
                  <div className="status-comments-section">
                    {user && (
                      <form className="status-comment-form" onSubmit={(e) => { e.preventDefault(); handleComment(status.id); }}>
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentText[status.id] || ""}
                          onChange={(e) => setCommentText((prev) => ({ ...prev, [status.id]: e.target.value }))}
                        />
                        <button type="submit" className="btn btn-primary btn-sm" disabled={submittingComment[status.id] || !commentText[status.id]?.trim()}>
                          {submittingComment[status.id] ? "..." : "Send"}
                        </button>
                      </form>
                    )}
                    {status.comments.length === 0 ? (
                      <p className="status-no-comments">No comments yet</p>
                    ) : (
                      <div className="status-comments-list">
                        {status.comments.map((comment) => (
                          <div key={comment.id} className="status-comment">
                            <img src={avatarFor(comment.user, 80)} alt={comment.user.name} className="sc-avatar-img" />
                            <div className="sc-body">
                              <div className="sc-header">
                                <span className="sc-name">{comment.user.name}</span>
                                <span className="sc-time">{formatTime(comment.createdAt)}</span>
                              </div>
                              <div className="sc-text">{comment.content}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </AppShell>
  );
}
