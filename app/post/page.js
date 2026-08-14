"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import StarRating from "../components/StarRating";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["Plumbing", "Electrical", "Cleaning", "Tailoring", "Painting", "Carpentry", "Cooking", "Gardening", "Moving", "Web Development", "Graphic Design", "Hairdressing", "Laundry", "Other"];

export default function PostPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [form, setForm] = useState({ title: "", description: "", details: "", price: "", location: "", category: "" });
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/post");
  }, [loading, user, router]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price || !form.location) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price), rating, userId: user.id }),
      });
      if (!res.ok) throw new Error("Failed to post job");
      showToast("Job posted successfully!");
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <AppShell activePage="post">
      {loading || !user ? (
        <div className="page-container">
          <div className="loading"><div className="spinner" /><p>Checking your session...</p></div>
        </div>
      ) : (
      <div className="page-container">
        <div className="page-header">
          <h1>Post a Job</h1>
          <p>Describe the job you need done</p>
        </div>

        <div className="card">
          <form className="post-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Job Title *</label>
              <input type="text" placeholder="e.g. Plumbing repair needed" value={form.title} onChange={(e) => update("title", e.target.value)} />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={(e) => update("category", e.target.value)}>
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea placeholder="Brief description of the job..." value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} />
            </div>

            <div className="form-group">
              <label>Details</label>
              <textarea placeholder="Additional details, requirements, materials needed..." value={form.details} onChange={(e) => update("details", e.target.value)} rows={3} />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Price (FCFA) *</label>
                <input type="number" placeholder="0" min="0" value={form.price} onChange={(e) => update("price", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input type="text" placeholder="e.g. Douala, Cameroon" value={form.location} onChange={(e) => update("location", e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Rating</label>
              <div className="rating-input">
                <StarRating value={rating} onChange={setRating} size="lg" />
                <span className="rating-label">{rating > 0 ? `${rating}/5` : "Tap to rate"}</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={submitting} style={{ padding: "14px", fontSize: "1rem" }}>
              {submitting ? "Posting..." : "Post Job"}
            </button>
          </form>
        </div>
      </div>
      )}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </AppShell>
  );
}
