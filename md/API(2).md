# 艺联萌后端接口文档（API.md）

> 最后更新：2026-09-15 · 从代码自动提取 · 共 **106** 个业务接口（+ 2 个根路由健康检查）

---

## 一、基础信息

| 项目 | 说明 |
|------|------|
| 基础路径 | `http://{host}:8080/api/v1` |
| 请求体格式 | `Content-Type: application/json` |
| 文件上传 | `Content-Type: multipart/form-data`，字段名 `file`（单文件） |
| 认证方式 | JWT Bearer Token（请求头 `Authorization: Bearer <token>`） |
| 分页参数 | `?page=1&page_size=20`（page 从 1 开始） |
| 分页返回 | `{ total, page, page_size, total_pages, list }` |
| 响应格式 | `{ "code": 200, "message": "success", "data": {...} }` |
| CORS | `CORS(app, resources={r"/api/*": {"origins": "*"}})`，H5 直接调不需要代理 |
| 时间格式 | ISO 8601 **无时区后缀**，如 `2026-09-15T10:30:00`（UTC 存储，输出不带 `Z`/`+00:00`），`null` 表示为空 |
| JWT 有效期 | 默认 **7 天**（`JWT_EXPIRES_IN` 环境变量，单位天，默认 7 → 7\*24\*3600 秒） |
| 全局上传大小 | `MAX_CONTENT_LENGTH = 500 MB`（单个请求上限） |

### 响应格式

```json
{ "code": 200, "message": "success", "data": { ... } }
```

- HTTP 状态码与业务码分离：HTTP 遵循语义（200/400/401/403/404/429/500），`code` 为业务码。
- 成功：`code=200`，`message` 为提示语，`data` 为业务数据（对象 / 数组 / 分页结构 / null）。
- 失败：`code` 为业务错误码，`message` 为错误描述，`data` 通常为 null。

### 错误码分段概览

| 范围 | 模块 | 示例 |
|------|------|------|
| 200 | 成功 | — |
| 401/429 | 通用 | 401 未登录/Token 过期；429 验证码发送过频 |
| 1xxx | 认证 | 1001 手机号格式 / 1005 已注册 / 1008 场景参数 |
| 2xxx | 档案 | 2002 无效技能ID / 2010 无权限 / 2012 图片超限 |
| 3xxx | 作品 + 消息 | 3001 不存在 / 3003 草稿不可见 / 3007 可见性/msg_type 无效 |
| 4xxx | 互动 | 4001 不存在 / 4003 已点赞 / 4005 评论不存在 |
| 5xxx | 项目 | 5001 不存在 / 5002 无权限 / 5008 非成员 / 5009 不可自评 / 5011 项目未完成 |
| 6xxx | 活动 | 6001 不存在 / 6003 已参与 / 6004 活动已结束 |

---

## 二、接口汇总表

> 认证列：`✓` 表示需要登录；`—` 表示无需登录。共 106 个业务接口 + 2 个根路由。

### 根路由（2）

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 1 | GET | `/` | — | 根健康检查 |
| 2 | GET | `/api/v1` | — | API 健康检查 |

### 1. 认证模块（7，前缀 `/api/v1/auth`）

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 1 | POST | `/auth/send-code` | — | 发送验证码（返回 dev_code） |
| 2 | POST | `/auth/register` | — | 注册（返回 token+user+is_new_user） |
| 3 | POST | `/auth/login` | — | 密码登录（返回 token+user+is_new_user） |
| 4 | POST | `/auth/reset-password` | — | 重置密码 |
| 5 | POST | `/auth/refresh` | ✓ | 刷新 Token（返回 token） |
| 6 | GET | `/auth/me` | ✓ | 当前用户信息（User.to_dict） |
| 7 | POST | `/auth/logout` | ✓ | 登出 |

### 2. 档案模块（28，前缀 `/api/v1/profile`）

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 1 | GET | `/profile/me` | ✓ | 我的完整档案 |
| 2 | PUT | `/profile/me` | ✓ | 更新档案基础信息 |
| 3 | GET | `/profile/<int:user_id>` | ✓ | 查看他人档案 |
| 4 | GET | `/profile/homepage/<int:user_id>` | ✓ | 个人主页聚合（含关注关系） |
| 5 | GET | `/profile/views/works` | ✓ | 我浏览过的作品（分页） |
| 6 | GET | `/profile/views/projects` | ✓ | 我浏览过的项目（分页） |
| 7 | DELETE | `/profile/views/works` | ✓ | 批量删除作品浏览记录 |
| 8 | GET | `/profile/skills` | — | 技能扁平列表（可按 category_id 过滤） |
| 9 | PUT | `/profile/skills` | ✓ | 更新我的技能（覆盖式，上限 5） |
| 10 | GET | `/profile/skills/mine` | ✓ | 我的技能 |
| 11 | GET | `/profile/skills/categories` | — | 技能分类字典（含技能） |
| 12 | GET | `/profile/style-tags` | — | 风格词汇字典（is_active=True） |
| 13 | PUT | `/profile/style-tags` | ✓ | 更新我的风格词汇（覆盖式，上限 5） |
| 14 | GET | `/profile/style-tags/mine` | ✓ | 我的风格词汇 |
| 15 | GET | `/profile/work-experiences` | ✓ | 工作经历列表 |
| 16 | POST | `/profile/work-experiences` | ✓ | 新增工作经历 |
| 17 | PUT | `/profile/work-experiences/<int:exp_id>` | ✓ | 编辑工作经历 |
| 18 | DELETE | `/profile/work-experiences/<int:exp_id>` | ✓ | 删除工作经历 |
| 19 | GET | `/profile/education-experiences` | ✓ | 教育经历列表 |
| 20 | POST | `/profile/education-experiences` | ✓ | 新增教育经历 |
| 21 | PUT | `/profile/education-experiences/<int:edu_id>` | ✓ | 编辑教育经历 |
| 22 | DELETE | `/profile/education-experiences/<int:edu_id>` | ✓ | 删除教育经历 |
| 23 | GET | `/profile/ability-proofs` | ✓ | 能力证明列表 |
| 24 | POST | `/profile/ability-proofs` | ✓ | 新增能力证明 |
| 25 | PUT | `/profile/ability-proofs/<int:proof_id>` | ✓ | 编辑能力证明 |
| 26 | DELETE | `/profile/ability-proofs/<int:proof_id>` | ✓ | 删除能力证明 |
| 27 | POST | `/profile/upload` | ✓ | 档案文件上传（form-data） |
| 28 | GET | `/profile/rating-tags` | ✓ | 评价标签字典（is_active=True） |

### 3. 作品模块（15，前缀 `/api/v1/works`）

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 1 | POST | `/works/` | ✓ | 创建作品（支持转发/纯文字/可见性） |
| 2 | PUT | `/works/<int:work_id>` | ✓ | 编辑作品 |
| 3 | POST | `/works/<int:work_id>/publish` | ✓ | 发布作品（草稿→已发布） |
| 4 | DELETE | `/works/<int:work_id>` | ✓ | 删除作品（软删除） |
| 5 | GET | `/works/<int:work_id>` | ✓ | 作品详情（含转发溯源，浏览数+1） |
| 6 | GET | `/works/mine` | ✓ | 我的作品（分页，支持 status） |
| 7 | GET | `/works/user/<int:user_id>` | ✓ | 某用户作品（分页） |
| 8 | GET | `/works/user/<int:user_id>/liked` | ✓ | 某用户点赞的作品（分页） |
| 9 | POST | `/works/upload` | ✓ | 作品文件上传（form-data） |
| 10 | GET | `/works/feed` | ✓ | 推荐推流（分页，sort=latest/hot） |
| 11 | GET | `/works/feed/following` | ✓ | 关注 Tab 推流（分页） |
| 12 | GET | `/works/search` | ✓ | 搜索作品（q 必填，分页） |
| 13 | GET | `/works/by-skill` | ✓ | 按技能筛选作品（skill_id 必填，分页） |
| 14 | POST | `/works/<int:work_id>/repost` | ✓ | 快捷转发 |
| 15 | POST | `/works/<int:work_id>/share` | ✓ | 分享计数（返回 share_count） |

### 4. 互动模块（7，前缀 `/api/v1`）

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 1 | POST | `/works/<int:work_id>/like` | ✓ | 点赞 |
| 2 | DELETE | `/works/<int:work_id>/like` | ✓ | 取消点赞 |
| 3 | GET | `/works/<int:work_id>/likes` | ✓ | 点赞用户列表（分页） |
| 4 | POST | `/works/<int:work_id>/comments` | ✓ | 发表评论 / 回复 |
| 5 | GET | `/works/<int:work_id>/comments` | ✓ | 评论列表（分页） |
| 6 | DELETE | `/comments/<int:comment_id>` | ✓ | 删除评论（软删除） |
| 7 | GET | `/comments/<int:comment_id>/replies` | ✓ | 评论的回复列表（分页） |

### 5. 项目模块（19，前缀 `/api/v1/projects`）

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 1 | POST | `/projects/` | ✓ | 创建项目 |
| 2 | GET | `/projects/` | ✓ | 项目列表（分页，status/mode/skill_id 过滤） |
| 3 | GET | `/projects/<int:project_id>` | ✓ | 项目详情（含 member_avatars/creator.skills/joined_project_count） |
| 4 | PUT | `/projects/<int:project_id>` | ✓ | 编辑项目（仅 recruiting 状态） |
| 5 | POST | `/projects/<int:project_id>/apply` | ✓ | 申请加入 |
| 6 | POST | `/projects/<int:project_id>/applications/<int:app_id>/approve` | ✓ | 通过申请 |
| 7 | POST | `/projects/<int:project_id>/applications/<int:app_id>/reject` | ✓ | 拒绝申请 |
| 8 | GET | `/projects/<int:project_id>/applications` | ✓ | 待审申请列表（仅 owner，支持 status） |
| 9 | GET | `/projects/<int:project_id>/members` | ✓ | 成员列表（role=owner/member） |
| 10 | GET | `/projects/<int:project_id>/works` | ✓ | 项目关联作品（分页） |
| 11 | POST | `/projects/<int:project_id>/close` | ✓ | 关闭项目 |
| 12 | POST | `/projects/<int:project_id>/finish` | ✓ | 结束项目 |
| 13 | POST | `/projects/<int:project_id>/leave` | ✓ | 退出项目 |
| 14 | POST | `/projects/<int:project_id>/members/<int:user_id>/remove` | ✓ | 移除成员 |
| 15 | GET | `/projects/user/<int:user_id>` | ✓ | 某用户项目（分页） |
| 16 | GET | `/projects/mine` | ✓ | 我的项目（分页，role 过滤） |
| 17 | GET | `/projects/my-applications` | ✓ | 我的申请列表（分页，status 过滤） |
| 18 | POST | `/projects/<int:project_id>/ratings` | ✓ | 提交互评 |
| 19 | GET | `/projects/<int:project_id>/ratings` | ✓ | 互评列表（分页） |

### 6. 私聊会话模块（6，前缀 `/api/v1/conversations`）

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 1 | GET | `/conversations/` | ✓ | 联系人列表（排除官方，分页） |
| 2 | POST | `/conversations/with/<int:user_id>` | ✓ | 获取/创建与某用户的会话 |
| 3 | GET | `/conversations/<int:conversation_id>/messages` | ✓ | 消息记录（分页） |
| 4 | POST | `/conversations/<int:conversation_id>/messages` | ✓ | 发送消息（msg_type 含 project_invite） |
| 5 | POST | `/conversations/<int:conversation_id>/read` | ✓ | 标记会话已读 |
| 6 | GET | `/conversations/official` | ✓ | 官方会话 |

> 权限规则：陌生人禁发（3001）；单方面关注限 1 条（3002）；互关 / 官方账号自由发。

### 7. 群聊模块（8，前缀 `/api/v1/groups`）

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 1 | GET | `/groups/` | ✓ | 我加入的群列表（分页） |
| 2 | POST | `/groups/` | ✓ | 创建群 |
| 3 | GET | `/groups/<int:group_id>/messages` | ✓ | 群消息记录（分页） |
| 4 | POST | `/groups/<int:group_id>/messages` | ✓ | 发送群消息（msg_type 含 rating_request） |
| 5 | POST | `/groups/<int:group_id>/read` | ✓ | 标记群已读 |
| 6 | GET | `/groups/<int:group_id>/members` | ✓ | 群成员列表 |
| 7 | POST | `/groups/<int:group_id>/invite` | ✓ | 邀请成员入群（仅 owner/admin） |
| 8 | POST | `/groups/<int:group_id>/leave` | ✓ | 退出群聊（群主不能退） |

### 8. 消息附件上传（1，前缀 `/api/v1/messages`）

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 1 | POST | `/messages/upload` | ✓ | 消息附件上传（20MB 限制） |

### 9. 通知模块（5，前缀 `/api/v1/notifications`）

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 1 | GET | `/notifications/unread-counts` | ✓ | 三 Tab 未读数（official/interaction/todo） |
| 2 | GET | `/notifications/interaction` | ✓ | 互动通知列表（subtype: like/comment/follow，分页） |
| 3 | GET | `/notifications/todo` | ✓ | 待办通知列表（subtype: apply，分页） |
| 4 | POST | `/notifications/<int:notification_id>/read` | ✓ | 标记单条已读 |
| 5 | POST | `/notifications/read-all` | ✓ | 批量已读（body 可选 type） |

### 10. 关注模块（6，前缀 `/api/v1`）

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 1 | POST | `/users/<int:user_id>/follow` | ✓ | 关注某人 |
| 2 | DELETE | `/users/<int:user_id>/follow` | ✓ | 取消关注 |
| 3 | GET | `/users/<int:user_id>/follow/status` | ✓ | 关注状态 |
| 4 | GET | `/following` | ✓ | 我的关注列表（分页） |
| 5 | GET | `/followers` | ✓ | 我的粉丝列表（分页） |
| 6 | GET | `/users/<int:user_id>/follow/stats` | — | 关注/粉丝计数（无需登录） |

### 11. 活动模块（3，前缀 `/api/v1/events`）

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 1 | GET | `/events/` | ✓ | 活动列表（分页，status 默认 ongoing） |
| 2 | GET | `/events/<int:event_id>` | ✓ | 活动详情（含 is_joined） |
| 3 | POST | `/events/<int:event_id>/join` | ✓ | 参与活动（body: work_id） |

### 12. 用户搜索（1，前缀 `/api/v1/users`）

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 1 | GET | `/users/search` | ✓ | 用户搜索（q 必填，nickname 模糊匹配，分页） |

---

## 三、接口详情

> 通用：除标注"无需认证"外，所有接口均需请求头 `Authorization: Bearer <token>`。分页接口统一支持 `page`/`page_size` 查询参数，返回分页包装。

### 1. 认证模块

#### 1.1 `POST /api/v1/auth/send-code`
**发送验证码** | 认证：否

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `phone` | string | 是 | 手机号，正则 `^1[3-9]\d{9}$` |
| `scene` | string | 是 | 场景，枚举：`register` / `reset` |

**业务规则**
- `register` 场景：手机号不可已注册（否则 1005）。
- `reset` 场景：手机号必须已注册（否则 1006）。
- 60 秒内不可重发（429）。验证码 5 分钟有效。

**响应 data**
```json
{ "dev_code": "123456" }
```
> 开发环境直接返回验证码，生产环境应改为短信下发。

**可能错误码**：400 参数为空；1001 手机号格式；1005 已注册；1006 未注册；1008 场景不合法；429 发送过频。

---

#### 1.2 `POST /api/v1/auth/register`
**注册** | 认证：否

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `phone` | string | 是 | 手机号 |
| `code` | string | 是 | 验证码（register 场景） |
| `password` | string | 是 | 密码 8-20 位含字母+数字 |
| `nickname` | string | 否 | 昵称，不填则默认 `用户{手机后4位}` |

**响应 data**
```json
{ "token": "<jwt>", "user": { ...User.to_dict }, "is_new_user": true }
```
> 注册成功自动建空档案（identity=艺术爱好者），`is_new_user=true`。

**可能错误码**：400 参数为空；1001 手机号格式；1007 密码格式；1002 验证码错误；1003 验证码过期；1004 未先发送；1005 已注册。

---

#### 1.3 `POST /api/v1/auth/login`
**密码登录** | 认证：否

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `phone` | string | 是 | 手机号 |
| `password` | string | 是 | 密码 |

**响应 data**
```json
{ "token": "<jwt>", "user": { ...User.to_dict }, "is_new_user": false }
```
> 老用户登录会清除 `is_new_user` 标记，统一提示防撞库。

**可能错误码**：400 参数为空；1001 手机号格式；1006 手机号或密码错误。

---

#### 1.4 `POST /api/v1/auth/reset-password`
**重置密码** | 认证：否

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `phone` | string | 是 | 手机号 |
| `code` | string | 是 | 验证码（reset 场景） |
| `new_password` | string | 是 | 新密码 8-20 位含字母+数字 |

**响应 data**：无（`message: 密码重置成功`）

**可能错误码**：400 参数为空；1001 手机号格式；1007 密码格式；1002/1003/1004 验证码相关；1006 未注册。

---

#### 1.5 `POST /api/v1/auth/refresh`
**刷新 Token** | 认证：是

**请求参数**：无

**响应 data**
```json
{ "token": "<新 jwt>" }
```

**可能错误码**：401 未登录/Token 过期。

---

#### 1.6 `GET /api/v1/auth/me`
**当前用户信息** | 认证：是

**请求参数**：无

**响应 data**：`User.to_dict()`，字段见[附录模型字段表](#user)。

---

#### 1.7 `POST /api/v1/auth/logout`
**登出** | 认证：是

**请求参数**：无

**响应 data**：无（`message: 已退出登录`）。> 注：JWT 为无状态，登出由前端清除本地 token。

---

### 2. 档案模块

#### 2.1 `GET /api/v1/profile/me`
**我的完整档案** | 认证：是

**请求参数**：无（不存在档案时自动创建）

**响应 data**：`Profile.to_dict(with_relations=True)`，含 identity/skills/style_tags/work_experiences/education_experiences/ability_proofs。

---

#### 2.2 `PUT /api/v1/profile/me`
**更新个人主页基础信息 + 档案身份** | 认证：是

> 同时支持 users 表（nickname/avatar/bio）和 profiles 表（identity）的部分更新。任意字段可选，未传不更新。

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `nickname` | string | 否 | 昵称，上限 50 字符，不能为空字符串 |
| `avatar` | string | 否 | 头像 URL，上限 255 字符 |
| `bio` | string | 否 | 个人简介，上限 500 字符 |
| `identity` | string | 否 | 身份，枚举：`学生` / `艺术爱好者` / `艺术相关工作者` |

**响应 data**：
```json
{
  "user": { ...User.to_dict() },
  "profile": { ...Profile.to_dict() }
}
```

**可能错误码**：400 参数错误；2001 身份类型不合法。

---

#### 2.3 `GET /api/v1/profile/<int:user_id>`
**查看他人档案** | 认证：是

**响应 data**：`Profile.to_dict(with_relations=True)`；无档案返回 404。

---

#### 2.4 `GET /api/v1/profile/homepage/<int:user_id>`
**个人主页聚合** | 认证：是

**响应 data**
```json
{
  "user": { ...User.to_dict(show_full_phone=是否本人) },
  "profile": { "identity": "...", "skills": [...], "style_tags": [...] },
  "is_following": false,
  "is_followed_by": false,
  "is_mutual": false,
  "is_self": false
}
```
> 仅本人可见完整手机号。

---

#### 2.5 `GET /api/v1/profile/views/works`
**我浏览过的作品** | 认证：是 | 分页

**响应 data**：分页，每项 `{ work_id, title, cover_url, files[], author{user_id,nickname,avatar}, view_count, last_viewed_at }`。

---

#### 2.6 `GET /api/v1/profile/views/projects`
**我浏览过的项目** | 认证：是 | 分页

**响应 data**：分页，每项 `{ project_id, title, cover_url, author{...}, view_count, last_viewed_at }`。

---

#### 2.7 `DELETE /api/v1/profile/views/works`
**批量删除作品浏览记录** | 认证：是

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `work_ids` | int[] | 是 | 要删除的作品 ID 数组 |

**响应 data**：`{ "deleted_count": <int> }`

---

#### 2.8 `GET /api/v1/profile/skills`
**技能扁平列表** | 认证：否

**请求参数（query）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `category_id` | int | 否 | 按分类过滤 |

**响应 data**：`{ "skills": [ Skill.to_dict, ... ] }`

---

#### 2.9 `PUT /api/v1/profile/skills`
**更新我的技能** | 认证：是

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `skill_ids` | int[] | 是 | 技能 ID 数组，覆盖式，上限 5，去重 |

**响应 data**：`{ "skills": [ Skill.to_dict, ... ] }`

**可能错误码**：2002 无效技能ID（404）；2004 超过 5 个。

---

#### 2.10 `GET /api/v1/profile/skills/mine`
**我的技能** | 认证：是

**响应 data**：`{ "skills": [ Skill.to_dict, ... ] }`

---

#### 2.11 `GET /api/v1/profile/skills/categories`
**技能分类字典** | 认证：否

**响应 data**：`{ "categories": [ SkillCategory.to_dict(with_skills=True), ... ] }`

---

#### 2.12 `GET /api/v1/profile/style-tags`
**风格词汇字典** | 认证：否

**响应 data**：`{ "style_tags": [ StyleTag.to_dict, ... ] }`（仅 is_active=True）

---

#### 2.13 `PUT /api/v1/profile/style-tags`
**更新我的风格词汇** | 认证：是

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `style_tag_ids` | int[] | 是 | 风格词汇 ID 数组，覆盖式，上限 5，去重 |

**响应 data**：`{ "style_tags": [ StyleTag.to_dict, ... ] }`

**可能错误码**：2005 超过 5 个；2006 无效风格词汇ID（404）。

---

#### 2.14 `GET /api/v1/profile/style-tags/mine`
**我的风格词汇** | 认证：是

**响应 data**：`{ "style_tags": [ StyleTag.to_dict, ... ] }`

---

#### 2.15 `GET /api/v1/profile/work-experiences`
**工作经历列表** | 认证：是

**响应 data**：`{ "work_experiences": [ WorkExperience.to_dict, ... ] }`（含 images）

---

#### 2.16 `POST /api/v1/profile/work-experiences`
**新增工作经历** | 认证：是

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `company_name` | string | 是 | 公司名 |
| `position` | string | 是 | 职位 |
| `start_date` | string | 是 | 开始日期 `YYYY-MM-DD` |
| `end_date` | string | 否 | 结束日期 `YYYY-MM-DD` |
| `is_current` | bool | 否 | 是否在职 |
| `description` | string | 否 | 描述 |
| `sort_order` | int | 否 | 排序 |
| `images` | object[] | 否 | 图片数组，每项 `{ image_url, caption, sort_order }`，上限 5 |

**响应 data**：`WorkExperience.to_dict()`

**可能错误码**：400 参数缺失/格式；2012 图片超过 5 张。

---

#### 2.17 `PUT /api/v1/profile/work-experiences/<int:exp_id>`
**编辑工作经历** | 认证：是（部分更新，仅本人）

**请求参数（body）**：同 2.16，所有字段可选；`images` 传则整体覆盖。

**响应 data**：`WorkExperience.to_dict()`

**可能错误码**：2010 无权操作（404）；2012 图片超限。

---

#### 2.18 `DELETE /api/v1/profile/work-experiences/<int:exp_id>`
**删除工作经历** | 认证：是（仅本人，级联删图片）

**响应 data**：无（`message: 删除成功`）

**可能错误码**：2010 无权操作（404）。

---

#### 2.19 `GET /api/v1/profile/education-experiences`
**教育经历列表** | 认证：是

**响应 data**：`{ "education_experiences": [ EducationExperience.to_dict, ... ] }`

---

#### 2.20 `POST /api/v1/profile/education-experiences`
**新增教育经历** | 认证：是

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `school_level` | string | 是 | 学段，枚举：`小学` / `中学` / `大学` |
| `school_name` | string | 是 | 学校名 |
| `start_year` | int | 是 | 开始年份 |
| `end_year` | int | 否 | 结束年份 |
| `degree` | string | 否 | 学位 |
| `major` | string | 否 | 专业 |
| `sort_order` | int | 否 | 排序 |

**响应 data**：`EducationExperience.to_dict()`

**可能错误码**：400 参数缺失；2011 学段不合法。

---

#### 2.21 `PUT /api/v1/profile/education-experiences/<int:edu_id>`
**编辑教育经历** | 认证：是（部分更新，仅本人）

**请求参数（body）**：同 2.20，所有字段可选。

**响应 data**：`EducationExperience.to_dict()`

**可能错误码**：2010 无权操作（404）；2011 学段不合法。

---

#### 2.22 `DELETE /api/v1/profile/education-experiences/<int:edu_id>`
**删除教育经历** | 认证：是（仅本人）

**响应 data**：无（`message: 删除成功`）

**可能错误码**：2010 无权操作（404）。

---

#### 2.23 `GET /api/v1/profile/ability-proofs`
**能力证明列表** | 认证：是

**响应 data**：`{ "ability_proofs": [ AbilityProof.to_dict, ... ] }`（含 files）

---

#### 2.24 `POST /api/v1/profile/ability-proofs`
**新增能力证明** | 认证：是

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | 是 | 标题 |
| `description` | string | 否 | 描述 |
| `sort_order` | int | 否 | 排序 |
| `files` | object[] | 否 | 文件数组，每项 `{ file_url, file_name, file_type, sort_order }`，上限 10 |

**响应 data**：`AbilityProof.to_dict()`

**可能错误码**：400 title 为空；2012 文件超过 10 个。

---

#### 2.25 `PUT /api/v1/profile/ability-proofs/<int:proof_id>`
**编辑能力证明** | 认证：是（部分更新，仅本人）

**请求参数（body）**：同 2.24，所有字段可选；`files` 传则整体覆盖。

**响应 data**：`AbilityProof.to_dict()`

**可能错误码**：2010 无权操作（404）；2012 文件超限。

---

#### 2.26 `DELETE /api/v1/profile/ability-proofs/<int:proof_id>`
**删除能力证明** | 认证：是（仅本人，级联删文件）

**响应 data**：无（`message: 删除成功`）

**可能错误码**：2010 无权操作（404）。

---

#### 2.27 `POST /api/v1/profile/upload`
**档案文件上传** | 认证：是 | form-data

**请求参数（form-data）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | file | 是 | 单文件 |

**响应 data**
```json
{ "url": "/uploads/profile/xxx.png", "file_name": "原图.jpg", "file_type": "image" }
```
> `file_type` 取值：`image` / `pdf` / `doc` / `video`。格式见[四、上传接口细节](#四上传接口细节)。

---

#### 2.28 `GET /api/v1/profile/rating-tags`
**评价标签字典** | 认证：是

**响应 data**：数组 `[{ id, name, category, sort_order, is_active, created_at }, ...]`，仅 `is_active=True`。

> `category` 枚举：`positive` / `negative` / `neutral`。

---

### 3. 作品模块

> 常量：`ALLOWED_CHANNELS={writing, visual, video, voice}`、`ALLOWED_CONTENT_TYPES={original, repost, text_only}`、`ALLOWED_IMAGE_LAYOUTS={flip, grid}`、`ALLOWED_VISIBILITY={private, followers, mutual, public, custom_allow, custom_deny}`、`MAX_FILES=9`、`MAX_SKILL_TAGS=5`、`MAX_CUSTOM_RULES=20`。

#### 3.1 `POST /api/v1/works/`
**创建作品** | 认证：是

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `content_type` | string | 否 | 默认 `original`；`original`/`repost`/`text_only` |
| `title` | string | 条件必填 | `text_only` 时取自 text_content，否则必填（≤200） |
| `text_content` | string | 条件必填 | `text_only` 必填（≤5000），其它可选 |
| `description` | string | 否 | 描述（≤2000） |
| `channel` | string | 否 | 默认 `writing`；四频道之一 |
| `image_layout` | string | 否 | 默认 `flip`；仅 visual 有意义 |
| `visibility_type` | string | 否 | 默认 `public`；六种可见性之一 |
| `files` | string[] | 否 | URL 数组，上限 9 |
| `cover_url` | string | 否 | 封面 URL |
| `is_collaborative` | bool | 否 | 是否共创，默认 false |
| `collaborators` | int[] | 否 | 协作者用户 ID 数组 |
| `skill_tags` | int[] | 否 | 技能 ID 数组，上限 5 |
| `location` | string | 否 | 地点 |
| `status` | string | 否 | 默认 `draft`；`draft`/`published` |
| `source_work_id` | int | 条件 | `repost` 时二选一 |
| `source_project_id` | int | 条件 | `repost` 时二选一 |
| `allow_users` | int[] | 条件 | `custom_allow` 必填，上限 20 |
| `deny_users` | int[] | 条件 | `custom_deny` 可选，上限 20 |

**业务规则**
- `repost` 时 `source_work_id` 与 `source_project_id` 必须**且只能填一个**（XOR，3009）；被转作品须为 published（否则 3001）。
- 转发会写 `WorkRepost` 溯源记录，被转作品 `repost_count +1`。

**响应 data**：`Work.to_dict()`

**可能错误码**：400 参数；3004 渠道；3005 文件超限；3006 技能标签无效；3007 可见性；3008 自定义规则超限；3009 转发参数互斥；3001 被转作品不存在。

---

#### 3.2 `PUT /api/v1/works/<int:work_id>`
**编辑作品** | 认证：是（仅作者）

**请求参数（body）**：3.1 的所有字段均可选（部分更新）；切换 `visibility_type` 会清空旧 allow/deny 规则。

**响应 data**：`Work.to_dict()`

**可能错误码**：3001 不存在（404）；3002 无权操作（403）；3004/3005/3006/3007/3008。

---

#### 3.3 `POST /api/v1/works/<int:work_id>/publish`
**发布作品** | 认证：是（仅作者）

**业务规则**：草稿→已发布，置 `published_at`（仅首次）；已发布幂等返回。

**响应 data**：`Work.to_dict()`

**可能错误码**：3001 不存在；3002 无权操作。

---

#### 3.4 `DELETE /api/v1/works/<int:work_id>`
**删除作品（软删除）** | 认证：是（仅作者）

**业务规则**：置 `status=deleted`；已删除返回 3003。

**响应 data**：无（`message: 作品已删除`）

**可能错误码**：3001 不存在；3002 无权操作；3003 已删除。

---

#### 3.5 `GET /api/v1/works/<int:work_id>`
**作品详情** | 认证：是

**业务规则**：嵌入 6 种可见性校验；草稿仅作者可见；已发布且非作者浏览 `view_count +1`。转发作品附带 `source`（type: work/project + data + source_user_id）。

**响应 data**：`Work.to_dict(with_author=True, author=...)`，转发时多 `source` 字段。

**可能错误码**：3001 不存在/不可见（404）。

---

#### 3.6 `GET /api/v1/works/mine`
**我的作品** | 认证：是 | 分页

**请求参数（query）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `status` | string | 否 | `draft`/`published`/`deleted`，不传则排除已删除 |

**响应 data**：分页，每项 `Work.to_dict()`。排序：已发布按 published_at 倒序，草稿沉后按 created_at 倒序。

---

#### 3.7 `GET /api/v1/works/user/<int:user_id>`
**某用户作品** | 认证：是 | 分页

**响应 data**：分页，每项 `Work.to_dict()`（仅可见作品）。

---

#### 3.8 `GET /api/v1/works/user/<int:user_id>/liked`
**某用户点赞的作品** | 认证：是 | 分页

**响应 data**：分页，每项 `Work.to_dict()`。

---

#### 3.9 `POST /api/v1/works/upload`
**作品文件上传** | 认证：是 | form-data

**请求参数（form-data）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | file | 是 | 单文件 |

**响应 data**：`{ "url": "/uploads/works/xxx.png" }`

**可能错误码**：400 未提供文件/类型不支持/上传失败。格式见[四](#四上传接口细节)。

---

#### 3.10 `GET /api/v1/works/feed`
**推荐推流** | 认证：是 | 分页

**请求参数（query）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `sort` | string | 否 | 默认 `latest`；`latest`/`hot` |
| `channel` | string | 否 | 频道过滤 |
| `content_type` | string | 否 | 内容类型过滤 |
| `exclude_self` | bool | 否 | 默认 true，排除本人作品 |

**响应 data**：分页，每项为 `build_work_list_item`（含 author/is_liked/source 快照）。`hot` 热度分 = `like_count*2 + view_count + repost_count*1.5`。

---

#### 3.11 `GET /api/v1/works/feed/following`
**关注 Tab 推流** | 认证：是 | 分页

**响应 data**：分页，仅展示我关注账号的作品，按 published_at 倒序，每项为 `build_work_list_item`。

---

#### 3.12 `GET /api/v1/works/search`
**搜索作品** | 认证：是 | 分页

**请求参数（query）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `q` | string | 是 | 关键词（≤100），匹配 title/description/text_content |
| `channel` | string | 否 | 频道过滤 |
| `content_type` | string | 否 | 内容类型过滤 |

**响应 data**：分页，每项为 `build_work_list_item`（仅可见作品）。

**可能错误码**：400 q 为空/过长；3004 频道不合法。

---

#### 3.13 `GET /api/v1/works/by-skill`
**按技能筛选作品** | 认证：是 | 分页

**请求参数（query）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `skill_id` | int | 是 | 技能 ID（JSON_CONTAINS 匹配 skill_tags） |
| `sort` | string | 否 | 默认 `latest`；`latest`/`hot` |

**响应 data**：分页，每项为 `build_work_list_item`。

**可能错误码**：400 skill_id 为空；排序参数不合法。

---

#### 3.14 `POST /api/v1/works/<int:work_id>/repost`
**快捷转发** | 认证：是

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `description` | string | 否 | 转发附言 |
| `visibility_type` | string | 否 | 可见性 |
| `location` | string | 否 | 地点 |
| `allow_users` / `deny_users` | int[] | 条件 | 自定义可见性规则 |

**响应 data**：`{ "new_work": Work.to_dict, "src": ... }`

**可能错误码**：3001 不存在；3009 参数互斥；3007 可见性无效。

---

#### 3.15 `POST /api/v1/works/<int:work_id>/share`
**分享计数** | 认证：是

**响应 data**：`{ "share_count": <int> }`（被分享作品 share_count +1）

**可能错误码**：3001 不存在。

---

### 4. 互动模块

#### 4.1 `POST /api/v1/works/<int:work_id>/like`
**点赞** | 认证：是

**响应 data**：`{ "is_liked": true }`（同时更新作品/用户计数，发互动通知）

**可能错误码**：4001 不存在；4003 已点赞过（静默忽略）。

---

#### 4.2 `DELETE /api/v1/works/<int:work_id>/like`
**取消点赞** | 认证：是

**响应 data**：`{ "is_liked": false }`

**可能错误码**：4001 不存在；4004 未点赞过（静默忽略）。

---

#### 4.3 `GET /api/v1/works/<int:work_id>/likes`
**点赞用户列表** | 认证：是 | 分页

**响应 data**：分页，每项含点赞用户摘要。

---

#### 4.4 `POST /api/v1/works/<int:work_id>/comments`
**发表评论 / 回复** | 认证：是

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `content` | string | 是 | 评论内容 |
| `parent_id` | int | 否 | 父评论 ID，回复一级评论；二级回复拒绝（4007） |

**响应 data**：`Comment.to_dict()`

**可能错误码**：4001 不存在；4005 父评论不存在；4006 内容为空；4007 回复层级超限。

---

#### 4.5 `GET /api/v1/works/<int:work_id>/comments`
**评论列表** | 认证：是 | 分页

**响应 data**：分页，每项 `Comment.to_dict()`（按时间倒序，含作者信息）。

---

#### 4.6 `DELETE /api/v1/comments/<int:comment_id>`
**删除评论（软删除）** | 认证：是（仅作者）

**响应 data**：无（`message: 删除成功`）

**可能错误码**：4005 评论不存在；4002 无权删除他人评论。

---

#### 4.7 `GET /api/v1/comments/<int:comment_id>/replies`
**评论的回复列表** | 认证：是 | 分页

**响应 data**：分页，每项 `Comment.to_dict()`。

**可能错误码**：4005 评论不存在。

---

### 5. 项目模块

#### 5.1 `POST /api/v1/projects/`
**创建项目** | 认证：是

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | 是 | 标题 |
| `description` | string | 否 | 描述 |
| `topic` | string | 否 | 主题 |
| `mode` | string | 否 | 模式 |
| `cover_url` | string | 否 | 封面 URL |
| `budget` | int | 否 | 预算（整数，单位元，默认 0，不能为负） |
| `deadline` | string | 否 | 截止时间，ISO 8601（如 `2026-12-31T23:59:59`），可空 |
| `max_members` | int | 否 | 人数上限 |
| `required_level` | int | 否 | 等级要求 |
| `required_project_count` | int | 否 | 历史项目数要求 |
| `required_skills` | int[] | 否 | 技能 ID 数组 |
| `contact_visible` | bool | 否 | 联系方式可见，默认 false |

**响应 data**：`build_project_item`（项目对象 + creator + member_avatars 等）

---

#### 5.2 `GET /api/v1/projects/`
**项目列表** | 认证：是 | 分页

**请求参数（query）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `status` | string | 否 | recruiting/ongoing/completed/closed |
| `mode` | string | 否 | 模式过滤 |
| `skill_id` | int | 否 | 技能过滤 |

**响应 data**：分页，每项为 `build_project_item`。

---

#### 5.3 `GET /api/v1/projects/<int:project_id>`
**项目详情** | 认证：是

**响应 data**：`build_project_item`，增强字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `member_avatars` | array | 已招募成员头像（最多 5，含发起人），每项 `{user_id, avatar, nickname}` |
| `creator.skills` | array | 队长技能列表 `{id, category_id, name, sort_order}` |
| `creator.joined_project_count` | int | 队长作为已通过成员参与的项目数 |

**可能错误码**：5001 不存在（404）。

---

#### 5.4 `PUT /api/v1/projects/<int:project_id>`
**编辑项目** | 认证：是（仅发起人，且 recruiting 状态）

**请求参数（body）**：5.1 字段可选（部分更新）。

**响应 data**：`build_project_item`

**可能错误码**：5001 不存在；5002 无权限；5003 状态流转不合法。

---

#### 5.5 `POST /api/v1/projects/<int:project_id>/apply`
**申请加入** | 认证：是

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `message` | string | 否 | 申请附言 |

**响应 data**：`build_application_item`

**可能错误码**：5001 不存在；5004 不能申请自己项目；5005 已申请过。

---

#### 5.6 `POST /api/v1/projects/<int:project_id>/applications/<int:app_id>/approve`
**通过申请** | 认证：是（仅 owner）

**响应 data**：`build_application_item`

**可能错误码**：5001 不存在；5002 无权限；5006 申请不存在；5007 申请已处理。

---

#### 5.7 `POST /api/v1/projects/<int:project_id>/applications/<int:app_id>/reject`
**拒绝申请** | 认证：是（仅 owner）

**响应 data**：`build_application_item`

**可能错误码**：同 5.6。

---

#### 5.8 `GET /api/v1/projects/<int:project_id>/applications`
**待审申请列表** | 认证：是（仅 owner） | 分页

**请求参数（query）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `status` | string | 否 | pending/approved/rejected/left/removed |

**响应 data**：分页，每项含 `application_id, project_id, user_id, status, message, created_at, processed_at, applicant`。

**可能错误码**：5001 不存在；5002 无权限。

---

#### 5.9 `GET /api/v1/projects/<int:project_id>/members`
**成员列表** | 认证：是

**响应 data**：`{ list: [{ user_id, nickname, avatar, level, role, joined_at }, ...], total }`
> `role`：`owner`（发起人）/ `member`（已通过成员）。

**可能错误码**：5001 不存在；5008 非成员。

---

#### 5.10 `GET /api/v1/projects/<int:project_id>/works`
**项目关联作品** | 认证：是 | 分页

**响应 data**：分页，每项为 Work 模型。

---

#### 5.11 `POST /api/v1/projects/<int:project_id>/close`
**关闭项目** | 认证：是（仅 owner）

**响应 data**：无（`message: 项目已关闭`）

**可能错误码**：5001 不存在；5002 无权限；5003 状态流转不合法。

---

#### 5.12 `POST /api/v1/projects/<int:project_id>/finish`
**结束项目** | 认证：是（仅 owner）

**业务规则**：ongoing→completed。

**响应 data**：无（`message: 项目已结束`）

**可能错误码**：5001 不存在；5002 无权限；5003 状态流转不合法。

---

#### 5.13 `POST /api/v1/projects/<int:project_id>/leave`
**退出项目** | 认证：是（成员，非 owner）

**响应 data**：无

**可能错误码**：5001 不存在；5008 非成员；5003 状态不合法。

---

#### 5.14 `POST /api/v1/projects/<int:project_id>/members/<int:user_id>/remove`
**移除成员** | 认证：是（仅 owner）

**响应 data**：无

**可能错误码**：5001 不存在；5002 无权限；5008 目标非成员。

---

#### 5.15 `GET /api/v1/projects/user/<int:user_id>`
**某用户项目** | 认证：是 | 分页

**响应 data**：分页，每项为 `build_project_item`。

---

#### 5.16 `GET /api/v1/projects/mine`
**我的项目** | 认证：是 | 分页

**请求参数（query）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `role` | string | 否 | 角色过滤 |

**响应 data**：分页，每项为 `build_project_item`。

---

#### 5.17 `GET /api/v1/projects/my-applications`
**我的申请列表** | 认证：是 | 分页

**请求参数（query）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `status` | string | 否 | pending/approved/rejected/left/removed |

**响应 data**：分页，每项为 `build_my_application_item`。

---

#### 5.18 `POST /api/v1/projects/<int:project_id>/ratings`
**提交互评** | 认证：是

**业务规则**：项目须 `completed`；当前用户须为成员；不可自评；同一 (project, from, to) 不可重复。

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `to_user_id` | int | 是 | 被评价者（须为项目成员） |
| `score` | int | 是 | 1-5 |
| `comment` | string | 否 | 评价内容 |
| `tags` | int[] | 否 | 评价标签 ID 数组 |
| `is_anonymous` | bool | 否 | 匿名，默认 false |

**响应 data**：`Rating.to_dict()`

**可能错误码**：5001 不存在；5008 非成员；5009 不能自评；5010 已评过；5011 项目未完成；5012 分数无效；5013 评价标签无效。

---

#### 5.19 `GET /api/v1/projects/<int:project_id>/ratings`
**互评列表** | 认证：是（仅成员） | 分页

**响应 data**：分页，每项 `Rating.to_dict()`；匿名评价 `from_user_id=null`、`from_user=null`，非匿名附带 `from_user`。

**可能错误码**：5001 不存在；5008 非成员。

---

### 6. 私聊会话模块

#### 6.1 `GET /api/v1/conversations/`
**联系人列表** | 认证：是 | 分页

**响应 data**：`{ list, total, page, page_size }`，每项：
```json
{ "conversation_id": 1, "contact": { "user_id": 2, "nickname": "...", "avatar": "...", "is_official": false },
  "last_message": "...", "last_message_at": "...", "unread_count": 0 }
```
> 排除官方账号（官方走 6.6）。

---

#### 6.2 `POST /api/v1/conversations/with/<int:user_id>`
**获取/创建与某用户的会话** | 认证：是

**响应 data**：`{ "conversation_id": <int> }`（保证 user1_id < user2_id；首次自动建双方未读记录）

**可能错误码**：3003 不能和自己对话；404 用户不存在。

---

#### 6.3 `GET /api/v1/conversations/<int:conversation_id>/messages`
**消息记录** | 认证：是 | 分页（按时间倒序）

**响应 data**：分页，每项：
```json
{ "message_id": 1, "sender_id": 2,
  "sender": { "user_id": 2, "nickname": "...", "avatar": "..." },
  "msg_type": "text", "content": "...",
  "file_name": null, "file_size": null, "voice_duration": null,
  "created_at": "..." }
```

**可能错误码**：3003 会话不存在或无权访问（404）。

---

#### 6.4 `POST /api/v1/conversations/<int:conversation_id>/messages`
**发送消息** | 认证：是

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `msg_type` | string | 是 | `text`/`image`/`voice`/`file`/`project_invite` |
| `content` | string | 是 | `project_invite` 时传任意非空（实际 project_id 从下方字段取） |
| `file_name` | string | 条件 | `file` 类型必填 |
| `file_size` | int | 条件 | `file` 类型必填 |
| `voice_duration` | int | 条件 | `voice` 类型必填 |
| `project_id` | int | 条件 | `project_invite` 类型必填（校验项目存在性） |

**业务规则**：关注关系校验——
- 接收方是官方账号 → 自由发；
- 互关 → 自由发；
- 单方面关注 → 我已发数 ≤ 对方已发数 + 1（否则 3002）；
- 陌生人（互不关注）→ 拒绝（3001）。

**响应 data**
```json
{ "message_id": 1, "msg_type": "project_invite", "content": "12", "created_at": "..." }
```
- `project_invite` 时额外返回 `project: { project_id, title, cover_url, status }`。

**可能错误码**：3003 会话不存在；400 参数缺失；3007 msg_type 不支持；5001 项目不存在；3001 陌生人禁发；3002 单方面关注限 1 条。

---

#### 6.5 `POST /api/v1/conversations/<int:conversation_id>/read`
**标记会话已读** | 认证：是

**响应 data**：`{ "unread_count": 0 }`（清零未读，更新 last_read_message_id）

**可能错误码**：3003 会话不存在或无权访问。

---

#### 6.6 `GET /api/v1/conversations/official`
**官方会话** | 认证：是

**响应 data**
```json
{ "conversation_id": 1, "official": { "user_id": 1, "nickname": "...", "avatar": "..." },
  "unread_count": 0, "last_message": "...", "last_message_at": "..." }
```
> 自动获取/创建与官方账号会话。

**可能错误码**：404 官方账号不存在。

---

### 7. 群聊模块

#### 7.1 `GET /api/v1/groups/`
**群列表** | 认证：是 | 分页

**响应 data**：`{ list, total, page, page_size }`，每项：
```json
{ "group_id": 1, "name": "...", "avatar": "...",
  "last_message": "...", "last_message_at": "...",
  "unread_count": 0, "member_count": 5 }
```

---

#### 7.2 `POST /api/v1/groups/`
**创建群** | 认证：是

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 群名称 |
| `avatar` | string | 否 | 群头像 |
| `member_ids` | int[] | 否 | 初始成员 ID 数组 |

**响应 data**：`{ "group_id": <int> }`（创建人自动为 owner）

---

#### 7.3 `GET /api/v1/groups/<int:group_id>/messages`
**群消息记录** | 认证：是 | 分页（按时间倒序）

**响应 data**：分页，每项同私聊消息结构（含 sender 摘要）。

**可能错误码**：3004 群不存在或非群成员（404）。

---

#### 7.4 `POST /api/v1/groups/<int:group_id>/messages`
**发送群消息** | 认证：是

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `msg_type` | string | 是 | `text`/`image`/`voice`/`file`/`rating_request` |
| `content` | string | 是 | `rating_request` 时传任意非空（实际取 project_id） |
| `file_name` | string | 条件 | `file` 类型必填 |
| `file_size` | int | 条件 | `file` 类型必填 |
| `voice_duration` | int | 条件 | `voice` 类型必填 |
| `project_id` | int | 条件 | `rating_request` 类型必填（校验项目存在性） |

**响应 data**
```json
{ "message_id": 1, "msg_type": "rating_request", "content": "12", "created_at": "..." }
```
- `rating_request` 时额外返回 `project: { project_id, title, cover_url, status }`；其他成员未读 +1。

**可能错误码**：3004 非群成员；400 参数缺失；3007 msg_type 不支持；5001 项目不存在。

---

#### 7.5 `POST /api/v1/groups/<int:group_id>/read`
**标记群已读** | 认证：是

**响应 data**：`{ "unread_count": 0 }`

**可能错误码**：3004 非群成员。

---

#### 7.6 `GET /api/v1/groups/<int:group_id>/members`
**群成员列表** | 认证：是

**响应 data**：`{ list: [{ user_id, nickname, avatar, role, joined_at, group_nickname }, ...], total }`
> `role` 枚举：`owner` / `admin` / `member`。

**可能错误码**：3004 非群成员。

---

#### 7.7 `POST /api/v1/groups/<int:group_id>/invite`
**邀请成员入群** | 认证：是（仅 owner/admin）

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `user_ids` | int[] | 是 | 被邀请用户 ID 数组 |

**响应 data**：`{ "added": [int, ...], "added_count": <int> }`（已存在/无效用户自动跳过）

**可能错误码**：403 无权邀请；400 user_ids 为空；3004 非群成员。

---

#### 7.8 `POST /api/v1/groups/<int:group_id>/leave`
**退出群聊** | 认证：是（群主不能退）

**响应 data**：无（`message: 已退出群聊`）

**可能错误码**：3004 非群成员；3008 群主不能直接退出。

---

### 8. 消息附件上传

#### 8.1 `POST /api/v1/messages/upload`
**消息附件上传** | 认证：是 | form-data

**请求参数（form-data）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | file | 是 | 单文件，上限 20MB |

**响应 data**
```json
{ "file_url": "/uploads/messages/xxx.png", "file_name": "图片.png",
  "file_size": 102400, "file_type": "image" }
```
> `file_type` 取值：`image` / `voice` / `video` / `file`。格式见[四](#四上传接口细节)。

**可能错误码**：400 未找到文件/文件名为空/类型不支持/超过 20MB。

---

### 9. 通知模块

#### 9.1 `GET /api/v1/notifications/unread-counts`
**未读数** | 认证：是

**响应 data**
```json
{ "official": 0, "interaction": 0, "todo": 0 }
```
> official 为与官方账号会话的未读数；interaction/todo 为对应类型未读通知数。

---

#### 9.2 `GET /api/v1/notifications/interaction`
**互动通知列表** | 认证：是 | 分页

**请求参数（query）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `subtype` | string | 否 | `like`/`comment`/`follow` |

**响应 data**：分页，每项：
```json
{ "notification_id": 1, "subtype": "like", "title": "...", "content": "...",
  "sender": { "user_id": 2, "nickname": "...", "avatar": "..." },
  "related_type": "work", "related_id": 10,
  "related_work": { "work_id": 10, "title": "...", "cover_url": "...", "files": ["/uploads/..."] },
  "is_read": false, "created_at": "..." }
```

---

#### 9.3 `GET /api/v1/notifications/todo`
**待办通知列表** | 认证：是 | 分页

**请求参数（query）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `subtype` | string | 否 | `apply` |

**响应 data**：分页，每项 `{ notification_id, subtype, title, content, related_type, related_id, is_read, created_at }`。

---

#### 9.4 `POST /api/v1/notifications/<int:notification_id>/read`
**标记单条已读** | 认证：是

**响应 data**：无（`message: 已标记为已读`）

**可能错误码**：404 通知不存在。

---

#### 9.5 `POST /api/v1/notifications/read-all`
**批量已读** | 认证：是

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 否 | `interaction`/`todo`，不传则全部 |

**响应 data**：`{ "updated_count": <int> }`

---

### 10. 关注模块

#### 10.1 `POST /api/v1/users/<int:user_id>/follow`
**关注某人** | 认证：是

**响应 data**：`{ "is_following": true, "is_mutual": false }`（同时给被关注者发 follow 互动通知）

**可能错误码**：3005 不能关注自己；404 用户不存在；3006 已关注该用户。

---

#### 10.2 `DELETE /api/v1/users/<int:user_id>/follow`
**取消关注** | 认证：是

**响应 data**：`{ "is_following": false }`

**可能错误码**：404 未关注该用户。

---

#### 10.3 `GET /api/v1/users/<int:user_id>/follow/status`
**关注状态** | 认证：是

**响应 data**
```json
{ "is_following": false, "is_followed_by": false, "is_mutual": false }
```

---

#### 10.4 `GET /api/v1/following`
**我的关注列表** | 认证：是 | 分页

**响应 data**：分页，每项 `{ user_id, nickname, avatar, bio, is_mutual, followed_at }`。

---

#### 10.5 `GET /api/v1/followers`
**我的粉丝列表** | 认证：是 | 分页

**响应 data**：分页，每项 `{ user_id, nickname, avatar, bio, is_mutual, followed_at }`。

---

#### 10.6 `GET /api/v1/users/<int:user_id>/follow/stats`
**关注/粉丝计数** | 认证：**否**

**响应 data**
```json
{ "following_count": 12, "followers_count": 34 }
```

---

### 11. 活动模块

#### 11.1 `GET /api/v1/events/`
**活动列表** | 认证：是 | 分页

**请求参数（query）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `status` | string | 否 | 默认 `ongoing` |

**响应 data**：分页，每项为 Event 模型。

---

#### 11.2 `GET /api/v1/events/<int:event_id>`
**活动详情** | 认证：是

**响应 data**：Event 模型 + `is_joined: bool`（当前用户是否已参与）

**可能错误码**：6001 活动不存在（404）。

---

#### 11.3 `POST /api/v1/events/<int:event_id>/join`
**参与活动** | 认证：是

**请求参数（body）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `work_id` | int | 是 | 参评作品 ID（须为自己已发布的作品） |

**响应 data**：EventParticipant 模型（活动 participant_count +1）

**可能错误码**：6001 活动不存在；6004 活动已结束；6002 作品不存在或不属于你；6003 已参与该活动。

---

### 12. 用户搜索

#### 12.1 `GET /api/v1/users/search`
**用户搜索** | 认证：是 | 分页

**请求参数（query）**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `q` | string | 是 | 关键词（nickname 模糊匹配，ilike） |

**响应 data**：分页，每项为 User 模型。

**可能错误码**：400 q 为空。

---

## 四、上传接口细节

三个上传接口均为 **单文件上传**，字段名 `file`（`multipart/form-data`）。多文件场景前端循环调用。返回均为相对 URL，前端拼接 host。

| 接口 | folder | 格式限制 | 大小限制 | 返回 |
|------|--------|----------|----------|------|
| `POST /works/upload` | `works` | jpg/jpeg/png/gif/webp/mp4/mov | 500MB 全局 | `{ url }` |
| `POST /profile/upload` | `profile` | 同上（图片/视频为主） | 500MB 全局 | `{ url, file_name, file_type }` |
| `POST /messages/upload` | `messages` | jpg/jpeg/png/gif/webp/mp4/mov/mp3/wav/m4a/pdf/doc/docx/zip/rar | 20MB | `{ file_url, file_name, file_size, file_type }` |

**works.files 存储**：URL 数组（JSON 字符串），如 `["/uploads/works/a.png", "/uploads/works/b.jpg"]`，最多 9 个。

**file_type 判定规则**
- `image`：jpg/jpeg/png/gif/webp
- `voice`：mp3/wav/m4a
- `video`：mp4/mov
- `file`：pdf/doc/docx/zip/rar 等（messages 上传兜底）
- `pdf` / `doc`：profile 上传细分类型

---

## 五、错误码完整表

### 通用

| 码 | message | HTTP | 前端处理 |
|----|---------|------|----------|
| 401 | 未登录或 Token 过期 | 401 | **跳登录页**，清除本地 token |
| 429 | 验证码发送过于频繁 | 429 | **倒计时提示**（60s） |
| 400 | 请求参数不能为空 / 格式错误 | 400 | 弹提示 |
| 403 | 无权限 | 403 | 弹提示 |
| 404 | 资源不存在 | 404 | 弹提示 |
| 500 | 服务器错误 | 500 | 弹提示 |

### 1xxx — 认证模块

| 码 | message | HTTP | 前端处理 |
|----|---------|------|----------|
| 1001 | 手机号格式不正确 | 400 | 弹提示 |
| 1002 | 验证码错误 / 验证码场景不匹配 | 400 | 弹提示 |
| 1003 | 验证码已过期 | 400 | 重新获取 |
| 1004 | 请先发送验证码 | 400 | 弹提示 |
| 1005 | 该手机号已注册 | 400 | 弹提示 |
| 1006 | 手机号或密码错误 / 该手机号未注册 | 400 | 弹提示 |
| 1007 | 密码格式不正确（8-20 位含字母+数字） | 400 | 弹提示 |
| 1008 | 场景参数不合法（register/reset） | 400 | 弹提示 |

### 2xxx — 档案模块

| 码 | message | HTTP | 前端处理 |
|----|---------|------|----------|
| 2001 | 身份类型不合法 | 400 | 弹提示 |
| 2002 | 存在无效的技能 ID | 404 | 弹提示 |
| 2004 | 最多选择 5 个技能 | 400 | 弹提示 |
| 2005 | 最多选择 5 个风格词汇 | 400 | 弹提示 |
| 2006 | 存在无效的风格词汇 ID | 404 | 弹提示 |
| 2010 | 无权限（工作/教育/能力经历不存在或非本人） | 403/404 | 弹提示 |
| 2011 | 学段不合法（小学/中学/大学） | 400 | 弹提示 |
| 2012 | 图片/文件数量超限 | 400 | 弹提示 |

### 3xxx — 作品 + 消息模块

| 码 | message | HTTP | 前端处理 |
|----|---------|------|----------|
| 3001 | 作品不存在或未发布 | 404 | 弹提示 |
| 3002 | 无权限（操作他人作品） | 403 | 弹提示 |
| 3003 | 作品已删除 / 不能和自己对话 / 会话不存在或无权访问 | 400/404 | 弹提示 |
| 3004 | 渠道不合法 / 群不存在或非群成员 | 400/404 | 弹提示 |
| 3005 | 文件数超限 (>9) / 不能关注自己 | 400 | 弹提示 |
| 3006 | 技能标签无效 / 已关注该用户 | 400 | 弹提示 |
| 3007 | 可见性类型无效 / msg_type 暂不支持 | 400 | 弹提示 |
| 3008 | 自定义规则超限 (>20) / 群主不能直接退出 | 400 | 弹提示 |
| 3009 | 转发参数互斥（source_work_id / source_project_id 二选一） | 400 | 弹提示 |

### 4xxx — 互动模块

| 码 | message | HTTP | 前端处理 |
|----|---------|------|----------|
| 4001 | 作品不存在或未发布 | 404 | 弹提示 |
| 4002 | 无权删除他人评论 | 403 | 弹提示 |
| 4003 | 已点赞过该作品 | 400 | **静默忽略** |
| 4004 | 未点赞过该作品 | 400 | **静默忽略** |
| 4005 | 评论/父评论不存在 | 404 | 弹提示 |
| 4006 | 评论内容不能为空 | 400 | 弹提示 |
| 4007 | 回复层级超限（只能回复一级评论） | 400 | 弹提示 |

### 5xxx — 项目模块

| 码 | message | HTTP | 前端处理 |
|----|---------|------|----------|
| 5001 | 项目不存在 | 404 | 弹提示 |
| 5002 | 无权限（非项目发起人） | 403 | 弹提示 |
| 5003 | 状态流转不合法 | 400 | 弹提示 |
| 5004 | 不能申请自己的项目 | 400 | 弹提示 |
| 5005 | 已申请过该项目 | 400 | 弹提示 |
| 5006 | 申请不存在 | 404 | 弹提示 |
| 5007 | 申请已处理 | 400 | 弹提示 |
| 5008 | 非项目成员 | 403 | 弹提示 |
| 5009 | 不能自评 | 400 | 弹提示 |
| 5010 | 已评价过该成员 | 400 | 弹提示 |
| 5011 | 项目未完成，无法互评 | 400 | 弹提示 |
| 5012 | 分数须在 1-5 之间 | 400 | 弹提示 |
| 5013 | 评价标签无效或未启用 | 400 | 弹提示 |

### 6xxx — 活动模块

| 码 | message | HTTP | 前端处理 |
|----|---------|------|----------|
| 6001 | 活动不存在 | 404 | 弹提示 |
| 6002 | 作品不存在或不属于你 | 404 | 弹提示 |
| 6003 | 已参与该活动 | 400 | 弹提示 |
| 6004 | 活动已结束 | 400 | 弹提示 |

> 前端处理总览：`401` → 跳登录页；`429` → 倒计时提示；`4003`/`4004` → 静默忽略；其余 → 弹提示。

---

## 六、字段结构说明

### JSON 数组字段（DB 存 JSON 字符串，API 返回数组）

| 字段 | 所属模型 | 结构 | 说明 |
|------|----------|------|------|
| `files` | Work | `["/uploads/works/a.png", ...]` | URL 数组，最多 9 个 |
| `skill_tags` | Work | `[1, 3, 5]` | 技能 ID 数组，最多 5 个 |
| `collaborators` | Work | `[101, 102]` | 用户 ID 数组 |
| `tags` | Rating | `[1, 2, 3]` | 评价标签 ID 数组 |
| `required_skills` | Project | `[1, 2]` | 技能 ID 数组 |

### Boolean 字段返回格式

| 字段 | 返回 | 说明 |
|------|------|------|
| `is_collaborative` | `true`/`false` | Work，db.Boolean |
| `is_anonymous` | `true`/`false` | Rating，db.Boolean；匿名时 to_dict 隐去 from_user |
| `is_read` | `true`/`false` | Notification，db.Boolean |
| `is_deleted` | `true`/`false` | Comment，db.Boolean（软删除） |
| `contact_visible` | `true`/`false` | Project，db.Boolean |
| `is_active` | `true`/`false` | RatingTag / StyleTag，db.Boolean |

### 时间格式

- 所有时间字段通过 `.isoformat()` 返回，格式如 `2026-09-15T10:30:00`。
- **无时区后缀**（UTC 存储，输出不带 `Z`/`+00:00`）。
- `null` 表示该时间为空（如未发布作品的 `published_at`）。

### 枚举值完整列表

| 字段 | 取值 | 说明 |
|------|------|------|
| `works.channel` | `writing` / `visual` / `video` / `voice` | 作品频道 |
| `works.content_type` | `original` / `repost` / `text_only` | 原创 / 转发 / 纯文字 |
| `works.image_layout` | `flip` / `grid` | flip=翻页(小红书) grid=并排(朋友圈)，仅 channel=visual 有效 |
| `works.visibility_type` | `private` / `followers` / `mutual` / `public` / `custom_allow` / `custom_deny` | 可见性（6 种） |
| `works.status` | `draft` / `published` / `deleted` | 草稿 / 已发布 / 软删除 |
| `projects.status` | `recruiting` / `ongoing` / `completed` / `closed` | 招募中 / 进行中 / 已完成 / 已关闭 |
| `project_applications.status` | `pending` / `approved` / `rejected` / `left` / `removed` | 待审 / 通过 / 拒绝 / 退出 / 被踢 |
| `messages.msg_type` | `text` / `image` / `voice` / `file` / `project_invite` / `rating_request` | 消息类型 |
| `notifications.type` | `interaction` / `todo` / `system` | 通知大类 |
| `notifications.subtype` | interaction → `like`/`comment`/`follow`；todo → `apply`；system → `leave`/`removed` | 通知子类型 |
| `rating_tags.category` | `positive` / `negative` / `neutral` | 评价标签分类 |
| `groups.role` | `owner` / `admin` / `member` | 群成员角色 |
| `projects.member.role` | `owner` / `member` | 项目成员角色（owner=发起人） |

### 可见性规则（works.visibility_type）

| 类型 | 可见范围 |
|------|----------|
| `private` | 仅作者本人 |
| `followers` | 作者 + 我关注了作者的人 |
| `mutual` | 作者 + 双向关注 |
| `public` | 所有人 |
| `custom_allow` | 作者 + 白名单 `WorkVisibilityRule(rule_type=allow)` 用户 |
| `custom_deny` | 作者 + 不在黑名单 `WorkVisibilityRule(rule_type=deny)` 的用户 |

---

## 七、无需认证的接口清单

以下接口无需 `Authorization` 头即可调用：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 根健康检查 |
| GET | `/api/v1` | API 健康检查 |
| GET | `/profile/skills` | 技能扁平列表（可按 category_id 过滤） |
| GET | `/profile/skills/categories` | 技能分类字典 |
| GET | `/profile/style-tags` | 风格词汇字典（is_active=True） |
| POST | `/auth/send-code` | 发送验证码 |
| POST | `/auth/register` | 注册 |
| POST | `/auth/login` | 密码登录 |
| POST | `/auth/reset-password` | 重置密码 |
| GET | `/users/<int:user_id>/follow/stats` | 关注/粉丝计数 |

> 其余接口均需 JWT Bearer Token 认证；Token 缺失/过期统一返回 `401`，前端应跳转登录页。

---

## 附录：模型字段表

> 以下为各模型 `to_dict()` 返回的字段，供前端对接响应结构时参考。

### <a id="user"></a>User

| 字段 | 类型 | 说明 |
|------|------|------|
| `user_id` | int | 用户 ID |
| `phone` | string | 手机号（仅本人返回完整号） |
| `nickname` | string | 昵称 |
| `avatar` | string | 头像 URL |
| `bio` | string | 简介 |
| `level` | int | 等级 |
| `exp` | int | 经验值 |
| `is_new_user` | bool | 是否新用户 |
| `is_official` | bool | 是否官方账号 |
| `follower_count` | int | 粉丝数 |
| `following_count` | int | 关注数 |
| `work_count` | int | 作品数 |
| `project_count` | int | 项目数 |
| `created_at` | string | 注册时间 |
| `updated_at` | string | 更新时间 |

### Profile

| 字段 | 说明 |
|------|------|
| `profile_id` | 档案 ID |
| `user_id` | 用户 ID |
| `identity` | 身份（学生/艺术爱好者/艺术相关工作者） |
| `skills` | 技能数组（with_relations） |
| `style_tags` | 风格词汇数组（with_relations） |
| `work_experiences` | 工作经历数组（with_relations） |
| `education_experiences` | 教育经历数组（with_relations） |
| `ability_proofs` | 能力证明数组（with_relations） |

### Work

| 字段 | 说明 |
|------|------|
| `work_id` | 作品 ID |
| `user_id` | 作者 ID |
| `title` | 标题 |
| `description` | 描述 |
| `text_content` | 纯文字内容 |
| `channel` | 频道 |
| `content_type` | 内容类型 |
| `image_layout` | 图片布局 |
| `visibility_type` | 可见性 |
| `location` | 地点 |
| `cover_url` | 封面 URL |
| `files` | 文件 URL 数组 |
| `skill_tags` | 技能 ID 数组 |
| `collaborators` | 协作者 ID 数组 |
| `is_collaborative` | 是否共创 |
| `status` | 状态 |
| `view_count` | 浏览数 |
| `like_count` | 点赞数 |
| `comment_count` | 评论数 |
| `repost_count` | 转发数 |
| `share_count` | 分享数 |
| `project_id` | 关联项目 ID |
| `published_at` | 发布时间 |
| `created_at` | 创建时间 |
| `updated_at` | 更新时间 |

### Comment

| 字段 | 说明 |
|------|------|
| `comment_id` | 评论 ID |
| `work_id` | 作品 ID |
| `user_id` | 评论者 ID |
| `parent_id` | 父评论 ID |
| `reply_to_user_id` | 被回复用户 ID |
| `content` | 内容 |
| `is_deleted` | 是否删除 |
| `created_at` | 创建时间 |
| `updated_at` | 更新时间 |

### Conversation

| 字段 | 说明 |
|------|------|
| `conversation_id` | 会话 ID |
| `last_message_content` | 最后一条消息预览 |
| `last_message_at` | 最后消息时间 |
| `created_at` | 创建时间 |

### Message

| 字段 | 说明 |
|------|------|
| `message_id` | 消息 ID |
| `conversation_type` | private/group |
| `conversation_id` | 私聊会话 ID |
| `group_id` | 群 ID |
| `sender_id` | 发送者 ID |
| `msg_type` | 消息类型 |
| `content` | 内容 |
| `file_name` | 文件名 |
| `file_size` | 文件大小 |
| `voice_duration` | 语音时长 |
| `related_id` / `related_type` | 关联对象 |
| `created_at` | 创建时间 |

### Group

| 字段 | 说明 |
|------|------|
| `group_id` | 群 ID |
| `name` | 群名 |
| `avatar` | 群头像 |
| `owner_id` | 群主 ID |
| `project_id` | 关联项目 ID |
| `member_count` | 成员数 |
| `last_message_content` | 最后消息预览 |
| `last_message_at` | 最后消息时间 |
| `created_at` | 创建时间 |

### GroupMember

| 字段 | 说明 |
|------|------|
| `group_id` | 群 ID |
| `user_id` | 用户 ID |
| `role` | 角色（owner/admin/member） |
| `nickname` | 群昵称 |
| `joined_at` | 加入时间 |

### Notification

| 字段 | 说明 |
|------|------|
| `notification_id` | 通知 ID |
| `user_id` | 接收者 ID |
| `sender_id` | 触发者 ID |
| `type` | 大类（interaction/todo/system） |
| `subtype` | 子类型 |
| `title` | 标题 |
| `content` | 内容 |
| `related_type` | 关联对象类型 |
| `related_id` | 关联对象 ID |
| `is_read` | 是否已读 |
| `created_at` | 创建时间 |

### Project

| 字段 | 说明 |
|------|------|
| `project_id` | 项目 ID |
| `user_id` | 发起人 ID |
| `title` | 标题 |
| `description` | 描述 |
| `topic` | 主题 |
| `mode` | 模式 |
| `cover_url` | 封面 URL |
| `budget` | 预算 |
| `deadline` | 截止日期 |
| `max_members` | 人数上限 |
| `required_level` | 等级要求 |
| `required_project_count` | 历史项目数要求 |
| `required_skills` | 技能 ID 数组 |
| `contact_visible` | 联系方式可见 |
| `status` | 状态 |
| `created_at` | 创建时间 |
| `updated_at` | 更新时间 |

### ProjectApplication

| 字段 | 说明 |
|------|------|
| `id` | 申请 ID |
| `project_id` | 项目 ID |
| `user_id` | 申请者 ID |
| `status` | 申请状态 |
| `message` | 申请附言 |
| `created_at` | 创建时间 |
| `processed_at` | 处理时间 |

### Rating

| 字段 | 说明 |
|------|------|
| `rating_id` | 评价 ID |
| `project_id` | 项目 ID |
| `from_user_id` | 评价者 ID（匿名时为 null） |
| `to_user_id` | 被评价者 ID |
| `score` | 分数（1-5） |
| `comment` | 评价内容 |
| `tags` | 评价标签 ID 数组 |
| `is_anonymous` | 是否匿名 |
| `created_at` | 创建时间 |

### RatingTag

| 字段 | 说明 |
|------|------|
| `id` | 标签 ID |
| `name` | 名称 |
| `category` | 分类（positive/negative/neutral） |
| `sort_order` | 排序 |
| `is_active` | 是否启用 |
| `created_at` | 创建时间 |

### Skill

| 字段 | 说明 |
|------|------|
| `id` | 技能 ID |
| `category_id` | 分类 ID |
| `name` | 名称 |
| `sort_order` | 排序 |

### StyleTag

| 字段 | 说明 |
|------|------|
| `id` | 标签 ID |
| `name` | 名称 |
| `sort_order` | 排序 |
| `is_active` | 是否启用 |
| `created_at` | 创建时间 |

### WorkExperience

| 字段 | 说明 |
|------|------|
| `id` | 经历 ID |
| `company_name` | 公司名 |
| `position` | 职位 |
| `start_date` | 开始日期 |
| `end_date` | 结束日期 |
| `is_current` | 是否在职 |
| `description` | 描述 |
| `sort_order` | 排序 |
| `images` | 图片数组 |

### EducationExperience

| 字段 | 说明 |
|------|------|
| `id` | 经历 ID |
| `school_level` | 学段 |
| `school_name` | 学校名 |
| `start_year` | 开始年份 |
| `end_year` | 结束年份 |
| `degree` | 学位 |
| `major` | 专业 |
| `sort_order` | 排序 |

### AbilityProof

| 字段 | 说明 |
|------|------|
| `id` | 证明 ID |
| `title` | 标题 |
| `description` | 描述 |
| `sort_order` | 排序 |
| `files` | 文件数组（file_url/file_name/file_type/sort_order） |

### Event

| 字段 | 说明 |
|------|------|
| `event_id` | 活动 ID |
| `title` | 标题 |
| `description` | 描述 |
| `cover_url` | 封面 URL |
| `reward` | 奖励 |
| `status` | 状态 |
| `deadline` | 截止时间 |
| `participant_count` | 参与人数 |
| `created_at` | 创建时间 |

### EventParticipant

| 字段 | 说明 |
|------|------|
| `id` | 记录 ID |
| `event_id` | 活动 ID |
| `user_id` | 用户 ID |
| `work_id` | 作品 ID |
| `score` | 得分 |
| `rank` | 排名 |
| `created_at` | 创建时间 |

### Follow

| 字段 | 说明 |
|------|------|
| `id` | 关注 ID |
| `follower_id` | 关注者 ID |
| `followed_id` | 被关注者 ID |
| `created_at` | 关注时间 |

### WorkRepost

| 字段 | 说明 |
|------|------|
| `id` | 记录 ID |
| `work_id` | 转发作品 ID |
| `source_work_id` | 源作品 ID |
| `source_project_id` | 源项目 ID |
| `source_user_id` | 源用户 ID |
| `created_at` | 创建时间 |

### WorkVisibilityRule

| 字段 | 说明 |
|------|------|
| `id` | 规则 ID |
| `work_id` | 作品 ID |
| `user_id` | 用户 ID |
| `rule_type` | allow / deny |
| `created_at` | 创建时间 |

### WorkViewHistory / ProjectViewHistory

| 字段 | 说明 |
|------|------|
| `id` | 记录 ID |
| `user_id` | 浏览者 ID |
| `work_id` / `project_id` | 作品/项目 ID |
| `author_id` | 作者 ID |
| `view_count` | 浏览次数 |
| `last_viewed_at` | 最后浏览时间 |
| `created_at` | 创建时间 |
