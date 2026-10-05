/**
 * 登录态 / Token 统一管理
 * - token 存入本地缓存，实现登录态保持
 * - 所有读写都走这里，避免各处写散落的 key
 */

const TOKEN_KEY = 'token'
const USER_KEY = 'user_info'

export function getToken() {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

export function setToken(token) {
  if (!token) return
  uni.setStorageSync(TOKEN_KEY, token)
}

export function removeToken() {
  uni.removeStorageSync(TOKEN_KEY)
}

export function getUserInfo() {
  const raw = uni.getStorageSync(USER_KEY)
  if (!raw) return null
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch (e) {
    return null
  }
}

export function setUserInfo(info) {
  uni.setStorageSync(USER_KEY, info)
}

export function removeUserInfo() {
  uni.removeStorageSync(USER_KEY)
}

/**
 * 是否已登录
 */
export function isLoggedIn() {
  return !!getToken()
}

/**
 * 清空全部登录态（退出登录 / token 失效时调用）
 */
export function clearAuth() {
  removeToken()
  removeUserInfo()
}

/**
 * 跳转登录页（已处理重复跳转）
 */
export function toLogin() {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1]
  if (current && current.route === 'pages/login/index') return
  uni.navigateTo({
    url: '/pages/login/index'
  })
}
