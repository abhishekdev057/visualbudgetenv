import { Globe2, Moon, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SettingsActions } from "@/components/settings-actions";
import { ChangePassword } from "@/components/change-password";
export const metadata={title:"Settings"};
export default function SettingsPage(){return <div className="page narrow"><PageHeader title="Settings" eyebrow="Preferences & privacy"/><section><span className="eyebrow">Preferences</span><div className="settings-group"><div className="settings-row"><span><Globe2/></span><div><strong>Currency & locale</strong><small>INR · English (India)</small></div><b>›</b></div><div className="settings-row"><span><Moon/></span><div><strong>Appearance</strong><small>Dark · Envelope’s signature theme</small></div><b>›</b></div><div className="settings-row"><span><ShieldCheck/></span><div><strong>Privacy</strong><small>Your records stay scoped to your account</small></div><b>›</b></div></div></section><section><span className="eyebrow">Security</span><div className="settings-group"><ChangePassword/></div></section><section><span className="eyebrow">Data & account</span><SettingsActions/></section></div>}
