import Link from "next/link";
import { ArrowLeft, WalletCards } from "lucide-react";
export default function NotFound(){return <main className="standalone-state"><span><WalletCards/></span><h1>This page is not available</h1><p>The page you’re looking for doesn’t exist or is no longer available.</p><Link className="primary-button" href="/"><ArrowLeft/>Back to overview</Link></main>}
