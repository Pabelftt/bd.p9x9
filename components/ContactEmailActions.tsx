"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "./icons/Icons";

export default function ContactEmailActions({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback prompt if clipboard API is blocked
      const textArea = document.createElement("textarea");
      textArea.value = email;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {}
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="email-action-card">
      <div className="email-display-wrap">
        <span className="email-icon" aria-hidden="true">&#9993;</span>
        <a href={`mailto:${email}`} className="email-link-text" aria-label={`Send email to ${email}`}>
          {email}
        </a>
      </div>
      <div className="email-buttons-group">
        <a
          href={`mailto:${email}`}
          className="btn-email-action btn-email-send"
          aria-label="Open email client"
        >
          Send Email
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className={`btn-email-action btn-email-copy ${copied ? "copied" : ""}`}
          aria-label="Copy email address to clipboard"
        >
          {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
          <span>{copied ? "Copied!" : "Copy Email"}</span>
        </button>
      </div>
    </div>
  );
}
