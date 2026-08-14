"use client";

import { useState, useEffect, useRef } from "react";
import AppShell from "./components/AppShell";
import Link from "next/link";
import { categoryColor, categoryImage, categoryIcon, jobImage } from "./lib/categories";
import { avatarFor } from "./lib/avatar";
import { waLink, waLinkFor } from "./lib/contact";

const services = [
  { icon: "🔧", title: "Plumbing", desc: "Fix leaks, install fixtures, unclog drains and more" },
  { icon: "🧹", title: "Cleaning", desc: "Deep cleaning, office cleaning, carpet shampooing" },
  { icon: "⚡", title: "Electrical", desc: "Wiring, installations, repairs and safety checks" },
  { icon: "✂️", title: "Tailoring", desc: "Custom dresses, alterations, traditional outfits" },
  { icon: "🎨", title: "Painting", desc: "Interior & exterior painting, murals, furniture" },
  { icon: "🌿", title: "Gardening", desc: "Lawn mowing, hedge trimming, garden design" },
  { icon: "🪚", title: "Carpentry", desc: "Custom furniture, repairs, installations" },
  { icon: "📦", title: "Moving", desc: "Relocation, furniture transport, packing services" },
  { icon: "📚", title: "Tutoring", desc: "Academic subjects, music, languages, programming" },
  { icon: "🍳", title: "Cooking", desc: "Catering, meal prep, baking, personal chef" },
];



export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetch("/api/jobs?limit=120")
      .then((r) => r.json())
      .then((data) => setJobs(Array.isArray(data.data) ? data.data : []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/users?limit=50")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data.data) ? data.data : [];
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
      })
      .catch((e) => console.error(e))
      .finally(() => setWorkersLoading(false));
  }, []);

  const uniqueByCategory = (list) => {
    const seen = new Set();
    return list.filter((job) => {
      const key = job.category || "General";
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const uniqueJobs = uniqueByCategory(jobs);
  const featuredJobs = uniqueJobs.slice(0, 6);
  const featuredWorkers = workers.slice(0, 4);

  const slides = uniqueJobs.length > 0
    ? uniqueJobs.slice(0, 12).map((job) => ({
        id: job.id,
        image: jobImage(job),
        icon: categoryIcon(job.category),
        title: job.title,
        description: job.description,
        price: job.price,
        location: job.location,
        category: job.category || "General",
      }))
    : services.slice(0, 6).map((s) => ({
        image: categoryImage(s.title),
        icon: s.icon,
        title: s.title,
        description: s.desc,
        category: s.title,
      }));

  const totalSlides = Math.max(slides.length, 1);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [totalSlides]);

  const goToSlide = (i) => {
    setCurrentSlide(i);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);
  };

  const timeAgo = (d) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(d).toLocaleDateString();
  };

  return (
    <AppShell activePage="home">
      {/* Hero / Carousel Section */}
      <section className="hero-section">
        <div className="hero-bg">
          {slides.map((s, i) => (
            <div key={s.id || `cat-${i}`} className={`hero-bg-slide ${i === currentSlide ? "active" : ""}`}>
              <img src={s.image} alt={s.title} />
            </div>
          ))}
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-text">
            <h1>Find trusted workers for any job</h1>
            <p>From plumbing to painting, connect with skilled professionals in your area</p>
          </div>
          <div className="hero-carousel">
            <div className="hero-carousel-inner">
              {slides.map((s, i) => (
                <div
                  key={s.id || `cat-${i}`}
                  className={`hero-slide ${i === currentSlide ? "active" : ""}`}
                  style={{ transform: `translateX(${(i - currentSlide) * 100}%)` }}
                >
                  <Link href="/jobs" className="hero-slide-card">
                    <div className="hero-slide-img-wrap">
                      <img src={s.image} alt={s.title} className="hero-slide-img" />
                      <span className={`hero-slide-chip chip-${categoryColor(s.category)}`}>{s.category}</span>
                    </div>
                    <div className="hero-slide-body">
                      <h3>{s.title}</h3>
                      <p className="hero-slide-desc">{s.description}</p>
                      {s.price != null && (
                        <div className="hero-slide-price">{s.price.toLocaleString()} FCFA</div>
                      )}
                      {s.location && (
                        <div className="hero-slide-location">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {s.location}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            <div className="hero-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`hero-dot ${i === currentSlide ? "active" : ""}`}
                  onClick={() => goToSlide(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Available Services / Jobs */}
      <section className="section find-jobs-section">
        <div className="section-header">
          <h2>Available Services</h2>
          <p>Everything you need to get things done</p>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /><p>Loading jobs...</p></div>
        ) : featuredJobs.length === 0 ? (
          <div className="empty-state">
            <h3>No jobs available right now</h3>
            <p>Check back later for new listings</p>
          </div>
        ) : (
          <div className="jobs-grid-apply">
            {featuredJobs.map((job) => (
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
                    <span className="jca-time">{timeAgo(job.createdAt)}</span>
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

        {/* More Services */}
        <div className="more-services-wrapper">
          <Link href="/jobs" className="more-services-card">
            <div className="more-services-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </div>
            <div className="more-services-text">
              <h3>More services</h3>
              <p>Browse all available jobs and services</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="more-services-arrow"><polyline points="9 18 15 12 9 6" /></svg>
          </Link>
        </div>
      </section>

      {/* Available Workers */}
      <section className="section find-jobs-section">
        <div className="section-header">
          <h2>Available Workers</h2>
          <p>Connect with skilled professionals in your area</p>
        </div>

        {workersLoading ? (
          <div className="loading"><div className="spinner" /><p>Loading workers...</p></div>
        ) : featuredWorkers.length === 0 ? (
          <div className="empty-state">
            <h3>No workers available right now</h3>
            <p>Check back later for new workers</p>
          </div>
        ) : (
          <div className="workers-grid">
            {featuredWorkers.map((w) => (
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

        {/* More Workers */}
        <div className="more-services-wrapper">
          <Link href="/worker" className="more-services-card">
            <div className="more-services-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div className="more-services-text">
              <h3>More workers</h3>
              <p>Browse all available workers and professionals</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="more-services-arrow">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="section about-section">
        <div className="about-grid">
          <div className="about-content">
            <h2>About TaskLink</h2>
            <p className="about-lead">TaskLink is Cameroon&apos;s premier platform connecting people with skilled workers for everyday jobs.</p>
            <div className="about-features">
              <div className="about-feature">
                <div className="about-feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <h4>Verified Workers</h4>
                  <p>All workers are vetted and reviewed by real customers</p>
                </div>
              </div>
              <div className="about-feature">
                <div className="about-feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <div>
                  <h4>Quick Turnaround</h4>
                  <p>Post a job and get responses within hours, not days</p>
                </div>
              </div>
              <div className="about-feature">
                <div className="about-feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <h4>Secure Payments</h4>
                  <p>Peace of mind with secure transactions and dispute resolution</p>
                </div>
              </div>
            </div>
          </div>
          <div className="about-stats">
            <div className="about-stat-card">
              <div className="about-stat-value">100+</div>
              <div className="about-stat-label">Jobs Posted</div>
            </div>
            <div className="about-stat-card">
              <div className="about-stat-value">50+</div>
              <div className="about-stat-label">Active Workers</div>
            </div>
            <div className="about-stat-card">
              <div className="about-stat-value">4.8</div>
              <div className="about-stat-label">Avg Rating</div>
            </div>
            <div className="about-stat-card">
              <div className="about-stat-value">95%</div>
              <div className="about-stat-label">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us */}
      <section className="section contact-section">
        <div className="section-header">
          <h2>Contact Us</h2>
          <p>We are here to help. Reach out anytime</p>
        </div>
        <div className="contact-grid">
          <div className="contact-card">
            <div className="contact-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <h3>Email Us</h3>
            <p><a href="mailto:support@tasklink.cm">support@tasklink.cm</a></p>
          </div>
          <div className="contact-card">
            <div className="contact-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <h3>Call Us</h3>
            <p><a href="tel:+237650000000">+237 680108507</a></p>
          </div>
          <div className="contact-card">
            <div className="contact-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <h3>Visit Us</h3>
            <p>Yaounde, Cameroon</p>
          </div>
          <div className="contact-card">
            <div className="contact-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3>Working Hours</h3>
            <p>24/7</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}