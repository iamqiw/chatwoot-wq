# Chatwoot 系统功能需求文档（重构前基线，完整版）

- 版本：v2.0
- 日期：2026-02-12
- 适用工程：Chatwoot -> Java + React 重构
- 基础证据：
  - 功能与截图：`/Users/wangqi/git/wangqi/chatwoot-wq/.codex/migration/02-granular-feature-catalog.md`
  - 架构深潜：`/Users/wangqi/git/wangqi/chatwoot-wq/.codex/migration/03-architecture-deep-dive.md`
  - 路由基线：`/Users/wangqi/git/wangqi/chatwoot-wq/.codex/migration/backend-routes-clean.txt`

## 1. 文档目标

本文件定义重构工程必须保留的系统能力与行为，不讨论实现细节，仅约束“必须做到什么”。

## 2. 需求分级

- `L1` 核心交易链路：登录、会话、消息、联系人、收件箱
- `L2` 运营效率链路：自动化、报表、帮助中心、集成
- `L3` 管理与企业链路：超管、审计、自定义角色、Captain、计费

## 3. 功能需求（FR）

### 3.1 认证与权限（AUTH）

1. FR-AUTH-001：系统必须支持账号登录、登出、注册、密码重置与邮箱确认。
2. FR-AUTH-002：系统必须支持多租户账号上下文切换（active account）。
3. FR-AUTH-003：系统必须支持 MFA（启用、验证、禁用、恢复码）。
4. FR-AUTH-004：系统必须支持角色权限控制，至少覆盖 admin/agent。
5. FR-AUTH-005：系统应支持企业扩展权限（自定义角色）。

### 3.2 会话与消息（CONV）

1. FR-CONV-001：支持会话列表与多维筛选（inbox/label/team/custom view/mentions/unattended/participating）。
2. FR-CONV-002：支持会话状态流转（open/pending/resolved）与优先级管理。
3. FR-CONV-003：支持消息发送、编辑、删除、重试、草稿、附件。
4. FR-CONV-004：支持会话分配与协作（坐席/团队/标签/参与者）。
5. FR-CONV-005：支持实时同步（消息、typing、通知、状态）。

### 3.3 联系人与 CRM（CRM）

1. FR-CRM-001：支持联系人 CRUD、查询与过滤。
2. FR-CRM-002：支持联系人标签、备注、会话关联与收件箱关联。
3. FR-CRM-003：支持自定义属性定义和过滤器。
4. FR-CRM-004：企业版支持公司实体与关联关系。

### 3.4 收件箱与渠道（INBOX）

1. FR-INBOX-001：支持收件箱 CRUD 与成员管理。
2. FR-INBOX-002：支持网站、小组件、邮件、社媒、IM、SMS 等渠道类型。
3. FR-INBOX-003：支持渠道授权、回调与消息状态同步。
4. FR-INBOX-004：支持收件箱级策略（分配、工作时段、模板等）。

### 3.5 自动化（AUTO）

1. FR-AUTO-001：支持自动化规则管理与触发执行。
2. FR-AUTO-002：支持宏（Macros）管理与执行。
3. FR-AUTO-003：支持快捷回复（Canned Responses）。
4. FR-AUTO-004：支持 Agent Bot 与 Webhook Bot 触发。
5. FR-AUTO-005：支持分配策略与容量策略。

### 3.6 报表分析（RPT）

1. FR-RPT-001：支持 overview / conversation / agent / team / inbox / label 报表。
2. FR-RPT-002：支持 CSAT 报表。
3. FR-RPT-003：企业版支持 SLA 报表。
4. FR-RPT-004：支持报表导出与定期统计任务。

### 3.7 帮助中心（HC）

1. FR-HC-001：支持 portal 管理。
2. FR-HC-002：支持分类与文章管理、重排、语言管理。
3. FR-HC-003：支持公开访问与检索。

### 3.8 集成与扩展（INT）

1. FR-INT-001：支持账户级 webhook 管理。
2. FR-INT-002：支持 Slack/Linear/Shopify/Notion 等集成入口。
3. FR-INT-003：支持平台 API 与公共 API。

### 3.9 超级管理员（SA）

1. FR-SA-001：支持超管后台登录与导航。
2. FR-SA-002：支持实例级账户和用户管理。
3. FR-SA-003：支持平台应用与安装配置管理。
4. FR-SA-004：支持 Sidekiq 与实例健康监控入口。

### 3.10 企业能力（EE）

1. FR-EE-001：支持自定义角色与权限。
2. FR-EE-002：支持审计日志。
3. FR-EE-003：支持 Captain 助手（assistants/documents/scenarios/tools/playground）。
4. FR-EE-004：支持计费与订阅状态感知。

## 4. 非功能需求（NFR）

1. NFR-SEC-001：租户数据隔离必须强制执行。
2. NFR-SEC-002：关键写操作必须有审计能力（EE）。
3. NFR-PERF-001：会话列表与消息发送响应满足交互时延要求。
4. NFR-REL-001：异步任务可重试、可观测、可追踪。
5. NFR-OBS-001：核心链路必须具备日志、指标、追踪三件套。
6. NFR-COMP-001：对外 API 契约在迁移阶段保持兼容。

## 5. 接口兼容要求

1. 保留 `/api/v1/accounts/*` 主要接口行为。
2. 保留 `/api/v2/accounts/*` 报表接口行为。
3. 保留 `/platform/api/v1/*` 与 `/public/api/v1/*`。
4. 错误码语义、分页语义、筛选语义保持一致。

## 6. 验收基准

- 功能验收基线：`02-granular-feature-catalog.md`
- 截图证据：`07-screenshot-index.md`
- 路由证据：`backend-routes-clean.txt` 与 `frontend-route-signals.txt`

验收通过条件：
1. L1 功能全部通过。
2. L2 功能无阻断缺陷。
3. L3 功能按计划分阶段启用并具备开关。
4. 回归报告、截图报告、数据一致性报告齐备。

## 7. 变更管理要求

1. 任何需求变更必须更新功能ID与验收矩阵。
2. 任何接口变更必须补充兼容说明与回滚方案。
3. 任何企业版差异必须标注 OSS/EE 边界。
