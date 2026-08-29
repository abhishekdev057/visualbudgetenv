import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe2, Mail, ShieldCheck, Smartphone } from "lucide-react";
import { MobileOtpAuth } from "@/components/mobile-otp-auth";
import { requireCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/services/profile-service";

export const metadata = { title: "Finish setting up your account" };

export default async function VerifyContactsPage() {
  const user = await requireCurrentUser();
  const profile = (await getProfile(user.id))!;
  const emailVerified = Boolean(profile.emailVerifiedAt);
  const phoneVerified = Boolean(profile.phoneVerifiedAt);
  const complete = emailVerified && phoneVerified;

  return <div className="page onboarding-page">
    <div className="onboarding-topline"><span className="eyebrow">One last step</span><span className="onboarding-progress">{Number(emailVerified) + Number(phoneVerified)} of 2 complete</span></div>
    <section className="onboarding-hero"><div><span className="onboarding-icon"><ShieldCheck /></span><span className="eyebrow">Your account, connected</span><h1>{complete ? "You’re all set." : "Finish your secure setup."}</h1><p>{complete ? "Both contact methods are verified. Your Li-Khata account is ready." : "Connect both details once so sign-in, recovery, and important alerts always reach you."}</p></div><div className="onboarding-orbit"><span /><span /><span /></div></section>
    <section className="connection-grid">
      <article className={`connection-card ${emailVerified ? "is-complete" : ""}`}><div className="connection-card-head"><span className="connection-icon email"><Mail /></span><span className="connection-state">{emailVerified ? <><CheckCircle2 /> Verified</> : "Recommended"}</span></div><h2>Email address</h2><p>{emailVerified ? profile.email : "Use Google to confirm the email connected to your account."}</p>{emailVerified ? <div className="connection-confirmed">{profile.email}</div> : <a href="/api/v1/auth/google?intent=link" className="google-connect"><Globe2 /> Verify with Google <ArrowRight /></a>}</article>
      <article className={`connection-card ${phoneVerified ? "is-complete" : ""}`}><div className="connection-card-head"><span className="connection-icon phone"><Smartphone /></span><span className="connection-state">{phoneVerified ? <><CheckCircle2 /> Verified</> : "Required"}</span></div><h2>Mobile number</h2><p>{phoneVerified ? `+${profile.phone}` : "Add a number for quick sign-in and account recovery."}</p>{phoneVerified ? <div className="connection-confirmed">+{profile.phone}</div> : <MobileOtpAuth signup={false} intent="link" />}</article>
    </section>
    <div className="onboarding-actions">{complete ? <Link className="primary-button" href="/"><span>Continue to dashboard</span><ArrowRight /></Link> : <Link className="text-button" href="/">Finish later <ArrowRight /></Link>}</div>
  </div>;
}
