import Link from "next/link";
import { ArrowRight, BarChart3, Layers3, Palette } from "lucide-react";

import { MOCKUP_THEMES } from "@/lib/mockup-themes";

import styles from "./theme-lab.module.css";

export function ThemeGallery() {
  return (
    <main className={styles.galleryPage}>
      <div className={styles.galleryAuraOne} />
      <div className={styles.galleryAuraTwo} />

      <header className={styles.galleryHeader}>
        <Link href="/" className={styles.galleryBrand}>
          <BarChart3 aria-hidden="true" />
          <span>jAnalytics</span>
        </Link>
        <span className={styles.galleryBadge}>Two-site realtime · 01–02</span>
      </header>

      <section className={styles.galleryHero}>
        <div className={styles.galleryEyebrow}>
          <Palette aria-hidden="true" />
          Interactive design study
        </div>
        <h1>Two precise ways to watch two websites breathe.</h1>
        <p>
          The same multi-property realtime story, rebuilt as a focused Google
          reporting workspace and a spatial Apple-inspired command center.
          Compare both sites, change the range, and inspect every live layer.
        </p>
      </section>

      <section className={styles.galleryGrid} aria-label="Theme mockups">
        {MOCKUP_THEMES.map((theme) => (
          <Link
            key={theme.slug}
            href={`/mockups/${theme.slug}`}
            className={`${styles.galleryCard} ${styles[`galleryCard_${theme.slug}`]}`}
          >
            <div className={styles.galleryCardTopline}>
              <span>{theme.number}</span>
              <ArrowRight aria-hidden="true" />
            </div>

            <div className={styles.galleryPreview}>
              <span className={styles.galleryPreviewNav} />
              <div className={styles.galleryPreviewCanvas}>
                <span className={styles.galleryPreviewHeadline} />
                <div className={styles.galleryPreviewStats}>
                  <span />
                  <span />
                  <span />
                </div>
                <span className={styles.galleryPreviewChart} />
              </div>
            </div>

            <div className={styles.galleryCardCopy}>
              <span>{theme.eyebrow}</span>
              <h2>{theme.name}</h2>
              <p>{theme.description}</p>
            </div>

            <div className={styles.galleryPalette} aria-label="Color palette">
              {theme.colors.map((color) => (
                <span key={color} style={{ backgroundColor: color }} />
              ))}
            </div>
          </Link>
        ))}
      </section>

      <footer className={styles.galleryFooter}>
        <Layers3 aria-hidden="true" />
        <span>
          Shared two-site fixtures · responsive desktop and mobile layouts ·
          production dashboard remains untouched
        </span>
      </footer>
    </main>
  );
}
