let observer: IntersectionObserver | null = null;

export function initInfiniteScroll() {
  if (observer) {
    observer.disconnect();
  }

  const list = document.getElementById("post-list");
  const sentinel = document.getElementById("infinite-scroll-sentinel");
  if (!list || !sentinel) return;

  const obs = new IntersectionObserver(
    async (entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) return;

      const url = sentinel.getAttribute("data-next-page");
      if (!url) return;

      obs.disconnect();

      try {
        const res = await fetch(url);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, "text/html");

        // Each paginated page rebuilds Astro's transition:name scope counter
        // from 1, so the same data-astro-transition-scope value collides
        // across pages once we splice them together. Rewrite incoming scope
        // IDs (and their matching CSS rules) to be globally unique before
        // appending, otherwise view-transition-name dupes break navigation.
        const scopeRewrites = new Map<string, string>();
        for (const el of doc.querySelectorAll<HTMLElement>(
          "[data-astro-transition-scope]",
        )) {
          const old = el.getAttribute("data-astro-transition-scope")!;
          let next = scopeRewrites.get(old);
          if (!next) {
            next = `${old}-p${Date.now().toString(36)}${scopeRewrites.size}`;
            scopeRewrites.set(old, next);
          }
          el.setAttribute("data-astro-transition-scope", next);
        }

        const newItems = doc.querySelectorAll("#post-list > li");
        list.append(...newItems);

        for (const style of doc.querySelectorAll("style")) {
          let css = style.textContent ?? "";
          if (
            !css.includes("view-transition-name") &&
            !css.includes("data-astro-transition-scope")
          ) {
            continue;
          }
          for (const [old, next] of scopeRewrites) {
            css = css.replaceAll(old, next);
          }
          const clone = style.cloneNode(true) as HTMLStyleElement;
          clone.textContent = css;
          document.head.appendChild(clone);
        }

        const nextSentinel = doc.getElementById("infinite-scroll-sentinel");
        const nextUrl = nextSentinel?.getAttribute("data-next-page");
        if (nextUrl) {
          sentinel.setAttribute("data-next-page", nextUrl);
          obs.observe(sentinel);
        }
      } catch {
        obs.observe(sentinel);
      }
    },
    { rootMargin: "300px" },
  );
  observer = obs;

  const nextPageUrl = sentinel.getAttribute("data-next-page");
  if (nextPageUrl) observer.observe(sentinel);
}
