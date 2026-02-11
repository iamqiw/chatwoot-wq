# Java + React 迁移任务书（Agent 可执行版）

- 版本：v1.0
- 日期：2026-02-12
- 目标：把重构任务拆成可并行、可验收、可追踪的执行单元

## 1. 使用方式

- 功能基线：`/Users/wangqi/git/wangqi/chatwoot-wq/.codex/migration/02-granular-feature-catalog.md`
- 架构基线：`/Users/wangqi/git/wangqi/chatwoot-wq/.codex/migration/03-architecture-deep-dive.md`
- 目标架构：`/Users/wangqi/git/wangqi/chatwoot-wq/.codex/migration/04-java-react-target-architecture.md`

每个任务单元必须输出：
1. 代码变更
2. 契约说明（请求/响应/事件）
3. 验收证据（测试与截图）

## 2. 阶段总览

| 阶段 | 目标 | 退出条件 |
|---|---|---|
| P0 | 基础设施与契约冻结 | 路由契约、领域边界、数据字典冻结 |
| P1 | 认证与会话核心闭环 | 登录 + 会话列表 + 发消息 + 联系人可用 |
| P2 | 设置/自动化/渠道 | 收件箱、自动化、集成配置可用 |
| P3 | 报表与超管 | 报表与 Super Admin 关键能力可用 |
| P4 | Enterprise 增量 | Captain/审计/自定义角色/计费完成 |
| P5 | 切换与优化 | 生产切流 + 回滚验证完成 |

## 3. Epic 与任务拆解

### EPIC-AUTH（身份与权限）

A1. 统一认证服务
- 输入：`AUTH-*` 需求条目
- 输出：登录/登出/刷新 token/MFA API
- DoD：兼容旧接口响应字段

A2. 账户上下文与租户隔离
- 输入：`set_active_account` 相关流程
- 输出：租户上下文中间件
- DoD：跨租户访问全部被拒绝

A3. 角色权限迁移
- 输入：policy 与 `meta.permissions`
- 输出：权限矩阵与权限校验组件
- DoD：核心页面权限一致

### EPIC-CONV（会话与消息）

C1. 会话列表与筛选
- 覆盖：`CONV-01` ~ `CONV-08`

C2. 消息生命周期
- 覆盖：发送/更新/删除/草稿/附件

C3. 会话协作能力
- 覆盖：分配、标签、状态、优先级

C4. 实时同步
- 覆盖：消息与通知事件广播

### EPIC-CRM（联系人与公司）

R1. 联系人 CRUD 与过滤
R2. 联系人备注/标签/关系
R3. 自定义属性与筛选器

### EPIC-INBOX（渠道与收件箱）

I1. 收件箱管理与成员
I2. 渠道配置框架（Web/Email/WhatsApp/SMS...）
I3. 回调入口与签名校验

### EPIC-AUTO（自动化）

T1. 规则引擎与规则管理
T2. 宏与快捷回复
T3. Agent Bot 与 webhook 触发
T4. 分配策略与容量策略

### EPIC-RPT（报表）

P1. v2 报表聚合接口
P2. CSAT/SLA 指标
P3. 报表导出任务

### EPIC-ADMIN（超管与平台）

M1. Super Admin 核心页面
M2. Platform API
M3. Sidekiq/任务监控替代方案

### EPIC-EE（企业增量）

E1. Custom Roles
E2. Audit Logs
E3. Captain 全链路
E4. Billing/Subscription

## 4. Agent 执行模板

```text
任务：实现 [功能ID]
输入文档：02-granular-feature-catalog.md 第 [模块]
代码位置：
- 前端：<react path>
- 后端：<java path>
输出要求：
1) API 定义与实现
2) 页面路由与交互
3) 集成测试
4) 验收截图（与基线同视角）
完成标准：
- 通过测试
- 接口契约兼容
- 验收截图齐全
```

## 5. 并行执行建议

1. 小组A：`AUTH + CONV`
2. 小组B：`CRM + INBOX`
3. 小组C：`AUTO + RPT`
4. 小组D：`ADMIN + EE`

## 6. 风险闸门（每阶段必过）

1. 契约差异报告必须为 0 阻断项
2. 租户隔离必须通过自动化测试
3. 核心链路性能不得低于基线阈值
4. 回滚脚本必须先演练后上线
