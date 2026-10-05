/**
 * 聊天 / 通知 相关接口
 *
 * 契约来源：docs/backend/API-2026-09-27.md §6 私聊会话（6）、§7 群聊（8）、§8 消息附件上传（1）、§9 通知（5）
 * 关键规则（别踩）：
 *   - 私聊发消息有**关注关系校验**：陌生人拒发（3001）；单方面关注限 1 条（3002）；互关/官方自由发。
 *   - 发送消息 `content` 为**必填**（即使 image/file/voice 类型也要传非空字符串）。
 *   - 消息列表后端按时间**倒序**返回，展示前需反转成时间正序。
 *   - 文件字段是相对 URL，展示前用 buildFileUrl 拼接。
 */
import request from '@/utils/request.js'
import { readOptions } from '@/utils/fallback.js'
import { uploadFile } from '@/utils/upload.js'

// ── 枚举（文档 §六） ──
export const PRIVATE_MSG_TYPES = ['text', 'image', 'voice', 'file', 'project_invite']
export const GROUP_MSG_TYPES = ['text', 'image', 'voice', 'file', 'rating_request']
export const GROUP_ROLES = ['owner', 'admin', 'member']

// ─────────────── 私聊会话 ───────────────

/**
 * 6.1 联系人列表（分页，排除官方账号）
 * 每项：{ conversation_id, contact{user_id,nickname,avatar,is_official}, last_message, last_message_at, unread_count }
 */
export function getConversations(params = {}) {
  return request.get('/conversations/', {}, { params, ...readOptions() })
}

/** 6.2 获取/创建与某用户的会话 → { conversation_id }（不能和自己对话：3003） */
export function getConversationWith(userId) {
  return request.post('/conversations/with/' + userId)
}

/**
 * 6.3 消息记录（分页，后端按时间倒序）
 * 每项：{ message_id, sender_id, sender{user_id,nickname,avatar}, msg_type, content,
 *        file_name, file_size, voice_duration, created_at }
 */
export function getMessages(conversationId, params = {}) {
  return request.get('/conversations/' + conversationId + '/messages', {}, {
    params,
    ...readOptions()
  })
}

/**
 * 6.4 发送消息
 * @param {Object} data { msg_type, content 必填非空, file_name?, file_size?, voice_duration?, project_id? }
 * project_invite 时额外返回 project{project_id,title,cover_url,status}
 */
export function sendMessage(conversationId, data) {
  return request.post('/conversations/' + conversationId + '/messages', data)
}

/** 6.5 标记会话已读 → { unread_count: 0 } */
export function readConversation(conversationId) {
  return request.post('/conversations/' + conversationId + '/read')
}

/** 6.6 官方会话（自动获取/创建） */
export function getOfficialConversation() {
  return request.get('/conversations/official', {}, readOptions())
}

// ─────────────── 群聊 ───────────────

/**
 * 7.1 我加入的群（分页）
 * 每项：{ group_id, name, avatar, last_message, last_message_at, unread_count, member_count }
 */
export function getGroups(params = {}) {
  return request.get('/groups/', {}, { params, ...readOptions() })
}

/** 7.2 创建群 @param {Object} data { name 必填, avatar?, member_ids? } → { group_id } */
export function createGroup(data) {
  return request.post('/groups/', data)
}

/** 7.3 群消息记录（分页，含 sender 摘要） */
export function getGroupMessages(groupId, params = {}) {
  return request.get('/groups/' + groupId + '/messages', {}, { params, ...readOptions() })
}

/**
 * 7.4 发送群消息
 * @param {Object} data { msg_type, content, file_name?, file_size?, voice_duration?, project_id? }
 * rating_request 为「求互评」，project_id 必填，额外返回 project
 */
export function sendGroupMessage(groupId, data) {
  return request.post('/groups/' + groupId + '/messages', data)
}

/** 7.5 标记群已读 → { unread_count: 0 } */
export function readGroup(groupId) {
  return request.post('/groups/' + groupId + '/read')
}

/** 7.6 群成员列表 → { list: [{ user_id, nickname, avatar, role, joined_at, group_nickname }], total } */
export function getGroupMembers(groupId) {
  return request.get('/groups/' + groupId + '/members', {}, readOptions())
}

/** 7.7 邀请成员入群（仅 owner/admin）→ { added: [], added_count } */
export function inviteGroupMembers(groupId, userIds) {
  return request.post('/groups/' + groupId + '/invite', { user_ids: userIds })
}

/** 7.8 退出群聊（群主不能退 → 3008） */
export function leaveGroup(groupId) {
  return request.post('/groups/' + groupId + '/leave')
}

// ─────────────── 通知 ───────────────

/** 9.1 三 Tab 未读数 → { official, interaction, todo } */
export function getUnreadCounts() {
  return request.get('/notifications/unread-counts', {}, readOptions())
}

/**
 * 9.2 互动通知列表（分页）
 * @param {Object} params { subtype: 'like'|'comment'|'follow', page, page_size }
 * 每项含 related_work 快照，可直接渲染缩略图
 */
export function getInteractionNotifications(params = {}) {
  return request.get('/notifications/interaction', {}, { params, ...readOptions() })
}

/** 9.3 待办通知列表（分页） @param {Object} params { subtype: 'apply', page, page_size } */
export function getTodoNotifications(params = {}) {
  return request.get('/notifications/todo', {}, { params, ...readOptions() })
}

/** 9.4 标记单条已读 */
export function readNotification(notificationId) {
  return request.post('/notifications/' + notificationId + '/read')
}

/** 9.5 批量已读 @param {String} [type] interaction | todo（不传则全部）→ { updated_count } */
export function readAllNotifications(type) {
  return request.post('/notifications/read-all', type ? { type } : {})
}

// ─────────────── 附件上传 ───────────────

/**
 * 8.1 消息附件上传（单文件，字段名 file，20MB 上限）
 * @returns {Promise<{url, full_url, file_name, file_size, file_type}>}
 * file_type：image / voice / video / file
 */
export function uploadMessageFile(filePath, options = {}) {
  return uploadFile({ folder: 'messages', filePath, ...options })
}

export default {
  getConversations,
  getConversationWith,
  getMessages,
  sendMessage,
  readConversation,
  getOfficialConversation,
  getGroups,
  createGroup,
  getGroupMessages,
  sendGroupMessage,
  readGroup,
  getGroupMembers,
  inviteGroupMembers,
  leaveGroup,
  getUnreadCounts,
  getInteractionNotifications,
  getTodoNotifications,
  readNotification,
  readAllNotifications,
  uploadMessageFile
}