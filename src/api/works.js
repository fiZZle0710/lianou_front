/**
 * 作品 / 互动 相关接口
 *
 * 契约来源：docs/backend/API-2026-09-27.md §3 作品模块（15）+ §4 互动模块（7）
 * 注意：
 *   - 列表返回分页包装 `{ total, page, page_size, total_pages, list }`，元素为 build_work_list_item
 *   - 详情返回 `Work.to_dict(with_author=True)`，转发时多 `source` 字段
 *   - `files` / `cover_url` 是**相对 URL**，展示前用 src/utils/fileUrl.js 的 buildFileUrl 拼接
 *   - 已发布作品由**非作者**浏览时后端才 view_count +1，前端不要手动加
 */
import request from '@/utils/request.js'
import { readOptions } from '@/utils/fallback.js'
import { uploadFile } from '@/utils/upload.js'

// ── 枚举（文档 §六 字段结构说明） ──
export const CHANNELS = ['writing', 'visual', 'video', 'voice']
export const CONTENT_TYPES = ['original', 'repost', 'text_only']
export const IMAGE_LAYOUTS = ['flip', 'grid'] // 仅 channel=visual 有意义
export const VISIBILITY_TYPES = [
  'private',
  'followers',
  'mutual',
  'public',
  'custom_allow',
  'custom_deny'
]
export const WORK_STATUS = ['draft', 'published', 'deleted']
export const MAX_FILES = 9
export const MAX_SKILL_TAGS = 5

/**
 * 3.10 推荐推流（分页）
 * @param {Object} params { page, page_size, sort: 'latest'|'hot', channel, content_type, exclude_self }
 */
export function getFeed(params = {}) {
  return request.get('/works/feed', {}, { params, ...readOptions() })
}

/** 3.11 关注 Tab 推流（分页，仅我关注的账号） */
export function getFollowingFeed(params = {}) {
  return request.get('/works/feed/following', {}, { params, ...readOptions() })
}

/**
 * 3.12 搜索作品（分页，q 必填 ≤100）
 * @param {Object} params { page, page_size, channel, content_type }
 */
export function searchWorks(q, params = {}) {
  return request.get('/works/search', {}, { params: { q, ...params }, ...readOptions() })
}

/** 3.13 按技能筛选作品（分页，skillId 必填） */
export function getWorksBySkill(skillId, params = {}) {
  return request.get('/works/by-skill', {}, {
    params: { skill_id: skillId, ...params },
    ...readOptions()
  })
}

/** 3.5 作品详情（含转发溯源 source） */
export function getWorkDetail(workId) {
  return request.get('/works/' + workId, {}, readOptions())
}

/**
 * 3.1 创建作品
 * 条件必填：title（非 text_only 时必填）/ text_content（text_only 时必填）
 * TODO(契约待后端确认)：files、cover_url 需先经 uploadWorkFile 上传拿到**相对 URL** 再提交
 */
export function createWork(data) {
  return request.post('/works/', data)
}

/** 3.2 编辑作品（部分更新，仅作者） */
export function updateWork(workId, data) {
  return request.put('/works/' + workId, data)
}

/** 3.3 发布作品（草稿→已发布，已发布幂等返回） */
export function publishWork(workId) {
  return request.post('/works/' + workId + '/publish')
}

/** 3.4 删除作品（软删除，仅作者） */
export function deleteWork(workId) {
  return request.delete('/works/' + workId)
}

/** 3.6 我的作品（分页） @param {Object} params { status, page, page_size } */
export function getMyWorks(params = {}) {
  return request.get('/works/mine', {}, { params, ...readOptions() })
}

/** 3.7 某用户的作品（分页，仅可见作品） */
export function getUserWorks(userId, params = {}) {
  return request.get('/works/user/' + userId, {}, { params, ...readOptions() })
}

/** 3.8 某用户点赞的作品（分页） */
export function getUserLikedWorks(userId, params = {}) {
  return request.get('/works/user/' + userId + '/liked', {}, { params, ...readOptions() })
}

/** 3.14 快捷转发 @param {Object} data { description, visibility_type, location, allow_users, deny_users } */
export function repostWork(workId, data = {}) {
  return request.post('/works/' + workId + '/repost', data)
}

/** 3.15 分享计数 → { share_count }（分享明细接口后端已明确暂缓） */
export function shareWork(workId) {
  return request.post('/works/' + workId + '/share')
}

/** 4.1 点赞 → { is_liked: true }（重复点赞 4003，request 层已静默忽略） */
export function likeWork(workId) {
  return request.post('/works/' + workId + '/like')
}

/** 4.2 取消点赞 → { is_liked: false }（未点赞 4004，静默忽略） */
export function unlikeWork(workId) {
  return request.delete('/works/' + workId + '/like')
}

/** 4.3 点赞用户列表（分页） */
export function getWorkLikes(workId, params = {}) {
  return request.get('/works/' + workId + '/likes', {}, { params, ...readOptions() })
}

/**
 * 4.4 发表评论 / 回复
 * @param {Object} data { content 必填, parent_id? } 只能回复一级评论（二级返回 4007）
 */
export function createComment(workId, data) {
  return request.post('/works/' + workId + '/comments', data)
}

/** 4.5 评论列表（分页，按时间倒序） */
export function getComments(workId, params = {}) {
  return request.get('/works/' + workId + '/comments', {}, { params, ...readOptions() })
}

/** 4.6 删除评论（软删除，仅作者） */
export function deleteComment(commentId) {
  return request.delete('/comments/' + commentId)
}

/** 4.7 评论的回复列表（分页） */
export function getCommentReplies(commentId, params = {}) {
  return request.get('/comments/' + commentId + '/replies', {}, { params, ...readOptions() })
}

/**
 * 3.9 作品文件上传（单文件，字段名 file）
 * @param {String} filePath uni.chooseImage / chooseVideo 得到的临时路径
 * @returns {Promise<{url, full_url, file_name, file_size, file_type}>} url 为相对路径，建作品时提交这个
 */
export function uploadWorkFile(filePath, options = {}) {
  return uploadFile({ folder: 'works', filePath, ...options })
}

export default {
  getFeed,
  getFollowingFeed,
  searchWorks,
  getWorksBySkill,
  getWorkDetail,
  createWork,
  updateWork,
  publishWork,
  deleteWork,
  getMyWorks,
  getUserWorks,
  getUserLikedWorks,
  repostWork,
  shareWork,
  likeWork,
  unlikeWork,
  getWorkLikes,
  createComment,
  getComments,
  deleteComment,
  getCommentReplies,
  uploadWorkFile
}