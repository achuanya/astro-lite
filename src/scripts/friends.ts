import config from "@/config";
import zh from "@/i18n/lang/zh";
import en from "@/i18n/lang/en";
import { parseDate, relativeTime } from "@/utils/relativeTime";
import { attachImageSkeleton } from "@/scripts/imageSkeleton";

const PER_PAGE = config.posts.perPage;
const DATA_URL = config.friends.dataUrl;

const locale = document.documentElement.lang || "zh";
const rt = locale === "zh" ? zh.relativeTime : en.relativeTime;

interface FriendsItem {
  category: string;
  url: string;
  title: string;
  published_at: string;
  author: string;
  avatar: string;
}

let allItems: FriendsItem[] = [];
let currentIndex = 0;
let isLoading = false;
let observer: IntersectionObserver | null = null;

function createCard(item: FriendsItem): HTMLLIElement {
  const li = document.createElement("li");

  const outerDiv = document.createElement("div");
  outerDiv.className = "flex items-center gap-3";

  // 头像占位：底层 shimmer 骨架 + 上层淡入图片
  const avatar = document.createElement("div");
  avatar.className =
    "relative h-[50px] w-[50px] shrink-0 overflow-hidden rounded-md";

  const avatarPh = document.createElement("div");
  avatarPh.className = "skeleton skeleton-shimmer absolute inset-0";
  avatarPh.setAttribute("data-skeleton-ph", "");

  const img = document.createElement("img");
  img.src = item.avatar;
  img.alt = item.author;
  img.loading = "lazy";
  img.setAttribute("data-skeleton", "");
  img.className =
    "absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500";

  avatar.appendChild(avatarPh);
  avatar.appendChild(img);
  attachImageSkeleton(img);

  const innerDiv = document.createElement("div");
  innerDiv.className = "min-w-0 flex-1";

  const a = document.createElement("a");
  a.href = item.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.title = item.category;
  a.className =
    "inline-block text-base font-normal decoration-solid underline-offset-4 hover:underline post-title";

  const heading = document.createElement("h2");
  heading.textContent = item.title;
  a.appendChild(heading);

  const dateDiv = document.createElement("div");
  dateDiv.className = "text-muted-foreground flex items-center gap-x-2";
  const time = document.createElement("time");
  time.className = "text-xs";
  time.textContent = relativeTime(item.published_at, rt);
  time.setAttribute("datetime", parseDate(item.published_at).toISOString());
  dateDiv.appendChild(time);

  if (item.author) {
    const sep = document.createElement("span");
    sep.className = "text-xs";
    sep.textContent = " · ";
    const authorSpan = document.createElement("span");
    authorSpan.className = "text-xs";
    authorSpan.textContent = item.author;
    dateDiv.appendChild(sep);
    dateDiv.appendChild(authorSpan);
  }

  innerDiv.appendChild(a);
  innerDiv.appendChild(dateDiv);
  outerDiv.appendChild(avatar);
  outerDiv.appendChild(innerDiv);
  li.appendChild(outerDiv);

  return li;
}

function appendItems(): boolean {
  const list = document.getElementById("post-list");
  if (!list) return false;

  const end = Math.min(currentIndex + PER_PAGE, allItems.length);
  if (currentIndex >= end) return false;

  const fragment = document.createDocumentFragment();
  for (let i = currentIndex; i < end; i++) {
    fragment.appendChild(createCard(allItems[i]));
  }
  list.appendChild(fragment);

  currentIndex = end;
  return currentIndex < allItems.length;
}

function setupScroll(): void {
  if (observer) {
    observer.disconnect();
  }

  const sentinel = document.getElementById("infinite-scroll-sentinel");
  if (!sentinel) return;

  function loadBatch() {
    observer!.disconnect();
    const hasMore = appendItems();
    if (hasMore) {
      observer!.observe(sentinel!);
    } else {
      sentinel!.remove();
    }
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) return;
      loadBatch();
    },
    { rootMargin: "300px" },
  );

  observer.observe(sentinel);
}

export async function initFriends(): Promise<void> {
  const main = document.getElementById("main-content");
  if (main?.dataset.layout !== "friends") return;

  const sentinel = document.getElementById("infinite-scroll-sentinel");
  const list = document.getElementById("post-list");
  if (!sentinel || !list) return;

  try {
    const res = await fetch(DATA_URL);
    const data = await res.json();
    allItems = Array.isArray(data) ? data : [];
    currentIndex = 0;

    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }

    const hasMore = appendItems();
    if (hasMore) {
      setupScroll();
    } else {
      sentinel.remove();
    }
  } catch {
    list.innerHTML = "<li>不是哥们，我加载失败了</li>";
  }
}