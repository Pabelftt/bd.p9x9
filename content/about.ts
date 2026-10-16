export interface FaqItem {
  question: string;
  answer: string;
}

export interface WhyChooseItem {
  title: string;
  description: string;
}

export interface AboutContent {
  title: string;
  metaDescription: string;
  hero: {
    heading: string;
    lead: string;
  };
  mission: {
    title: string;
    description: string;
  };
  whoWeAre: {
    title: string;
    description: string;
  };
  whatWeOffer: {
    title: string;
    items: string[];
  };
  whyChoose: {
    title: string;
    items: WhyChooseItem[];
  };
  contentCategories: {
    title: string;
    description: string;
  };
  qualityAndTech: {
    title: string;
    description: string;
  };
  standardsPolicy: {
    title: string;
    intro: string;
    prohibited: string[];
    closing: string;
  };
  ageWarning: {
    title: string;
    description: string;
  };
  copyrightRemoval: {
    title: string;
    template: string;
  };
  faq: {
    title: string;
    items: FaqItem[];
  };
  getInTouch: {
    title: string;
    template: string;
    contactPath: string;
  };
}

export const aboutData: AboutContent = {
  title: "About Us - P9X9",
  metaDescription:
    "About P9X9 - a free adult video platform from around the world. HD quality, daily updates, thousands of categories, fast streaming and no sign-up required.",
  hero: {
    heading: "About P9X9",
    lead:
      "P9X9 is a free adult video platform offering one of the largest and fastest-growing collections of explicit entertainment on the internet. Visitors from every corner of the world come to P9X9 to watch fresh HD videos across hundreds of categories — with no account, no subscription and no hidden fees. Just open the site, click, and watch.",
  },
  mission: {
    title: "Our Mission",
    description:
      "Our mission is simple: to give every adult user a fast, free, and private place to enjoy high-quality adult entertainment. We believe adult content should be accessible, well-organized, and easy to browse — so we built a platform that loads quickly on any device, updates every single day, and lets you find exactly what you want in seconds.",
  },
  whoWeAre: {
    title: "Who We Are",
    description:
      "P9X9 is operated by the P9x9 Team, a small group of developers and content curators who work around the clock to keep the site running smoothly. We source, verify, and organize hand-picked videos from around the world so you never have to dig through messy, broken pages elsewhere. Our library is growing daily with thousands of videos covering every taste and preference.",
  },
  whatWeOffer: {
    title: "What We Offer",
    items: [
      "Free streaming in HD quality — no account or sign-up required",
      "Daily updates with dozens of fresh videos every single day",
      "Hundreds of categories: Desi, Amateur, MILF, Asian, Hardcore, Viral and many more",
      "Fast, responsive design that works beautifully on mobile and desktop",
      "Powerful search by title, category and tags",
      "Related videos, recommended content and infinite scroll browsing",
      "Safe, malware-free environment with strict content moderation",
    ],
  },
  whyChoose: {
    title: "Why Choose P9X9?",
    items: [
      {
        title: "Speed",
        description:
          "Our pages are optimized for instant loading — no waiting, no buffering, no frustrating delays.",
      },
      {
        title: "Variety",
        description:
          "From desi videos to international studio productions, there is something for everyone.",
      },
      {
        title: "Freshness",
        description:
          "New videos are added every single day, so there is always something new to discover.",
      },
      {
        title: "Privacy",
        description:
          "You can browse and watch without creating an account. We never ask for personal information.",
      },
      {
        title: "Reliability",
        description:
          "Broken links are fixed quickly, and our team continuously monitors the platform.",
      },
    ],
  },
  contentCategories: {
    title: "Content Categories",
    description:
      "Our collection covers a massive range of categories including but not limited to: Desi videos, Bangladeshi and Indian clips, amateur content, MILF and mature videos, Asian beauties, European productions, hardcore scenes, viral clips, romantic videos, and everything in between. Whatever your taste, our search and category pages make it easy to find your next favorite video.",
  },
  qualityAndTech: {
    title: "Quality & Technology",
    description:
      "We put a strong focus on performance. Every page is built with a modern, lightweight design that loads fast even on slow connections. Videos stream smoothly in HD, images are optimized for quick loading, and the entire site is fully responsive — it looks and works great on phones, tablets, laptops, and desktops. Lazy loading and smart caching mean you spend less time waiting and more time watching.",
  },
  standardsPolicy: {
    title: "Our Standards & Content Policy",
    intro: "P9X9 is committed to safe and legal adult entertainment. We strictly prohibit:",
    prohibited: [
      "Any content involving minors — zero tolerance policy",
      "Non-consensual, forced or exploitative material",
      "Violent, illegal or bestiality content",
      "Copyrighted material posted without authorization",
    ],
    closing:
      "Every video that appears on our platform is carefully reviewed. We cooperate fully with law enforcement and take immediate action on any reported content that violates these rules.",
  },
  ageWarning: {
    title: "18+ Age Warning",
    description:
      "This website contains explicit adult material. It is intended solely for adults aged 18 or older (21 in some jurisdictions). By continuing to use this website you confirm that you are of legal age, that you agree to view adult content, and that adult entertainment is legal in your country or region. If you are under 18, please leave this website immediately.",
  },
  copyrightRemoval: {
    title: "Copyright & Content Removal",
    template:
      "We respect the rights of content owners. If you believe your copyrighted material appears on our website without your permission, or if you want any video removed, contact us at {CONTACT_EMAIL} with the video URL and we will process your request as quickly as possible — usually within 24 hours.",
  },
  faq: {
    title: "Frequently Asked Questions",
    items: [
      {
        question: "Is P9X9 really free?",
        answer: "Yes. 100% free — no subscriptions, no hidden charges, no premium paywalls.",
      },
      {
        question: "Do I need an account?",
        answer: "No. You can browse, watch and enjoy everything without registering.",
      },
      {
        question: "Can I watch on my phone?",
        answer: "Absolutely. The site is fully mobile-friendly.",
      },
      {
        question: "How often are videos added?",
        answer: "New videos are added every single day.",
      },
      {
        question: "Is it safe?",
        answer:
          "Yes — we keep the platform clean and free of malware, and moderate all content strictly.",
      },
    ],
  },
  getInTouch: {
    title: "Get In Touch",
    template:
      "Questions, feedback or removal requests? Contact us at {CONTACT_EMAIL} or visit our Contact page (/contact). We read every message and usually reply within 24–48 hours.",
    contactPath: "/contact",
  },
};
