"use client";

import { useState, useEffect, useRef } from "react";
import AppShell from "../components/AppShell";
import { categoryColor, categoryIcon, jobImage } from "../lib/categories";
import { avatarFor } from "../lib/avatar";
import { waLink } from "../lib/contact";
import Link from "next/link";

const PAGE_SIZE = 6;

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const carouselRef = useRef(null);

  useEffect(() => {
    fetch("/api/jobs?limit=120")
      .then((r) => r.json())
      .then((data) => {
        setJobs(data.data || []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const carouselJobs = jobs.slice(0, 10);
  const visibleJobs = expanded ? jobs : jobs.slice(0, PAGE_SIZE);
  const hasMore = jobs.length > PAGE_SIZE;

  return (
    <AppShell activePage="jobs">
      {/* Jobs Carousel */}
      <section className="jobs-hero">
        <div className="section-header">
          <h2>Featured Jobs</h2>
          <p>Browse the latest opportunities near you</p>
        </div>
        <div className="jobs-carousel-wrapper">
          <div className="jobs-carousel" ref={carouselRef}>
            {loading ? (
              <div className="loading"><div className="spinner" /></div>
            ) : (
              carouselJobs.map((job) => (
                <div key={job.id} className="job-carousel-card">
                  <div className="jcc-image-wrap">
                    <img src={jobImage(job)} alt={job.category || "Job"} className="jcc-image" />
                    <div className={`jcc-icon chip-${categoryColor(job.category)}`}>{categoryIcon(job.category)}</div>
                  </div>
                  <h3>{job.title}</h3>
                  <p className="jcc-desc">{job.description}</p>
                  <div className="jcc-price">{job.price.toLocaleString()} FCFA</div>
                  <div className="jcc-location">{job.location}</div>
                  <a href={waLink(job)} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">Apply</a>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Find Jobs For You */}
      <section className="section find-jobs-section">
        <div className="section-header">
          <h2>Find Jobs for you</h2>
          <p>Discover work that matches your skills</p>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /><p>Loading jobs...</p></div>
        ) : visibleJobs.length === 0 ? (
          <div className="empty-state">
            <h3>No jobs available right now</h3>
            <p>Check back later for new listings</p>
          </div>
        ) : (
          <div className="jobs-grid-apply">
            {visibleJobs.map((job) => (
              <div key={job.id} className="job-card-apply">
                <div className="jca-image-wrap">
                  <img src={jobImage(job)} alt={job.category || "Job"} className="jca-image" />
                  <div className={`jca-category-chip chip-${categoryColor(job.category)}`}>{job.category || "General"}</div>
                  <div className="jca-price">{job.price.toLocaleString()} FCFA</div>
                </div>
                <div className="jca-body">
                  <div className="jca-title">{job.title}</div>
                  <p className="jca-desc">{job.description}</p>
                  <div className="jca-meta">
                    <span className="jca-location">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {job.location}
                    </span>
                    <span className="jca-time">
                      {(() => {
                        const d = new Date(job.createdAt);
                        const now = new Date();
                        const diff = Math.floor((now - d) / 1000);
                        if (diff < 60) return "Just now";
                        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                        return d.toLocaleDateString();
                      })()}
                    </span>
                  </div>
                  <div className="jca-footer">
                    <div className="jca-user">
                      <img src={avatarFor(job.user, 96)} alt={job.user?.name} className="jca-user-avatar-img" />
                      <span>{job.user?.name || "Unknown"}</span>
                    </div>
                    <a href={waLink(job)} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                      Apply
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && hasMore && (
          <div className="view-all-wrapper">
            <button
              className="btn btn-outline"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Show Less" : "View All Jobs"}
              <svg
                className={`view-all-caret ${expanded ? "up" : ""}`}
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <span className="view-all-count">
              {expanded ? `Showing all ${jobs.length} jobs` : `${PAGE_SIZE} of ${jobs.length} jobs shown`}
            </span>
          </div>
        )}
      </section>

      {/* Plus FAB → Post Job */}
      <Link href="/post" className="jobs-fab" title="Post a new job">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </Link>

    </AppShell>
  );
}
