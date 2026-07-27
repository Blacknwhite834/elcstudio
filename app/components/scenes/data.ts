export type AboutToken =
  | { type: "brand" }
  | { type: "text"; value: string }
  | { type: "media"; src: string };

export type ShowcaseItem = {
  label: string;
  src: string;
  alt: string;
};

export type ProcessStep = {
  title: string;
  text: string;
  posterSrc: string;
  videoMp4Src: string;
  videoWebmSrc: string;
};

export type PricingPlan = {
  eyebrow: string;
  title: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  posterSrc: string;
  videoMp4Src: string;
  videoWebmSrc: string;
};

export const aboutSentence =
  "elc.studio© builds high-converting websites, client spaces, and consistent online presence for local businesses — creating clean, premium digital experiences designed to help brands look professional, stay visible, and turn visitors into clients. The question is...";

export const aboutTokens: AboutToken[] = [
  { type: "brand" },
  { type: "text", value: "builds high-converting websites" },
  { type: "media", src: "/images/photo-33_1-p-1080.webp" },
  { type: "text", value: ", client spaces" },
  { type: "media", src: "/images/Frame-7.png" },
  { type: "text", value: ", and consistent online presence" },
  { type: "media", src: "/images/photo-36_1-p-1080.webp" },
  {
    type: "text",
    value:
      "for local businesses — creating clean, premium digital experiences designed to help brands look professional, stay visible, and turn visitors into clients.",
  },
];

// The closing beat is intentionally NOT part of aboutTokens: it gets its own
// reveal (accent clip-mask + staggered dots) and bridges into "What we do?".
export const aboutClosing = {
  lead: "The question is",
  dots: 3,
};

export const websiteExamples: ShowcaseItem[] = [
  {
    label: "Showcase",
    src: "/images/68022ab71504ac81d459a6bf_thumb__ascent.webp",
    alt: "Ascent restaurant website homepage design",
  },
  {
    label: "Booking",
    src: "/images/6804d4f08d47b543c1ad87da_thumb__ascent--secondary.webp",
    alt: "Ascent website secondary page design",
  },
  {
    label: "Client Spaces",
    src: "/images/680231e4b0be9f8cb4abbb90_bg__ascent.webp",
    alt: "Ascent website full-width visual",
  },
];


export const socialExamples: ShowcaseItem[] = [
  {
    label: "Strategy",
    src: "/images/photo-39_1-p-1080.webp",
    alt: "Editorial portrait used as social content",
  },
  {
    label: "Content",
    src: "/images/photo-34_1-p-1080.webp",
    alt: "Lifestyle photography for a social feed",
  },
  {
    label: "Publishing",
    src: "/images/photo-17-2_1-p-1080.webp",
    alt: "Brand photography for social presence",
  },
];


// The three Figma cards plus the previously approved method stages, so the
// horizontal journey reads as a complete workflow.
export const processSteps: ProcessStep[] = [
  {
    title: "Discovery",
    text: "We define your goals, audience, and digital direction.",
    posterSrc: "/videos/posters/card1.webp",
    videoMp4Src: "/videos/card1.mp4",
    videoWebmSrc: "/videos/card1.webm",
  },
  {
    title: "Strategy",
    text: "We structure your pages, message, and user journey.",
    posterSrc: "/videos/posters/card3.webp",
    videoMp4Src: "/videos/card3.mp4",
    videoWebmSrc: "/videos/card3.webm",
  },
  {
    title: "Visual direction",
    text: "A polished interface direction that feels calm, premium and unmistakably yours.",
    posterSrc: "/videos/posters/card4.webp",
    videoMp4Src: "/videos/card4.mp4",
    videoWebmSrc: "/videos/card4.webm",
  },
  {
    title: "Build and launch",
    text: "Responsive development, testing, technical setup and a smooth handoff.",
    posterSrc: "/videos/posters/card5.webp",
    videoMp4Src: "/videos/card5.mp4",
    videoWebmSrc: "/videos/card5.webm",
  },
  {
    title: "Client space",
    text: "Files, feedback, updates, and progress stay organized.",
    posterSrc: "/videos/posters/card2.webp",
    videoMp4Src: "/videos/card2.mp4",
    videoWebmSrc: "/videos/card2.webm",
  },
  {
    title: "Ongoing presence",
    text: "Consistent updates, social visuals and refinements that keep your brand visible.",
    posterSrc: "/videos/posters/card6.webp",
    videoMp4Src: "/videos/card6.mp4",
    videoWebmSrc: "/videos/card6.webm",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    eyebrow: "Your online foundation",
    title: "Essential",
    description: "A clean website to launch your online presence.",
    price: "99€",
    period: "/ Month",
    features: [
      "Custom website",
      "Maintenance included",
      "Mobile responsive",
      "Client space access",
      "3 monthly revisions",
      "Basic SEO setup",
      "Monthly updates",
    ],
    cta: "Book now",
    posterSrc: "/videos/posters/cardstacked1.webp",
    videoMp4Src: "/videos/cardstacked1.mp4",
    videoWebmSrc: "/videos/cardstacked1.webm",
  },
  {
    eyebrow: "Made to convert",
    title: "Growth",
    description: "Built to attract and convert.",
    price: "149€",
    period: "/ Month",
    features: [
      "Everything in Essential",
      "Advanced website structure",
      "Conversion-focused sections",
      "Quote or booking system",
      "More monthly updates",
      "Priority support",
      "5 monthly revisions",
    ],
    cta: "Book now",
    posterSrc: "/videos/posters/cardstacked2.webp",
    videoMp4Src: "/videos/cardstacked2.mp4",
    videoWebmSrc: "/videos/cardstacked2.webm",
  },
  {
    eyebrow: "Advertising budget not included.",
    title: "Social Presence",
    description: "A simple way to stay visible every week.",
    price: "299€",
    period: "/ Month",
    features: ["Daily activity", "4 posts / week", "Stories", "Reels", "Editing", "Publishing"],
    cta: "Book now",
    posterSrc: "/videos/posters/cardstacked3.webp",
    videoMp4Src: "/videos/cardstacked3.mp4",
    videoWebmSrc: "/videos/cardstacked3.webm",
  },
];

// Direction each media item drifts in from before it lands. Deterministic and
// art-directed — never random — so the composition is identical after refresh
// and while reverse-scrolling.
export type CreateEnterDir = "top" | "left" | "right" | "bottom" | "lift";

export type CreateCard = {
  id:
    | "hero"
    | "vertical"
    | "frameA"
    | "frameB"
    | "detail1"
    | "detail2"
    | "detail3"
    | "square"
    | "capsule";
  /** Landing sequence index — lower lands first (the staggered rhythm). */
  order: number;
  /** Parallax factor: gentle drift during the hold, pull during compression. */
  depth: number;
  /** Where the item lifts in from, how far (px at the 1920 reference), and its
   *  restrained start rotation. Distance is scaled to the viewport at measure. */
  enter: { dir: CreateEnterDir; dist: number; rotate: number };
  /** Final restrained resting rotation, in degrees. */
  rest: number;
  src?: string;
  posterSrc?: string;
  videoMp4Src?: string;
  videoWebmSrc?: string;
  objectPosition?: string;
};

// A curated moodboard of nine on-brand media items. Their final positions and
// sizes live in CSS (.elc-create-card.is-*); each card here only declares how
// it lands. The `order` follows the brief's rhythm: a small upper-left item,
// then a medium lower-right, a portrait from the side, a medium from the
// opposite direction, the central hero, then the supporting details.
export const createCards: CreateCard[] = [
  {
    id: "frameA", // upper-left, lands first
    order: 0,
    depth: 0.55,
    enter: { dir: "left", dist: 260, rotate: -5 },
    rest: -1.5,
    src: "/images/68022ab71504ac81d459a6bf_thumb__ascent-p-800.webp",
    objectPosition: "50% 12%",
  },
  {
    id: "detail1", // lower-right, small motion clip
    order: 1,
    depth: 0.9,
    enter: { dir: "bottom", dist: 240, rotate: 5 },
    rest: 2,
    posterSrc: "/videos/posters/card4.webp",
    videoMp4Src: "/videos/card4.mp4",
    videoWebmSrc: "/videos/card4.webm",
  },
  {
    id: "vertical", // upper-right portrait, from the side
    order: 2,
    depth: 0.8,
    enter: { dir: "right", dist: 300, rotate: 4 },
    rest: 1.5,
    posterSrc: "/videos/posters/cardstacked3.webp",
    videoMp4Src: "/videos/cardstacked3.mp4",
    videoWebmSrc: "/videos/cardstacked3.webm",
  },
  {
    id: "frameB", // center-left, from the opposite direction
    order: 3,
    depth: 0.6,
    enter: { dir: "left", dist: 240, rotate: -4 },
    rest: -1.5,
    src: "/images/6804d4f08d47b543c1ad87da_thumb__ascent--secondary-p-800.webp",
    objectPosition: "50% 18%",
  },
  {
    id: "hero", // central hero, lifts up into place
    order: 4,
    depth: 0.3,
    enter: { dir: "lift", dist: 90, rotate: 0 },
    rest: 0,
    src: "/images/680231e4b0be9f8cb4abbb90_bg__ascent-p-1600.webp",
    objectPosition: "50% 40%",
  },
  {
    id: "square", // lower-left photo, fills the empty zone
    order: 5,
    depth: 0.85,
    enter: { dir: "bottom", dist: 220, rotate: -6 },
    rest: -2,
    src: "/images/photo-33_1-p-1080.webp",
    objectPosition: "50% 45%",
  },
  {
    id: "capsule", // center-right motion capsule
    order: 6,
    depth: 0.95,
    enter: { dir: "right", dist: 200, rotate: 6 },
    rest: 2.5,
    posterSrc: "/videos/posters/card1.webp",
    videoMp4Src: "/videos/card1.mp4",
    videoWebmSrc: "/videos/card1.webm",
  },
  {
    id: "detail2", // upper-right supporting detail
    order: 7,
    depth: 1,
    enter: { dir: "top", dist: 200, rotate: 4 },
    rest: 2,
    src: "/images/Lightbox-Sign-Mockup-p-800.png",
  },
  {
    id: "detail3", // upper-center supporting detail
    order: 8,
    depth: 0.75,
    enter: { dir: "top", dist: 220, rotate: -3 },
    rest: -1.5,
    src: "/images/photo-34_1-p-1080.webp",
    objectPosition: "50% 40%",
  },
];

export const footerPageLinks = [
  { label: "About", href: "#about" },
  { label: "Method", href: "#method" },
  { label: "Subscription", href: "#subscriptions" },
  { label: "Contact", href: "#contact" },
];

export const footerOtherLinks = [
  { label: "Mentions", href: "/mentions" },
  { label: "Privacy", href: "/privacy" },
];
