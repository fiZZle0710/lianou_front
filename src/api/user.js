/**
 * 用户 / 档案 / 关注 / 搜索 相关接口
 *
 * 契约来源：docs/backend/API-2026-09-27.md §2 档案模块（28）、§10 关注模块（6）、§12 用户搜索（1）
 * 本轮变化：2.2 `PUT /profile/me` 支持 identity/nickname/avatar/bio 部分更新，响应改为 `{user, profile}`（见 updateMyProfile）
 * 说明：登录 / 注册 / 重置密码 / 登出已迁到 src/api/auth.js，本文件不再承担认证职责。
 */
import request from '@/utils/request.js'
import { readOptions } from '@/utils/fallback.js'
import { uploadFile } from '@/utils/upload.js'
import { normalizeProfileUpdate } from '@/api/adapter.js'

// ── 枚举（文档 §六） ──
export const IDENTITIES = ['学生', '艺术爱好者', '艺术相关工作者']
export const SCHOOL_LEVELS = ['小学', '中学', '大学']

// ═══════════════ 档案 ═══════════════

/** 2.1 我的完整档案（Profile.to_dict(with_relations=True)） */
export function getMyProfile() {
  return request.get('/profile/me', {}, readOptions())
}

/**
 * 2.2 更新基础信息（昵称 / 头像 / 简介 + 档案身份）
 *
 * 契约来源：docs/backend/API-2026-09-27.md §2.2
 *   —— 后端 2026-09-27 答复 C-1 已修复：4 个字段**部分更新**，任意字段可选、未传不更新。
 * @param {Object} data { nickname?, avatar?, bio?, identity? }
 *   nickname / avatar / bio 写 `users` 表，identity 写 `profiles` 表。
 * @returns {Promise<{user, profile, ...平铺字段}>}
 *   ⚠️ 响应结构已变：旧版直接返回 profile 本体，新版为 `{ user, profile }` 双对象；
 *   api/adapter.js 的 normalizeProfileUpdate() 已把两种结构抹平，调用方按需取用。
 */
export function updateMyProfile(data) {
  return request.put('/profile/me', data).then(normalizeProfileUpdate)
}

/** 2.3 查看他人档案（无档案返回 404） */
export function getProfile(userId) {
  return request.get('/profile/' + userId, {}, readOptions())
}

/**
 * 2.4 个人主页聚合
 * @returns {Promise<{user, profile{identity,skills,style_tags}, is_following, is_followed_by, is_mutual, is_self}>}
 */
export function getHomepage(userId) {
  return request.get('/profile/homepage/' + userId, {}, readOptions())
}

// ── 技能 ──

/** 2.11 技能分类字典（含技能，无需登录）→ { categories: [...] } */
export function getSkillCategories() {
  return request.get('/profile/skills/categories', {}, readOptions())
}

/** 2.8 技能扁平列表（无需登录）→ { skills: [...] } @param {Number} [categoryId] */
export function getSkills(categoryId) {
  return request.get('/profile/skills', {}, {
    params: categoryId ? { category_id: categoryId } : {},
    ...readOptions()
  })
}

/** 2.10 我的技能 → { skills: [...] }（上限 5） */
export function getMySkills() {
  return request.get('/profile/skills/mine', {}, readOptions())
}

/** 2.9 更新我的技能（覆盖式，上限 5，去重）→ { skills }（2002 无效 ID / 2004 超限） */
export function updateMySkills(skillIds) {
  return request.put('/profile/skills', { skill_ids: skillIds })
}

// ── 风格词汇 ──

/** 2.12 风格词汇字典（无需登录，仅 is_active=True）→ { style_tags: [...] } */
export function getStyleTags() {
  return request.get('/profile/style-tags', {}, readOptions())
}

/** 2.14 我的风格词汇 → { style_tags } */
export function getMyStyleTags() {
  return request.get('/profile/style-tags/mine', {}, readOptions())
}

/** 2.13 更新我的风格词汇（覆盖式，上限 5）→ { style_tags }（2005 超限 / 2006 无效 ID） */
export function updateMyStyleTags(styleTagIds) {
  return request.put('/profile/style-tags', { style_tag_ids: styleTagIds })
}

/** 2.28 评价标签字典 → [{ id, name, category: positive|negative|neutral, sort_order, is_active }] */
export function getRatingTags() {
  return request.get('/profile/rating-tags', {}, readOptions())
}

// ═══════════════ 工作经历 2.15 ~ 2.18 ═══════════════

/** 2.15 工作经历列表 → { work_experiences: [...] } */
export function getWorkExperiences() {
  return request.get('/profile/work-experiences', {}, readOptions())
}

/**
 * 2.16 新增工作经历
 * @param {Object} data { company_name, position, start_date(YYYY-MM-DD), end_date?, is_current?,
 *                        description?, sort_order?, images?: [{image_url,caption,sort_order}]（上限 5） }
 */
export function createWorkExperience(data) {
  return request.post('/profile/work-experiences', data)
}

/** 2.17 编辑工作经历（部分更新；images 传则整体覆盖） */
export function updateWorkExperience(expId, data) {
  return request.put('/profile/work-experiences/' + expId, data)
}

/** 2.18 删除工作经历 */
export function deleteWorkExperience(expId) {
  return request.delete('/profile/work-experiences/' + expId)
}

// ═══════════════ 教育经历 2.19 ~ 2.22 ═══════════════

/** 2.19 教育经历列表 → { education_experiences: [...] } */
export function getEducationExperiences() {
  return request.get('/profile/education-experiences', {}, readOptions())
}

/**
 * 2.20 新增教育经历
 * @param {Object} data { school_level(小学|中学|大学), school_name, start_year, end_year?, degree?, major?, sort_order? }
 */
export function createEducationExperience(data) {
  return request.post('/profile/education-experiences', data)
}

/** 2.21 编辑教育经历（部分更新） */
export function updateEducationExperience(eduId, data) {
  return request.put('/profile/education-experiences/' + eduId, data)
}

/** 2.22 删除教育经历 */
export function deleteEducationExperience(eduId) {
  return request.delete('/profile/education-experiences/' + eduId)
}

// ═══════════════ 能力证明 2.23 ~ 2.26 ═══════════════

/** 2.23 能力证明列表 → { ability_proofs: [...] } */
export function getAbilityProofs() {
  return request.get('/profile/ability-proofs', {}, readOptions())
}

/**
 * 2.24 新增能力证明
 * @param {Object} data { title, description?, sort_order?, files?: [{file_url,file_name,file_type,sort_order}]（上限 10） }
 */
export function createAbilityProof(data) {
  return request.post('/profile/ability-proofs', data)
}

/** 2.25 编辑能力证明（部分更新；files 传则整体覆盖） */
export function updateAbilityProof(proofId, data) {
  return request.put('/profile/ability-proofs/' + proofId, data)
}

/** 2.26 删除能力证明 */
export function deleteAbilityProof(proofId) {
  return request.delete('/profile/ability-proofs/' + proofId)
}

/**
 * 2.27 档案文件上传（单文件，字段名 file）
 * @returns {Promise<{url, full_url, file_name, file_type}>} file_type：image / pdf / doc / video
 */
export function uploadProfileFile(filePath, options = {}) {
  return uploadFile({ folder: 'profile', filePath, ...options })
}

// ═══════════════ 关注 10.1 ~ 10.6 ═══════════════

/**
 * 10.1 关注某人 → { is_following: true, is_mutual }
 * 错误码：3005 不能关注自己；3006 已关注该用户（页面需处理为「恢复为已关注」）
 */
export function followUser(userId) {
  return request.post('/users/' + userId + '/follow')
}

/** 10.2 取消关注 → { is_following: false }（404 未关注该用户） */
export function unfollowUser(userId) {
  return request.delete('/users/' + userId + '/follow')
}

/** 10.3 关注状态 → { is_following, is_followed_by, is_mutual } */
export function getFollowStatus(userId) {
  return request.get('/users/' + userId + '/follow/status', {}, readOptions())
}

/** 10.4 我的关注列表（分页） */
export function getFollowing(params = {}) {
  return request.get('/following', {}, { params, ...readOptions() })
}

/** 10.5 我的粉丝列表（分页） */
export function getFollowers(params = {}) {
  return request.get('/followers', {}, { params, ...readOptions() })
}

/** 10.6 关注 / 粉丝计数（**无需登录**）→ { following_count, followers_count } */
export function getFollowStats(userId) {
  return request.get('/users/' + userId + '/follow/stats', {}, readOptions())
}

// ═══════════════ 用户搜索 12.1 ═══════════════

/**
 * 12.1 用户搜索（分页，q 必填，昵称模糊匹配；400 q 为空）
 * 注：**项目搜索接口后端仍缺失**（见 docs/给后端的功能缺口清单.md），搜索页的项目 Tab 暂不接
 */
export function searchUsers(q, params = {}) {
  return request.get('/users/search', {}, { params: { q, ...params }, ...readOptions() })
}

export default {
  // 档案
  getMyProfile,
  updateMyProfile,
  getProfile,
  getHomepage,
  getSkillCategories,
  getSkills,
  getMySkills,
  updateMySkills,
  getStyleTags,
  getMyStyleTags,
  updateMyStyleTags,
  getRatingTags,
  getWorkExperiences,
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  getEducationExperiences,
  createEducationExperience,
  updateEducationExperience,
  deleteEducationExperience,
  getAbilityProofs,
  createAbilityProof,
  updateAbilityProof,
  deleteAbilityProof,
  uploadProfileFile,
  // 关注
  followUser,
  unfollowUser,
  getFollowStatus,
  getFollowing,
  getFollowers,
  getFollowStats,
  // 搜索
  searchUsers
}
