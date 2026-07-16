import type { ReactNode } from "react";

type RollingTextProps = {
  children: ReactNode;
  /** Extra class on the outer clip wrapper (e.g. to tune gap/alignment). */
  className?: string;
};

// Vertical "rolled" hover reel: the visible face slides up out of a clipped
// wrapper while an identical, aria-hidden copy rises from below into the exact
// original position. Pure CSS drives the motion (see .elc-roll* in globals.css)
// so there is nothing to register or tear down — the animation only arms inside
// `@media (hover: hover) and (pointer: fine)` and respects reduced-motion.
//
// The wrapper is inline so it inherits the host link/button's box; drop it
// inside a semantic <a>/<button> and the whole control's hover/focus triggers
// the roll. Only the real element keeps the accessible name — the duplicate is
// hidden from assistive tech.
export default function RollingText({ children, className }: RollingTextProps) {
  return (
    <span className={className ? `elc-roll ${className}` : "elc-roll"} data-roll>
      <span className="elc-roll-face">{children}</span>
      <span aria-hidden="true" className="elc-roll-face elc-roll-dup">
        {children}
      </span>
    </span>
  );
}
