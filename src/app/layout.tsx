import type { Metadata } from "next";
import { DM_Sans, Manrope, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const bodyFont = DM_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const displayFont = Manrope({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const headingFont = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-heading", display: "swap" });

export const metadata: Metadata = { title: { default: "Li-Khata — हर रुपये की सही जगह", template: "%s · Li-Khata" }, description: "Visual budgeting for clearer monthly money decisions.", applicationName: "Li-Khata" };
export const viewport = { themeColor: "#070916", colorScheme: "dark", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable} ${headingFont.variable}`}>
      <body>
        {children}
        <Toaster theme="dark" position="top-center" richColors />
      </body>
    </html>
  );
}
