import Link from "next/link";
import { PlayIcon, SearchIcon } from "@/components/icons/Icons";

export const metadata = {
  title: "404 - পেজটি খুঁজে পাওয়া যায়নি | BD.P9X9",
  description: "অনুরোধ করা পেজ বা ভিডিওটি খুঁজে পাওয়া যায়নি।",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="error-page-wrap">
      <div className="error-card animate-fade-in">
        <div className="error-code-badge" aria-label="404 Error">
          <span className="error-code-text">404</span>
        </div>

        <h1 className="error-title">পেজটি খুঁজে পাওয়া যায়নি</h1>

        <p className="error-subtitle">
          আপনি যে পেজ বা ভিডিওটি খুঁজছেন তা সম্ভবত মুছে ফেলা হয়েছে, নাম পরিবর্তন করা হয়েছে অথবা লিঙ্কটি ভুল দেওয়া হয়েছে।
        </p>

        <div className="error-actions-group">
          <Link href="/" className="btn-error-primary">
            <PlayIcon size={16} />
            <span>হোমে ফিরে যান</span>
          </Link>
          <Link href="/" className="btn-error-secondary">
            <SearchIcon size={16} />
            <span>সব ভিডিও ব্রাউজ করুন</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
