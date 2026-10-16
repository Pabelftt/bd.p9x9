# BD.P9X9 — Next.js Video Streaming Platform

A production-ready, mobile-first video streaming application built with **Next.js (App Router, JavaScript-only)** and **MongoDB**. Designed from the ground up for high performance, zero intrusive ads/popunders, elegant design aesthetics, and deployment on **`https://bd.p9x9.com`**.

---

## ?? Key Features & Highlights

- **Next.js App Router (Pure JavaScript)**: Clean, maintainable structure without TypeScript overhead.
- **Brand New Design System**: Modern dark & light mode styling, glassmorphism, glowing micro-animations, and responsive cards tailored for mobile, tablet, and desktop.
- **Smart Link & Continue Flow**:
  - Video page shows an accessible confirmation modal before first playback.
  - No redirect occurs without explicit user "Continue" button click.
  - Saves a safe 5-minute cookie (`smartLinkFlow`) with the video ID and path.
  - Redirects to `VIDEO_REDIRECT_URL` from `.env`.
  - Re-visits within 5 minutes play directly without showing the modal again.
  - After 5 minutes, cookie expires and flow restarts.
  - Secrets are never exposed to the client.
- **Video Preload & 10-Minute Caching**:
  - Preloads video metadata/stream on page load without auto-playing.
  - Caches video assets for 10 minutes (`max-age=600, stale-while-revalidate=300`) without breaking HTTP Range requests or scrubbing.
- **Zero Annoying Ads**:
  - Completely stripped out popunders, automatic popups, automatic redirects, and background tab-hijacking.
  - Non-intrusive Social Bar ad script integration via `next/script` with `strategy="lazyOnload"`.
- **Search & Infinite Scroll**: Fast full-text and regex-fallback search, responsive infinite scrolling feed with `IntersectionObserver`.
- **Full SEO & OpenGraph**: Canonical URLs pointing to `https://bd.p9x9.com`, dynamic XML sitemap at `/sitemap.xml`, and Twitter player cards.
- **Scraper Webhook**: Retained `/api/webs-p9x9-data` API for upserting movies from external scrapers.

---

## ??? Environment Variables Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### Required Variables:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/adultLink` |
| `VIDEO_REDIRECT_URL` | Destination URL when user clicks Continue | `https://apiguinee.org/4/5972de014869...` |
| `SMART_LINK_URL` | Fallback alias for `VIDEO_REDIRECT_URL` | `https://apiguinee.org/4/5972de014869...` |
| `DOWNLOAD_LINK_URL` | Video download link / sponsor link | `https://auctionr.org/4/93a942...` |
| `TELEGRAM_URL` | Official Telegram community link | `https://telegram.p9x9.com/telegram` |
| `MORE_WEBSITE_URL` | Partner network website URL | `https://p9x9.com` |
| `NEXT_PUBLIC_SITE_URL` | Base canonical domain | `https://bd.p9x9.com` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 Measurement ID | `G-YFCKZB39ES` |
| `NEXT_PUBLIC_SOCIAL_BAR_SRC` | Social Bar ad script source | `https://biomanos.org/14/45c4b1...` |

---

## ?? Local Development & Production Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 3. Run Lint Check
```bash
npm run lint
```

### 4. Build for Production
```bash
npm run build
```

### 5. Start Production Server
```bash
npm run start
```

---

## ?? Deployment to `https://bd.p9x9.com`

### Deploying on Vercel:
1. Push repository to GitHub/GitLab.
2. Import project in Vercel.
3. In Project Settings -> Domains, assign `bd.p9x9.com`.
4. In Project Settings -> Environment Variables, add the variables from `.env.example`.
5. Deploy! Next.js App Router and serverless routes will configure automatically.

### Deploying on VPS (Node / PM2 / Nginx):
1. Clone the project and configure `.env.local`.
2. Run `npm install` and `npm run build`.
3. Start process using PM2:
   ```bash
   pm2 start npm --name "bd-p9x9" -- run start -- -p 3000
   ```
4. Point Nginx reverse proxy to `http://localhost:3000` with SSL certificate for `bd.p9x9.com`.

---

## ?? Feature Parity Checklist

| Feature | Legacy Express (`d:\desi.p9x9`) | New Next.js (`D:\bd.p9x9`) | Status |
| :--- | :--- | :--- | :--- |
| **Framework** | Express + EJS | Next.js (App Router, JS only) | ? Implemented |
| **Database** | Mongoose MongoDB (`Movie`, `CountModel`) | Mongoose MongoDB with cached connection pool | ? Full Parity |
| **Home Page** | Search, Latest Additions, Movie Grid | Responsive feed, Latest rail, Infinite scroll | ? Modernized |
| **Movie Page** | Player, Suggested, Download, Telegram | Modern Theater Player, Share, Range Proxy | ? Modernized |
| **Consent Modal** | Cookie flow on play | Accessible modal with 5-min cookie | ? Verified |
| **Smart Redirect** | Redirect on play consent | Redirects to `VIDEO_REDIRECT_URL` on Continue | ? Verified |
| **5-Min Re-visit** | Cookie check | Cookie check; auto-plays without modal | ? Verified |
| **Video Caching** | Direct load | Range Proxy with 10-min cache headers | ? Verified |
| **Ad Cleanliness** | Popunders & Social Bar | Zero popunders; clean lazy-loaded Social Bar | ? Enhanced |
| **Count API** | `GET /api/count`, `POST /count` | `GET /api/count`, `POST /api/count`, `/count` UI | ? Full Parity |
| **Scraper Webhook** | `POST /api/webs-p9x9-data` | `POST /api/webs-p9x9-data` | ? Full Parity |
| **Force Download** | `GET /force-download` | Streaming `ReadableStream` with headers | ? Full Parity |
| **Sitemap** | `GET /sitemap.xml` | Dynamic XML route at `/sitemap.xml` | ? Full Parity |
| **Robots** | Static `robots.txt` | Dynamic `app/robots.js` with sitemap reference | ? Full Parity |
| **Canonical URL** | Host-based | Configured for `https://bd.p9x9.com` | ? Production Ready |
