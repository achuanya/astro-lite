---
author: 游钓四方
pubDatetime: 2026-06-10T18:39:00+08:00
title: Photosuite EXIF 优化
featured: false
draft: false
tags:
  - 技术
  - 前端
  - 开源
  - Photosuite
cover: cover.svg
description: 最近写新主题，迁移旧日志文件跑测试时，发现 Photosuite 有两个严重的问题
---

最近在开发新主题，迁移旧日志进行测试时，发现 Photosuite 有两个比较严重的问题 ：

1. 每次启动都要全量拉取图片解析 EXIF
2. EXIF 信息在非目标页面也会插入 DOM 结构

## 构建期 EXIF 解析的性能问题

Photosuite 走的是构建期解析图片 EXIF 的路子

本地文件还好，如果是远程图片，就要先下载到 `os.tmpdir()`，再交给 exiftool 读取

我博客图片不多，但也够呛

每次 `pnpm dev` 启动，都要等很久，网络差时甚至要等一两分钟才能看到页面...

正常来说，图片拉取过一次后，本地就应该留存一份缓存，这次更新解决了

缓存就落在 `node_modules/.cache/photosuite/`，以图片 URL 作 key

> [!EXAMPLE]- 实际生成出来的缓存大概是这样
>
> ```json
> {
>   "version": 1,
>   "entries": {
>     "https://cos.lhasa.icu/dist/images/2025-06-01-dragon-boat-cycling-beiyuxian/20250531195440.jpg": {
>       "MIMEType": "image/jpeg",
>       "FileType": "JPEG",
>       "DateTimeOriginal": {
>         "_ctor": "ExifDateTime",
>         "year": 2025,
>         "month": 5,
>         "day": 31,
>         "hour": 12,
>         "minute": 31,
>         "second": 53,
>         "rawValue": "2025:05:31 12:31:53.069+08:00",
>         "zoneName": "UTC+8"
>       },
>       "ImageWidth": 4000,
>       "ImageHeight": 2252,
>       "FNumber": 1.7,
>       "ExposureTime": "1/1248",
>       "ISO": 10,
>       "FocalLength": "6.3 mm",
>       "warnings": [],
>       "errors": []
>     }
>   }
> }
> ```

后续 dev 启动直接命中，跳过下载与 exiftool 调用，只解析新增的图就够了

对那种「解析成功但没有有效 EXIF」（比如截图、压缩过头的图）的 URL 也做了负缓存

否则下次还得白下载一遍

```json
{
	"entries": {
		"https://demo.com/1.jpeg": null,
		"https://demo.com/2.jpeg": null
	}
}
```

网络错误和 HTTP 错误不会进入负缓存，下次会自动重试，因为这种情况通常不是图片本身的问题

### HTTP Range 按需下载

实际上，Photosuite  完全没必要把整张图完整下载下来

现在改用 HTTP Range 请求，默认只取图片的头部字节（128 KB）

这就已经足够 exiftool 提取到所有的元数据了，传输量直接砍掉了 **90%** 以上，效果非常明显

如果 CDN 不支持 Range（返回 200 而不是 206），Photosuite  会自动回退到完整下载模式

> 目前主流 CDN 和存储服务（Cloudflare、阿里云 OSS、腾讯云 COS、AWS S3 等）
>
> 和大多数现代静态文件服务器（OpenResty、Nginx、Apache 等）
>
> 都默认支持 Range 请求，回退情况非常少见

```ts
photosuite({
  scope: '#main',
  exif: {
    cache: true,        // 启用磁盘缓存
    concurrency: 6,     // 远程图片下载并发上限
    timeout: 15000,     // 单次下载超时
    headerBytes: 131072 // 只下载头部多少字节，0 = 完整文件
  }
})
```

最多同时下载 6 个，每个请求 15 秒超时，异常会重试，以上均为默认值，无需配置

## EXIF 在非目标页面插入 DOM 的问题

这个 Bug 我之前一直没发现，直到昨天更换「关于」页面的个人照片时才发现...

我的配置是 `scope:"#article"`，理论上只有文章页生效

但在关于页的个人照片下方仍然出现了 EXIF 文本

![](about-bug.png)

根本原因： `exiftoolVendored`在**构建时**就把 EXIF 的 DOM 结构写入了 HTML

而 scope 是一个 CSS 选择器，只有运行时才能判断是否生效

导致即使页面没有`#article`元素，Photosuite 仍会插入以下结构（不会加载样式）

```html
<div class="photosuite-item">
  <img src="...">
  <div class="photosuite-exif"></div>
</div>
```

### DOM 渲染推迟到客户端

解决这个问题很简单，构建阶段不再生成`.photosuite-exif`元素

而是把 EXIF 文本作为`data-photosuite-exif`属性挂在`<img>`上

```html
<img 
  src="..." 
  data-photosuite-exif="NIKON Z 30 · NIKKOR Z DX 50-250mm f/4.5-6.3 VR · 104.0 mm · ƒ/10.0 · 1/100 · ISO 100 · 2026/4/30">
```

客户端在`scope`匹配成功、模块加载后，再读取属性并动态插入 EXIF 条：

```ts
export function ensureExif(container: HTMLElement): void {
  if (container.classList.contains("photosuite-grid-member")) return;
  if (container.querySelector(".photosuite-exif")) return;

  const img = container.querySelector("img");
  if (!img) return;

  const text = (img.getAttribute("data-photosuite-exif") || "").trim();
  if (!text) return;

  const bar = document.createElement("div");
  bar.className = "photosuite-exif";
  bar.textContent = text;
  container.appendChild(bar);
}
```

至此，非目标页面（scope 不匹配）将完全不会加载 Photosuite 相关样式和逻辑

> [!Success]
> Photosuite v0.5.0-beta 已发布，如果您也在用 [Photosuite](https://blog.lhasa.icu/posts/technology/2025-12-23-photosuite)，建议直接更新

```bash
pnpm add photosuite@beta
# or
npm install photosuite@beta
# or
yarn add photosuite@beta
```
