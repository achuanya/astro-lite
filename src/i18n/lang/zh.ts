import type { UIStrings } from "../types";

export default {
  nav: {
    home: "首页",
    posts: "文章",
    tags: "标签",
    friends: "友链",
    categories: "分类",
    about: "关于",
    archives: "归档",
    search: "搜索",
    guestbook: "留言",
  },
  post: {
    publishedAt: "发布于",
    updatedAt: "更新于",
    sharePostIntro: "分享这篇文章：",
    sharePostOn: "分享到 {{platform}}",
    sharePostViaEmail: "通过邮件分享",
    tagLabel: "标签",
    backToTop: "回到顶部",
    goBack: "返回",
    editPage: "编辑此页",
    previousPost: "上一篇",
    nextPost: "下一篇",
  },
  pagination: {
    prev: "上一页",
    next: "下一页",
    page: "第",
  },
  home: {
    socialLinks: "社交链接",
    featured: "精选文章",
    recentPosts: "最近文章",
    allPosts: "全部文章",
  },
  footer: {
    copyright: (year: number) => `© 2018 - ${year} Astro & Artalk`,
  },
  pages: {
    tagTitle: "标签",
    tagDesc: "该标签下的所有文章",

    tagsTitle: "标签",
    tagsDesc: "所有文章中使用的标签。",

    categoriesTitle: "分类",
    categoriesDesc: "按分类浏览文章。",
    categoryTitle: "分类",
    categoryDesc: "该分类下的所有文章。",
    categoryPostCount: (count: number) => ` (${count}篇)`,

    postsTitle: "文章",
    postsDesc: "我发布过的所有文章。",

    archivesTitle: "归档",
    archivesDesc: "我归档的所有文章。",

    searchTitle: "搜索",
    searchDesc: "搜索任意文章 ...",
  },
  theme: {
    light: "浅色",
    dark: "深色",
  },
  a11y: {
    skipToContent: "跳转到正文",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    toggleTheme: "切换主题",
    searchPlaceholder: "搜索文章...",
    noResults: "没有找到结果",
    goToPreviousPage: "前往上一页",
    goToNextPage: "前往下一页",
  },
  relativeTime: {
    secondsAgo: "几秒前",
    minuteAgo: "1 分钟前",
    minutesAgo: (n: number) => `${n} 分钟前`,
    hourAgo: "1 小时前",
    hoursAgo: (n: number) => `${n} 小时前`,
    dayAgo: "1 天前",
    daysAgo: (n: number) => `${n} 天前`,
    monthAgo: "1 个月前",
    monthsAgo: (n: number) => `${n} 个月前`,
    yearAgo: "1 年前",
    yearsAgo: (n: number) => `${n} 年前`,
  },
  notFound: {
    title: "404 页面未找到",
    message: "页面未找到",
    goHome: "返回首页",
  },
  comments: {
    title: "评论",
    loading: "评论加载中…",
  },
} satisfies UIStrings;
