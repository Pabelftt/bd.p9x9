import Link from "next/link";
import { PlayIcon, SearchIcon } from "@/components/icons/Icons";

export const metadata = {
  title: "404 - Page Not Found | BD.P9X9",
  description: "The requested page or video could not be found.",
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

        <h1 className="error-title">Page Not Found</h1>

        <p className="error-subtitle">
          The page or video you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="error-actions-group">
          <Link href="/" className="btn-error-primary">
            <PlayIcon size={16} />
            <span>Return to Home</span>
          </Link>
          <Link href="/" className="btn-error-secondary">
            <SearchIcon size={16} />
            <span>Browse All Videos</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
