---
alwaysApply: true
---

# Tailwind CSS 使用规范

## 版本与配置

- 项目使用 **Tailwind CSS v4**（`@tailwindcss/vite` 插件 + `@import "tailwindcss"`）。
- 不使用 `tailwind.config.js`，所有定制通过 CSS 完成：
  - 主题 token 在 `src/styles/theme-inline.css` 的 `@theme inline` 块中定义。
  - 颜色值在 `src/styles/theme-light.css` 和 `theme-dark.css` 中以 CSS 自定义属性定义。
  - 自定义 utility 在 `src/styles/global.css` 中用 `@utility` 定义。
  - 自定义排版容器 `.app-prose` 在 `src/styles/typography.css` 中定义。
- 排版插件通过 `@plugin "@tailwindcss/typography";` 引入，仅作用于 `.app-prose` 容器内。

## 主题变量体系

### 三层分离架构

```
theme-inline.css    →  @theme inline { --color-xxx: var(--xxx); }
theme-light.css     →  :root, [data-theme="light"] { --xxx: #value; }
theme-dark.css      →  [data-theme="dark"] { --xxx: #value; }
```

组件中使用 Tailwind token（如 `text-foreground`、`bg-background`），而非原始 CSS 变量（如 `var(--foreground)`）。

### 分区顺序（必须按此顺序添加/查找）

1. 字体（仅 inline 独有）
2. 基础（background / foreground / accent / muted / border）
3. 年度进度条
4. 导航栏（nav-link / nav-link-active / nav-title）
5. 文章标题（post-title）
6. 正文标题（prose-heading-border）
7. 标签（tag-bg / tag-bg-hover）
8. 分类封面（category-cover-text）
9. 引用块（blockquote-border / blockquote-text）
10. 列表（list-marker）
11. 复选框（checkbox-border / checkbox-bg / checkbox-checked-bg / checkbox-check）
12. 代码（code-block-bg / code-inline-bg / code-copy-bg 等）
13. 表格（table-header-border / table-row-border）
14. 骨架屏（skeleton-base / skeleton-highlight）

### 新增颜色变量步骤

1. 在 `theme-light.css` 和 `theme-dark.css` 的对应分区中添加 `--new-color: #value;`。
2. 在 `theme-inline.css` 的 `@theme inline` 块中添加 `--color-new-color: var(--new-color);`。
3. 更新三文件注释中的分区列表序号（如有新分区）。

## Utility 类使用规则

### 优先使用标准 utility

```html
<!-- 正确 -->
<div class="flex items-center gap-2 text-foreground">

<!-- 错误：直接使用 CSS 变量 -->
<div style="color: var(--foreground);">
```

### 自定义 utility

项目定义了以下自定义 utility：

| Utility | 等价于 | 用途 |
|---|---|---|
| `app-layout` | `max-w-app mx-auto w-full px-4 sm:px-0` | 内容区居中限宽布局 |
| `max-w-app` | `max-w-3xl` | 正文最大宽度 |
| `active-nav` | `font-medium` | 导航激活状态 |

使用自定义 utility 代替重复组合：

```html
<!-- 正确 -->
<main class="app-layout pb-4">

<!-- 错误：重复标准组合 -->
<main class="max-w-3xl mx-auto w-full px-4 sm:px-0 pb-4">
```

### 深色模式

使用 `dark:` 变体前缀：

```html
<!-- 正确 -->
<span class="inline dark:hidden">Dark</span>
<span class="hidden dark:inline">Light</span>

<!-- 错误：手动切换 data-theme class -->
<span class="hidden" data-theme="dark">Light</span>
```

自定义 `dark` 变体在 `global.css` 中定义为：
```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

### class:list 与条件类名

始终使用 `class:list` 处理动态类名：

```astro
<div class:list={[
  "flex items-center gap-2",
  { "opacity-50": isDisabled },
  className,
]}>
```

不要在 `class:list` 中混用内联 `style`，两者分离：

```astro
<!-- 正确 -->
<div class:list={["skeleton", { "skeleton-shimmer": animate }]} style={`width:${w}`}>

<!-- 错误：把尺寸逻辑塞进 class -->
<div class:list={[`w-[${w}]`, "skeleton"]}>
```

### 组件内避免硬编码颜色

所有配色必须通过主题 token 引用，禁止在组件模板中硬编码十六进制/RGB 值：

```html
<!-- 正确 -->
<span class="text-muted-foreground">

<!-- 错误 -->
<span class="text-gray-500">
```

唯一例外是 `theme-light.css` / `theme-dark.css` 中定义变量值本身。

## 骨架屏样式规范

- 底色占位使用 `.skeleton` 类（自动应用 `bg-skeleton-base`）。
- shimmer 动画叠加 `.skeleton-shimmer`，不支持 shimmer 时回退到 `.animate-pulse`。
- 远程图片加载使用 `<div data-skeleton-ph class="skeleton skeleton-shimmer">` 作占位，图片带 `data-skeleton` 属性，JS 负责在 `onload` 后淡入并隐藏占位。
- 骨架屏颜色在 `theme-light.css` / `theme-dark.css` 的「14. 骨架屏」分区中配置，禁止在组件中硬编码。

```astro
<!-- 图片骨架屏标准模式 -->
<div class="relative h-[50px] w-[50px] shrink-0 overflow-hidden rounded-md">
  <div data-skeleton-ph class="skeleton skeleton-shimmer absolute inset-0" />
  <img
    src={imgSrc}
    alt={alt}
    loading="lazy"
    data-skeleton
    class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500"
  />
</div>
```

## 排版容器

- 正文区域必须使用 `class="app-prose"` 启用排版样式。
- `.app-prose` 包含 Tailwind Typography 插件（`prose`）+ 自定义排版变量（字号、行高、间距等）。
- 排版变量在 `typography.css` 的 `:root` 中定义（如 `--text-h1`、`--leading-body`）。
- 修改排版节奏时调整这些变量，不要在组件中覆盖 `.app-prose` 内部的排版样式。
- 文章页面结构：`<article class="app-prose max-w-app">`。

## 断点与响应式

- 项目自定义了断点：`--breakpoint-sm: 820px`（在 `global.css` 的 `@theme` 中）。
- 使用 `sm:` 前缀匹配 ≥820px（桌面端框架容器）。
- 移动端优先编写样式，`sm:` 叠加桌面端差异。
- 注意 `@media (max-width: 819px)` 仅用于少数无法用 `sm:` 表达的反向查询（如 `site-outer-bg` 移动端回退）。

## 字体

- 字体在 `theme-inline.css` 的 `@theme inline` 块中定义为 `--font-*` token：
  - `--font-app`：全局正文字体
  - `--font-heading`：H1 字体
  - `--font-heading-sub`：H2-H6 字体
  - `--font-ui`：导航/UI 字体
  - `--font-code`：代码字体
  - `--font-bold`：粗体字体
- 使用 `font-app`、`font-heading`、`font-ui`、`font-code`、`font-bold` 等 Tailwind utility class 引用。
- 不在组件中直接写 `font-family: ...`，除非是 `global.css` / `typography.css` 中的排版基础规则。

## Prettier 插件

- `prettier-plugin-tailwindcss` 已配置，会自动排序 Tailwind class。
- 开发者无需手动排序 class，提交前运行 `pnpm format` 即可。
- 插件兼容 `class:list` 数组语法中的 Tailwind class。