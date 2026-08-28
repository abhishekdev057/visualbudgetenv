import Link from "next/link";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { monthLabel, shiftMonth } from "@/lib/utils";
export function PageHeader({ title, eyebrow, year, month, action }: { title: string; eyebrow?: string; year?: number; month?: number; action?: React.ReactNode }) {
  const previous = year && month ? shiftMonth(year, month, -1) : null; const next = year && month ? shiftMonth(year, month, 1) : null;
  return <header className="page-header"><div><span className="eyebrow">{eyebrow ?? "Li-Khata"}</span><h1>{title}</h1></div>{year && month ? <div className="month-picker"><Link href={`?year=${previous!.year}&month=${previous!.month}`} aria-label="Previous month"><ChevronLeft /></Link><span>{monthLabel(year, month)}</span><Link href={`?year=${next!.year}&month=${next!.month}`} aria-label="Next month"><ChevronRight /></Link></div> : action ?? <Link className="icon-button" href="/settings" aria-label="Settings"><SlidersHorizontal /></Link>}</header>;
}
