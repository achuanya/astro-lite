import { slugifyStr } from "./slugify";

export type CategoryImageMap = Record<string, string>;

export const CATEGORY_IMAGE_URLS: CategoryImageMap = {
  技术: "https://cos.lhasa.icu/dist/images/categories/3ca.jpg",
  生活: "https://cos.lhasa.icu/dist/images/categories/c7a.jpg",
  骑行: "https://cos.lhasa.icu/dist/images/categories/008.jpg",
  摄影: "https://cos.lhasa.icu/dist/images/categories/d50.jpg",
  徒步: "https://cos.lhasa.icu/dist/images/categories/4e7.jpg",
  跑步: "https://cos.lhasa.icu/dist/images/categories/e08.jpg",
  阅读: "https://cos.lhasa.icu/dist/images/categories/f70.jpg",
  野钓: "https://cos.lhasa.icu/dist/images/categories/8f5.jpg",
  年报: "https://cos.lhasa.icu/dist/images/categories/afb.jpg",
};

export function getCategoryImageUrl(nameOrSlug?: string): string | undefined {
  if (!nameOrSlug) return undefined;

  if (CATEGORY_IMAGE_URLS[nameOrSlug]) return CATEGORY_IMAGE_URLS[nameOrSlug];

  const slug = slugifyStr(nameOrSlug);
  return CATEGORY_IMAGE_URLS[slug];
}
