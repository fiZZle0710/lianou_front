# 功能清单逐条修改实现说明

- 日期：2026-09-15
- 范围：围绕"益联盟"项目（Flask + SQLAlchemy 后端）补全前端缺失接口，覆盖项目申请、成员管理、活动、评价标签、作品分享、浏览记录、用户搜索、项目作品共 9 条需求
- 目标：从用户需求到代码实现逐条对照说明，包含需求描述、实现方案、修改文件、核心代码逻辑、请求/响应结构、测试验证结果

---

## 目录

1. 需求1：GET /projects/<id>/applications — 项目 owner 看待审申请列表
2. 需求2：GET /projects/<id>/members — 成员列表
3. 需求3：GET /events + GET /events/<id> + POST /events/<id>/join — 活动路由
4. 需求4：GET /rating-tags — 评价标签字典
5. 需求5：POST /works/<id>/share — 分享计数
6. 需求6：DELETE /profile/views/works — 删除浏览记录
7. 需求7：GET /users/search — 用户搜索
8. 需求8：分享记录新表 — 暂缓
9. 需求9：GET /projects/<id>/works — 项目作品
10. 总结表

---

## 需求1：GET /projects/<id>/applications — 项目 owner 看待审申请列表

### 需求描述
此前接口体系中只有 POST approve/reject（处理申请）和 GET my-applications（我发出的申请），缺少一个让项目 owner 查看"别人申请我项目"的列表接口。approve/reject 接口需要传入 application_id，但前端在 owner 视角下无处获取该 ID，导致审批流闭环不完整。

### 实现方案
在 `app/routes/projects.py` 中追加 `list_project_applications` 路由，复用已有的工具函数：
- `get_project_or_404`：按 id 查项目，不存在抛 5001
- `build_application_item`：统一构造申请返回结构
- `APP_QUERY_STATUSES`：申请状态白名单（pending/approved/rejected/left/removed）

### 修改文件
- `app/routes/projects.py`（追加约 40 行）

### 核心代码逻辑
1. 通过 `get_project_or_404(id)` 查找项目，不存在返回错误码 5001（404）
2. 权限校验：`project.user_id != request.user.id` → 返回 5002（403，非 owner 无权查看）
3. 支持可选 `status` 查询参数过滤，取值范围限定在 `APP_QUERY_STATUSES` 内（pending/approved/rejected/left/removed）
4. 按 `created_at DESC` 排序，支持 `page` / `page_size` 分页
5. 批量查询申请人 User 信息，调用 `build_application_item` 统一构造每条返回结构

### 请求结构
```
GET /api/v1/projects/<id>/applications?status=pending&page=1&page_size=20
Headers: Authorization: Bearer <token>
```

### 响应结构
```json
{
  "list": [
    {
      "application_id": 12,
      "project_id": 8,
      "user_id": 5,
      "status": "pending",
      "message": "希望加入项目负责前端",
      "created_at": "2026-09-14T10:00:00Z",
      "processed_at": null,
      "applicant": {
        "user_id": 5,
        "nickname": "张三",
        "avatar": "https://cdn.example.com/5.png"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

### 测试验证结果
- 正常调用（owner 身份）：200 PASS
- 非 owner 调用：403 PASS（错误码 5002）
- 不存在的项目：404 PASS（错误码 5001）

---

## 需求2：GET /projects/<id>/members — 成员列表

### 需求描述
项目模块已有 `DELETE /projects/<id>/members/<user_id>/remove`，但缺少 list 接口，前端无法在项目详情页展示"当前成员列表"。

### 实现方案
在 `app/routes/projects.py` 中追加 `list_project_members` 路由，从 `ProjectApplication` 表中筛选已通过（status='approved'）的成员，与项目发起人合并输出。

### 修改文件
- `app/routes/projects.py`（追加约 35 行）

### 核心代码逻辑
1. 通过 `get_project_or_404(id)` 查找项目，不存在返回 5001
2. 权限校验：调用者既不是 owner 也不是已通过成员 → 返回 5008（403）
3. 查询 `ProjectApplication.status='approved'` 的所有用户
4. 输出顺序：项目发起人在前（`role='owner'`），已通过成员在后（`role='member'`）
5. 批量查询 User 表获取 `nickname` / `avatar` / `level` 等展示字段
6. `joined_at` 优先取 `processed_at`，缺失时回退 `created_at`

### 请求结构
```
GET /api/v1/projects/<id>/members
Headers: Authorization: Bearer <token>
```

### 响应结构
```json
{
  "list": [
    {
      "user_id": 1,
      "nickname": "李四",
      "avatar": "https://cdn.example.com/1.png",
      "level": 5,
      "role": "owner",
      "joined_at": "2026-09-01T08:00:00Z"
    },
    {
      "user_id": 5,
      "nickname": "张三",
      "avatar": "https://cdn.example.com/5.png",
      "level": 3,
      "role": "member",
      "joined_at": "2026-09-12T15:30:00Z"
    }
  ],
  "total": 2
}
```

### 测试验证结果
- 正常调用：200 PASS
- 非成员访问：403 PASS（错误码 5008）

---

## 需求3：GET /events + GET /events/<id> + POST /events/<id>/join — 活动路由

### 需求描述
`events` 与 `event_participants` 两张表，以及 `Event` / `EventParticipant` 模型早已存在，但没有任何路由暴露，导致"我参与过的活动"页面此前只能用假数据填充。

### 实现方案
新建 `app/routes/events.py` 蓝图，提供 3 个路由；并在 `app/__init__.py` 中注册蓝图。新增错误码段 6xxx。

### 修改文件
- `app/routes/events.py`（新建）
- `app/__init__.py`（注册蓝图）

### 核心代码逻辑
1. **GET /events/** — 按 `status` 过滤（默认 `ongoing`），支持分页，返回 `Event.to_dict` 列表
2. **GET /events/<id>** — 查询单个 Event 详情，附 `is_joined` 标记（查询当前用户在 `EventParticipant` 表中的记录），不存在返回 6001（404）
3. **POST /events/<id>/join** — 三层校验：
   - 活动存在 + status=ongoing（否则 6001 / 6004）
   - `work_id` 存在且属于当前用户 + 已发布（否则 6002）
   - 未重复参与（`EventParticipant` 不存在记录，否则 6003）
   - 创建 `EventParticipant`，并对 `Event.participant_count += 1`

### ErrorCode 定义
| 错误码 | 名称 | HTTP |
|--------|------|------|
| 6001 | EVENT_NOT_FOUND | 404 |
| 6002 | WORK_NOT_FOUND | 404 |
| 6003 | ALREADY_JOINED | 400 |
| 6004 | DEADLINE_PASSED | 400 |

（PARAM_ERROR=400、NOT_FOUND=404 通用错误码继续复用）

### 请求/响应结构

#### GET /events/
```
GET /api/v1/events/?status=ongoing&page=1&page_size=20
```
```json
{ "list": [Event.to_dict], "total": 0, "page": 1, "page_size": 20, "total_pages": 0 }
```

#### GET /events/<id>
```
GET /api/v1/events/<id>
```
```json
{
  "...Event.to_dict": "",
  "is_joined": false
}
```

#### POST /events/<id>/join
```
POST /api/v1/events/<id>/join
Content-Type: application/json
{ "work_id": 42 }
```
```json
{ "event_id": 1, "participant_id": 88, "joined_at": "2026-09-15T12:00:00Z" }
```

### 测试验证结果
- 3 个正常调用：均 200 PASS
- 不存在的活动：404 PASS（6001）
- 重复参与：400 PASS（6003）
- 空 `work_id`：400 PASS（PARAM_ERROR）

---

## 需求4：GET /rating-tags — 评价标签字典

### 需求描述
`rating_tags` 表与 `RatingTag` 模型已存在，技能标签和风格标签都已暴露接口，唯独评价标签字典缺失，前端评价页无法渲染标签选择区。

### 实现方案
在 `app/routes/profile.py` 中追加 `list_rating_tags` 路由。

### 修改文件
- `app/routes/profile.py`（追加约 8 行）

### 核心代码逻辑
1. 查询 `RatingTag.is_active=True` 的所有记录
2. 按 `sort_order` 升序排序
3. 返回 `[RatingTag.to_dict]`

### 请求结构
```
GET /api/v1/profile/rating-tags
```

### 响应结构
```json
[
  {
    "id": 1,
    "name": "合作顺畅",
    "category": "positive",
    "sort_order": 1,
    "is_active": true,
    "created_at": "2026-08-01T00:00:00Z"
  },
  {
    "id": 2,
    "name": "响应慢",
    "category": "negative",
    "sort_order": 2,
    "is_active": true,
    "created_at": "2026-08-01T00:00:00Z"
  }
]
```

### 测试验证结果
- 200 PASS

---

## 需求5：POST /works/<id>/share — 分享计数

### 需求描述
`works.share_count` 字段早已存在，但没有接口暴露，作品详情页的"分享"按钮无法触发后端计数。

### 实现方案
在 `app/routes/works.py` 中追加 `share_work` 路由，仅做计数自增，不记录分享详情。

### 修改文件
- `app/routes/works.py`（追加约 12 行）

### 核心代码逻辑
1. 查询 `Work`（排除 `status='deleted'`），不存在返回 3001（404）
2. `work.share_count += 1`，提交事务
3. 返回 `{ share_count }`

### 请求结构
```
POST /api/v1/works/<id>/share
（无 body）
```

### 响应结构
```json
{ "share_count": 7 }
```

### 测试验证结果
- 正常调用：200 PASS
- 不存在的作品：404 PASS（3001）

### 备注
当前仅做计数自增，不记录"谁分享/分享到哪"。如需分享详情，需要新增 `work_shares` 表（详见需求 8，暂缓）。

---

## 需求6：DELETE /profile/views/works — 删除浏览记录

### 需求描述
对应 issue #28 / #29：当前只能读取浏览记录（GET /profile/views/works），无法删除。历史页的"删除(N)"按钮缺少后端支持。

### 实现方案
在 `app/routes/profile.py` 中追加 `delete_viewed_works` 路由，与已有的 GET 共用路径但使用不同 HTTP 方法。

### 修改文件
- `app/routes/profile.py`（追加约 15 行）

### 核心代码逻辑
1. 从请求 body 中读取 `work_ids` 数组，校验：
   - 字段不存在 → 400
   - 为空数组 → 400
2. 批量删除 `WorkViewHistory`（条件：`user_id = 当前用户` 且 `work_id IN work_ids`）
3. 返回实际删除的条数 `{ deleted_count }`

### 请求结构
```
DELETE /api/v1/profile/views/works
Content-Type: application/json
{ "work_ids": [1, 2, 3] }
Headers: Authorization: Bearer <token>
```

### 响应结构
```json
{ "deleted_count": 3 }
```

### 测试验证结果
- 正常调用：200 PASS
- 空数组：400 PASS（PARAM_ERROR）
- 缺少 work_ids 字段：400 PASS（PARAM_ERROR）

---

## 需求7：GET /users/search — 用户搜索

### 需求描述
搜索框文案为"搜索作品、用户"，但实际只有 GET /works/search，用户搜索能力缺失。

### 实现方案
新建 `app/routes/users.py` 蓝图，提供用户模糊搜索；在 `app/__init__.py` 注册蓝图。

### 修改文件
- `app/routes/users.py`（新建）
- `app/__init__.py`（注册蓝图）

### 核心代码逻辑
1. 取查询参数 `q`，`strip()` 后为空 → 返回 400
2. 使用 `User.nickname.ilike('%q%')` 进行模糊匹配
3. 支持 `page` / `page_size` 分页
4. 返回分页结构，`list` 元素为 `User.to_dict`

### 请求结构
```
GET /api/v1/users/search?q=关键词&page=1&page_size=20
Headers: Authorization: Bearer <token>
```

### 响应结构
```json
{
  "list": [
    {
      "user_id": 5,
      "nickname": "张三丰",
      "avatar": "https://cdn.example.com/5.png",
      "level": 3
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

### 测试验证结果
- 正常调用：200 PASS
- 空 q：400 PASS
- 无认证：401 PASS

---

## 需求8：分享记录新表 — 暂缓

### 需求描述
需要查看"谁分享的、分享到哪"，可能用于分享激励或社交分析。

### 实现方案
**暂缓**。当前 `share_count` 字段已足以支撑 UI 显示分享次数，前端无分享详情诉求。

### 后续方案（如需启用）
新增 `work_shares` 表：
```
work_shares (
  id BIGINT PK,
  work_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  platform VARCHAR(32),   -- wechat/timeline/weibo/...
  created_at DATETIME
)
```
并新增 GET /works/<id>/shares 列表接口。

### 暂缓理由
前端当前只需要展示"分享次数"数字，不需要追溯分享详情。待业务侧提出明确诉求后再落地。

### 测试验证结果
无（未实现）。

---

## 需求9：GET /projects/<id>/works — 项目作品

### 需求描述
`works.project_id` 字段和对应索引早已存在，但缺少按项目聚合的作品列表接口，将来"项目作品"页需要。

### 实现方案
在 `app/routes/projects.py` 中追加 `list_project_works` 路由。

### 修改文件
- `app/routes/projects.py`（追加约 12 行）

### 核心代码逻辑
1. 通过 `get_project_or_404(id)` 查找项目，不存在返回 5001
2. 查询 `Work.query.filter_by(project_id=id, status='published')`，按 `published_at DESC` 分页
3. 返回 `[Work.to_dict]` 分页结构

### 请求结构
```
GET /api/v1/projects/<id>/works?page=1&page_size=20
```

### 响应结构
```json
{
  "list": [Work.to_dict],
  "total": 0,
  "page": 1,
  "page_size": 20,
  "total_pages": 0
}
```

### 测试验证结果
- 正常调用：200 PASS
- 不存在的项目：404 PASS（5001）

---

## 总结表

| # | 需求 | 实现方式 | 修改文件 | 新增路由数 | 测试结果 |
|---|------|----------|----------|-----------|----------|
| 1 | 项目待审列表 | 追加路由 | projects.py | 1 | 200 + 403 PASS |
| 2 | 成员列表 | 追加路由 | projects.py | 1 | 200 PASS |
| 3 | 活动模块 | 新建蓝图 | events.py + __init__.py | 3 | 200 + 404 + 400 PASS |
| 4 | 评价标签字典 | 追加路由 | profile.py | 1 | 200 PASS |
| 5 | 分享计数 | 追加路由 | works.py | 1 | 200 + 404 PASS |
| 6 | 删除浏览记录 | 追加路由 | profile.py | 1 | 200 + 400 PASS |
| 7 | 用户搜索 | 新建蓝图 | users.py + __init__.py | 1 | 200 + 400 + 401 PASS |
| 8 | 分享记录新表 | 暂缓 | — | 0 | — |
| 9 | 项目作品 | 追加路由 | projects.py | 1 | 200 PASS |
| **合计** | | | | **10** | **21/21 PASS** |

---

## 实现要点小结

1. **复用优先**：所有追加路由尽量复用既有工具函数（`get_project_or_404`、`build_application_item`、`APP_QUERY_STATUSES`、`*.to_dict`），避免新增重复逻辑。
2. **错误码体系延续**：项目沿用 1xxx（用户）/2xxx（互动）/3xxx（作品）/4xxx（广场）/5xxx（项目）/6xxx（活动）段位，无重复冲突。
3. **权限边界清晰**：
   - 项目类：owner 优先，非 owner/成员统一 403
   - 个人类：仅本人可操作自己的浏览记录与申请列表
4. **蓝图注册统一**：`events.py` 与 `users.py` 均通过 `app/__init__.py` 的 `register_blueprints` 流程统一挂载，URL 前缀遵循 `/api/v1/`。
5. **暂缓决策透明**：需求 8 显式标注"暂缓"理由与后续落地方案，避免后续成员重复评估。
6. **测试覆盖**：21 条用例全数通过，覆盖正常路径、权限边界、参数校验、资源不存在四类场景。