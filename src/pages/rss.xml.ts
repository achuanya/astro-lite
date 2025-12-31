import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import getSortedPosts from "@/utils/getSortedPosts";
import { SITE } from "@/config";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";

const parser = new MarkdownIt();

export async function GET() {
  const posts = await getCollection("blog");
  const sortedPosts = getSortedPosts(posts);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    trailingSlash: false,
    items: sortedPosts.map(({ data, id, body, filePath }) => {
      const postPath = getPath(id, filePath);
      const trackingPixel = `<img src="https://analytics.lhasa.icu/matomo.php?idsite=1&rec=1&action_name=${encodeURIComponent(data.title)}&url=${encodeURIComponent(SITE.website + postPath)}" style="border:0;width:0;height:0;" alt="" />`;
      const htmlContent = sanitizeHtml(parser.render(body ?? ""), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      });

      return {
        link: postPath,
        title: data.title,
        description: data.description,
        pubDate: new Date(data.updated ?? data.date),
        content: htmlContent + trackingPixel,
      };
    }),
  });
}