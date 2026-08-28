import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { AllocationBar } from "@/components/allocation-bar";
import { BalanceHero } from "@/components/balance-hero";
import { EnvelopeCard } from "@/components/envelope-card";
import { getMonthData } from "@/components/month-context";
import { Onboarding } from "@/components/onboarding";
import { PageHeader } from "@/components/page-header";
import { requireCurrentUser } from "@/lib/auth";
import { findBudgetByMonth } from "@/lib/services/budget-service";
export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string }> }) { const user = await requireCurrentUser(); const { year, month, budget } = await getMonthData(user.id, searchParams); if (!budget) { const prev = new Date(year, month - 2, 1); const previous = await findBudgetByMonth(user.id, prev.getFullYear(), prev.getMonth() + 1); return <Onboarding year={year} month={month} previousBudgetId={previous?.id} />; } return <div className="page"><PageHeader title={`Hello, ${user.displayName.split(" ")[0]}`} eyebrow="Your monthly plan" year={year} month={month}/><BalanceHero budget={budget}/><AllocationBar budget={budget}/><section><div className="section-heading"><div><span className="eyebrow">Your plan</span><h2>Budget envelopes</h2></div><Link href="/envelopes">View all <ArrowRight /></Link></div><div className="envelope-grid">{budget.envelopes.slice(0, 4).map(item => <EnvelopeCard key={item.id} envelope={item}/>)}</div>{!budget.envelopes.length && <div className="empty-state"><span><Plus /></span><h3>Create your first envelope</h3><p>Divide this month’s income into clear spending and savings purposes.</p><Link className="primary-button" href="/envelopes">Create envelope</Link></div>}</section></div>; }
