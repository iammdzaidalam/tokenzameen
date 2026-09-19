import {
  BarChart3,
  Building2,
  CalendarCheck,
  FileText,
  Layers,
  LayoutDashboard,
  PenLine,
  Tag,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminSection {
  href: string;
  label: string;
  index: string;
  icon: LucideIcon;
  /** Sections the brief names that ship in a later phase. Rendered as such. */
  later?: boolean;
}

export const ADMIN_SECTIONS: AdminSection[] = [
  { href: "/admin", label: "Dashboard", index: "01", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", index: "02", icon: Users },
  { href: "/admin/site-visits", label: "Site visits", index: "03", icon: CalendarCheck },
  { href: "/admin/inventory", label: "Inventory", index: "04", icon: Layers },
  { href: "/admin/projects", label: "Projects", index: "05", icon: Building2 },
  { href: "/admin/advisors", label: "Advisors", index: "06", icon: UserCheck },
  { href: "/admin/analytics", label: "Analytics", index: "07", icon: BarChart3 },
  { href: "/admin/documents", label: "Documents", index: "08", icon: FileText, later: true },
  { href: "/admin/offers", label: "Offers", index: "09", icon: Tag, later: true },
  { href: "/admin/content", label: "Content", index: "10", icon: PenLine, later: true },
];

export function isActiveSection(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
