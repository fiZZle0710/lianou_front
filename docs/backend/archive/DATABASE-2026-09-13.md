# 艺联萌数据库文档（DATABASE.md）

> 最后更新：2026-09-13 · 从实际数据库自动提取 · 共 **37** 张业务表

## 一、表概览

| 模块 | 表名 | 列数 | 说明 |
|------|------|------|------|
| 用户 | `users` | 16 | 用户表（含 following_count/follower_count/work_count/project_count 冗余计数） |
| 用户 | `wallets` | 7 | 钱包表 |
| 用户 | `transactions` | 6 | 交易流水表（金额单位：分） |
| 档案 | `profiles` | 5 | 创作者档案 |
| 档案 | `profile_skills` | 4 | 用户-技能关联 |
| 档案 | `profile_style_tags` | 4 | 用户-风格标签关联 |
| 档案 | `work_experiences` | 11 | 工作经历 |
| 档案 | `work_experience_images` | 6 | 工作经历图片 |
| 档案 | `education_experiences` | 11 | 教育经历 |
| 档案 | `ability_proofs` | 7 | 能力证明 |
| 档案 | `ability_proof_files` | 7 | 能力证明文件 |
| 字典 | `skill_categories` | 5 | 技能分类字典 |
| 字典 | `skills` | 6 | 技能字典 |
| 字典 | `style_tags` | 7 | 风格标签字典 |
| 字典 | `rating_tags` | 6 | 评价标签字典 |
| 作品 | `works` | 25 | 作品表（25 字段） |
| 作品 | `work_view_history` | 7 | 作品浏览历史 |
| 作品 | `work_reposts` | 6 | 作品转推关系 |
| 作品 | `work_top` | 8 | 作品置顶 |
| 作品 | `work_visibility_rules` | 5 | 作品可见性规则 |
| 互动 | `likes` | 4 | 点赞记录 |
| 互动 | `comments` | 9 | 评论（支持二级回复 + 软删除） |
| 项目 | `projects` | 16 | 协作项目（16 字段，含 topic/required_level/required_project_count/contact_visible） |
| 项目 | `project_applications` | 7 | 项目申请（status: pending/approved/rejected/left/removed） |
| 项目 | `project_required_skills` | 6 | 项目所需技能 |
| 项目 | `project_view_history` | 7 | 项目浏览历史 |
| 项目 | `ratings` | 9 | 项目互评（唯一约束 project_id+from_user_id+to_user_id） |
| 消息 | `conversations` | 6 | 私信会话（user1_id < user2_id 唯一） |
| 消息 | `conversation_reads` | 6 | 会话已读状态 |
| 消息 | `messages` | 13 | 消息记录（支持文本/文件/语音） |
| 消息 | `groups` | 10 | 群聊 |
| 消息 | `group_members` | 6 | 群成员 |
| 消息 | `group_reads` | 6 | 群已读状态 |
| 通知 | `notifications` | 11 | 通知（official/interaction/todo 三类） |
| 活动 | `events` | 9 | 活动 |
| 活动 | `event_participants` | 7 | 活动参与者 |
| 关注 | `follows` | 4 | 关注关系（唯一 follower_id+followed_id） |

## 二、表结构明细

### `users`

**列数：16**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `phone` | `VARCHAR(20)` | NO | — |
| `nickname` | `VARCHAR(50)` | YES | — |
| `avatar` | `VARCHAR(255)` | YES | — |
| `bio` | `VARCHAR(500)` | YES | — |
| `level` | `INTEGER` | YES | — |
| `exp` | `INTEGER` | YES | — |
| `is_new_user` | `TINYINT` | YES | — |
| `created_at` | `DATETIME` | YES | — |
| `updated_at` | `DATETIME` | YES | — |
| `password_hash` | `VARCHAR(255)` | YES | — |
| `is_official` | `TINYINT` | YES | — |
| `following_count` | `INTEGER` | NO | `'0'` |
| `follower_count` | `INTEGER` | NO | `'0'` |
| `work_count` | `INTEGER` | NO | `'0'` |
| `project_count` | `INTEGER` | NO | `'0'` |

**主键**：`id`

**索引**：
- `phone`: `phone` （唯一）

**唯一约束**：
- `phone`: (`phone`)

---

### `wallets`

**列数：7**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `user_id` | `INTEGER` | NO | — |
| `balance` | `INTEGER` | YES | — |
| `total_earned` | `INTEGER` | YES | — |
| `total_withdrawn` | `INTEGER` | YES | — |
| `created_at` | `DATETIME` | YES | — |
| `updated_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `user_id`: `user_id` （唯一）

**外键**：
- `wallets_ibfk_1`: `user_id` → `users(id)`

**唯一约束**：
- `user_id`: (`user_id`)

---

### `transactions`

**列数：6**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `user_id` | `INTEGER` | NO | — |
| `type` | `VARCHAR(20)` | NO | — |
| `amount` | `INTEGER` | NO | — |
| `description` | `VARCHAR(200)` | YES | — |
| `created_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `user_id`: `user_id` 

**外键**：
- `transactions_ibfk_1`: `user_id` → `users(id)`

---

### `profiles`

**列数：5**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `user_id` | `INTEGER` | NO | — |
| `created_at` | `DATETIME` | YES | — |
| `updated_at` | `DATETIME` | YES | — |
| `identity` | `VARCHAR(30)` | NO | — |

**主键**：`id`

**索引**：
- `user_id`: `user_id` （唯一）

**外键**：
- `profiles_ibfk_1`: `user_id` → `users(id)`

**唯一约束**：
- `user_id`: (`user_id`)

---

### `profile_skills`

**列数：4**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `profile_id` | `INTEGER` | NO | — |
| `skill_id` | `INTEGER` | NO | — |
| `created_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `skill_id`: `skill_id` 
- `uq_profile_skill`: `profile_id`, `skill_id` （唯一）

**外键**：
- `profile_skills_ibfk_1`: `profile_id` → `profiles(id)`
- `profile_skills_ibfk_2`: `skill_id` → `skills(id)`

**唯一约束**：
- `uq_profile_skill`: (`profile_id`, `skill_id`)

---

### `profile_style_tags`

**列数：4**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `profile_id` | `INTEGER` | NO | — |
| `style_tag_id` | `INTEGER` | NO | — |
| `created_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `style_tag_id`: `style_tag_id` 
- `uq_profile_style_tag`: `profile_id`, `style_tag_id` （唯一）

**外键**：
- `profile_style_tags_ibfk_1`: `profile_id` → `profiles(id)`
- `profile_style_tags_ibfk_2`: `style_tag_id` → `style_tags(id)`

**唯一约束**：
- `uq_profile_style_tag`: (`profile_id`, `style_tag_id`)

---

### `work_experiences`

**列数：11**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `profile_id` | `INTEGER` | NO | — |
| `company_name` | `VARCHAR(100)` | NO | — |
| `position` | `VARCHAR(80)` | NO | — |
| `start_date` | `DATE` | NO | — |
| `end_date` | `DATE` | YES | — |
| `is_current` | `TINYINT` | YES | — |
| `description` | `TEXT` | YES | — |
| `sort_order` | `INTEGER` | YES | — |
| `created_at` | `DATETIME` | YES | — |
| `updated_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `profile_id`: `profile_id` 

**外键**：
- `work_experiences_ibfk_1`: `profile_id` → `profiles(id)`

---

### `work_experience_images`

**列数：6**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `work_experience_id` | `INTEGER` | NO | — |
| `image_url` | `VARCHAR(255)` | NO | — |
| `caption` | `VARCHAR(200)` | YES | — |
| `sort_order` | `INTEGER` | YES | — |
| `created_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `work_experience_id`: `work_experience_id` 

**外键**：
- `work_experience_images_ibfk_1`: `work_experience_id` → `work_experiences(id)`

---

### `education_experiences`

**列数：11**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `profile_id` | `INTEGER` | NO | — |
| `school_level` | `VARCHAR(20)` | NO | — |
| `school_name` | `VARCHAR(100)` | NO | — |
| `start_year` | `INTEGER` | NO | — |
| `end_year` | `INTEGER` | YES | — |
| `degree` | `VARCHAR(20)` | YES | — |
| `major` | `VARCHAR(80)` | YES | — |
| `sort_order` | `INTEGER` | YES | — |
| `created_at` | `DATETIME` | YES | — |
| `updated_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `profile_id`: `profile_id` 

**外键**：
- `education_experiences_ibfk_1`: `profile_id` → `profiles(id)`

---

### `ability_proofs`

**列数：7**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `profile_id` | `INTEGER` | NO | — |
| `title` | `VARCHAR(200)` | NO | — |
| `description` | `TEXT` | YES | — |
| `sort_order` | `INTEGER` | YES | — |
| `created_at` | `DATETIME` | YES | — |
| `updated_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `profile_id`: `profile_id` 

**外键**：
- `ability_proofs_ibfk_1`: `profile_id` → `profiles(id)`

---

### `ability_proof_files`

**列数：7**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `ability_proof_id` | `INTEGER` | NO | — |
| `file_url` | `VARCHAR(255)` | NO | — |
| `file_name` | `VARCHAR(200)` | YES | — |
| `file_type` | `VARCHAR(20)` | YES | — |
| `sort_order` | `INTEGER` | YES | — |
| `created_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `ability_proof_id`: `ability_proof_id` 

**外键**：
- `ability_proof_files_ibfk_1`: `ability_proof_id` → `ability_proofs(id)`

---

### `skill_categories`

**列数：5**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `name` | `VARCHAR(50)` | NO | — |
| `code` | `VARCHAR(20)` | NO | — |
| `sort_order` | `INTEGER` | YES | — |
| `created_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `code`: `code` （唯一）
- `name`: `name` （唯一）

**唯一约束**：
- `code`: (`code`)
- `name`: (`name`)

---

### `skills`

**列数：6**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `category_id` | `INTEGER` | NO | — |
| `name` | `VARCHAR(50)` | NO | — |
| `sort_order` | `INTEGER` | YES | — |
| `created_at` | `DATETIME` | YES | — |
| `creator_id` | `INTEGER` | YES | — |

**主键**：`id`

**索引**：
- `category_id`: `category_id` 
- `creator_id`: `creator_id` 

**外键**：
- `skills_ibfk_1`: `category_id` → `skill_categories(id)`
- `skills_ibfk_2`: `creator_id` → `users(id)`

---

### `style_tags`

**列数：7**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `name` | `VARCHAR(30)` | NO | — |
| `description` | `VARCHAR(200)` | YES | — |
| `sort_order` | `INTEGER` | YES | — |
| `is_active` | `TINYINT` | YES | — |
| `created_at` | `DATETIME` | YES | — |
| `updated_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `name`: `name` （唯一）

**唯一约束**：
- `name`: (`name`)

---

### `rating_tags`

**列数：6**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `name` | `VARCHAR(30)` | NO | — |
| `category` | `VARCHAR(20)` | YES | — |
| `sort_order` | `INTEGER` | YES | — |
| `is_active` | `TINYINT` | YES | — |
| `created_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `name`: `name` （唯一）

**唯一约束**：
- `name`: (`name`)

---

### `works`

**列数：25**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `user_id` | `INTEGER` | NO | — |
| `title` | `VARCHAR(200)` | NO | — |
| `description` | `TEXT` | YES | — |
| `channel` | `VARCHAR(50)` | YES | — |
| `files` | `TEXT` | YES | — |
| `cover_url` | `VARCHAR(255)` | YES | — |
| `is_collaborative` | `TINYINT` | YES | — |
| `collaborators` | `TEXT` | YES | — |
| `view_count` | `INTEGER` | YES | — |
| `like_count` | `INTEGER` | YES | — |
| `created_at` | `DATETIME` | YES | — |
| `skill_tags` | `TEXT` | YES | — |
| `content_type` | `VARCHAR(20)` | NO | `'original'` |
| `image_layout` | `VARCHAR(20)` | NO | `'flip'` |
| `text_content` | `TEXT` | YES | — |
| `visibility_type` | `VARCHAR(20)` | NO | `'public'` |
| `location` | `VARCHAR(200)` | YES | — |
| `share_count` | `INTEGER` | NO | `'0'` |
| `repost_count` | `INTEGER` | NO | `'0'` |
| `published_at` | `DATETIME` | YES | — |
| `status` | `VARCHAR(20)` | YES | — |
| `updated_at` | `DATETIME` | YES | — |
| `project_id` | `INTEGER` | YES | — |
| `comment_count` | `INTEGER` | YES | — |

**主键**：`id`

**索引**：
- `idx_status_channel`: `status`, `channel`, `published_at` 
- `idx_status_published`: `status`, `published_at` 
- `idx_user_status_published`: `user_id`, `status`, `published_at` 
- `project_id`: `project_id` 

**外键**：
- `works_ibfk_1`: `user_id` → `users(id)`
- `works_ibfk_2`: `project_id` → `projects(id)`

---

### `work_view_history`

**列数：7**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `user_id` | `INTEGER` | NO | — |
| `work_id` | `INTEGER` | NO | — |
| `author_id` | `INTEGER` | NO | — |
| `view_count` | `INTEGER` | YES | — |
| `last_viewed_at` | `DATETIME` | YES | — |
| `created_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `ix_author_last_view_work`: `author_id`, `last_viewed_at` 
- `ix_user_last_view_work`: `user_id`, `last_viewed_at` 
- `uq_user_work_view`: `user_id`, `work_id` （唯一）
- `work_id`: `work_id` 

**外键**：
- `work_view_history_ibfk_1`: `user_id` → `users(id)`
- `work_view_history_ibfk_2`: `work_id` → `works(id)`
- `work_view_history_ibfk_3`: `author_id` → `users(id)`

**唯一约束**：
- `uq_user_work_view`: (`user_id`, `work_id`)

---

### `work_reposts`

**列数：6**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `work_id` | `INTEGER` | NO | — |
| `source_work_id` | `INTEGER` | YES | — |
| `source_project_id` | `INTEGER` | YES | — |
| `source_user_id` | `INTEGER` | NO | — |
| `created_at` | `DATETIME` | NO | `CURRENT_TIMESTAMP` |

**主键**：`id`

**索引**：
- `ix_wr_src_project`: `source_project_id` 
- `ix_wr_src_user`: `source_user_id` 
- `ix_wr_src_work`: `source_work_id` 
- `work_id`: `work_id` （唯一）

**外键**：
- `fk_wr_src_project`: `source_project_id` → `projects(id)`
- `fk_wr_src_user`: `source_user_id` → `users(id)`
- `fk_wr_src_work`: `source_work_id` → `works(id)`
- `fk_wr_work`: `work_id` → `works(id)`

**唯一约束**：
- `work_id`: (`work_id`)

---

### `work_top`

**列数：8**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `work_id` | `INTEGER` | NO | — |
| `weight` | `INTEGER` | NO | `'0'` |
| `started_at` | `DATETIME` | NO | `CURRENT_TIMESTAMP` |
| `ended_at` | `DATETIME` | NO | — |
| `reason` | `VARCHAR(200)` | YES | — |
| `is_active` | `TINYINT` | NO | `'1'` |
| `created_at` | `DATETIME` | NO | `CURRENT_TIMESTAMP` |

**主键**：`id`

**索引**：
- `ix_wt_active_time`: `is_active`, `started_at`, `ended_at` 
- `ix_wt_weight`: `weight` 
- `work_id`: `work_id` （唯一）

**外键**：
- `fk_wt_work`: `work_id` → `works(id)`

**唯一约束**：
- `work_id`: (`work_id`)

---

### `work_visibility_rules`

**列数：5**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `work_id` | `INTEGER` | NO | — |
| `rule_type` | `VARCHAR(10)` | NO | — |
| `user_id` | `INTEGER` | NO | — |
| `created_at` | `DATETIME` | NO | `CURRENT_TIMESTAMP` |

**主键**：`id`

**索引**：
- `fk_wvr_user`: `user_id` 
- `ix_work_rule`: `work_id`, `rule_type` 
- `uq_work_rule_user`: `work_id`, `rule_type`, `user_id` （唯一）

**外键**：
- `fk_wvr_user`: `user_id` → `users(id)`
- `fk_wvr_work`: `work_id` → `works(id)`

**唯一约束**：
- `uq_work_rule_user`: (`work_id`, `rule_type`, `user_id`)

---

### `likes`

**列数：4**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `user_id` | `INTEGER` | NO | — |
| `work_id` | `INTEGER` | NO | — |
| `created_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `uq_user_work_like`: `user_id`, `work_id` （唯一）
- `work_id`: `work_id` 

**外键**：
- `likes_ibfk_1`: `user_id` → `users(id)`
- `likes_ibfk_2`: `work_id` → `works(id)`

**唯一约束**：
- `uq_user_work_like`: (`user_id`, `work_id`)

---

### `comments`

**列数：9**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `user_id` | `INTEGER` | NO | — |
| `work_id` | `INTEGER` | NO | — |
| `parent_id` | `INTEGER` | YES | — |
| `content` | `VARCHAR(2000)` | NO | — |
| `is_deleted` | `TINYINT` | YES | — |
| `created_at` | `DATETIME` | YES | — |
| `updated_at` | `DATETIME` | YES | — |
| `reply_to_user_id` | `INTEGER` | YES | — |

**主键**：`id`

**索引**：
- `parent_id`: `parent_id` 
- `reply_to_user_id`: `reply_to_user_id` 
- `user_id`: `user_id` 
- `work_id`: `work_id` 

**外键**：
- `comments_ibfk_1`: `parent_id` → `comments(id)`
- `comments_ibfk_2`: `user_id` → `users(id)`
- `comments_ibfk_3`: `work_id` → `works(id)`
- `comments_ibfk_4`: `reply_to_user_id` → `users(id)`

---

### `projects`

**列数：16**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `user_id` | `INTEGER` | NO | — |
| `title` | `VARCHAR(200)` | NO | — |
| `description` | `TEXT` | YES | — |
| `mode` | `VARCHAR(20)` | YES | — |
| `budget` | `INTEGER` | YES | — |
| `deadline` | `DATETIME` | YES | — |
| `status` | `VARCHAR(20)` | YES | — |
| `created_at` | `DATETIME` | YES | — |
| `updated_at` | `DATETIME` | YES | — |
| `max_members` | `INTEGER` | YES | — |
| `cover_url` | `VARCHAR(255)` | YES | — |
| `topic` | `VARCHAR(100)` | YES | `''` |
| `required_level` | `INTEGER` | YES | `'1'` |
| `required_project_count` | `INTEGER` | YES | `'0'` |
| `contact_visible` | `TINYINT` | YES | `'1'` |

**主键**：`id`

**索引**：
- `user_id`: `user_id` 

**外键**：
- `projects_ibfk_1`: `user_id` → `users(id)`

---

### `project_applications`

**列数：7**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `project_id` | `INTEGER` | NO | — |
| `user_id` | `INTEGER` | NO | — |
| `message` | `TEXT` | YES | — |
| `status` | `VARCHAR(20)` | YES | — |
| `created_at` | `DATETIME` | YES | — |
| `processed_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `project_id`: `project_id` 
- `user_id`: `user_id` 

**外键**：
- `project_applications_ibfk_1`: `project_id` → `projects(id)`
- `project_applications_ibfk_2`: `user_id` → `users(id)`

---

### `project_required_skills`

**列数：6**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `project_id` | `INTEGER` | NO | — |
| `skill_id` | `INTEGER` | NO | — |
| `required_count` | `INTEGER` | NO | — |
| `filled_count` | `INTEGER` | YES | — |
| `created_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `skill_id`: `skill_id` 
- `uq_project_skill`: `project_id`, `skill_id` （唯一）

**外键**：
- `project_required_skills_ibfk_1`: `project_id` → `projects(id)`
- `project_required_skills_ibfk_2`: `skill_id` → `skills(id)`

**唯一约束**：
- `uq_project_skill`: (`project_id`, `skill_id`)

---

### `project_view_history`

**列数：7**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `user_id` | `INTEGER` | NO | — |
| `project_id` | `INTEGER` | NO | — |
| `author_id` | `INTEGER` | NO | — |
| `view_count` | `INTEGER` | YES | — |
| `last_viewed_at` | `DATETIME` | YES | — |
| `created_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `ix_author_last_view_project`: `author_id`, `last_viewed_at` 
- `ix_user_last_view_project`: `user_id`, `last_viewed_at` 
- `project_id`: `project_id` 
- `uq_user_project_view`: `user_id`, `project_id` （唯一）

**外键**：
- `project_view_history_ibfk_1`: `user_id` → `users(id)`
- `project_view_history_ibfk_2`: `project_id` → `projects(id)`
- `project_view_history_ibfk_3`: `author_id` → `users(id)`

**唯一约束**：
- `uq_user_project_view`: (`user_id`, `project_id`)

---

### `ratings`

**列数：9**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `project_id` | `INTEGER` | NO | — |
| `from_user_id` | `INTEGER` | NO | — |
| `to_user_id` | `INTEGER` | NO | — |
| `score` | `INTEGER` | NO | — |
| `comment` | `TEXT` | YES | — |
| `created_at` | `DATETIME` | YES | — |
| `tags` | `TEXT` | YES | — |
| `is_anonymous` | `TINYINT` | YES | — |

**主键**：`id`

**索引**：
- `from_user_id`: `from_user_id` 
- `to_user_id`: `to_user_id` 
- `uq_project_from_to`: `project_id`, `from_user_id`, `to_user_id` （唯一）

**外键**：
- `ratings_ibfk_1`: `from_user_id` → `users(id)`
- `ratings_ibfk_2`: `project_id` → `projects(id)`
- `ratings_ibfk_3`: `to_user_id` → `users(id)`

**唯一约束**：
- `uq_project_from_to`: (`project_id`, `from_user_id`, `to_user_id`)

---

### `conversations`

**列数：6**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `user1_id` | `INTEGER` | NO | — |
| `user2_id` | `INTEGER` | NO | — |
| `last_message_content` | `VARCHAR(500)` | YES | — |
| `last_message_at` | `DATETIME` | YES | — |
| `created_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `ix_conv_user1_last`: `user1_id`, `last_message_at` 
- `ix_conv_user2_last`: `user2_id`, `last_message_at` 
- `uq_conversation_users`: `user1_id`, `user2_id` （唯一）

**外键**：
- `conversations_ibfk_1`: `user1_id` → `users(id)`
- `conversations_ibfk_2`: `user2_id` → `users(id)`

**唯一约束**：
- `uq_conversation_users`: (`user1_id`, `user2_id`)

---

### `conversation_reads`

**列数：6**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `conversation_id` | `INTEGER` | NO | — |
| `user_id` | `INTEGER` | NO | — |
| `unread_count` | `INTEGER` | YES | — |
| `last_read_message_id` | `INTEGER` | YES | — |
| `updated_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `uq_conv_read_user`: `conversation_id`, `user_id` （唯一）
- `user_id`: `user_id` 

**外键**：
- `conversation_reads_ibfk_1`: `conversation_id` → `conversations(id)`
- `conversation_reads_ibfk_2`: `user_id` → `users(id)`

**唯一约束**：
- `uq_conv_read_user`: (`conversation_id`, `user_id`)

---

### `messages`

**列数：13**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `content` | `TEXT` | NO | — |
| `related_id` | `INTEGER` | YES | — |
| `created_at` | `DATETIME` | YES | — |
| `conversation_type` | `VARCHAR(10)` | NO | — |
| `conversation_id` | `INTEGER` | YES | — |
| `group_id` | `INTEGER` | YES | — |
| `sender_id` | `INTEGER` | NO | — |
| `msg_type` | `VARCHAR(20)` | NO | — |
| `file_name` | `VARCHAR(200)` | YES | — |
| `file_size` | `BIGINT` | YES | — |
| `voice_duration` | `INTEGER` | YES | — |
| `related_type` | `VARCHAR(20)` | YES | — |

**主键**：`id`

**索引**：
- `ix_messages_created_at`: `created_at` 
- `ix_msg_conv_time`: `conversation_id`, `created_at` 
- `ix_msg_group_time`: `group_id`, `created_at` 
- `ix_msg_sender_time`: `sender_id`, `created_at` 

**外键**：
- `messages_ibfk_1`: `sender_id` → `users(id)`
- `messages_ibfk_2`: `group_id` → `groups(id)`
- `messages_ibfk_3`: `conversation_id` → `conversations(id)`

---

### `groups`

**列数：10**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `name` | `VARCHAR(50)` | NO | — |
| `avatar` | `VARCHAR(255)` | YES | — |
| `owner_id` | `INTEGER` | NO | — |
| `project_id` | `INTEGER` | YES | — |
| `member_count` | `INTEGER` | YES | — |
| `last_message_content` | `VARCHAR(500)` | YES | — |
| `last_message_at` | `DATETIME` | YES | — |
| `created_at` | `DATETIME` | YES | — |
| `updated_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `owner_id`: `owner_id` 
- `project_id`: `project_id` 

**外键**：
- `groups_ibfk_1`: `owner_id` → `users(id)`
- `groups_ibfk_2`: `project_id` → `projects(id)`

---

### `group_members`

**列数：6**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `group_id` | `INTEGER` | NO | — |
| `user_id` | `INTEGER` | NO | — |
| `role` | `VARCHAR(10)` | YES | — |
| `joined_at` | `DATETIME` | YES | — |
| `nickname` | `VARCHAR(50)` | YES | — |

**主键**：`id`

**索引**：
- `uq_group_member`: `group_id`, `user_id` （唯一）
- `user_id`: `user_id` 

**外键**：
- `group_members_ibfk_1`: `group_id` → `groups(id)`
- `group_members_ibfk_2`: `user_id` → `users(id)`

**唯一约束**：
- `uq_group_member`: (`group_id`, `user_id`)

---

### `group_reads`

**列数：6**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `group_id` | `INTEGER` | NO | — |
| `user_id` | `INTEGER` | NO | — |
| `unread_count` | `INTEGER` | YES | — |
| `last_read_message_id` | `INTEGER` | YES | — |
| `updated_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `uq_group_read_user`: `group_id`, `user_id` （唯一）
- `user_id`: `user_id` 

**外键**：
- `group_reads_ibfk_1`: `group_id` → `groups(id)`
- `group_reads_ibfk_2`: `user_id` → `users(id)`

**唯一约束**：
- `uq_group_read_user`: (`group_id`, `user_id`)

---

### `notifications`

**列数：11**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `user_id` | `INTEGER` | NO | — |
| `type` | `VARCHAR(20)` | NO | — |
| `subtype` | `VARCHAR(30)` | NO | — |
| `title` | `VARCHAR(100)` | YES | — |
| `content` | `VARCHAR(500)` | NO | — |
| `sender_id` | `INTEGER` | YES | — |
| `related_type` | `VARCHAR(20)` | YES | — |
| `related_id` | `INTEGER` | NO | — |
| `is_read` | `TINYINT` | YES | — |
| `created_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `ix_noti_user_created`: `user_id`, `created_at` 
- `ix_noti_user_type_read`: `user_id`, `type`, `is_read` 
- `ix_notifications_created_at`: `created_at` 
- `sender_id`: `sender_id` 

**外键**：
- `notifications_ibfk_1`: `sender_id` → `users(id)`
- `notifications_ibfk_2`: `user_id` → `users(id)`

---

### `events`

**列数：9**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `title` | `VARCHAR(200)` | NO | — |
| `description` | `TEXT` | YES | — |
| `cover_url` | `VARCHAR(255)` | YES | — |
| `deadline` | `DATETIME` | YES | — |
| `reward` | `INTEGER` | YES | — |
| `status` | `VARCHAR(20)` | YES | — |
| `participant_count` | `INTEGER` | YES | — |
| `created_at` | `DATETIME` | YES | — |

**主键**：`id`

---

### `event_participants`

**列数：7**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `event_id` | `INTEGER` | NO | — |
| `user_id` | `INTEGER` | NO | — |
| `work_id` | `INTEGER` | NO | — |
| `rank` | `INTEGER` | YES | — |
| `score` | `INTEGER` | YES | — |
| `created_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `event_id`: `event_id` 
- `user_id`: `user_id` 
- `work_id`: `work_id` 

**外键**：
- `event_participants_ibfk_1`: `event_id` → `events(id)`
- `event_participants_ibfk_2`: `user_id` → `users(id)`
- `event_participants_ibfk_3`: `work_id` → `works(id)`

---

### `follows`

**列数：4**

| 字段 | 类型 | 可空 | 默认值 |
|------|------|------|--------|
| `id` | `INTEGER` | NO | — |
| `follower_id` | `INTEGER` | NO | — |
| `followed_id` | `INTEGER` | NO | — |
| `created_at` | `DATETIME` | YES | — |

**主键**：`id`

**索引**：
- `ix_followed_id`: `followed_id` 
- `ix_follower_id`: `follower_id` 
- `uq_follower_followed`: `follower_id`, `followed_id` （唯一）

**外键**：
- `follows_ibfk_1`: `followed_id` → `users(id)`
- `follows_ibfk_2`: `follower_id` → `users(id)`

**唯一约束**：
- `uq_follower_followed`: (`follower_id`, `followed_id`)

---

## 三、状态枚举与约定

| 字段 | 取值 | 说明 |
|------|------|------|
| `works.status` | `draft` / `published` / `deleted` | 草稿/已发布/软删除 |
| `works.channel` | `writing` / `visual` / `video` / `voice` | 作品频道（对齐技能分类） |
| `works.content_type` | `original` / `repost` | 原创/转推 |
| `works.visibility_type` | `public` / `private` / `friends` | 公开/私密/好友可见 |
| `projects.status` | `recruiting` / `ongoing` / `completed` / `closed` | 招募中/进行中/已完成/已关闭 |
| `projects.mode` | `free` / `paid` | 免费/付费 |
| `project_applications.status` | `pending` / `approved` / `rejected` / `left` / `removed` | 待审/通过/拒绝/主动退出/被踢 |
| `notifications.type` | `official` / `interaction` / `todo` | 官方/互动/待办 |
| `transactions.type` | `recharge` / `withdraw` / `transfer` / `reward` / `earn` | 充值/提现/转账/打赏/收益 |
| `messages.msg_type` | `text` / `image` / `file` / `voice` / `project_invite` / `rating_request` | 文本/图片/文件/语音/项目邀请/互评请求 |
| `messages.conversation_type` | `private` / `group` | 私信/群聊 |
| `profiles.identity_type` | `professional` / `amateur` | 专业/非专业 |

**金额单位**：钱包/交易金额均以「分」为单位（整数），避免浮点误差。

**时间约定**：所有时间字段使用 `DATETIME`，存储 UTC 时间。

**软删除约定**：作品/评论等用 `status=deleted` 标记，不物理删除。