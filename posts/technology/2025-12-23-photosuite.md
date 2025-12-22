---
title: "Photosuite：一个为博客而生的图片处理方案"
subtitle: ""
date: 2025-12-23T06:18:00+08:00
featured: false
draft: false
tags:
  - 开源
  - Photosuite
  - TypeScript
categories: ["技术"]
toc: true
comments: false
image: photosuite.svg
---

每次给博客搞拆迁，最让人割舍不下的，往往不是瓦片和墙皮，而是那些被我用到形成肌肉记忆的家具。由于Jekyll 和 Astro 说着不同方言，导致家具根本拿不到“异地安置指标”，我只能含泪签字

**Photosuite** 正是在这样的背景下诞生的  

它由 Vite + Typescript 开发，拥有我博客图像的核心能力，包括：

- 灯箱

- EXIF 展示

- 图片说明

- 图片路径自动补全

![Example Picture](example-picture.jpg)

上面的图片及其所有样式，仅通过下面这一行最普通的 Markdown 语法生成，而且我只需要输入文件名：

```md
![Example Picture](example-picture.jpg)
```

## 设计思路

Photosuite 利用 Remark 和 Rehype 插件生态，在 Markdown 编译阶段完成图片处理，避免在运行时增加负担：

```md
- 构建期
  ├→ Remark：补全图片 URL
  └→ Rehype：读取图片 EXIF 并写入 HTML
  ↓
- 运行期
  ├→ photosuite(opts) 入口：按需动态 import
  ├→ glightbox 模块：把图变成可点击灯箱
  ├→ imageAlts 模块：用 alt 自动生成 caption
  └→ exif 模块：加载 EXIF 样式，清理空条
```

### 图片路径解析

如前所述，Photosuite 的首要职责是**补全图片 URL**

设计目标很简单：**在 Markdown 中只写文件名，其余交给 Photosuite  处理**：

整体思路如下：

```md
- 使用标准 Markdown 语法插入图片，只填写文件名
  例：![Example Picture](demo.jpg)

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

实现逻辑：

1. 使用 Remark 插件遍历 Markdown AST 中的所有 `image` 节点
2. 判断图片 URL 是否为“短链接”（无协议、非绝对路径、非显式相对路径 `../`）
3. 按配置策略拼接完整 URL（域名 + 目录 + 文件名）
4. 重写 AST 节点的 `url` 属性

### EXIF 展示

EXIF 本身并不是 Photosuite 的核心创新点，毕竟，也不是我实现的  

我只是在 HTML 生成之前，我通过 `exiftool-vendored.js` 提取图片参数，并将其以文本形式注入到 DOM 中，仅此而已，零 JS 成本、零性能开销

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

exiftool-vendored.js 解析的 EXIF 数据非常多。这里 Photosuite 做了封装处理，除默认字段外，还可以任意搭配

默认展示字段：

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

### 按需加载

Photosuite 的所有功能都是**模块化设计**的，样式同样如此

当你关闭某个功能时：

- 对应的 JavaScript **不会加载**

- 相关 CSS **也不会出现在页面中**

实现逻辑：

1. 检查配置中的 `scope`（作用域选择器）是否存在于页面中

   - 若不存在，直接终止执行
2. 根据功能开关配置：

   - `enableLightbox`, `enableAlts`, `enableExif` 并行、动态 `import()` 对应模块

### DOM 标准化

Photosuite 设计了一套统一的 DOM 规范，供所有模块共享

核心思想是：

**先把来源复杂的图片元素统一成稳定结构，再在此基础上扩展功能**

```html
开关 Photosuite 任意功能都会生成不同的结构，以下是所有功能开启时的最终结构：

<div class="photosuite-item">
	<div class="photosuite-exif"></div>
  <a class="glightbox" href="...">
    <img ... />
  </a>
  <div class="photosuite-caption">alt</div>
</div>
```

#### 关键逻辑

````typescript
export function ensurePhotosuiteContainer(el: Element): HTMLElement {
  let target: Element = el;

  // 如果 img 被 a.glightbox 包裹，则提升包裹层级
  if (
    el.tagName.toLowerCase() === "img" &&
    el.parentElement?.tagName.toLowerCase() === "a" &&
    el.parentElement.classList.contains("glightbox")
  ) {
    target = el.parentElement;
  }

  // 如果已经在 photosuite-item 中，直接复用
  const parent = target.parentElement as HTMLElement | null;
  if (parent?.classList.contains("photosuite-item")) {
    return parent;
  }

  // 创建统一容器
  const wrapper = document.createElement("div");
  wrapper.className = "photosuite-item";

  // 用 wrapper 替换 target
  parent?.replaceChild(wrapper, target);
  wrapper.appendChild(target);

  return wrapper;
}
````

有了这个保证之后，后续逻辑可以**完全不关心图片来源**

```typescript
// 查找主体
container.querySelector("img");

// 添加 UI（caption）
container.appendChild(caption);

// 查询数据：有就显示，没有就清理（EXIF）
container.querySelector(".photosuite-exif");
```

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

```yaml title="astro.config.js"
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

```yaml title="PostDetails.astro"
import "photosuite/dist/photosuite.css";
```

Photosuite 基于 **Vite + TypeScript** 开发，理论上适用于多种架构  

如果您在配置中遇到任何问题，欢迎联系我，为爱发电，无偿奉献

## 后续计划

1. 引入 Lozad.js 实现图片懒加载
2. 构建期获取图片尺寸，生成占位符，避免布局抖动
3. 适配更多博客架构
4. 进一步优化 Photosuite 的按需加载机制

## 相关资料

- Photosuite：[https://github.com/achuanya/photosuite](https://github.com/achuanya/photosuite)  
- npmjs：[https://www.npmjs.com/package/photosuite](https://www.npmjs.com/package/photosuite)  
- exiftool-vendored.js：[https://github.com/photostructure/exiftool-vendored.js](https://github.com/photostructure/exiftool-vendored.js)  
- Glightbox：[https://github.com/biati-digital/glightbox](https://github.com/biati-digital/glightbox)



如果 Photosuite 对您有帮助，欢迎在 GitHub 点个 ⭐️  
它不会让代码跑得更快，但会让我写得更勤快

> PS：如果您正在使用 Photosuite  
> 欢迎告诉我您的博客地址，我会把它展示在项目页面中