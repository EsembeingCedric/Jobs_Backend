"use client";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Link from "next/link";
import FooterTicker from "./FooterTicker";
import Logo from "./Logo";
import { avatarFor } from "../lib/avatar";

export default function AppShell({ children, activePage, hideTopNav }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { id: "home", label: "Home", href: "/" },
    { id: "jobs", label: "Jobs", href: "/jobs" },
    { id: "worker", label: "Worker", href: "/worker" },
  ];

  const bottomItems = [
    { id: "home", label: "Home", href: "/" },
    { id: "jobs", label: "Jobs", href: "/jobs" },
    { id: "post", label: "Post", href: "/post", special: true },
    { id: "messages", label: "Messages", href: "/messages" },
    { id: "profile", label: "Profile", href: "/profile" },
  ];

  const icon = (name) => {
    const icons = {
      home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
      jobs: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
      post: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
      messages: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
      profile: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      worker: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
      logout: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    };
    return icons[name] || null;
  };

  return (
    <div className="app-layout">
      {!hideTopNav && (
        <header className="top-nav">
          <div className="top-nav-inner">
            <Logo className="top-nav-brand" />
            <nav className="top-nav-links">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`top-nav-link ${activePage === link.id ? "active" : ""}`}
                >
                  {icon(link.id)}
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
            <div className="top-nav-right">
              <button
                type="button"
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>
              {user ? (
                <Link href="/profile" className="top-nav-user">
                  <img src={avatarFor(user, 64)} alt={user.name} className="top-nav-avatar-img" />
                  <span className="top-nav-username">{user.name}</span>
                </Link>
              ) : (
                <div className="top-nav-auth">
                  <Link href="/login" className="btn btn-outline btn-sm">Login</Link>
                  <Link href="/signup" className="btn btn-primary btn-sm">Create Account</Link>
                </div>
              )}
            </div>
            <button className="top-nav-mobile-toggle" id="mobile-menu-toggle" onClick={() => document.querySelector('.top-nav-links')?.classList.toggle('open')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </header>
      )}

      <main className={`main-content ${!hideTopNav ? "has-top-nav" : ""}`}>
        {children}
      </main>

      <footer className="site-footer">
        <FooterTicker />
        <div className="footer-bottom">
          <Logo className="footer-bottom-brand" light size="sm" />
          <span>&copy; {new Date().getFullYear()} TaskLink. All rights reserved.</span>
          <span className="footer-bottom-links">
            <Link href="/">Privacy</Link>
            <Link href="/">Terms</Link>
            <Link href="/">Help</Link>
          </span>
        </div>
      </footer>

      <nav className="bottom-nav">
        {bottomItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`bottom-nav-item ${activePage === item.id ? "active" : ""} ${item.special ? "bottom-nav-special" : ""}`}
          >
            {item.special ? (
              <div className="bottom-nav-fab">{icon(item.id)}</div>
            ) : (
              <>
                {icon(item.id)}
                <span>{item.label}</span>
              </>
            )}
          </Link>
        ))}
        <button className="bottom-nav-item bottom-nav-logout" onClick={logout} title="Sign out">
          {icon("logout")}
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
