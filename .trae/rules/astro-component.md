---
alwaysApply: true
---

# Astro 组件开发规范

## 组件结构

每个 `.astro` 文件按以下顺序组织：

1. **frontmatter**（`---` 之间的代码块）
   - `import` 语句（按照编码风格规范的导入顺序）
   - `type Props = { ... }` 类型定义
   - Props 解构与默认值（`const { variant = "h2", ...rest } = Astro.props;`）
   - 组件逻辑（计算、条件分支等）
2. **HTML 模板**：JSX-like 标记，混合使用 `{}` 表达式和组件
3. **`<script>` 标签**（如有）：客户端交互逻辑，放在模板末尾

## Props 规范

- 始终定义 `type Props`，即使只有一个属性。
- 使用 TypeScript 联合类型标记可选变体：`variant?: "h2" | "h3"` 而非 `string`。
- 从 `Astro.types` 导入 HTML 属性类型以支持透传：`type Props = { ... } & HTMLAttributes<"a">`。
- 解构 Props 时分离语义属性和透传属性：`const { disabled, class: className, ...attrs } = Astro.props;`。
- 使用 `class` 属性透传时重命名为 `className` 避免冲突。
- 条件类名使用 `class:list` 数组语法，不用三元表达式拼接字符串。

## 模板规范

### class:list 用法

```astro
<!-- 正确：使用 class:list 数组 + 条件对象 -->
<div
  class:list={[
    "flex items-center gap-2",
    { "opacity-50": isDisabled },
    className,
  ]}
>

<!-- 错误：字符串拼接 -->
<div class={`flex items-center gap-2 ${isDisabled ? "opacity-50" : ""}`}>
```

### 透传属性

- 使用 `{...attrs}` 将额外 HTML 属性透传给根元素。
- 组件同时接受 `class` 和其他原生属性时，将 `class` 并入 `class:list`，其余用 `{...attrs}` 展开。

```astro
---
type Props = { noMarginTop?: boolean } & HTMLAttributes<"footer">;
const { noMarginTop = false, class: className, ...attrs } = Astro.props;
---
<footer class:list={["app-layout", { "mt-auto": !noMarginTop }, className]} {...attrs}>
```

### 动态标签名

- 需要动态 HTML 标签时使用变量赋值 + JSX 语法：

```astro
---
const { variant: Heading = "h2" } = Astro.props;
---
<Heading transition:name={...}>{title}</Heading>
```

### 条件渲染

- 简单条件使用三元表达式：`{condition ? <A /> : <B />}`。
- 多行条件块使用 `{condition && (<A />)}`，注意加 `()`。
- 短列表可内联：`{items.map(item => <Tag {...item} />)}`。

## 布局与页面模式

### 标准页面结构

```astro
<Layout title={...} description={...} ogImage={...}>
  <Header pageTitle={pageTitle} />
  <Main class="app-prose">{content}</Main>
  <Footer />
</Layout>
```

- 始终使用 `Layout.astro` 作为页面外壳（提供 `<head>`、FOUC 防止脚本、`<ClientRouter />`）。
- 文章详情页使用 `PostLayout.astro`（继承 `Layout.astro`，添加 JSON-LD 和 article 元数据）。
- `<main>` 元素必须带 `id="main-content"` 以支持跳转链接（`#skip-to-content`）。
- `<main>` 使用 `class="app-layout"` 或 `class="app-layout app-prose"` 控制最大宽度和居中。

### 布局类说明

| 类名 | 作用 |
|---|---|
| `app-layout` | `max-w-app mx-auto w-full px-4 sm:px-0` — 内容区居中限宽 |
| `max-w-app` | `max-w-3xl` — 正文最大宽度 |
| `app-prose` | 排版容器，启用 `@tailwindcss/typography` + 自定义排版变量 |
| `site-outer-bg` | 页面外围背景色（桌面端可见，移动端回退为 `bg-background`） |

## 组件复用

- 页面级私有组件放在对应页面的 `_components/` 目录（如 `src/pages/posts/[...slug]/_components/`）。
- 全局共享组件放在 `src/components/`。
- 骨架屏组件放在 `src/components/skeleton/`。
- 新建骨架屏组件时，基础组件使用 `Skeleton.astro`，复合组件从 `skeleton/` 目录导入并在页面中组合。

## 客户端脚本

- 组件级别的客户端脚本使用 `<script>` 标签（Astro 会自动模块化和去重）。
- 需要每次导航都执行的逻辑监听 `astro:page-load`。
- 需要在 View Transition swap 后重新绑定的逻辑监听 `astro:after-swap`。
- 内联脚本（必须同步执行、不可去重）使用 `<script is:inline>`，如主题 FOUC 防止脚本。
- 页面级内联脚本使用 `<script is:inline data-astro-rerun>` 确保每次导航重新执行。
- 脚本中引用 `@/` 别名路径时用标准 import 语法，Astro 会处理打包。

## 站点框架与主题

### 站点框架（Site Frame）

- 桌面端（≥820px）：居中卡片容器 `sm:w-[820px] sm:max-w-[72rem]`，白色/深色背景 + 阴影。
- 移动端（<820px）：全宽无边框，`bg-background` 直接铺满。
- 修改框架尺寸/阴影在 `Layout.astro` 的 `#site-frame` 元素上调整。

### 主题系统

- 主题通过 `data-theme="light" | "dark"` 属性切换，CSS 自定义属性响应式变化。
- **三层分离**：
  1. `theme-inline.css` — `@theme inline` 映射 CSS 变量到 Tailwind token（`--color-foreground` → `text-foreground`）。
  2. `theme-light.css` — `:root, [data-theme="light"]` 定义浅色变量值。
  3. `theme-dark.css` — `[data-theme="dark"]` 定义深色变量值。
- **新增颜色变量时**：三文件必须同步修改（inline 映射 + light 色值 + dark 色值），并按注释中的分区序号插入。
- **新增分区时**：三文件注释中的序号列表必须同步更新。
- Tailwind v4 使用 `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))` 代替内置 `dark:` 变体。
- 在组件中始终使用 `dark:` 前缀编写深色模式样式，而不是直接引用 CSS 变量。