import { Baby, BookOpen, Bus, CircleDollarSign, Film, HeartPulse, Home, Landmark, PiggyBank, ReceiptText, ShieldCheck, ShoppingBag, Sparkles, Utensils, WalletCards, type LucideIcon } from "lucide-react";
const icons: Record<string, LucideIcon> = { Baby, BookOpen, Bus, CircleDollarSign, Film, HeartPulse, Home, Landmark, PiggyBank, ReceiptText, ShieldCheck, ShoppingBag, Sparkles, Utensils, WalletCards };
export function EnvelopeIcon({ name, size = 20, className }: { name: string; size?: number; className?: string }) { const Icon = icons[name] ?? WalletCards; return <Icon size={size} className={className} aria-hidden />; }
export const iconNames = Object.keys(icons);
