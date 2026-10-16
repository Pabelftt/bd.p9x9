"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SearchIcon,
  MenuIcon,
  CloseIcon,
  MoonIcon,
  SunIcon,
  PlayIcon,
  DownloadIcon,
  ChevronDownIcon,
  GlobeIcon,
  TelegramIcon,
  ArrowUpRightIcon,
} from "./icons/Icons";
import { parseMoreSites, SITE_CONFIG } from "@/lib/config";

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUrlQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(currentUrlQuery);
  const [prevQuery, setPrevQuery] = useState(currentUrlQuery);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [moreSitesOpen, setMoreSitesOpen] = useState(false);
  const dropdownRef = useRef(null);

  const downloadUrl = (
    process.env.NEXT_PUBLIC_DOWNLOAD_LINK_URL ||
    SITE_CONFIG.downloadLinkUrl ||
    ""
  ).trim();

  const moreSitesRaw =
    process.env.NEXT_PUBLIC_MORE_SITE ||
    SITE_CONFIG.moreSitesRaw ||
    "";
  const moreSites = parseMoreSites(moreSitesRaw);

  const telegramUrl = (
    process.env.NEXT_PUBLIC_TELEGRAM_URL ||
    SITE_CONFIG.telegramUrl ||
    ""
  ).trim();

  // Sync state from URL search params without useEffect setState cascading renders
  if (currentUrlQuery !== prevQuery) {
    setPrevQuery(currentUrlQuery);
    setQuery(currentUrlQuery);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMoreSitesOpen(false);
      }
    }
    if (moreSitesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [moreSitesOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const toggleTheme = () => {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    setIsLightMode(nextTheme === "light");
    try {
      localStorage.setItem("bd-theme", nextTheme);
    } catch {}
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/");
    }
    setMenuOpen(false);
  };

  return (
    <>
      <header className="site-header" id="main-site-navbar">
        <div className="main-container header-inner">
          <Link href="/" className="logo-brand" aria-label="BD.P9X9 Home">
            <span className="logo-icon">
              <PlayIcon size={16} />
            </span>
            <span className="logo-text">BD.P9X9</span>
          </Link>

          <form
            className="search-bar"
            onSubmit={handleSearchSubmit}
            role="search"
          >
            <SearchIcon className="search-icon" size={17} />
            <input
              type="search"
              name="q"
              placeholder="Search trending & desi videos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search videos"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setQuery("")}
                aria-label="Clear search text"
              >
                &times;
              </button>
            )}
            <button
              type="submit"
              className="search-submit-btn"
              aria-label="Perform search"
            >
              Search
            </button>
          </form>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Desktop primary navigation">
            <Link href="/" className="nav-link">
              Home
            </Link>
            <Link href="/" className="nav-link">
              Videos
            </Link>
            <Link href="/about" className="nav-link">
              About
            </Link>
            <Link href="/contact" className="nav-link">
              Contact
            </Link>

            {/* More Sites Dropdown */}
            {moreSites.length > 0 && (
              <div className="more-sites-dropdown" ref={dropdownRef}>
                <button
                  type="button"
                  className="nav-link dropdown-toggle-btn"
                  onClick={() => setMoreSitesOpen(!moreSitesOpen)}
                  aria-expanded={moreSitesOpen}
                  aria-haspopup="true"
                  aria-label="More Sites Menu"
                >
                  <GlobeIcon size={15} />
                  <span>More Sites</span>
                  <ChevronDownIcon
                    size={14}
                    className={`chevron-icon ${moreSitesOpen ? "rotated" : ""}`}
                  />
                </button>

                {moreSitesOpen && (
                  <div
                    className="dropdown-menu-card animate-fade-in"
                    role="menu"
                    aria-label="More Sites List"
                  >
                    <div className="dropdown-menu-header">
                      <span className="dropdown-menu-title">Network Sites</span>
                    </div>
                    {moreSites.map((site, idx) => (
                      <a
                        key={idx}
                        href={site.url}
                        className="dropdown-menu-item"
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                        onClick={() => setMoreSitesOpen(false)}
                      >
                        <span className="site-item-label">{site.label}</span>
                        <ArrowUpRightIcon size={14} className="site-item-icon" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Header Action Buttons */}
          <div className="header-actions">
            {/* Download App Button (desktop) */}
            {downloadUrl && (
              <a
                href={downloadUrl}
                className="btn-download-app-nav"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download Mobile App"
                title="Download App"
              >
                <DownloadIcon size={15} />
                <span className="btn-text">Download App</span>
              </a>
            )}

            <button
              type="button"
              className="theme-btn"
              onClick={toggleTheme}
              aria-label="Toggle dark and light theme"
              title="Toggle theme"
            >
              {isLightMode ? <MoonIcon size={18} /> : <SunIcon size={18} />}
            </button>

            <button
              type="button"
              className="menu-trigger-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
            >
              {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        id="mobile-drawer"
        className={`mobile-drawer-overlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      >
        <div
          className="mobile-drawer-content"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div className="mobile-drawer-header">
            <span className="logo-text">BD.P9X9</span>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              <CloseIcon size={20} />
            </button>
          </div>

          <form className="drawer-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              placeholder="Search videos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search videos in mobile drawer"
            />
            <button type="submit" aria-label="Search">
              <SearchIcon size={18} />
            </button>
          </form>

          {downloadUrl && (
            <div className="drawer-cta-wrap">
              <a
                href={downloadUrl}
                className="drawer-download-cta"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                aria-label="Download App"
              >
                <DownloadIcon size={17} />
                <span>Download App</span>
              </a>
            </div>
          )}

          <nav className="mobile-nav-links">
            <Link
              href="/"
              className="mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/"
              className="mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              All Videos
            </Link>
            <Link
              href="/about"
              className="mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              Contact Support
            </Link>

            {telegramUrl && (
              <a
                href={telegramUrl}
                className="mobile-link mobile-tg-link"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
              >
                <TelegramIcon size={17} />
                <span>Join Official Telegram</span>
              </a>
            )}

            {/* Mobile More Sites Section */}
            {moreSites.length > 0 && (
              <div className="mobile-sites-section">
                <span className="mobile-section-heading">More Sites</span>
                <div className="mobile-sites-list">
                  {moreSites.map((site, idx) => (
                    <a
                      key={idx}
                      href={site.url}
                      className="mobile-site-item"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span>{site.label}</span>
                      <ArrowUpRightIcon size={14} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
