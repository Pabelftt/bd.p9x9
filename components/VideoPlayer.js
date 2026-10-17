"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  TelegramIcon,
  InfoIcon,
  CloseIcon,
  GlobeIcon,
} from "./icons/Icons";

export default function VideoPlayer({
  movie,
  initialConsented = false,
  telegramLink = "",
  description = "Press Continue on first visit to start streaming free HD videos.",
  redirectUrl = "",
}) {
  // Helper to check 5-minute consent from sessionStorage, localStorage, and cookies
  const checkConsent = useCallback(() => {
    if (typeof window === "undefined") return initialConsented;

    try {
      const now = Date.now();

      // 1. Check sessionStorage (persists across same-tab back/forward navigation)
      const sessionItem = sessionStorage.getItem(`smartLinkConsent_${movie.id}`);
      if (sessionItem && Number(sessionItem) > now) {
        return true;
      }

      // 2. Check localStorage (persists even if session resets)
      const localItem = localStorage.getItem(`smartLinkConsent_${movie.id}`);
      if (localItem && Number(localItem) > now) {
        return true;
      }

      // 3. Check document.cookie
      const cookiePart = document.cookie
        .split(";")
        .map((p) => p.trim())
        .find((p) => p.startsWith("smartLinkFlow="));

      if (cookiePart) {
        const raw = cookiePart.slice("smartLinkFlow=".length);
        const data = JSON.parse(decodeURIComponent(raw));
        if (data.videoId === movie.id) {
          return true;
        }
      }
    } catch {}

    return Boolean(initialConsented);
  }, [movie.id, initialConsented]);

  const [consented, setConsented] = useState(() => checkConsent());
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [copied, setCopied] = useState(false);

  const videoRef = useRef(null);
  const continueBtnRef = useRef(null);
  const cancelBtnRef = useRef(null);

  // Protected video stream source: Never expose direct public URL to client DOM
  const videoSrc = movie?.id
    ? `/api/video-proxy?id=${encodeURIComponent(movie.id)}`
    : movie?.play
    ? `/api/video-proxy?url=${encodeURIComponent(movie.play)}`
    : "";

  // Preload video without autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.preload = "auto";
    video.load();

    const handleLoadStart = () => setLoadingVideo(true);
    const handleWaiting = () => setLoadingVideo(true);
    const handleCanPlay = () => setLoadingVideo(false);
    const handlePlaying = () => setLoadingVideo(false);
    const handleError = () => setLoadingVideo(false);

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("error", handleError);
    };
  }, []);

  // Listen for BFCache restore (pageshow), popstate (Back button), and tab focus/visibility
  useEffect(() => {
    const handleNavigationReturn = () => {
      if (checkConsent()) {
        setConsented(true);
        setModalOpen(false);
        setIsRedirecting(false);
        const video = videoRef.current;
        if (video) {
          video.play().catch(() => {
            // If browser autoplay policy requires user click, video stays paused
            // ready to play directly without modal on user tap.
          });
        }
      }
    };

    window.addEventListener("pageshow", handleNavigationReturn);
    window.addEventListener("popstate", handleNavigationReturn);
    window.addEventListener("focus", handleNavigationReturn);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        handleNavigationReturn();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("pageshow", handleNavigationReturn);
      window.removeEventListener("popstate", handleNavigationReturn);
      window.removeEventListener("focus", handleNavigationReturn);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [checkConsent]);

  // Intercept play attempt: if consented, play directly; otherwise show modal
  const handlePlayAttempt = () => {
    if (consented || checkConsent()) {
      if (!consented) setConsented(true);
      if (modalOpen) setModalOpen(false);
      return;
    }

    // Pause video and prompt user with explicit modal
    const video = videoRef.current;
    if (video) video.pause();
    setModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setIsRedirecting(false);
    const video = videoRef.current;
    if (video) video.focus();
  }, []);

  // Modal keyboard accessibility
  useEffect(() => {
    if (!modalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      } else if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === continueBtnRef.current) {
            e.preventDefault();
            cancelBtnRef.current?.focus();
          }
        } else {
          if (document.activeElement === cancelBtnRef.current) {
            e.preventDefault();
            continueBtnRef.current?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    continueBtnRef.current?.focus();

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen, closeModal]);

  // Continue button click:
  // 1. Immediately store consent in client storage (sessionStorage, localStorage, cookie).
  // 2. Close modal immediately.
  // 3. Redirect in the SAME tab (NO new tab).
  // 4. When user presses Back, consent is already recorded so toast/modal NEVER shows again.
  const handleContinueClick = async () => {
    if (isRedirecting) return;
    setIsRedirecting(true);

    // Persist 5-minute consent immediately before navigating away
    const expiresAt = Date.now() + 300000; // 5 minutes (300,000 ms)
    try {
      sessionStorage.setItem(`smartLinkConsent_${movie.id}`, String(expiresAt));
      localStorage.setItem(`smartLinkConsent_${movie.id}`, String(expiresAt));
      const cookiePayload = JSON.stringify({ videoId: movie.id, ts: Date.now() });
      document.cookie = `smartLinkFlow=${encodeURIComponent(
        cookiePayload
      )}; max-age=300; path=/; SameSite=Lax`;
    } catch {}

    setConsented(true);
    setModalOpen(false);

    try {
      const res = await fetch(`/api/movies/${encodeURIComponent(movie.id)}/smart-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      let targetUrl = redirectUrl;

      if (res.ok) {
        const result = await res.json();
        if (result.redirectUrl) {
          targetUrl = result.redirectUrl;
        }
      }

      if (targetUrl) {
        // Redirect in the SAME tab / current window — NO new tab!
        window.location.href = targetUrl;
        return;
      }

      // If no redirect URL configured, play video directly
      const video = videoRef.current;
      if (video) video.play().catch(() => {});
    } catch (err) {
      console.error("Smart link redirect error:", err);
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }
      const video = videoRef.current;
      if (video) video.play().catch(() => {});
    } finally {
      setIsRedirecting(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: movie.hadding,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {}
  };

  return (
    <div className="player-section">
      <div
        className="player-theater"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="video-container" onContextMenu={(e) => e.preventDefault()}>
          <video
            ref={videoRef}
            src={videoSrc}
            poster={movie.img}
            controls
            controlsList="nodownload"
            disablePictureInPicture
            playsInline
            onPlay={handlePlayAttempt}
            onContextMenu={(e) => e.preventDefault()}
            aria-label={movie.hadding}
            className="main-video"
          >
            Your browser does not support the video tag.
          </video>

          {loadingVideo && (
            <div className="video-buffering" aria-hidden="true">
              <span className="buffering-spinner"></span>
            </div>
          )}
        </div>

        {description && (
          <div className="info-banner">
            <InfoIcon size={16} />
            <p>{description}</p>
          </div>
        )}
      </div>

      <div className="player-meta">
        <h1 className="video-title">{movie.hadding}</h1>

        <div className="player-actions">
          {telegramLink && (
            <a
              href={telegramLink}
              className="action-btn btn-telegram"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join Telegram channel"
            >
              <TelegramIcon size={17} />
              <span>Join Telegram</span>
            </a>
          )}

          <button
            type="button"
            className="action-btn btn-share"
            onClick={handleShare}
            aria-label="Share video link"
          >
            <GlobeIcon size={17} />
            <span>{copied ? "Link Copied!" : "Share Link"}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal — Reference Design Layout & Styling */}
      {modalOpen && (
        <div
          className="modal-backdrop"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-desc"
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={closeModal}
              aria-label="Close dialog"
            >
              <CloseIcon size={18} />
            </button>

            {/* Gradient Icon Badge matching reference design */}
            <div className="modal-icon-gradient" aria-hidden="true">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </div>

            <h2 id="modal-title" className="modal-title">
              Continue to the video link?
            </h2>

            <p id="modal-desc" className="modal-desc">
              Press Continue on first visit to start streaming.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                ref={cancelBtnRef}
                className="btn-modal btn-cancel"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                type="button"
                ref={continueBtnRef}
                className="btn-modal btn-continue-red"
                onClick={handleContinueClick}
                disabled={isRedirecting}
              >
                {isRedirecting ? "Connecting..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
