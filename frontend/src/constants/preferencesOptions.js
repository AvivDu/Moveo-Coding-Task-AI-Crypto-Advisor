import {
  Sprout,
  BarChart2,
  Zap,
  TrendingUp,
  Wallet,
  BookOpen,
  Shield,
  Sliders,
  Flame,
  Clock,
  CalendarClock,
  CalendarRange,
  Link2,
  Image as ImageIcon,
  LineChart,
  Newspaper,
  Scale,
  Cpu,
} from "lucide-react";

export const EXPERIENCE_OPTIONS = [
  { id: "beginner", icon: Sprout, title: "Beginner", desc: "Just getting started with crypto" },
  { id: "intermediate", icon: BarChart2, title: "Intermediate", desc: "Know the basics, exploring more" },
  { id: "advanced", icon: Zap, title: "Advanced", desc: "Active trader or developer" },
];

export const GOAL_OPTIONS = [
  { id: "growth", icon: TrendingUp, title: "Growth", desc: "Maximize portfolio value" },
  { id: "income", icon: Wallet, title: "Income", desc: "Generate passive returns" },
  { id: "learning", icon: BookOpen, title: "Learning", desc: "Understand the space better" },
];

export const RISK_OPTIONS = [
  { id: "low", icon: Shield, title: "Conservative", desc: "Preserve capital, steady gains" },
  { id: "medium", icon: Sliders, title: "Balanced", desc: "Mix of growth and stability" },
  { id: "high", icon: Flame, title: "Aggressive", desc: "Max upside, higher volatility" },
];

export const HORIZON_OPTIONS = [
  { id: "short", icon: Clock, title: "Short term", desc: "Weeks to a few months" },
  { id: "medium", icon: CalendarRange, title: "Medium term", desc: "Several months to a year" },
  { id: "long", icon: CalendarClock, title: "Long term", desc: "A year or more" },
];

export const INTEREST_OPTIONS = [
  { id: "defi", icon: Link2, label: "DeFi" },
  { id: "nfts", icon: ImageIcon, label: "NFTs" },
  { id: "trading", icon: LineChart, label: "Trading" },
  { id: "news", icon: Newspaper, label: "Market News" },
  { id: "regulation", icon: Scale, label: "Regulation" },
  { id: "technology", icon: Cpu, label: "Technology" },
];
