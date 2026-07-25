import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  Award,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/rewards", label: "Rewards", icon: Trophy },
  { href: "/credentials", label: "Credentials", icon: Award },
];
