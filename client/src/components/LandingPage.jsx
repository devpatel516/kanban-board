// What this file does: presents the public landing page and its product preview.
// When to edit: change the headline, feature descriptions, or landing page sections.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BoltIcon,
  BoardIcon,
  DragIcon,
  MoonIcon,
  RollbackIcon,
  ScreenIcon,
  ShieldCheckIcon,
  SunIcon,
  ThemeIcon,
} from "./Icons.jsx";
import "../styles/Header.css";
import "../styles/LandingPage.css";

const currentYear = new Date().getFullYear();

// Reveals page sections as they enter the viewport without affecting reduced-motion users.
function observeLandingSections() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
  if (!("IntersectionObserver" in window)) return undefined;

  document.documentElement.classList.add("landing-reveal-enabled");

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll("[data-reveal]").forEach((section) => observer.observe(section));
  return () => {
    observer.disconnect();
    document.documentElement.classList.remove("landing-reveal-enabled");
  };
}

// Shows a welcoming overview with links to the account and board screens.
function LandingPage() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || "light");
  const nextThemeLabel = theme === "light" ? "dark" : "light";

  useEffect(() => observeLandingSections(), []);

  // Changes the active palette and saves the choice for the next page load.
  function handleThemeToggle() {
    // Alternate between the two available palettes.
    let nextTheme = "light";
    if (theme === "light") nextTheme = "dark";
    // Update the root attribute so all theme tokens switch together.
    document.documentElement.dataset.theme = nextTheme;
    // Save the choice so the inline startup script can use it before paint.
    localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
  }

  return (
    <div className="landing-page">
      <header className="site-nav landing-nav">
        <Link to="/" className="landing-brand" aria-label="Kanban Board home">
          <BoardIcon />
          <span>Kanban Board</span>
        </Link>
        <nav className="landing-nav-actions" aria-label="Main navigation">
          <button
            type="button"
            className="btn btn-icon"
            onClick={handleThemeToggle}
            aria-pressed={theme === "dark"}
            aria-label={`Switch to ${nextThemeLabel} theme`}
            title={`Switch to ${nextThemeLabel} theme`}
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>
          <Link className="landing-sign-in" to="/board?mode=login">Sign in</Link>
          <Link className="btn btn-primary landing-nav-cta" to="/board">Open Board</Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy" data-reveal>
            <p className="landing-eyebrow">A calmer way to make progress</p>
            <h1>Organize work.<br />Beautifully.</h1>
            <p className="landing-subheadline">
              A fast, resilient Kanban board that keeps your tasks in sync, even when the network is not.
            </p>
            <div className="landing-hero-actions">
              <Link className="btn btn-primary landing-hero-cta" to="/board">Open Board</Link>
              <a className="btn btn-secondary landing-how-link" href="#features">See how it works</a>
            </div>
          </div>

          <div className="preview-frame" aria-label="Preview of a three-column Kanban board" data-reveal>
            <div className="preview-toolbar">
              <span className="preview-window-dot" />
              <span className="preview-window-dot" />
              <span className="preview-window-dot" />
              <span className="preview-toolbar-title">Your work, in focus</span>
            </div>
            <div className="preview-board">
              <div className="preview-column">
                <div className="preview-column-heading"><span /> To Do <small>2</small></div>
                <div className="preview-task">
                  <strong>Plan the next release</strong>
                  <span className="preview-label preview-label-blue">Product</span>
                </div>
                <div className="preview-task">
                  <strong>Gather customer feedback</strong>
                  <span className="preview-task-muted">Review notes and themes</span>
                </div>
              </div>
              <div className="preview-column">
                <div className="preview-column-heading preview-in-progress"><span /> In Progress <small>1</small></div>
                <div className="preview-task">
                  <strong>Refine the dashboard</strong>
                  <span className="preview-label preview-label-orange">Design</span>
                </div>
              </div>
              <div className="preview-column">
                <div className="preview-column-heading preview-done"><span /> Done <small>1</small></div>
                <div className="preview-task">
                  <strong>Set up project space</strong>
                  <span className="preview-label preview-label-green">Complete</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-features" id="features">
          <div className="landing-section-heading" data-reveal>
            <p className="landing-eyebrow">Made for momentum</p>
            <h2>Simple to use.<br />Thoughtful by design.</h2>
          </div>
          <div className="feature-grid">
            <article className="feature-card" data-reveal>
              <DragIcon />
              <h3>Drag and drop</h3>
              <p>Move cards naturally between columns or put them in the right order.</p>
            </article>
            <article className="feature-card" data-reveal>
              <BoltIcon />
              <h3>Instant updates</h3>
              <p>Your board responds as soon as you act, so work keeps flowing.</p>
            </article>
            <article className="feature-card" data-reveal>
              <RollbackIcon />
              <h3>Automatic rollback</h3>
              <p>If a change cannot be saved, your card returns to where it started.</p>
            </article>
            <article className="feature-card" data-reveal>
              <ShieldCheckIcon />
              <h3>Safe with rapid moves</h3>
              <p>Queued updates and version checks help keep changes consistent.</p>
            </article>
            <article className="feature-card" data-reveal>
              <ThemeIcon />
              <h3>Light and dark mode</h3>
              <p>Choose the appearance that feels comfortable, day or night.</p>
            </article>
            <article className="feature-card" data-reveal>
              <ScreenIcon />
              <h3>Works on every screen</h3>
              <p>A considered layout keeps your tasks clear on phones and desktops.</p>
            </article>
          </div>
        </section>

        <section className="landing-closing" data-reveal>
          <p className="landing-eyebrow">A little more clarity, every day</p>
          <h2>Ready to get organized?</h2>
          <Link className="btn btn-primary landing-hero-cta" to="/board">Open Board</Link>
        </section>
      </main>

      <footer className="landing-footer">
        <span>Kanban Board</span>
        <span>{currentYear}</span>
      </footer>
    </div>
  );
}

export default LandingPage;
