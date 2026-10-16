"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error caught by global-error.tsx:", error);
  }, [error]);

  return (
    <html lang="bn">
      <head>
        <title>Error | BD.P9X9</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            background-color: #07090e;
            color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          .box {
            max-width: 460px;
            width: 100%;
            background: #121824;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px 28px;
            text-align: center;
            box-shadow: 0 20px 48px rgba(0, 0, 0, 0.7);
          }
          .icon {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: rgba(244, 63, 94, 0.15);
            border: 1px solid rgba(244, 63, 94, 0.3);
            color: #f43f5e;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 20px;
          }
          h1 {
            font-size: 1.5rem;
            font-weight: 800;
            margin-bottom: 12px;
            color: #f8fafc;
          }
          p {
            font-size: 0.95rem;
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 28px;
          }
          .btn-group {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
          }
          .btn {
            padding: 12px 24px;
            border-radius: 9999px;
            font-size: 0.95rem;
            font-weight: 700;
            text-decoration: none;
            cursor: pointer;
            border: none;
            transition: transform 0.2s;
          }
          .btn:hover { transform: translateY(-2px); }
          .btn-primary {
            background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
            color: #ffffff;
          }
          .btn-secondary {
            background: #1a2233;
            color: #f8fafc;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        `}</style>
      </head>
      <body>
        <div className="box">
          <div className="icon">!</div>
          <h1>কিছু ভুল হয়েছে</h1>
          <p>
            অ্যাপ্লিকেশনে একটি গুরুতর ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন অথবা হোমপেজে যান।
          </p>
          <div className="btn-group">
            <button type="button" onClick={() => reset()} className="btn btn-primary">
              Try again
            </button>
            <a href="/" className="btn btn-secondary">
              হোমে যান
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
