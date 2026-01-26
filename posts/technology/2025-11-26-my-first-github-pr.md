---
title: 我的第一次 GitHub PR
date: 2025-11-26 23:23:00+08:00
featured: false
draft: false
tags:
- GitHub PR
- 开源
- 开源项目
categories:
- 技术
toc: true
comments: false
image: github.svg
---
我一直觉得 Artalk 的 ui 设计的很不协调，特别评论框下方的“ 评论数、通知中心"  
这并非重要功能，但是官方没有做开关控制。实现后，感觉很实用，可以推一下

#### 确定上游

```bash
$ git remote remove upstream
$ git remote add upstream https://github.com/ArtalkJS/Artalk.git
$ git remote -v
origin  git@github.com:achuanya/Artalk-ui.git (fetch)
origin  git@github.com:achuanya/Artalk-ui.git (push)
upstream        https://github.com/ArtalkJS/Artalk.git (fetch)
upstream        https://github.com/ArtalkJS/Artalk.git (push)
```

因为我 main 分支有非常多改动，比如评论框 UI 等等。那些我不想提交，这里必须创建一个干净的分支

#### 创建分支
```bash
$ git fetch upstream
# 基于上游仓库创建一个干净分支
$ git checkout -b clean-pr-branch upstream/master
branch 'clean-pr-branch' set up to track 'upstream/master'.
Switched to a new branch 'clean-pr-branch'
```

#### cherry-pick 指定 commit
```bash {2}
$ git cherry-pick 6302e4216cc5c1f34df49475ef99e81d883a2d79
CONFLICT (modify/delete): conf/artalk-ui-example.yml deleted in HEAD and modified in 6302e421 新增两个前端配置开关，用于控制列表头部显示).  Version 6302e421 (新增两个前端配置开关，用于控制列表头部显示) of conf/artalk-ui-example.yml left in tree.
Auto-merging conf/artalk.example.simple.yml
Auto-merging conf/artalk.example.yml
Auto-merging ui/artalk/src/defaults.ts
Auto-merging ui/artalk/src/style/list.scss
error: could not apply 6302e421... 新增两个前端配置开关，用于控制列表头部显示
hint: After resolving the conflicts, mark them with
hint: "git add/rm <pathspec>", then run
hint: "git cherry-pick --continue".
hint: You can instead skip this commit with "git cherry-pick --skip".
hint: To abort and get back to the state before "git cherry-pick",
hint: run "git cherry-pick --abort".
hint: Disable this message with "git config set advice.mergeConflict false"
```

#### 解决冲突

```bash
$ git status
On branch clean-pr-branch
Your branch is up to date with 'upstream/master'.

You are currently cherry-picking commit 6302e421.
  (fix conflicts and run "git cherry-pick --continue")
  (use "git cherry-pick --skip" to skip this patch)
  (use "git cherry-pick --abort" to cancel the cherry-pick operation)

Changes to be committed:
        modified:   conf/artalk.example.simple.yml
        modified:   conf/artalk.example.yml
        modified:   conf/artalk.example.zh-CN.yml
        modified:   conf/artalk.example.zh-TW.yml
        modified:   ui/artalk/src/defaults.ts
        modified:   ui/artalk/src/list/list.ts
        modified:   ui/artalk/src/plugins/list/count.ts
        modified:   ui/artalk/src/style/list.scss
        modified:   ui/artalk/src/types/config.ts

Unmerged paths:
  (use "git add/rm <file>..." as appropriate to mark resolution)
        deleted by us:   conf/artalk-ui-example.yml

$ git rm conf/artalk-ui-example.yml
rm 'conf/artalk-ui-example.yml'

$ git cherry-pick --continue
[clean-pr-branch 0b5de4d3] 新增两个前端配置开关，用于控制列表头部显示
 Date: Wed Nov 26 02:23:21 2025 +0800
 9 files changed, 61 insertions(+), 3 deletions(-)
 
 $ git push origin clean-pr-branch
Enumerating objects: 39, done.
Counting objects: 100% (39/39), done.
Delta compression using up to 16 threads
Compressing objects: 100% (20/20), done.
Writing objects: 100% (20/20), 2.75 KiB | 281.00 KiB/s, done.
Total 20 (delta 18), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (18/18), completed with 18 local objects.
remote: This repository moved. Please use the new location:
remote:   git@github.com:achuanya/artalk-ui.git
remote:
remote: Create a pull request for 'clean-pr-branch' on GitHub by visiting:
remote:      https://github.com/achuanya/artalk-ui/pull/new/clean-pr-branch
remote:
To github.com:achuanya/Artalk-ui.git
 * [new branch]        clean-pr-branch -> clean-pr-branch
```

大致意思就是上游没有这个文件 `conf/artalk-ui-example.yml` 这是我复制的备份配置，用处不大，删了然后推走

####  使用 GitHub CLI 创建 PR

```bash
$ gh auth login
? Where do you use GitHub? GitHub.com
? What is your preferred protocol for Git operations on this host? HTTPS
? Authenticate Git with your GitHub credentials? Yes
? How would you like to authenticate GitHub CLI? Login with a web browser

! First copy your one-time code: C42D-217C
Press Enter to open https://github.com/login/device in your browser...
✓ Authentication complete.
- gh config set -h github.com git_protocol https
✓ Configured git protocol
✓ Logged in as achuanya

$ gh pr create --repo ArtalkJS/Artalk --base master --head achuanya:clean-pr-branch

Creating pull request for achuanya:clean-pr-branch into master in ArtalkJS/Artalk

? Title (required) 新增两个界面配置开关，用于控制：左侧“评论数”、右侧“通知中心” 的显示控制
? Body <Received>
? What's next? Submit
https://github.com/ArtalkJS/Artalk/pull/1113
 ```

地址都给出了，说明 PR 已经创建好了   
不过 Artalk 官方已经断更几年了，审核过与否都不重要，就当玩了