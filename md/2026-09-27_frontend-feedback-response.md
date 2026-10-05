# 前端反馈答复（2026-09-27）

> 针对前端同学提出的 A（阻塞项）/B（字段缺口）/C（写接口缺失与字段矛盾）三类问题，逐条答复如下。涉及代码修复的已标注 ✅。

---

## A. 阻塞项

### A-1 后端服务地址 / 启动方式

- **入口文件**：`app.py`，内容为 `app.run(host='0.0.0.0', port=8080, debug=True)`
- **本地访问**：`http://localhost:8080/api/v1/{路由}`
- **局域网/服务器**：`http://<服务器IP>:8080/api/v1/{路由}`（需后端先 `python app.py` 启动）
- **端口**：固定 `8080`，目前未发现端口冲突；如部署到服务器，外网访问需开放 8080
- **CORS**：`CORS(app, resources={r"/api/*": {"origins": "*"}})`，所有 `/api/*` 路由允许任意 Origin，前端本地开发不会跨域拦截
- **debug 模式**：开发态开启（自动热重载 + 异常栈），上线前会关
- **dev_code**：`POST /api/v1/auth/send-code` 始终在响应 `data.dev_code` 中返回验证码（**无环境判断**），前端调用任意手机号即可拿到验证码，无需真实短信通道

### A-2 测试账号

dev_code 机制已开放，前端可自助注册任意手机号。另提供 2 个预置账号（执行种子脚本后可用）：

| 账号 | 手机号 | 密码 | 身份 | 备注 |
|---|---|---|---|---|
| A | 15500000001 | Pass1234 | 学生 | 美院学生，有 2 条作品、1 个招募项目 |
| B | 15500000002 | Pass1234 | 艺术相关工作者 | 独立插画师，有 1 条作品、1 条项目申请 |

> 密码格式要求：8-20 位、含字母+数字（正则 `^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$`）。

### A-3 种子数据 ✅

已生成脚本 [scripts/seed_test_data.py](file:///C:/Users/z1595/Desktop/yilianmeng-main/scripts/seed_test_data.py)，执行：

```
cd <项目根>
python scripts/seed_test_data.py
```

脚本写入内容（可重复执行，先清理旧数据再写入）：

- 2 个互关用户（A↔B 双向 follow）
- 1 个群组「艺联萌联调群」（A 为 owner，B 为 member）
- 3 条已发布作品：w1=writing（A，public）、w2=visual（B，public，含 2 张图、1 赞 1 评论）、w3=video（A，followers 可见）
- 1 个招募中项目（A 发起，paid 模式，budget=2000，deadline=2026-12-31T23:59:59），含 2 条 required_skills
- 1 条 pending 申请（B 申请加入 A 的项目）
- 若干通知：B 收到点赞+评论互动通知；A 收到项目申请待办通知
- 字典：4 个技能分类 + 8 个技能 + 5 个风格标签 + 5 个评价标签

脚本最后会打印 user_id 和 token，前端可直接使用。

---

## B. 字段缺口（真实 JSON 示例）

### B-1 `build_work_list_item`（推流/搜索/按技能/关注 Tab 通用列表项）

适用接口：`GET /works/feed`、`/works/feed/following`、`/works/search`、`/works/by-skill`、`GET /users/<id>/works`

> **注意**：代码中**没有** `is_following_author` 字段。若前端需要判断是否已关注作者，请用 `GET /profile/homepage/<user_id>` 返回的 `is_following` 字段，或前端缓存关注列表自行比对。

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "list": [
      {
        "work_id": 12,
        "user_id": 2,
        "title": "《城市切片》插画",
        "description": "城市光影系列第 3 张",
        "channel": "visual",
        "content_type": "original",
        "visibility_type": "public",
        "image_layout": "grid",
        "cover_url": "https://cdn.example.com/w2.png",
        "files": ["https://cdn.example.com/w2_1.png", "https://cdn.example.com/w2_2.png"],
        "skill_tags": [],
        "is_collaborative": false,
        "collaborators": [],
        "location": null,
        "status": "published",
        "like_count": 1,
        "comment_count": 1,
        "view_count": 0,
        "repost_count": 0,
        "share_count": 0,
        "published_at": "2026-09-27T10:00:00",
        "created_at": "2026-09-27T10:00:00",
        "updated_at": "2026-09-27T10:00:00",
        "author": {
          "user_id": 2,
          "nickname": "艺小B",
          "avatar": "https://cdn.example.com/b.png",
          "phone": "155****0002",
          "level": 1,
          "exp": 0,
          "bio": "独立插画师，3 年商稿经验",
          "is_new_user": false,
          "is_official": false,
          "following_count": 1,
          "follower_count": 1,
          "work_count": 1,
          "project_count": 0,
          "created_at": "2026-09-27T09:00:00",
          "updated_at": "2026-09-27T09:00:00"
        },
        "is_liked": true,
        "source": null
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20
  }
}
```

**转发帖（content_type=repost）的 `source` 字段**：仅当 `work.content_type == 'repost'` 时出现，结构为：

```json
"source": {
  "type": "work",
  "source_user_id": 2,
  "data": { ...原作品 to_dict(with_author=true)... }
}
```

若原作品不可见/已删除/不存在：`"data": null, "reason": "invisible" | "deleted" | "not_found"`。
若转发的是项目：`"type": "project", "source_user_id": <项目发起人>, "data": { ...Project.to_dict()... }`。

### B-2 `build_project_item`（项目列表 / 详情）

适用接口：`POST /projects/`、`GET /projects/`、`GET /projects/<id>`、`GET /projects/<id>?with_applications=true&with_members=true`

> **关键澄清**：
> - `member_count` **不是数据库字段**，而是动态计算（approved 申请数 + 1 个发起人）
> - `required_skills` 来自 `project.to_dict()`，返回**对象数组**（不是 `[1,2]` ID 数组），每项含 `{id, project_id, skill, required_count, filled_count}`
> - 代码中**没有**「当前用户是否符合招募要求」的结论字段；前端可基于 `required_level`、`required_project_count`、`creator.joined_project_count` 等字段自行渲染

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "project_id": 5,
    "user_id": 1,
    "title": "校园文创周边设计招募",
    "description": "招 2 名插画师做校园文创",
    "mode": "paid",
    "budget": 2000,
    "deadline": "2026-12-31T23:59:59",
    "max_members": 3,
    "cover_url": "https://cdn.example.com/p.png",
    "topic": "设计",
    "required_level": 1,
    "required_project_count": 0,
    "contact_visible": true,
    "status": "recruiting",
    "created_at": "2026-09-27T10:00:00",
    "updated_at": "2026-09-27T10:00:00",
    "required_skills": [
      {
        "id": 1,
        "project_id": 5,
        "skill": { "id": 1, "category_id": 1, "name": "写作技能1", "sort_order": 1 },
        "required_count": 1,
        "filled_count": 0
      }
    ],
    "creator": {
      "user_id": 1,
      "nickname": "艺小A",
      "avatar": "https://cdn.example.com/a.png",
      "phone": "155****0001",
      "level": 1,
      "exp": 0,
      "bio": "美术学院大三，主修视觉传达",
      "is_new_user": false,
      "is_official": false,
      "following_count": 1,
      "follower_count": 1,
      "work_count": 2,
      "project_count": 1,
      "created_at": "2026-09-27T09:00:00",
      "updated_at": "2026-09-27T09:00:00",
      "skills": [
        { "id": 1, "category_id": 1, "name": "写作技能1", "sort_order": 1 }
      ],
      "joined_project_count": 0
    },
    "is_creator": true,
    "member_count": 1,
    "member_avatars": [
      { "user_id": 1, "avatar": "https://cdn.example.com/a.png", "nickname": "艺小A" }
    ],
    "my_application": null,
    "applications": null,
    "members": null
  }
}
```

- `applications`：仅当 `with_applications=true` **且**当前用户是发起人时返回数组，否则为 `null`
- `members`：仅当 `with_members=true` 时返回完整成员 `User.to_dict()` 数组，否则为 `null`
- `my_application`：当前用户对该项目的申请对象（无则 `null`）

### B-3 `_build_my_application_item`（我的申请列表项）

适用接口：`GET /projects/my-applications`

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "list": [
      {
        "application_id": 8,
        "project_id": 5,
        "user_id": 2,
        "status": "pending",
        "message": "我有 3 年插画经验，可以试试",
        "processed_at": null,
        "created_at": "2026-09-27T10:30:00",
        "is_expired": false,
        "project": {
          "project_id": 5,
          "user_id": 1,
          "title": "校园文创周边设计招募",
          "description": "招 2 名插画师做校园文创",
          "mode": "paid",
          "budget": 2000,
          "deadline": "2026-12-31T23:59:59",
          "max_members": 3,
          "cover_url": "https://cdn.example.com/p.png",
          "topic": "设计",
          "required_level": 1,
          "required_project_count": 0,
          "contact_visible": true,
          "status": "recruiting",
          "created_at": "2026-09-27T10:00:00",
          "updated_at": "2026-09-27T10:00:00",
          "required_skills": [ ...同 B-2 的 required_skills 结构... ]
        }
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20
  }
}
```

- `is_expired`：动态计算字段，项目状态非 recruiting 或 deadline 过期时为 `true`
- `project` 字段是项目摘要（`project.to_dict()`），不含 creator/member_avatars 等附加字段；如需发起人头像请另调 `GET /projects/<id>`

### B-4 `repost_work`（快捷转发返回）

适用接口：`POST /works/<work_id>/repost`

```json
{
  "code": 0,
  "message": "转发成功",
  "data": {
    "work_id": 20,
    "user_id": 1,
    "title": "转发 作品#12",
    "description": "",
    "channel": "visual",
    "content_type": "repost",
    "visibility_type": "public",
    "image_layout": "grid",
    "cover_url": "https://cdn.example.com/w2.png",
    "files": ["https://cdn.example.com/w2_1.png", "https://cdn.example.com/w2_2.png"],
    "skill_tags": [],
    "is_collaborative": false,
    "collaborators": [],
    "location": null,
    "status": "published",
    "like_count": 0,
    "comment_count": 0,
    "view_count": 0,
    "repost_count": 0,
    "share_count": 0,
    "published_at": "2026-09-27T11:00:00",
    "created_at": "2026-09-27T11:00:00",
    "updated_at": "2026-09-27T11:00:00",
    "author": {
      "user_id": 1,
      "nickname": "艺小A",
      "avatar": "https://cdn.example.com/a.png",
      "...": "...（完整 User.to_dict）"
    },
    "source": {
      "type": "work",
      "source_user_id": 2,
      "data": {
        "work_id": 12,
        "user_id": 2,
        "title": "《城市切片》插画",
        "...": "...（原作品 to_dict(with_author=true)）",
        "author": { "user_id": 2, "nickname": "艺小B", "...": "..." }
      }
    }
  }
}
```

> 转发返回的结构 = `new_work.to_dict(with_author=True)` + `source` 字段。`source.data` 是原作品的完整对象（含 author），前端可直接渲染转发卡片。

---

## C. 写接口缺失 / 字段矛盾

### C-1 PUT /profile/me 缺少 nickname/avatar/bio 更新 ✅ 已修复

- **原状**：`PUT /api/v1/profile/me` 只接受 `identity`，无法更新昵称/头像/简介
- **修复**：[app/routes/profile.py](file:///C:/Users/z1595/Desktop/yilianmeng-main/app/routes/profile.py) 第 77-118 行，现已支持 4 个字段部分更新（任选传）：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `nickname` | string | 否 | 昵称，上限 50，不能为空字符串 |
| `avatar` | string | 否 | 头像 URL，上限 255 |
| `bio` | string | 否 | 个人简介，上限 500 |
| `identity` | string | 否 | 身份枚举：学生/艺术爱好者/艺术相关工作者 |

- **响应结构变更**（前端需调整）：

```json
// 旧：data 直接是 Profile
{ "data": { "id":1, "user_id":1, "identity":"学生", ... } }

// 新：data 包含 user + profile 两个对象
{ "data": {
    "user":    { "user_id":1, "nickname":"艺小A", "avatar":"...", "bio":"...", ... },
    "profile": { "id":1, "user_id":1, "identity":"学生", ... }
}}
```

- **写入位置**：nickname/avatar/bio 写入 `users` 表；identity 写入 `profiles` 表
- 验证脚本已通过：`test_profile_update.py`（5 项断言全 PASS）

### C-2 identity 取值（中文，三处一致）

代码确认，全链路统一为中文枚举：

| 位置 | 取值 |
|---|---|
| `app/routes/profile.py` `ALLOWED_IDENTITIES` | `{'学生', '艺术爱好者', '艺术相关工作者'}` |
| `app/routes/auth.py` 注册时默认档案 | `'艺术爱好者'` |
| `app/models/profile.py` `Profile.identity` default | `'艺术爱好者'` |

前端表单直接传中文即可，无需做枚举映射。

### C-3 budget / deadline 类型矛盾 ✅ 文档已修正

代码确认（与之前文档不符，已改）：

| 字段 | 代码实际 | 模型字段 | 之前文档 | 修正后文档 |
|---|---|---|---|---|
| `budget` | `int(data.get('budget') or 0)` | `db.Integer, default=0` | string ❌ | **int**，整数，单位元，默认 0，不能为负 ✅ |
| `deadline` | `datetime.fromisoformat(deadline.replace('Z',''))` | `db.DateTime`（nullable） | string ❌ | **string**，ISO 8601（如 `2026-12-31T23:59:59`），可空 ✅ |
| `mode` | `data.get('mode','free')`，校验 `PROJECT_MODES={'free','paid'}` | `db.String(20), default='free'` | — | string，枚举 `free`/`paid`，默认 `free` |

API.md 第 958-959 行已同步修正。

### C-4 mode 取值（free/paid）

代码确认：`PROJECT_MODES = {'free', 'paid'}`（projects.py 第 37 行），默认 `'free'`，create_project 路由强校验，非法值返回 400「mode 不合法（free/paid）」。

### C-5 通知 related_id 含义 ✅ 代码确认

`Notification.related_id` 存储的是关联对象的**原始主键 ID**，与 `related_type` 配对：

| `related_type` | `related_id` 含义 | 示例 |
|---|---|---|
| `work` | 作品 ID（`works.id`） | 点赞/评论通知 |
| `project` | 项目 ID（`projects.id`） | 项目申请/退出/审批通知 |
| `null` | 无关联对象 | 部分系统通知 |

代码佐证（projects.py 第 618-619 行，leave_project 给发起人发通知）：
```python
related_type='project',
related_id=project.id
```

**互动通知**（`/notifications/interaction`）额外返回 `sender: {user_id, nickname, avatar}` 与 `related_work: {work_id, title, cover_url, files[:1]}` 摘要对象。
**待办通知**（`/notifications/todo`）**不返回** sender，仅返回 `related_type` + `related_id`，前端如需发起人信息请另查。

---

## 附：本次改动清单

| # | 文件 | 改动 |
|---|---|---|
| 1 | `app/routes/profile.py` | PUT /profile/me 增加 nickname/avatar/bio 更新 |
| 2 | `API.md` | 2.2 节更新；第 958-959 行 budget/deadline 类型修正 |
| 3 | `scripts/seed_test_data.py` | 新增，前端联调种子数据脚本 |
| 4 | `work-logs/2026-09-27_frontend-feedback-response.md` | 本文档 |

---

## 下一步建议

1. 后端启动：`python app.py`（默认 8080 端口）
2. 执行种子：`python scripts/seed_test_data.py`
3. 用账号 A/B 调试，dev_code 在 send-code 响应里直接取
4. PUT /profile/me 响应结构已变，前端按新结构适配 user/profile 双对象
