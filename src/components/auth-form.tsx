"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Globe2, LockKeyhole, Mail, ShieldCheck, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { BrandLogo } from "./brand-logo";
import { MobileOtpAuth } from "./mobile-otp-auth";

type Method = "choose" | "mobile" | "credentials";

export function AuthForm({ mode, oauthError }: { mode: "sign-in" | "sign-up"; oauthError?: string }) {
  const signup = mode === "sign-up";
  const router = useRouter();
  const [method, setMethod] = useState<Method>("choose");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const oauthMessage = oauthError === "cancelled" ? "Google sign-in was cancelled. You can choose another method or try again." : oauthError ? "Google sign-in could not be completed. Please try again." : "";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError("");
    const data = new FormData(event.currentTarget);
    try {
      await apiRequest(`/api/v1/auth/${signup ? "register" : "login"}`, { method: "POST", body: JSON.stringify({ displayName: data.get("displayName"), email: data.get("email"), password: data.get("password"), client: "web" }) });
      router.push("/onboarding/verify"); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Something went wrong. Please try again."); } finally { setPending(false); }
  }

  return <main className="auth-experience">
    <section className="auth-cinematic" aria-label="Li-Khata introduction">
      <video className="auth-video" autoPlay loop muted playsInline preload="metadata" poster="/brand/li-khata-logo.png"><source src="/auth/budget-planning.mp4" type="video/mp4" /></video>
      <div className="auth-cinematic-overlay" />
      <div className="auth-cinematic-content"><BrandLogo className="auth-brand" /><div className="auth-story"><span className="auth-kicker">A clearer way to plan</span><h1>Give every<br /><em>rupee</em> a purpose.</h1><p>Li-Khata makes a calm home for your monthly plan, spending, and progress.</p><div className="auth-trust-line"><CheckCircle2 /> Private by design <span /> <ShieldCheck /> Your data, your control</div></div></div>
    </section>
    <section className="auth-workspace"><div className="auth-workspace-inner">
      <BrandLogo className="mobile-auth-logo" />
      {method !== "choose" && <button type="button" className="auth-back" onClick={() => { setMethod("choose"); setError(""); }}><ArrowLeft /> All sign-in options</button>}
      <span className="eyebrow">{signup ? "Start your account" : "Welcome back"}</span>
      <h2>{method === "choose" ? (signup ? "How would you like to begin?" : "Choose how to continue") : method === "mobile" ? "Verify your mobile" : signup ? "Create with email" : "Sign in with email"}</h2>
      <p className="auth-lead">{method === "choose" ? "Pick one secure method. We’ll help you complete your account details next." : method === "mobile" ? "We’ll send a one-time code to securely confirm this number." : "Use the email and password connected to your Li-Khata account."}</p>
      {oauthMessage && <div className="form-error" role="alert">{oauthMessage}</div>}
      {method === "choose" && <div className="auth-methods">
        <button type="button" className="auth-method-card auth-method-mobile" onClick={() => setMethod("mobile")}><span className="auth-method-icon"><Smartphone /></span><span><strong>Continue with mobile</strong><small>Verify with a one-time code</small></span><ArrowRight /></button>
        <a className="auth-method-card auth-method-google" href="/api/v1/auth/google"><span className="auth-method-icon"><Globe2 /></span><span><strong>Continue with Google</strong><small>Sign in or create an account</small></span><ArrowRight /></a>
        <button type="button" className="auth-method-card auth-method-credentials" onClick={() => setMethod("credentials")}><span className="auth-method-icon"><Mail /></span><span><strong>Continue with email</strong><small>Email and password</small></span><ArrowRight /></button>
        <p className="auth-choice-note"><LockKeyhole /> Your account is always private. You can securely add the missing email or mobile afterwards.</p>
      </div>}
      {method === "mobile" && <MobileOtpAuth signup={signup} />}
      {method === "credentials" && <form className="form-grid auth-form credential-form" onSubmit={submit}>
        {signup && <label><span>Your name</span><input name="displayName" autoComplete="name" placeholder="e.g. Aisha Sharma" required minLength={2} /></label>}
        <label><span>Email address</span><input type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></label>
        <label><span>Password</span><div className="password-input"><input type={showPassword ? "text" : "password"} name="password" autoComplete={signup ? "new-password" : "current-password"} placeholder={signup ? "At least 10 characters" : "Your password"} required minLength={signup ? 10 : 1} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="primary-button auth-submit" disabled={pending}>{pending ? "Please wait…" : signup ? "Create account" : "Sign in"}<ArrowRight /></button>
        <p className="credential-note"><ShieldCheck /> After signing in, verify your mobile and a Google-verified email to complete the account.</p>
      </form>}
      <p className="auth-switch">{signup ? "Already have an account?" : "New to Li-Khata?"} <Link href={signup ? "/sign-in" : "/sign-up"}>{signup ? "Sign in" : "Create account"}</Link></p>
    </div></section>
  </main>;
}
