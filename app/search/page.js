"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "../components/AppShell";
import JobCard from "../components/JobCard";

const CATEGORIES = ["All", "Plumbing", "Electrical", "Cleaning", "Tailoring", "Painting", "Carpentry", "Cooking", "Gardening", "Moving", "Web Development", "Graphic Design", "Other"];

export default function SearchPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", "10");
      if (search) params.set("search", search);
      if (location) params.set("location", location);
      if (category !== "All") params.set("category", category);

      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();
      setJobs(data.data || []);
      setMeta(data.meta);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, location]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  return (
    <AppShell activePage="search">
      <div className="page-container">
        <div className="page-header">
          <h1>Search Jobs</h1>
          <p>Find the right job for you</p>
        </div>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-accent">Search</button>
        </form>

        <input
          type="text"
          placeholder="Filter by location..."
          value={location}
          onChange={(e) => { setLocation(e.target.value); setPage(1); }}
          style={{ marginBottom: "16px" }}
        />

        <div className="filter-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${category === cat ? "active" : ""}`}
              onClick={() => { setCategory(cat); setPage(1); }}
            >
              {cat}
            </button>
          ))}
        </div>

        {meta && <p className="search-results-count">{meta.total} job{meta.total !== 1 ? "s" : ""} found</p>}

        {loading ? (
          <div className="loading"><div className="spinner" /><p>Searching...</p></div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.2 }}>&#128269;</div>
            <h3>No jobs found</h3>
            <p>Try different filters or search terms.</p>
          </div>
        ) : (
          <div className="jobs-list">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} showActions />
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px", flexWrap: "wrap" }}>
            <button className="btn btn-outline btn-sm" disabled={!meta.hasPrev} onClick={() => setPage((p) => p - 1)}>Prev</button>
            {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => {
              let p;
              if (meta.totalPages <= 7) p = i + 1;
              else if (page <= 4) p = i + 1;
              else if (page >= meta.totalPages - 3) p = meta.totalPages - 6 + i;
              else p = page - 3 + i;
              return (
                <button
                  key={p}
                  className={`btn btn-sm ${p === page ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              );
            })}
            <button className="btn btn-outline btn-sm" disabled={!meta.hasNext} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
