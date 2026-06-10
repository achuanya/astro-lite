---
author: 游钓四方
pubDatetime: 2026-05-25T06:47:00+08:00
title: 低配服务器调优
featured: false
draft: false
tags:
  - 技术
  - Linux
  - 调优
cover: cover.svg
description: 一个月前，我在阿里云秒杀抢了台丐中丐，38元/年，2核 2G 40G...
---

一个月前，我在阿里云秒杀抢了台丐中丐，38元/年，2核 2G 40G

今天我在想它能不能作为饥荒的自建服务器，便着手收拾了起来

默认的系统是 Alibaba Cloud Linux，阿里过度定制化，不太适合我

索性直接用 Ubuntu 重装了系统。在编译博客时，再次遇到一个月前的性能问题，这里把调优过程记录下来，也算水了一篇

![](io.png)

如上图，执行构建命令后，磁盘 IO 瞬间拉满，直接达到了该套餐的 IOPS 上限，接近 2000 counts/s

随后这台丐中丐彻底失去响应，SSH 直接断开，我只能去阿里云控制台强制重启

### 增加 Swap

这种丐中丐想要编译项目，单靠 2G 物理内存真的很难受，必须向磁盘借点空间

```bash
# 创建 4GB Swap
sudo dd if=/dev/zero of=/swapfile bs=1M count=4096

# 赋权、格式化、启用
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 自动挂载
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Swap 虽实用，但有专家表示：它会拉低你的系统性能，因为磁盘和内存的读写速度是不一样的，从而影响软件和系统的稳定性

不过，我都穷到吃泡面了，自然也不会在乎泡面有没有营养

### Swappiness 内核调优

虚拟内存有了，但系统底层（阿里云）有自己的调用策略

```bash
# 阿里云 Ubuntu 24.04 默认值
cat /proc/sys/vm/swappiness
0
```

这里的默认值为 0，貌似 [阿里云提供的系统](https://help.aliyun.com/zh/alinux/support/method-for-configuring-and-risks-associated-with-the-swap-feature?spm=5176.12818093_47.console-base_help.dexternal.60c716d0Jgor5w) 默认都为 0

但 [Ubuntu 官方文档 ](https://help.ubuntu.com/community/SwapFaq?utm_source=copilot.com) 曾表示：

> The default value is 60.

哦 ~ 这种人抢钱最狠了

当为 0 时，表示禁用，就算你分配了虚拟内存 ，系统也会死扛着不用，直到物理内存爆掉

这就导致了文章开头提到的 IOPS 瞬间被打满的情况

```bash
# 永久设置为 30
echo 'vm.swappiness=30' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 如果你想临时修改来测试性能
sudo sysctl vm.swappiness=30
```

### 限制 V8 引擎内存上限

我的博客是 Astro 框架，本质上是由 Node.js 编译，而 Node 的 V8 引擎默认会根据系统情况占用内存，这里给它戴上紧箍咒

```bash
NODE_OPTIONS="--max-old-space-size=1400" pnpm build
```

丐中丐只有 2G，这里强行给到 1.4G 封顶，强制触发垃圾回收，防止内存爆掉触发 OOM-Killer

### 并发限制

我习惯用 `pnpm`，这类前端工具都是清一色的多线程，这里也给它穿小鞋

虽然执行速度会慢一些，但不至于 build 一波拉崩系统

```md
// .npmrc

child-concurrency=1
```

完美落地！

```bash
05:48:29 [build] 285 page(s) built in 29.73s
05:48:29 [build] Complete!

Running Pagefind v1.4.0...
Finished in 2.559 seconds
```