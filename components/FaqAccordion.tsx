"use client";

import { useState } from "react";
import { ChevronDownIcon } from "./icons/Icons";
import type { FaqItem } from "@/content/about";

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="faq-accordion-list" role="region" aria-label="Frequently Asked Questions">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        const headingId = `faq-heading-${idx}`;
        const panelId = `faq-panel-${idx}`;

        return (
          <div key={idx} className={`faq-card ${isOpen ? "open" : ""}`}>
            <button
              type="button"
              id={headingId}
              className="faq-question-btn"
              onClick={() => toggleItem(idx)}
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <span className="faq-question-text">{item.question}</span>
              <span className={`faq-chevron ${isOpen ? "open" : ""}`} aria-hidden="true">
                <ChevronDownIcon size={18} />
              </span>
            </button>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={headingId}
                className="faq-answer-panel animate-fade-in"
              >
                <p className="faq-answer-text">{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
