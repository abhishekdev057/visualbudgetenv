"use client";
import { Activity, ChartNoAxesCombined, LayoutDashboard, LogOut, UserRound, WalletCards } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./brand-logo";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard }, { href: "/envelopes", label: "Envelopes", icon: WalletCards },
  { href: "/activity", label: "Activity", icon: Activity }, { href: "/insights", label: "Insights", icon: ChartNoAxesCombined },
  { href: "/profile", label: "Profile", icon: UserRound },
];
export function AppShell({ children, user }: { children: React.ReactNode; user: { displayName: string; email: string | null; phone: string | null } }) {
  const path = usePathname(); const router = useRouter();
  const active = (href: string) => href === "/" ? path === "/" : path.startsWith(href);
  async function signOut() { await apiRequest("/api/v1/auth/logout", { method: "POST" }); router.push("/sign-in"); router.refresh(); }
  return <div className="app-shell">
    <aside className="desktop-sidebar">
      <BrandLogo className="sidebar-logo" />
      <div className="sidebar-balance"><span>हर रुपये की</span><strong>सही जगह</strong></div>
      <nav aria-label="Primary navigation">{nav.map(({ href, label, icon: Icon }) => <Link className={cn("nav-link", active(href) && "active")} href={href} key={href}><Icon /><span>{label}</span></Link>)}</nav>
      <div className="sidebar-account"><div className="avatar small">{user.displayName.slice(0, 1).toUpperCase()}</div><div><strong>{user.displayName}</strong><span>{user.email ?? (user.phone ? `+${user.phone}` : "Mobile verified")}</span></div><button onClick={signOut} aria-label="Sign out"><LogOut /></button></div>
    </aside>
    <main className="main-content">{children}</main>
    <nav className="mobile-nav" aria-label="Primary navigation">{nav.map(({ href, label, icon: Icon }) => <Link className={cn(active(href) && "active")} href={href} key={href}><Icon /><span>{label}</span></Link>)}</nav>
  </div>;
}
