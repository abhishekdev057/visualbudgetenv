"use client";

import { ArrowRight, LoaderCircle, MessageSquareText, RefreshCw, ShieldCheck } from "lucide-react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { apiRequest } from "@/lib/api-client";

type WidgetReply = string | { [key: string]: unknown };

declare global {
  interface Window {
    initSendOTP?: (configuration: Record<string, unknown>) => void;
    sendOtp?: (identifier: string, success?: (data: WidgetReply) => void, failure?: (error: unknown) => void) => void;
    verifyOtp?: (otp: string | number, success?: (data: WidgetReply) => void, failure?: (error: unknown) => void, requestId?: string) => void;
  }
}

const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID;
const tokenAuth = process.env.NEXT_PUBLIC_MSG91_WIDGET_TOKEN;

function readAccessToken(reply: WidgetReply): string | null {
  if (typeof reply === "string") return reply.length > 20 ? reply : null;
  const nested = typeof reply.data === "object" && reply.data ? reply.data as Record<string, unknown> : null;
  const token = reply["access-token"] ?? reply.accessToken ?? reply.token ?? nested?.["access-token"] ?? nested?.accessToken ?? nested?.token;
  return typeof token === "string" && token.length > 20 ? token : null;
}

function readRequestId(reply: WidgetReply) {
  if (typeof reply === "string") return undefined;
  const nested = typeof reply.data === "object" && reply.data ? reply.data as Record<string, unknown> : null;
  const id = reply.reqId ?? reply.requestId ?? nested?.reqId ?? nested?.requestId;
  return typeof id === "string" ? id : undefined;
}

function messageFrom(error: unknown, fallback: string) {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return fallback;
}

export function MobileOtpAuth({ signup }: { signup: boolean }) {
  const router = useRouter();
  const [ready, setReady] = useState(false); const [fallback, setFallback] = useState(false);
  const [phone, setPhone] = useState(""); const [otp, setOtp] = useState(""); const [requestId, setRequestId] = useState<string>();
  const [step, setStep] = useState<"phone" | "otp">("phone"); const [pending, setPending] = useState(false); const [error, setError] = useState("");

  const finish = useCallback(async (reply: WidgetReply) => {
    const accessToken = readAccessToken(reply);
    if (!accessToken) { setPending(false); setError("Verification was incomplete. Please request a fresh OTP."); return; }
    try {
      await apiRequest("/api/v1/auth/msg91", { method: "POST", body: JSON.stringify({ accessToken, client: "web" }) });
      router.push("/"); router.refresh();
    } catch (reason) { setPending(false); setError(messageFrom(reason, "We could not sign you in with that OTP.")); }
  }, [router]);

  const initialize = useCallback(() => {
    if (!widgetId || !tokenAuth || !window.initSendOTP) return;
    window.initSendOTP({ widgetId, tokenAuth, exposeMethods: true, success: finish, failure: (reason: unknown) => { setPending(false); setError(messageFrom(reason, "OTP verification failed. Please try again.")); } });
    setReady(true);
  }, [finish]);

  const sendOtp = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) { setError("Enter a valid 10-digit Indian mobile number."); return; }
    if (!ready || !window.sendOtp) { setError("Mobile sign-in is still loading. Please try again in a moment."); return; }
    setPending(true); setError("");
    window.sendOtp(`91${digits}`, (reply) => { setRequestId(readRequestId(reply)); setStep("otp"); setPending(false); }, (reason) => { setPending(false); setError(messageFrom(reason, "We could not send an OTP right now.")); });
  };

  const verifyOtp = () => {
    if (!/^\d{4,8}$/.test(otp)) { setError("Enter the OTP sent to your mobile."); return; }
    if (!window.verifyOtp) { setError("Mobile sign-in is still loading. Please try again in a moment."); return; }
    setPending(true); setError("");
    window.verifyOtp(otp, finish, (reason) => { setPending(false); setError(messageFrom(reason, "That OTP did not work. Please try again.")); }, requestId);
  };

  if (!widgetId || !tokenAuth) return null;
  return <section className="otp-auth" aria-label="Mobile OTP sign-in">
    <Script src="https://verify.msg91.com/otp-provider.js" strategy="afterInteractive" onLoad={initialize} onError={() => setFallback(true)} />
    {fallback && <Script src="https://verify.phone91.com/otp-provider.js" strategy="afterInteractive" onLoad={initialize} />}
    <div className="otp-auth-heading"><span className="auth-provider-icon"><MessageSquareText /></span><div><strong>Continue with mobile</strong><small>{step === "phone" ? "A secure OTP confirms it’s really you." : `Code sent to +91 ${phone.replace(/\D/g, "")}`}</small></div><span className="otp-secure"><ShieldCheck /> Secure</span></div>
    {step === "phone" ? <div className="otp-field-row"><label><span className="sr-only">Indian mobile number</span><b>+91</b><input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel-national" placeholder="Mobile number" aria-label="Indian mobile number" /></label><button type="button" className="otp-action" onClick={sendOtp} disabled={pending || !ready}>{pending ? <LoaderCircle className="spin" /> : <>Send code <ArrowRight /></>}</button></div> : <div className="otp-verify-row"><input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 8))} inputMode="numeric" autoComplete="one-time-code" placeholder="Enter OTP" aria-label="One-time password" autoFocus/><button type="button" className="otp-action" onClick={verifyOtp} disabled={pending}>{pending ? <LoaderCircle className="spin" /> : <>Verify <ShieldCheck /></>}</button><button type="button" className="otp-resend" onClick={sendOtp} disabled={pending}><RefreshCw /> Resend</button></div>}
    {error && <p className="otp-error" role="alert">{error}</p>}
    <p className="otp-note">By continuing, you agree to receive a one-time verification message. {signup ? "Your Li-Khata account will be created after verification." : ""}</p>
  </section>;
}
