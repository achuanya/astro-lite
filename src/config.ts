export const SITE = {
  website: "https://blog.lhasa.icu",
  author: "lhasa",
  profile: "https://github.com/achuanya",
  desc: "骑过湖边的小径，走过文字里的角落，偶尔停下，看见风，也看见自己",
  title: "游钓四方",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,

  // Posts 分页
  postPerIndex: 10,
  postPerPage: 10,

  // 归档分页
  archivesPerIndex: 2,
  archivesPerPage: 3,

  // 收藏分页
  favoritesPerIndex: 10,
  favoritesPerPage: 10,

  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  genDescriptionMaxLines: 30, // Max number of lines to process
  genDescriptionCount: 200, // If 'more' tag is not found, use this count of characters
  showArchives: true,
  showBackButton: false, // show back button in post detail
  showPageDesc: false, // show page description in post detail
  editPost: {
    enabled: false,
    text: "Suggest Changes",
    url: "https://github.com/satnaing/astro-paper/tree/main/",
  },
  dynamicOgImage: false,
  lang: "zh-CN", // html lang code. Set this empty and default will be "en"
  langOg: "zh_CN", // Open Graph locale tag, format 'language_TERRITORY' https://ogp.me/#optional
  timezone: "Asia/Taipei", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  wontonCommentUrl: "", // Wonton comment server URL, set to empty string to disable comment
  icp: "豫ICP备2024046152号-1", // Chinese ICP license number
  
  // 文章卡片显示选项
  displayOptions: {
    showCategories: false, // Show categories in article cards
    showTags: false, // Show tags in article cards
    showCommentCount: true, // Show comment count in article cards
    showHeaderSocialLinks: false, // Show social links in header/main content area
    showFooterSocialLinks: true, // Show social links in footer
    showDate: false, // Show date in article pages
    showCopyright: false, // Show copyright in footer
    showStatement: false, // Show statement in footer
  },

  // 回到顶部按钮
  backToTop: {
    mobileBreakpoint: 1024,
    showAfterRatio: 0.1,
    minOverflowPx: 200,
    minScrollTopPx: 300,
  },

  // 自定义页脚链接
  customFooterLink: {
    enabled: false,
    text: "Stats",
    url: "https://stats.lhasa.icu/blog.lhasa.icu",
  },
  
// 图片组件配置
  imageConfig: {
    // 图片资源配置
    imagesUrl: "https://cos.lhasa.icu/dist/images",
    exifUrl: "https://lhasa-1253887673.cos.ap-shanghai.myqcloud.com/dist/images",
    
    // 标签样式配置
    tags: {
      defaultStyle: "l" as "l" | "s" | false,
    },
    
    // EXIF配置
    exif: {
      enabled: true,           // EXIF信息显示开关
      cache: {
        enabled: true,         // EXIF缓存开关
        expiryDays: 7,        // 缓存过期天数
      },
    },
    
    // 图片加载配置
    loading: {
      lazy: true,             // 懒加载开关
      quality: {
        enabled: true,        // 图片质量优化开关
      },
    },
  },

  // 分类排序配置
  categoryOrder: {
    manual: true, // true: 手动排序, false: 按文章数量自动排序
    order: ["生活", "技术", "骑行", "摄影", "徒步", "阅读", "跑步", "野钓", "年报", "创业"],
  },
} as const;
