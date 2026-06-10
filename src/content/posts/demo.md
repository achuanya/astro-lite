---
author: 游钓四方
pubDatetime: 2026-06-01T12:01:00+08:00
title: demo
featured: true
draft: true
tags:
  - docs
  - FAQ
cover: book.svg
description: How to use Git Hooks to set your Created and Modified Dates on AstroPaper
---

# Markdown 全面渲染测试

这是用于测试 Astro 博客 Markdown 渲染能力的**完整测试文档**。

---

## 1. 标题测试

# H1 标题
## H2 标题
### H3 标题
#### H4 标题
##### H5 标题
###### H6 标题

---

## 2. 文字强调

**这是粗体文字**  
*这是斜体文字*  
***这是粗斜体文字***  
~~这是删除线~~  

==高亮文字== （如果主题支持）  
**_粗斜体组合_**

---

## 3. 列表

### 无序列表
- 第一项
- 第二项
  - 子项目 1
  - 子项目 2
    - 第三级
- 第三项

### 有序列表
1. 第一步
2. 第二步
   1. 子步骤 A
   2. 子步骤 B
3. 第三步

### 任务列表
- [x] 已完成的任务
- [ ] 未完成的任务
- [x] 另一个已完成项

---

## 4. 链接

[普通链接](https://example.com)  
[带标题的链接](https://example.com "这是一个提示标题")  
[内部链接](../about)  

自动链接：https://astro.build

---

## 5. 图片测试

![占位图片](https://cos.lhasa.icu/dist/images/2026-05-28-zhuanzhu/visual-poetry.jpg)  
![带标题的图片](https://cos.lhasa.icu/dist/images/2026-05-28-zhuanzhu/guangzhijiaotang1.jpg "这是图片标题")

---

## 6. 代码

### 行内代码
使用 `console.log('Hello World')` 来打印信息。

### 代码块

```js
// JavaScript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('Astro'));
```

```python file=astro.config.ts
# Python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b
```

```html 
<!-- HTML -->
<div class="card">
  <h3>测试卡片</h3>
  <p>这是一个测试段落</p>
</div>
```

```css file=astro.config.ts
/* CSS */
.markdown-body {
  line-height: 1.8;
  color: #e5e5e5;
}
```

---

## 7. 表格

| 姓名 | 年龄 | 职业       | 状态     |
| ---- | ---- | ---------- | -------- |
| 张三 | 28   | 前端工程师 | 在职     |
| 李四 | 34   | 产品设计师 | 自由职业 |
| 王五 | 22   | 学生       | 实习     |

居中对齐：

| 项目 | 描述          | 分数 |
| :--: | :------------ | :--: |
| 测试 | Markdown 渲染 |  95  |

---

## 8. 引用

> 这是一段引用文字。
>
> ——《Typora Lite》主题作者

> 多层引用
> > 第二层引用
> > > 第三层引用

---

## 9. 分隔线

---

***

___

---

## 10. 脚注

这里有一个脚注引用[^1]，还有另一个[^2]。

[^1]: 这是第一个脚注的内容，包含**富文本**。
[^2]: 第二个脚注，测试编号。

---

## 11. 数学公式（KaTeX）

行内公式：$E = mc^2$

块级公式：

$$
\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

$$
\begin{cases}
x + y = 10 \\
2x - y = 4
\end{cases}
$$

---

## 12. 表情符号

:smile: :heart: :rocket: :fire: :sparkles: :100: :clap:

---

## 13. HTML 嵌入测试

<p style="color: #a5b4fc; font-size: 1.1em;">
这是一个 <strong>HTML 嵌入段落</strong>，用于测试 Astro 是否允许原始 HTML。
</p>

<details>
<summary>点击展开折叠内容</summary>
<p>这是折叠的内容测试。</p>
</details>

---

## 14. 警示框（GitHub Alerts，如果支持）

> [!NOTE]
> 这是一条提示信息。

> [!IMPORTANT]
> 重要提醒：请仔细阅读文档。

> [!WARNING]
> 注意：这是一个警告。

> [!CAUTION]
> 危险操作！

---

**测试完成！**

这个文档包含了绝大部分常用的 Markdown 语法，可用于全面测试你的 `astro-lite`（或你最终命名的）主题的渲染效果。
