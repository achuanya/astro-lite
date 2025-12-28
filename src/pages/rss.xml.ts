import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import getSortedPosts from "@/utils/getSortedPosts";
import { SITE } from "@/config";

function toValidDate(v: unknown): Date | null {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatRfc822Beijing(d: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);

  const get = (type: string) => parts.find((p) => p.type === type)?.value;

  const wd = get("weekday"); // Sun
  const day = get("day"); // 28
  const mon = get("month"); // Dec
  const year = get("year"); // 2025
  const hour = get("hour"); // 14
  const minute = get("minute"); // 30
  const second = get("second"); // 00

  // 北京时区固定 +0800
  return `${wd}, ${day} ${mon} ${year} ${hour}:${minute}:${second} +0800`;
}

export async function GET() {
  const posts = await getCollection("blog");
  const sortedPosts = getSortedPosts(posts);

  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    trailingSlash: false,
    items: sortedPosts.map(({ data, id, filePath }) => {
      const raw = (data as any).updated ?? (data as any).date;
      const dateObj = toValidDate(raw);

      return {
        link: getPath(id, filePath),
        title: data.title,
        description: data.description,
        // 关键：不传 pubDate，避免 rss 生成器输出 GMT
        // pubDate: dateObj ?? undefined,

        // 自己写 pubDate（RSS 里就是 RFC822 格式）
        customData: dateObj ? `<pubDate>${formatRfc822Beijing(dateObj)}</pubDate>` : "",
      };
    }),
  });
}