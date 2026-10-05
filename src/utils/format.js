/**
 * 时间 / 展示格式化
 *
 * ⚠️ 后端时间格式（docs/backend/API-2026-09-27.md 第一节）：
 *   ISO 8601 **无时区后缀**，如 `2026-09-15T10:30:00`，UTC 存储（不带 Z / +00:00），`null` 表示空。
 *   JS 里 `new Date('2026-09-15T10:30:00')` 会按**本地时间**解析 → 会比真实时间少 8 小时，
 *   所以本文件统一按 UTC 解析后再用本地时区展示。
 */

const pad = (n) => (n < 10 ? '0' + n : String(n))

/** 无时区后缀的时间串（含仅日期） */
const NO_ZONE_RE = /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?)?$/

/**
 * 把后端时间解析为 Date（按 UTC 处理）
 * @param {String|Number|Date} value
 * @returns {Date|null}
 */
export function parseServerTime(value) {
  if (value === null || value === undefined || value === '') return null
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value
  if (typeof value === 'number') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  const str = String(value).trim()
  if (NO_ZONE_RE.test(str)) {
    const withTime = str.indexOf(':') > -1 ? str : str + ' 00:00:00'
    const d = new Date(withTime.replace(' ', 'T') + 'Z')
    return isNaN(d.getTime()) ? null : d
  }
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

/** `2026-09-15` */
export function formatDate(value) {
  const d = parseServerTime(value)
  if (!d) return ''
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

/** `2026-09-15 18:30`（withSeconds = true 时带秒） */
export function formatDateTime(value, withSeconds = false) {
  const d = parseServerTime(value)
  if (!d) return ''
  const hm = pad(d.getHours()) + ':' + pad(d.getMinutes())
  return formatDate(d) + ' ' + (withSeconds ? hm + ':' + pad(d.getSeconds()) : hm)
}

/** `09-15`（用于列表里显示短日期） */
export function formatMonthDay(value) {
  const d = parseServerTime(value)
  if (!d) return ''
  return pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

/**
 * 相对时间：刚刚 / N分钟前 / N小时前 / 昨天 / N天前 / 日期
 * （后端已有的 `time` 之类相对文案字段优先用后端的，这里用于只有时间戳的场景）
 */
export function fromNow(value) {
  const d = parseServerTime(value)
  if (!d) return ''
  const diff = Date.now() - d.getTime()
  const MIN = 60 * 1000
  const HOUR = 60 * MIN
  const DAY = 24 * HOUR
  if (diff < 0) return formatDate(d)
  if (diff < MIN) return '刚刚'
  if (diff < HOUR) return Math.floor(diff / MIN) + '分钟前'
  if (diff < DAY) return Math.floor(diff / HOUR) + '小时前'
  if (diff < 2 * DAY) return '昨天'
  if (diff < 30 * DAY) return Math.floor(diff / DAY) + '天前'
  return formatDate(d)
}

/** 秒数 → `mm:ss`（语音时长） */
export function formatDuration(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0))
  return pad(Math.floor(s / 60)) + ':' + pad(s % 60)
}

/** 大数缩写：1234 → 1.2k、12345 → 1.2w（中文习惯用万） */
export function formatCount(value) {
  const n = Number(value) || 0
  if (n < 1000) return String(n)
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w'
}

/** 文件大小：1536 → 1.5KB */
export function formatFileSize(bytes) {
  const n = Number(bytes)
  if (!n || n < 0) return ''
  if (n < 1024) return n + 'B'
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + 'KB'
  return (n / 1024 / 1024).toFixed(1) + 'MB'
}

export default {
  parseServerTime,
  formatDate,
  formatDateTime,
  formatMonthDay,
  fromNow,
  formatDuration,
  formatCount,
  formatFileSize
}
