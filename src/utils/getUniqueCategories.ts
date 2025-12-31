import { slugifyStr } from "./slugify";
import type { CollectionEntry } from "astro:content";
import postFilter from "./postFilter";
import { SITE } from "@/config";

interface Category {
  category: string;
  categoryName: string;
  count: number;
}

const getUniqueCategories = (posts: CollectionEntry<"blog">[]): Category[] => {
  const catCountMap = new Map<string, Category>();

  posts
    .filter(postFilter)
    .flatMap(post => post.data.categories)
    .forEach(cat => {
      const slugName = slugifyStr(cat);
      if (catCountMap.has(slugName)) {
        // Existing
        const existing = catCountMap.get(slugName)!;
        existing.count += 1;
      } else {
        // New
        catCountMap.set(slugName, {
          category: slugName,
          categoryName: cat,
          count: 1,
        });
      }
    });

  const categories = Array.from(catCountMap.values()).sort((catA, catB) => {
    // 手动排序模式
    if (SITE.categoryOrder.manual) {
      const orderList = SITE.categoryOrder.order as readonly string[];
      const indexA = orderList.indexOf(catA.categoryName);
      const indexB = orderList.indexOf(catB.categoryName);
      // 不在列表中的排到最后，按文章数量排序
      if (indexA === -1 && indexB === -1) {
        return catB.count - catA.count;
      }
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    }
    // 自动排序：按文章数量降序，数量相同按字母排序
    if (catB.count !== catA.count) return catB.count - catA.count;
    return catA.category.localeCompare(catB.category);
  });
  return categories;
};

export default getUniqueCategories;