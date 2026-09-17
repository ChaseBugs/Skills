"use client";
import { useState } from "react";
import { ShieldCheck, ArrowRight, QrCode, Check } from "lucide-react";
export function Login() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="login-page">
      <section className="login-story">
        <div className="brand">
          <span className="brand-icon">
            <ShieldCheck />
          </span>
          <strong>
            skills<span className="brand-dot">.</span>
          </strong>
        </div>
        <div>
          <span className="eyebrow">PEOPLE. CAPABILITIES. CONFIDENCE.</span>
          <h1>
            The right skills.
            <br />
            Ready for the job.
          </h1>
          <p>
            One place for your people’s qualifications.
            <br />
            One scan to see where they stand.
          </p>
          <div className="story-check">
            <Check size={17} /> Employee skills and supporting diplomas
          </div>
          <div className="story-check">
            <Check size={17} /> Live, accessible QR passports
          </div>
          <div className="story-check">
            <Check size={17} /> Your data, connected to Excel
          </div>
        </div>
        <small>Workforce competency management</small>
      </section>
      <section className="login-form-wrap">
        <div className="login-form">
          <span className="login-symbol">
            <QrCode size={28} />
          </span>
          <h2>Welcome back</h2>
          <p className="muted">Sign in to your company workspace.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const data = new FormData(e.currentTarget);
              try {
                const r = await fetch("/api/auth/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(Object.fromEntries(data)),
                });
                const result = await r.json();
                if (!r.ok) throw new Error(result.error);
                window.location.href = "/workspace";
              } catch (err) {
                setError((err as Error).message);
                setBusy(false);
              }
            }}
          >
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@company.com"
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
              />
            </label>
            {error && (
              <div role="alert" className="alert error">
                {error}
              </div>
            )}
            <button className="button primary full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="login-note">
            <ShieldCheck size={18} />
            <span>
              For Human Resources. Employees don’t need an account to use their
              skills passport.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
