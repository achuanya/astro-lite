import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  // SEO 声明信息
  site: {
    url: "https://blog.lhasa.icu/",
    title: "游钓四方",
    description: "独立之精神，自由之思想",
    author: "游钓四方",
    profile: "https://lhasa.icu/",
    ogImage: "default-og.jpg",
    lang: "zh",
    timezone: "Asia/Shanghai",
    dir: "ltr",
    googleVerification: "8Sdxh73EjjXanBcmOpNtsiALfpB7PUEE9JFoHkA3Xmc",
  },
  posts: {
    perPage: 15,
    perIndex: 10,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: false,
    showArchives: false,
    showTags: true,
    showBackButton: false,
    editPost: {
      enabled: false,
    },
    search: false,
    coverUrl: "https://cos.lhasa.icu/dist/images",
  },
  friends: {
    dataUrl: "https://cos.lhasa.icu/lhasaRSS/data.json",
    defaultAvatar: "https://cos.lhasa.icu/dist/avatar/default.png",
  },
  comments: {
    server: "https://artalk.lhasa.icu",
    site: "游钓四方的博客",
  },
  timeBasedTheme: {
    enabled: true,
    lightStart: "08:00",
    darkStart: "18:00",
  },
  socials: [
    { name: "github",   url: "https://github.com/achuanya/astro-lhasa" },
    { name: "x",        url: "https://x.com/haibao1027" },
    { name: "mail",     url: "mailto:haibao1027@gmail.com" },
  ],
  shareLinks: [],
});