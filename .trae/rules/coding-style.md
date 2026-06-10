---
alwaysApply: true
---

# 编码风格规范

## 通用约定

- **语言**：所有注释和文档使用中文，变量名/函数名使用英文。
- **分号**：始终使用分号（`semi: true`）。
- **引号**：优先使用双引号（`singleQuote: false`），JSX 同理。
- **箭头函数括号**：单参数时省略括号（`arrowParens: "avoid"`）。
- **尾逗号**：使用 ES5 尾逗号（`trailingComma: "es5"`）。
- **缩进**：2 空格（`tabWidth: 2`）。
- **行宽**：最大 80 字符（`printWidth: 80`）。
- **换行**：LF（`endOfLine: "lf"`）。
- **括号间距**：对象花括号内部加空格（`bracketSpacing: true`）。

## TypeScript 规范

- 使用 `type` 关键字定义类型，仅在需要运行时值时使用 `interface`。
- Props 类型应定义在组件 frontmatter 内的 `type Props = { ... }` 中，紧跟在 imports 之后。
- 解构 Props 时使用默认值语法：`const { variant = "h2", ...rest } = Astro.props;`。
- 使用 `const` 优先，仅在需要重赋值时使用 `let`，禁止 `var`。
- 工具函数使用具名导出（`export function` / `export const`），避免默认导出。
- 工具函数放置在 `src/utils/` 目录下，每个文件一个关注点。
- 类型定义放置在 `src/types/` 目录下。

## 导入顺序

按以下顺序组织 import，各组之间空一行：

1. Astro / 框架模块（`astro:content`、`astro:i18n`、`astro:env/client` 等）
2. 第三方库（`dayjs`、`lodash.kebabcase` 等）
3. 别名路径模块（`@/config`、`@/utils/*`、`@/components/*`、`@/i18n` 等）
4. 相对路径模块（`./LinkButton.astro`、`../layouts/*` 等）
5. 样式文件（`@/styles/*`、CSS 文件等）

## 命名约定

- 文件名：组件使用 PascalCase（`Card.astro`、`Tag.astro`）；工具/脚本使用 camelCase（`slugify.ts`、`withBase.ts`）。
- 目录名：使用 camelCase 或 kebab-case，与已有惯例一致（`skeleton/`、`_components/`）。
- CSS 变量：使用 kebab-case（`--nav-link-active`、`--prose-heading-border`）。
- Tailwind 自定义 utility：使用 kebab-case（`app-layout`、`max-w-app`、`active-nav`）。
- 页面私有组件：放在页面同级 `_components/` 目录下。

## 错误处理

- 不要使用 `console.log` / `console.error`，ESLint 规则 `no-console: "error"` 已开启。
- 使用 `try...catch` 处理可恢复错误，`catch` 块中可使用空注释说明忽略原因。
- 对不可能为 null 的值使用非空断言（`as string`），而非冗余的 `if (!x) return`。

## 格式化与 Lint

- 提交前必须通过 `pnpm format:check` 和 `pnpm lint`。
- 修复格式问题使用 `pnpm format`。
- Prettier 配置已包含 `prettier-plugin-astro` 和 `prettier-plugin-tailwindcss`，Tailwind class 会自动排序。
- ESLint 使用 `eslint-plugin-astro`，astro 文件会被检查。

## View Transitions

- 使用 `<ClientRouter />` 进行页面切换动画。
- 需要跨页面持久化的脚本监听 `astro:page-load`（初始化）和 `astro:after-swap`（重新绑定）。
- 仅在当前页面运行的脚本使用 `<script is:inline data-astro-rerun>` 或 `<script is:inline>`。
- theme.ts 的 FOUC 防止脚本使用 `is:inline` + `define:vars` 同步执行，不可改为模块脚本。

## 国际化（i18n）

- 项目支持 `zh`（默认）和 `en` 两种语言。
- 所有用户可见文本必须通过 `useTranslations(locale)` 获取，禁止硬编码 UI 字符串。
- URL 生成使用 `getRelativeLocaleUrl(locale, path)` 确保语言前缀正确。
- 翻译文件在 `src/i18n/lang/zh.ts` 和 `src/i18n/lang/en.ts`，格式为 `tplStr` 模板（支持 `{{key}}` 占位符）。

## 配置层

- **用户配置**：`astro-paper.config.ts` — 用户可编辑的配置入口。
- **内部配置**：`src/config.ts` — 解析用户配置并填充默认值，运行时代码统一从此导入。
- **类型定义**：`src/types/config.ts` — `AstroPaperConfig`（用户输入）和 `ResolvedAstroPaperConfig`（全量）。
- 新增配置项必须三处同步：接口 → 用户类型辅助 → 默认值解析。
- 路径别名 `@/` 映射到 `src/`（见 `tsconfig.json`）。