import { SITE } from "@/config";

export interface ExifData {
  [key: string]: {
    val: string;
  };
}

export interface ProcessedExifData {
  settings?: string;
}

/**
 * 将后端返回的 EXIF 键值表解析为可读文本
 * - 支持解析分数形式（如 "35/10"）为浮点数
 * - 自动格式化焦距、光圈、快门、ISO 与拍摄时间
 * @param data 原始 EXIF 数据
 * @returns 供前端展示的文本片段
 */
export function parseExifData(data: ExifData): ProcessedExifData {
  const result: ProcessedExifData = {};

  // 辅助：解析浮点或分数字符串
  function safeParseFloat(value: string | undefined): number | null {
    if (typeof value !== 'string') return null;
    if (value.includes('/')) {
      const parts = value.split('/');
      if (parts.length === 2) {
        const num = parseFloat(parts[0]);
        const den = parseFloat(parts[1]);
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
          return num / den;
        }
      }
      return null;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }

  const focal = safeParseFloat(data.FocalLength?.val);
  const aperture = safeParseFloat(data.FNumber?.val);
  const exposure = safeParseFloat(data.ExposureTime?.val);
  const isoStr = data.ISOSpeedRatings?.val;
  const dateStr = data.DateTimeOriginal?.val;

  if (
    focal === null ||
    aperture === null ||
    exposure === null ||
    !isoStr ||
    !dateStr
  ) {
    return result;
  }

  // 数字格式化：去除多余的尾随 0
  const formatNumber = (n: number, digits = 2): string => {
    const s = n.toFixed(digits);
    return s.replace(/\.0+$/, '').replace(/(\.[1-9]*)0+$/, '$1');
  };

  // 焦距格式化：接近整数时显示整数
  const formatFocal = (n: number): string => {
    const rounded = Math.round(n);
    return Math.abs(n - rounded) < 0.05 ? String(rounded) : formatNumber(n, 1);
  };

  const exposureText = exposure >= 1
    ? `${formatNumber(exposure, 0)}s`
    : `1/${Math.round(1 / exposure)}s`;

  const isoText = `ISO ${isoStr}`.replace(/ISO\s+/i, 'ISO ');

  const [datePart, timePartRaw] = dateStr.split(' ');
  const [y, m, d] = datePart.split(':');
  const hhmm = (timePartRaw || '').slice(0, 5);
  const dateText = `${y}.${m}.${d} · ${hhmm}`;

  const sep = '  ·  ';
  result.settings = `${formatFocal(focal)}mm${sep}ƒ/${formatNumber(aperture)}${sep}${exposureText}${sep}${isoText}${sep}${dateText}`;
  return result;
}

/**
 * 将解析结果转为展示字符串
 */
export function formatExifDisplay(exifData: ProcessedExifData): string {
  return exifData.settings || '';
}

/**
 * 持久化 EXIF 缓存管理器
 * - 以内存 Map 作为热缓存
 * - 使用 localStorage 做持久化，按版本与统一过期时间维护
 */
export class PersistentExifCache {
  private memoryCache = new Map<string, string>();
  private readonly STORAGE_KEY = 'exif-cache';
  private readonly CACHE_VERSION = '1.2';
  private readonly DEFAULT_EXPIRY_DAYS = SITE.imageConfig.exif.cache.expiryDays; // 从配置获取缓存有效期

  constructor() {
    this.loadFromStorage();
  }

  // 从 localStorage 载入有效缓存
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;

      const data = JSON.parse(stored);
      if (data.version !== this.CACHE_VERSION) {
        // 版本不匹配：清空并跳过
        localStorage.removeItem(this.STORAGE_KEY);
        return;
      }

      const now = Date.now();
      // 仅恢复未过期的条目至内存
      Object.entries(data.cache || {}).forEach(([key, item]: [string, any]) => {
        if (item.expiry > now) {
          this.memoryCache.set(key, item.data);
        }
      });

      console.log(`从本地存储加载了 ${this.memoryCache.size} 个EXIF缓存项`);
    } catch (error) {
      console.log('加载EXIF缓存失败:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  // 将当前内存缓存持久化到 localStorage
  private saveToStorage() {
    try {
      const now = Date.now();
      const expiryTime = now + (this.DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
      
      const cacheData: { [key: string]: { data: string; expiry: number } } = {};
      this.memoryCache.forEach((value, key) => {
        cacheData[key] = {
          data: value,
          expiry: expiryTime
        };
      });

      const storageData = {
        version: this.CACHE_VERSION,
        cache: cacheData,
        lastUpdated: now
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.log('保存EXIF缓存失败:', error);
    }
  }

  // 读取缓存
  get(key: string): string | undefined {
    return this.memoryCache.get(key);
  }

  // 写入缓存（后台异步持久化）
  set(key: string, value: string) {
    this.memoryCache.set(key, value);
    // 异步持久化，避免阻塞主线程
    setTimeout(() => this.saveToStorage(), 0);
  }

  // 是否存在指定键
  has(key: string): boolean {
    return this.memoryCache.has(key);
  }

  // 当前缓存条目数
  get size(): number {
    return this.memoryCache.size;
  }

  // 清空缓存与持久化存储
  clear() {
    this.memoryCache.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // 清理过期条目并重写存储
  cleanup() {
    this.loadFromStorage(); // 重新加载会自动过滤过期项
    this.saveToStorage();
  }
}

// 全局缓存实例
export const exifCache = new PersistentExifCache();

/**
 * 加载 EXIF 文本（含缓存逻辑）
 * - 当缓存关闭时，直接从服务器获取并解析
 * - 当缓存开启时，优先命中内存缓存，否则请求后写入缓存
 * @param exifUrl EXIF API URL（可选）
 * @param imageSrc 图片地址，用作缓存键的后备
 */
export const loadExifData = async (exifUrl: string, imageSrc: string): Promise<string> => {
  const cacheKey = exifUrl || imageSrc;
  
  // 缓存未启用：直接请求
  if (!SITE.imageConfig.exif.cache.enabled) {
    try {
      const response = await fetch(exifUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const processed = parseExifData(data);
      return formatExifDisplay(processed);
    } catch (error) {
      console.log('EXIF 加载失败:', error);
      return '';
    }
  }
  
  // 命中缓存：直接返回
  if (exifCache.has(cacheKey)) {
    return exifCache.get(cacheKey)!;
  }

  try {
    // 未命中：请求后解析并写入缓存
    const response = await fetch(exifUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    const processed = parseExifData(data);
    const result = formatExifDisplay(processed);
    
    // 写入缓存
    exifCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.log('EXIF 加载失败:', error);
    return '';
  }
};

/**
 * 当没有单独的 EXIF URL 时，直接以图片地址为键加载
 */
export const loadExifFromSrc = async (imageSrc: string): Promise<string> => {
  return loadExifData(imageSrc, imageSrc);
};

/**
 * 是否为小屏设备（<= 768px）
 */
export function isSmallScreen(): boolean {
  return window.innerWidth <= 768;
}

/**
 * 初始化图片 EXIF 提示框交互
 * - 桌面端：基于 hover 显示/隐藏
 * - 首次显示时异步加载 EXIF 并渲染
 */
export function initExifTooltips() {
  // 功能开关
  if (!SITE.imageConfig.exif.enabled) {
    return;
  }
  
  const images = document.querySelectorAll('.img-main[data-show-exif="true"]');
  const isSmall = isSmallScreen();
  
  images.forEach((img) => {
    const exifUrl = img.getAttribute('data-exif-url');
    const tooltip = img.closest('.lightbox')?.querySelector('[data-exif-tooltip]') as HTMLElement;
    
    if (!tooltip) return;

    // 状态
    let isTooltipVisible = false;
    let isHovering = false;
    let isLoading = false;
    let exifDataCache: string | null = null;
    let hideTimeout: NodeJS.Timeout | null = null;
    let showTimeout: NodeJS.Timeout | null = null;

    // 清理定时器
    const clearTimeouts = () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      if (showTimeout) {
        clearTimeout(showTimeout);
        showTimeout = null;
      }
    };

    // 显示提示框（必要时加载数据）
    const showTooltip = async () => {
      clearTimeouts();
      
      if (isTooltipVisible) return;

      // 首次加载 EXIF
      if (!exifDataCache && !isLoading) {
        isLoading = true;
        const imageSrc = (img as HTMLImageElement).src;
        
        try {
          exifDataCache = exifUrl 
            ? await loadExifData(exifUrl, imageSrc)
            : await loadExifFromSrc(imageSrc);
        } catch (error) {
          console.log('EXIF 加载失败:', error);
          exifDataCache = '';
        }
        
        isLoading = false;
        
        // 渲染提示框内容
        const content = tooltip.querySelector('.exif-content');
        if (content) {
          const createMarkup = (t: string) => {
            const parts = t.split('·').map((s) => s.trim()).filter(Boolean);
            const items = parts
              .map((p, i) => `<span class="exif-item">${p}</span>${i < parts.length - 1 ? '<span class="exif-sep" aria-hidden="true">•</span>' : ''}`)
              .join('');
            return `<span class="exif-row">${items}</span>`;
          };
          content.innerHTML = exifDataCache ? createMarkup(exifDataCache) : '';
        }
      }
      
      if (!exifDataCache) {
        return;
      }

      // 展示
      tooltip.classList.add('show');
      isTooltipVisible = true;
    };

    // 隐藏提示框（带微延迟）
    const hideTooltip = () => {
      clearTimeouts();
      hideTimeout = setTimeout(() => {
        tooltip.classList.remove('show');
        isTooltipVisible = false;
      }, 50);
    };

    if (!isSmall) {
      // 桌面端 hover 区域
      const imgWrapper = img.closest('.lightbox');
      const hoverArea = imgWrapper || img.parentElement;
      
      const handleMouseEnter = () => {
        isHovering = true;
        clearTimeouts();
        
        showTimeout = setTimeout(() => {
          if (isHovering) showTooltip();
        }, 100);
      };

      const handleMouseLeave = (e: Event) => {
        isHovering = false;
        clearTimeouts();
        
        const mouseEvent = e as MouseEvent;
        const relatedTarget = mouseEvent.relatedTarget as Element;
        
        // 仍在相关区域内：保持悬停
        if (relatedTarget && (
          tooltip.contains(relatedTarget) || 
          relatedTarget === tooltip ||
          (hoverArea && hoverArea.contains(relatedTarget))
        )) {
          isHovering = true;
          return;
        }
        
        hideTooltip();
      };

      // 绑定事件
      img.addEventListener('mouseenter', handleMouseEnter);
      img.addEventListener('mouseleave', handleMouseLeave);
      
      if (imgWrapper && imgWrapper !== img.parentElement) {
        imgWrapper.addEventListener('mouseenter', handleMouseEnter);
        imgWrapper.addEventListener('mouseleave', handleMouseLeave);
      }
      
      // 提示框悬停保持
      tooltip.addEventListener('mouseenter', () => {
        isHovering = true;
        clearTimeouts();
      });
      
      tooltip.addEventListener('mouseleave', (e: Event) => {
        isHovering = false;
        const mouseEvent = e as MouseEvent;
        const relatedTarget = mouseEvent.relatedTarget as Element;
        
        if (relatedTarget && (
          img.contains(relatedTarget) || 
          relatedTarget === img ||
          (imgWrapper && imgWrapper.contains(relatedTarget))
        )) {
          isHovering = true;
          return;
        }
        
        hideTooltip();
      });
    }
  });
}

/**
 * EXIF 预加载管理器
 * - 基于批处理与并行请求提升首屏后的交互体验
 */
export class ExifPreloader {
  private loadingQueue: Array<{ img: HTMLImageElement; exifUrl: string | null }> = [];
  private isProcessing = false;
  private processedImages = new Set<string>(); // 已处理图片记录
  private readonly BATCH_SIZE = 3; // 批处理大小
  private readonly DELAY_BETWEEN_BATCHES = 500; // 批次间延迟

  // 加入待预加载队列（去重与缓存命中排除）
  addToQueue(img: HTMLImageElement, exifUrl: string | null) {
    const imageSrc = img.src;
    const cacheKey = exifUrl || imageSrc;
    
    // 已命中缓存：跳过
    if (exifCache.has(cacheKey)) {
      return;
    }

    // 已在队列：跳过
    if (this.processedImages.has(imageSrc)) {
      return;
    }

    // 记录并入队
    this.processedImages.add(imageSrc);
    this.loadingQueue.push({ img, exifUrl });
  }

  // 执行预加载（批处理 + 并行）
  async startPreloading() {
    if (this.isProcessing || this.loadingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`开始预加载 ${this.loadingQueue.length} 个图片的 EXIF 数据`);

    while (this.loadingQueue.length > 0) {
      // 取批次
      const batch = this.loadingQueue.splice(0, this.BATCH_SIZE);
      
      // 并发请求
      const promises = batch.map(async ({ img, exifUrl }) => {
        try {
          const imageSrc = img.src;
          const result = exifUrl 
            ? await loadExifData(exifUrl, imageSrc)
            : await loadExifFromSrc(imageSrc);
          
          console.log(`预加载完成: ${imageSrc.split('/').pop()}`);
          return result;
        } catch (error) {
          console.log(`预加载失败: ${img.src.split('/').pop()}`, error);
          return '';
        }
      });

      // 等待批次结束
      await Promise.allSettled(promises);

      // 间隔后处理下一批
      if (this.loadingQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.DELAY_BETWEEN_BATCHES));
      }
    }

    this.isProcessing = false;
    console.log('所有 EXIF 数据预加载完成');
  }

  // 预加载器当前状态
  getStatus() {
    return {
      queueLength: this.loadingQueue.length,
      isProcessing: this.isProcessing,
      cacheSize: exifCache.size,
      processedCount: this.processedImages.size
    };
  }

  // 重置为初始状态
  reset() {
    this.loadingQueue = [];
    this.processedImages.clear();
    this.isProcessing = false;
  }
}

// 全局预加载器实例
export const exifPreloader = new ExifPreloader();

/**
 * 初始化页面级 EXIF 预加载
 * - 页面加载完成后收集待处理图片并延迟启动
 */
export function initExifPreloading() {
  // 功能开关
  if (!SITE.imageConfig.exif.enabled) {
    return;
  }
  
  // 页面就绪后启动
  const startPreloading = () => {
    // 收集需要 EXIF 的图片
    const images = document.querySelectorAll('.img-main[data-show-exif="true"]') as NodeListOf<HTMLImageElement>;
    
    images.forEach((img) => {
      const exifUrl = img.getAttribute('data-exif-url');
      exifPreloader.addToQueue(img, exifUrl);
    });

    // 延迟启动，避免影响首屏渲染
    setTimeout(() => {
      exifPreloader.startPreloading();
    }, 1000);
  };

  // 页面加载事件
  if (document.readyState === 'complete') {
    startPreloading();
  } else {
    window.addEventListener('load', startPreloading);
  }
}

/**
 * 监听懒加载或动态插入的图片，自动加入预加载队列
 */
export function observeNewImages() {
  // 功能开关
  if (!SITE.imageConfig.exif.enabled) {
    return;
  }
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // 收集新节点中的图片
          const newImages = element.querySelectorAll('.img-main[data-show-exif="true"]') as NodeListOf<HTMLImageElement>;
          newImages.forEach((img) => {
            const exifUrl = img.getAttribute('data-exif-url');
            exifPreloader.addToQueue(img, exifUrl);
          });

          // 如有新增且未在处理，短延迟后启动
          if (newImages.length > 0 && !exifPreloader.getStatus().isProcessing) {
            setTimeout(() => {
              exifPreloader.startPreloading();
            }, 100);
          }
        }
      });
    });
  });

  // 观察整个文档树的新增子节点
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * 一次性初始化：缓存清理、提示框交互、预加载与动态监听
 */
export function initAllExifFeatures() {
  // 预加载器重置
  exifPreloader.reset();
  
  // 清理过期缓存
  exifCache.cleanup();
  
  // 启动交互与预加载
  initExifTooltips();
  initExifPreloading();
  observeNewImages();
}

/**
 * 注册页面级事件以确保在路由切换与 Astro 客户端导航后仍可正常初始化
 */
export function setupExifListeners() {
  // 页面加载与 Astro 客户端导航
  document.addEventListener('DOMContentLoaded', initAllExifFeatures);
  document.addEventListener('astro:page-load', initAllExifFeatures);

  // 开发调试：暴露到全局以便检查状态
  if (typeof window !== 'undefined') {
    (window as any).exifPreloader = exifPreloader;
  }
}

// 自动注册（仅在浏览器环境）
if (typeof document !== 'undefined') {
  setupExifListeners();
}
