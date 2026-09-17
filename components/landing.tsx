"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  ArrowRight,
  LayoutDashboard,
  QrCode,
  Cable,
  Maximize2,
  X,
} from "lucide-react";
import { useLocale } from "./locale-provider";
import { LangSwitch } from "./lang-switch";

function Lightbox({
  src,
  alt,
  caption,
  onClose,
}: {
  src: string;
  alt: string;
  caption: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="image-lightbox"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button className="icon-button lightbox-close" onClick={onClose}>
        <X size={20} />
      </button>
      <img src={src} alt={alt} />
      <p>{caption}</p>
    </dialog>
  );
}

export function Landing() {
  const { t } = useLocale();
  const [zoomed, setZoomed] = useState<number | null>(null);
  const shots = [
    {
      src: "/marketing/overview.png",
      alt: t.landing.shotOverviewAlt,
      caption: t.landing.shotOverviewCaption,
      mobile: false,
    },
    {
      src: "/marketing/matrix.png",
      alt: t.landing.shotMatrixAlt,
      caption: t.landing.shotMatrixCaption,
      mobile: false,
    },
    {
      src: "/marketing/passport.png",
      alt: t.landing.shotPassportAlt,
      caption: t.landing.shotPassportCaption,
      mobile: true,
    },
  ];
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
        {shots.map((shot, i) => (
          <figure
            className={
              "landing-shot " + (shot.mobile ? "landing-shot-mobile" : "")
            }
            key={shot.src}
          >
            <button
              type="button"
              className="landing-shot-trigger"
              onClick={() => setZoomed(i)}
              aria-label={shot.caption}
            >
              <img src={shot.src} alt={shot.alt} loading="lazy" />
              <span className="landing-shot-zoom">
                <Maximize2 size={14} />
              </span>
            </button>
            <figcaption>{shot.caption}</figcaption>
          </figure>
        ))}
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
      {zoomed !== null && (
        <Lightbox
          src={shots[zoomed].src}
          alt={shots[zoomed].alt}
          caption={shots[zoomed].caption}
          onClose={() => setZoomed(null)}
        />
      )}
    </main>
  );
}
