"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PlayIcon } from "@/components/icons/Icons";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error securely without exposing stack trace to users
    console.error("Application runtime error caught by error.tsx boundary:", error);
  }, [error]);

  return (
    <div className="error-page-wrap">
      <div className="error-card animate-fade-in">
        <div className="error-icon-circle" aria-hidden="true">
          <span>!</span>
        </div>

        <h1 className="error-title">Something went wrong</h1>

        <p className="error-subtitle">
          An unexpected error occurred while processing your request. Please try again or return to the homepage.
        </p>

        <div className="error-actions-group">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-error-primary"
          >
            Try again
          </button>

          <Link href="/" className="btn-error-secondary">
            <PlayIcon size={16} />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
