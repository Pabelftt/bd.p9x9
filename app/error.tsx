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

        <h1 className="error-title">কিছু ভুল হয়েছে</h1>

        <p className="error-subtitle">
          অনুরোধ প্রক্রিয়া করার সময় একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন বা হোমে ফিরে যান।
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
            <span>হোমে ফিরে যান</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
