import GLightbox from 'glightbox';
import 'glightbox/dist/css/glightbox.min.css';
import '@/styles/glightbox.css';

// 只初始化一次
export function initLightbox() {
  if (typeof window === 'undefined') return;

  // 防止 HMR/多次执行反复创建实例
  if (window.__glightboxInstance) {
    //新增节点可刷新；老版本没有 refresh/reload 就直接返回
    try {
      window.__glightboxInstance.refresh?.();
    } catch {}
    return;
  }

  window.__glightboxInstance = GLightbox({
    selector: 'a.glightbox',
    touchNavigation: true,
    loop: false,
    zoomable: false,
    autoplayVideos: true,
    preload: true,
  });

  // 每次页面切换后确保选择器能扫到新节点
  document.addEventListener('astro:page-load', () => {
    try { window.__glightboxInstance.refresh?.(); } catch {}
  });
}