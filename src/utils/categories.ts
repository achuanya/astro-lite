import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";
import { getSortedPosts } from "./getSortedPosts";

export const CATEGORY_NAMES = [
  "生活",
  "技术",
  "骑行",
  "摄影",
  "跑步",
  "徒步",
  "阅读",
  "野钓",
  "年报",
] as const;

export type CategoryName = (typeof CATEGORY_NAMES)[number];

export type CategoryInfo = {
  slug: string;
  name: CategoryName;
  count: number;
  latestTitle?: string;
};

export function getPostsByCategory(
  posts: CollectionEntry<"posts">[],
  categoryName: string
): CollectionEntry<"posts">[] {
  const slug = slugifyStr(categoryName);
  return getSortedPosts(
    posts.filter(({ data }) =>
      data.tags.some(tag => slugifyStr(tag) === slug)
    )
  );
}

export function getCategories(
  posts: CollectionEntry<"posts">[]
): CategoryInfo[] {
  return CATEGORY_NAMES.map(name => {
    const categoryPosts = getPostsByCategory(posts, name);
    return {
      slug: slugifyStr(name),
      name,
      count: categoryPosts.length,
      latestTitle: categoryPosts[0]?.data.title,
    };
  });
}

export function getCategoryBySlug(
  posts: CollectionEntry<"posts">[],
  slug: string
): CategoryInfo | undefined {
  return getCategories(posts).find(category => category.slug === slug);
}
