"use client";

import Link from "next/link";

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
const MapPinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const items = [
  { icon: <MailIcon />, text: "support@tasklink.cm" },
  { icon: <PhoneIcon />, text: "+237 680 108 507" },
  { icon: <MapPinIcon />, text: "Akwa, Douala · Yaounde, Cameroon" },
  { icon: <ClockIcon />, text: "Mon - Sat, 8am - 6pm" },
];

export default function FooterTicker() {
  const block = (key) => (
    <div className="footer-ticker-content" key={key} aria-hidden={key !== "a"}>
      {items.map((item, i) => (
        <span className="footer-ticker-item" key={i}>
          <span className="footer-ticker-icon">{item.icon}</span>
          {item.text}
        </span>
      ))}
    </div>
  );

  return (
    <div className="footer-ticker">
      <Link href="/" className="footer-ticker-label" aria-label="TaskLink">
        <div className="footer-ticker-logo">TL</div>
        <span>TaskLink Info</span>
      </Link>
      <div className="footer-ticker-viewport">
        <div className="footer-ticker-track">
          {block("a")}
          {block("b")}
        </div>
      </div>
    </div>
  );
}
