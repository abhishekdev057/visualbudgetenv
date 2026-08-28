import { ActivityList } from "@/components/activity-list";
import { getMonthData } from "@/components/month-context";
import { PageHeader } from "@/components/page-header";
import { requireCurrentUser } from "@/lib/auth";
import { listTransactions } from "@/lib/services/transaction-service";
export const metadata={title:"Activity"};
export default async function ActivityPage({searchParams}:{searchParams:Promise<{year?:string;month?:string}>}){const user=await requireCurrentUser();const{year,month,budget}=await getMonthData(user.id,searchParams);const rows=budget?await listTransactions(user.id,{budgetId:budget.id,limit:100}):{items:[]};return <div className="page"><PageHeader title="Activity" eyebrow="Every movement" year={year} month={month}/><ActivityList rows={rows.items} envelopes={budget?.envelopes??[]}/></div>}
