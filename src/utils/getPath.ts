/**
 * 文章路径生成工具
 *
 * @fileoverview 根据文章的文件路径和 ID 生成 URL 路径
 *
 * 核心逻辑：
 * - 支持文章存放在子目录中的情况（如 posts/tech/article.md）
 * - 自动排除以下划线开头的目录（私有文件）
 * - 将路径中的每个段落转换为 slug 格式
 * - 支持是否包含 /posts 前缀
 *
 * 依赖关系：
 * - 被所有需要生成文章链接的地方调用
 * - 依赖 content.config.ts 中的 BLOG_PATH 常量
 * - 依赖 slugifyStr 进行路径 slug 转换
 */

import { BLOG_PATH } from "@/content.config";
import { slugifyStr } from "./slugify";

/**
 * 获取博客文章的完整路径
 *
 * 处理规则：
 * 1. 去除 BLOG_PATH 前缀，获取相对路径
 * 2. 移除空字符串段
 * 3. 排除以下划线 _ 开头的目录（视为私有）
 * 4. 移除最后一段（文件名）
 * 5. 对每一段进行 slugify 处理
 * 6. 拼接 /posts 前缀和文件名（slug）
 *
 * @param id - 文章 ID（通常是文件的相对路径，如 "posts/article.md"）
 * @param filePath - 文章的完整文件路径（可选）
 * @param includeBase - 是否在返回值中包含 `/posts` 前缀，默认 true
 * @returns 文章的 URL 路径
 *
 * @example
 * // 根目录文章：posts/hello-world.md
 * getPath("posts/hello-world.md", "posts/hello-world.md")
 * // 返回："/posts/hello-world"
 *
 * @example
 * // 子目录文章：posts/tech/deep-dive.md
 * getPath("posts/tech/deep-dive.md", "posts/tech/deep-dive.md")
 * // 返回："/posts/tech/deep-dive"
 *
 * @example
 * // 私有目录（被排除）：posts/_drafts/temp.md
 * getPath("posts/_drafts/temp.md", "posts/_drafts/temp.md")
 * // 返回："/posts/temp"（_drafts 被排除）
 *
 * @example
 * // 不包含前缀
 * getPath("posts/hello-world.md", "posts/hello-world.md", false)
 * // 返回："/hello-world"
 */
export function getPath(
  id: string,
  filePath: string | undefined,
  includeBase = true
) {
  // 处理文件路径，提取目录结构
  const pathSegments = filePath
    ?.replace(BLOG_PATH, "") // 去除 BLOG_PATH 前缀（"posts"）
    .split("/") // 按斜杠分割成数组
    .filter(path => path !== "") // 移除空字符串段
    .filter(path => !path.startsWith("_")) // 排除以下划线开头的目录（私有目录）
    .slice(0, -1) // 移除最后一段（文件名），只保留目录结构
    .map(segment => slugifyStr(segment)); // 将每一段转换为 slug 格式

  // 设置基础路径（/posts 或空字符串）
  const basePath = includeBase ? "/posts" : "";

  // 处理文章 ID（slug）
  // ID 可能包含目录，如 "tech/article"，需要提取最后一段
  const blogId = id.split("/");
  const slug = blogId.length > 0 ? blogId.slice(-1) : blogId;

  // 如果没有子目录，直接返回基础路径 + slug
  if (!pathSegments || pathSegments.length < 1) {
    return [basePath, slug].join("/");
  }

  // 如果有子目录，返回完整路径：/posts/parent-dir/child-dir/slug
  return [basePath, ...pathSegments, slug].join("/");
}
