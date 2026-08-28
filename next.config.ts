import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        // MSG91's OTP widget uses Hostnsoft verification and hCaptcha for bot protection.
        { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://verify.msg91.com https://verify.phone91.com https://pass.hostnsoft.com https://hcaptcha.com https://*.hcaptcha.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.neon.tech https://*.msg91.com https://*.phone91.com https://*.hostnsoft.com https://*.hcaptcha.com; font-src 'self' data:; frame-src https://hcaptcha.com https://*.hcaptcha.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
      ],
    }];
  },
};

export default nextConfig;
