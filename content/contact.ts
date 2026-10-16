export interface BeforeContactTip {
  title: string;
  description: string;
}

export interface ContactContent {
  title: string;
  metaDescription: string;
  heading: string;
  intro: string;
  emailSection: {
    title: string;
    description: string;
  };
  whyContactUs: {
    title: string;
    reasons: string[];
  };
  dmca: {
    title: string;
    intro: string;
    checklist: string[];
    closingTemplate: string;
  };
  brokenVideo: {
    title: string;
    intro: string;
    checklist: string[];
  };
  inappropriateContent: {
    title: string;
    description: string;
  };
  advertising: {
    title: string;
    descriptionTemplate: string;
  };
  otherWays: {
    title: string;
    telegramLabel: string;
    telegramPrompt: string;
    websiteLabel: string;
    websiteUrl: string;
  };
  whatToInclude: {
    title: string;
    description: string;
  };
  responseTime: {
    title: string;
    description: string;
  };
  beforeYouContact: {
    title: string;
    tips: BeforeContactTip[];
  };
}

export const contactData: ContactContent = {
  title: "Contact Us - P9X9",
  metaDescription:
    "Contact P9X9 - support, feedback, copyright/DMCA removal requests, advertising and partnership enquiries. We reply within 24-48 hours.",
  heading: "Contact Us",
  intro:
    "Have a question, feedback, a broken-link report, or a content removal request? We read every single message. Reach us through any of the options below and our team will get back to you as soon as possible — usually within 24 to 48 hours.",
  emailSection: {
    title: "Email",
    description: "The fastest and most reliable way to reach us is by email:",
  },
  whyContactUs: {
    title: "Why Contact Us",
    reasons: [
      "Content removal or DMCA/copyright requests",
      "Reporting broken video links or playback issues",
      "Reporting suspicious, illegal or inappropriate content",
      "General feedback and feature suggestions",
      "Partnership, advertising and business enquiries",
      "Technical support and website issues",
    ],
  },
  dmca: {
    title: "Copyright / DMCA Removal Requests",
    intro:
      "We take copyright matters very seriously. If you are a content owner and believe your work appears on P9X9 without authorization, please send us a removal request containing:",
    checklist: [
      "The exact URL(s) of the video(s) on our website",
      "A short description of the copyrighted work",
      "Proof of ownership or authorization to act on behalf of the owner",
      "Your contact information (name and email)",
    ],
    closingTemplate:
      "Send your request to {CONTACT_EMAIL}. Valid requests are processed as quickly as possible, usually within 24 hours. Please note that incomplete requests may take longer to process.",
  },
  brokenVideo: {
    title: "Report a Broken Video",
    intro:
      "If a video is not loading, playing slowly, or showing an error, help us fix it faster by including:",
    checklist: [
      "The page URL of the video",
      "The device and browser you are using",
      "A short description of the problem (error message, buffering, etc.)",
    ],
  },
  inappropriateContent: {
    title: "Report Inappropriate Content",
    description:
      "P9X9 has zero tolerance for content involving minors, non-consensual acts, violence, or anything illegal. If you come across such material anywhere on our platform, please report it immediately with the video URL. We investigate every report and act on it right away.",
  },
  advertising: {
    title: "Advertising & Partnerships",
    descriptionTemplate:
      "Interested in advertising, sponsorships, or other business opportunities? Email us at {CONTACT_EMAIL} with a short description of your proposal and we will get back to you. We look forward to exploring ways to work together.",
  },
  otherWays: {
    title: "Other Ways To Reach Us",
    telegramLabel: "Telegram",
    telegramPrompt: "Join our channel for updates and announcements",
    websiteLabel: "Website",
    websiteUrl: "p9x9.com",
  },
  whatToInclude: {
    title: "What To Include In Your Message",
    description:
      "To help us respond faster, please include as much detail as possible: exact page URL, what you expected to happen, and what actually happened. Clear, complete messages allow us to resolve issues in a single reply.",
  },
  responseTime: {
    title: "Response Time",
    description:
      "We usually reply within 24–48 hours. Removal requests are handled with priority. During busy periods responses may take slightly longer — please avoid sending duplicate messages, as that can delay our reply.",
  },
  beforeYouContact: {
    title: "Before You Contact Us",
    tips: [
      {
        title: "Broken video?",
        description: "Try refreshing the page first, or try a different browser.",
      },
      {
        title: "Looking for a video?",
        description: "Use our search box at the top of the page.",
      },
      {
        title: "Forgot how to browse?",
        description: "All categories are available on the homepage.",
      },
    ],
  },
};
