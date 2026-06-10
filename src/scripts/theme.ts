import config from "@/config";

const THEME_KEY = "theme";
const LIGHT = "light";
const DARK = "dark";

type RevealDirection = "down" | "up";

function parseTimeToMinutes(value: string): number | undefined {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return undefined;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return undefined;
  return h * 60 + m;
}

function getTimeBasedTheme(): string | undefined {
  const { enabled, lightStart, darkStart } = config.timeBasedTheme;
  if (!enabled) return undefined;
  const light = parseTimeToMinutes(lightStart);
  const dark = parseTimeToMinutes(darkStart);
  if (light === undefined || dark === undefined) return undefined;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const inLight =
    light < dark ? cur >= light && cur < dark : cur >= light || cur < dark;
  return inLight ? LIGHT : DARK;
}

function getPreferredTheme(): string {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored;
  const auto = getTimeBasedTheme();
  if (auto) return auto;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK
    : LIGHT;
}

// Reuse the value already set by the inline FOUC-prevention script if available.
let themeValue: string =
  (window as unknown as { __theme?: { value: string } }).__theme?.value ??
  getPreferredTheme();

let revealDirection: RevealDirection = "down";
let isTransitioning = false;
let themeBtnHandler: (() => void) | null = null;

function reflect(): void {
  const root = document.firstElementChild;
  root?.setAttribute("data-theme", themeValue);
  root?.classList.toggle("dark", themeValue === DARK);
  document.querySelector("#theme-btn")?.setAttribute("aria-label", themeValue);

  // Fill <meta name="theme-color"> with the computed background colour so
  // Android's browser chrome matches the page background.
  const bg = window.getComputedStyle(document.body).backgroundColor;
  document
    .querySelector("meta[name='theme-color']")
    ?.setAttribute("content", bg);
}

function persist(): void {
  localStorage.setItem(THEME_KEY, themeValue);
  reflect();
}

function applyAutoTheme(nextTheme: string): void {
  themeValue = nextTheme;
  reflect();
}

function setThemeBtnDisabled(disabled: boolean): void {
  const btn = document.querySelector<HTMLButtonElement>("#theme-btn");
  if (!btn) return;
  btn.disabled = disabled;
  btn.style.pointerEvents = disabled ? "none" : "";
  btn.style.opacity = disabled ? "0.6" : "";
}

function applyManualTheme(nextTheme: string): void {
  themeValue = nextTheme;
  persist();
}

function toggleTheme(): void {
  if (isTransitioning) return;

  const nextTheme = themeValue === LIGHT ? DARK : LIGHT;
  const direction = revealDirection;
  revealDirection = direction === "down" ? "up" : "down";

  if (!document.startViewTransition) {
    applyManualTheme(nextTheme);
    return;
  }

  isTransitioning = true;
  setThemeBtnDisabled(true);
  document.documentElement.setAttribute("data-theme-transition", direction);

  const transition = document.startViewTransition(() =>
    applyManualTheme(nextTheme)
  );

  transition.finished.finally(() => {
    isTransitioning = false;
    setThemeBtnDisabled(false);
    document.documentElement.removeAttribute("data-theme-transition");
  });
}

function setup(): void {
  reflect();

  const btn = document.querySelector<HTMLButtonElement>("#theme-btn");
  if (!btn) return;

  if (themeBtnHandler) {
    btn.removeEventListener("click", themeBtnHandler);
  }

  themeBtnHandler = toggleTheme;
  btn.addEventListener("click", themeBtnHandler);
}

setup();

// Re-run after View Transitions navigation.
document.addEventListener("astro:after-swap", setup);

// Carry the theme-color value across View Transitions to prevent the
// Android navigation bar from flashing during page transitions.
document.addEventListener("astro:before-swap", event => {
  const color = document
    .querySelector("meta[name='theme-color']")
    ?.getAttribute("content");
  if (color) {
    (event as { newDocument: Document }).newDocument
      .querySelector("meta[name='theme-color']")
      ?.setAttribute("content", color);
  }
});

// Sync with OS-level dark/light preference changes, but only when the user
// hasn't manually chosen a theme and time-based theming isn't in charge.
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches }) => {
    if (isTransitioning) return;
    if (localStorage.getItem(THEME_KEY)) return;
    if (config.timeBasedTheme.enabled) return;
    applyAutoTheme(matches ? DARK : LIGHT);
  });
