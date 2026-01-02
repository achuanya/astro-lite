---
title: "让博客的代码块更有表现力"
date: 2025-11-03T23:59:00+08:00
featured: false
draft: false
tags:
  - 技术
  - 代码高亮
  - Expressive Code
categories: ["技术"]
toc: false
comments: false
image: logo.png_50
---

我最初用的代码高亮插件是[Shiki](https://shiki.style/)，由 [Astro Paper](https://github.com/satnaing/astro-paper) 自带，时间久了，就感觉平平无奇的。它无法像 Git diff 那样，把增删的代码做出差异化表达

直到偶然遇见 [Expressive Code](https://github.com/expressive-code/expressive-code)，我才发现代码高亮还能这样玩

它的渲染效果蛮惊艳的，让冷冰冰的代码赋有张力：

```go title="main.go" {17-20,22} del={14} ins={15,4-7} collapse={2-7} "rand.Seed(time.Now().UnixNano())"
func greet(id int, wg *sync.WaitGroup) {
	defer wg.Done()

	delay := time.Duration(rand.Intn(3000)) * time.Millisecond
	time.Sleep(delay)

	fmt.Printf("#%d Ping %v\n", id, delay)
}

func main() {
	rand.Seed(time.Now().UnixNano())

	var wg sync.WaitGroup
  numGoroutines := 10
	numGoroutines := 5

	for i := 1; i <= numGoroutines; i++ {
		wg.Add(1)
		go greet(i, &wg)
	}

	wg.Wait()
}
```

```bash frame="terminal" title="输出结果" {4}
$ go run main.go
#2 Ping 135ms
#4 Ping 694ms
#1 Ping 842ms
#5 Ping 1.662s
#3 Ping 1.862s
```

````md title="示例" collapse={2-24}
```go title="main.go" {17-20,22} del={14} ins={15,4-7} collapse={2-7} "rand.Seed(time.Now().UnixNano())"
func greet(id int, wg *sync.WaitGroup) {
	defer wg.Done()

	delay := time.Duration(rand.Intn(3000)) * time.Millisecond
	time.Sleep(delay)

	fmt.Printf("#%d Ping %v\n", id, delay)
}

func main() {
	rand.Seed(time.Now().UnixNano())

	var wg sync.WaitGroup
  numGoroutines := 10
	numGoroutines := 5

	for i := 1; i <= numGoroutines; i++ {
		wg.Add(1)
		go greet(i, &wg)
	}

	wg.Wait()
}
```
````

而且 Expressive Code 对静态架构非常友好，只要你的博客支持 Rehype 插件，就可以安装使用

**Docs：**[Expressive Code](https://expressive-code.com/)

| 功能           | 语法示例                           | 说明                 |
| ------------- | ---------------------------------- | ------------------ |
| 标题           | `title="app.ts"`                   | 显示编辑器标签标题    |
| 语法高亮（ANSI） | `ansi`                             | 渲染 ANSI 终端转义   |
| 行标注（高亮）   | `{3,5-9}`                          | 高亮第 3 行与 5–9 行 |
| 行标注（新增）   | `ins={4-6}`                        | 以“新增”样式高亮     |
| 行标注（删除）   | `del={7,12}`                       | 以“删除”样式高亮     |
| 行标注 + 标签   | `ins={"Init":3-6}`                 | 为 3–6 行添加引用标签 |
| 内联标注（文本） | `ins="inserted" del="deleted"`     | 高亮匹配到的片段      |
| 内联标注（正则） | `ins=/foo$.+$/`                    | 用正则匹配片段        |
| 折叠区块        | `collapse={1-5,12-14}`             | 折叠多段代码         |
| 行号开关        | `showLineNumbers`                  | 需安装行号插件       |
| 起始行号        | `startLineNumber=5`                | 从第 5 行开始计数    |
| 自动换行        | `wrap`                             | 自动换行            |
| 悬挂缩进        | `wrap hangingIndent=2`             | 换行时额外缩进 2 列  |
| 不保留缩进      | `wrap preserveIndent=false`        | 换行后不缩进         |