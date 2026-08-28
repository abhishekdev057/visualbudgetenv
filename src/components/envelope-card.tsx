import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EnvelopeIcon } from "./icon";
import { formatMoney } from "@/lib/utils";
import type { EnvelopeSummary } from "./balance-hero";
export function EnvelopeCard({ envelope }: { envelope: EnvelopeSummary }) {
  const actual = envelope.type === "savings" ? envelope.saved : envelope.spent;
  return <Link href={`/envelopes/${envelope.id}`} className={`envelope-card ${envelope.accent}`}><div className="envelope-top"><span className="envelope-icon"><EnvelopeIcon name={envelope.icon} /></span><ArrowUpRight className="arrow" /></div><div><span className="status-line"><i className={envelope.tone} />{envelope.label}</span><h3>{envelope.name}</h3></div><div className="envelope-money"><strong>{formatMoney(envelope.remaining)}</strong><span>remaining of {formatMoney(envelope.allocatedAmount)}</span></div><div className="progress"><span style={{ width: `${Math.min(envelope.used, 100)}%` }} /></div><div className="envelope-foot"><span>{formatMoney(actual)} {envelope.type === "savings" ? "saved" : "spent"}</span><span>{envelope.transactionCount} {envelope.transactionCount === 1 ? "entry" : "entries"}</span></div></Link>;
}
