"use client";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api-client";
export function ProfileEditor({ profile }: { profile: { displayName: string; email: string; currency: string; locale: string; timezone: string } }) {
  const [name, setName] = useState(profile.displayName); const [timezone, setTimezone] = useState(profile.timezone); const [pending,setPending]=useState(false); const router=useRouter();
  async function save(e:React.FormEvent){e.preventDefault();setPending(true);try{await apiRequest("/api/v1/profile",{method:"PATCH",body:JSON.stringify({displayName:name,timezone})});toast.success("Profile updated");router.refresh();}catch(error){toast.error(error instanceof Error?error.message:"Could not update profile");}finally{setPending(false)}}
  return <form className="profile-form" onSubmit={save}><label><span>Display name</span><input value={name} onChange={e=>setName(e.target.value)} required minLength={2}/></label><label><span>Email</span><input value={profile.email} disabled/></label><div className="field-row"><label><span>Currency</span><input value={profile.currency} disabled/></label><label><span>Locale</span><input value={profile.locale} disabled/></label></div><label><span>Timezone</span><select value={timezone} onChange={e=>setTimezone(e.target.value)}><option>Asia/Kolkata</option><option>Asia/Dubai</option><option>Europe/London</option><option>America/New_York</option><option>America/Los_Angeles</option><option>UTC</option></select></label><button className="primary-button" disabled={pending}><Save/>{pending?"Saving…":"Save profile"}</button></form>;
}
