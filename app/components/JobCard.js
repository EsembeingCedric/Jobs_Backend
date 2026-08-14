"use client";

import StarRating from "./StarRating";
import { categoryColor, categoryIcon, jobImage } from "../lib/categories";
import { waLink } from "../lib/contact";

export default function JobCard({ job, onDelete, showActions = false }) {
  const formatDate = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="job-card">
      {job.category && (
        <div className="job-card-image-wrap">
          <img src={jobImage(job)} alt={job.category} className="job-card-image" />
          <span className={`job-card-image-chip chip-${categoryColor(job.category)}`}>{categoryIcon(job.category)} {job.category}</span>
        </div>
      )}
      <div className="job-card-top">
        <div>
          <h3 className="job-card-title">{job.title}</h3>
          {job.user && <p className="job-card-user">by {job.user.name}</p>}
        </div>
        <span className="job-card-price">{Number(job.price).toLocaleString()} FCFA</span>
      </div>
      {job.description && <p className="job-card-desc">{job.description}</p>}
      {job.details && <p className="job-card-details">{job.details}</p>}
      <div className="job-card-footer">
        <div className="job-card-meta">
          {job.location && (
            <span className="job-card-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {job.location}
            </span>
          )}
          {job.rating > 0 && (
            <span className="job-card-rating">
              <StarRating value={Math.round(job.rating)} readonly size="sm" />
              <span>({job.ratingCount})</span>
            </span>
          )}
        </div>
        <span className="job-card-time">{formatDate(job.createdAt)}</span>
      </div>
      {showActions && (
        <div className="job-card-actions">
          <a href={waLink(job)} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Message</a>
          {onDelete && (
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(job.id)}>Delete</button>
          )}
        </div>
      )}
    </div>
  );
}
