"use client";

import { useState, useEffect } from "react";
import AppShell from "../components/AppShell";
import JobCard from "../components/JobCard";

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalJobs: 0, avgRating: 0, totalReviews: 0, totalUsers: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        setStats(data.stats);
        setRecentJobs(data.recentJobs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppShell activePage="dashboard">
      <div className="page-container">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Welcome back to TaskLink</p>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /><p>Loading...</p></div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon stat-icon-green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                </div>
                <div className="stat-label">Total Jobs</div>
                <div className="stat-value">{stats.totalJobs}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-yellow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <div className="stat-label">Avg Rating</div>
                <div className="stat-value">{stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div className="stat-label">Reviews</div>
                <div className="stat-value">{stats.totalReviews}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div className="stat-label">Users</div>
                <div className="stat-value">{stats.totalUsers}</div>
              </div>
            </div>

            <div className="quick-actions">
              <a href="/post" className="quick-action">
                <div className="quick-action-icon stat-icon-green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                Post a Job
              </a>
              <a href="/search" className="quick-action">
                <div className="quick-action-icon stat-icon-blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                Search Jobs
              </a>
              <a href="/profile" className="quick-action">
                <div className="quick-action-icon stat-icon-purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                My Profile
              </a>
            </div>

            <div className="section-header">
              <h2>Recent Jobs</h2>
              <a href="/search" className="btn btn-ghost btn-sm">View All</a>
            </div>

            {recentJobs.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.2 }}>&#128188;</div>
                <h3>No jobs yet</h3>
                <p>Be the first to post a job!</p>
              </div>
            ) : (
              <div className="jobs-list">
                {recentJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
