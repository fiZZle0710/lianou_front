/**
 * 基于 uni.request 的请求封装
 *
 * 契约（docs/backend/API-2026-09-27.md 第一节）：
 *   响应包裹 `{ "code": 200, "message": "success", "data": {...} }`，
 *   HTTP 状态码与业务 code 分离（HTTP 遵循语义，code 为业务码，成功 code = 200）。
 *
 * 能力：
 * - 自动注入 Authorization: Bearer <token>
 * - 自动拼接 BASE_URL（含 /api/v1）与 query 参数（分页统一 page / page_size）
 * - 自动拆包裹：业务成功时 resolve 的是 `data` 本体（分页结构 / 对象 / 数组 / null）
 * - 业务失败按 src/utils/errorCodes.js 码表提示；401 清登录态并跳登录页（已防抖）
 * - 4003 / 4004（重复点赞、未点赞）静默忽略，不打扰用户
 */
import { BASE_URL, DEBUG } from './config.js'
import { getToken, clearAuth, toLogin } from './auth.js'
import { SUCCESS_CODE, errorMessage, errorHandle } from './errorCodes.js'

/**
 * 快捷 / 可定制方法：request({ ... }) 或 request.get / request.post
 */
export function request(options = {}) {
  const {
    url = '',
    method = 'GET',
    data = {},
    header = {},
    params = {},
    loading = false,
    loadText = '加载中...',
    showError = true, // 是否统一弹错误提示（读接口配合回退策略可传 false）
    raw = false, // true = 返回原始包裹 { code, message, data }，需要业务码时用
    timeout = 15000
  } = options

  // 拼接 query 参数
  let finalUrl = url.startsWith('http') ? url : BASE_URL + url
  if (params && Object.keys(params).length) {
    const qs = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&')
    finalUrl += (finalUrl.indexOf('?') > -1 ? '&' : '?') + qs
  }

  const token = getToken()
  const finalHeader = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: 'Bearer ' + token } : {}),
    ...header
  }

  if (loading) uni.showLoading({ title: loadText, mask: true })

  return new Promise((resolve, reject) => {
    uni.request({
      url: finalUrl,
      method,
      data,
      header: finalHeader,
      timeout,
      success: (res) => {
        if (DEBUG) {
          console.log('[request]', method, finalUrl, '=>', res.statusCode, res.data)
        }
        const statusCode = res.statusCode
        const body = res.data

        // ① 登录失效：HTTP 401 或业务码 401
        if (statusCode === 401 || (body && Number(body.code) === 401)) {
          handleUnauthorized()
          reject(normalizeError(body, 401))
          return
        }

        // ② HTTP 非 2xx：按 HTTP 语义处理（400 / 403 / 404 / 429 / 500）
        if (statusCode < 200 || statusCode >= 300) {
          const err = normalizeError(body, statusCode)
          handleBusinessError(err, showError)
          reject(err)
          return
        }

        // ③ HTTP 2xx 但无包裹（健康检查等老接口）：原样返回
        if (!body || typeof body !== 'object' || body.code === undefined || body.code === null) {
          resolve(body)
          return
        }

        const code = Number(body.code)

        // ④ 业务成功：拆包裹，resolve data 本体
        if (code === SUCCESS_CODE) {
          resolve(raw ? body : body.data)
          return
        }

        // ⑤ 业务失败
        const err = normalizeError(body, code)
        handleBusinessError(err, showError)
        reject(err)
      },
      fail: (err) => {
        if (DEBUG) console.error('[request] fail', finalUrl, err)
        if (showError) uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
        reject(err)
      },
      complete: () => {
        if (loading) uni.hideLoading()
      }
    })
  })
}

/** 防止并发请求同时触发多次跳登录 */
let authRedirecting = false

/** 401 统一处理：清登录态 + 提示 + 跳登录页（500ms 内只触发一次） */
function handleUnauthorized() {
  clearAuth()
  if (authRedirecting) return
  authRedirecting = true
  uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
  setTimeout(() => {
    toLogin()
    authRedirecting = false
  }, 500)
}

/** 统一错误对象：{ code, message, data } */
function normalizeError(body, code) {
  const obj = body && typeof body === 'object' ? body : {}
  return {
    code: Number(code),
    message: errorMessage(code, obj.message || obj.msg),
    data: obj.data === undefined ? null : obj.data
  }
}

/**
 * 按码表处理业务错误
 * 'login' → 跳登录页；'silent' → 静默忽略；其余 → 弹提示（showError = false 时完全不提示）
 */
function handleBusinessError(err, showError = true) {
  const handle = errorHandle(err.code)
  if (handle === 'login') {
    handleUnauthorized()
    return
  }
  if (handle === 'silent' || !showError) return
  uni.showToast({ title: err.message, icon: 'none' })
}

request.get = (url, data, options = {}) => request({ url, method: 'GET', data, ...options })
request.post = (url, data, options = {}) => request({ url, method: 'POST', data, ...options })
request.put = (url, data, options = {}) => request({ url, method: 'PUT', data, ...options })
request.delete = (url, data, options = {}) => request({ url, method: 'DELETE', data, ...options })

export default request
