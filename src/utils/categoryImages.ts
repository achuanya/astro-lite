import { slugifyStr } from "./slugify";

export type CategoryImageMap = Record<string, string>;

/**
 * 分类图片 URL 映射
 */
export const CATEGORY_IMAGE_URLS: CategoryImageMap = {
  "技术": "https://cos.lhasa.icu/dist/images/categories/3ca.jpg",
  "生活": "https://cos.lhasa.icu/dist/images/categories/c7a.jpg",
  "骑行": "https://cos.lhasa.icu/dist/images/categories/008.jpg",
  "摄影": "https://cos.lhasa.icu/dist/images/categories/d50.jpg",
  "徒步": "https://cos.lhasa.icu/dist/images/categories/4e7.jpg",
  "跑步": "https://cos.lhasa.icu/dist/images/categories/e08.jpg",
  "阅读": "https://cos.lhasa.icu/dist/images/categories/f70.jpg",
  "野钓": "https://cos.lhasa.icu/dist/images/categories/8f5.jpg",
  "年报": "https://cos.lhasa.icu/dist/images/categories/afb.jpg",
  "创业": "https://cos.lhasa.icu/dist/images/categories/a20.jpg",
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