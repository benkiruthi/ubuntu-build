export const BRAND = {
  name: "Ebbli Build",
  tagline: "Design, Plan & Build Smarter with AI.",
  description:
    "East Africa's AI-powered architecture, engineering and construction platform. Mobile-first, KES-priced, built for Kenya.",
  primary: "#b45309",
  primaryDeep: "#78350f",
  primaryLight: "#fef3c7",
  accent: "#f59e0b",
  url: "https://build.ebbli.co",
};

export const KENYAN_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika",
  "Machakos", "Meru", "Nyeri", "Kakamega", "Kilifi", "Garissa",
  "Kiambu", "Murang'a", "Kirinyaga", "Nyandarua", "Laikipia",
  "Kajiado", "Makueni", "Kitui", "Embu", "Tharaka-Nithi",
  "Isiolo", "Marsabit", "Wajir", "Mandera", "Samburu",
  "Trans Nzoia", "Uasin Gishu", "Elgeyo-Marakwet", "Nandi",
  "Baringo", "Kericho", "Bomet", "Narok", "Migori",
  "Homa Bay", "Kisii", "Nyamira", "Siaya", "Bungoma",
  "Vihiga", "Busia", "Turkana", "West Pokot", "Kwale",
  "Taita-Taveta", "Tana River", "Lamu",
];

export const HOUSE_STYLES = [
  "Modern / Contemporary",
  "Traditional Kenyan",
  "Mediterranean",
  "Colonial",
  "Minimalist",
  "Tropical",
  "Mixed / Undecided",
];

export const PROJECT_TYPES = [
  { value: "residential", label: "Residential Home" },
  { value: "apartment", label: "Apartment / Flats" },
  { value: "commercial", label: "Commercial Building" },
  { value: "mixed_use", label: "Mixed Use" },
  { value: "renovation", label: "Renovation / Extension" },
  { value: "plot_planning", label: "Plot Planning Only" },
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number]["value"];

export const USER_TYPES = [
  { value: "homeowner", label: "Homeowner / Developer", icon: "🏠" },
  { value: "architect", label: "Architect", icon: "📐" },
  { value: "engineer", label: "Structural Engineer", icon: "🔩" },
  { value: "qs", label: "Quantity Surveyor", icon: "📊" },
  { value: "contractor", label: "Contractor / Builder", icon: "🏗️" },
  { value: "interior", label: "Interior Designer", icon: "🛋️" },
  { value: "landscape", label: "Landscape Designer", icon: "🌿" },
  { value: "developer", label: "Property Developer", icon: "🏢" },
] as const;

export type UserType = (typeof USER_TYPES)[number]["value"];

export const SUBSCRIPTION_TIERS = {
  free: {
    label: "Free",
    price: 0,
    projects: 1,
    aiSessions: 20,
    phases: ["architect"],
    teamSize: 1,
    color: "#6b7280",
  },
  starter: {
    label: "Starter",
    price: 1499,
    projects: 3,
    aiSessions: 100,
    phases: ["architect", "qs"],
    teamSize: 1,
    color: "#2563eb",
  },
  pro: {
    label: "Pro",
    price: 3499,
    projects: 10,
    aiSessions: 500,
    phases: ["architect", "qs", "cost_optimizer", "structural", "interior", "landscape", "construction"],
    teamSize: 3,
    color: "#b45309",
  },
  enterprise: {
    label: "Enterprise",
    price: null,
    projects: null,
    aiSessions: null,
    phases: ["all"],
    teamSize: null,
    color: "#7c3aed",
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export const PROJECT_PHASES = [
  { id: "architect", label: "AI Architect", icon: "🏛️", tier: "free" },
  { id: "renders", label: "Render Studio", icon: "🎨", tier: "pro" },
  { id: "qs", label: "Quantity Surveyor", icon: "📐", tier: "starter" },
  { id: "cost_optimizer", label: "Cost Optimizer", icon: "💡", tier: "pro" },
  { id: "structural", label: "Structural Engineer", icon: "🔩", tier: "pro" },
  { id: "interior", label: "Interior Designer", icon: "🛋️", tier: "pro" },
  { id: "landscape", label: "Landscape Designer", icon: "🌿", tier: "pro" },
  { id: "construction", label: "Construction Manager", icon: "🏗️", tier: "pro" },
] as const;
