"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "../../lib/gsap";
import RollingText from "../rolling-text";
import { footerOtherLinks, footerPageLinks } from "./data";

export default function FooterReveal() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-footer-item]", root);

      gsap.from(items, {
        autoAlpha: 0,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: {
          start: "top 62%",
          toggleActions: "play none none reverse",
          trigger: root,
        },
        stagger: 0.09,
        y: 38,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <footer className="elc-footer" ref={rootRef}>
      <div className="elc-footer-body">
        <p className="elc-footer-thanks" data-footer-item>
          Thank you for stopping by — elc.studio<span className="elc-accent">©</span> looks
          forward to creating with you
        </p>
        <div aria-hidden="true" className="elc-footer-sticker" data-footer-item>
          <Image alt="" height={336} sizes="130px" src="/figma/sticker.png" width={448} />
        </div>
        <nav aria-label="Footer" className="elc-footer-links" data-footer-item>
          <div className="elc-footer-col">
            <p className="elc-footer-col-title">Pages</p>
            {footerPageLinks.map((link) => (
              <a href={link.href} key={link.label}>
                <RollingText>{link.label}</RollingText>
              </a>
            ))}
          </div>
          <div className="elc-footer-col">
            <p className="elc-footer-col-title">Others</p>
            {footerOtherLinks.map((link) => (
              <a href={link.href} key={link.label}>
                <RollingText>{link.label}</RollingText>
              </a>
            ))}
          </div>
        </nav>
      </div>

      {/* Figma wordmark artwork (node 107:189): the tittle of the "i" is the
          rotating © badge, overlaid at its exact position in the vector. */}
      <div className="elc-footer-brand" data-footer-item>
        <Image
          alt=""
          className="elc-footer-wordmark-img"
          height={292}
          src="/figma/wordmark.svg"
          unoptimized
          width={1919}
        />
        <svg
          aria-hidden="true"
          className="elc-footer-badge"
          fill="none"
          focusable="false"
          viewBox="0 0 100 100"
        >
          <defs>
            <path
              d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
              id="elc-footer-badge-path"
            />
          </defs>
          <text>
            <textPath href="#elc-footer-badge-path">
              © 2026 elc.studio. All rights reserved.
            </textPath>
          </text>
        </svg>
        <p className="elc-sr-only">elc.studio© — © 2026 elc.studio. All rights reserved.</p>
      </div>
    </footer>
  );
}
