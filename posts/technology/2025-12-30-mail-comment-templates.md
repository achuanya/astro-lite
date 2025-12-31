---
title: "给博客评论设计邮件通知模板"
subtitle: ""
date: 2025-12-29T05:07:00+08:00
featured: true
draft: true
tags:
  - 开源
  - Mail Comment Templates
  - Maizzle
categories: ["技术"]
toc: true
comments: false
image: photosuite.svg
---

## 安装

Mail Comment Templates 已发布至 npm，可直接安装：

```bash
pnpm add mail-comment-templates
# or
npm install mail-comment-templates
# or
yarn add mail-comment-templates
```

## 快速开始

配置 Photosuite 非常简单，以`Astro`为例：

```go title="/internal/template/template_render.go" ins={3-4,11-12}
type tplParams struct {
  ...
	Email        string `json:"email"`
	Link         string `json:"link"`
  ...
}

func getCommonParams(dao *dao.Dao, notify *entity.Notify, atd notifyExtraData) tplParams {
	return tplParams{
    ...
		Email:        atd.toUser.Email,
		Link:         atd.toUser.Link,
    ...
	}
}
```

### 解决 HTML 邮件中图片显示问题

HTML 邮件的渲染环境非常苛刻，不同邮件客户端

尤其是 Outlook、Gmail、Apple Mail 等等，每家对 CSS 和 HTML 的政策都不一样

这就会导致图片在不同邮件客户端中显示不同，会强制显示图片的原始尺寸

哪怕你指定宽度都不行：

```html
<style>
  img {
    width: 50px !important;
  }
</style>

<!-- 渲染评论内容 -->
{{reply_content}}
```

所以只能使用 HTML 原生属性 width="xx"，这是 Word 引擎硬编码支持的，兼容所有邮件系统

```html
<img width="50" ...>
```

因为评论内容是由 go 渲染的，所以我们需要用 go，对评论内容中的图片添加 width 属性来

```go title="internal/template/template_render.go" del={4,} ins={5,10-21}
func getCommonParams(dao *dao.Dao, notify *entity.Notify, atd notifyExtraData) tplParams {
	return tplParams{
    ...
    ReplyContent: atd.from.Content,
	ReplyContent: addWidthToImgTags(atd.from.Content),
    ...
	}
}

func addWidthToImgTags(str string) string {
	// 匹配所有 <img> 标签
	r := regexp.MustCompile(`<img\s+([^>]*)>`)
	return r.ReplaceAllStringFunc(str, func(m string) string {
		// 如果已经有 width 属性，则不添加
		if regexp.MustCompile(`\bwidth\s*=`).MatchString(m) {
			return m
		}
		// 在 <img 后面添加 width="50"
		return regexp.MustCompile(`<img\s+`).ReplaceAllString(m, `<img width="50" `)
	})
}
```