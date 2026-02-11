# 迁移验收矩阵（功能/代码/截图）

- 版本：v1.0
- 日期：2026-02-12
- 基线文档：`/Users/wangqi/git/wangqi/chatwoot-wq/.codex/migration/02-granular-feature-catalog.md`

## 1. 验收规则

1. 每个功能必须满足：页面可达 + API 正常 + 关键动作成功。
2. 每个功能必须提供：代码引用 + 接口验证 + 页面截图。
3. 如为 EE 或开关控制功能，需标注“条件可达”。

## 2. 核心功能验收项

| 模块 | 功能ID范围 | 必测动作 | 证据 |
|---|---|---|---|
| 认证 | AUTH-01 ~ AUTH-03 | 登录、注册、进入 dashboard | 页面截图 + 登录接口返回 |
| 会话 | CONV-01 ~ CONV-12 | 列表筛选、发消息、分配、标签、状态切换 | 页面截图 + conversations/messages API |
| 协作 | COLLAB-01 ~ COLLAB-03 | inbox 查看、通知读写、搜索 | 页面截图 + notifications/search API |
| CRM | CRM-01 ~ CRM-06 | 联系人 CRUD、备注、标签、关联 | 页面截图 + contacts API |
| 报表 | RPT-01 ~ RPT-08 | overview/conversation/agent/team/inbox/label/csat/sla | 页面截图 + v2 reports API |
| Campaign | CMP-01 ~ CMP-04 | 列表、过滤、创建任务入口 | 页面截图 + campaigns API |
| Help Center | HC-01 ~ HC-05 | portal/category/article 管理 | 页面截图 + portals/categories/articles API |
| 设置 | SET-01 ~ SET-18 | 各设置页可达+增删改查 | 页面截图 + 对应 settings API |
| Captain | CPT-01 ~ CPT-10 | assistants/documents/scenarios/tools/playground | 页面截图 + captain API |
| Super Admin | SA-01 ~ SA-21 | 超管后台 CRUD 与监控页访问 | 页面截图 + super_admin 路由 |
| Sidekiq 异步体系 | SA-15 ~ SA-21 | 队列可见、重试/死信可见、调度可证明 | Sidekiq Web 截图 + `config/sidekiq.yml` + `config/schedule.yml` + 运行态采样 |

## 3. 自动化验收建议

### 3.1 接口回归
- 从 `backend-routes-key-domains.txt` 抽取关键 endpoint
- 为每个 endpoint 建最小正向回归

### 3.2 页面回归
- 以 `02-granular-feature-catalog.md` 的路由与截图为 baseline
- Playwright 对齐视角截图，按像素阈值比对

### 3.3 数据一致性
- Conversation/Message/Contact/Inboxes 迁移后行数与抽样记录比对
- 报表聚合与源数据差异阈值 < 1%

### 3.4 Sidekiq 专项
- 队列优先级与旧系统一致（`critical > high > medium > default > low` 至少保持逻辑分层）
- Cron 任务迁移后周期一致（对齐 `config/schedule.yml`）
- 关键作业链路可重试且支持幂等（Webhook/事件分发/通知）
- 至少可观测队列深度、重试量、死信量

## 4. 上线前阻断项（Go/No-Go）

1. 登录、会话、消息主链路任一失败 -> No-Go
2. 租户隔离测试失败 -> No-Go
3. 核心报表偏差 > 1% -> No-Go
4. 回滚脚本未演练 -> No-Go
5. Sidekiq 关键队列无消费者或持续堆积 -> No-Go

## 5. 验收产物清单

1. API 回归报告
2. 页面截图对比报告
3. 数据校验报告
4. 性能压测报告
5. 上线与回滚记录
