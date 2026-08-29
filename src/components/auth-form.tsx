"use client";

import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Smartphone, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { AuthHeroVisual } from "./auth-hero-visual";
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

  const oauthMessage =
    oauthError === "cancelled"
      ? "Google sign-in was cancelled. Please pick another option or try again."
      : oauthError
      ? "Google sign-in could not be completed. Please try again."
      : "";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await apiRequest(`/api/v1/auth/${signup ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify({
          displayName: data.get("displayName"),
          email: data.get("email"),
          password: data.get("password"),
          client: "web",
        }),
      });
      router.push("/onboarding/verify");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-experience-v2">
      {/* Hero Visual Panel (Left desktop panel / top mobile visual) */}
      <AuthHeroVisual />

      {/* Main Form Workspace Panel */}
      <section className="auth-workspace-v2">
        <div className="auth-workspace-card">
          {/* Mobile Logo View */}
          <div className="mobile-auth-brand-row">
            <BrandLogo className="mobile-auth-logo-v2" />
          </div>

          {/* Mode Switcher Tabs */}
          <div className="auth-mode-tabs" role="tablist">
            <Link
              href="/sign-in"
              className={`auth-tab ${!signup ? "active" : ""}`}
              role="tab"
              aria-selected={!signup}
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className={`auth-tab ${signup ? "active" : ""}`}
              role="tab"
              aria-selected={signup}
            >
              Create Account
            </Link>
          </div>

          {/* Back Navigation when inside a sub-method */}
          {method !== "choose" && (
            <button
              type="button"
              className="auth-back-btn"
              onClick={() => {
                setMethod("choose");
                setError("");
              }}
            >
              <ArrowLeft />
              <span>Back to sign-in options</span>
            </button>
          )}

          {/* Workspace Title & Lead text */}
          <header className="auth-header-block">
            <span className="auth-eyebrow-tag">
              {signup ? "Start Free Account" : "Welcome Back"}
            </span>
            <h2 className="auth-main-title">
              {method === "choose"
                ? signup
                  ? "Create your Li-Khata account"
                  : "Welcome back to Li-Khata"
                : method === "mobile"
                ? "Verify your mobile number"
                : signup
                ? "Create with email & password"
                : "Sign in with your email"}
            </h2>
            <p className="auth-lead-copy">
              {method === "choose"
                ? "Select your preferred sign-in method to access your budget envelopes."
                : method === "mobile"
                ? "We’ll send an instant 6-digit verification code to your phone."
                : "Enter your registered account credentials to continue."}
            </p>
          </header>

          {/* OAuth Error Alert */}
          {oauthMessage && (
            <div className="form-alert alert-error" role="alert">
              <span>{oauthMessage}</span>
            </div>
          )}

          {/* Method Selection Cards */}
          {method === "choose" && (
            <div className="auth-method-list">
              {/* Mobile OTP Card */}
              <button
                type="button"
                className="auth-card-btn btn-mobile"
                onClick={() => setMethod("mobile")}
              >
                <div className="btn-icon-box icon-emerald">
                  <Smartphone />
                </div>
                <div className="btn-text-content">
                  <strong>Continue with Mobile OTP</strong>
                  <small>Fast & secure one-time passcode</small>
                </div>
                <ArrowRight className="btn-arrow" />
              </button>

              {/* Google OAuth Card */}
              <a href="/api/v1/auth/google" className="auth-card-btn btn-google">
                <div className="btn-icon-box icon-google">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div className="btn-text-content">
                  <strong>Continue with Google</strong>
                  <small>One-tap sign in or sign up</small>
                </div>
                <ArrowRight className="btn-arrow" />
              </a>

              {/* Email Credentials Card */}
              <button
                type="button"
                className="auth-card-btn btn-email"
                onClick={() => setMethod("credentials")}
              >
                <div className="btn-icon-box icon-indigo">
                  <Mail />
                </div>
                <div className="btn-text-content">
                  <strong>Continue with Email</strong>
                  <small>Email address & password</small>
                </div>
                <ArrowRight className="btn-arrow" />
              </button>

              <div className="auth-privacy-note">
                <LockKeyhole />
                <span>
                  Your financial data is encrypted. You can link missing mobile or email after signing in.
                </span>
              </div>
            </div>
          )}

          {/* Mobile OTP Auth Component */}
          {method === "mobile" && <MobileOtpAuth signup={signup} />}

          {/* Email Credentials Form */}
          {method === "credentials" && (
            <form className="auth-input-form" onSubmit={submit}>
              {signup && (
                <div className="input-group">
                  <label htmlFor="displayName">Full Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Aisha Sharma"
                      required
                      minLength={2}
                    />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <LockKeyhole className="input-icon" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={signup ? "new-password" : "current-password"}
                    placeholder={signup ? "At least 10 characters" : "Your password"}
                    required
                    minLength={signup ? 10 : 1}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="form-alert alert-error" role="alert">
                  <span>{error}</span>
                </div>
              )}

              <button className="auth-submit-btn" disabled={pending}>
                <span>{pending ? "Processing..." : signup ? "Create Account" : "Sign In"}</span>
                <ArrowRight />
              </button>

              <div className="auth-footer-note">
                <ShieldCheck />
                <span>
                  After signing in, verify your mobile number for enhanced security.
                </span>
              </div>
            </form>
          )}

          {/* Bottom Link Switcher */}
          <footer className="auth-bottom-switch">
            <span>{signup ? "Already have a Li-Khata account?" : "New to Li-Khata?"}</span>{" "}
            <Link href={signup ? "/sign-in" : "/sign-up"} className="switch-link">
              {signup ? "Sign in" : "Create an account"}
            </Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
