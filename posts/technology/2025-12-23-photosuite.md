---
title: 为博客而生的图片处理方案
date: 2025-12-23 07:58:00+08:00
featured: true
draft: false
tags:
- Photosuite
- 前端
- 开源
categories:
- 技术
toc: true
comments: false
image: cover.svg
---

每次给博客做拆迁，最让人割舍不下的，无疑是被我用到形成肌肉记忆的工具

由于 Jekyll 和 Astro 处于不同的架构，导致根本无法在两个平台之间迁移

[Photosuite](https://photosuite.lhasa.icu) 正是在这样的背景下诞生的  

该插件由 Vite + Typescript 开发，拥有我博客图像的核心能力，包括：

- Fancybox 灯箱封装

- 静态 EXIF 展示

- 图片路径解析

- 图片标签

- 分组拼图

![Runner-up, 2025 Spain Black & White Photography Contest “Silent Footsteps” © Elias Ejderhamn](Elias_Ejderhamn_Silent_Footsteps_PX3_2025_WPC_2026_RunnerUp.jpg)

上面的图片及其所有样式，仅通过下面这一行最普通的 Markdown 语法生成，而且我只需要输入文件名：

```md
![](demo.jpg)
```

当 Markdown 中有 2-3 张图片紧挨着时，它们会自动组合成拼图，且每张图片都独立可点击

![](left.jpg)
![](middle.jpg)
![](right.jpg)

```md
![](demo1.jpg)
![](demo2.jpg)
![](demo3.jpg)
```

![](James_Busby_Bike_Maintenance_Rwanda_Style_Photojournalism_HM_2025_Professional.jpg)
![](Aymeric_Faure_One_Look_Back_Yemen_Photojournalism_HM_2025_Amateur.jpg.jpg)

```md
![](demo1.jpg)
![](demo2.jpg)
```

## 设计思路

Photosuite 利用 Remark、Rehype 生态，在 Markdown 编译阶段完成图片处理，避免在运行时增加负担，做到首屏无额外请求、无解析开销：

```md
![](demo.jpg)
  ↓
[build]
  ├→ 补全图片路径
  └→ 读图片 → 提取 EXIF
  ↓
转成结构化 DOM
  ↓
[dev]
  ├→ 
  └→ 无图片处理 → 不加载任何资源样式，零开销
       ├→ 灯箱生效
       ├→ 图片标签生成
       ├→ 拼图生成
       └→ 加载 EXIF 样式
```

### DOM 标准化

工欲善其事，必先利其器

因为 Photosuite 所有功能都是模块化，开关任意功能都会生成不同的结构

所以，标准的 DOM 是必要的，以下是所有功能开启时的最终结构（拼图除外）：

```html
<div class="photosuite-item">
  <div class="photosuite-exif">…构建期注入…</div>
  <a data-fancybox="markdown" href="…">
    <img alt="…" src="…" />
  </a>
  <div class="photosuite-caption">alt 文本</div>
</div>
```

Photosuite 用 `ensurePhotosuiteContainer()` 把所有图片统一收拢到 `.photosuite-item` 里

若已被 `a[data-fancybox]` 包裹，则提升包裹层级，保留点击区域

拼图检测、标题插入、EXIF 清理都建立在同一容器契约上

后续代码只需 `querySelector("img")` / `appendChild(caption)`，不必关心图片从哪来的：

```typescript
export function ensurePhotosuiteContainer(el: Element): HTMLElement {
  let target: Element = el;

  // img 已被 Fancybox 链接包裹时，提升包裹层级，避免拆掉可点击区域
  if (
    el.tagName.toLowerCase() === "img" &&
    el.parentElement?.tagName.toLowerCase() === "a" &&
    el.parentElement.hasAttribute("data-fancybox")
  ) {
    target = el.parentElement;
  }

  const parent = target.parentElement as HTMLElement | null;
  if (parent?.classList.contains("photosuite-item")) {
    return parent;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "photosuite-item";
  parent?.replaceChild(wrapper, target);
  wrapper.appendChild(target);
  return wrapper;
}
```

有了这个容器契约，各模块可以统一用 `container.querySelector("img")` 取主体、用 `appendChild` 挂 caption、用 `.photosuite-exif` 读写 EXIF，而不必关心图片来自裸 Markdown 还是 Rehype 改写

### 图片路径解析

如前所述，Photosuite 的首要职责是**补全图片 URL**

我的理念就是：**在 Markdown 中只写文件名，其余交给 Photosuite  处理**：

```md
- 使用标准 Markdown 语法插入图片，只填写文件名
  例：![](demo.jpg)

- 配置一个基础 URL 作为图片域名
  https://cdn.example.com/images

- 子目录来源有两种策略：
  a. 通过 Frontmatter 指定图片目录（默认）
     imageDir: 2025-12-22-photosuite

  b. 以当前 Markdown 文件名作为目录（去除后缀）
     2025-12-22-photosuite.md

- 最终生成的完整路径一致，例如：
  https://cdn.example.com/images/2025-12-22-photosuite/demo.jpg

- 稍作调整即可实现按年 / 月分类等更复杂的目录结构。
```

![Example picture](example-picture.jpg)

### EXIF 展示

解析图片 EXIF 这件事，并不是 Photosuite 的创新点

我只是在 HTML 生成之前，我通过 `exiftool-vendored.js` 提取图片参数，并将其以文本形式注入到 DOM 中，仅此而已，零性能开销

> 遍历 HTML AST → 找到 img → 解析图片 → 提取 EXIF → 重写节点结构

#### HTTP 图片的临时下载策略

```typescript
function isHttpUrl(u: string): boolean {
  const x = new URL(u);
  return x.protocol === "http:" || x.protocol === "https:";
}
```

对于网络图片，Photosuite 不会直接让 exiftool 处理 URL，而是

- 下载到 `os.tmpdir()`
- 生成随机文件名
- 在 `finally` 中清理

```typescript
const dl = await downloadToTemp(src);
filePath = dl.path;
cleanup = dl.cleanup;
```

#### 可配置字段

exiftool-vendored.js 解析的 EXIF 数据非常多。这里 Photosuite 做了封装处理，默认展示字段：

```typescript
['Model', 'LensModel', 'FocalLength', 'FNumber', 'ExposureTime', 'ISO', 'DateTimeOriginal']
```

通过 `formatField` 做语义化输出：

```typescript
case 'FNumber':
  return `ƒ/${Number(value).toFixed(1)}`;
case 'ExposureTime':
  return value >= 1 ? `${value}s` : `1/${Math.round(1 / value)}s`;
case 'ISO':
  return `ISO ${value}`;
```

最终输出示例：

```swift
ILCE-7CM2 · E 28-200mm F2.8-5.6 A071 · 51.0 mm · ƒ/3.5 · 1/1250 · ISO 1000 · 2025/10/4
```

实际上，我最初我选择的是 [MikeKovarik/exifr](https://github.com/MikeKovarik/exifr)  

它号称是**速度最快、功能最全的 JavaScript EXIF 解析库**  
结果，我 Nikon z30 拍摄的照片它居然识别不出来机身？我尼康就低人一等吗！果断 PASS！

### 分组拼图

我的目的很简单：不引入新的语法，而是通过换行来实现拼图

在 Markdown 中连续插入多张图片，只要它们之间没有非空白内容，就应被视为一个整体自动组合

详情见：[实现自动拼图](https://blog.lhasa.icu/posts/technology/2026-01-18-photosuite-0-1-3) 


### 按需加载

正如前文所讲 Photosuite 的所有功能都是**模块化设计**，CSS 也不例外

当你关闭某个功能时：

- 对应的 JavaScript **不会加载**

- 相关 CSS **也不会出现在页面中**

大致思路：

1. 检查配置中的 `scope`（作用域选择器）是否存在于页面中
   
   - 若不存在，直接终止执行

2. 根据功能开关配置：
   
   - `enableLightbox`, `enableAlts`, `enableExif` 并行、动态 `import()` 对应模块

## 安装

Photosuite 已发布至 npm，可直接安装：

```bash
pnpm add photosuite
# or
npm install photosuite
# or
yarn add photosuite
```

## 快速开始

配置 Photosuite 非常简单，以`Astro`为例：

```yaml
import { defineConfig } from 'astro/config';
import photosuite from 'photosuite';
import "photosuite/dist/photosuite.css";

export default defineConfig({
  integrations: [
    photosuite({
      // [必填] 生效范围选择器
      // 建议限定在文章容器内，避免影响站点其他区域。支持多个选择器，用逗号分隔
      scope: '#main',
    })
  ]
});
```

```yaml
import "photosuite/dist/photosuite.css";
```

Photosuite 基于 Vite + TypeScript 开发，理论上适用于多种架构  

如果您在配置中遇到任何问题，欢迎联系我，为爱发电，无偿奉献

## 后续计划

1. 引入 Lozad.js 实现图片懒加载
2. 构建期获取图片尺寸，生成占位符，避免布局抖动
3. 适配更多博客架构

如果 [Photosuite](https://photosuite.lhasa.icu) 对您有帮助，欢迎在 [GitHub ](https://github.com/achuanya/photosuite)点个 ⭐️  
它不会让代码跑得更快，但会让我写得更勤快

> PS：如果您正在使用 Photosuite  
> 欢迎告诉我您的博客地址，我会把它展示在项目页面中