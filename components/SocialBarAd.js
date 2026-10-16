import Script from "next/script";
import { SITE_CONFIG } from "@/lib/config";

export default function SocialBarAd() {
  if (!SITE_CONFIG.socialBarSrc) return null;

  return (
    <Script
      id="social-bar-ad"
      src={SITE_CONFIG.socialBarSrc}
      strategy="lazyOnload"
      data-cfasync="false"
    />
  );
}
