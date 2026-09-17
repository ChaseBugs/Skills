"use client";
import { useState } from "react";
import { ShieldCheck, ArrowRight, QrCode, Check } from "lucide-react";
import { useLocale } from "./locale-provider";
import { LangSwitch } from "./lang-switch";
export function Login() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { t } = useLocale();
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
          <span className="eyebrow">{t.login.eyebrow}</span>
          <h1>
            {t.login.headline1}
            <br />
            {t.login.headline2}
          </h1>
          <p>
            {t.login.subline1}
            <br />
            {t.login.subline2}
          </p>
          <div className="story-check">
            <Check size={17} /> {t.login.check1}
          </div>
          <div className="story-check">
            <Check size={17} /> {t.login.check2}
          </div>
          <div className="story-check">
            <Check size={17} /> {t.login.check3}
          </div>
        </div>
        <small>{t.login.footerNote}</small>
      </section>
      <section className="login-form-wrap">
        <div className="login-lang">
          <LangSwitch compact />
        </div>
        <div className="login-form">
          <span className="login-symbol">
            <QrCode size={28} />
          </span>
          <h2>{t.login.welcomeBack}</h2>
          <p className="muted">{t.login.signInPrompt}</p>
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
                  body: JSON.stringify({
                    email: data.get("email"),
                    password: data.get("password"),
                    remember: data.get("remember") === "on",
                  }),
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
              {t.login.emailAddress}
              <input
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@company.com"
                required
              />
            </label>
            <label>
              {t.login.password}
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder={t.login.passwordPlaceholder}
                required
              />
            </label>
            <label className="checkbox-label">
              <input name="remember" type="checkbox" />
              {t.login.rememberMe}
            </label>
            {error && (
              <div role="alert" className="alert error">
                {error}
              </div>
            )}
            <button className="button primary full" disabled={busy}>
              {busy ? t.login.signingIn : t.login.signIn}
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="login-note">
            <ShieldCheck size={18} />
            <span>{t.login.hrNote}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
