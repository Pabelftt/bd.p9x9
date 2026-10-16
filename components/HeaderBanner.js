import { DownloadIcon, TelegramIcon } from "./icons/Icons";
import { SITE_CONFIG } from "@/lib/config";

export default function HeaderBanner() {
  const downloadUrl = (SITE_CONFIG.downloadLinkUrl || "").trim();
  const telegramUrl = (SITE_CONFIG.telegramUrl || "").trim();

  return (
    <aside className="header-banner" aria-label="Quick Actions & Community">
      <div className="main-container banner-inner">
        <div className="banner-badge">
          <span className="live-dot" aria-hidden="true"></span>
          <span className="banner-text">Free HD Streams &bull; Instant Access &bull; 100% Free</span>
        </div>

        <div className="banner-actions">
          {downloadUrl && (
            <a
              href={downloadUrl}
              className="action-pill pill-app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download Android App"
            >
              <DownloadIcon size={14} />
              <span>App Download</span>
            </a>
          )}

          {telegramUrl && (
            <a
              href={telegramUrl}
              className="action-pill pill-tg"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join Official Telegram Channel"
            >
              <TelegramIcon size={14} />
              <span>Join Telegram</span>
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
