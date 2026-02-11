# Migration Analysis Delivery Index

- 生成日期：2026-02-12
- 目录：`/Users/wangqi/git/wangqi/chatwoot-wq/.codex/migration`

## A. 核心交付文档

1. `01-system-functional-requirements.md`
- 系统功能需求基线（FR/NFR）

2. `02-granular-feature-catalog.md`
- 功能-路由-代码-截图细粒度清单（主验收文档）

3. `03-architecture-deep-dive.md`
- 前后端架构深度分析

4. `04-java-react-target-architecture.md`
- Java + React 目标架构设计

5. `05-migration-backlog-agent-ready.md`
- Agent 可执行迁移任务书

6. `06-acceptance-matrix.md`
- 迁移验收矩阵

7. `07-screenshot-index.md`
- 本地全量截图索引（可直接预览）

8. `08-route-and-code-evidence-catalog.md`
- 路由与代码证据总目录

9. `09-omission-audit.md`
- 遗漏项审计（未覆盖控制器分组与清单）

10. `10-api-surface-gap-plan.md`
- 剩余 API 面迁移补齐计划（按控制器逐项拆任务）

11. `11-missing-controller-endpoint-map.md`
- 未覆盖控制器与实际路由端点映射（含 route count）

12. `12-high-priority-gap-list.md`
- 遗漏项高优先级 Top 列表（按风险排序）

13. `13-sidekiq-deep-analysis.md`
- Sidekiq 专项深度分析（配置态、代码态、运行态、迁移验收）

## B. 代码证据索引

1. `backend-routes-clean.txt`
- Rails 实际路由输出（701）

2. `backend-routes-key-domains.txt`
- 核心域路由摘录

3. `backend-route-stats.md`
- 后端路由统计

4. `frontend-route-files.txt`
- 前端路由文件清单（33）

5. `frontend-route-signals.txt`
- 前端 path/name 信号清单（483）

6. `frontend-route-stats.md`
- 前端路由统计

7. `backend-controller-files.txt`
- 控制器清单（197）

8. `model-files.txt`
- 模型清单（151）

9. `service-files.txt`
- 服务清单（238）

10. `codebase-inventory.md`
- 代码库规模汇总

11. `sidekiq-job-files.txt`
- Sidekiq Job 文件清单（异步任务覆盖证据）

## C. 运行环境文件

1. `docker-chatwoot-official.yml`
2. `.env.chatwoot-demo`

## D. 明早执行建议

1. 以 `02-granular-feature-catalog.md` 作为功能验收主单。
2. 以 `05-migration-backlog-agent-ready.md` 直接拆派重构任务。
3. 以 `06-acceptance-matrix.md` 作为阶段闸门。
