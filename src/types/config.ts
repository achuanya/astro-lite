interface SiteConfig {
  /** Deployed URL of the site, e.g. "https://example.com" */
  url: string;
  /** Blog title shown in header and meta tags */
  title: string;
  /** Short description used in SEO meta and RSS feed */
  description: string;
  /** Default post author name */
  author: string;
  /** Author profile URL (used in structured data) */
  profile?: string;
  /** Fallback OG image filename in /public, e.g. "og.jpg" */
  ogImage?: string;
  /** HTML lang attribute, defaults to "en" */
  lang?: string;
  /** IANA timezone for post dates, e.g. "Asia/Bangkok" */
  timezone?: string;
  /** Text direction */
  dir?: "ltr" | "rtl" | "auto";
  /** Google Search Console verification meta tag value */
  googleVerification?: string;
}

interface PostsConfig {
  /** Posts per page on paginated listing pages */
  perPage?: number;
  /** Posts shown on the index/home page */
  perIndex?: number;
  /**
   * Scheduled posts within this window (ms) of their pubDatetime
   * are shown as published. Defaults to 15 minutes.
   */
  scheduledPostMargin?: number;
}

interface FeaturesConfig {
  /** Enable light/dark mode toggle. Defaults to true. */
  lightAndDarkMode?: boolean;
  /**
   * Generate dynamic OG images per post and provide `/og.png` when the static
   * `public/{site.ogImage}` file is absent. When false, that file is required
   * for the default layout OG image (build fails if missing).
   */
  dynamicOgImage?: boolean;
  /** Show the /archives page and link it in nav. Defaults to true. */
  showArchives?: boolean;
  /** Show the /tags page and link it in nav. Defaults to true. */
  showTags?: boolean;
  /** Show back button on post detail pages. Defaults to true. */
  showBackButton?: boolean;
  /** "Edit page" link shown on post detail pages. */
  editPost?:
    | {
        enabled: true;
        /** Base URL for the edit link, e.g. GitHub edit URL */
        url: string;
      }
    | { enabled: false };
  /**
   * Search provider. "pagefind" ships in the base template.
   * Set to false to disable search entirely.
   */
  search?: "pagefind" | false;
  /** Base URL for article cover images, e.g. "https://cos.lhasa.icu/dist/images" */
  coverUrl?: string;
}

interface SocialLink {
  /**
   * Must match an SVG filename in src/assets/icons/socials/.
   * e.g. "github" → src/assets/icons/socials/github.svg
   */
  name: string;
  url: string;
  /**
   * Accessible label for the icon link (aria-label, title attribute).
   * Auto-generated if omitted: "{site.title} on GitHub", "Send an email to {site.title}", etc.
   * Override when the default wording doesn't fit.
   */
  linkTitle?: string;
}

interface ShareLink {
  /**
   * Must match an SVG filename in src/assets/icons/socials/.
   * e.g. "facebook" → src/assets/icons/socials/facebook.svg
   */
  name: string;
  /** Base share URL. The post URL will be appended as a query param. */
  url: string;
  /**
   * Accessible label for the icon link (aria-label, title attribute).
   * Auto-generated if omitted: "Share this post on Facebook", "Share this post via WhatsApp", etc.
   * Override when the default wording doesn't fit.
   */
  linkTitle?: string;
}

interface TimeBasedThemeConfig {
  /** Enable automatic theme switching based on local time. Defaults to false. */
  enabled?: boolean;
  /**
   * Local time (24h "HH:mm") at which the light theme starts.
   * Defaults to "08:00".
   */
  lightStart?: string;
  /**
   * Local time (24h "HH:mm") at which the dark theme starts.
   * Defaults to "18:00".
   */
  darkStart?: string;
}

interface FriendsConfig {
  /** JSON data URL for friends page */
  dataUrl?: string;
  /** Default avatar URL for friends page */
  defaultAvatar?: string;
}

interface CommentsConfig {
  /** Artalk backend server URL, e.g. "https://artalk.example.com" */
  server: string;
  /** Site name registered in the Artalk admin panel */
  site: string;
  /**
   * Directory hosting `Artalk.js` and `Artalk.css`.
   * Defaults to `${server}/dist` — works out of the box for self-hosted
   * Artalk, since the backend already serves its own bundle. Override with a
   * CDN base (e.g. "https://cdn.jsdelivr.net/npm/artalk@2.9/dist") if you'd
   * rather pull from a CDN.
   */
  assetsUrl?: string;
}

interface AstroPaperConfig {
  site: SiteConfig;
  posts?: PostsConfig;
  features?: FeaturesConfig;
  /**
   * Pick the default theme by local time when the user hasn't manually
   * chosen one. Has no effect after a manual selection is stored.
   */
  timeBasedTheme?: TimeBasedThemeConfig;
  /** Friends page config */
  friends?: FriendsConfig;
  /** Artalk comment system config */
  comments?: CommentsConfig;
  /** Social profile links shown in header/footer */
  socials?: SocialLink[];
  /** Share links shown on post detail pages */
  shareLinks?: ShareLink[];
}

type ResolvedSiteConfig = Required<
  Pick<
    SiteConfig,
    | "url"
    | "title"
    | "description"
    | "author"
    | "lang"
    | "timezone"
    | "dir"
    | "ogImage"
  >
> &
  Pick<SiteConfig, "profile" | "googleVerification">;

export interface ResolvedAstroPaperConfig {
  site: ResolvedSiteConfig;
  posts: Required<PostsConfig>;
  features: Required<FeaturesConfig>;
  timeBasedTheme: Required<TimeBasedThemeConfig>;
  friends: Required<FriendsConfig>;
  comments?: Required<CommentsConfig>;
  socials: SocialLink[];
  shareLinks: ShareLink[];
}

/**
 * Type helper for astro-paper.config.ts.
 * Provides full IntelliSense without any runtime overhead.
 */
export function defineAstroPaperConfig(
  config: AstroPaperConfig
): AstroPaperConfig {
  return config;
}
