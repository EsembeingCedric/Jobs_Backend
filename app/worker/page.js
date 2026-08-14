"use client";

import { useState, useEffect } from "react";
import AppShell from "../components/AppShell";
import { avatarFor } from "../lib/avatar";
import { waLinkFor } from "../lib/contact";

export default function WorkerPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/users?limit=50");
        const data = await res.json();
        const list = data.data || [];
        const withRoles = list.map((w) => {
          const firstJob = w._count?.jobs > 0 ? "Professional" : "Worker";
          return {
            id: w.id,
            name: w.name,
            role: firstJob,
            location: "Cameroon",
            rating: w.avgRating || 0,
            jobs: w._count?.jobs || 0,
            avatar: w.avatar,
            phone: w.phone,
          };
        });
        setWorkers(withRoles);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppShell activePage="worker">
      <div className="page-container">
        <div className="section-header">
          <h2>Find Workers</h2>
          <p>Connect with skilled professionals in your area</p>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /><p>Loading workers...</p></div>
        ) : workers.length === 0 ? (
          <div className="empty-state">
            <h3>No workers found yet</h3>
            <p>Workers will appear here as they join and post jobs</p>
          </div>
        ) : (
          <div className="workers-grid">
            {workers.map((w, i) => (
              <div key={w.id} className="worker-card">
                <div className="worker-card-avatar">
                  <img src={avatarFor(w, 200)} alt={w.name} />
                </div>
                <h3 className="worker-card-name">{w.name}</h3>
                <div className="worker-card-role">{w.role}</div>
                <div className="worker-card-location">{w.location}</div>
                <div className="worker-card-stats">
                  <span>{w.rating > 0 ? `${w.rating.toFixed(1)} ★` : "New"}</span>
                  <span>{w.jobs} jobs</span>
                </div>
                <a
                  href={waLinkFor(w.phone, `Hello! I'd like to know more about your services on TaskLink, ${w.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-full btn-sm"
                >
                  Contact
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
