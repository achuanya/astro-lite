import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import getSortedPosts from "@/utils/getSortedPosts";
import { SITE } from "@/config";

// Function to convert a date to a UTC date that matches the local time in the specified timezone
// This is used to force RSS feeds to display the "local" time of the post, even though RSS uses GMT.
const getLocalTimeAsUTC = (date: Date, timezone: string) => {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const getPart = (type: string) =>
      parseInt(parts.find(p => p.type === type)?.value || "0", 10);

    return new Date(
      Date.UTC(
        getPart("year"),
        getPart("month") - 1,
        getPart("day"),
        getPart("hour"),
        getPart("minute"),
        getPart("second")
      )
    );
  } catch (e) {
    console.error(`Error formatting date for timezone ${timezone}:`, e);
    return date;
  }
};

export async function GET() {
  const posts = await getCollection("blog");
  const sortedPosts = getSortedPosts(posts);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    trailingSlash: false,
    items: sortedPosts.map(({ data, id, filePath }) => ({
      link: getPath(id, filePath),
      title: data.title,
      description: data.description,
      pubDate: getLocalTimeAsUTC(
        new Date(data.updated ?? data.date),
        data.timezone ?? SITE.timezone
      ),
    })),
  });
}
