import { EnvelopeDialog } from "@/components/envelope-dialog";
import { EnvelopeCard } from "@/components/envelope-card";
import { getMonthData } from "@/components/month-context";
import { Onboarding } from "@/components/onboarding";
import { PageHeader } from "@/components/page-header";
import { requireCurrentUser } from "@/lib/auth";
export const metadata={title:"Envelopes"};
export default async function EnvelopesPage({searchParams}:{searchParams:Promise<{year?:string;month?:string}>}){const user=await requireCurrentUser();const{year,month,budget}=await getMonthData(user.id,searchParams);if(!budget)return <Onboarding year={year} month={month}/>;return <div className="page"><PageHeader title="Your envelopes" eyebrow="Monthly plan" year={year} month={month}/><div className="page-intro"><p>{budget.envelopes.length} purposes, {budget.allocationUsed}% of income assigned.</p><EnvelopeDialog budgetId={budget.id}/></div>{budget.envelopes.length?<div className="envelope-grid large">{budget.envelopes.map(item=><EnvelopeCard key={item.id} envelope={item}/>)}</div>:<div className="empty-state"><h3>Create your first envelope</h3><p>Turn your income into a plan with clear purposes.</p><EnvelopeDialog budgetId={budget.id}/></div>}</div>}
