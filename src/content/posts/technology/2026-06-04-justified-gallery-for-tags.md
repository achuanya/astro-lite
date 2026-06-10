---
author: 游钓四方
pubDatetime: 2026-06-04T13:11:00+08:00
title: 木桶算法原理
featured: true
draft: true
tags:
  - 技术
  - 前端
  - 算法
cover: cover.svg
description: 标签页右边参差不齐看着实在不舒服...
---

下午翻自己的标签页，越看越别扭

`flex flex-wrap gap-2` 一把梭，左边对齐得整整齐齐，右边却像被狗啃过 —— 每一行最后一个标签后面都留着一截空白，长短还不一样，看着特别毛糙

我想要的是 Flickr 那种感觉：每一行都正好顶到容器右边，左右两条线笔直地落下来。但又不能像 `text-align: justify` 那样无脑拉伸 —— 万一某一行只有两三个标签，硬撑过去就成了"# 技术 ⋯⋯⋯⋯⋯⋯ # 杂谈"，更难看

这其实是经典的 **木桶布局（Justified Gallery Algorithm）** 要解决的问题，Flickr、Google Photos 那种瀑布流相册早就玩烂了，只不过那边处理的是图片宽高比，我这边处理的是标签的文字宽度，本质是一回事

### 一、算法思路

木桶布局的核心就三步：

1. **测量自然宽度** —— 每个元素先按内容撑开，量一下"原始"宽度
2. **贪心装行** —— 从左往右一个一个塞进当前行，塞不下了就换下一行
3. **按比例拉伸** —— 这一行加起来比容器窄多少，就按每项自然宽度的比例分摊出去，让最右边正好顶到边

光这三步还不够。要是某一行只有两三个标签，自然宽度加起来才占容器的一半，拉伸比就要到 2.0 以上，那画面没法看。所以还需要一个**最大拉伸比上限**（`maxScale`），超过了就放弃拉伸，让这行保持自然宽度、左对齐 —— 一般这种行就是末行或者倒数第二行

### 二、贪心装行

容器宽度 `W`，间距 `gap`，第 `i` 个标签的自然宽度 `wᵢ`

每装入一个新标签，需要的总宽度是：

```text
needed = Σ wᵢ + (n - 1) × gap
```

如果 `needed > W`，新标签塞不下，当前行收口，新标签作为下一行的第一个

```javascript
const rows = [];
let row = [], rowWidth = 0;
for (let i = 0; i < items.length; i++) {
  const w = widths[i];
  const need = row.length === 0 ? w : rowWidth + gap + w;
  if (row.length > 0 && need > containerWidth) {
    rows.push(row);
    row = [i];
    rowWidth = w;
  } else {
    row.push(i);
    rowWidth = need;
  }
}
if (row.length) rows.push(row);
```

这里有个细节：**第一个标签即使比容器还宽也得塞进去**，否则会死循环。当然中文标签基本不会出现这种情况，权当兜底

### 三、按比例拉伸

每一行的可用宽度（扣掉间距）：

```text
avail = W - (n - 1) × gap
```

这一行所有标签自然宽度的总和：

```text
sumW = Σ wᵢ
```

那么缩放比就是：

```text
scale = avail / sumW
```

把每个标签的宽度设为 `wᵢ × scale`，整行就会刚好填满容器，留白按自然宽度的比例分摊 —— 文字多的标签分到更多留白，文字少的少分一点，看起来很自然

但这里有两道闸：

```javascript
if (scale <= 1 || scale > maxScale) return;
```

- `scale <= 1`：理论上不可能（贪心装行保证了行宽不会超过容器），但 `border` 这种亚像素误差有时会让 `sumW` 略微超过 `avail`，直接跳过更稳
- `scale > maxScale`：**这条最关键**，把"末行不拉伸"和"稀疏行不拉伸"合并成同一条规则。我设的是 `1.6`，意思是单个标签最多可以拉到自然宽度的 1.6 倍。这个值是凭手感调的，再大就开始离谱了

### 四、什么时候触发重排

这事儿不能只算一次，因为：

- **窗口缩放**：容器宽度变了，每行能塞几个、拉伸比都得重算
- **视图过渡**：Astro 的 `astro:page-load` 事件，从别的页面切过来时 DOM 重新挂载，需要重新布局
- **首次加载**：脚本执行时立即跑一次

我用 `requestAnimationFrame` 节流，避免 `resize` 时一秒触发几十次重排：

```javascript
let raf = 0;
function schedule() {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(layoutTags);
}

document.addEventListener("astro:page-load", schedule);
window.addEventListener("resize", schedule);
schedule();
```

### 五、DOM 结构上的配合

算法要在 `<li>` 上设 `width`，但内部的 `<a>` 才是实际的点击区域和视觉本体，所以得让 `<a>` 自动撑满父级：

```astro
<li class="tag-item">
  <a
    class="bg-foreground/10 hover:bg-foreground/20 flex h-full items-center
           justify-center gap-1 rounded-md px-3 py-1.5 text-sm
           whitespace-nowrap transition-colors"
  >
    <span class="opacity-60">#</span>
    <span>{tagName}</span>
  </a>
</li>
```

几个关键点：

- `<a>` 改成 `flex` 并加 `justify-center`，文字居中，拉伸后留白均匀分布在两侧
- `h-full` 让 `<a>` 撑满 `<li>` 的高度，否则同一行可能高低不齐
- `whitespace-nowrap` 防止某些长标签在窄屏下被换行成两行，破坏行高一致性

测量自然宽度前要先把上一次设的 `width` 清掉，否则量出来的就是上一次拉伸过的宽度，越算越偏：

```javascript
for (const li of items) li.style.width = "";
const widths = items.map(li => li.getBoundingClientRect().width);
```

### 六、和 Flex 原生方案的对比

写之前我也考虑过纯 CSS 方案，主要是这两条：

**`text-align: justify`**：传统排版方案，对 inline-block 元素有效。问题是没法控制单行最大拉伸比，稀疏行直接惨不忍睹；而且对末行的处理需要加一个透明占位元素，hack 味儿太重

**`flex-grow` 按自然宽度加权**：理论上可以给每个 `<li>` 设 `flex-grow: var(--natural-width)`，让它们按比例拉伸。问题是 `flex-grow` 是行内分配，没法区分"末行"和"非末行"，也没法卡 `maxScale` 上限

所以最后还是落到 JS 方案。代码量也不多，整个布局函数三十几行

### 七、效果

跑起来之后，每一行最右边的标签都正好贴着容器边缘，左右两条线干干净净。稀疏的末行保持自然宽度左对齐，不会被强行拉开

完整代码在 [`src/pages/tags/index.astro`](https://github.com/achuanya/astro-lhasa)，三十几行就搞定了，比想象中简单

写完这个我又想起 Flickr 当年那篇讲相册布局的博客 [Flickr's New Justified Layout](https://code.flickr.net/2014/05/05/flickr-justified-layout-implementation/)，作者把同样的思路用在了图片宽高比上 —— 图片的"自然宽度"就是 `targetRowHeight × aspectRatio`，剩下的几乎一模一样。算法这东西，换个皮就能跨领域复用，挺有意思
