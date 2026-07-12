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
  "elc.studio© builds high-converting websites, client spaces, and consistent online presence for local businesses — creating clean, premium digital experiences designed to help brands look professional, stay visible, and turn visitors into clients.";

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

export const websiteExamples: ShowcaseItem[] = [
  {
    label: "Example 1",
    src: "/images/68022ab71504ac81d459a6bf_thumb__ascent.webp",
    alt: "Ascent restaurant website homepage design",
  },
  {
    label: "Example 2",
    src: "/images/6804d4f08d47b543c1ad87da_thumb__ascent--secondary.webp",
    alt: "Ascent website secondary page design",
  },
  {
    label: "Example 3",
    src: "/images/680231e4b0be9f8cb4abbb90_bg__ascent.webp",
    alt: "Ascent website full-width visual",
  },
];

// The "What we do" media grows into the first Websites frame, so it reuses
// the same asset to keep the hand-off between the two scenes seamless.
export const whatWeDoMedia = websiteExamples[0];

export const socialExamples: ShowcaseItem[] = [
  {
    label: "Example 1",
    src: "/images/photo-39_1-p-1080.webp",
    alt: "Editorial portrait used as social content",
  },
  {
    label: "Example 2",
    src: "/images/photo-34_1-p-1080.webp",
    alt: "Lifestyle photography for a social feed",
  },
  {
    label: "Example 3",
    src: "/images/photo-17-2_1-p-1080.webp",
    alt: "Brand photography for social presence",
  },
];

// Same continuity trick: the "And..." media becomes the first Social frame.
export const andTransitionMedia = socialExamples[0];

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
    title: "Client space",
    text: "Files, feedback, updates, and progress stay organized.",
    posterSrc: "/videos/posters/card2.webp",
    videoMp4Src: "/videos/card2.mp4",
    videoWebmSrc: "/videos/card2.webm",
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
