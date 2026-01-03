/**
 * 收藏内容解析工具
 *
 * @fileoverview 解析收藏页的 Markdown 内容，提取收藏项信息
 *
 * 核心逻辑：
 * 1. 按空行分割内容块
 * 2. 每个块包含图片和链接两部分
 * 3. 使用正则表达式解析 Markdown 语法
 * 4. 自动拼接图片 CDN URL（如果不是完整 URL）
 *
 * Markdown 格式示例：
 * ```markdown
 * ![alt](image.jpg)
 * [title](url "description")
 * ```
 *
 * 依赖关系：
 * - 被 /favorites.astro 页面调用
 * - 依赖 config.ts 中的 imageConfig.imagesUrl 配置
 */

import { SITE } from "@/config";

/**
 * 收藏项接口
 *
 * @property image - 图片完整 URL
 * @property title - 收藏项标题
 * @property url - 链接地址
 * @property description - 收藏项描述（可选）
 */
export interface FavoriteItem {
  image: string;
  title: string;
  url: string;
  description: string;
}

/**
 * 解析收藏页 Markdown 内容
 *
 * 处理流程：
 * 1. 按空行分割内容为多个块
 * 2. 每个块解析第一行（图片）和第二行（链接）
 * 3. 构建完整的图片 URL
 * 4. 返回收藏项数组
 *
 * @param content - 收藏页的 Markdown 内容
 * @returns 解析后的收藏项数组
 *
 * @example
 * // 输入内容
 * """
 * ![图标](logo.png)
 * [示例网站](https://example.com "这是一个示例")
 *
 * ![图标](https://cdn.com/image.png)
 * [外部链接](https://external.com)
 * """
 *
 * // 返回
 * [
 *   {
 *     image: "https://cos.lhasa.icu/dist/images/favorites/logo.png",
 *     title: "示例网站",
 *     url: "https://example.com",
 *     description: "这是一个示例"
 *   },
 *   {
 *     image: "https://cdn.com/image.png",
 *     title: "外部链接",
 *     url: "https://external.com",
 *     description: ""
 *   }
 * ]
 */
export function parseFavorites(content: string): FavoriteItem[] {
  const items: FavoriteItem[] = [];

  // 按空行分割内容块（一个或多个连续空行）
  const blocks = content.trim().split(/\n\n+/);

  for (const block of blocks) {
    // 将每个块按行分割，过滤空行
    const lines = block.trim().split('\n').filter(line => line.trim());

    // 至少需要2行：图片行 + 链接行
    if (lines.length < 2) continue;

    const imageLine = lines[0];
    const linkLine = lines[1];

    // 解析图片行：![alt](filename)
    const imageMatch = imageLine.match(/!\[.*?\]\((.+?)\)/);
    const imageFilename = imageMatch ? imageMatch[1] : '';

    // 解析链接行：[title](url "description")
    // description 是可选的
    const linkMatch = linkLine.match(/\[(.+?)\]\((.+?)(?:\s+"(.+?)")?\)/);
    if (!linkMatch) continue; // 如果链接解析失败，跳过此块

    const title = linkMatch[1];
    const url = linkMatch[2];
    const description = linkMatch[3] || '';

    // 构建完整图片 URL
    // 如果已经是完整 URL（http/https 开头），直接使用
    // 否则拼接 CDN 基础 URL
    const image = imageFilename.startsWith('http')
      ? imageFilename
      : `${SITE.imageConfig.imagesUrl}/favorites/${imageFilename}`;

    items.push({ image, title, url, description });
  }

  return items;
}
