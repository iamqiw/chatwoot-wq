# Sidekiq 深度分析（运行态 + 代码态 + 迁移要求）

- 版本：v1.0
- 日期：2026-02-12
- 环境：`chatwoot/chatwoot:latest` 本地 Docker

## 1. 证据源

1. 配置文件
- `/Users/wangqi/git/wangqi/chatwoot-wq/config/sidekiq.yml`
- `/Users/wangqi/git/wangqi/chatwoot-wq/config/initializers/sidekiq.rb`
- `/Users/wangqi/git/wangqi/chatwoot-wq/config/schedule.yml`

2. 运行态采样（2026-02-12）
- `processed=152`
- `failed=8`
- `enqueued=0`
- `retry_size=0`
- `scheduled_size=1`
- `dead_size=2`
- `workers_size=0`
- queues: `critical/default/low/purgable/scheduled_jobs/...`

3. 作业代码盘点
- Job 文件数：`97`（见 `sidekiq-job-files.txt`）
- `queue_as` 分布：
  - `low: 30`
  - `default: 20`
  - `scheduled_jobs: 15`
  - `medium: 8`
  - `async_database_migration: 4`
  - `high: 3`
  - `housekeeping: 3`
  - `purgable: 3`
  - `critical: 2`
  - `mailers: 1`
  - `deferred: 1`
- `retry_on` 声明次数：`10`

## 2. 队列拓扑与优先级

来自 `config/sidekiq.yml`，按优先级顺序：
`critical > high > medium > default > mailers > ... > scheduled_jobs > deferred > purgable > housekeeping > async_database_migration ...`

结论：
1. 该系统已明确采用“多队列优先级”模型。
2. 实时与事件类作业（`critical/high`）应优先保障。
3. 迁移时不可退化为单队列，否则会引起消息/通知延迟。

## 3. Sidekiq Cron 调度任务

来自 `config/schedule.yml`，关键周期任务包括：
1. `TriggerScheduledItemsJob`（每 5 分钟）
2. `Inboxes::FetchImapEmailInboxesJob`（每分钟）
3. `Inboxes::BulkAutoAssignmentJob`（每 15 分钟）
4. `AutoAssignment::PeriodicAssignmentJob`（每 30 分钟）
5. `Internal::DeleteAccountsJob`（每日）
6. `Notification::RemoveOldNotificationJob`（每日）
7. `Internal::RemoveOrphanConversationsJob`（每 12 小时）

迁移要求：这些调度必须迁移为可观测、可重试、可暂停的任务体系。

## 4. 核心作业链路（业务影响大）

1. 消息与实时链路
- `ActionCableBroadcastJob`（critical）
- `EventDispatcherJob`（critical）
- `Conversations::ActivityMessageJob`（high）

2. 自动化与外部回调
- `HookJob`（medium）
- `WebhookJob`（medium）
- `AgentBots::WebhookJob`（high）

3. 邮件与通知
- `ConversationReplyEmailJob`（mailers）
- `Notification::*` 作业族（default/low/purgable）

4. 渠道同步与拉取
- `Channels::Whatsapp::TemplatesSync*`（low）
- `Inboxes::FetchImap*`（scheduled_jobs）

5. 企业能力（EE）
- `Sla::*` 作业（scheduled_jobs/medium）
- `Captain::*` 作业（default/low + retry_on）

## 5. Sidekiq Web 运行页证据

截图（Super Admin 可访问）：
- `/Users/wangqi/git/wangqi/chatwoot-wq/.codex/migration/screenshots/local/super-admin/extended/sidekiq-home.png`
- `/Users/wangqi/git/wangqi/chatwoot-wq/.codex/migration/screenshots/local/super-admin/extended/sidekiq-queues.png`
- `/Users/wangqi/git/wangqi/chatwoot-wq/.codex/migration/screenshots/local/super-admin/extended/sidekiq-busy.png`
- `/Users/wangqi/git/wangqi/chatwoot-wq/.codex/migration/screenshots/local/super-admin/extended/sidekiq-scheduled.png`
- `/Users/wangqi/git/wangqi/chatwoot-wq/.codex/migration/screenshots/local/super-admin/extended/sidekiq-retries.png`
- `/Users/wangqi/git/wangqi/chatwoot-wq/.codex/migration/screenshots/local/super-admin/extended/sidekiq-dead.png`

`/monitoring/sidekiq/cron` 当前返回 `404`（路由插件页在该镜像下未正常提供 UI）。

## 6. 重构到 Java 的映射建议

1. 队列模型
- 保留至少 `critical/high/medium/default/low/scheduled/housekeeping/purgable` 逻辑分层。

2. 调度模型
- 将 `schedule.yml` 迁移到统一调度中心（Quartz 或平台调度），并保留原 cron 表达式语义。

3. 幂等与重试
- 为所有 webhook/channel/callback 作业定义幂等键。
- 对 `retry_on` 语义进行一对一映射（等待时间、重试上限、异常类型）。

4. 观测性
- 指标：队列深度、处理耗时、失败率、死信量。
- 告警：dead/retry 阈值、关键队列堆积、调度失活。

## 7. 验收要求（Sidekiq 专项）

1. 关键队列策略存在且生效（优先级可证明）。
2. Cron 任务全部迁移并按周期触发。
3. 关键作业链路具备重试与幂等保障。
4. 运行监控页可查看：队列、重试、死信、计划任务。
5. 与基线一致：`critical/high` 业务事件不得被低优先级任务饿死。

## 8. 当前做不到项（Sidekiq 专项）

1. Sidekiq Cron Web UI（`/monitoring/sidekiq/cron`）在当前镜像返回 404。
- 影响：无法通过 UI 验证 cron 列表，只能通过 `config/schedule.yml` + 运行队列状态证明调度存在。

2. 无法在当前环境主动制造大量真实业务流量。
- 影响：只能给出采样态（processed/failed/dead 等），无法给出生产负载下的队列饱和曲线。
