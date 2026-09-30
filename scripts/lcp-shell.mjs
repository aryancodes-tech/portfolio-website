/**
 * Critical CSS and static HTML for first paint / LCP before React hydrates.
 * Injected by scripts/sync-seo.mjs between LCP markers in index.html.
 *
 * Mirrors the cover + overlapping portrait in HeroSection.jsx.
 */

/** @type {string} */
export const LCP_CRITICAL_CSS = `    :root {
      --paper: 0 0% 100%;
      --ink: 24 10% 8%;
      --muted-fg: 24 6% 38%;
      --hairline: 24 8% 90%;
      --banner: 24 10% 10%;
    }
    html.dark {
      --paper: 0 0% 4%;
      --ink: 36 20% 96%;
      --muted-fg: 30 8% 64%;
      --hairline: 30 5% 13%;
      --banner: 30 8% 7%;
    }
    body {
      margin: 0;
      background: hsl(var(--paper));
      color: hsl(var(--ink));
      font-family: "Gilroy", system-ui, sans-serif;
    }
    .static-rail {
      box-sizing: border-box;
      max-width: 46rem;
      min-height: 100vh;
      margin: 0 auto;
      border-left: 1px solid hsl(var(--hairline));
      border-right: 1px solid hsl(var(--hairline));
    }
    .static-bar {
      height: 3.5rem;
      border-bottom: 1px solid hsl(var(--hairline));
    }
    .static-banner {
      height: 10rem;
      background:
        radial-gradient(ellipse 70% 90% at 18% 80%, rgba(120, 70, 40, 0.35), transparent 55%),
        radial-gradient(ellipse 50% 70% at 86% 20%, rgba(40, 70, 90, 0.22), transparent 50%),
        hsl(var(--banner));
    }
    .static-id {
      padding: 0 1.25rem;
    }
    .static-photo {
      display: block;
      width: 4.5rem;
      height: 4.5rem;
      margin-top: -2.5rem;
      border-radius: 9999px;
      object-fit: cover;
      box-shadow: 0 0 0 4px hsl(var(--paper));
    }
    .static-name {
      margin: 1.25rem 0 0;
      font-family: "Syne", system-ui, sans-serif;
      font-size: 1.65rem;
      font-weight: 600;
      line-height: 1;
      letter-spacing: -0.02em;
    }
    .static-role {
      margin: 0.5rem 0 0;
      font-size: 13.5px;
      color: hsl(var(--muted-fg));
    }
    body.app-mounted #static-lcp {
      display: none;
    }
    @media (min-width: 640px) {
      .static-banner { height: 12rem; }
      .static-id { padding: 0 2rem; }
      .static-photo { width: 5.5rem; height: 5.5rem; margin-top: -3rem; }
    }`

/**
 * @param {{
 *   kicker: string
 *   name: string
 *   summary: string
 *   imageAlt: string
 *   imageSm: string
 *   imageLg: string
 * }} opts
 * @returns {string}
 */
export function buildLcpShellHtml(opts) {
  const { kicker, name, imageAlt, imageSm, imageLg } = opts
  return `    <div id="static-lcp">
      <div class="static-rail">
        <div class="static-bar"></div>
        <section aria-label="${name}, backend engineer">
          <div class="static-banner"></div>
          <div class="static-id">
            <img
              class="static-photo"
              src="${imageSm}"
              srcset="${imageSm} 320w, ${imageLg} 560w"
              sizes="88px"
              alt="${imageAlt}"
              width="88"
              height="88"
              fetchpriority="high"
              decoding="async"
            />
            <h1 class="static-name">${name}</h1>
            <p class="static-role">${kicker}</p>
          </div>
        </section>
      </div>
    </div>`
}
