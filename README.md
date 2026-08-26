# 今日可学

每天从 GitHub 搜一遍当下比较火、而且能学到东西的 AI / Agent 仓库，选出 **1–10 个**。不按 star 排行。

仓库：https://github.com/kele0808/daily-learnable

每天的结果写在：

- [`digests/README.md`](digests/README.md) — 所有日期的目录
- `digests/YYYY-MM-DD.md` — 人看的日报
- `digests/YYYY-MM-DD.json` — 网页用的数据

## 让 Cursor Automation 每天推到 GitHub

Cursor Automation 不会直接 `git push` 到 `main`。它会在这个 GitHub 仓库里**开一个 PR**，里面就是当天的 `digests/` 文件。你合并后，结果就在 GitHub 上。

1. 先在 Cursor 连上 GitHub（只做一次）  
   打开 [cursor.com/dashboard/integrations](https://cursor.com/dashboard/integrations) → GitHub → Connect。要用有权限的 GitHub 账号登录。

2. 打开 [cursor.com/automations/new](https://cursor.com/automations/new)

3. 填这些设置：
   - **Trigger**：Scheduled，每天一次（建议 09:00，时区 Asia/Shanghai）
   - **Repository**：选 **kele0808/daily-learnable**（必须选这个 GitHub 仓库，不要选 No repository）
   - **Tools**：打开 **Pull request creation**
   - **Permission**：Private 即可

4. 提示词原样粘贴：

```
把今天的「今日可学」日报写进 GitHub 仓库 kele0808/daily-learnable，不要只在对话里列仓库。

步骤：
1. 用 Asia/Shanghai 的今天日期，检查 digests/YYYY-MM-DD.md 是否已经存在。存在就停止，回复 already exists。
2. 运行 npm install && npm run digest。
3. 确认生成了 digests/YYYY-MM-DD.md、digests/YYYY-MM-DD.json，以及更新后的 digests/README.md。
4. 如果脚本失败，你自己按同样格式写这两个文件：JSON 字段与现有 digests/*.json 一致；Markdown 用中文，1–10 条，含链接和「为什么看」。
5. 只提交 digests/ 下的文件。不要改 src/ 或其它应用代码。
6. 开 PR，标题：日报 YYYY-MM-DD。描述里贴 Markdown 摘要。目标仓库是 kele0808/daily-learnable。

挑选标准：不要按 star 排行。要最近新建或仍在更新、描述清楚、能学到东西的 Agent / MCP / 编程 Agent / RAG / evals / skills。丢掉空壳和灌水。同一作者最多 1 个。
```

5. Save and activate。

每天跑完后，到 https://github.com/kele0808/daily-learnable/pulls 看新 PR，合并即可。

不想每天点合并的话，用下面的 GitHub Action，它会直接把文件 push 到 `main`。

## GitHub Action（自动 push 到 main）

仓库里已经有 [`.github/workflows/daily-digest.yml`](.github/workflows/daily-digest.yml)：每天上海时间 09:00 跑 `npm run digest`，有新文件就 commit 并 push 到 `main`。

第一次需要到仓库的 **Actions** 页允许 workflow 运行。也可以在 Actions 里点 **Run workflow** 立刻试一次。

## 本地运行

需要 Node.js 20+。

```bash
npm install
cp .env.example .env.local   # 可选：填入 GITHUB_TOKEN
npm run dev
```

打开 [http://127.0.0.1:3847](http://127.0.0.1:3847)。

手动生成今天的存档：

```bash
npm run digest
```
