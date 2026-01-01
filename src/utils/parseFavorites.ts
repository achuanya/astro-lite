import { SITE } from "@/config";

export interface FavoriteItem {
  image: string;
  title: string;
  url: string;
  description: string;
}

export function parseFavorites(content: string): FavoriteItem[] {
  const items: FavoriteItem[] = [];
  const blocks = content.trim().split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) continue;

    const imageLine = lines[0];
    const linkLine = lines[1];

    // 解析图片: ![alt](filename.jpg)
    const imageMatch = imageLine.match(/!\[.*?\]\((.+?)\)/);
    const imageFilename = imageMatch ? imageMatch[1] : '';

    // 解析链接: [title](url "description")
    const linkMatch = linkLine.match(/\[(.+?)\]\((.+?)(?:\s+"(.+?)")?\)/);
    if (!linkMatch) continue;

    const title = linkMatch[1];
    const url = linkMatch[2];
    const description = linkMatch[3] || '';

    // 构建完整图片URL
    const image = imageFilename.startsWith('http')
      ? imageFilename
      : `${SITE.imageConfig.imagesUrl}/favorites/${imageFilename}`;

    items.push({ image, title, url, description });
  }

  return items;
}