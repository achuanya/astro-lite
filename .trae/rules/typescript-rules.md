---
alwaysApply: true
---

# TypeScript 使用规范

## 类型定义
- 使用 `type` 还是 `interface`？
  - 数据对象、Props 使用 `type`
  - 需要扩展时使用 `interface`

```typescript
// 推荐
type Props = {
  title: string;
  description?: string;
};

type Post = {
  slug: string;
  title: string;
  pubDate: Date;
};

// 需要扩展时
interface Config {
  site: SiteConfig;
}

interface ExtendedConfig extends Config {
  features: Features;
}
```

## 类型注解
- 始终为函数参数和返回值添加类型注解
- 对于复杂类型，优先定义类型别名

```typescript
// 推荐
function parseTimeToMinutes(value: string): number | undefined {
  // ...
}

// 避免
function parseTimeToMinutes(value) {
  // ...
}
```

## 避免 any
- 避免使用 `any` 类型
- 如果确实需要，使用 `unknown` 并进行类型守卫
- 使用类型断言时要谨慎

```typescript
// 推荐
let themeValue: string =
  (window as unknown as { __theme?: { value: string } }).__theme?.value ??
  getPreferredTheme();

// 避免
let themeValue: any = (window as any).__theme?.value;
```

## 联合类型和交叉类型
- 使用联合类型表示"或"的关系
- 使用交叉类型组合多个类型

```typescript
type Theme = "light" | "dark";
type RevealDirection = "down" | "up";
type Config = SiteConfig & FeaturesConfig;
```

## 类型守卫
- 使用类型守卫来缩小类型范围

```typescript
function isString(value: unknown): value is string {
  return typeof value === "string";
}
```

## 泛型
- 适当使用泛型提高代码复用性
- 遵循项目现有模式
