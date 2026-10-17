"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SITE_CONFIG } from "@/lib/config";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // Do not render admin navbar on the login page
  if (pathname === "/admin/login") {
    return null;
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const navLinks = [
    { href: "/admin", label: "Dashboard", exact: true },
    { href: "/admin/notifications", label: "Web Push Notifications" },
    { href: "/count", label: "Count Config" },
  ];

  return (
    <header className="admin-nav-header">
      <div className="main-container admin-nav-inner">
        <div className="admin-nav-brand">
          <Link href="/admin" className="admin-logo-link">
            <span className="admin-logo-badge">{SITE_CONFIG.siteName}</span>
            <span className="admin-portal-text">Admin Center</span>
          </Link>
        </div>

        <nav className="admin-nav-menu" aria-label="Admin Navigation">
          {navLinks.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link ${isActive ? "is-active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-nav-actions">
          <Link href="/" target="_blank" className="admin-view-site-btn">
            <span>View Public Site</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="admin-logout-btn"
            title="Log out from admin"
          >
            {loggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </div>
    </header>
  );
}
