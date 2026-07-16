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

export type CreateLetter = "y" | "o" | "u" | "r" | "s";

export type CreateCard = {
  id: "hero" | "vertical" | "frameA" | "frameB" | "detail1" | "detail2" | "detail3";
  /** Letter of "yours." the card visually escapes from (undefined = fades in late). */
  from?: CreateLetter;
  /** Parallax factor during the climax drift (0 = static, 1 = full drift). */
  depth: number;
  src?: string;
  posterSrc?: string;
  videoMp4Src?: string;
  videoWebmSrc?: string;
  objectPosition?: string;
};

// The media revealed inside the letterforms of "yours." — each tile shows the
// exact same asset (or poster) as the card it later escapes into, so the
// letter→card layer swap reads as one continuous object.
export const createLetterMedia: Record<CreateLetter, { src: string; objectPosition?: string }> = {
  y: { src: "/images/68022ab71504ac81d459a6bf_thumb__ascent-p-800.webp", objectPosition: "50% 12%" },
  o: {
    src: "/images/6804d4f08d47b543c1ad87da_thumb__ascent--secondary-p-800.webp",
    objectPosition: "50% 18%",
  },
  u: { src: "/images/680231e4b0be9f8cb4abbb90_bg__ascent-p-1600.webp", objectPosition: "50% 40%" },
  r: { src: "/videos/posters/cardstacked3.webp", objectPosition: "50% 30%" },
  s: { src: "/videos/posters/card4.webp", objectPosition: "50% 50%" },
};

// Editorial composition after the media escapes "yours." — one landscape hero,
// one vertical social video, two interface frames, three small details.
export const createCards: CreateCard[] = [
  {
    id: "hero",
    from: "u",
    depth: 0.3,
    src: "/images/680231e4b0be9f8cb4abbb90_bg__ascent-p-1600.webp",
    objectPosition: "50% 40%",
  },
  {
    id: "vertical",
    from: "r",
    depth: 0.8,
    posterSrc: "/videos/posters/cardstacked3.webp",
    videoMp4Src: "/videos/cardstacked3.mp4",
    videoWebmSrc: "/videos/cardstacked3.webm",
  },
  {
    id: "frameA",
    from: "y",
    depth: 0.55,
    src: "/images/68022ab71504ac81d459a6bf_thumb__ascent-p-800.webp",
    objectPosition: "50% 12%",
  },
  {
    id: "frameB",
    from: "o",
    depth: 0.6,
    src: "/images/6804d4f08d47b543c1ad87da_thumb__ascent--secondary-p-800.webp",
    objectPosition: "50% 18%",
  },
  {
    id: "detail1",
    from: "s",
    depth: 0.9,
    posterSrc: "/videos/posters/card4.webp",
    videoMp4Src: "/videos/card4.mp4",
    videoWebmSrc: "/videos/card4.webm",
  },
  { id: "detail2", depth: 1, src: "/images/Lightbox-Sign-Mockup-p-800.png" },
  { id: "detail3", depth: 0.75, src: "/images/photo-34_1-p-1080.webp" },
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
