export function parseMoreSites(rawString) {
  if (!rawString || typeof rawString !== "string") return [];
  return rawString
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((urlStr) => {
      try {
        const parsed = new URL(urlStr);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
        let hostname = parsed.hostname.replace(/^www\./, "");
        let label = hostname;
        if (parsed.pathname && parsed.pathname !== "/") {
          label = `${hostname}${parsed.pathname.replace(/\/$/, "")}`;
        }
        return {
          url: parsed.href,
          label: label || urlStr,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export const SITE_CONFIG = {
  baseUrl: (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://bd.p9x9.com").trim(),
  siteName: (process.env.NEXT_PUBLIC_SITE_NAME || process.env.SITE_NAME || "P9X9").trim(),
  defaultTitle: "BD Viral Link, Bangladeshi Viral Video - Free HD Streams",
  defaultDescription: "প্রথমবার ভিডিও চালাতে Continue চাপতে হবে।",
  defaultAuthor: "P9X9 Team",
  defaultKeywords: "Bangla Sex Video, Bangladeshi Sex Video, Viral Link, Tiktoker Viral Link, Bhabi Sex, Vabi Sex",
  defaultOgImage: "https://i.postimg.cc/KzKbCSqs/1768441412180.png",
  contactEmail: (process.env.NEXT_PUBLIC_CONTACT_EMAIL || process.env.CONTACT_EMAIL || "prfbdxpftt@gmail.com").trim(),
  telegramUrl: (process.env.NEXT_PUBLIC_TELEGRAM_URL || process.env.TELEGRAM_URL || "").trim(),
  downloadLinkUrl: (process.env.NEXT_PUBLIC_DOWNLOAD_LINK_URL || process.env.DOWNLOAD_LINK_URL || "").trim(),
  moreSitesRaw: (process.env.NEXT_PUBLIC_MORE_SITE || process.env.MORE_SITE || "").trim(),
  videoRedirectUrl: (process.env.VIDEO_REDIRECT_URL || process.env.SMART_LINK_URL || "").trim(),
  socialBarSrc: (process.env.NEXT_PUBLIC_SOCIAL_BAR_SRC || "https://biomanos.org/14/45c4b1e112ebcf3e05a35111d09a1ef0").trim(),
  gaMeasurementId: (process.env.NEXT_PUBLIC_GA_ID || "G-YFCKZB39ES").trim(),
  cookieName: "smartLinkFlow",
  cookieMaxAgeSeconds: 300, // 5 minutes
  videoCacheMaxAgeSeconds: 600, // 10 minutes
  moviePageSize: 20,
};
