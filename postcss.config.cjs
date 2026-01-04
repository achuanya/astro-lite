/**
 * PostCSS 配置
 * 添加自定义插件将 font-display: swap 替换为 fallback
 */
module.exports = {
  plugins: [
    // 自定义插件：替换 @fontsource 中的 font-display
    {
      postcssPlugin: "postcss-font-display-fallback",
      Declaration(decl) {
        if (decl.prop === "font-display" && decl.value === "swap") {
          decl.value = "fallback";
        }
      },
    },
  ],
};
