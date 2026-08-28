import Image from "next/image";
import Link from "next/link";

export function BrandLogo({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return <Link href="/" className={`brand-logo ${compact ? "compact" : ""} ${className}`.trim()} aria-label="Li-Khata home">
    <Image src="/brand/li-khata-logo.png" alt="Li-Khata — हर रुपये की सही जगह" width={2172} height={724} priority />
  </Link>;
}
