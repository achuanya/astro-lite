/**
 * 鼠标接近视口右边缘时，给 <html> 加 `scrollbar-near` 类，
 * 让 CSS 把滚动条滑块提前切到可见色。
 *
 * - 仅在支持 hover 的精确指针设备启用（桌面端鼠标），移动端跳过；
 * - 用 requestAnimationFrame 节流，避免每帧 toggleClass；
 * - 仅在状态翻转时操作 DOM，pointermove 本身是 passive 监听。
 */

const THRESHOLD_PX = 80;

if (
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches
) {
  const root = document.documentElement;
  let ticking = false;
  let near = false;
  let lastX = 0;

  const update = () => {
    ticking = false;
    const shouldBeNear = lastX >= window.innerWidth - THRESHOLD_PX;
    if (shouldBeNear !== near) {
      near = shouldBeNear;
      root.classList.toggle("scrollbar-near", near);
    }
  };

  const onMove = (e: PointerEvent) => {
    lastX = e.clientX;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  const onLeave = () => {
    if (near) {
      near = false;
      root.classList.remove("scrollbar-near");
    }
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave, { passive: true });
}
