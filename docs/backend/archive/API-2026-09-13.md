# 艺联萌后端接口文档（API.md）

> 最后更新：2026-09-13（含项目增强+消息类型扩展） · 从代码自动提取 · 共 **96** 个接口

## 一、基础信息

| 项目 | 说明 |
|------|------|
| 基础路径 | `http://{host}:8080/api/v1` |
| 请求体格式 | `Content-Type: application/json` |
| 文件上传 | `Content-Type: multipart/form-data` |
| 认证方式 | JWT Bearer Token（请求头 `Authorization: Bearer <token>`） |
| 分页参数 | `?page=1&page_size=20` |
| 分页返回 | `{ total, page, page_size, total_pages, list }` |

### 响应格式

```json
{ "code": 200, "message": "success", "data": { ... } }
```

HTTP 状态码与业务码分离：HTTP 遵循语义（200/400/401/403/404/429/500），`code` 为业务码。

### 错误码分段

| 范围 | 模块 | 示例 |
|------|------|------|
| 200 | 成功 | — |
| 1xxx | 认证 | 1001 手机号格式 / 1005 已注册 / 1008 场景参数 |
| 3xxx | 作品 | 3001 不存在 / 3003 草稿不可见 |
| 5xxx | 项目 | 5001 不存在 / 5002 无权限 / 5008 非成员 / 5009 不可自评 / 5010 已评 / 5011 项目未完成 / 5012 无效分数 |

## 二、接口汇总表

| # | 方法 | 路径 | 认证 | 说明 |
|---|------|------|------|------|
| 1 | POST | `/auth/login` | — | 密码登录 |
| 2 | POST | `/auth/logout` | ✓ | 登出 |
| 3 | GET | `/auth/me` | ✓ | 获取当前用户信息 |
| 4 | POST | `/auth/refresh` | ✓ | 刷新 Token |
| 5 | POST | `/auth/register` | — | 注册新用户 |
| 6 | POST | `/auth/reset-password` | — | 重置密码 |
| 7 | POST | `/auth/send-code` | — | 发送验证码 |
| 8 | GET | `/profile/<int:user_id>` | ✓ | /profile/<int:user_id> |
| 9 | GET | `/profile/ability-proofs` | ✓ | 能力证明列表 / 创建 |
| 10 | POST | `/profile/ability-proofs` | ✓ | 能力证明列表 / 创建 |
| 11 | DELETE | `/profile/ability-proofs/<int:proof_id>` | ✓ | 更新 / 删除能力证明 |
| 12 | PUT | `/profile/ability-proofs/<int:proof_id>` | ✓ | 更新 / 删除能力证明 |
| 13 | GET | `/profile/education-experiences` | ✓ | 教育经历列表 / 创建 |
| 14 | POST | `/profile/education-experiences` | ✓ | 教育经历列表 / 创建 |
| 15 | DELETE | `/profile/education-experiences/<int:edu_id>` | ✓ | 更新 / 删除教育经历 |
| 16 | PUT | `/profile/education-experiences/<int:edu_id>` | ✓ | 更新 / 删除教育经历 |
| 17 | GET | `/profile/homepage/<int:user_id>` | ✓ | /profile/homepage/<int:user_id> |
| 18 | GET | `/profile/me` | ✓ | 我的档案 / 更新档案 |
| 19 | PUT | `/profile/me` | ✓ | 我的档案 / 更新档案 |
| 20 | GET | `/profile/skills` | — | 技能列表 / 更新技能 |
| 21 | PUT | `/profile/skills` | ✓ | 技能列表 / 更新技能 |
| 22 | GET | `/profile/skills/categories` | — | 技能分类 |
| 23 | GET | `/profile/skills/mine` | ✓ | 我的技能 |
| 24 | GET | `/profile/style-tags` | — | 风格标签列表 / 更新 |
| 25 | PUT | `/profile/style-tags` | ✓ | 风格标签列表 / 更新 |
| 26 | GET | `/profile/style-tags/mine` | ✓ | 我的风格标签 |
| 27 | POST | `/profile/upload` | ✓ | 档案文件上传 |
| 28 | GET | `/profile/views/projects` | ✓ | 我浏览过的项目 |
| 29 | GET | `/profile/views/works` | ✓ | 我浏览过的作品 |
| 30 | GET | `/profile/work-experiences` | ✓ | 工作经历列表 / 创建 |
| 31 | POST | `/profile/work-experiences` | ✓ | 工作经历列表 / 创建 |
| 32 | DELETE | `/profile/work-experiences/<int:exp_id>` | ✓ | 更新 / 删除工作经历 |
| 33 | PUT | `/profile/work-experiences/<int:exp_id>` | ✓ | 更新 / 删除工作经历 |
| 34 | POST | `/works/` | ✓ | 作品列表 / 创建作品 |
| 35 | DELETE | `/works/<int:work_id>` | ✓ | 作品详情 / 编辑 / 删除 |
| 36 | GET | `/works/<int:work_id>` | ✓ | 作品详情 / 编辑 / 删除 |
| 37 | PUT | `/works/<int:work_id>` | ✓ | 作品详情 / 编辑 / 删除 |
| 38 | GET | `/works/<int:work_id>/comments` | ✓ | 评论列表 / 发表评论 |
| 39 | POST | `/works/<int:work_id>/comments` | ✓ | 评论列表 / 发表评论 |
| 40 | DELETE | `/works/<int:work_id>/like` | ✓ | 点赞 / 取消点赞 |
| 41 | POST | `/works/<int:work_id>/like` | ✓ | 点赞 / 取消点赞 |
| 42 | GET | `/works/<int:work_id>/likes` | ✓ | 点赞用户列表 |
| 43 | POST | `/works/<int:work_id>/publish` | ✓ | 发布作品 |
| 44 | POST | `/works/<int:work_id>/repost` | ✓ | 转推作品 |
| 45 | GET | `/works/by-skill` | ✓ | 按技能筛选作品 |
| 46 | GET | `/works/feed` | ✓ | 推荐流 |
| 47 | GET | `/works/feed/following` | ✓ | 关注流 |
| 48 | GET | `/works/mine` | ✓ | 我的作品 |
| 49 | GET | `/works/search` | ✓ | 搜索作品 |
| 50 | POST | `/works/upload` | ✓ | 作品文件上传 |
| 51 | GET | `/works/user/<int:user_id>` | ✓ | /works/user/<int:user_id> |
| 52 | GET | `/works/user/<int:user_id>/liked` | ✓ | /works/user/<int:user_id>/liked |
| 53 | DELETE | `/comments/<int:comment_id>` | ✓ | 删除评论（软删除） |
| 54 | GET | `/comments/<int:comment_id>/replies` | ✓ | 获取评论的回复列表 |
| 55 | GET | `/projects/` | ✓ | 项目列表 / 创建项目 |
| 56 | POST | `/projects/` | ✓ | 项目列表 / 创建项目 |
| 57 | GET | `/projects/<int:project_id>` | ✓ | 项目详情 / 编辑项目 |
| 58 | PUT | `/projects/<int:project_id>` | ✓ | 项目详情 / 编辑项目 |
| 59 | POST | `/projects/<int:project_id>/applications/<int:app_id>/approve` | ✓ | /projects/<id>/applications/<id>/approve |
| 60 | POST | `/projects/<int:project_id>/applications/<int:app_id>/reject` | ✓ | /projects/<id>/applications/<id>/reject |
| 61 | POST | `/projects/<int:project_id>/apply` | ✓ | 申请加入项目 |
| 62 | POST | `/projects/<int:project_id>/close` | ✓ | 关闭项目 |
| 63 | POST | `/projects/<int:project_id>/finish` | ✓ | 结束项目 |
| 64 | POST | `/projects/<int:project_id>/leave` | ✓ | 退出项目 |
| 65 | POST | `/projects/<int:project_id>/members/<int:user_id>/remove` | ✓ | /projects/<id>/members/<int:user_id>/remove |
| 66 | GET | `/projects/<int:project_id>/ratings` | ✓ | 提交互评 / 互评列表 |
| 67 | POST | `/projects/<int:project_id>/ratings` | ✓ | 提交互评 / 互评列表 |
| 68 | GET | `/projects/mine` | ✓ | 我的项目 |
| 69 | GET | `/projects/my-applications` | ✓ | 我的申请列表 |
| 70 | GET | `/projects/user/<int:user_id>` | ✓ | /projects/user/<int:user_id> |
| 71 | GET | `/conversations/` | ✓ | 会话列表 |
| 72 | GET | `/conversations/<int:conversation_id>/messages` | ✓ | 获取会话消息 |
| 73 | POST | `/conversations/<int:conversation_id>/messages` | ✓ | 发送会话消息 |
| 74 | POST | `/conversations/<int:conversation_id>/read` | ✓ | 标记会话已读 |
| 75 | GET | `/conversations/official` | ✓ | 官方会话 |
| 76 | POST | `/conversations/with/<int:user_id>` | ✓ | /conversations/with/<int:user_id> |
| 77 | GET | `/groups/` | ✓ | 群列表 / 创建群 |
| 78 | POST | `/groups/` | ✓ | 群列表 / 创建群 |
| 79 | POST | `/groups/<int:group_id>/invite` | ✓ | 邀请成员入群 |
| 80 | POST | `/groups/<int:group_id>/leave` | ✓ | 退出群聊 |
| 81 | GET | `/groups/<int:group_id>/members` | ✓ | 群成员列表 |
| 82 | GET | `/groups/<int:group_id>/messages` | ✓ | 群消息列表 |
| 83 | POST | `/groups/<int:group_id>/messages` | ✓ | 发送群消息 |
| 84 | POST | `/groups/<int:group_id>/read` | ✓ | 群消息已读 |
| 85 | POST | `/messages/upload` | ✓ | 消息附件上传 |
| 86 | POST | `/notifications/<int:notification_id>/read` | ✓ | 标记通知已读 |
| 87 | GET | `/notifications/interaction` | ✓ | 互动通知列表 |
| 88 | POST | `/notifications/read-all` | ✓ | 全部标记已读 |
| 89 | GET | `/notifications/todo` | ✓ | 待办通知列表 |
| 90 | GET | `/notifications/unread-counts` | ✓ | 未读消息计数 |
| 91 | GET | `/followers` | ✓ | 我的粉丝列表 |
| 92 | GET | `/following` | ✓ | 我的关注列表 |
| 93 | DELETE | `/users/<int:user_id>/follow` | ✓ | /users/<int:user_id>/follow |
| 94 | POST | `/users/<int:user_id>/follow` | ✓ | /users/<int:user_id>/follow |
| 95 | GET | `/users/<int:user_id>/follow/stats` | — | /users/<int:user_id>/follow/stats |
| 96 | GET | `/users/<int:user_id>/follow/status` | ✓ | /users/<int:user_id>/follow/status |

## 三、接口详情

### 认证模块

### 1. `POST /api/v1/auth/login`
**密码登录** | 认证：否

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `password` | JSON 字段 |
| body | `phone` | JSON 字段 |

**响应数据**
- 模型 `User`（变量 `user`）→ 字段见[附录](#附录模型字段表) `User`

---

### 2. `POST /api/v1/auth/logout`
**登出** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 3. `GET /api/v1/auth/me`
**获取当前用户信息** | 认证：是

**请求参数**：无

**响应数据**
- 模型 `User`（变量 `user`）→ 字段见[附录](#附录模型字段表) `User`

---

### 4. `POST /api/v1/auth/refresh`
**刷新 Token** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 5. `POST /api/v1/auth/register`
**注册新用户** | 认证：否

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `code` | JSON 字段 |
| body | `nickname` | JSON 字段 |
| body | `password` | JSON 字段 |
| body | `phone` | JSON 字段 |

**响应数据**
- 模型 `User`（变量 `user`）→ 字段见[附录](#附录模型字段表) `User`

---

### 6. `POST /api/v1/auth/reset-password`
**重置密码** | 认证：否

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `code` | JSON 字段 |
| body | `new_password` | JSON 字段 |
| body | `phone` | JSON 字段 |

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 7. `POST /api/v1/auth/send-code`
**发送验证码** | 认证：否

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `phone` | JSON 字段 |
| body | `scene` | JSON 字段 |

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 创作者档案 + 个人主页

### 8. `GET /api/v1/profile/<int:user_id>`
**/profile/<int:user_id>** | 认证：是

**请求参数**：无

**响应数据**
- 模型 `Profile`（变量 `profile`）→ 字段见[附录](#附录模型字段表) `Profile`

---

### 9. `GET /api/v1/profile/ability-proofs`
**能力证明列表 / 创建** | 认证：是

**请求参数**：无

**响应数据**
- 模型 `a`（变量 `a`）→ 字段见[附录](#附录模型字段表) `a`

---

### 10. `POST /api/v1/profile/ability-proofs`
**能力证明列表 / 创建** | 认证：是

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `description` | JSON 字段 |
| body | `files` | JSON 字段 |
| body | `sort_order` | JSON 字段 |
| body | `title` | JSON 字段 |

**响应数据**
- 模型 `item`（变量 `item`）→ 字段见[附录](#附录模型字段表) `item`

---

### 11. `DELETE /api/v1/profile/ability-proofs/<int:proof_id>`
**更新 / 删除能力证明** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 12. `PUT /api/v1/profile/ability-proofs/<int:proof_id>`
**更新 / 删除能力证明** | 认证：是

**请求参数**：无

**响应数据**
- 模型 `item`（变量 `item`）→ 字段见[附录](#附录模型字段表) `item`

---

### 13. `GET /api/v1/profile/education-experiences`
**教育经历列表 / 创建** | 认证：是

**请求参数**：无

**响应数据**
- 模型 `e`（变量 `e`）→ 字段见[附录](#附录模型字段表) `e`

---

### 14. `POST /api/v1/profile/education-experiences`
**教育经历列表 / 创建** | 认证：是

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `degree` | JSON 字段 |
| body | `end_year` | JSON 字段 |
| body | `major` | JSON 字段 |
| body | `school_level` | JSON 字段 |
| body | `school_name` | JSON 字段 |
| body | `sort_order` | JSON 字段 |
| body | `start_year` | JSON 字段 |

**响应数据**
- 模型 `item`（变量 `item`）→ 字段见[附录](#附录模型字段表) `item`

---

### 15. `DELETE /api/v1/profile/education-experiences/<int:edu_id>`
**更新 / 删除教育经历** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 16. `PUT /api/v1/profile/education-experiences/<int:edu_id>`
**更新 / 删除教育经历** | 认证：是

**请求参数**：无

**响应数据**
- 模型 `item`（变量 `item`）→ 字段见[附录](#附录模型字段表) `item`

---

### 17. `GET /api/v1/profile/homepage/<int:user_id>`
**/profile/homepage/<int:user_id>** | 认证：是

**请求参数**：无

**响应数据**
- 模型 `Profile`（变量 `profile`）→ 字段见[附录](#附录模型字段表) `Profile`
- 模型 `User`（变量 `user`）→ 字段见[附录](#附录模型字段表) `User`

---

### 18. `GET /api/v1/profile/me`
**我的档案 / 更新档案** | 认证：是

**请求参数**：无

**响应数据**
- 模型 `Profile`（变量 `profile`）→ 字段见[附录](#附录模型字段表) `Profile`

---

### 19. `PUT /api/v1/profile/me`
**我的档案 / 更新档案** | 认证：是

**请求参数**：无

**响应数据**
- 模型 `Profile`（变量 `profile`）→ 字段见[附录](#附录模型字段表) `Profile`

---

### 20. `GET /api/v1/profile/skills`
**技能列表 / 更新技能** | 认证：否

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| query | `category_id` | URL 查询参数 |

**响应数据**
- 模型 `s`（变量 `s`）→ 字段见[附录](#附录模型字段表) `s`

---

### 21. `PUT /api/v1/profile/skills`
**技能列表 / 更新技能** | 认证：是

**请求参数**：无

**响应数据**
- 模型 `s`（变量 `s`）→ 字段见[附录](#附录模型字段表) `s`

---

### 22. `GET /api/v1/profile/skills/categories`
**技能分类** | 认证：否

**请求参数**：无

**响应数据**
- 模型 `c`（变量 `c`）→ 字段见[附录](#附录模型字段表) `c`

---

### 23. `GET /api/v1/profile/skills/mine`
**我的技能** | 认证：是

**请求参数**：无

**响应数据**
- 模型 `Skill`（变量 `skill`）→ 字段见[附录](#附录模型字段表) `Skill`

---

### 24. `GET /api/v1/profile/style-tags`
**风格标签列表 / 更新** | 认证：否

**请求参数**：无

**响应数据**
- 模型 `t`（变量 `t`）→ 字段见[附录](#附录模型字段表) `t`

---

### 25. `PUT /api/v1/profile/style-tags`
**风格标签列表 / 更新** | 认证：是

**请求参数**：无

**响应数据**
- 模型 `t`（变量 `t`）→ 字段见[附录](#附录模型字段表) `t`

---

### 26. `GET /api/v1/profile/style-tags/mine`
**我的风格标签** | 认证：是

**请求参数**：无

**响应数据**
- 模型 `style_tag`（变量 `style_tag`）→ 字段见[附录](#附录模型字段表) `style_tag`

---

### 27. `POST /api/v1/profile/upload`
**档案文件上传** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 28. `GET /api/v1/profile/views/projects`
**我浏览过的项目** | 认证：是 | 分页

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 29. `GET /api/v1/profile/views/works`
**我浏览过的作品** | 认证：是 | 分页

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 30. `GET /api/v1/profile/work-experiences`
**工作经历列表 / 创建** | 认证：是

**请求参数**：无

**响应数据**
- 模型 `Work`（变量 `w`）→ 字段见[附录](#附录模型字段表) `Work`

---

### 31. `POST /api/v1/profile/work-experiences`
**工作经历列表 / 创建** | 认证：是

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `company_name` | JSON 字段 |
| body | `description` | JSON 字段 |
| body | `end_date` | JSON 字段 |
| body | `images` | JSON 字段 |
| body | `is_current` | JSON 字段 |
| body | `position` | JSON 字段 |
| body | `sort_order` | JSON 字段 |
| body | `start_date` | JSON 字段 |

**响应数据**
- 模型 `item`（变量 `item`）→ 字段见[附录](#附录模型字段表) `item`

---

### 32. `DELETE /api/v1/profile/work-experiences/<int:exp_id>`
**更新 / 删除工作经历** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 33. `PUT /api/v1/profile/work-experiences/<int:exp_id>`
**更新 / 删除工作经历** | 认证：是

**请求参数**：无

**响应数据**
- 模型 `item`（变量 `item`）→ 字段见[附录](#附录模型字段表) `item`

---

### 作品 + 广场

### 34. `POST /api/v1/works/`
**作品列表 / 创建作品** | 认证：是

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `allow_users` | JSON 字段 |
| body | `channel` | JSON 字段 |
| body | `collaborators` | JSON 字段 |
| body | `content_type` | JSON 字段 |
| body | `cover_url` | JSON 字段 |
| body | `deny_users` | JSON 字段 |
| body | `description` | JSON 字段 |
| body | `files` | JSON 字段 |
| body | `image_layout` | JSON 字段 |
| body | `is_collaborative` | JSON 字段 |
| body | `location` | JSON 字段 |
| body | `skill_tags` | JSON 字段 |
| body | `source_project_id` | JSON 字段 |
| body | `source_work_id` | JSON 字段 |
| body | `status` | JSON 字段 |
| body | `text_content` | JSON 字段 |
| body | `title` | JSON 字段 |
| body | `visibility_type` | JSON 字段 |

**响应数据**
- 模型 `Work`（变量 `work`）→ 字段见[附录](#附录模型字段表) `Work`

---

### 35. `DELETE /api/v1/works/<int:work_id>`
**作品详情 / 编辑 / 删除** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 36. `GET /api/v1/works/<int:work_id>`
**作品详情 / 编辑 / 删除** | 认证：是

**请求参数**：无

**响应数据**
- 模型 `src`（变量 `src`）→ 字段见[附录](#附录模型字段表) `src`
- 模型 `Work`（变量 `work`）→ 字段见[附录](#附录模型字段表) `Work`

---

### 37. `PUT /api/v1/works/<int:work_id>`
**作品详情 / 编辑 / 删除** | 认证：是

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `location` | JSON 字段 |

**响应数据**
- 模型 `Work`（变量 `work`）→ 字段见[附录](#附录模型字段表) `Work`

---

### 38. `GET /api/v1/works/<int:work_id>/comments`
**评论列表 / 发表评论** | 认证：是 | 分页

**请求参数**：无

**响应数据**
- 模型 `c`（变量 `c`）→ 字段见[附录](#附录模型字段表) `c`
- 分页包装：`{ list, total, page, page_size, total_pages }`

---

### 39. `POST /api/v1/works/<int:work_id>/comments`
**评论列表 / 发表评论** | 认证：是

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `content` | JSON 字段 |
| body | `parent_id` | JSON 字段 |

**响应数据**
- 模型 `Comment`（变量 `comment`）→ 字段见[附录](#附录模型字段表) `Comment`

---

### 40. `DELETE /api/v1/works/<int:work_id>/like`
**点赞 / 取消点赞** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 41. `POST /api/v1/works/<int:work_id>/like`
**点赞 / 取消点赞** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 42. `GET /api/v1/works/<int:work_id>/likes`
**点赞用户列表** | 认证：是 | 分页

**请求参数**：无

**响应数据**
- 模型 `l`（变量 `l`）→ 字段见[附录](#附录模型字段表) `l`
- 分页包装：`{ list, total, page, page_size, total_pages }`

---

### 43. `POST /api/v1/works/<int:work_id>/publish`
**发布作品** | 认证：是

**请求参数**：无

**响应数据**
- 模型 `Work`（变量 `work`）→ 字段见[附录](#附录模型字段表) `Work`

---

### 44. `POST /api/v1/works/<int:work_id>/repost`
**转推作品** | 认证：是

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `allow_users` | JSON 字段 |
| body | `deny_users` | JSON 字段 |
| body | `description` | JSON 字段 |
| body | `location` | JSON 字段 |
| body | `visibility_type` | JSON 字段 |

**响应数据**
- 模型 `new_work`（变量 `new_work`）→ 字段见[附录](#附录模型字段表) `new_work`
- 模型 `src`（变量 `src`）→ 字段见[附录](#附录模型字段表) `src`

---

### 45. `GET /api/v1/works/by-skill`
**按技能筛选作品** | 认证：是 | 分页

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| query | `skill_id` | URL 查询参数 |
| query | `sort` | URL 查询参数 |

**响应数据**
- 构造函数 `build_work_list_item`（在路由文件中查看详情）
- 分页包装：`{ list, total, page, page_size, total_pages }`

---

### 46. `GET /api/v1/works/feed`
**推荐流** | 认证：是 | 分页

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| query | `channel` | URL 查询参数 |
| query | `content_type` | URL 查询参数 |
| query | `exclude_self` | URL 查询参数 |
| query | `sort` | URL 查询参数 |

**响应数据**
- 构造函数 `build_work_list_item`（在路由文件中查看详情）
- 分页包装：`{ list, total, page, page_size, total_pages }`

---

### 47. `GET /api/v1/works/feed/following`
**关注流** | 认证：是 | 分页

**请求参数**：无

**响应数据**
- 构造函数 `build_work_list_item`（在路由文件中查看详情）
- 分页包装：`{ list, total, page, page_size, total_pages }`

---

### 48. `GET /api/v1/works/mine`
**我的作品** | 认证：是 | 分页

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| query | `status` | URL 查询参数 |

**响应数据**
- 模型 `Work`（变量 `w`）→ 字段见[附录](#附录模型字段表) `Work`
- 分页包装：`{ list, total, page, page_size, total_pages }`

---

### 49. `GET /api/v1/works/search`
**搜索作品** | 认证：是 | 分页

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| query | `channel` | URL 查询参数 |
| query | `content_type` | URL 查询参数 |
| query | `q` | URL 查询参数 |

**响应数据**
- 构造函数 `build_work_list_item`（在路由文件中查看详情）
- 分页包装：`{ list, total, page, page_size, total_pages }`

---

### 50. `POST /api/v1/works/upload`
**作品文件上传** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 51. `GET /api/v1/works/user/<int:user_id>`
**/works/user/<int:user_id>** | 认证：是 | 分页

**请求参数**：无

**响应数据**
- 模型 `Work`（变量 `w`）→ 字段见[附录](#附录模型字段表) `Work`
- 分页包装：`{ list, total, page, page_size, total_pages }`

---

### 52. `GET /api/v1/works/user/<int:user_id>/liked`
**/works/user/<int:user_id>/liked** | 认证：是 | 分页

**请求参数**：无

**响应数据**
- 模型 `Work`（变量 `w`）→ 字段见[附录](#附录模型字段表) `Work`
- 分页包装：`{ list, total, page, page_size, total_pages }`

---

### 互动（点赞/评论）

### 53. `DELETE /api/v1/comments/<int:comment_id>`
**删除评论（软删除）** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 54. `GET /api/v1/comments/<int:comment_id>/replies`
**获取评论的回复列表** | 认证：是 | 分页

**请求参数**：无

**响应数据**
- 模型 `c`（变量 `c`）→ 字段见[附录](#附录模型字段表) `c`
- 分页包装：`{ list, total, page, page_size, total_pages }`

---

### 协作项目

### 55. `GET /api/v1/projects/`
**项目列表 / 创建项目** | 认证：是 | 分页

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| query | `mode` | URL 查询参数 |
| query | `skill_id` | URL 查询参数 |
| query | `status` | URL 查询参数 |

**响应数据**
- 构造函数 `build_project_item`（在路由文件中查看详情）
- 分页包装：`{ list, total, page, page_size, total_pages }`

---

### 56. `POST /api/v1/projects/`
**项目列表 / 创建项目** | 认证：是

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `budget` | JSON 字段 |
| body | `contact_visible` | JSON 字段 |
| body | `cover_url` | JSON 字段 |
| body | `deadline` | JSON 字段 |
| body | `description` | JSON 字段 |
| body | `max_members` | JSON 字段 |
| body | `mode` | JSON 字段 |
| body | `required_level` | JSON 字段 |
| body | `required_project_count` | JSON 字段 |
| body | `required_skills` | JSON 字段 |
| body | `title` | JSON 字段 |
| body | `topic` | JSON 字段 |

**响应数据**
- 构造函数 `build_project_item`（在路由文件中查看详情）

---

### 57. `GET /api/v1/projects/<int:project_id>`
**项目详情 / 编辑项目** | 认证：是

**请求参数**：无

**响应数据**
- 构造函数 `build_project_item`（在路由文件中查看详情）

> `build_project_item` 返回的 `data` 包含以下增强字段：
>
> | 字段 | 类型 | 说明 |
> |------|------|------|
> | `member_avatars` | array | 已招募成员头像列表（最多 5 个，含发起人），每项 `{user_id, avatar, nickname}` |
> | `creator.skills` | array | 队长技能列表，每项为 Skill 对象 `{id, category_id, name, sort_order}` |
> | `creator.joined_project_count` | int | 队长作为已通过成员参与的项目数 |

---

### 58. `PUT /api/v1/projects/<int:project_id>`
**项目详情 / 编辑项目** | 认证：是

**请求参数**：无

**响应数据**
- 构造函数 `build_project_item`（在路由文件中查看详情）

---

### 59. `POST /api/v1/projects/<int:project_id>/applications/<int:app_id>/approve`
**/projects/<id>/applications/<id>/approve** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 60. `POST /api/v1/projects/<int:project_id>/applications/<int:app_id>/reject`
**/projects/<id>/applications/<id>/reject** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 61. `POST /api/v1/projects/<int:project_id>/apply`
**申请加入项目** | 认证：是

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `message` | JSON 字段 |

**响应数据**
- 构造函数 `build_application_item`（在路由文件中查看详情）

---

### 62. `POST /api/v1/projects/<int:project_id>/close`
**关闭项目** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 63. `POST /api/v1/projects/<int:project_id>/finish`
**结束项目** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 64. `POST /api/v1/projects/<int:project_id>/leave`
**退出项目** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 65. `POST /api/v1/projects/<int:project_id>/members/<int:user_id>/remove`
**/projects/<id>/members/<int:user_id>/remove** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 66. `GET /api/v1/projects/<int:project_id>/ratings`
**提交互评 / 互评列表** | 认证：是 | 分页

**请求参数**：无

**响应数据**
- 模型 `r`（变量 `r`）→ 字段见[附录](#附录模型字段表) `r`
- 模型 `User`（变量 `u`）→ 字段见[附录](#附录模型字段表) `User`
- 分页包装：`{ list, total, page, page_size, total_pages }`

---

### 67. `POST /api/v1/projects/<int:project_id>/ratings`
**提交互评 / 互评列表** | 认证：是

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `comment` | JSON 字段 |
| body | `is_anonymous` | JSON 字段 |
| body | `score` | JSON 字段 |
| body | `tags` | JSON 字段 |
| body | `to_user_id` | JSON 字段 |

**响应数据**
- 模型 `Rating`（变量 `rating`）→ 字段见[附录](#附录模型字段表) `Rating`

---

### 68. `GET /api/v1/projects/mine`
**我的项目** | 认证：是 | 分页

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| query | `role` | URL 查询参数 |

**响应数据**
- 构造函数 `build_project_item`（在路由文件中查看详情）
- 分页包装：`{ list, total, page, page_size, total_pages }`

---

### 69. `GET /api/v1/projects/my-applications`
**我的申请列表** | 认证：是 | 分页

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| query | `status` | URL 查询参数 |

**响应数据**
- 构造函数 `build_my_application_item`（在路由文件中查看详情）
- 分页包装：`{ list, total, page, page_size, total_pages }`

---

### 70. `GET /api/v1/projects/user/<int:user_id>`
**/projects/user/<int:user_id>** | 认证：是 | 分页

**请求参数**：无

**响应数据**
- 构造函数 `build_project_item`（在路由文件中查看详情）
- 分页包装：`{ list, total, page, page_size, total_pages }`

---

### 私信会话

### 71. `GET /api/v1/conversations/`
**会话列表** | 认证：是 | 分页

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 72. `GET /api/v1/conversations/<int:conversation_id>/messages`
**获取会话消息** | 认证：是 | 分页

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 73. `POST /api/v1/conversations/<int:conversation_id>/messages`
**发送会话消息** | 认证：是

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `content` | JSON 字段（`project_invite` 类型时传任意非空值，实际 project_id 从 `project_id` 字段取） |
| body | `file_name` | JSON 字段（`file` 类型必填） |
| body | `file_size` | JSON 字段（`file` 类型必填） |
| body | `msg_type` | JSON 字段，枚举：`text` / `image` / `file` / `voice` / `project_invite` |
| body | `project_id` | JSON 字段（`project_invite` 类型必填，校验项目存在性） |
| body | `voice_duration` | JSON 字段（`voice` 类型必填） |

**响应数据**
- `msg_type='project_invite'` 时，`data` 额外返回：
  - `message_id`: int
  - `msg_type`: 'project_invite'
  - `content`: str（存储 project_id 字符串）
  - `project`: `{ project_id, title, cover_url, status }`
  - `created_at`: ISO 时间

---

### 74. `POST /api/v1/conversations/<int:conversation_id>/read`
**标记会话已读** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 75. `GET /api/v1/conversations/official`
**官方会话** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 76. `POST /api/v1/conversations/with/<int:user_id>`
**/conversations/with/<int:user_id>** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 群聊

### 77. `GET /api/v1/groups/`
**群列表 / 创建群** | 认证：是 | 分页

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 78. `POST /api/v1/groups/`
**群列表 / 创建群** | 认证：是

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `avatar` | JSON 字段 |
| body | `member_ids` | JSON 字段 |
| body | `name` | JSON 字段 |

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 79. `POST /api/v1/groups/<int:group_id>/invite`
**邀请成员入群** | 认证：是

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `user_ids` | JSON 字段 |

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 80. `POST /api/v1/groups/<int:group_id>/leave`
**退出群聊** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 81. `GET /api/v1/groups/<int:group_id>/members`
**群成员列表** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 82. `GET /api/v1/groups/<int:group_id>/messages`
**群消息列表** | 认证：是 | 分页

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 83. `POST /api/v1/groups/<int:group_id>/messages`
**发送群消息** | 认证：是

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `content` | JSON 字段（`rating_request` 类型时传任意非空值，实际 project_id 从 `project_id` 字段取） |
| body | `file_name` | JSON 字段（`file` 类型必填） |
| body | `file_size` | JSON 字段（`file` 类型必填） |
| body | `msg_type` | JSON 字段，枚举：`text` / `image` / `file` / `voice` / `rating_request` |
| body | `project_id` | JSON 字段（`rating_request` 类型必填，校验项目存在性） |
| body | `voice_duration` | JSON 字段（`voice` 类型必填） |

**响应数据**
- `msg_type='rating_request'` 时，`data` 额外返回：
  - `message_id`: int
  - `msg_type`: 'rating_request'
  - `content`: str（存储 project_id 字符串）
  - `project`: `{ project_id, title, cover_url, status }`
  - `created_at`: ISO 时间

---

### 84. `POST /api/v1/groups/<int:group_id>/read`
**群消息已读** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 消息附件

### 85. `POST /api/v1/messages/upload`
**消息附件上传** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 通知

### 86. `POST /api/v1/notifications/<int:notification_id>/read`
**标记通知已读** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 87. `GET /api/v1/notifications/interaction`
**互动通知列表** | 认证：是 | 分页

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| query | `subtype` | URL 查询参数 |

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 88. `POST /api/v1/notifications/read-all`
**全部标记已读** | 认证：是

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| body | `type` | JSON 字段 |

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 89. `GET /api/v1/notifications/todo`
**待办通知列表** | 认证：是 | 分页

**请求参数**

| 位置 | 参数 | 说明 |
|------|------|------|
| query | `subtype` | URL 查询参数 |

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 90. `GET /api/v1/notifications/unread-counts`
**未读消息计数** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 关注关系

### 91. `GET /api/v1/followers`
**我的粉丝列表** | 认证：是 | 分页

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 92. `GET /api/v1/following`
**我的关注列表** | 认证：是 | 分页

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 93. `DELETE /api/v1/users/<int:user_id>/follow`
**/users/<int:user_id>/follow** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 94. `POST /api/v1/users/<int:user_id>/follow`
**/users/<int:user_id>/follow** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 95. `GET /api/v1/users/<int:user_id>/follow/stats`
**/users/<int:user_id>/follow/stats** | 认证：否

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

### 96. `GET /api/v1/users/<int:user_id>/follow/status`
**/users/<int:user_id>/follow/status** | 认证：是

**请求参数**：无

**响应数据**：`{ code, message, data }`（data 通常为 null 或简单值）

---

## 附录：模型字段表

以下为各模型 `to_dict()` 返回的字段，供前端对接响应结构时参考。

### Comment

| 字段 |
|------|
| `comment_id` |
| `content` |
| `created_at` |
| `is_deleted` |
| `parent_id` |
| `reply_to_user_id` |
| `updated_at` |
| `user_id` |
| `work_id` |

### Conversation

| 字段 |
|------|
| `conversation_id` |
| `created_at` |
| `last_message_at` |
| `last_message_content` |

### ConversationRead

| 字段 |
|------|
| `conversation_id` |
| `last_read_message_id` |
| `unread_count` |
| `updated_at` |
| `user_id` |

### Event

| 字段 |
|------|
| `cover_url` |
| `created_at` |
| `deadline` |
| `description` |
| `event_id` |
| `participant_count` |
| `reward` |
| `status` |
| `title` |

### EventParticipant

| 字段 |
|------|
| `created_at` |
| `event_id` |
| `id` |
| `rank` |
| `score` |
| `user_id` |
| `work_id` |

### Follow

| 字段 |
|------|
| `created_at` |
| `followed_id` |
| `follower_id` |
| `id` |

### Group

| 字段 |
|------|
| `avatar` |
| `created_at` |
| `group_id` |
| `last_message_at` |
| `last_message_content` |
| `member_count` |
| `name` |
| `owner_id` |
| `project_id` |

### GroupMember

| 字段 |
|------|
| `group_id` |
| `joined_at` |
| `nickname` |
| `role` |
| `user_id` |

### GroupRead

| 字段 |
|------|
| `group_id` |
| `last_read_message_id` |
| `unread_count` |
| `updated_at` |
| `user_id` |

### Like

| 字段 |
|------|
| `created_at` |
| `like_id` |
| `user_id` |
| `work_id` |

### Message

| 字段 |
|------|
| `content` |
| `conversation_id` |
| `conversation_type` |
| `created_at` |
| `file_name` |
| `file_size` |
| `group_id` |
| `message_id` |
| `msg_type` |
| `related_id` |
| `related_type` |
| `sender_id` |
| `voice_duration` |

### Notification

| 字段 |
|------|
| `content` |
| `created_at` |
| `is_read` |
| `notification_id` |
| `related_id` |
| `related_type` |
| `sender_id` |
| `subtype` |
| `title` |
| `type` |
| `user_id` |

### Project

| 字段 |
|------|
| `budget` |
| `contact_visible` |
| `cover_url` |
| `created_at` |
| `deadline` |
| `description` |
| `max_members` |
| `mode` |
| `project_id` |
| `required_level` |
| `required_project_count` |
| `required_skills` |
| `status` |
| `title` |
| `topic` |
| `updated_at` |
| `user_id` |

### ProjectApplication

| 字段 |
|------|
| `created_at` |
| `id` |
| `message` |
| `processed_at` |
| `project_id` |
| `status` |
| `user_id` |

### ProjectRequiredSkill

| 字段 |
|------|
| `created_at` |
| `filled_count` |
| `id` |
| `project_id` |
| `required_count` |
| `skill` |

### ProjectViewHistory

| 字段 |
|------|
| `author_id` |
| `created_at` |
| `id` |
| `last_viewed_at` |
| `project_id` |
| `user_id` |
| `view_count` |

### Rating

| 字段 |
|------|
| `comment` |
| `created_at` |
| `from_user_id` |
| `is_anonymous` |
| `project_id` |
| `rating_id` |
| `score` |
| `tags` |
| `to_user_id` |

### RatingTag

| 字段 |
|------|
| `category` |
| `created_at` |
| `id` |
| `is_active` |
| `name` |
| `sort_order` |

### Transaction

| 字段 |
|------|
| `amount` |
| `created_at` |
| `description` |
| `id` |
| `type` |
| `user_id` |

### User

| 字段 |
|------|
| `avatar` |
| `bio` |
| `created_at` |
| `exp` |
| `follower_count` |
| `following_count` |
| `is_new_user` |
| `is_official` |
| `level` |
| `nickname` |
| `phone` |
| `project_count` |
| `updated_at` |
| `user_id` |
| `work_count` |

### Wallet

| 字段 |
|------|
| `balance` |
| `created_at` |
| `id` |
| `total_earned` |
| `total_withdrawn` |
| `updated_at` |
| `user_id` |

### Work

| 字段 |
|------|
| `channel` |
| `collaborators` |
| `comment_count` |
| `content_type` |
| `cover_url` |
| `created_at` |
| `description` |
| `files` |
| `image_layout` |
| `is_collaborative` |
| `like_count` |
| `location` |
| `project_id` |
| `published_at` |
| `repost_count` |
| `share_count` |
| `skill_tags` |
| `status` |
| `text_content` |
| `title` |
| `updated_at` |
| `user_id` |
| `view_count` |
| `visibility_type` |
| `work_id` |

### WorkRepost

| 字段 |
|------|
| `created_at` |
| `id` |
| `source_project_id` |
| `source_user_id` |
| `source_work_id` |
| `work_id` |

### WorkTop

| 字段 |
|------|
| `created_at` |
| `ended_at` |
| `id` |
| `is_active` |
| `reason` |
| `started_at` |
| `weight` |
| `work_id` |

### WorkViewHistory

| 字段 |
|------|
| `author_id` |
| `created_at` |
| `id` |
| `last_viewed_at` |
| `user_id` |
| `view_count` |
| `work_id` |

### WorkVisibilityRule

| 字段 |
|------|
| `created_at` |
| `id` |
| `rule_type` |
| `user_id` |
| `work_id` |
