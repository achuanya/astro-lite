/**
 * 远程图片骨架屏占位的揭示逻辑
 *
 * 统一占位结构（封面图 / 头像）：
 *   <div class="relative ... overflow-hidden">
 *     <div data-skeleton-ph class="skeleton skeleton-shimmer absolute inset-0"></div>
 *     <img data-skeleton class="absolute inset-0 ... opacity-0 transition-opacity" />
 *   </div>
 *
 * 图片位于占位块之上（DOM 顺序靠后），加载完成后淡入并移除底层占位，
 * shimmer 随之消失。无 JS 时由 Layout 中的 <noscript> 兜底强制显示图片。
 */

/** 揭示单张图片：淡入并移除其同级占位块 */
function revealImage(img: HTMLImageElement): void {
  img.classList.remove("opacity-0");
  img.classList.add("opacity-100");
  const placeholder = img.parentElement?.querySelector("[data-skeleton-ph]");
  placeholder?.remove();
}

/**
 * 为单张图片绑定揭示逻辑（幂等）。
 * 适用于运行时动态创建的图片（如友链头像）。
 */
export function attachImageSkeleton(img: HTMLImageElement): void {
  if (img.dataset.skeletonBound) return;
  img.dataset.skeletonBound = "1";

  // 已缓存/已解码：直接揭示
  if (img.complete && img.naturalWidth > 0) {
    revealImage(img);
    return;
  }

  img.addEventListener("load", () => revealImage(img), { once: true });
  // 加载失败也揭示，避免图片被占位永久遮挡
  img.addEventListener("error", () => revealImage(img), { once: true });
}

/** 扫描并绑定根节点下所有待揭示图片（默认整个文档），用于 astro:page-load */
export function revealLoadedImages(root: ParentNode = document): void {
  root
    .querySelectorAll<HTMLImageElement>("img[data-skeleton]")
    .forEach(attachImageSkeleton);
}
