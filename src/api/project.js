/**
 * 项目相关接口
 *
 * 契约来源：docs/backend/API-2026-09-27.md §5 项目模块（19）
 * 本轮变化（后端 2026-09-27 答复 C-3）：
 *   - 5.1 `mode` 枚举 free/paid；`budget` 为 **int**（单位元，不能为负）；`deadline` 为 **ISO 8601 字符串**
 *     （如 `2026-12-31T23:59:59`，可空）→ 只传纯日期 `2026-12-31` 会让后端 `datetime.fromisoformat` 报错
 *   - `required_skills` 入参仍是 **int[]**（技能 ID 数组），但**返回**改为对象数组（见 adapter.toRequiredSkill）
 * 响应结构（build_project_item / build_application_item，见文档附录与后端《需求实现说明》）：
 *   - 列表/详情：Project.to_dict 基础字段 + `creator` + `member_avatars[{user_id,avatar,nickname}]`，
 *     详情额外含 `creator.skills`、`creator.joined_project_count`
 *   - 申请项：{ application_id, project_id, user_id, status, message, created_at, processed_at,
 *              applicant{user_id,nickname,avatar} }
 *   - 我的申请：build_my_application_item
 * TODO(契约待后端确认)：build_project_item / build_my_application_item 完整字段未见文档，
 *   适配层（src/api/adapter.js）同时兼容 `project_id`/`id`、`creator`/`owner` 两种命名。
 */
import request from '@/utils/request.js'
import { readOptions } from '@/utils/fallback.js'

// ── 枚举（文档 §六） ──
export const PROJECT_STATUS = ['recruiting', 'ongoing', 'completed', 'closed']
export const APPLICATION_STATUS = ['pending', 'approved', 'rejected', 'left', 'removed']

/**
 * 5.2 项目列表（分页）
 * @param {Object} params { page, page_size, status, mode, skill_id }
 */
export function getProjects(params = {}) {
  return request.get('/projects/', {}, { params, ...readOptions() })
}

/**
 * 5.1 创建项目
 * @param {Object} data { title 必填, description, topic, mode, cover_url, budget, deadline,
 *                        max_members, required_level, required_project_count, required_skills, contact_visible }
 */
export function createProject(data) {
  return request.post('/projects/', data)
}

/** 5.3 项目详情（含 creator.skills、member_avatars） */
export function getProjectDetail(projectId) {
  return request.get('/projects/' + projectId, {}, readOptions())
}

/** 5.4 编辑项目（仅发起人，且 recruiting 状态） */
export function updateProject(projectId, data) {
  return request.put('/projects/' + projectId, data)
}

/** 5.5 申请加入 @param {Object} data { message? } 申请附言 */
export function applyProject(projectId, data = {}) {
  return request.post('/projects/' + projectId + '/apply', data)
}

/**
 * 5.8 待审申请列表（仅 owner，分页）
 * @param {Object} params { status, page, page_size }
 */
export function getProjectApplications(projectId, params = {}) {
  return request.get('/projects/' + projectId + '/applications', {}, { params, ...readOptions() })
}

/** 5.6 通过申请（仅 owner） */
export function approveApplication(projectId, applicationId) {
  return request.post('/projects/' + projectId + '/applications/' + applicationId + '/approve')
}

/** 5.7 拒绝申请（仅 owner） */
export function rejectApplication(projectId, applicationId) {
  return request.post('/projects/' + projectId + '/applications/' + applicationId + '/reject')
}

/** 5.9 成员列表 → { list: [{ user_id, nickname, avatar, level, role, joined_at }], total } */
export function getProjectMembers(projectId) {
  return request.get('/projects/' + projectId + '/members', {}, readOptions())
}

/** 5.10 项目关联作品（分页，仅 published） */
export function getProjectWorks(projectId, params = {}) {
  return request.get('/projects/' + projectId + '/works', {}, { params, ...readOptions() })
}

/** 5.11 关闭项目（仅 owner） */
export function closeProject(projectId) {
  return request.post('/projects/' + projectId + '/close')
}

/** 5.12 结束项目（仅 owner，ongoing→completed） */
export function finishProject(projectId) {
  return request.post('/projects/' + projectId + '/finish')
}

/** 5.13 退出项目（成员，非 owner） */
export function leaveProject(projectId) {
  return request.post('/projects/' + projectId + '/leave')
}

/** 5.14 移除成员（仅 owner） */
export function removeProjectMember(projectId, userId) {
  return request.post('/projects/' + projectId + '/members/' + userId + '/remove')
}

/** 5.15 某用户的项目（分页） */
export function getUserProjects(userId, params = {}) {
  return request.get('/projects/user/' + userId, {}, { params, ...readOptions() })
}

/** 5.16 我的项目（分页） @param {Object} params { role, page, page_size } */
export function getMyProjects(params = {}) {
  return request.get('/projects/mine', {}, { params, ...readOptions() })
}

/** 5.17 我的申请列表（分页） @param {Object} params { status, page, page_size } */
export function getMyApplications(params = {}) {
  return request.get('/projects/my-applications', {}, { params, ...readOptions() })
}

/**
 * 5.18 提交互评（项目须 completed；不可自评；同 (project,from,to) 不可重复）
 * @param {Object} data { to_user_id 必填, score 必填 1-5, comment?, tags?: int[], is_anonymous? }
 */
export function submitRating(projectId, data) {
  return request.post('/projects/' + projectId + '/ratings', data)
}

/** 5.19 互评列表（分页，仅成员；匿名项 from_user_id / from_user 为 null） */
export function getRatings(projectId, params = {}) {
  return request.get('/projects/' + projectId + '/ratings', {}, { params, ...readOptions() })
}

export default {
  getProjects,
  createProject,
  getProjectDetail,
  updateProject,
  applyProject,
  getProjectApplications,
  approveApplication,
  rejectApplication,
  getProjectMembers,
  getProjectWorks,
  closeProject,
  finishProject,
  leaveProject,
  removeProjectMember,
  getUserProjects,
  getMyProjects,
  getMyApplications,
  submitRating,
  getRatings
}