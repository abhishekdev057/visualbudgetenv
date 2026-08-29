"use client";

import { CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Wallet, Zap } from "lucide-react";
import { BrandLogo } from "./brand-logo";

export function AuthHeroVisual() {
  return (
    <section className="auth-hero-section" aria-label="Li-Khata Visual Budgeting">
      {/* Dynamic Background Mesh & Glowing Orbs */}
      <div className="auth-mesh-bg" />
      <div className="auth-glow-orb orb-primary" />
      <div className="auth-glow-orb orb-emerald" />
      <div className="auth-glow-orb orb-saffron" />
      <div className="auth-grid-pattern" />

      <div className="auth-hero-content">
        {/* Brand Header */}
        <header className="auth-hero-brand">
          <BrandLogo className="auth-brand-v2" />
          <span className="auth-badge-pill">
            <Sparkles className="icon-sparkle" />
            <span>Smart Visual Budgeting</span>
          </span>
        </header>

        {/* Main Hero Headline & Copy */}
        <div className="auth-hero-story">
          <div className="auth-kicker-v2">
            <span className="kicker-dot" />
            <span>A calmer way to plan your money</span>
          </div>

          <h1 className="auth-hero-title">
            Give every <br />
            <span className="gradient-rupee">rupee</span> a purpose.
          </h1>

          <p className="auth-hero-subtitle">
            Li-Khata turns chaotic monthly expenses into clear visual envelopes.
            Track income, allocate budgets effortlessly, and reach your savings goals.
          </p>

          {/* Interactive Visual Card Stack */}
          <div className="auth-visual-stack" aria-hidden="true">
            {/* Card 1: Rent & Housing */}
            <div className="stack-card card-top">
              <div className="stack-card-header">
                <div className="stack-card-icon icon-emerald">
                  <Wallet />
                </div>
                <div className="stack-card-info">
                  <strong>Rent & Home Essentials</strong>
                  <span>Monthly Envelope</span>
                </div>
                <span className="stack-badge badge-emerald">On Track</span>
              </div>
              <div className="stack-card-amount">
                <strong>₹24,500</strong>
                <small>of ₹28,000 allocated</small>
              </div>
              <div className="stack-progress-bar">
                <div className="stack-progress-fill fill-emerald" style={{ width: "87.5%" }} />
              </div>
            </div>

            {/* Card 2: Savings Vault (Offset Behind) */}
            <div className="stack-card card-middle">
              <div className="stack-card-header">
                <div className="stack-card-icon icon-violet">
                  <TrendingUp />
                </div>
                <div className="stack-card-info">
                  <strong>Emergency Vault</strong>
                  <span>Auto-saved target</span>
                </div>
                <span className="stack-badge badge-violet">+14% goal</span>
              </div>
              <div className="stack-card-amount">
                <strong>₹65,000</strong>
                <small>100% funded</small>
              </div>
            </div>

            {/* Card 3: Floating Micro Pill */}
            <div className="stack-floating-pill pill-saffron">
              <Zap />
              <span>Instant auto-allocation for May 2026</span>
            </div>
          </div>

          {/* Trust Highlights & Feature Badges */}
          <div className="auth-trust-highlights">
            <div className="trust-item">
              <CheckCircle2 />
              <span>Private by Design</span>
            </div>
            <span className="trust-divider" />
            <div className="trust-item">
              <ShieldCheck />
              <span>Bank-Grade Encryption</span>
            </div>
            <span className="trust-divider" />
            <div className="trust-item">
              <Sparkles />
              <span>Zero Spreadsheets</span>
            </div>
          </div>
        </div>

        {/* Footer Rating & Social Proof */}
        <footer className="auth-hero-footer">
          <div className="avatar-group">
            <span className="avatar-pill av-1">AS</span>
            <span className="avatar-pill av-2">RK</span>
            <span className="avatar-pill av-3">VP</span>
          </div>
          <div className="rating-copy">
            <div className="stars">★★★★★</div>
            <span>Loved by smart planners across India</span>
          </div>
        </footer>
      </div>
    </section>
  );
}
