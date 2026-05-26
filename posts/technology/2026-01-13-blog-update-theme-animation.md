---
title: 优化了一下博客的交互细节
date: 2026-01-13 00:39:00+08:00
featured: false
draft: false
tags:
- 前端
- 更新
categories:
- 技术
toc: false
comments: true
image: cover.svg
---
晚上刷 1900 的博客，我忽然想起了 **主题配色切换动画**

随手输入关键字 “**主题**” 一搜，果然找到了那篇：[给博客主题切换加个动画](https://1900.live/gei-bo-ke-zhu-ti-qie-huan-jia-ge-dong-hua/)

看到左上角的发布日期时，不禁有些感叹，原来这已经是半年前的事了

![ ](demo.webp)

### 主题切换动画

实现思路与 1900 类似，本质上是利用 View Transitions API 接管视图更新，从而实现遮罩动画

通过 `document.startViewTransition` 捕获 DOM 快照，再配合 CSS 的 `clip-path`（裁剪路径）实现平滑过渡：

```javascript
const transition = document.startViewTransition(() => {
  themeValue = themeValue === "light" ? "dark" : "light";
  setPreference(true);
});

transition.ready.then(() => {
  // 从上至下的裁剪路径
  const clipPath = [
    'inset(0 0 100% 0)', // 开始：底部被完全裁剪
    'inset(0 0 0 0)',    // 结束：完全显示
  ];
  
  document.documentElement.animate(
    { clipPath: clipPath },
    {
      duration: 1000, 	 // 长动画，可能会掉帧
      easing: "ease-out",
      pseudoElement: "::view-transition-new(root)",
    }
  );
});
```

### 返回按钮

此外，我还给博客增加了两个功能按钮，灵感借鉴自 [SeerSu](https://suus.me)，他的博客设计非常线性，我很喜欢

- 返回上一页（如果存在浏览记录），否则返回首页

```css
class="fixed bottom-6 md:bottom-8 z-50 w-10 h-10 rounded-md bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-white/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-200 shadow-sm hover:bg-white/70 dark:hover:bg-gray-800/70 hover:scale-110 hover:shadow-lg transition-all duration-300 ease-out translate-y-8 opacity-0 pointer-events-none flex items-center justify-center gap-1"
```

整体视觉设计上，采用了玻璃风格，悬停时有缩放效果

### 回到顶部

当页面向下滚动到一定范围，该按钮才会浮现，并自动调整“返回按钮”的位置

```javascript
// 监听 BackToTop
window.addEventListener("backToTopVisibilityChange", e => {
  // 如果回到顶部按钮出现，返回按钮自动向上移动让出位置
  updateVerticalPosition(e.detail.visible);
});
```