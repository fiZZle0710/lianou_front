/**
 * 后端业务错误码 → 前端提示文案 / 处理方式
 *
 * 来源：docs/backend/API-2026-09-27.md 第五节《错误码完整表》
 * 约定：HTTP 状态码与业务码分离；响应 `{ code, message, data }`，成功时 `code = 200`。
 *
 * handle 取值：
 *   'toast'     弹提示（默认）
 *   'login'     清除登录态并跳登录页
 *   'countdown' 验证码倒计时提示（60s 内不可重发）
 *   'silent'    静默忽略（重复点赞 / 未点赞这类无意义的失败）
 */

export const API_ERRORS = {
  // ── 通用 ──
  400: { message: '请求参数不能为空 / 格式错误' },
  401: { message: '未登录或 Token 过期', handle: 'login' },
  403: { message: '无权限' },
  404: { message: '资源不存在' },
  429: { message: '验证码发送过于频繁', handle: 'countdown' },
  500: { message: '服务器错误' },

  // ── 1xxx 认证模块 ──
  1001: { message: '手机号格式不正确' },
  1002: { message: '验证码错误 / 验证码场景不匹配' },
  1003: { message: '验证码已过期', handle: 'resend' },
  1004: { message: '请先发送验证码' },
  1005: { message: '该手机号已注册' },
  1006: { message: '手机号或密码错误 / 该手机号未注册' },
  1007: { message: '密码格式不正确（8-20 位含字母+数字）' },
  1008: { message: '场景参数不合法（register/reset）' },

  // ── 2xxx 档案模块 ──
  2001: { message: '身份类型不合法' },
  2002: { message: '存在无效的技能 ID' },
  2004: { message: '最多选择 5 个技能' },
  2005: { message: '最多选择 5 个风格词汇' },
  2006: { message: '存在无效的风格词汇 ID' },
  2010: { message: '无权限（工作 / 教育 / 能力经历不存在或非本人）' },
  2011: { message: '学段不合法（小学 / 中学 / 大学）' },
  2012: { message: '图片 / 文件数量超限' },

  // ── 3xxx 作品 + 消息模块 ──
  3001: { message: '作品不存在或未发布' },
  3002: { message: '无权限（操作他人作品）' },
  3003: { message: '作品已删除 / 不能和自己对话 / 会话不存在或无权访问' },
  3004: { message: '渠道不合法 / 群不存在或非群成员' },
  3005: { message: '文件数超限（>9）/ 不能关注自己' },
  3006: { message: '技能标签无效 / 已关注该用户' },
  3007: { message: '可见性类型无效 / msg_type 暂不支持' },
  3008: { message: '自定义规则超限（>20）/ 群主不能直接退出' },
  3009: { message: '转发参数互斥（source_work_id / source_project_id 二选一）' },

  // ── 4xxx 互动模块 ──
  4001: { message: '作品不存在或未发布' },
  4002: { message: '无权删除他人评论' },
  4003: { message: '已点赞过该作品', handle: 'silent' },
  4004: { message: '未点赞过该作品', handle: 'silent' },
  4005: { message: '评论 / 父评论不存在' },
  4006: { message: '评论内容不能为空' },
  4007: { message: '回复层级超限（只能回复一级评论）' },

  // ── 5xxx 项目模块 ──
  5001: { message: '项目不存在' },
  5002: { message: '无权限（非项目发起人）' },
  5003: { message: '状态流转不合法' },
  5004: { message: '不能申请自己的项目' },
  5005: { message: '已申请过该项目' },
  5006: { message: '申请不存在' },
  5007: { message: '申请已处理' },
  5008: { message: '非项目成员' },
  5009: { message: '不能自评' },
  5010: { message: '已评价过该成员' },
  5011: { message: '项目未完成，无法互评' },
  5012: { message: '分数须在 1-5 之间' },
  5013: { message: '评价标签无效或未启用' },

  // ── 6xxx 活动模块 ──
  6001: { message: '活动不存在' },
  6002: { message: '作品不存在或不属于你' },
  6003: { message: '已参与该活动' },
  6004: { message: '活动已结束' }
}

/** 成功业务码 */
export const SUCCESS_CODE = 200

/**
 * 取错误文案：优先用后端 message，其次用本地码表，最后兜底
 * @param {Number|String} code 业务码
 * @param {String} fallback 后端返回的 message（通常已经是可读的中文）
 */
export function errorMessage(code, fallback) {
  const item = API_ERRORS[Number(code)]
  return fallback || (item && item.message) || '请求失败，请稍后重试'
}

/** 取处理方式：'toast' | 'login' | 'countdown' | 'silent' | 'resend' */
export function errorHandle(code) {
  const item = API_ERRORS[Number(code)]
  return (item && item.handle) || 'toast'
}

export default API_ERRORS
