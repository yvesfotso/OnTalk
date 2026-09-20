import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Mic,
  Settings,
  Sparkles,
  TrendingUp,
  User,
  type LucideIcon,
} from "lucide-react";

import { AI_TUTOR_ENABLED } from "@/lib/constants/app";

export interface NavItem {
  href: string;
  label: string;
  /** Shorter label for the mobile bar. */
  shortLabel?: string;
  icon: LucideIcon;
  /** Renders a small "Soon" badge; the link still works. */
  comingSoon?: boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/app/dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/app/learn", label: "Learn", icon: GraduationCap },
  { href: "/app/vocabulary", label: "Vocabulary", shortLabel: "Words", icon: BookOpen },
  { href: "/app/speaking", label: "Speaking", shortLabel: "Speak", icon: Mic },
  {
    href: "/app/tutor",
    label: "AI Tutor",
    shortLabel: "Tutor",
    icon: Sparkles,
    comingSoon: !AI_TUTOR_ENABLED,
  },
  { href: "/app/progress", label: "Progress", icon: TrendingUp },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/app/profile", label: "Profile", icon: User },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

/** Five destinations that fit a phone's bottom bar. */
export const MOBILE_NAV: NavItem[] = [
  PRIMARY_NAV[0],
  PRIMARY_NAV[1],
  PRIMARY_NAV[3],
  PRIMARY_NAV[4],
  SECONDARY_NAV[0],
];
