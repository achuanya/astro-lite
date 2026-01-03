/**
 * RSS 订阅源端点
 *
 * @fileoverview 生成博客 RSS 2.0 订阅源
 *
 * 文件用途：
 * - 作为 /rss.xml 路由的处理器，生成符合 RSS 2.0 标准的 XML 订阅源
 * - 将博客文章转换为 RSS 格式，供 RSS 阅读器订阅和使用
 * - 集成文章内容追踪，用于统计订阅用户的阅读行为
 *
 * 核心逻辑：
 * 1. 从内容集合中获取所有博客文章（包括草稿）
 * 2. 使用 getSortedPosts 按更新时间（或发布时间）降序排序
 * 3. 遍历每篇文章，执行以下转换：
 *    a. 使用 getPath 生成文章的正确 URL 路径
 *    b. 使用 markdown-it 将 Markdown 正文转换为 HTML
 *    c. 使用 sanitize-html 清理 HTML，移除潜在的不安全标签
 *    d. 添加 Matomo 追踪像素，用于统计订阅阅读数据
 * 4. 调用 @astrojs/rss 生成最终的 RSS XML 内容
 *
 * 依赖关系：
 * - 被 Astro 框架的 /rss.xml 路由自动调用（GET 请求）
 * - 依赖 @astrojs/rss 生成 RSS XML 结构
 * - 依赖 sanitize-html 清理 HTML 内容，防止 XSS 攻击
 * - 依赖 markdown-it 解析 Markdown 为 HTML
 * - 依赖 getSortedPosts 进行文章排序
 * - 依赖 getPath 生成正确的文章链接
 *
 * 路由：
 * - GET /rss.xml - 返回 RSS 2.0 格式的 XML 订阅源
 *
 * 安全性：
 * - 使用 sanitize-html 限制允许的 HTML 标签，防止恶意代码注入
 * - 追踪像素使用 1x1 透明图片，不影响订阅阅读体验
 */

import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import getSortedPosts from "@/utils/getSortedPosts";
import { SITE } from "@/config";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";

/**
 * 创建 Markdown 解析器实例
 *
 * 使用默认配置即可满足基本的 Markdown 转 HTML 需求
 * 如需支持扩展语法（如容器、脚注等），可在此传入相应插件
 */
const parser = new MarkdownIt();

/**
 * RSS 订阅源处理器
 *
 * 处理流程：
 * 1. 从 Astro 内容集合中获取所有 blog 类型的文章
 * 2. 按时间排序（最新的在前）
 * 3. 转换为 RSS 格式并返回 XML 响应
 *
 * @returns RSS XML 响应对象，包含订阅源信息和所有文章条目
 */
export async function GET() {
  // 获取所有博客文章（不过滤草稿，确保订阅源包含全部内容）
  const posts = await getCollection("blog");

  // 按更新时间（或发布时间）降序排序，getSortedPosts 会过滤草稿和未到发布时间的文章
  const sortedPosts = getSortedPosts(posts);

  // 使用 @astrojs/rss 生成 RSS XML
  return rss({
    // 订阅源标题
    title: SITE.title,
    // 订阅源描述
    description: SITE.desc,
    // 订阅源的基础 URL
    site: SITE.website,
    // URL 不添加尾部斜杠
    trailingSlash: false,
    // RSS 文章条目数组
    items: sortedPosts.map(({ data, id, body, filePath }) => {
      /**
       * 生成文章的 URL 路径
       *
       * 使用 getPath 工具函数处理文章的文件路径和 ID
       * 支持文章存放在子目录中的情况
       */
      const postPath = getPath(id, filePath);

      /**
       * 生成 Matomo 追踪像素 HTML
       *
       * 用途：
       * - 当 RSS 阅读器加载文章内容时，会请求这个图片 URL
       * - Matomo 服务器记录这次请求，用于统计订阅阅读行为
       * - 参数说明：
       *   - idsite=1: 网站 ID
       *   - rec=1: 记录请求
       *   - action_name: 文章标题（URL 编码）
       *   - url: 文章完整 URL（URL 编码）
       *
       * 样式说明：
       * - width=0, height=0, border=0: 隐藏图片，不影响阅读体验
       * - alt="": 空替代文本，符合无障碍规范
       */
      const trackingPixel = `<img src="https://analytics.lhasa.icu/matomo.php?idsite=1&rec=1&action_name=${encodeURIComponent(data.title)}&url=${encodeURIComponent(SITE.website + postPath)}" style="border:0;width:0;height:0;" alt="" />`;

      /**
       * 将 Markdown 正文转换为安全的 HTML
       *
       * 处理步骤：
       * 1. 使用 markdown-it 的 render 方法将 Markdown 转换为 HTML
       * 2. 使用 sanitize-html 清理 HTML，移除不安全的标签和属性
       * 3. 在默认允许的标签基础上，额外允许 img 标签（用于图片展示）
       *
       * 安全性：
       * - sanitize-html 会移除 script、iframe 等潜在危险的标签
       * - 保留基本的格式标签（p, h1-h6, strong, em, a, ul, ol, li 等）
       */
      const htmlContent = sanitizeHtml(parser.render(body ?? ""), {
        // 在默认允许标签列表基础上添加 img 标签
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      });

      /**
       * 返回 RSS 文章条目对象
       *
       * 字段说明：
       * - link: 文章的 URL 路径
       * - title: 文章标题
       * - description: 文章描述（用于摘要显示）
       * - pubDate: 发布日期（使用更新时间或发布时间，优先更新时间）
       * - content: 文章的完整 HTML 内容，包含追踪像素
       */
      return {
        link: postPath,
        title: data.title,
        pubDate: new Date(data.updated ?? data.date),
        content: htmlContent + trackingPixel,
      };
    }),
  });
}
