import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
export const metadata: Metadata = { title: { default: "Li-Khata — हर रुपये की सही जगह", template: "%s · Li-Khata" }, description: "Visual budgeting for clearer monthly money decisions.", applicationName: "Li-Khata" };
export const viewport = { themeColor: "#101247", colorScheme: "dark", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className={geist.variable}><body>{children}<Toaster theme="dark" position="top-center" richColors /></body></html>; }
