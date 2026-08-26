# 今日可学

每天从 GitHub 搜一遍当下比较火、而且能学到东西的 AI / Agent 仓库，选出 **1–10 个**。不按 star 排行。

每天的结果会写进仓库：

- [`digests/README.md`](digests/README.md) — 所有日期的目录
- `digests/YYYY-MM-DD.md` — 人看的日报
- `digests/YYYY-MM-DD.json` — 网页用的数据

网页优先读这些文件。没有存档时才现场搜 GitHub。

## 本地运行

需要 Node.js 20+。

```bash
npm install
cp .env.example .env.local   # 可选：填入 GITHUB_TOKEN
npm run dev
```

打开 [http://127.0.0.1:3847](http://127.0.0.1:3847)。

手动生成并写入今天的存档：

```bash
npm run digest
# 指定日期：npx tsx scripts/write-digest.ts 2026-08-26
# 覆盖已有文件：npx tsx scripts/write-digest.ts --force
```

不配 Token 也能跑，但 GitHub 匿名搜索很容易限流。Token 在 [GitHub Fine-grained tokens](https://github.com/settings/tokens) 创建即可。

## 让 Cursor Automation 每天写入这个仓库

1. 打开 [cursor.com/automations/new](https://cursor.com/automations/new)
2. 触发器：**Scheduled**，每天一次（建议上海时间 09:00）
3. 仓库：选 **本仓库**（必须挂上，否则写不进 git）
4. 打开 **Pull request creation**
5. 提示词用下面这一段：

```
把今天的「今日可学」日报写进这个仓库，不要只在对话里列仓库。

步骤：
1. 用 Asia/Shanghai 的今天日期，检查 digests/YYYY-MM-DD.md 是否已经存在。存在就停止，回复 already exists。
2. 运行 npm install && npm run digest。需要的话可用环境里的 GITHUB_TOKEN。
3. 确认生成了 digests/YYYY-MM-DD.md、digests/YYYY-MM-DD.json，以及更新后的 digests/README.md。
4. 如果脚本失败，你自己按同样格式写这两个文件：JSON 必须是 DigestResult（date/picks/count 等字段与现有 json 一致）；Markdown 用中文，1–10 条，含链接和「为什么看」。
5. 只提交 digests/ 下的文件。不要改 src/ 或其它应用代码。
6. 开 PR，标题：日报 YYYY-MM-DD。描述里贴 Markdown 摘要。

挑选标准：不要按 star 排行。要最近新建或仍在更新、描述清楚、能学到东西的 Agent / MCP / 编程 Agent / RAG / evals / skills。丢掉空壳和灌水。同一作者最多 1 个。
```

合并 PR 之后，仓库里就多了一天的日报，网页刷新也会显示「已写入仓库」。
