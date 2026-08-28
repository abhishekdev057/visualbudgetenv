import { getMonthData } from "@/components/month-context";
import { InsightsView } from "@/components/insights-view";
import { PageHeader } from "@/components/page-header";
import { requireCurrentUser } from "@/lib/auth";
import { getInsights } from "@/lib/services/insight-service";
export const metadata={title:"Insights"};
export default async function InsightsPage({searchParams}:{searchParams:Promise<{year?:string;month?:string}>}){const user=await requireCurrentUser();const{year,month,budget}=await getMonthData(user.id,searchParams);const data=budget?await getInsights(user.id,budget.id):{insights:[],spendingByCategory:[],dailyTrend:[]};return <div className="page"><PageHeader title="Insights" eyebrow="Patterns, not guesses" year={year} month={month}/><InsightsView data={data}/></div>}
