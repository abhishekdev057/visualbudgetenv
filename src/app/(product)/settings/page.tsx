import { Globe2, Moon, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SettingsActions } from "@/components/settings-actions";
import { ChangePassword } from "@/components/change-password";
import { requireCurrentUser } from "@/lib/auth";
export const metadata={title:"Settings"};
export default async function SettingsPage(){const user=await requireCurrentUser();return <div className="page narrow"><PageHeader title="Settings" eyebrow="Preferences & privacy"/><section><span className="eyebrow">Product defaults</span><div className="settings-group"><div className="settings-row static-row"><span><Globe2/></span><div><strong>Currency & locale</strong><small>Indian rupee · English (India)</small></div></div><div className="settings-row static-row"><span><Moon/></span><div><strong>Appearance</strong><small>Dark theme, optimized for low-light use</small></div></div><div className="settings-row static-row"><span><ShieldCheck/></span><div><strong>Privacy boundary</strong><small>Every financial query is scoped to your account</small></div></div></div></section><section><span className="eyebrow">Security</span><div className="settings-group"><ChangePassword hasPassword={user.hasPassword}/></div></section><section><span className="eyebrow">Data & account</span><SettingsActions hasPassword={user.hasPassword}/></section></div>}
