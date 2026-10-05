/**
 * 认证模块接口
 *
 * 契约来源：docs/backend/API-2026-09-27.md §1（共 7 个接口，前缀 /api/v1/auth）
 * 返回已被 src/utils/request.js 拆包，这里拿到的是 data 本体：
 *   - 注册：{ token, user, is_new_user: true }
 *   - 登录：{ token, user, is_new_user: false }
 *   - 发码：{ dev_code }（开发环境直接返回验证码）
 * 约定：除 send-code / register / login / reset-password 外均需登录态。
 */
import request from '@/utils/request.js'
import { setToken, setUserInfo, clearAuth } from '@/utils/auth.js'

/** 写入登录态（token + user），返回同一份 payload */
function persistAuth(res) {
  if (!res) return res
  if (res.token) setToken(res.token)
  if (res.user) setUserInfo(res.user)
  return res
}

/**
 * 1.1 发送验证码（无需登录）
 * @param {String} phone 手机号，正则 ^1[3-9]\d{9}$
 * @param {String} scene register | reset
 * @returns {Promise<{dev_code: String}>} 开发环境会回传验证码
 * 错误码：1001 手机号格式 / 1005 已注册 / 1006 未注册 / 1008 场景不合法 / 429 发送过频（前端需 60s 倒计时）
 */
export function sendCode(phone, scene) {
  return request.post('/auth/send-code', { phone, scene })
}

/**
 * 1.2 注册（无需登录），成功后自动写入登录态
 * @param {Object} data { phone, code, password, nickname? }
 * @returns {Promise<{token, user, is_new_user}>}
 */
export function register(data) {
  return request.post('/auth/register', data).then(persistAuth)
}

/**
 * 1.3 密码登录（无需登录），成功后自动写入登录态
 * @param {Object|String} data { phone, password } 或直接传手机号
 * @param {String} [password] 当第一个参数为手机号时使用
 * @returns {Promise<{token, user, is_new_user}>}
 */
export function login(data, password) {
  const body = typeof data === 'string' ? { phone: data, password } : data
  return request.post('/auth/login', body).then(persistAuth)
}

/**
 * 1.4 重置密码（无需登录）
 * @param {Object} data { phone, code, new_password }
 */
export function resetPassword(data) {
  return request.post('/auth/reset-password', data)
}

/** 1.5 刷新 Token（需登录）→ { token }，并同步更新本地 token */
export function refreshToken() {
  return request.post('/auth/refresh').then((res) => {
    if (res && res.token) setToken(res.token)
    return res
  })
}

/** 1.6 当前用户信息（需登录）→ User.to_dict，并同步更新本地缓存 */
export function getMe() {
  return request.get('/auth/me').then((user) => {
    if (user) setUserInfo(user)
    return user
  })
}

/**
 * 1.7 登出（需登录）
 * JWT 无状态，后端只回 message；前端无论接口成败都要清本地登录态。
 */
export function logout() {
  return request
    .post('/auth/logout', {}, { showError: false })
    .catch(() => null)
    .then((res) => {
      clearAuth()
      return res
    })
}

export default {
  sendCode,
  register,
  login,
  resetPassword,
  refreshToken,
  getMe,
  logout
}
