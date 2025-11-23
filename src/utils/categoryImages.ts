import { slugifyStr } from "./slugify";

export type CategoryImageMap = Record<string, string>;

/**
 * 分类图片 URL 映射
 * 使用方法：将分类的 slug（通常与分类名一致，中文也可）映射到对应的网络图片 URL。
 * 示例：
 * {
 *   "技术": "https://example.com/tech.jpg",
 *   "生活": "https://example.com/life.jpg",
 *   "outdoors": "https://example.com/outdoors.jpg"
 * }
 */
export const CATEGORY_IMAGE_URLS: CategoryImageMap = {
  // 在此填入你的分类图片 URL 映射，键使用分类的 slug 或原始名称
  "技术": "https://cos.lhasa.icu/dist/images/categories/technology.jpg",
  "生活": "https://cos.lhasa.icu/dist/images/categories/life.jpg",
  "骑行": "https://cos.lhasa.icu/StylePictures/my-photo.jpg",
  "跑步": "https://cos.lhasa.icu/dist/images/2025-11-14-recent-activities/20251113212057_681_266.jpg",
  "阅读": "https://cos.lhasa.icu/dist/images/categories/book.jpg",
  "创业": "https://cos.lhasa.icu/dist/images/categories/startup.jpg",
  "徒步": "https://cos.lhasa.icu/dist/images/2025-10-15-first-hike-deep-forest-cliff-fall/20251014013256_335_266.jpg",
  "野钓": "https://cos.lhasa.icu/dist/images/categories/fish.jpg",
};

/**
 * 根据分类名称或 slug 获取图片 URL
 * 兼容：传入中文或英文名称、或已处理过的 slug
 */
export function getCategoryImageUrl(nameOrSlug?: string): string | undefined {
  if (!nameOrSlug) return undefined;
  const slug = slugifyStr(nameOrSlug);
  return CATEGORY_IMAGE_URLS[slug] || CATEGORY_IMAGE_URLS[nameOrSlug];
}