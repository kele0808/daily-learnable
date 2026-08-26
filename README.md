# 今日可学

每天从 GitHub 搜一遍当下比较火、而且能学到东西的 AI / Agent 仓库，选出 **1–10 个**。不按 star 排行。

关注的方向：

- Agent 框架、编程 Agent、多智能体
- MCP
- RAG、评测 / 观测
- Agent Skill

同一天的结果大约缓存 6 小时。时区按 **Asia/Shanghai**。

## 本地运行

需要 Node.js 20+。

```bash
npm install
cp .env.example .env.local   # 可选：填入 GITHUB_TOKEN
npm run dev
```

打开 [http://127.0.0.1:3847](http://127.0.0.1:3847)。

不配 Token 也能跑，但 GitHub 匿名搜索很容易限流。Token 在 [GitHub Fine-grained tokens](https://github.com/settings/tokens) 创建即可，不必开额外权限。

JSON 接口：

```
GET /api/digest
GET /api/digest?date=2026-08-26
```

## 把它做成 Cursor Automation

1. 打开 [cursor.com/automations/new](https://cursor.com/automations/new)
2. 触发器选 **Scheduled**，每天一次（例如上海时间 09:00）
3. 仓库可以选 **No repository**；如果希望 Agent 直接读这个项目，挂上本仓库
4. 工具按需打开：Send to Slack，或 Comment on Pull Request
5. 提示词用下面这一段：

```
每天从 GitHub 找 1–10 个当下值得学习的 AI / Agent 仓库。

要求：
- 不要按 star 排行。star 可以提一句，但不能当排序依据。
- 重点：最近新建或最近仍在更新、描述清楚、能学到东西。
- 方向优先：coding agent、agent 框架、MCP、multi-agent、RAG、evals、agent skills。
- 丢掉空描述、作业风、明显灌水、以及人人都已经知道的老牌巨仓（除非它这几天刚发生值得看的新变化）。
- 同一作者最多 1 个，主题尽量分散。
- 每个仓库写：名字和链接、它是做什么的、为什么今天值得看、适合学哪一块。
- 用中文输出，控制在 1–10 条。

搜索时用 GitHub 仓库搜索，例如：
- topic:ai-agent fork:false archived:false pushed:>过去14天
- topic:mcp OR "model context protocol" created:>过去40天
- "coding agent" OR "llm agent" OR "computer use" created:>过去40天
```

## 筛选怎么做

1. 并行搜 4 组 GitHub 仓库（Agent、MCP、编程 Agent、更宽的 agentic/RAG）
2. 过滤 fork、空仓库、描述太短、作业风名字
3. 按「新 + 主题相关 + 能读懂」打分，star 几乎不参与
4. 用当天日期做随机种子，再按作者和主题去重，留下 1–10 个
