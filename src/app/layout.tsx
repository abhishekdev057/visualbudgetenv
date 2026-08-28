import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
export const metadata: Metadata = { title: { default: "Envelope — Give every rupee a purpose", template: "%s · Envelope" }, description: "Visual envelope budgeting for calmer monthly money decisions.", applicationName: "Envelope" };
export const viewport = { themeColor: "#090908", colorScheme: "dark", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className={geist.variable}><body>{children}<Toaster theme="dark" position="top-center" richColors /></body></html>; }
