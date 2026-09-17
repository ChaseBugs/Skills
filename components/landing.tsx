"use client";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  LayoutDashboard,
  QrCode,
  Cable,
} from "lucide-react";
import { useLocale } from "./locale-provider";
import { LangSwitch } from "./lang-switch";
export function Landing() {
  const { t } = useLocale();
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link href="/" className="brand">
          <span className="brand-icon">
            <ShieldCheck size={22} />
          </span>
          <strong>
            skills<span className="brand-dot">.</span>
          </strong>
        </Link>
        <div className="landing-nav-actions">
          <LangSwitch compact />
          <Link href="/login" className="button primary">
            {t.landing.navLogin}
          </Link>
        </div>
      </header>
      <section className="landing-hero">
        <span className="eyebrow">{t.landing.eyebrow}</span>
        <h1>
          {t.landing.title1}
          <br />
          {t.landing.title2}
        </h1>
        <p>{t.landing.subtitle}</p>
        <Link href="/login" className="button primary large">
          {t.landing.cta} <ArrowRight size={17} />
        </Link>
      </section>
      <section className="landing-shots">
        <figure className="landing-shot">
          <img
            src="/marketing/overview.png"
            alt={t.landing.shotOverviewAlt}
            loading="lazy"
          />
          <figcaption>{t.landing.shotOverviewCaption}</figcaption>
        </figure>
        <figure className="landing-shot">
          <img
            src="/marketing/matrix.png"
            alt={t.landing.shotMatrixAlt}
            loading="lazy"
          />
          <figcaption>{t.landing.shotMatrixCaption}</figcaption>
        </figure>
        <figure className="landing-shot landing-shot-mobile">
          <img
            src="/marketing/passport.png"
            alt={t.landing.shotPassportAlt}
            loading="lazy"
          />
          <figcaption>{t.landing.shotPassportCaption}</figcaption>
        </figure>
      </section>
      <section className="landing-features">
        <h2>{t.landing.featuresTitle}</h2>
        <div className="landing-feature-grid">
          <div className="landing-feature">
            <span className="feature-icon">
              <LayoutDashboard size={22} />
            </span>
            <h3>{t.landing.feature1Title}</h3>
            <p>{t.landing.feature1Desc}</p>
          </div>
          <div className="landing-feature">
            <span className="feature-icon">
              <QrCode size={22} />
            </span>
            <h3>{t.landing.feature2Title}</h3>
            <p>{t.landing.feature2Desc}</p>
          </div>
          <div className="landing-feature">
            <span className="feature-icon">
              <Cable size={22} />
            </span>
            <h3>{t.landing.feature3Title}</h3>
            <p>{t.landing.feature3Desc}</p>
          </div>
        </div>
      </section>
      <footer className="landing-footer">
        <span>
          skills. <span className="muted">{t.landing.footerNote}</span>
        </span>
        <Link href="/login" className="text-link">
          {t.landing.navLogin} <ArrowRight size={14} />
        </Link>
      </footer>
    </main>
  );
}
