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

/* ---- Drifting gallery (create scene) ------------------------------------ */

// The headline is an immovable typographic island at the exact centre of the
// stage; the work streams past it. Every item enters beyond the RIGHT edge,
// drifts continuously leftward, bends through a wide upper or lower Bezier
// arch around the protected central text, and exits beyond the LEFT edge.
// There is no circular orbit and no card ever reverses horizontally.
export type DriftPathId = "uHigh" | "uMid" | "uLow" | "lLow" | "lMid" | "lDeep";

// Purely a stacking order for natural overlap — NOT a depth system. Size and
// timing carry the richness; nothing is dimmed or shrunk to fake distance.
export type DriftLayer = "back" | "mid" | "front";

/** Anchors in normalised stage units: u × halfStageW, v × halfStageH, where
 *  u = +1 is the right edge and v = +1 the bottom. Authored right-to-left, so
 *  u decreases monotonically down each list and the horizontal drift can never
 *  double back. Six anchors keeps the sag between neighbours negligible.
 *
 *  The upper family is a wide inverted-U: it comes in near mid-height, climbs
 *  to its crest just right of centre, then eases back down toward mid-height
 *  as it leaves. The lower family is the same shape flipped. */
export const driftPaths: Record<DriftPathId, Array<[number, number]>> = {
  uHigh: [
    [1.3, -0.04],
    [0.78, -0.48],
    [0.26, -0.78],
    [-0.26, -0.72],
    [-0.78, -0.42],
    [-1.36, -0.06],
  ],
  uMid: [
    [1.3, -0.14],
    [0.78, -0.44],
    [0.26, -0.6],
    [-0.26, -0.56],
    [-0.78, -0.34],
    [-1.36, -0.02],
  ],
  uLow: [
    [1.3, -0.02],
    [0.78, -0.26],
    [0.26, -0.42],
    [-0.26, -0.4],
    [-0.78, -0.26],
    [-1.36, -0.04],
  ],
  lLow: [
    [1.3, 0.04],
    [0.78, 0.28],
    [0.26, 0.42],
    [-0.26, 0.4],
    [-0.78, 0.26],
    [-1.36, 0.02],
  ],
  lMid: [
    [1.3, 0.12],
    [0.78, 0.44],
    [0.26, 0.62],
    [-0.26, 0.58],
    [-0.78, 0.34],
    [-1.36, 0.04],
  ],
  lDeep: [
    [1.3, 0.02],
    [0.78, 0.46],
    [0.26, 0.76],
    [-0.26, 0.7],
    [-0.78, 0.4],
    [-1.36, 0.06],
  ],
};

export type CreateCard = {
  id: string;
  /** Which curated arc this item rides. Deterministic, never random. */
  path: DriftPathId;
  /** Stacking order only. */
  layer: DriftLayer;
  /** Desktop schedule, in master-timeline units: entry time and travel span.
   *  Spans stay close together so every item drifts at a comparable speed —
   *  the rhythm comes from the stagger, not from varying velocity. */
  at: number;
  dur: number;
  /** Mobile schedule. Omitted = the item is not part of the mobile set. */
  atM?: number;
  durM?: number;
  /** Fixed base tilt in degrees, kept within ±2. Most items sit upright. */
  tilt: number;
  /** Axis of the small internal crop drift while the container travels. */
  crop: "x" | "y";
  src?: string;
  posterSrc?: string;
  videoMp4Src?: string;
  videoWebmSrc?: string;
  objectPosition?: string;
};

// Ten stream items from the studio's own visual universe — the Ascent site
// work, the client space and social clips, the branding mockups. Every one of
// them crosses and leaves; nothing is held back to close the scene, because
// the hand-off is carried by the closing line, not by a final image.
//
// Upper and lower arcs alternate straight down the list, and the mobile subset
// (the items carrying atM) alternates too, so the narrower mobile arcs never
// stack two pieces on the same side of the text. Larger items ride the
// shallower arcs; the small fragments take the extremes.
export const createCards: CreateCard[] = [
  {
    id: "site", // the flagship website
    path: "uMid",
    layer: "back",
    at: 9,
    dur: 11,
    atM: 5.6,
    durM: 6.8,
    tilt: -1,
    crop: "x",
    src: "/images/68022ab71504ac81d459a6bf_thumb__ascent.webp",
    objectPosition: "50% 22%",
  },
  {
    id: "social", // social presence
    path: "lMid",
    layer: "mid",
    at: 10.5,
    dur: 11,
    atM: 7.1,
    durM: 6.8,
    tilt: 1.5,
    crop: "x",
    posterSrc: "/videos/posters/card6.webp",
    videoMp4Src: "/videos/card6.mp4",
    videoWebmSrc: "/videos/card6.webm",
  },
  {
    id: "space", // client space — portrait
    path: "uHigh",
    layer: "front",
    at: 12,
    dur: 10.5,
    atM: 8.6,
    durM: 6.5,
    tilt: 0,
    crop: "y",
    posterSrc: "/videos/posters/card2.webp",
    videoMp4Src: "/videos/card2.mp4",
    videoWebmSrc: "/videos/card2.webm",
  },
  {
    id: "booking", // the reservation page
    path: "lLow",
    layer: "back",
    at: 13.5,
    dur: 11.5,
    atM: 10.1,
    durM: 7.1,
    tilt: 1,
    crop: "x",
    src: "/images/6804d4f08d47b543c1ad87da_thumb__ascent--secondary-p-1080.webp",
    objectPosition: "50% 30%",
  },
  {
    id: "ui", // an interface detail, in motion
    path: "uHigh",
    layer: "front",
    at: 15,
    dur: 10.5,
    tilt: -1.5,
    crop: "x",
    posterSrc: "/videos/posters/card1.webp",
    videoMp4Src: "/videos/card1.mp4",
    videoWebmSrc: "/videos/card1.webm",
  },
  {
    id: "brand", // signage — the brand out in the world
    path: "lDeep",
    layer: "mid",
    at: 16.5,
    dur: 11,
    tilt: 2,
    crop: "x",
    src: "/images/Lightbox-Sign-Mockup-p-800.png",
    objectPosition: "50% 44%",
  },
  {
    id: "launch", // a launched campaign
    path: "uLow",
    layer: "back",
    at: 18,
    dur: 11.5,
    tilt: 0,
    crop: "x",
    src: "/images/unlock-2-p-800.jpg",
    objectPosition: "50% 50%",
  },
  {
    id: "type", // typography and process
    path: "lLow",
    layer: "front",
    at: 19.5,
    dur: 10.5,
    atM: 11.6,
    durM: 6.5,
    tilt: -2,
    crop: "x",
    posterSrc: "/videos/posters/card5.webp",
    videoMp4Src: "/videos/card5.mp4",
    videoWebmSrc: "/videos/card5.webm",
  },
  {
    id: "process", // structure and wireframe work
    path: "uMid",
    layer: "mid",
    at: 21,
    dur: 11,
    tilt: 1,
    crop: "x",
    posterSrc: "/videos/posters/card3.webp",
    videoMp4Src: "/videos/card3.mp4",
    videoWebmSrc: "/videos/card3.webm",
  },
  {
    id: "mobile", // the work in the hand — portrait
    path: "lDeep",
    layer: "front",
    at: 22.5,
    dur: 11,
    atM: 13.1,
    durM: 6.8,
    tilt: 0,
    crop: "y",
    src: "/images/elc-phone-hand.png",
    objectPosition: "50% 46%",
  },
];

/** Timeline unit at which the last stream item has fully left the stage — the
 *  clean centred-headline beat the closing line then grows out of. */
export const STREAM_END = 33.5;

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
