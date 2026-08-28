import Link from "next/link";
import { CalendarDays, Settings } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ProfileEditor } from "@/components/profile-editor";
import { requireCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/services/profile-service";
export const metadata={title:"Profile"};
export default async function ProfilePage(){const user=await requireCurrentUser();const profile=(await getProfile(user.id))!;return <div className="page"><PageHeader title="Profile" eyebrow="Your Envelope" action={<Link href="/settings" className="icon-button"><Settings/></Link>}/><section className="profile-hero"><div className="avatar">{profile.displayName.slice(0,1).toUpperCase()}</div><span className="verified">Envelope member</span><h2>{profile.displayName}</h2><p>{profile.email}</p><div><CalendarDays/> Planning with intention since {new Intl.DateTimeFormat("en-IN",{month:"long",year:"numeric"}).format(profile.createdAt)}</div></section><section className="panel profile-panel"><div className="section-heading"><div><span className="eyebrow">Personal info</span><h2>Account details</h2></div></div><ProfileEditor profile={profile}/></section></div>}
