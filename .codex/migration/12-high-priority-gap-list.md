# High Priority API Risk List (Top 25)

- Generated from: `/Users/wangqi/git/wangqi/chatwoot-wq/.codex/migration/11-missing-controller-endpoint-map.md`
- Rule: route_count + external/API risk weight
- Note: this file is now a migration priority/risk ranking (not missing coverage). Missing controllers are `0`.

| Rank | Score | Domain | Controller | Route Count | Why First |
|---:|---:|---|---|---:|---|
| 1 | 21 | Enterprise Overlay API | `/Users/wangqi/git/wangqi/chatwoot-wq/enterprise/app/controllers/enterprise/api/v1/accounts/conversations_controller.rb` | 21 | high endpoint surface |
| 2 | 13 | Enterprise Overlay API | `/Users/wangqi/git/wangqi/chatwoot-wq/enterprise/app/controllers/enterprise/api/v1/accounts/inboxes_controller.rb` | 13 | high endpoint surface |
| 3 | 12 | Public API | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/public/api/v1/inboxes_controller.rb` | 8 | external contract / callback risk |
| 4 | 12 | Enterprise Overlay API | `/Users/wangqi/git/wangqi/chatwoot-wq/enterprise/app/controllers/enterprise/api/v1/accounts/portals_controller.rb` | 12 | high endpoint surface |
| 5 | 11 | Platform API | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/platform/api/v1/users_controller.rb` | 7 | external contract / callback risk |
| 6 | 11 | Platform API | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/platform/api/v1/agent_bots_controller.rb` | 7 | external contract / callback risk |
| 7 | 11 | Account API v1 | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/api/v1/accounts/webhooks_controller.rb` | 5 | external contract / callback risk |
| 8 | 10 | Public API | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/public/api/v1/inboxes/conversations_controller.rb` | 6 | external contract / callback risk |
| 9 | 10 | Platform API | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/platform/api/v1/accounts_controller.rb` | 6 | external contract / callback risk |
| 10 | 10 | Enterprise Super Admin | `/Users/wangqi/git/wangqi/chatwoot-wq/enterprise/app/controllers/enterprise/super_admin/accounts_controller.rb` | 10 | high endpoint surface |
| 11 | 10 | Account API v1 | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/api/v1/accounts/callbacks_controller.rb` | 4 | high endpoint surface |
| 12 | 8 | Public API | `/Users/wangqi/git/wangqi/chatwoot-wq/enterprise/app/controllers/enterprise/public/api/v1/portals/articles_controller.rb` | 4 | external contract / callback risk |
| 13 | 8 | Public API | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/public/api/v1/portals/articles_controller.rb` | 4 | external contract / callback risk |
| 14 | 8 | Public API | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/public/api/v1/inboxes/messages_controller.rb` | 4 | external contract / callback risk |
| 15 | 8 | Public API | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/public/api/v1/inboxes/contacts_controller.rb` | 4 | external contract / callback risk |
| 16 | 7 | Public API | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/public/api/v1/portals_controller.rb` | 3 | external contract / callback risk |
| 17 | 7 | Public API | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/public/api/v1/csat_survey_controller.rb` | 3 | external contract / callback risk |
| 18 | 7 | Platform API | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/platform/api/v1/account_users_controller.rb` | 3 | external contract / callback risk |
| 19 | 6 | Reporting API v2 | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/api/v2/accounts/live_reports_controller.rb` | 2 | high endpoint surface |
| 20 | 6 | Public API | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/public/api/v1/portals/categories_controller.rb` | 2 | external contract / callback risk |
| 21 | 6 | Enterprise Overlay API | `/Users/wangqi/git/wangqi/chatwoot-wq/enterprise/app/controllers/enterprise/api/v1/accounts/agents_controller.rb` | 6 | high endpoint surface |
| 22 | 6 | Account API v1 | `/Users/wangqi/git/wangqi/chatwoot-wq/enterprise/app/controllers/api/v1/accounts/agent_capacity_policies_controller.rb` | 6 | high endpoint surface |
| 23 | 6 | Account API v1 | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/api/v1/accounts/custom_filters_controller.rb` | 6 | high endpoint surface |
| 24 | 6 | Account API v1 | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/api/v1/accounts/whatsapp/authorizations_controller.rb` | 1 | external contract / callback risk |
| 25 | 6 | Account API v1 | `/Users/wangqi/git/wangqi/chatwoot-wq/app/controllers/api/v1/accounts/twitter/authorizations_controller.rb` | 1 | external contract / callback risk |
