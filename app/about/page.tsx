import type { Metadata } from "next";
import Link from "next/link";
import { aboutData } from "@/content/about";
import { SITE_CONFIG } from "@/lib/config";
import FaqAccordion from "@/components/FaqAccordion";
import { ArrowUpRightIcon, StarIcon } from "@/components/icons/Icons";

export const metadata: Metadata = {
  title: aboutData.title,
  description: aboutData.metaDescription,
  alternates: {
    canonical: `${SITE_CONFIG.baseUrl}/about`,
  },
  openGraph: {
    title: aboutData.title,
    description: aboutData.metaDescription,
    url: `${SITE_CONFIG.baseUrl}/about`,
    siteName: SITE_CONFIG.siteName,
    type: "website",
    images: [
      {
        url: SITE_CONFIG.defaultOgImage,
        width: 1200,
        height: 630,
        alt: aboutData.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: aboutData.title,
    description: aboutData.metaDescription,
    images: [SITE_CONFIG.defaultOgImage],
  },
};

export default function AboutPage() {
  const email = (
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    process.env.CONTACT_EMAIL ||
    SITE_CONFIG.contactEmail ||
    "prfbdxpftt@gmail.com"
  ).trim();

  const copyrightText = aboutData.copyrightRemoval.template.replace(
    "{CONTACT_EMAIL}",
    email
  );

  return (
    <div className="content-page-wrap">
      <article className="content-container animate-fade-in">
        {/* Breadcrumb navigation */}
        <nav className="content-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="crumb-sep">/</span>
          <span className="crumb-current">About Us</span>
        </nav>

        {/* Page Hero Header */}
        <header className="page-header-block">
          <div className="page-pill-badge">
            <StarIcon size={13} />
            <span>Official Information</span>
          </div>
          <h1 className="page-main-heading">{aboutData.hero.heading}</h1>
          <p className="page-lead-text">{aboutData.hero.lead}</p>
        </header>

        {/* Section 1: Our Mission */}
        <section className="article-section">
          <h2 className="section-heading">{aboutData.mission.title}</h2>
          <p className="section-body-text">{aboutData.mission.description}</p>
        </section>

        {/* Section 2: Who We Are */}
        <section className="article-section">
          <h2 className="section-heading">{aboutData.whoWeAre.title}</h2>
          <p className="section-body-text">{aboutData.whoWeAre.description}</p>
        </section>

        {/* Section 3: What We Offer */}
        <section className="article-section">
          <h2 className="section-heading">{aboutData.whatWeOffer.title}</h2>
          <ul className="feature-check-list">
            {aboutData.whatWeOffer.items.map((item, index) => (
              <li key={index} className="check-list-item">
                <span className="check-bullet" aria-hidden="true">&bull;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 4: Why Choose P9X9 */}
        <section className="article-section">
          <h2 className="section-heading">{aboutData.whyChoose.title}</h2>
          <div className="why-choose-grid">
            {aboutData.whyChoose.items.map((item, index) => (
              <div key={index} className="why-choose-card">
                <h3 className="why-choose-title">{item.title}</h3>
                <p className="why-choose-desc">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Content Categories */}
        <section className="article-section">
          <h2 className="section-heading">{aboutData.contentCategories.title}</h2>
          <p className="section-body-text">{aboutData.contentCategories.description}</p>
        </section>

        {/* Section 6: Quality & Technology */}
        <section className="article-section">
          <h2 className="section-heading">{aboutData.qualityAndTech.title}</h2>
          <p className="section-body-text">{aboutData.qualityAndTech.description}</p>
        </section>

        {/* Section 7: Our Standards & Content Policy */}
        <section className="article-section">
          <h2 className="section-heading">{aboutData.standardsPolicy.title}</h2>
          <p className="section-body-text">{aboutData.standardsPolicy.intro}</p>
          <ul className="prohibited-list">
            {aboutData.standardsPolicy.prohibited.map((item, index) => (
              <li key={index} className="prohibited-item">
                <span className="prohibited-icon" aria-hidden="true">&times;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="section-body-text policy-closing">
            {aboutData.standardsPolicy.closing}
          </p>
        </section>

        {/* Section 8: 18+ Age Warning */}
        <section className="article-section warning-section-box" role="region" aria-label="Age Warning">
          <div className="warning-card-inner">
            <span className="age-pill">18+ WARNING</span>
            <h2 className="section-heading warning-heading">{aboutData.ageWarning.title}</h2>
            <p className="section-body-text warning-text">{aboutData.ageWarning.description}</p>
          </div>
        </section>

        {/* Section 9: Copyright & Content Removal */}
        <section className="article-section">
          <h2 className="section-heading">{aboutData.copyrightRemoval.title}</h2>
          <p className="section-body-text">
            We respect the rights of content owners. If you believe your copyrighted material appears on our website without your permission, or if you want any video removed, contact us at{" "}
            <a href={`mailto:${email}`} className="highlight-link">
              {email}
            </a>{" "}
            with the video URL and we will process your request as quickly as possible — usually within 24 hours.
          </p>
        </section>

        {/* Section 10: Frequently Asked Questions */}
        <section className="article-section faq-section-block">
          <h2 className="section-heading">{aboutData.faq.title}</h2>
          <FaqAccordion items={aboutData.faq.items} />
        </section>

        {/* Section 11: Get In Touch */}
        <section className="article-section get-in-touch-box">
          <h2 className="section-heading">{aboutData.getInTouch.title}</h2>
          <p className="section-body-text">
            Questions, feedback or removal requests? Contact us at{" "}
            <a href={`mailto:${email}`} className="highlight-link">
              {email}
            </a>{" "}
            or visit our{" "}
            <Link href="/contact" className="highlight-link-bold">
              Contact page (/contact)
            </Link>
            . We read every message and usually reply within 24–48 hours.
          </p>
          <div className="contact-cta-action">
            <Link href="/contact" className="btn-contact-primary">
              <span>Go to Contact Page</span>
              <ArrowUpRightIcon size={16} />
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
