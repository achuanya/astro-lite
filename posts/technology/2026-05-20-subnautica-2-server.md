---
title: Subnautica 2 游戏服务器搭建
date: 2026-05-19 21:07:00+08:00
featured: false
draft: true
tags:
- Subnautica
- 服务器
- Docker
categories:
- 技术
toc: true
comments: true
image: cover.svg
---

4 月 25 日，英国知名游戏服务器托管服务商 LOW.MS 为了打好提前量，发布一篇有关 **深海迷航2** 架构的文章

要我讲，他们和游戏厂商（Unknown Worlds）没丁点关系，我不信

[Subnautica 2 Dedicated Servers: What's Real and What's Not (Early Access)](https://low.ms/blog/subnautica-2-dedicated-server-hosting-guide)

## P2P 架构

> **Multiplayer.** Up to four players in a shared world, including the host. Optional, so you can still play solo. Designed in from the start rather than retrofitted.
>
> **Crossplay.** PC and Xbox players can join the same session. Matchmaking and connectivity run through Epic Online Services.
>
> **Architecture.** Peer-to-peer, hosted on one player's machine. The host owns the world save. Community discussion on the official Steam forum reflects this, and the Steam store text only describes co-op multiplayer with friends, with no mention of dedicated servers.

一款售价 108 RMB 的多人协作游戏，采用点对点架构？还是第一部太成功辣！不了解的这款游戏的，看数据说话：

| 游戏版本                             | **多人模式** | **跨平台支持**          | **存档架构**          |
| ------------------------------------ | ------------ | ----------------------- | --------------------- |
| **Subnautica 1**                     | 不支持       | 不支持                  | 本地存档              |
| **Subnautica 1 + Nitrox 开源服务端** | 2 - 4人      | PC 社区模组，不支持主机 | 自建服务器            |
| **Subnautica 2：异星水域**           | 2 - 4人      | PC 与 Xbox 跨平台       | 本地存档 + 点对点架构 |

## 戏说不是胡说

> Unknown Worlds has not announced a dedicated server tool for Subnautica 2. There is no separate "Dedicated Server" entry on Steam, no public SteamCMD app for it, and no reference to one in the official store page or the Xbox Game Preview announcement. Anything you see online claiming a specific app ID, config path, or port set should be treated as unverified at best.
>
> That doesn't mean dedicated servers are off the table forever. Unknown Worlds could add them during Early Access. The community modding scene could build a Nitrox-style solution for the sequel given time. UE5 has good dedicated server scaffolding, and some titles add an official server later in their lifecycle. None of that is the same as "dedicated servers at launch", and I'm not going to pretend otherwise.

按照他们的说法就是：

别胡说，我没有，但续作可以有，不过是类似 [Nitrox](https://github.com/subnauticanitrox/nitrox) 的解决方案。

你们不必追问，毕竟上述内容偏离了本次发售的版本，韭菜还是要割滴~

![](liuxue.png)

## 别找我，求开源，找托管

> **Test the peer-to-peer experience first.** Play a session with your group as soon as the game drops. Confirm whether host-only multiplayer is good enough for what you actually want, or whether the friction (host availability, host hardware, host internet) makes a hosted solution worth waiting for.
>
> **Watch the patch notes.** Early Access updates are where dedicated server support, if it lands, is most likely to be announced.
>
> **Watch the modding scene.** If a Nitrox-equivalent appears for Subnautica 2, that's the path most communities will take to always-on worlds.
>
> **Don't trust appid-and-port-list guides yet.** If a guide cites specific SteamCMD app IDs, config paths, or RCON commands for Subnautica 2 today, ask where the source is. If it's another hosting provider's blog and not Unknown Worlds or a verifiable build inspection, treat it as content rot.

再次暗示玩家学习 **Nitrox**，争当表率，争做示范，走在前列腺

> [Nitrox：从前没有路，人走的多了，路便有了](https://github.com/subnauticanitrox/nitrox)

这招挺牛逼的，建议 R 星也学习学习人家的先进策略，把 GTA 6 和 大表哥 3 的 Dedicated Server 架构砍掉，仅开放接口，玩家自行搭建，不仅站着把钱挣了，还能省掉未来的云服务支出，里外都热闹喽！

那真是，锣鼓喧天，鞭炮齐鸣，红旗招展，人山人海呀，全世界云服务市场都盘活了，计算机上下游供应链都得涨停板

> 股东：[Anthony Gallegos](https://www.anthonygallegos.net/) 请收下我的膝盖，您这请君入瓮这招，是我从业 20 年来，见过最伟大的操盘，同行们纷纷效仿，我们的股票涨疯了！

![](low-ms.png)

时至今日，[LOW.MS](https://low.ms/game-servers/subnautica-2-server-hosting) 还没有正式开售该服务，但他北美的同行 [Survival Servers](https://www.survivalservers.com/services/game_servers/subnautica_2/) 已经入瓮

在此感谢 Survival Servers 在产品页的标注，让我成为 [Beacon](https://github.com/HumanGenome/Beacon)、[Beacon Server](https://github.com/HumanGenome/BeaconServer) 第一个点赞的人

> [Anthony Gallegos](https://www.anthonygallegos.net/)：过啥分他还得谢咱呢

## Nitrox vs Beacon

Nitrox 和 Beacon 都是 Subnautica 系列的开源服务端，但俩者区别非常大

| 开源项目                 | Nitrox                       | Beacon                                     |
| ------------------------ | ---------------------------- | ------------------------------------------ |
| **游戏版本**             | Subnautica                   | Subnautica 2                               |
| **开源情况**             | 完全开源（GPL-3.0）          | 启动器闭源， 服务端开源（MIT）             |
| **平台支持**             | Windows + Linux              | 仅 Windows                                 |
| **是否需要启动游戏进程** | **不需要**（仅读取游戏文件） | **必须**（自动启动并监控 Subnautica2.exe） |

![](beacon-launcher-showcase.png)

## 跑不通了

这篇日志是我在部署的过程中写下的，对于这个游戏我并不是很熟悉，因为我才玩了两个小时，只因为和朋友玩“学习版”开黑不稳定产生的一个想法

FORK 项目后，我就想拿下第一个合并，代码都没看，用 Ai 把 README 翻译为中文，再根据自己的口吻改改，哈哈哈，当我提交后，第一个不是我？

[Enhance PipeName for cross-platform compatibility and refactor args](https://github.com/humangenome/BeaconServer/pull/1)

从 issues 留言来看，他叫 Dylan，北美 BisectHosting 公司的程序员，该公司比 Survival Servers 成立还早一年（2011）专业的游戏服务器托管服务商

Dylan 所提交的代码是关于 Beacon Server 部署在 Linux 遇到的问题，因为他用的是 Wine

[我看看代码](https://github.com/humangenome/BeaconServer/pull/1/commits)，他就改了三文件，主要修复了 Windows 和 Linux 系统下的路径解析问题（经典永流传）









扯淡的是 Survival Servers 已经开售了托管服务：[Subnautica 2 Game Server Hosting](https://www.survivalservers.com/services/game_servers/subnautica_2/)

由 [Beacon](https://github.com/humangenome/Beacon) 开源框架提供的支持

不知是先有鸡，还是有蛋，下方
