---
title: Docker部署饥荒服务器
date: 2026-05-16 21:07:00+08:00
featured: false
draft: true
tags:
- 饥荒
- 服务器
- Docker
categories:
- 技术
toc: true
comments: true
image: cover.svg
---

![ ](pictures-1.webp)

## DST 指南

[Don't Starve Together - Dedicated Server](https://github.com/mathielo/dst-dedicated-server) 饥荒发烧友指南，由 Docker 封装

```bash
git clone https://github.com/mathielo/dst-dedicated-server.git
```

核心文件说明

```
DSTClusterConfig/
├── cluster_token.txt         # Klei 服务器令牌
├── cluster.ini               # 房间的全局设置（名字、密码、人数等）
├── Master/                   # 地上世界的文件夹
│   ├── server.ini            # 地上世界的网络端口配置
│   └── leveldataoverride.lua # 地上世界生成设置（比如秋天开局、没有boss）
└── Caves/                    # 地下洞穴的文件夹
    ├── server.ini            # 地下洞穴的网络端口配置
    └── leveldataoverride.lua # 地下世界生成设置
```

## 生成 Klei 服务器令牌

> 💡如果你在浏览器已登录 Steam，点击[此链接](https://accounts.klei.com/account/game/servers?game=DontStarveTogether)，直达操作 5

1. 进入游戏点击 **Play**
2. 左下角点击 **Account**
3. 导航栏中选择**GAMES**
5. 再点击 **GAME SERVERS**
6. 根据提示自行生成，Token 有效期 20 年

```bash
cd ~/dst-dedicated-server

echo '你的Token字符串' > DSTClusterConfig/cluster_token.txt
```



## 房间配置

由于饥荒配置太复杂，这里只记录最重要的，以便供我查阅。如有集群需求，移步到上述帖子

```ini
// cluster.ini

[GAMEPLAY]
game_mode = survival       ; 游戏模式：survival(生存)、endless(无尽)、wilderness(荒野)
max_players = 3            ; 最大玩家数 64
pvp = false                ; 击剑模式
pause_when_empty = true    ; 没人玩的时候世界是否暂停(不暂停，直接饿死)
vote_enabled = true        ; 投票功能：true (开启，允许玩家在游戏里发起投票，比如回滚、重置世界)

[NETWORK]
cluster_intention = cooperative     ; 房间标签：cooperative (合作类型，方便别人筛选房间)

cluster_name = 能力越小责任越小        ; 房间名字
cluster_description = 电子阳痿的都在这 ; 房间简介
cluster_password = 666666           ; 房间密码(不写就是公开房间)

autosaver_enabled = true   ; 自动存档
enable_vote_kick = false   ; 投票踢人(不能通过投票踢人，只有管理员能踢)
tick_rate = 15             ; 刷新率：官方默认 15。数字越高游戏越丝滑，但越吃配置和网络。
connection_timeout = 8000  ; 延迟卡死判定(毫秒)如果玩家卡死断线超过设定秒，服务器就会把他踢掉腾位置。

; offline_server = false   ; 单机/离线模式，代码默认被注释。启用后，无需 Token，适用于局域网

[000000000000000MISC]
max_snapshots = 6          ; 存档快照数量：最多保留 6 个历史存档，用来在游戏里“回滚”天数
console_enabled = true     ; 控制台：true (开启，允许管理员按 ~ 键输入指令/刷物品)

[STEAM]
; --- Steam 玩家群体（公会）功能 ---
; steam_group_id = 00000000000  ; 填入你的 Steam 组 ID，加入该组的玩家可以在列表最上方看到你的服务器
; steam_group_only = false      ; 如果设为 true，就只有这个 Steam 组的成员能进，相当于不用设密码的私密服
; steam_group_admins = false    ; 如果设为 true，Steam 组的管理在游戏里自动变成游戏管理员

[SHARD]
cluster_key = ThisIsTheSecretKeyForClusterCommunication ; 通讯密钥：地上和地下服务器对暗号用的，默认即可
shard_enabled = true       ; 多世界联动：必须为 true，这样才能把地上和地下连起来
bind_ip = 0.0.0.0          ; 绑定IP：0.0.0.0 代表接受来自任何地方的连接
master_ip = dst_master     ; 主世界IP：这里指定了 Docker 容器内部的连接地址
```

## 世界配置

根据官方论坛



## 启动

### 触发 BUG

#### SteamCMD 网络超时

在这步卡我一个小时，查看日志一直在重试

```bash
docker logs -f dst_master
....
[ 41%] Downloading update (15297 of 36514 KB)...
突然变成
[ 20%] Downloading update (7613 of 36514 KB)...
...

Fatal Error: Steamcmd needs to be online to update
CURL ERROR: Could not resolve host
...
Could not resolve host: d2fr86khx60an2.cloudfront.net
....
```

什么路边？Amazon CloudFront，亚马逊的亲儿子，不知令郎为何反复横跳

**强制指定 DNS 服务器**

```yaml
// docker-compose.yml

services:
  dst_caves:
	...
  dst_master:
	...
    dns:
      - 119.29.29.29
      - 223.5.5.5
      - 8.8.8.8
    ...
```

#### 写入权限

Permission denied 没有写入权限，DST 服务器开始初始化，但容器内 dst 用户无法写入宿主机挂载目录

```bash
cp: cannot create regular file ... Permission denied
Unable to write to config directory. Please make sure you have permissions for your Klei save folder.
Failed to save file: .../Master/save/saveindex
```

```bash
# 停止当前容器
docker-compose down

# 修复权限
sudo chown -R 1000:1000 DSTClusterConfig volumes

# 确保目录存在且有权限
mkdir -p volumes/mods DSTClusterConfig/Master DSTClusterConfig/Caves
sudo chown -R 1000:1000 DSTClusterConfig volumes

# 重新启动
docker-compose up -d
```

再次尝试

```
Generation complete
Begin Session: 75014148FC9D3531
[Shard] Shard server started on port: 10888
[Steam] SteamGameServer_Init success
Gameserver logged on to Steam
Sim paused
```

成功了！ **Master 世界生成完成、Steam 登录成功、主世界在线等待玩家** 这一步





### 下载 Steamcmd

```bash
$ mkdir steamcmd

$ cd steamcmd

$ curl -LO https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip
  % Total    % Received % Xferd  Average Speed  Time    Time    Time   Current
                                 Dload  Upload  Total   Spent   Left   Speed
100 756.6k 100 756.6k   0      0 650.9k      0   00:01   00:01         207.3k

$ unzip steamcmd.zip
Archive:  steamcmd.zip
  inflating: steamcmd.exe

$ ./steamcmd.exe
Redirecting stderr to 'C:\Users\lhasa\Downloads\steamcmd\logs\stderr.txt'
ILocalize::AddFile() failed to load file "public/steambootstrapper_english.txt".
ILocalize::AddFile() failed to load file "public/steambootstrapper_schinese.txt".
[  0%] Checking for available update...
[----] Downloading update (0 of 43,472 KB)...
[100%] Download Complete.
[----] Applying update...
[----] Extracting package...
[----] Installing update...
[----] Cleaning up...
[----] Update complete, launching...
Redirecting stderr to 'C:\Users\lhasa\Downloads\steamcmd\logs\stderr.txt'
Logging directory: 'C:\Users\lhasa\Downloads\steamcmd/logs'
[  0%] 正在检查可用更新...
[----] 正在下载更新 (已下载 0，共 29,289 KB)...
[100%] 下载完成。
[----] 正在安装更新...
[----] 正在展开安装包...
[----] 正在安装更新...

[----] 正在清理...
[----] 更新完成，正在启动 Steamcmd...
Redirecting stderr to 'C:\Users\lhasa\Downloads\steamcmd\logs\stderr.txt'
Logging directory: 'C:\Users\lhasa\Downloads\steamcmd/logs'
[  0%] 正在检查可用更新...
[----] 正在验证安装...
Steam Console Client (c) Valve Corporation - version 1778284286
-- type 'quit' to exit --
Loading Steam API...OK
```

### 下载 DST Dedicated Server

```bash
# 匿名登录
Steam>login anonymous

Connecting anonymously to Steam Public...OK
Waiting for client config...OK
Waiting for user info...OK

# 设置安装目录
Steam>force_install_dir C:\Users\lhasa\Downloads\dst-server
Please use force_install_dir before logon!

# 下载 DST Dedicated Server
# PS：343050 = Don't Starve Together Dedicated Server
Steam>app_update 343050 validate
 Update state (0x3) reconfiguring, progress: 0.00 (0 / 0)
 Update state (0x11) preallocating, progress: 20.58 (913951143 / 4440094933)
 Update state (0x61) downloading, progress: 99.34 (4410927854 / 4440094933)
 Update state (0x81) verifying update, progress: 8.18 (363323726 / 4440094933)
 Update state (0x81) verifying update, progress: 30.72 (1363859209 / 4440094933)
 Update state (0x101) committing, progress: 11.49 (510047441 / 4440094933)
 Update state (0x101) committing, progress: 36.25 (1609477875 / 4440094933)
 Update state (0x0) unknown, progress: 0.00 (0 / 0)
Success! App '343050' fully installed.
```







## Mod 配置

Don't Starve Together - Dedicated Server 自带

```lua
// modoverrides.lua

return {

  -- 虫洞标记。进过同一个虫洞后，地图上会用相同颜色标出来
  -- https://steamcommunity.com/sharedfiles/filedetails/?id=362175979
  ["workshop-362175979"]={ configuration_options={ ["Draw over FoW"]="disabled" }, enabled=true },

  -- 额外装备栏。背包和护甲、项链可以同时装备
  -- https://steamcommunity.com/sharedfiles/filedetails/?id=375850593
  ["workshop-375850593"]={ configuration_options={  }, enabled=true },

  -- 血量显示。看得到怪物的具体血量
  -- https://steamcommunity.com/sharedfiles/filedetails/?id=375859599
  ["workshop-375859599"]={
    configuration_options={
      divider=5,
      random_health_value=0,
      random_range=0,
      show_type=0,
      unknwon_prefabs=1,
      use_blacklist=true
    },
    enabled=true
  },

  -- 全球定位。在地图上能直接看到队友在哪
  -- https://steamcommunity.com/sharedfiles/filedetails/?id=378160973
  ["workshop-378160973"]={
    configuration_options={
      ENABLEPINGS=true,
      FIREOPTIONS=2,
      OVERRIDEMODE=false,
      SHAREMINIMAPPROGRESS=true,
      SHOWFIREICONS=true,
      SHOWPLAYERICONS=true,
      SHOWPLAYERSOPTIONS=2
    },
    enabled=true
  },

  -- 食物属性显示。把鼠标放上去就能看到回多少血、多少精神、多少饱食度
  -- https://steamcommunity.com/sharedfiles/filedetails/?id=458940297
  ["workshop-458940297"]={
    configuration_options={
      DFV_ClientPrediction="default",
      DFV_FueledSettings="default",
      DFV_Language="EN",
      DFV_MinimalMode="default",
      DFV_PercentReplace="default",
      DFV_ShowACondition="default",
      DFV_ShowADefence="default",
      DFV_ShowAType="default",
      DFV_ShowDamage="default",
      DFV_ShowFireTime="default",
      DFV_ShowInsulation="default",
      DFV_ShowTemperature="default",
      DFV_ShowUses="default"
    },
    enabled=true
  },

  -- 快速采集。捡草、捡树枝等等
  -- https://steamcommunity.com/sharedfiles/filedetails/?id=501385076
  ["workshop-501385076"]={ configuration_options={  }, enabled=true },

  -- 狗牙陷阱自动重置
  -- https://steamcommunity.com/sharedfiles/filedetails/?id=588560555
  ["workshop-588560555"]={ configuration_options={  }, enabled=true },

  -- Boss 酷炫大血条
  -- https://steamcommunity.com/sharedfiles/filedetails/?id=1185229307
  ["workshop-1185229307"]={ configuration_options={  }, enabled=true }
}
```



## Doc：

[Dedicated Server Settings Guide](https://forums.kleientertainment.com/forums/topic/64552-dedicated-server-settings-guide/)

[How to setup dedicated server with cave on Linux](https://steamcommunity.com/sharedfiles/filedetails/?id=590565473)

[Don t Starve Together - Dedicated Server](https://github.com/mathielo/dst-dedicated-server)