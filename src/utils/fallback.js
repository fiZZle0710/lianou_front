/**
 * 接口失败回退（联调过渡期用）
 *
 * 背景：后端测试环境地址 / 账号尚未到位，若前端直接只用真实接口，页面会全部空白。
 * 策略：**只对「读」接口回退**到 src/mock 假数据，并在页面上显示「演示数据」灰标；
 *       点赞 / 关注 / 发布 / 上传 / 发消息 / 审批等写操作**绝不回退**，失败就提示，
 *       避免出现「看着成功了其实是假的」。
 *
 * 开关：src/utils/config.js 的 DEBUG_FALLBACK（默认 true，联调通过后改 false）
 */
import { DEBUG, DEBUG_FALLBACK } from './config.js'

/**
 * @param {Function} fetchFn     真实请求（返回 Promise）
 * @param {Function|*} mockFactory 回退数据（函数或值）
 * @param {String} label         日志标识（便于定位是哪个接口在回退）
 * @returns {Promise<{data: *, isFallback: boolean}>}
 */
export async function withFallback(fetchFn, mockFactory, label = '') {
  try {
    const data = await fetchFn()
    return { data, isFallback: false }
  } catch (err) {
    if (!DEBUG_FALLBACK) throw err
    const data = typeof mockFactory === 'function' ? mockFactory(err) : mockFactory
    if (DEBUG) {
      console.warn('[fallback]', label || 'request', '→ 使用演示数据；真实接口失败：', err && (err.code || err.message || err))
    }
    return { data, isFallback: true }
  }
}

/**
 * 把接口返回统一取成数组
 * 后端分页返回 `{ total, page, page_size, total_pages, list }`，非分页多为数组
 */
export function unwrapList(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.list)) return data.list
  if (data && Array.isArray(data.items)) return data.items
  return []
}

/** 取分页信息（配合 unwrapList 使用） */
export function unwrapPage(data) {
  if (data && !Array.isArray(data) && Array.isArray(data.list)) {
    return {
      total: data.total || 0,
      page: data.page || 1,
      pageSize: data.page_size || 20,
      totalPages: data.total_pages || 1,
      list: data.list
    }
  }
  const list = unwrapList(data)
  return { total: list.length, page: 1, pageSize: list.length || 20, totalPages: 1, list }
}

/** 读接口的请求选项：开启回退时关掉内置 toast，避免"用着演示数据还一直弹网络异常" */
export function readOptions() {
  return { showError: !DEBUG_FALLBACK }
}

export default { withFallback, unwrapList, unwrapPage, readOptions }
