import type { Metadata } from "next";
import Link from "next/link";
import { contactData } from "@/content/contact";
import { SITE_CONFIG } from "@/lib/config";
import ContactEmailActions from "@/components/ContactEmailActions";
import { TelegramIcon, ArrowUpRightIcon, GlobeIcon } from "@/components/icons/Icons";

export const metadata: Metadata = {
  title: contactData.title,
  description: contactData.metaDescription,
  alternates: {
    canonical: `${SITE_CONFIG.baseUrl}/contact`,
  },
  openGraph: {
    title: contactData.title,
    description: contactData.metaDescription,
    url: `${SITE_CONFIG.baseUrl}/contact`,
    siteName: SITE_CONFIG.siteName,
    type: "website",
    images: [
      {
        url: SITE_CONFIG.defaultOgImage,
        width: 1200,
        height: 630,
        alt: contactData.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: contactData.title,
    description: contactData.metaDescription,
    images: [SITE_CONFIG.defaultOgImage],
  },
};

export default function ContactPage() {
  const email = (
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    process.env.CONTACT_EMAIL ||
    SITE_CONFIG.contactEmail ||
    "prfbdxpftt@gmail.com"
  ).trim();

  const telegramUrl = (
    process.env.NEXT_PUBLIC_TELEGRAM_URL ||
    process.env.TELEGRAM_URL ||
    SITE_CONFIG.telegramUrl ||
    ""
  ).trim();

  const siteUrl = (
    process.env.SITE_URL ||
    SITE_CONFIG.baseUrl ||
    "https://p9x9.com"
  ).trim();

  return (
    <div className="content-page-wrap">
      <article className="content-container animate-fade-in">
        {/* Breadcrumb navigation */}
        <nav className="content-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="crumb-sep">/</span>
          <span className="crumb-current">Contact Us</span>
        </nav>

        {/* Page Hero Header */}
        <header className="page-header-block">
          <div className="page-pill-badge">
            <GlobeIcon size={13} />
            <span>Support &amp; Inquiries</span>
          </div>
          <h1 className="page-main-heading">{contactData.heading}</h1>
          <p className="page-lead-text">{contactData.intro}</p>
        </header>

        {/* Section 1: Email */}
        <section className="article-section highlight-contact-section">
          <h2 className="section-heading">{contactData.emailSection.title}</h2>
          <p className="section-body-text">{contactData.emailSection.description}</p>
          <ContactEmailActions email={email} />
        </section>

        {/* Section 2: Why Contact Us */}
        <section className="article-section">
          <h2 className="section-heading">{contactData.whyContactUs.title}</h2>
          <ul className="feature-check-list">
            {contactData.whyContactUs.reasons.map((reason, idx) => (
              <li key={idx} className="check-list-item">
                <span className="check-bullet" aria-hidden="true">&bull;</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 3: Copyright / DMCA Removal Requests */}
        <section className="article-section dmca-notice-card">
          <h2 className="section-heading">{contactData.dmca.title}</h2>
          <p className="section-body-text">{contactData.dmca.intro}</p>
          <ul className="feature-check-list checklist-indented">
            {contactData.dmca.checklist.map((item, idx) => (
              <li key={idx} className="check-list-item">
                <span className="check-bullet" aria-hidden="true">&bull;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="section-body-text dmca-closing">
            Send your request to{" "}
            <a href={`mailto:${email}`} className="highlight-link">
              {email}
            </a>
            . Valid requests are processed as quickly as possible, usually within 24 hours. Please note that incomplete requests may take longer to process.
          </p>
        </section>

        {/* Section 4: Report a Broken Video */}
        <section className="article-section">
          <h2 className="section-heading">{contactData.brokenVideo.title}</h2>
          <p className="section-body-text">{contactData.brokenVideo.intro}</p>
          <ul className="feature-check-list checklist-indented">
            {contactData.brokenVideo.checklist.map((item, idx) => (
              <li key={idx} className="check-list-item">
                <span className="check-bullet" aria-hidden="true">&bull;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 5: Report Inappropriate Content */}
        <section className="article-section warning-section-box">
          <div className="warning-card-inner">
            <span className="age-pill">ZERO TOLERANCE</span>
            <h2 className="section-heading warning-heading">
              {contactData.inappropriateContent.title}
            </h2>
            <p className="section-body-text warning-text">
              {contactData.inappropriateContent.description}
            </p>
          </div>
        </section>

        {/* Section 6: Advertising & Partnerships */}
        <section className="article-section">
          <h2 className="section-heading">{contactData.advertising.title}</h2>
          <p className="section-body-text">
            Interested in advertising, sponsorships, or other business opportunities? Email us at{" "}
            <a href={`mailto:${email}`} className="highlight-link">
              {email}
            </a>{" "}
            with a short description of your proposal and we will get back to you. We look forward to exploring ways to work together.
          </p>
        </section>

        {/* Section 7: Other Ways To Reach Us */}
        <section className="article-section other-ways-box">
          <h2 className="section-heading">{contactData.otherWays.title}</h2>
          <div className="other-ways-grid">
            {telegramUrl && (
              <div className="other-way-card">
                <div className="other-way-icon tg-icon-bg">
                  <TelegramIcon size={20} />
                </div>
                <div className="other-way-info">
                  <span className="other-way-label">{contactData.otherWays.telegramLabel}</span>
                  <p className="other-way-desc">{contactData.otherWays.telegramPrompt}</p>
                </div>
                <a
                  href={telegramUrl}
                  className="btn-tg-contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join Official Telegram Channel"
                >
                  <span>Open Telegram</span>
                  <ArrowUpRightIcon size={14} />
                </a>
              </div>
            )}

            <div className="other-way-card">
              <div className="other-way-icon web-icon-bg">
                <GlobeIcon size={20} />
              </div>
              <div className="other-way-info">
                <span className="other-way-label">{contactData.otherWays.websiteLabel}</span>
                <p className="other-way-desc">Visit our primary web platform</p>
              </div>
              <a
                href={siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`}
                className="btn-web-contact"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Website"
              >
                <span>{contactData.otherWays.websiteUrl}</span>
                <ArrowUpRightIcon size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* Section 8: What To Include In Your Message */}
        <section className="article-section">
          <h2 className="section-heading">{contactData.whatToInclude.title}</h2>
          <p className="section-body-text">{contactData.whatToInclude.description}</p>
        </section>

        {/* Section 9: Response Time */}
        <section className="article-section">
          <h2 className="section-heading">{contactData.responseTime.title}</h2>
          <p className="section-body-text">{contactData.responseTime.description}</p>
        </section>

        {/* Section 10: Before You Contact Us */}
        <section className="article-section before-contact-section">
          <h2 className="section-heading">{contactData.beforeYouContact.title}</h2>
          <div className="tips-grid">
            {contactData.beforeYouContact.tips.map((tip, idx) => (
              <div key={idx} className="tip-card">
                <span className="tip-badge">Tip {idx + 1}</span>
                <h3 className="tip-title">{tip.title}</h3>
                <p className="tip-desc">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
