"use client";

import { useState, useEffect, useRef } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { avatarFor } from "../lib/avatar";

export default function ProfilePage() {
  const { user: authUser, login, logout } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [isWorker, setIsWorker] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    password: "",
    confirmPassword: "",
  });

  const currentUserId = authUser?.id;

  useEffect(() => {
    if (!currentUserId) return;
    async function load() {
      try {
        const res = await fetch(`/api/users/${currentUserId}`);
        const data = await res.json();
        setUser(data);
        setEditForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          bio: data.bio || "",
          password: "",
          confirmPassword: "",
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUserId]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch(`/api/users/${currentUserId}/avatar`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUser((prev) => ({ ...prev, avatar: data.avatar }));
      if (authUser) login({ ...authUser, avatar: data.avatar });
      showToast("Photo updated!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.email) {
      showToast("Name and email are required", "error");
      return;
    }
    if (editForm.password && editForm.password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    if (editForm.password !== editForm.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || null,
        bio: editForm.bio || null,
      };
      if (editForm.password) body.password = editForm.password;

      const res = await fetch(`/api/users/${currentUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      setUser((prev) => ({ ...prev, ...data.user }));
      if (authUser) login({ ...authUser, ...data.user });
      showToast("Settings saved!");
      setEditForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell activePage="profile">
        <div className="page-container"><div className="loading"><div className="spinner" /><p>Loading profile...</p></div></div>
      </AppShell>
    );
  }

  return (
    <AppShell activePage="profile">
      <div className="prof-page">
        {/* Profile Section */}
        <div className="prof-card">
          <div className="prof-photo-section">
            <div className="prof-photo-wrapper" onClick={() => fileInputRef.current?.click()}>
              <img src={avatarFor(user, 256)} alt={user?.name} className="prof-photo" />
              <div className="prof-photo-overlay">
                {uploading ? <div className="avatar-upload-spinner" /> : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                )}
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatarUpload} style={{ display: "none" }} />
            <h2 className="prof-name">{user?.name || "User"}</h2>
            <div className="prof-role-badge">{isWorker ? "Worker" : "Client"}</div>
          </div>

          <div className="prof-info">
            <div className="prof-info-item">
              <span className="prof-info-label">Email</span>
              <span className="prof-info-value">{user?.email || "—"}</span>
            </div>
            <div className="prof-info-item">
              <span className="prof-info-label">Phone</span>
              <span className="prof-info-value">{user?.phone || "—"}</span>
            </div>
            <div className="prof-info-item">
              <span className="prof-info-label">Bio</span>
              <span className="prof-info-value">{user?.bio || "—"}</span>
            </div>
          </div>

          {/* Worker Upgrade */}
          <div className="prof-upgrade">
            {isWorker ? (
              <div className="prof-worker-info">
                <div className="prof-worker-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  Worker Profile Active
                </div>
                <p>You can now receive job offers and connect with clients directly.</p>
              </div>
            ) : (
              <>
                <h3>Upgrade to Worker</h3>
                <p>Create a worker profile, get job offers, and start earning today.</p>
                <button className="btn btn-primary btn-full" onClick={() => { setIsWorker(true); showToast("You are now a worker! Welcome!"); }}>
                  Upgrade to Worker
                </button>
              </>
            )}
          </div>
        </div>

        {/* Settings Card */}
        <div className="prof-card" id="settings">
          <div className="prof-card-header">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <h3>Settings</h3>
          </div>
          <form className="prof-settings-form" onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label>Full name</label>
              <input type="text" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Email address</label>
              <input type="email" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Phone number</label>
              <input type="tel" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea rows={3} value={editForm.bio} onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>New password (leave blank to keep current)</label>
              <input type="password" placeholder="At least 6 characters" value={editForm.password} onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Confirm new password</label>
              <input type="password" placeholder="Re-enter password" value={editForm.confirmPassword} onChange={(e) => setEditForm((p) => ({ ...p, confirmPassword: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Logout Card */}
        <div className="prof-card prof-logout-card">
          <button className="btn btn-danger btn-full" onClick={logout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </AppShell>
  );
}
