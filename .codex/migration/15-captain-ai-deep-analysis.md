# Captain AI 功能深度分析（代码证据版）

## 1. 分析范围

本报告聚焦 Chatwoot 的 Captain AI 能力，覆盖：
- Assistant（智能客服）
- FAQ/Knowledge（回复知识库）
- Document（文档导入与 FAQ 生成）
- Scenarios（场景代理与路由）
- Guardrails / Response Guidelines（回答约束）
- Custom Tools（HTTP 工具扩展）
- Inboxes（投放到收件箱）
- Playground（调试）
- Copilot（坐席侧 AI 辅助）
- Tasks（rewrite/summarize/reply_suggestion/label_suggestion/follow_up）
- Preferences/Settings（模型与功能开关）
- Sidekiq（异步任务链路）

关键代码入口：
- 前端路由：`app/javascript/dashboard/routes/dashboard/captain/captain.routes.js`
- 后端路由：`config/routes.rb`（`api/v1/accounts/:id/captain/*`）
- 控制器：`enterprise/app/controllers/api/v1/accounts/captain/*`
- 模型：`enterprise/app/models/captain/*` + `enterprise/app/models/copilot_*`
- 任务服务：`lib/captain/*` 与 `enterprise/lib/enterprise/captain/*`
- 异步任务：`enterprise/app/jobs/captain/*`

---

## 2. 信息架构与入口

### 2.1 前端主路由（Captain 控制台）
Captain 主入口及子页：
- `captain_assistants_responses_index`：`/:assistantId/faqs`
- `captain_assistants_documents_index`：`/:assistantId/documents`
- `captain_tools_index`：`/:assistantId/tools`（V2）
- `captain_assistants_scenarios_index`：`/:assistantId/scenarios`（V2）
- `captain_assistants_playground_index`：`/:assistantId/playground`
- `captain_assistants_inboxes_index`：`/:assistantId/inboxes`
- `captain_assistants_responses_pending`：`/:assistantId/faqs/pending`
- `captain_assistants_settings_index`：`/:assistantId/settings`
- `captain_assistants_guardrails_index`：`/:assistantId/settings/guardrails`（V2）
- `captain_assistants_guidelines_index`：`/:assistantId/settings/guidelines`（V2）

证据：`app/javascript/dashboard/routes/dashboard/captain/captain.routes.js`

### 2.2 路由守卫与可见性
- 需要功能标记：`FEATURE_FLAGS.CAPTAIN` 或 `FEATURE_FLAGS.CAPTAIN_V2`
- 安装类型限制：Cloud / Enterprise
- 页面权限声明为 `administrator, agent`，但具体写入能力由后端策略二次约束

---

## 3. 功能清单（细粒度）

## 3.1 Assistants（助手管理）

### 可见功能
- 拉取助手列表并自动定位“最近活跃助手”
- 无助手时跳转创建页
- 创建助手（name、description、config）
- 更新助手基础配置
- 删除助手
- 查询内置+自定义可用工具元数据
- Playground 单助手调试调用

### 代码映射
- 前端：
  - `app/javascript/dashboard/routes/dashboard/captain/pages/AssistantsIndexPage.vue`
  - `app/javascript/dashboard/components-next/captain/pageComponents/assistant/CreateAssistantDialog.vue`
- API：
  - `app/javascript/dashboard/api/captain/assistant.js`
- 后端：
  - `enterprise/app/controllers/api/v1/accounts/captain/assistants_controller.rb`
- 模型：
  - `enterprise/app/models/captain/assistant.rb`

### 关键行为
- `assistant.config` 包含：`product_name/feature_faq/feature_memory/feature_citation/welcome_message/handoff_message/resolution_message/instructions/temperature`
- V2 模式下，助手是“orchestrator agent”，可 handoff 到 scenario agents

---

## 3.2 FAQs（Assistant Responses）

### 可见功能
- FAQ 列表（分页、搜索、按 assistant/document/status 过滤）
- 新增 FAQ（手工）
- 编辑 FAQ
- 删除 FAQ
- Pending FAQ 审核流（approve / delete）
- 批量 approve / 批量 delete

### 代码映射
- 前端：
  - `app/javascript/dashboard/routes/dashboard/captain/responses/Index.vue`
  - `app/javascript/dashboard/routes/dashboard/captain/responses/Pending.vue`
- API：`app/javascript/dashboard/api/captain/response.js`
- 批量 API：`app/javascript/dashboard/api/captain/bulkActions.js`
- 后端：
  - `enterprise/app/controllers/api/v1/accounts/captain/assistant_responses_controller.rb`
  - `enterprise/app/controllers/api/v1/accounts/captain/bulk_actions_controller.rb`
- 模型：`enterprise/app/models/captain/assistant_response.rb`

### 关键行为
- FAQ 向量检索：`Captain::AssistantResponse.search(query)`，底层 `embedding` + 近邻搜索
- FAQ 状态：`pending/approved`
- FAQ 变更后异步更新 embedding：`Captain::Llm::UpdateEmbeddingJob`

---

## 3.3 Documents（知识导入）

### 可见功能
- 文档列表（按 assistant 过滤）
- 新建文档：URL 或 PDF 上传
- 删除文档
- 查看关联 FAQ（Related Responses）

### 代码映射
- 前端：`app/javascript/dashboard/routes/dashboard/captain/documents/Index.vue`
- API：`app/javascript/dashboard/api/captain/document.js`
- 后端：`enterprise/app/controllers/api/v1/accounts/captain/documents_controller.rb`
- 模型：`enterprise/app/models/captain/document.rb`

### 关键行为
- 创建文档后触发爬取任务：`Captain::Documents::CrawlJob`
- 文档可用后触发 FAQ 生成：`Captain::Documents::ResponseBuilderJob`
- 支持：
  - 简单爬虫：`SimplePageCrawlService` + parser job
  - Firecrawl（有 API Key 时）
  - PDF 流水线：`PdfProcessingService`
- 文档配额校验：超限抛 `Captain::Document::LimitExceededError`

---

## 3.4 Scenarios（场景代理）

### 可见功能
- 场景列表（enabled）
- 新增/编辑/删除场景
- 场景指令中可引用工具链接 `tool://tool_id`
- 场景可批量选择删除（前端并发单删）

### 代码映射
- 前端：`app/javascript/dashboard/routes/dashboard/captain/assistants/scenarios/Index.vue`
- API：`app/javascript/dashboard/api/captain/scenarios.js`
- 后端：`enterprise/app/controllers/api/v1/accounts/captain/scenarios_controller.rb`
- 模型：`enterprise/app/models/captain/scenario.rb`

### 关键行为
- `before_save :resolve_tool_references` 自动从 instruction 中提取 tools
- `validate_instruction_tools` 校验工具合法性
- V2 下 scenario 会被编译为独立 agent 并与主 assistant 相互 handoff

---

## 3.5 Guardrails / Response Guidelines

### 可见功能
- 在助手设置内维护两类规则数组：
  - Guardrails（边界）
  - Response Guidelines（回答风格/格式）
- 支持新增/编辑/删除/搜索/批量删除

### 代码映射
- 前端：
  - `app/javascript/dashboard/routes/dashboard/captain/assistants/guardrails/Index.vue`
  - `app/javascript/dashboard/routes/dashboard/captain/assistants/guidelines/Index.vue`
- 后端存储：`captain_assistants.guardrails`、`captain_assistants.response_guidelines`
- 更新入口：`enterprise/app/controllers/api/v1/accounts/captain/assistants_controller.rb`

### 关键行为
- V2 prompt 渲染时直接注入，影响 agent 输出边界
- Prompt 模板：`enterprise/lib/captain/prompts/assistant.liquid` / `scenario.liquid`

---

## 3.6 Custom Tools（HTTP 扩展工具）

### 可见功能
- 新增/编辑/删除自定义工具
- 配置：endpoint、method、auth、参数 schema、请求模板、响应模板、启用状态

### 代码映射
- 前端：`app/javascript/dashboard/routes/dashboard/captain/tools/Index.vue`
- API：`app/javascript/dashboard/api/captain/customTools.js`
- 后端：`enterprise/app/controllers/api/v1/accounts/captain/custom_tools_controller.rb`
- 模型：`enterprise/app/models/captain/custom_tool.rb`
- 动态工具工厂：`enterprise/app/models/concerns/toolable.rb`
- 安全校验：`enterprise/app/models/concerns/safe_endpoint_validatable.rb`
- 执行器：`enterprise/lib/captain/tools/http_tool.rb`

### 关键行为
- endpoint 必须 HTTPS，禁止 localhost/IP/自身域名，限制 unicode host
- 请求执行前会做 DNS 解析 + 私网 IP 拦截
- 响应体限制 1MB，避免超大内容
- 自动注入上下文 Header（Account/Assistant/Conversation/Contact）

---

## 3.7 Inboxes（助手投放）

### 可见功能
- 绑定 inbox 到 assistant
- 解绑 inbox
- 查看当前绑定列表

### 代码映射
- 前端：`app/javascript/dashboard/routes/dashboard/captain/assistants/inboxes/Index.vue`
- API：`app/javascript/dashboard/api/captain/inboxes.js`
- 后端：`enterprise/app/controllers/api/v1/accounts/captain/inboxes_controller.rb`
- 关系模型：`enterprise/app/models/captain_inbox.rb`

### 关键行为
- `captain_inboxes.inbox_id` 全局唯一，意味着同一 inbox 只能绑定一个 assistant

---

## 3.8 Playground（离线调试）

### 可见功能
- 选定 assistant 后发送测试消息
- 支持 message history 上下文

### 代码映射
- 前端：`app/javascript/dashboard/routes/dashboard/captain/assistants/playground/Index.vue`
- API：`POST /captain/assistants/:id/playground`
- 后端：`assistants_controller#playground`

### 关键行为
- 走 `Captain::Llm::AssistantChatService`（非会话状态机）
- 适合提示词调试，不等价于真实会话自动回复链路

---

## 3.9 Conversation 自动回复链路（线上）

### 触发条件
- 会话 pending
- 收到 incoming message
- inbox 绑定了 captain assistant

### 代码链路
- Hook：`enterprise/app/services/enterprise/message_templates/hook_execution_service.rb`
- Job：`enterprise/app/jobs/captain/conversation/response_builder_job.rb`

### 关键行为
- V1：`AssistantChatService`
- V2：`Assistant::AgentRunnerService`（多 agent handoff）
- 返回 `conversation_handoff` 时转人工，并发 Out-of-office 模板
- 成功回复后计费（response usage +1）

---

## 3.10 Copilot（坐席侧助手）

### 可见功能
- 右侧 Copilot 面板
- 按 assistant 建立 thread
- 消息流展示 user/assistant/thinking
- 支持切换 assistant

### 代码映射
- 前端组件：
  - `app/javascript/dashboard/components-next/copilot/Copilot.vue`
  - `app/javascript/dashboard/components/copilot/CopilotContainer.vue`
- API：
  - `captain/copilot_threads`
  - `captain/copilot_threads/:id/copilot_messages`
- 后端控制器：
  - `enterprise/app/controllers/api/v1/accounts/captain/copilot_threads_controller.rb`
  - `enterprise/app/controllers/api/v1/accounts/captain/copilot_messages_controller.rb`
- Job：`enterprise/app/jobs/captain/copilot/response_job.rb`
- 服务：`enterprise/app/services/captain/copilot/chat_service.rb`

### 关键行为
- Copilot 工具集更大：搜索会话、联系人、文章、Linear issues 等
- 每次成功回复计入 Captain responses 使用量

---

## 3.11 Captain Tasks（编辑器 AI 能力）

### 可见功能
- rewrite（语法修复/语气改写/improve）
- summarize
- reply_suggestion
- label_suggestion
- follow_up（多轮追问优化）

### 代码映射
- API 控制器：`enterprise/app/controllers/api/v1/accounts/captain/tasks_controller.rb`
- 核心服务：
  - `lib/captain/rewrite_service.rb`
  - `lib/captain/summary_service.rb`
  - `lib/captain/reply_suggestion_service.rb`
  - `lib/captain/label_suggestion_service.rb`
  - `lib/captain/follow_up_service.rb`
  - 基类：`lib/captain/base_task_service.rb`
- 企业增强：`enterprise/lib/enterprise/captain/base_task_service.rb` + `reply_suggestion_service.rb`

### 关键行为
- 统一做 feature 与 API key 校验
- Cloud 下受 credits 限制
- reply_suggestion 企业版可挂 `SearchReplyDocumentationService`
- label_suggestion 带缓存（Redis）
- follow_up 维护 `follow_up_context`

---

## 3.12 Preferences / Settings（模型与功能开关）

### 可见功能
- 读取模型提供商、模型清单、功能开关
- 配置各 feature 选用模型
- 启停特定 Captain feature

### 代码映射
- 前端：`app/javascript/dashboard/routes/dashboard/settings/captain/Index.vue`
- Store(Pinia)：`app/javascript/dashboard/store/captain/preferences.js`
- API：`app/javascript/dashboard/api/captain/preferences.js`
- 后端：`app/controllers/api/v1/accounts/captain/preferences_controller.rb`

### 特征键
- `editor`
- `assistant`
- `copilot`
- `label_suggestion`
- `audio_transcription`
- `help_center_search`

---

## 3.13 API 响应契约（字段级）

以下字段来自 jbuilder，可直接作为 Java DTO / TypeScript interface 初稿。

### Assistant
- 字段：`id/account_id/name/description/config/guardrails/response_guidelines/created_at/updated_at`
- 证据：`enterprise/app/views/api/v1/models/captain/_assistant.json.jbuilder`

### Document
- 字段：`id/account_id/name/external_link/display_url/content/content_type/file_size/status/assistant/created_at/updated_at`
- 证据：`enterprise/app/views/api/v1/models/captain/_document.json.jbuilder`

### AssistantResponse (FAQ)
- 字段：`id/account_id/question/answer/status/assistant/documentable/created_at/updated_at`
- `documentable.type` 可能是：`Captain::Document` / `Conversation` / `User`
- 证据：`enterprise/app/views/api/v1/models/captain/_assistant_response.json.jbuilder`

### Scenario
- 字段：`id/title/description/instruction/tools/enabled/assistant_id/account_id/assistant/created_at/updated_at`
- 证据：`enterprise/app/views/api/v1/models/captain/_scenario.json.jbuilder`

### CustomTool
- 字段：`id/slug/title/description/endpoint_url/http_method/request_template/response_template/auth_type/auth_config/param_schema/enabled/account_id/created_at/updated_at`
- 证据：`enterprise/app/views/api/v1/models/captain/_custom_tool.json.jbuilder`

### CopilotThread / CopilotMessage
- Thread 字段：`id/title/user/assistant/account_id/created_at`
- Message 字段：`id/message/message_type/copilot_thread/account_id/created_at`
- 证据：
  - `enterprise/app/views/api/v1/models/captain/_copilot_thread.json.jbuilder`
  - `enterprise/app/views/api/v1/models/captain/_copilot_message.json.jbuilder`

---

## 4. 权限矩阵（真实后端策略）

- AssistantPolicy：
  - `index/show/playground`：agent + admin
  - `create/update/destroy/tools`：仅 admin
- ScenarioPolicy：
  - `index/show`：agent + admin
  - `create/update/destroy`：仅 admin
- CustomToolPolicy：
  - `index/show`：agent + admin
  - `create/update/destroy`：仅 admin
- TasksPolicy：rewrite/summarize/reply/label/follow_up 允许 agent + admin

证据：
- `enterprise/app/policies/captain/assistant_policy.rb`
- `enterprise/app/policies/captain/scenario_policy.rb`
- `enterprise/app/policies/captain/custom_tool_policy.rb`
- `app/policies/captain/tasks_policy.rb`

---

## 5. Feature Flag / 计划限制 / 配额

- flag：`CAPTAIN`、`CAPTAIN_V2`、`CAPTAIN_TASKS`
- 文档、responses 均有 usage limit
- Cloud/EE 的可见性与可用性并不完全一致（页面可见不等于可执行）
- 常见升级文案与 paywall 在前端有统一组件

关键代码：
- `app/javascript/dashboard/composables/useCaptain.js`
- `app/javascript/dashboard/components-next/captain/pageComponents/Paywall.vue`
- `enterprise/lib/enterprise/captain/base_task_service.rb`

---

## 6. Sidekiq 与异步任务全图

## 6.1 Captain 相关 Job
- `Captain::Conversation::ResponseBuilderJob`（default）
- `Captain::Copilot::ResponseJob`（default）
- `Captain::Documents::CrawlJob`（low）
- `Captain::Documents::ResponseBuilderJob`（low）
- `Captain::Tools::SimplePageCrawlParserJob`（low）
- `Captain::Tools::FirecrawlParserJob`（low）
- `Captain::Llm::UpdateEmbeddingJob`（low）
- `Captain::InboxPendingConversationsResolutionJob`（low）

## 6.2 定时触发关系
- `TriggerScheduledItemsJob` -> `Account::ConversationsResolutionSchedulerJob`
- 企业版 prepend 后补充：按 CaptainInbox 分发 `InboxPendingConversationsResolutionJob`

关键代码：
- `app/jobs/trigger_scheduled_items_job.rb`
- `app/jobs/account/conversations_resolution_scheduler_job.rb`
- `enterprise/app/jobs/enterprise/account/conversations_resolution_scheduler_job.rb`

---

## 7. 数据模型与状态

## 7.1 核心表
- `captain_assistants`
- `captain_documents`
- `captain_assistant_responses`
- `captain_scenarios`
- `captain_custom_tools`
- `captain_inboxes`
- `copilot_threads`
- `copilot_messages`

## 7.2 关键约束
- `captain_inboxes.inbox_id` 唯一（一个 inbox 仅一个 assistant）
- `captain_documents` 对 `assistant_id + external_link` 唯一
- `captain_custom_tools` 对 `account_id + slug` 唯一
- FAQ embedding 使用 pgvector 索引

---

## 8. Java + React 迁移建议（可落地）

## 8.1 后端（Java）拆分建议
- `captain-admin-service`：assistants/docs/faqs/scenarios/tools/inboxes/preferences
- `captain-runtime-service`：conversation autoreply / copilot / task APIs
- `captain-worker`：crawl/pdf/faq/embedding/auto-resolution（对标 Sidekiq）
- `captain-gateway`：统一鉴权、限流、feature flag

## 8.2 前端（React）模块化
- `captain/assistants`
- `captain/faqs`
- `captain/documents`
- `captain/scenarios`
- `captain/tools`
- `captain/inboxes`
- `captain/playground`
- `captain/settings`
- `copilot/panel`
- `captain-tasks`（编辑器 AI）

## 8.3 必须保证的行为一致性
- Handoff 语义：AI 主动转人工 + OOO 模板机制
- 状态一致性：pending/open/resolved 与消息写入时序
- 配额扣减时机：成功输出后扣减
- FAQ 向量检索召回逻辑
- 自定义工具安全规则（SSRF、私网、响应体大小）
- V1/V2 共存开关策略

---

## 9. 当前截图证据（Captain）

已存在并可复用：
- `.codex/migration/screenshots/local/authenticated/captain-assistants.png`
- `.codex/migration/screenshots/local/authenticated/captain-responses.png`
- `.codex/migration/screenshots/local/authenticated/captain-documents.png`
- `.codex/migration/screenshots/local/authenticated/captain-tools.png`
- `.codex/migration/screenshots/local/authenticated/captain-scenarios.png`
- `.codex/migration/screenshots/local/authenticated/captain-inboxes.png`
- `.codex/migration/screenshots/local/authenticated/captain-playground.png`
- `.codex/migration/screenshots/local/authenticated/captain-settings.png`
- `.codex/migration/screenshots/local/authenticated/captain-guardrails.png`
- `.codex/migration/screenshots/local/authenticated/captain-guidelines.png`

---

## 10. 未完全覆盖项（单独说明）

以下点位目前仅完成代码层分析，缺少“完整业务数据驱动”的可视化验证：
- Firecrawl 外部回调链路的端到端截图（依赖真实 Firecrawl key 与回调触发）
- Copilot 的所有工具分支（例如 Linear 搜索结果可视化）
- 多语言/多渠道（email/whatsapp/web）下 prompt 输出差异截图
- 大规模文档分页 FAQ 生成（`PaginatedFaqGeneratorService`）的实际运行截图

这些不影响架构迁移设计，但影响“视觉验收完整性”。建议在稳定测试数据下补 1 轮冒烟截图。
