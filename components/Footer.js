import Link from "next/link";
import { SITE_CONFIG, parseMoreSites } from "@/lib/config";
import { TelegramIcon, ArrowUpRightIcon } from "./icons/Icons";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const moreSites = parseMoreSites(SITE_CONFIG.moreSitesRaw);

  return (
    <footer className="site-footer">
      <div className="main-container footer-inner">
        {/* 18+ Explicit Adult Warning Banner */}
        <div className="footer-warning-banner" role="alert">
          <span className="warning-badge">18+</span>
          <p className="warning-text">
            This website contains adult content (18+) for adults only. If you are under 18, please leave this site immediately.
          </p>
        </div>

        <div className="footer-top">
          <div className="footer-brand">
            <span className="brand-title">{SITE_CONFIG.siteName}</span>
            <p className="brand-desc">
              High-definition adult video platform from around the world. Mobile-first, daily updates, instant playback, zero registration required.
            </p>
          </div>

          <nav className="footer-nav" aria-label="Footer Navigation">
            <div className="nav-col">
              <span className="nav-col-title">Navigation</span>
              <Link href="/">Home</Link>
              <Link href="/">All Videos</Link>
              <a href="/sitemap.xml">XML Sitemap</a>
            </div>

            <div className="nav-col">
              <span className="nav-col-title">Community & Network</span>
              {SITE_CONFIG.telegramUrl && (
                <a
                  href={SITE_CONFIG.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link-icon"
                >
                  <TelegramIcon size={14} />
                  <span>Official Telegram</span>
                </a>
              )}
              {moreSites.slice(0, 3).map((site, idx) => (
                <a
                  key={idx}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link-icon"
                >
                  <span>{site.label}</span>
                  <ArrowUpRightIcon size={12} />
                </a>
              ))}
            </div>

            <div className="nav-col">
              <span className="nav-col-title">Legal & Contact</span>
              <Link href="/about">About Us</Link>
              <Link href="/contact">Contact & DMCA</Link>
              {SITE_CONFIG.contactEmail && (
                <a href={`mailto:${SITE_CONFIG.contactEmail}`}>
                  {SITE_CONFIG.contactEmail}
                </a>
              )}
            </div>
          </nav>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            &copy; {currentYear} {SITE_CONFIG.siteName}. All rights reserved.
          </p>
          <p className="disclaimer">
            All videos streamed are for adult entertainment purposes only. We strictly respect intellectual property, legal compliance and DMCA removal guidelines.
          </p>
        </div>
      </div>
    </footer>
  );
}
