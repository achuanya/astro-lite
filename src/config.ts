/**
 * Internal resolved configuration used throughout the codebase.
 *
 * Prefer editing `astro-paper.config.ts` instead of this file. This module exists to
 * apply defaults and expose a fully-resolved config shape (`ResolvedAstroPaperConfig`).
 */
import userConfig from "@/astro-paper.config";
import type { ResolvedAstroPaperConfig } from "./types/config";
import { PUBLIC_GOOGLE_SITE_VERIFICATION } from "astro:env/client";

const DEFAULT_OG_IMAGE = "default-og.jpg";

const config: ResolvedAstroPaperConfig = {
  site: {
    ...userConfig.site,
    ogImage: userConfig.site.ogImage ?? DEFAULT_OG_IMAGE,
    lang: userConfig.site.lang ?? "en",
    timezone: userConfig.site.timezone ?? "UTC",
    dir: userConfig.site.dir ?? "ltr",
    googleVerification:
      userConfig.site.googleVerification || PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  posts: {
    perPage: userConfig.posts?.perPage ?? 4,
    perIndex: userConfig.posts?.perIndex ?? 4,
    scheduledPostMargin:
      userConfig.posts?.scheduledPostMargin ?? 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: userConfig.features?.lightAndDarkMode ?? true,
    dynamicOgImage: userConfig.features?.dynamicOgImage ?? true,
    showArchives: userConfig.features?.showArchives ?? true,
    showTags: userConfig.features?.showTags ?? true,
    showBackButton: userConfig.features?.showBackButton ?? true,
    editPost: userConfig.features?.editPost ?? { enabled: false },
    search: userConfig.features?.search ?? "pagefind",
    coverUrl: userConfig.features?.coverUrl ?? "",
  },
  friends: {
    dataUrl: userConfig.friends?.dataUrl ?? "",
  },
  timeBasedTheme: {
    enabled: userConfig.timeBasedTheme?.enabled ?? false,
    lightStart: userConfig.timeBasedTheme?.lightStart ?? "08:00",
    darkStart: userConfig.timeBasedTheme?.darkStart ?? "18:00",
  },
  comments: userConfig.comments
    ? {
        server: userConfig.comments.server,
        site: userConfig.comments.site,
        assetsUrl:
          userConfig.comments.assetsUrl ??
          `${userConfig.comments.server.replace(/\/$/, "")}/dist`,
      }
    : undefined,
  socials: userConfig.socials ?? [],
  shareLinks: userConfig.shareLinks ?? [],
};

export default config;
