import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth";
export default async function ProductLayout({ children }: { children: React.ReactNode }) { const user = await getCurrentUser(); if (!user) redirect("/sign-in"); return <AppShell user={user}>{children}</AppShell>; }
