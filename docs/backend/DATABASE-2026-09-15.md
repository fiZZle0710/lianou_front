# 艺联萌数据库文档（DATABASE.md）

> 最后更新：2026-09-15 · 共 **37** 张业务表

---

## 一、表概览

按模块分组的表清单，含表名、列数、说明。

### 1. 用户模块（4 张表）

| 表名 | 列数 | 说明 |
|---|---|---|
| users | 16 | 用户主表，含账号、昵称、等级、经验、官方标识及冗余计数 |
| wallets | 7 | 用户钱包，记录余额、累计收益、累计提现 |
| transactions | 6 | 钱包流水，金额以"分"为单位 |
| follows | 4 | 关注关系表，含双向索引与唯一约束 |

### 2. 档案模块（6 张表）

| 表名 | 列数 | 说明 |
|---|---|---|
| profiles | 5 | 用户档案主表，与 users 一对一 |
| work_experiences | 11 | 工作经历 |
| work_experience_images | 6 | 工作经历配图 |
| education_experiences | 10 | 教育经历 |
| ability_proofs | 7 | 能力证明 |
| ability_proof_files | 7 | 能力证明附件文件 |

### 3. 字典模块（6 张表）

| 表名 | 列数 | 说明 |
|---|---|---|
| skill_categories | 5 | 技能分类 |
| skills | 5 | 技能项 |
| profile_skills | 4 | 档案-技能关联表 |
| style_tags | 7 | 风格标签 |
| profile_style_tags | 4 | 档案-风格标签关联表 |
| rating_tags | 6 | 评价标签（positive/negative/neutral） |

### 4. 作品模块（5 张表）

| 表名 | 列数 | 说明 |
|---|---|---|
| works | 28 | 作品主表，含多渠道、可见性规则、冗余计数与软删除 |
| work_reposts | 6 | 转发记录 |
| work_visibility_rules | 5 | 作品可见性规则（allow/deny） |
| work_top | 8 | 作品置顶配置 |
| work_view_history | 7 | 浏览历史，含冗余 author_id |

### 5. 互动模块（3 张表）

| 表名 | 列数 | 说明 |
|---|---|---|
| likes | 4 | 点赞记录 |
| comments | 9 | 评论表，含层级 parent_id、软删除 |
| ratings | 8 | 项目评价，含匿名、标签 JSON |

### 6. 项目模块（4 张表）

| 表名 | 列数 | 说明 |
|---|---|---|
| projects | 16 | 项目主表，含模式、预算、门槛、状态 |
| project_applications | 7 | 项目申请记录 |
| project_required_skills | 6 | 项目所需技能与已招人数 |
| project_view_history | 7 | 项目浏览历史 |

### 7. 消息模块（6 张表）

| 表名 | 列数 | 说明 |
|---|---|---|
| messages | 12 | 消息主表，支持私聊与群聊多种消息类型 |
| conversations | 6 | 私聊会话表，约定 user1_id < user2_id |
| conversation_reads | 6 | 私聊会话已读状态 |
| groups | 10 | 群组表，可关联项目 |
| group_members | 6 | 群成员表，含角色与群内昵称 |
| group_reads | 6 | 群聊已读状态 |

### 8. 通知模块（1 张表）

| 表名 | 列数 | 说明 |
|---|---|---|
| notifications | 11 | 站内通知，区分 interaction / todo 类型 |

### 9. 活动模块（2 张表）

| 表名 | 列数 | 说明 |
|---|---|---|
| events | 9 | 活动主表 |
| event_participants | 7 | 活动参与记录，含作品、排名、得分 |

---

## 二、表字段明细

每张表包含字段、类型、可空、默认值、注释，并注明主键、索引、唯一约束。

### 1. users（用户主表，16 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| phone | VARCHAR(20) | 否 | - | 手机号，唯一 |
| password_hash | VARCHAR(255) | 是 | - | 密码哈希 |
| nickname | VARCHAR(50) | 否 | '用户' | 昵称 |
| avatar | VARCHAR(255) | 否 | '' | 头像 URL |
| bio | VARCHAR(500) | 否 | '' | 个人简介 |
| level | INTEGER | 否 | 1 | 用户等级 |
| exp | INTEGER | 否 | 0 | 经验值 |
| is_new_user | BOOLEAN | 否 | True | 是否新用户 |
| is_official | BOOLEAN | 否 | False | 是否官方账号 |
| following_count | INTEGER | 否 | 0 | 关注数（冗余） |
| follower_count | INTEGER | 否 | 0 | 粉丝数（冗余） |
| work_count | INTEGER | 否 | 0 | 作品数（冗余） |
| project_count | INTEGER | 否 | 0 | 项目数（冗余） |
| created_at | DATETIME | 是 | - | 创建时间 |
| updated_at | DATETIME | 是 | - | 更新时间 |

- **主键**：id
- **唯一约束**：phone
- **索引**：无显式声明（依赖 phone 唯一索引）
- **to_dict 重命名**：id → user_id；phone 脱敏输出

### 2. wallets（钱包，7 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| user_id | INTEGER (FK users.id) | 否 | - | 用户 ID，唯一 |
| balance | INTEGER | 否 | 0 | 余额（单位：分） |
| total_earned | INTEGER | 否 | 0 | 累计收益 |
| total_withdrawn | INTEGER | 否 | 0 | 累计提现 |
| created_at | DATETIME | 是 | - | 创建时间 |
| updated_at | DATETIME | 是 | - | 更新时间 |

- **主键**：id
- **唯一约束**：user_id（一对一）
- **索引**：无显式声明
- **to_dict**：id（不重命名）、user_id、balance、total_earned、total_withdrawn、created_at、updated_at

### 3. transactions（钱包流水，6 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| user_id | INTEGER (FK users.id) | 是 | - | 用户 ID |
| type | VARCHAR(20) | 否 | - | 流水类型 |
| amount | INTEGER | 否 | - | 金额（单位：分，避免浮点误差） |
| description | VARCHAR(200) | 否 | '' | 描述 |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：无
- **索引**：无显式声明
- **to_dict**：id、user_id、type、amount、description、created_at

### 4. follows（关注关系，4 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| follower_id | INTEGER (FK users.id) | 否 | - | 关注者 ID |
| followed_id | INTEGER (FK users.id) | 否 | - | 被关注者 ID |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：UniqueConstraint(follower_id, followed_id) 名称 `uq_follower_followed`
- **索引**：Index `ix_follower_id`、Index `ix_followed_id`
- **to_dict**：id、follower_id、followed_id、created_at

### 5. profiles（用户档案，5 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| user_id | INTEGER (FK users.id) | 否 | - | 用户 ID，唯一 |
| identity | VARCHAR(30) | 否 | '艺术爱好者' | 身份标识 |
| created_at | DATETIME | 是 | - | 创建时间 |
| updated_at | DATETIME | 是 | - | 更新时间 |

- **主键**：id
- **唯一约束**：user_id（一对一）
- **索引**：无显式声明
- **to_dict**：
  - with_relations=False：id、user_id、identity、created_at、updated_at
  - with_relations=True：追加 style_tags、skills、work_experiences、education_experiences、ability_proofs

### 6. work_experiences（工作经历，11 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| profile_id | INTEGER (FK profiles.id) | 否 | - | 档案 ID |
| company_name | VARCHAR(100) | 否 | - | 公司名 |
| position | VARCHAR(80) | 否 | - | 职位 |
| start_date | DATE | 否 | - | 开始日期 |
| end_date | DATE | 是 | - | 结束日期 |
| is_current | BOOLEAN | 否 | False | 是否在职 |
| description | TEXT | 否 | '' | 描述 |
| sort_order | INTEGER | 否 | 0 | 排序 |
| created_at | DATETIME | 是 | - | 创建时间 |
| updated_at | DATETIME | 是 | - | 更新时间 |

- **主键**：id
- **唯一约束**：无
- **索引**：无显式声明

### 7. work_experience_images（工作经历配图，6 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| work_experience_id | INTEGER (FK work_experiences.id) | 否 | - | 工作经历 ID |
| image_url | VARCHAR(255) | 否 | - | 图片 URL |
| caption | VARCHAR(200) | 否 | '' | 图注 |
| sort_order | INTEGER | 否 | 0 | 排序 |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：无
- **索引**：无显式声明

### 8. education_experiences（教育经历，10 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| profile_id | INTEGER (FK profiles.id) | 否 | - | 档案 ID |
| school_level | VARCHAR(20) | 否 | - | 学段（小学/中学/大学） |
| school_name | VARCHAR(100) | 否 | - | 学校名 |
| start_year | INTEGER | 否 | - | 开始年份 |
| end_year | INTEGER | 是 | - | 结束年份 |
| degree | VARCHAR(20) | 是 | - | 学位（本科/硕士/博士） |
| major | VARCHAR(80) | 是 | - | 专业 |
| sort_order | INTEGER | 否 | 0 | 排序 |
| created_at | DATETIME | 是 | - | 创建时间 |
| updated_at | DATETIME | 是 | - | 更新时间 |

- **主键**：id
- **唯一约束**：无
- **索引**：无显式声明

### 9. ability_proofs（能力证明，7 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| profile_id | INTEGER (FK profiles.id) | 否 | - | 档案 ID |
| title | VARCHAR(200) | 否 | - | 标题 |
| description | TEXT | 否 | '' | 描述 |
| sort_order | INTEGER | 否 | 0 | 排序 |
| created_at | DATETIME | 是 | - | 创建时间 |
| updated_at | DATETIME | 是 | - | 更新时间 |

- **主键**：id
- **唯一约束**：无
- **索引**：无显式声明

### 10. ability_proof_files（能力证明附件，7 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| ability_proof_id | INTEGER (FK ability_proofs.id) | 否 | - | 能力证明 ID |
| file_url | VARCHAR(255) | 否 | - | 文件 URL |
| file_name | VARCHAR(200) | 否 | '' | 文件名 |
| file_type | VARCHAR(20) | 否 | 'image' | 文件类型 |
| sort_order | INTEGER | 否 | 0 | 排序 |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：无
- **索引**：无显式声明

### 11. skill_categories（技能分类，5 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| name | VARCHAR(50) | 否 | - | 分类名，唯一 |
| code | VARCHAR(20) | 否 | - | 分类编码，唯一 |
| sort_order | INTEGER | 否 | 0 | 排序 |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：name、code
- **索引**：无显式声明

### 12. skills（技能项，5 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| category_id | INTEGER (FK skill_categories.id) | 否 | - | 分类 ID |
| name | VARCHAR(50) | 否 | - | 技能名 |
| sort_order | INTEGER | 否 | 0 | 排序 |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：无
- **索引**：无显式声明

### 13. profile_skills（档案-技能关联，4 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| profile_id | INTEGER (FK profiles.id) | 否 | - | 档案 ID |
| skill_id | INTEGER (FK skills.id) | 否 | - | 技能 ID |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：UniqueConstraint(profile_id, skill_id) 名称 `uq_profile_skill`
- **索引**：无显式声明

### 14. style_tags（风格标签，7 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| name | VARCHAR(30) | 否 | - | 标签名，唯一 |
| description | VARCHAR(200) | 否 | '' | 描述 |
| sort_order | INTEGER | 否 | 0 | 排序 |
| is_active | BOOLEAN | 否 | True | 是否启用 |
| created_at | DATETIME | 是 | - | 创建时间 |
| updated_at | DATETIME | 是 | - | 更新时间 |

- **主键**：id
- **唯一约束**：name
- **索引**：无显式声明

### 15. profile_style_tags（档案-风格标签关联，4 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| profile_id | INTEGER (FK profiles.id) | 否 | - | 档案 ID |
| style_tag_id | INTEGER (FK style_tags.id) | 否 | - | 风格标签 ID |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：UniqueConstraint(profile_id, style_tag_id) 名称 `uq_profile_style_tag`
- **索引**：无显式声明

### 16. rating_tags（评价标签，6 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| name | VARCHAR(30) | 否 | - | 标签名，唯一 |
| category | VARCHAR(20) | 否 | 'positive' | 类别（positive/negative/neutral） |
| sort_order | INTEGER | 否 | 0 | 排序 |
| is_active | BOOLEAN | 否 | True | 是否启用 |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：name
- **索引**：无显式声明

### 17. works（作品主表，28 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| user_id | INTEGER (FK users.id) | 否 | - | 作者 ID |
| title | VARCHAR(200) | 否 | - | 标题 |
| description | TEXT | 否 | '' | 描述 |
| channel | VARCHAR(50) | 否 | 'short_video' | 渠道（writing/visual/video/voice） |
| files | TEXT | 否 | '[]' | JSON URL 数组 |
| cover_url | VARCHAR(255) | 否 | '' | 封面 URL |
| is_collaborative | BOOLEAN | 否 | False | 是否协作 |
| project_id | INTEGER (FK projects.id) | 是 | - | 关联项目 ID |
| collaborators | TEXT | 否 | '[]' | JSON 用户 ID 数组 |
| skill_tags | TEXT | 否 | '[]' | JSON 技能 ID 数组 |
| content_type | VARCHAR(20) | 否 | 'original' | 内容类型（original/repost/text_only） |
| image_layout | VARCHAR(20) | 否 | 'flip' | 图片布局（flip/grid） |
| text_content | TEXT | 是 | - | 文本内容 |
| visibility_type | VARCHAR(20) | 否 | 'public' | 可见性（private/followers/mutual/public/custom_allow/custom_deny） |
| location | VARCHAR(200) | 是 | - | 位置 |
| share_count | INTEGER | 否 | 0 | 分享数（冗余） |
| repost_count | INTEGER | 否 | 0 | 转发数（冗余） |
| published_at | DATETIME | 是 | - | 发布时间 |
| status | VARCHAR(20) | 否 | 'draft' | 状态（draft/published/deleted） |
| view_count | INTEGER | 否 | 0 | 浏览数（冗余） |
| like_count | INTEGER | 否 | 0 | 点赞数（冗余） |
| comment_count | INTEGER | 否 | 0 | 评论数（冗余） |
| created_at | DATETIME | 是 | - | 创建时间 |
| updated_at | DATETIME | 是 | - | 更新时间 |

- **主键**：id
- **唯一约束**：无
- **索引**：
  - Index `idx_user_status_published` (user_id, status, published_at)
  - Index `idx_status_published` (status, published_at)
  - Index `idx_status_channel` (status, channel, published_at)
- **to_dict 重命名**：id → work_id；files/collaborators/skill_tags 反序列化为数组

### 18. work_reposts（转发记录，6 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| work_id | INTEGER (FK works.id) | 否 | - | 转发作品 ID，唯一 |
| source_work_id | INTEGER (FK works.id) | 是 | - | 原作品 ID |
| source_project_id | INTEGER (FK projects.id) | 是 | - | 原项目 ID |
| source_user_id | INTEGER (FK users.id) | 否 | - | 原作者 ID |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：work_id（一对一）
- **索引**：无显式声明

### 19. work_visibility_rules（作品可见性规则，5 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| work_id | INTEGER (FK works.id) | 否 | - | 作品 ID |
| rule_type | VARCHAR(10) | 否 | - | 规则类型（allow/deny） |
| user_id | INTEGER (FK users.id) | 否 | - | 用户 ID |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：UniqueConstraint(work_id, rule_type, user_id) 名称 `uq_work_rule_user`
- **索引**：Index `ix_work_rule` (work_id, rule_type)

### 20. work_top（作品置顶，8 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| work_id | INTEGER (FK works.id) | 否 | - | 作品 ID，唯一 |
| weight | INTEGER | 否 | 0 | 权重 |
| started_at | DATETIME | 否 | utcnow | 开始时间 |
| ended_at | DATETIME | 否 | utcnow + 7天 | 结束时间 |
| reason | VARCHAR(200) | 是 | - | 原因 |
| is_active | BOOLEAN | 否 | True | 是否生效 |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：work_id（一对一）
- **索引**：无显式声明

### 21. work_view_history（作品浏览历史，7 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| user_id | INTEGER (FK users.id) | 否 | - | 浏览者 ID |
| work_id | INTEGER (FK works.id) | 否 | - | 作品 ID |
| author_id | INTEGER (FK users.id) | 否 | - | 作者 ID（冗余） |
| view_count | INTEGER | 否 | 1 | 浏览次数 |
| last_viewed_at | DATETIME | 否 | utcnow | 最近浏览时间 |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：UniqueConstraint(user_id, work_id) 名称 `uq_user_work_view`
- **索引**：
  - Index `ix_user_last_view_work` (user_id, last_viewed_at)
  - Index `ix_author_last_view_work` (author_id, last_viewed_at)

### 22. likes（点赞，4 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| user_id | INTEGER (FK users.id) | 否 | - | 点赞者 ID |
| work_id | INTEGER (FK works.id) | 否 | - | 作品 ID |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：UniqueConstraint(user_id, work_id) 名称 `uq_user_work_like`
- **索引**：无显式声明

### 23. comments（评论，9 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| user_id | INTEGER (FK users.id) | 否 | - | 评论者 ID |
| work_id | INTEGER (FK works.id) | 否 | - | 作品 ID |
| parent_id | INTEGER (FK comments.id) | 是 | - | 父评论 ID（NULL=一级评论） |
| reply_to_user_id | INTEGER (FK users.id) | 是 | - | 被回复用户 ID |
| content | VARCHAR(2000) | 否 | - | 内容 |
| is_deleted | BOOLEAN | 否 | False | 软删除标记 |
| created_at | DATETIME | 是 | - | 创建时间 |
| updated_at | DATETIME | 是 | - | 更新时间 |

- **主键**：id
- **唯一约束**：无
- **索引**：无显式声明
- **to_dict 重命名**：id → comment_id；已删除评论 content 显示为 `[已删除]`

### 24. ratings（项目评价，8 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| project_id | INTEGER (FK projects.id) | 否 | - | 项目 ID |
| from_user_id | INTEGER (FK users.id) | 否 | - | 评价者 ID |
| to_user_id | INTEGER (FK users.id) | 否 | - | 被评价者 ID |
| score | INTEGER | 否 | - | 分数（1-5） |
| comment | TEXT | 否 | '' | 评价内容 |
| tags | TEXT | 否 | '[]' | JSON 标签 ID 数组 |
| is_anonymous | BOOLEAN | 否 | False | 是否匿名 |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：UniqueConstraint(project_id, from_user_id, to_user_id) 名称 `uq_project_from_to`
- **索引**：无显式声明
- **to_dict 重命名**：id → rating_id

### 25. projects（项目主表，16 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| user_id | INTEGER (FK users.id) | 否 | - | 发起人 ID |
| title | VARCHAR(200) | 否 | - | 标题 |
| description | TEXT | 否 | '' | 描述 |
| mode | VARCHAR(20) | 否 | 'free' | 模式（free/paid） |
| budget | INTEGER | 否 | 0 | 预算 |
| deadline | DATETIME | 是 | - | 截止时间 |
| max_members | INTEGER | 否 | 10 | 最大成员数 |
| cover_url | VARCHAR(255) | 否 | '' | 封面 URL |
| topic | VARCHAR(100) | 否 | '' | 主题 |
| required_level | INTEGER | 否 | 1 | 要求等级 |
| required_project_count | INTEGER | 否 | 0 | 要求项目数 |
| contact_visible | BOOLEAN | 否 | True | 联系方式是否可见 |
| status | VARCHAR(20) | 否 | 'recruiting' | 状态（recruiting/ongoing/completed/closed） |
| created_at | DATETIME | 是 | - | 创建时间 |
| updated_at | DATETIME | 是 | - | 更新时间 |

- **主键**：id
- **唯一约束**：无
- **索引**：无显式声明
- **to_dict 重命名**：id → project_id

### 26. project_applications（项目申请，7 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| project_id | INTEGER (FK projects.id) | 否 | - | 项目 ID |
| user_id | INTEGER (FK users.id) | 否 | - | 申请人 ID |
| message | TEXT | 否 | '' | 申请留言 |
| status | VARCHAR(20) | 否 | 'pending' | 状态（pending/approved/rejected/left/removed） |
| created_at | DATETIME | 是 | - | 创建时间 |
| processed_at | DATETIME | 是 | - | 处理时间 |

- **主键**：id
- **唯一约束**：无
- **索引**：无显式声明

### 27. project_required_skills（项目所需技能，6 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| project_id | INTEGER (FK projects.id) | 否 | - | 项目 ID |
| skill_id | INTEGER (FK skills.id) | 否 | - | 技能 ID |
| required_count | INTEGER | 否 | 1 | 所需人数 |
| filled_count | INTEGER | 否 | 0 | 已招人数 |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：UniqueConstraint(project_id, skill_id) 名称 `uq_project_skill`
- **索引**：无显式声明

### 28. project_view_history（项目浏览历史，7 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| user_id | INTEGER (FK users.id) | 否 | - | 浏览者 ID |
| project_id | INTEGER (FK projects.id) | 否 | - | 项目 ID |
| author_id | INTEGER (FK users.id) | 否 | - | 作者 ID（冗余） |
| view_count | INTEGER | 否 | 1 | 浏览次数 |
| last_viewed_at | DATETIME | 是 | - | 最近浏览时间 |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：UniqueConstraint(user_id, project_id) 名称 `uq_user_project_view`
- **索引**：
  - Index `ix_user_last_view_project` (user_id, last_viewed_at)
  - Index `ix_author_last_view_project` (author_id, last_viewed_at)

### 29. messages（消息，12 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| conversation_type | VARCHAR(10) | 否 | - | 会话类型（private/group） |
| conversation_id | INTEGER (FK conversations.id) | 是 | - | 私聊会话 ID |
| group_id | INTEGER (FK groups.id) | 是 | - | 群聊 ID |
| sender_id | INTEGER (FK users.id) | 否 | - | 发送者 ID |
| msg_type | VARCHAR(20) | 否 | - | 消息类型（text/image/voice/file/project_invite/rating_request） |
| content | TEXT | 否 | - | 内容 |
| file_name | VARCHAR(200) | 是 | - | 文件名 |
| file_size | BIGINT | 是 | - | 文件大小 |
| voice_duration | INTEGER | 是 | - | 语音时长 |
| related_type | VARCHAR(20) | 是 | - | 关联类型（project 等） |
| related_id | INTEGER | 是 | - | 关联 ID |
| created_at | DATETIME | 是 | - | 创建时间（已建索引） |

- **主键**：id
- **唯一约束**：无
- **索引**：
  - Index `ix_msg_conv_time` (conversation_id, created_at)
  - Index `ix_msg_group_time` (group_id, created_at)
  - Index `ix_msg_sender_time` (sender_id, created_at)
  - created_at 单列索引
- **to_dict 重命名**：id → message_id

### 30. conversations（私聊会话，6 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| user1_id | INTEGER (FK users.id) | 否 | - | 用户1 ID（约定 user1_id < user2_id） |
| user2_id | INTEGER (FK users.id) | 否 | - | 用户2 ID |
| last_message_content | VARCHAR(500) | 是 | - | 最近消息内容（冗余） |
| last_message_at | DATETIME | 是 | - | 最近消息时间（冗余） |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：UniqueConstraint(user1_id, user2_id) 名称 `uq_conversation_users`
- **索引**：
  - Index `ix_conv_user1_last` (user1_id, last_message_at)
  - Index `ix_conv_user2_last` (user2_id, last_message_at)

### 31. conversation_reads（私聊已读，6 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| conversation_id | INTEGER (FK conversations.id) | 否 | - | 会话 ID |
| user_id | INTEGER (FK users.id) | 否 | - | 用户 ID |
| unread_count | INTEGER | 否 | 0 | 未读数 |
| last_read_message_id | INTEGER | 是 | - | 最近已读消息 ID |
| updated_at | DATETIME | 是 | - | 更新时间 |

- **主键**：id
- **唯一约束**：UniqueConstraint(conversation_id, user_id) 名称 `uq_conv_read_user`
- **索引**：无显式声明

### 32. groups（群组，10 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| name | VARCHAR(50) | 否 | - | 群名 |
| avatar | VARCHAR(255) | 是 | - | 群头像 |
| owner_id | INTEGER (FK users.id) | 否 | - | 群主 ID |
| project_id | INTEGER (FK projects.id) | 是 | - | 关联项目 |
| member_count | INTEGER | 否 | 1 | 成员数（冗余） |
| last_message_content | VARCHAR(500) | 是 | - | 最近消息内容（冗余） |
| last_message_at | DATETIME | 是 | - | 最近消息时间（冗余） |
| created_at | DATETIME | 是 | - | 创建时间 |
| updated_at | DATETIME | 是 | - | 更新时间 |

- **主键**：id
- **唯一约束**：无
- **索引**：无显式声明
- **to_dict 重命名**：id → group_id

### 33. group_members（群成员，6 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| group_id | INTEGER (FK groups.id) | 否 | - | 群 ID |
| user_id | INTEGER (FK users.id) | 否 | - | 用户 ID |
| role | VARCHAR(10) | 否 | 'member' | 角色（owner/admin/member） |
| joined_at | DATETIME | 是 | - | 加入时间 |
| nickname | VARCHAR(50) | 是 | - | 群内昵称 |

- **主键**：id
- **唯一约束**：UniqueConstraint(group_id, user_id) 名称 `uq_group_member`
- **索引**：无显式声明

### 34. group_reads（群聊已读，6 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| group_id | INTEGER (FK groups.id) | 否 | - | 群 ID |
| user_id | INTEGER (FK users.id) | 否 | - | 用户 ID |
| unread_count | INTEGER | 否 | 0 | 未读数 |
| last_read_message_id | INTEGER | 是 | - | 最近已读消息 ID |
| updated_at | DATETIME | 是 | - | 更新时间 |

- **主键**：id
- **唯一约束**：UniqueConstraint(group_id, user_id) 名称 `uq_group_read_user`
- **索引**：无显式声明

### 35. notifications（通知，11 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| user_id | INTEGER (FK users.id) | 否 | - | 接收者 ID |
| type | VARCHAR(20) | 否 | - | 类型（interaction/todo） |
| subtype | VARCHAR(30) | 否 | - | 子类型（interaction->like/comment/follow；todo->apply） |
| title | VARCHAR(100) | 是 | - | 标题 |
| content | VARCHAR(500) | 否 | - | 内容 |
| sender_id | INTEGER (FK users.id) | 是 | - | 发送者 ID（系统为 NULL） |
| related_type | VARCHAR(20) | 是 | - | 关联类型（work/project/user） |
| related_id | INTEGER | 否 | - | 关联 ID |
| is_read | BOOLEAN | 否 | False | 是否已读 |
| created_at | DATETIME | 是 | - | 创建时间（已建索引） |

- **主键**：id
- **唯一约束**：无
- **索引**：
  - Index `ix_noti_user_type_read` (user_id, type, is_read)
  - Index `ix_noti_user_created` (user_id, created_at)
  - created_at 单列索引
- **to_dict 重命名**：id → notification_id

### 36. events（活动，9 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| title | VARCHAR(200) | 否 | - | 标题 |
| description | TEXT | 否 | '' | 描述 |
| cover_url | VARCHAR(255) | 否 | '' | 封面 URL |
| deadline | DATETIME | 是 | - | 截止时间 |
| reward | INTEGER | 否 | 0 | 奖励 |
| status | VARCHAR(20) | 否 | 'ongoing' | 状态 |
| participant_count | INTEGER | 否 | 0 | 参与人数（冗余） |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：无
- **索引**：无显式声明
- **to_dict 重命名**：id → event_id

### 37. event_participants（活动参与，7 列）

| 字段 | 类型 | 可空 | 默认值 | 注释 |
|---|---|---|---|---|
| id | INTEGER | 否 | - | 主键 |
| event_id | INTEGER (FK events.id) | 否 | - | 活动 ID |
| user_id | INTEGER (FK users.id) | 否 | - | 用户 ID |
| work_id | INTEGER (FK works.id) | 否 | - | 作品 ID |
| rank | INTEGER | 否 | 0 | 排名 |
| score | INTEGER | 否 | 0 | 得分 |
| created_at | DATETIME | 是 | - | 创建时间 |

- **主键**：id
- **唯一约束**：无
- **索引**：无显式声明

---

## 三、to_dict() 字段重命名约定

ORM `to_dict()` 中将主键 `id` 重命名为业务相关字段的映射表，以避免前端混淆多个 `id`。

| 模型类 | 表 | id → 重命名 |
|---|---|---|
| User | users | id → **user_id** |
| Work | works | id → **work_id** |
| Project | projects | id → **project_id** |
| Message | messages | id → **message_id** |
| Notification | notifications | id → **notification_id** |
| Like | likes | id → **like_id** |
| Comment | comments | id → **comment_id** |
| Rating | ratings | id → **rating_id** |
| Event | events | id → **event_id** |
| Conversation | conversations | id → **conversation_id** |
| Group | groups | id → **group_id** |

> 注：Wallet、Transaction、Follow、WorkExperience 等表的 `to_dict()` 不重命名 `id`，直接保留 `id` 字段输出。
> users 表中的 `phone` 字段在 `to_dict()` 中输出时需脱敏处理。

---

## 四、关键设计说明

### 1. JSON 字段（TEXT 存储）

以 `TEXT` 列存储 JSON 字符串数组，序列化/反序列化在应用层完成。`to_dict()` 输出时反序列化为数组。

| 表 | 字段 | 内容 |
|---|---|---|
| works | files | 文件 URL 数组 |
| works | collaborators | 协作用户 ID 数组 |
| works | skill_tags | 技能 ID 数组 |
| ratings | tags | 评价标签 ID 数组 |

### 2. 冗余计数

为减少 COUNT 聚合查询，将高频计数冗余存储于主表，写入/删除相关记录时同步维护。

| 主表 | 冗余计数字段 |
|---|---|
| users | following_count、follower_count、work_count、project_count |
| works | like_count、comment_count、view_count、share_count、repost_count |
| conversations | last_message_content、last_message_at |
| groups | member_count、last_message_content、last_message_at |
| events | participant_count |
| project_required_skills | filled_count |
| work_view_history / project_view_history | view_count |

### 3. 软删除

避免物理删除导致外键孤儿与统计丢失，使用标记字段实现软删除。

| 表 | 字段 | 标记 |
|---|---|---|
| works | status | `deleted`（其他值：draft / published） |
| comments | is_deleted | `True`（已删除评论 `content` 在 `to_dict()` 中显示为 `[已删除]`） |

### 4. 唯一约束汇总

完整列出所有声明在 `__table_args__` 中的复合/单字段唯一约束。

| 约束名称 | 表 | 字段组合 | 用途 |
|---|---|---|---|
| uq_follower_followed | follows | (follower_id, followed_id) | 防止重复关注 |
| uq_profile_skill | profile_skills | (profile_id, skill_id) | 防止重复绑定技能 |
| uq_profile_style_tag | profile_style_tags | (profile_id, style_tag_id) | 防止重复绑定风格标签 |
| uq_work_rule_user | work_visibility_rules | (work_id, rule_type, user_id) | 防止重复可见性规则 |
| uq_user_work_view | work_view_history | (user_id, work_id) | 每用户每作品一条浏览记录 |
| uq_user_work_like | likes | (user_id, work_id) | 每用户每作品只能点赞一次 |
| uq_project_from_to | ratings | (project_id, from_user_id, to_user_id) | 同一项目内 A→B 只能评价一次 |
| uq_project_skill | project_required_skills | (project_id, skill_id) | 项目内每技能一条需求 |
| uq_user_project_view | project_view_history | (user_id, project_id) | 每用户每项目一条浏览记录 |
| uq_conversation_users | conversations | (user1_id, user2_id) | 唯一私聊会话 |
| uq_conv_read_user | conversation_reads | (conversation_id, user_id) | 每会话每用户一条已读记录 |
| uq_group_member | group_members | (group_id, user_id) | 用户不可重复入群 |
| uq_group_read_user | group_reads | (group_id, user_id) | 每群每用户一条已读记录 |

> 单字段唯一约束（users.phone、wallets.user_id、profiles.user_id、skill_categories.name/code、style_tags.name、rating_tags.name、work_reposts.work_id、work_top.work_id）见对应表说明。

### 5. 其他约定

- **金额单位**：`transactions.amount`、`wallets.balance` 等均使用"分"为单位，避免浮点精度误差。
- **Boolean 输出**：`is_collaborative`、`is_anonymous`、`is_read`、`is_deleted`、`is_active`、`contact_visible`、`is_new_user`、`is_official`、`is_current` 全部输出为 `true` / `false`。
- **时间格式**：ISO 8601，无时区后缀，例如 `2026-09-15T10:30:00`。
- **私聊会话约定**：`conversations` 中 `user1_id < user2_id`，确保同一对用户只会有一条会话记录。
- **数据库配置**：
  - 引擎：`mysql+pymysql`
  - `MAX_CONTENT_LENGTH`：500MB
  - 允许扩展名：jpg / jpeg / png / gif / webp / mp4 / mov
  - JWT 过期：默认 7 天
