export interface UIStrings {
  nav: {
    home: string;
    posts: string;
    tags: string;
    friends: string;
    categories: string;
    about: string;
    archives: string;
    search: string;
    guestbook: string;
  };
  post: {
    publishedAt: string;
    updatedAt: string;
    sharePostIntro: string;
    sharePostOn: string;
    sharePostViaEmail: string;
    tagLabel: string;
    backToTop: string;
    goBack: string;
    editPage: string;
    previousPost: string;
    nextPost: string;
  };
  pagination: {
    prev: string;
    next: string;
    page: string;
  };
  home: {
    socialLinks: string;
    featured: string;
    recentPosts: string;
    allPosts: string;
  };
  footer: {
    copyright: (year: number) => string;
  };
  pages: {
    tagTitle: string;
    tagDesc: string;

    tagsTitle: string;
    tagsDesc: string;

    categoriesTitle: string;
    categoriesDesc: string;
    categoryTitle: string;
    categoryDesc: string;
    categoryPostCount: (count: number) => string;

    postsTitle: string;
    postsDesc: string;

    archivesTitle: string;
    archivesDesc: string;

    searchTitle: string;
    searchDesc: string;
  };
  theme: {
    light: string;
    dark: string;
  };
  a11y: {
    skipToContent: string;
    openMenu: string;
    closeMenu: string;
    toggleTheme: string;
    searchPlaceholder: string;
    noResults: string;
    goToPreviousPage: string;
    goToNextPage: string;
  };
  relativeTime: {
    secondsAgo: string;
    minuteAgo: string;
    minutesAgo: (n: number) => string;
    hourAgo: string;
    hoursAgo: (n: number) => string;
    dayAgo: string;
    daysAgo: (n: number) => string;
    monthAgo: string;
    monthsAgo: (n: number) => string;
    yearAgo: string;
    yearsAgo: (n: number) => string;
  };
  notFound: {
    title: string;
    message: string;
    goHome: string;
  };
  comments: {
    title: string;
    loading: string;
  };
}
