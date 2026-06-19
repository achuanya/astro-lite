/**
 * CustomShiki transformer that adds file name labels to code blocks.
 *
 * This transformer looks for the `file="filename"` meta attribute in code blocks
 * and creates a styled label showing the filename. It supports two different
 * styling options and can optionally hide the green dot indicator.
 *
 * @param {Object} options - Configuration options for the transformer
 * @param {string} [options.style="v2"] - The styling variant to use
 *   - `"v1"`: Tab-style with rounded top corners, positioned at top-left
 *   - `"v2"`: Badge-style with border, positioned at top-left with offset
 * @param {boolean} [options.hideDot=false] - Whether to hide the green dot indicator
 */
export const transformerFileName = ({
  style = "v2",
  hideDot = false,
} = {}) => ({
  root(hast) {
    hast.children = hast.children.map(child => {
      if (child?.type === "element" && child.tagName === "pre") {
        return {
          type: "element",
          tagName: "div",
          properties: { class: ["relative"] },
          children: [child],
        };
      }
      return child;
    });
  },
  pre(node) {
    // Add CSS custom property to the node
    const fileNameOffset = style === "v1" ? "0.75rem" : "-0.75rem";
    node.properties.style =
      (node.properties.style || "") + `--file-name-offset: ${fileNameOffset};`;
    node.properties.tabindex = "0";

    // Add copy button (SSR) so it paints in place on first render and never
    // appears after JS hydration.
    node.children.push({
      type: "element",
      tagName: "button",
      properties: {
        type: "button",
        "aria-label": "Copy code",
        class: [
          "copy-code absolute end-3 top-(--file-name-offset)",
          "rounded bg-muted border border-muted px-2 py-1",
          "text-xs leading-4 text-foreground font-medium",
        ],
      },
      children: [{ type: "text", value: "Copy" }],
    });

    const raw = this.options.meta?.__raw?.split(" ");

    if (!raw) return;

    const metaMap = new Map();

    for (const item of raw) {
      const [key, value] = item.split("=");
      if (!key || !value) continue;
      metaMap.set(key, value.replace(/["'`]/g, ""));
    }

    const file = metaMap.get("file");

    if (!file) return;

    // Add additional margin to code block
    this.addClassToHast(
      node,
      `mt-8 ${style === "v1" ? "rounded-tl-none" : ""}`
    );

    // Add file name to code block
    node.children.push({
      type: "element",
      tagName: "span",
      properties: {
        class: [
          "absolute py-1 text-foreground text-xs font-medium leading-4",
          hideDot
            ? "px-2"
            : "pl-4 pr-2 before:inline-block before:size-1 before:bg-green-500 before:rounded-full before:absolute before:top-[45%] before:left-2",
          style === "v1"
            ? "left-0 -top-6 rounded-t-md border border-b-0 bg-muted/50"
            : "left-2 top-(--file-name-offset) border rounded-md bg-background",
        ],
      },
      children: [
        {
          type: "text",
          value: file,
        },
      ],
    });
  },
});
