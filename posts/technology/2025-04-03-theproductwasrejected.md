---
title: 产品被拒
date: 2025-04-03 00:05:00+08:00
featured: false
draft: false
tags:
- 开源
- 浏览器扩展
categories:
- 技术
toc: false
comments: false
image: easyfill128.webp_50
---
晚上下了班打开电脑刚坐下就看到了一封 Google 邮件，首先看到了发件人 "Chrome Web Store"，当时就心想提交审核一个多星期了，终于看到一点音信了。点开后，还没等我高兴，便看到了：

![ ](easyfillrejectionnotice.webp)

## 解决BUG

被拒的原因非常低级，声明了但未使用的 `scripting` 权限。

scripting 权限是 Manifest V3 中引入的一个重要权限，主要用于动态脚本执行`chrome.scripting.executeScript()`和动态样式注入`chrome.scripting.insertCSS()`

而在`EasyFill`中，使用的是静态声明：

```js
content_scripts: [
  {
    matches: ["<all_urls>"],
    js: ["content-scripts/content.js"],
  },
];
```

删除`scripting`参数后，重新打包并再次向 Chrome Web Store 提交了扩展。

就这么一个小BUG，浪费了我一个星期的审核时间，太耽误事了，当时为了解决 Shadow DOM 才使用 scripting，直到现在这个问题也没有解决，希望下个版本可以解决问题

产品谍照：

![ ](myinformation.webp)
