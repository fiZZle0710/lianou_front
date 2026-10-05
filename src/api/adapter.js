/**
 * 后端响应 → 前端视图模型 适配层
 *
 * 为什么需要它：
 *   后端 `to_dict()` 会把主键改名（`id` → `work_id` / `user_id` / `project_id`…），
 *   且项目的 `build_project_item` 等构造函数把作者放在 `creator`、头像放在 `member_avatars`，
 *   与页面里惯用的 `id / author / likes / images` 等名字不一致。
 *   这里统一转换，页面只认本文件输出的形状 —— 以后后端改字段只改这一层。
 *
 * 兼容策略：`pick()` 会依次尝试多个候选键名，所以 `project_id`/`id`、`creator`/`owner`
 *   两种命名都能吃下（后端 build_* 构造函数字段未在文档中完整给出，
 *   标了 TODO(契约待后端确认) 的地方即为此处）。
 *
 * 约定：所有 URL 字段（avatar / cover / files / content 里的图片）在这里就拼成**可访问地址**。
 */
import { buildFileUrl, buildFileUrlList } from '@/utils/fileUrl.js'
import { fromNow, formatDate, formatDateTime } from '@/utils/format.js'
import { unwrapList, unwrapPage } from '@/utils/fallback.js'

/** 依次取第一个「有值」的键（'' / null / undefined 视为无值） */
export function pick(obj, ...keys) {
  if (!obj) return ''
  for (let i = 0; i < keys.length; i++) {
    const v = obj[keys[i]]
    if (v !== undefined && v !== null && v !== '') return v
  }
  return ''
}

/** 数字兜底 */
export function num(value) {
  if (value === '' || value === null || value === undefined) return 0
  const n = Number(value)
  return isNaN(n) ? 0 : n
}

/** 布尔兜底（后端 db.Boolean 返回 true/false，个别场景可能给 1/0） */
export function bool(value) {
  return value === true || value === 1 || value === '1' || value === 'true'
}

/** 数组兜底 */
export function arr(value) {
  return Array.isArray(value) ? value : []
}

/**
 * 项目「所需技能」元素 → { id, name, requiredCount, filledCount }
 *
 * 后端 2026-09-27 答复明确：`required_skills` 返回**对象数组**
 *   { id, project_id, skill: { id, category_id, name, sort_order }, required_count, filled_count }
 * 但 API 文档 L974/L1958 仍写「技能 ID 数组」（`int[]`），两者不一致，
 * 所以这里**两种都能吃**：数字当 ID，对象取名字与已招/需求人数。
 */
export function toRequiredSkill(item) {
  if (item === null || item === undefined || item === '') return null
  if (typeof item === 'object') {
    const nested = item.skill && typeof item.skill === 'object' ? item.skill : null
    const id = num(pick(item, 'skill_id') || (nested ? pick(nested, 'id', 'skill_id') : '') || pick(item, 'id'))
    return {
      id,
      name: pick(item, 'name') || (nested ? pick(nested, 'name') : ''),
      requiredCount: num(pick(item, 'required_count', 'requiredCount')),
      filledCount: num(pick(item, 'filled_count', 'filledCount')),
      skill: nested,
      raw: item
    }
  }
  return { id: num(item), name: '', requiredCount: 0, filledCount: 0, skill: null, raw: item }
}

/**
 * 技能列表 → 名字数组（**ID 数组 / 对象数组 / 名字数组** 三种都吃）
 * @param {Array} list 如 project.required_skills、work.skill_tags
 * @param {Object|Array} [dict] 2.8 技能字典（`{ skills: [{id,name}] }` 或直接数组）；只有拿到 ID 时才需要它
 */
export function skillNamesOf(list, dict) {
  const all = Array.isArray(dict) ? dict : arr(dict && dict.skills)
  return arr(list)
    .map((item) => {
      if (item === null || item === undefined || item === '') return ''
      if (typeof item === 'object') {
        const nested = item.skill && typeof item.skill === 'object' ? item.skill : null
        const name = pick(item, 'name') || (nested ? pick(nested, 'name') : '')
        if (name) return name
        const id = num(pick(item, 'skill_id') || (nested ? pick(nested, 'id', 'skill_id') : '') || pick(item, 'id'))
        return id ? ('技能#' + id) : ''
      }
      if (typeof item === 'string' && isNaN(Number(item))) return item // 后端直接给名字
      const id = Number(item)
      const hit = all.find((s) => num(pick(s, 'id', 'skill_id')) === id)
      return hit ? pick(hit, 'name') : ('技能#' + id)
    })
    .filter(Boolean)
}

/**
 * 用户摘要（User.to_dict / sender / contact / applicant / author 快照）
 * 输出同时包含后端命名（user_id）与页面惯用命名（id / username / intro）
 */
export function normalizeUser(raw) {
  const u = raw || {}
  const nickname = pick(u, 'nickname', 'name', 'username')
  const bio = pick(u, 'bio', 'intro', 'signature')
  const avatar = buildFileUrl(pick(u, 'avatar', 'avatar_url'))
  const id = num(pick(u, 'user_id', 'id', 'author_id'))
  return {
    id,
    user_id: id,
    userId: id,
    nickname,
    username: nickname,
    name: nickname,
    avatar,
    bio,
    intro: bio,
    level: num(pick(u, 'level')),
    exp: num(pick(u, 'exp')),
    isOfficial: bool(pick(u, 'is_official')),
    is_official: bool(pick(u, 'is_official')),
    followerCount: num(pick(u, 'follower_count')),
    followingCount: num(pick(u, 'following_count')),
    workCount: num(pick(u, 'work_count')),
    projectCount: num(pick(u, 'project_count')),
    createdAt: pick(u, 'created_at'),
    raw: u
  }
}

/**
 * 作品（Work.to_dict(with_author=True) / build_work_list_item）
 * 页面惯用：id / cover / images / likes / comments / views / shares / time / isLiked / isFollowed
 */
export function normalizeWork(raw) {
  const w = raw || {}
  const id = num(pick(w, 'work_id', 'id'))
  const authorRaw = pick(w, 'author', 'user')
  const authorId = num(pick(w, 'user_id', 'author_id')) || (authorRaw ? num(pick(authorRaw, 'user_id', 'id')) : 0)
  const author = authorRaw ? normalizeUser(authorRaw) : null
  const files = buildFileUrlList(arr(pick(w, 'files', 'images')))
  const cover = buildFileUrl(pick(w, 'cover_url', 'cover'))
  const likeCount = num(pick(w, 'like_count', 'likes'))
  const commentCount = num(pick(w, 'comment_count', 'comments'))
  const viewCount = num(pick(w, 'view_count', 'views'))
  const shareCount = num(pick(w, 'share_count', 'shares'))
  const repostCount = num(pick(w, 'repost_count', 'reposts'))
  const createdAt = pick(w, 'published_at', 'created_at')
  const nickname = author ? author.nickname : pick(w, 'nickname', 'username')
  return {
    // 标识
    id,
    work_id: id,
    workId: id,
    // 内容
    title: pick(w, 'title'),
    description: pick(w, 'description'),
    text_content: pick(w, 'text_content'),
    text: pick(w, 'text_content', 'text', 'description'),
    intro: pick(w, 'description', 'text_content'),
    channel: pick(w, 'channel'),
    contentType: pick(w, 'content_type'),
    content_type: pick(w, 'content_type'),
    imageLayout: pick(w, 'image_layout'),
    visibilityType: pick(w, 'visibility_type'),
    visibility_type: pick(w, 'visibility_type'),
    location: pick(w, 'location'),
    status: pick(w, 'status', 'published'),
    // 媒体（已拼成绝对地址）
    cover: cover || files[0] || '',
    cover_url: cover,
    images: files,
    files,
    // 作者
    authorId,
    author_id: authorId,
    user_id: authorId,
    author: author ? author.nickname : nickname,
    username: nickname,
    avatar: author ? author.avatar : buildFileUrl(pick(w, 'avatar')),
    authorInfo: author,
    // 计数（后端命名 + 页面惯用命名）
    viewCount,
    views: viewCount,
    likeCount,
    likes: likeCount,
    commentCount,
    comments: commentCount,
    repostCount,
    shares: shareCount,
    shareCount,
    // 状态与时间
    isLiked: bool(pick(w, 'is_liked')),
    isFollowed: bool(pick(w, 'is_following', 'is_followed')),
    // 收藏：后端**无表无接口**（见 docs/给后端的接口问题清单.md C-1），恒为 false，页面不要给入口
    isCollected: false,
    isCollaborative: bool(pick(w, 'is_collaborative')),
    skillTags: arr(pick(w, 'skill_tags')),
    skill_tags: arr(pick(w, 'skill_tags')),
    collaborators: arr(pick(w, 'collaborators')),
    projectId: num(pick(w, 'project_id')),
    project_id: num(pick(w, 'project_id')),
    createdAt,
    created_at: createdAt,
    publishedAt: pick(w, 'published_at'),
    time: fromNow(createdAt),
    date: formatDate(createdAt),
    // 转发溯源（仅转发作品有）
    source: pick(w, 'source') || null,
    // 共创（后端无该结构，页面如需展示请用 projectId 关联）
    coop: null,
    raw: w
  }
}

/** 作品列表 → 数组 */
export function normalizeWorkList(data) {
  return unwrapList(data).map(normalizeWork)
}

/** 作品列表 → 分页对象 */
export function normalizeWorkPage(data) {
  const page = unwrapPage(data)
  return { ...page, list: page.list.map(normalizeWork) }
}

/** 用户列表 → 数组 */
export function normalizeUserList(data) {
  return unwrapList(data).map(normalizeUser)
}

/** 用户列表 → 分页对象 */
export function normalizeUserPage(data) {
  const page = unwrapPage(data)
  return { ...page, list: page.list.map(normalizeUser) }
}

/**
 * 2.2 `PUT /profile/me` 响应（2026-09-27 后端答复 C-1）
 *
 * 旧版：直接返回 profile 本体。
 * 新版：`{ user: {...}, profile: {...} }` 双对象（nickname/avatar/bio 落 `users` 表，identity 落 `profiles` 表）。
 * 这里**两种都抹平**：统一输出 `{ user, profile, ...平铺字段 }`：
 *   老页面读 `res.identity` / `res.skills` 保持不变，新代码读 `res.user.nickname` 也能拿到。
 * ⚠️ 文档 2.2 的「响应 data」未明确写出结构，此处按答复示例实现。
 */
export function normalizeProfileUpdate(raw) {
  const d = raw || {}
  const userRaw = pick(d, 'user')
  const profileRaw = pick(d, 'profile')
  const hasUser = !!userRaw && typeof userRaw === 'object'
  const hasProfile = !!profileRaw && typeof profileRaw === 'object'
  const dual = hasUser || hasProfile
  const base = dual ? (hasProfile ? profileRaw : {}) : d
  return {
    user: hasUser ? normalizeUser(userRaw) : null,
    profile: base,
    ...base,
    raw: d
  }
}

// ═══════════════ 项目 ═══════════════

// ═══════════════ 项目 ═══════════════

/** 项目状态中文文案 */
export const PROJECT_STATUS_TEXT = {
  recruiting: '招募中',
  ongoing: '进行中',
  completed: '已完成',
  closed: '已关闭'
}

/** 申请状态中文文案 */
export const APPLICATION_STATUS_TEXT = {
  pending: '审核中',
  approved: '已通过',
  rejected: '已拒绝',
  left: '已退出',
  removed: '已移除'
}

/**
 * 项目（build_project_item）
 * 字段来源：后端 2026-09-27 答复 B-2（完整 JSON 示例），
 *   `required_skills` 为对象数组（见 toRequiredSkill），`member_count` 为动态计算值。
 * 无「当前用户是否符合招募要求」的结论字段 → requirements 由页面用
 *   requiredLevel / requiredProjectCount / creator.joinedProjectCount 自行拼装。
 */
export function normalizeProject(raw) {
  const p = raw || {}
  const id = num(pick(p, 'project_id', 'id'))
  const creatorRaw = pick(p, 'creator', 'owner', 'user')
  const creator = creatorRaw && typeof creatorRaw === 'object' ? normalizeUser(creatorRaw) : null
  const ownerId = num(pick(p, 'user_id', 'owner_id', 'ownerId')) || (creator ? creator.id : 0)
  const memberAvatars = arr(pick(p, 'member_avatars')).map(normalizeUser)
  const memberCount = num(pick(p, 'member_count', 'current_members', 'current'))
  const maxMembers = num(pick(p, 'max_members', 'total'))
  // 所需技能：统一规整为对象数组（后端对象数组 / 文档 ID 数组都能吃，详见 toRequiredSkill）
  const requiredSkillsRaw = arr(pick(p, 'required_skills'))
  const requiredSkills = requiredSkillsRaw.map(toRequiredSkill).filter(Boolean)
  const status = pick(p, 'status') || 'recruiting'
  const deadline = pick(p, 'deadline')
  const cover = buildFileUrl(pick(p, 'cover_url', 'cover'))
  return {
    id,
    project_id: id,
    projectId: id,
    title: pick(p, 'title'),
    description: pick(p, 'description'),
    intro: pick(p, 'description'),
    topic: pick(p, 'topic'),
    mode: pick(p, 'mode'),
    cover,
    cover_url: cover,
    budget: pick(p, 'budget'),
    deadline,
    deadlineText: deadline ? formatDate(deadline) : '',
    maxMembers,
    total: maxMembers,
    current: memberCount,
    memberCount,
    memberAvatars,
    members: memberAvatars.map((u) => u.nickname),
    requiredLevel: num(pick(p, 'required_level')),
    requiredProjectCount: num(pick(p, 'required_project_count')),
    requiredSkills,
    skillIds: requiredSkills.map((s) => s.id).filter(Boolean), // 与文档 int[] 口径对齐
    skills: skillNamesOf(requiredSkills), // 技能**名字**数组（页面直接可渲染；对象数组自带 name，ID 数组退化为「技能#id」）
    requiredSkillsRaw,
    contactVisible: bool(pick(p, 'contact_visible')),
    status,
    statusText: PROJECT_STATUS_TEXT[status] || status,
    owner: creator ? creator.nickname : pick(p, 'owner_name', 'nickname'),
    ownerId,
    ownerLevel: creator ? creator.level : 0,
    ownerInfo: creator,
    coopCount: creator ? creator.projectCount : num(pick(p, 'creator_project_count')),
    createdAt: pick(p, 'created_at'),
    updatedAt: pick(p, 'updated_at'),
    requirements: [], // 后端无该结构，由页面自行拼装（见上方注释）
    raw: p
  }
}

/** 项目列表 → 数组 */
export function normalizeProjectList(data) {
  return unwrapList(data).map(normalizeProject)
}

/** 项目列表 → 分页对象 */
export function normalizeProjectPage(data) {
  const page = unwrapPage(data)
  return { ...page, list: page.list.map(normalizeProject) }
}

// ═══════════════ 项目申请 ═══════════════

/** 待审申请项（build_application_item） */
export function normalizeApplication(raw) {
  const a = raw || {}
  const applicant = a.applicant ? normalizeUser(a.applicant) : null
  const id = num(pick(a, 'application_id', 'id'))
  const status = pick(a, 'status') || 'pending'
  const createdAt = pick(a, 'created_at')
  return {
    id,
    application_id: id,
    applicationId: id,
    projectId: num(pick(a, 'project_id')),
    userId: num(pick(a, 'user_id')),
    name: applicant ? applicant.nickname : pick(a, 'nickname', 'name'),
    avatar: applicant ? applicant.avatar : buildFileUrl(pick(a, 'avatar')),
    level: applicant ? applicant.level : 0,
    message: pick(a, 'message'),
    intro: pick(a, 'message'),
    status,
    statusText: APPLICATION_STATUS_TEXT[status] || status,
    createdAt,
    processedAt: pick(a, 'processed_at'),
    time: fromNow(createdAt),
    // 后端未在申请项中返回项目当前人数，页面如需展示请另取项目详情
    filled: 0,
    total: 0,
    raw: a
  }
}

/** 待审申请列表 → 数组 */
export function normalizeApplicationList(data) {
  return unwrapList(data).map(normalizeApplication)
}

/** 我发出的申请（build_my_application_item，字段以后端为准，这里做宽容解析） */
export function normalizeMyApplication(raw) {
  const a = raw || {}
  const status = pick(a, 'status') || 'pending'
  const project = a.project && typeof a.project === 'object' ? a.project : null
  const projectId = num(pick(a, 'project_id')) || (project ? num(pick(project, 'project_id', 'id')) : 0)
  const projectTitle = pick(a, 'project_title', 'title') || (project ? pick(project, 'title') : '')
  const createdAt = pick(a, 'created_at')
  return {
    id: num(pick(a, 'application_id', 'id')),
    projectId,
    projectTitle,
    projectName: projectTitle,
    status,
    statusText: APPLICATION_STATUS_TEXT[status] || status,
    createdAt,
    processedAt: pick(a, 'processed_at'),
    time: createdAt ? formatDateTime(createdAt) + ' 提交' : '',
    message: pick(a, 'message'),
    raw: a
  }
}

/** 我的申请列表 → 数组 */
export function normalizeMyApplicationList(data) {
  return unwrapList(data).map(normalizeMyApplication)
}

// ═══════════════ 成员 ═══════════════

/** 项目成员 / 群成员 → 通用成员视图 */
export function normalizeMember(raw) {
  const m = raw || {}
  const role = pick(m, 'role') || 'member'
  const joinedAt = pick(m, 'joined_at')
  return {
    id: num(pick(m, 'user_id', 'id')),
    userId: num(pick(m, 'user_id', 'id')),
    nickname: pick(m, 'nickname', 'group_nickname', 'name'),
    name: pick(m, 'nickname', 'group_nickname', 'name'),
    groupNickname: pick(m, 'group_nickname'),
    avatar: buildFileUrl(pick(m, 'avatar')),
    level: num(pick(m, 'level')),
    role,
    roleText: role === 'owner' ? '发起人' : role === 'admin' ? '管理员' : '成员',
    joinedAt,
    time: fromNow(joinedAt),
    raw: m
  }
}

/** 成员列表（{ list, total } 或数组）→ 数组 */
export function normalizeMemberList(data) {
  return unwrapList(data).map(normalizeMember)
}

// ═══════════════ 消息 ═══════════════

/**
 * 消息（Message.to_dict）
 * 输出兼容 ChatBubble 组件契约：
 *   role('left'|'right') / type('text'|'image'|'voice'|'file'|'card'|'emoji') / content / avatar
 * @param {Object} raw 后端消息
 * @param {Number|String} [myUserId] 当前登录用户 ID，决定左右气泡（不传则全部按 left）
 */
export function normalizeMessage(raw, myUserId) {
  const m = raw || {}
  const sender = m.sender ? normalizeUser(m.sender) : null
  const senderId = num(pick(m, 'sender_id', 'user_id')) || (sender ? sender.id : 0)
  const isMine = !!myUserId && String(senderId) === String(myUserId)
  const msgType = pick(m, 'msg_type', 'type') || 'text'
  const rawContent = pick(m, 'content')
  const fileUrl = buildFileUrl(pick(m, 'file_url', 'url'))
  let type = 'text'
  let content = rawContent
  if (msgType === 'image') {
    type = 'image'
    content = fileUrl || buildFileUrl(rawContent)
  } else if (msgType === 'voice') {
    type = 'voice'
    content = fileUrl || buildFileUrl(rawContent)
  } else if (msgType === 'file') {
    type = 'file'
    content = pick(m, 'file_name') || rawContent
  } else if (msgType === 'project_invite' || msgType === 'rating_request') {
    type = 'card'
    content = rawContent
  }
  const createdAt = pick(m, 'created_at')
  const id = num(pick(m, 'message_id', 'id'))
  return {
    id,
    message_id: id,
    messageId: id,
    role: isMine ? 'right' : 'left',
    isMine,
    type,
    msgType,
    msg_type: msgType,
    content,
    rawContent,
    fileUrl,
    fileName: pick(m, 'file_name'),
    fileSize: num(pick(m, 'file_size')),
    voiceDuration: num(pick(m, 'voice_duration')),
    avatar: isMine ? '' : sender ? sender.avatar : '',
    sender,
    senderId,
    project: pick(m, 'project') || null,
    conversationId: num(pick(m, 'conversation_id')),
    groupId: num(pick(m, 'group_id')),
    createdAt,
    time: fromNow(createdAt),
    raw: m
  }
}

/**
 * 消息列表 → 数组
 * 后端按时间**倒序**返回，这里默认反转成时间正序（聊天页从上到下时间递增）
 */
export function normalizeMessageList(data, myUserId, keepRawOrder = false) {
  const list = unwrapList(data).map((m) => normalizeMessage(m, myUserId))
  return keepRawOrder ? list : list.slice().reverse()
}

// ═══════════════ 会话 / 群 ═══════════════

/** 会话（6.1 联系人列表项） */
export function normalizeConversation(raw) {
  const c = raw || {}
  const contact = c.contact ? normalizeUser(c.contact) : null
  const lastAt = pick(c, 'last_message_at')
  const id = num(pick(c, 'conversation_id', 'id'))
  return {
    id,
    conversation_id: id,
    conversationId: id,
    contact,
    userId: contact ? contact.id : 0,
    name: contact ? contact.nickname : pick(c, 'nickname'),
    nickname: contact ? contact.nickname : pick(c, 'nickname'),
    avatar: contact ? contact.avatar : buildFileUrl(pick(c, 'avatar')),
    lastMessage: pick(c, 'last_message', 'last_message_content'),
    unreadCount: num(pick(c, 'unread_count')),
    lastMessageAt: lastAt,
    time: fromNow(lastAt),
    raw: c
  }
}

/** 会话列表 → 数组 */
export function normalizeConversationList(data) {
  return unwrapList(data).map(normalizeConversation)
}

/** 群（7.1 群列表项） */
export function normalizeGroup(raw) {
  const g = raw || {}
  const id = num(pick(g, 'group_id', 'id'))
  const lastAt = pick(g, 'last_message_at')
  return {
    id,
    group_id: id,
    groupId: id,
    name: pick(g, 'name'),
    avatar: buildFileUrl(pick(g, 'avatar')),
    ownerId: num(pick(g, 'owner_id')),
    projectId: num(pick(g, 'project_id')),
    memberCount: num(pick(g, 'member_count')),
    lastMessage: pick(g, 'last_message', 'last_message_content'),
    unreadCount: num(pick(g, 'unread_count')),
    lastMessageAt: lastAt,
    time: fromNow(lastAt),
    createdAt: pick(g, 'created_at'),
    raw: g
  }
}

/** 群列表 → 数组 */
export function normalizeGroupList(data) {
  return unwrapList(data).map(normalizeGroup)
}

// ═══════════════ 评论 ═══════════════

/** 通知子类型文案 */
export const NOTIFICATION_SUBTYPE_TEXT = {
  like: '赞了你',
  comment: '评论了你',
  follow: '关注了你',
  apply: '申请加入项目',
  leave: '退出了项目',
  removed: '被移出项目'
}

/** 评论（Comment.to_dict，含作者信息） */
export function normalizeComment(raw) {
  const c = raw || {}
  const authorRaw = pick(c, 'author', 'user')
  const author = authorRaw && typeof authorRaw === 'object' ? normalizeUser(authorRaw) : null
  const id = num(pick(c, 'comment_id', 'id'))
  const createdAt = pick(c, 'created_at')
  const userId = num(pick(c, 'user_id', 'author_id')) || (author ? author.id : 0)
  return {
    id,
    comment_id: id,
    commentId: id,
    workId: num(pick(c, 'work_id')),
    userId,
    user_id: userId,
    parentId: num(pick(c, 'parent_id')),
    replyToUserId: num(pick(c, 'reply_to_user_id')),
    content: pick(c, 'content'),
    isDeleted: bool(pick(c, 'is_deleted')),
    author,
    nickname: author ? author.nickname : pick(c, 'nickname'),
    name: author ? author.nickname : pick(c, 'nickname'),
    avatar: author ? author.avatar : buildFileUrl(pick(c, 'avatar')),
    level: author ? author.level : 0,
    replies: arr(pick(c, 'replies')).map(normalizeComment),
    createdAt,
    created_at: createdAt,
    time: fromNow(createdAt),
    raw: c
  }
}

/** 评论列表 → 数组（后端按时间倒序，保持倒序即可，评论区按最新在前） */
export function normalizeCommentList(data) {
  return unwrapList(data).map(normalizeComment)
}

// ═══════════════ 通知 ═══════════════

/** 通知（互动 / 待办） */
export function normalizeNotification(raw) {
  const n = raw || {}
  const sender = n.sender ? normalizeUser(n.sender) : null
  const relatedWork = n.related_work ? normalizeWork(n.related_work) : null
  const createdAt = pick(n, 'created_at')
  const subtype = pick(n, 'subtype')
  const id = num(pick(n, 'notification_id', 'id'))
  return {
    id,
    notification_id: id,
    notificationId: id,
    type: pick(n, 'type'),
    subtype,
    subtypeText: NOTIFICATION_SUBTYPE_TEXT[subtype] || subtype,
    title: pick(n, 'title'),
    content: pick(n, 'content'),
    sender,
    senderId: num(pick(n, 'sender_id')),
    nickname: sender ? sender.nickname : '',
    avatar: sender ? sender.avatar : '',
    relatedType: pick(n, 'related_type'),
    relatedId: num(pick(n, 'related_id')),
    relatedWork,
    isRead: bool(pick(n, 'is_read')),
    createdAt,
    time: fromNow(createdAt),
    raw: n
  }
}

/** 通知列表 → 数组 */
export function normalizeNotificationList(data) {
  return unwrapList(data).map(normalizeNotification)
}

// ═══════════════ 关注对象 ═══════════════

/** 关注 / 粉丝列表项（10.4 / 10.5）：{ user_id, nickname, avatar, bio, is_mutual, followed_at } */
export function normalizeFollowUser(raw) {
  const u = raw || {}
  const base = normalizeUser(u)
  const followedAt = pick(u, 'followed_at')
  return { ...base, isMutual: bool(pick(u, 'is_mutual')), followedAt, time: fromNow(followedAt) }
}

/** 关注 / 粉丝列表 → 数组 */
export function normalizeFollowUserList(data) {
  return unwrapList(data).map(normalizeFollowUser)
}

export default {
  pick,
  num,
  bool,
  arr,
  toRequiredSkill,
  skillNamesOf,
  normalizeUser,
  normalizeUserList,
  normalizeUserPage,
  normalizeProfileUpdate,
  normalizeWork,
  normalizeWorkList,
  normalizeWorkPage,
  normalizeProject,
  normalizeProjectList,
  normalizeProjectPage,
  normalizeApplication,
  normalizeApplicationList,
  normalizeMyApplication,
  normalizeMyApplicationList,
  normalizeMember,
  normalizeMemberList,
  normalizeMessage,
  normalizeMessageList,
  normalizeConversation,
  normalizeConversationList,
  normalizeGroup,
  normalizeGroupList,
  normalizeComment,
  normalizeCommentList,
  normalizeNotification,
  normalizeNotificationList,
  normalizeFollowUser,
  normalizeFollowUserList
}