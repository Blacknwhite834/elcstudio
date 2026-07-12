"use client";

import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "../../lib/gsap";
import { aboutSentence, aboutTokens } from "./data";

function renderToken(token: (typeof aboutTokens)[number], index: number) {
  if (token.type === "brand") {
    return (
      <span className="elc-about-word" data-about-word key={`brand-${index}`}>
        elc.studio<span className="elc-accent">©</span>
      </span>
    );
  }

  if (token.type === "media") {
    return (
      <span className="elc-about-media" data-about-media key={`media-${index}`}>
        <Image alt="" fill sizes="120px" src={token.src} />
      </span>
    );
  }

  return token.value.split(" ").map((word, wordIndex) => (
    <Fragment key={`word-${index}-${wordIndex}`}>
      {wordIndex > 0 ? " " : null}
      <span className="elc-about-word" data-about-word>
        {word}
      </span>
    </Fragment>
  ));
}

export default function AboutScene() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>("[data-about-word]");
      const media = gsap.utils.toArray<HTMLElement>("[data-about-media]");

      gsap.set(words, { color: "#a7a7a7" });
      gsap.set(media, { autoAlpha: 0, scale: 0.82, transformOrigin: "50% 70%" });

      const reveal = gsap.timeline({
        scrollTrigger: {
          end: "bottom 62%",
          scrub: true,
          start: "top 78%",
          trigger: root,
        },
      });

      reveal.to(words, {
        color: "#050505",
        duration: 1,
        ease: "none",
        stagger: 0.028,
      });

      media.forEach((item, index) => {
        // Media reveals ride along the word stagger at their sentence position.
        reveal.to(
          item,
          { autoAlpha: 1, duration: 0.24, ease: "power2.out", scale: 1 },
          0.16 + index * 0.3,
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section aria-labelledby="about-title" className="elc-about" id="about" ref={rootRef}>
      <h2 className="elc-sr-only" id="about-title">
        About elc.studio
      </h2>
      <p className="elc-about-text">
        <span className="elc-sr-only">{aboutSentence}</span>
        <span aria-hidden="true" className="elc-about-visual">
          {aboutTokens.map((token, index) => (
            <span className="elc-about-chunk" key={index}>
              {index > 0 ? " " : null}
              {renderToken(token, index)}
            </span>
          ))}
        </span>
      </p>
    </section>
  );
}
