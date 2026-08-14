"use client";

import Link from "next/link";

export default function Logo({ href = "/", className = "", size = "md", light = false }) {
  return (
    <Link
      href={href}
      className={`logo logo-${size} ${light ? "logo-light" : ""} ${className}`}
      aria-label="TaskLink - Every job, done right."
    >
      <div className="logo-mark">
        <span className="logo-mark-t">T</span>
        <span className="logo-mark-l">L</span>
      </div>
      <span className="logo-text">
        <span className="logo-name">TaskLink</span>
        <span className="logo-slogan">Every job, done right.</span>
      </span>
    </Link>
  );
}
