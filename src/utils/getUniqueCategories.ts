/**
 * 获取唯一分类列表及统计
 *
 * @fileoverview 从文章集合中提取所有分类，并统计每个分类的文章数量
 *
 * 核心逻辑：
 * 1. 过滤掉草稿和未发布的文章
 * 2. 展开所有文章的 categories 数组
 * 3. 使用 Map 统计每个分类出现的次数
 * 4. 根据 config.ts 中的 categoryOrder 配置进行排序：
 *    - manual=true：按 order 数组的手动顺序排序
 *    - manual=false：按文章数量降序排序
 *
 * 数据结构：
 * - category: URL 友好的 slug（如 "qi-cheng"）
 * - categoryName: 原始分类名称（如 "骑行"）
 * - count: 文章数量
 *
 * 依赖关系：
 * - 被 /categories/index.astro 页面调用，用于显示分类列表
 * - 依赖 postFilter 进行文章过滤
 * - 依赖 slugifyStr 生成 URL slug
 * - 依赖 config.ts 中的 categoryOrder 配置
 */

import { slugifyStr } from "./slugify";
import type { CollectionEntry } from "astro:content";
import postFilter from "./postFilter";
import { SITE } from "@/config";

/**
 * 分类对象接口
 *
 * @property category - URL 友好的 slug（用于分类页 URL）
 * @property categoryName - 原始分类名称（用于显示）
 * @property count - 该分类下的文章数量
 */
interface Category {
  category: string;
  categoryName: string;
  count: number;
}

/**
 * 获取唯一分类列表及统计
 *
 * 处理流程：
 * 1. 过滤有效文章（非草稿、已发布）
 * 2. 展开所有文章的 categories 数组
 * 3. 统计每个分类出现的次数
 * 4. 根据 config.ts 配置排序：
 *    - 手动模式：按 order 数组顺序，未列出的按数量排序
 *    - 自动模式：按文章数量降序，数量相同按字母排序
 *
 * @param posts - 文章集合
 * @returns 分类对象数组，已按配置排序
 *
 * @example
 * // 手动模式返回示例（order: ["技术", "生活"]）
 * [
 *   { category: "ji-shu", categoryName: "技术", count: 10 },
 *   { category: "sheng-huo", categoryName: "生活", count: 5 },
 *   { category: "qi-cheng", categoryName: "骑行", count: 3 }  // 未列出，排在最后
 * ]
 *
 * @example
 * // 自动模式返回示例
 * [
 *   { category: "ji-shu", categoryName: "技术", count: 10 },
 *   { category: "sheng-huo", categoryName: "生活", count: 5 }
 * ]
 */
const getUniqueCategories = (posts: CollectionEntry<"blog">[]): Category[] => {
  // 使用 Map 存储分类统计，key 为 slug
  const catCountMap = new Map<string, Category>();

  // 遍历所有文章
  posts
    .filter(postFilter) // 过滤掉草稿和未发布的文章
    .flatMap(post => post.data.categories) // 将所有文章的 categories 数组展平为一维数组
    .forEach(cat => {
      // 将分类名转换为 slug
      const slugName = slugifyStr(cat);

      if (catCountMap.has(slugName)) {
        // 分类已存在：计数 +1
        const existing = catCountMap.get(slugName)!;
        existing.count += 1;
      } else {
        // 新分类：初始化计数为 1
        catCountMap.set(slugName, {
          category: slugName,
          categoryName: cat,
          count: 1,
        });
      }
    });

  // 将 Map 转为数组并排序
  const categories = Array.from(catCountMap.values()).sort((catA, catB) => {
    // === 手动排序模式 ===
    if (SITE.categoryOrder.manual) {
      const orderList = SITE.categoryOrder.order as readonly string[];
      const indexA = orderList.indexOf(catA.categoryName);
      const indexB = orderList.indexOf(catB.categoryName);

      // 两者都不在列表中：按文章数量降序排序
      if (indexA === -1 && indexB === -1) {
        return catB.count - catA.count;
      }
      // 只有 A 不在列表中：B 排在前面
      if (indexA === -1) return 1;
      // 只有 B 不在列表中：A 排在前面
      if (indexB === -1) return -1;
      // 两者都在列表中：按列表顺序排序
      return indexA - indexB;
    }

    // === 自动排序模式：按文章数量降序，数量相同按字母排序 ===
    // 先按数量降序
    if (catB.count !== catA.count) return catB.count - catA.count;
    // 数量相同时，按分类 slug 字母顺序排序
    return catA.category.localeCompare(catB.category);
  });

  return categories;
};

export default getUniqueCategories;
