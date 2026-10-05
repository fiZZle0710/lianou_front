/**
 * 文件 URL 拼接
 *
 * 后端上传接口返回的是**相对 URL**（docs/backend/API-2026-09-27.md 第四节），
 * 例如 `/uploads/works/a.png`，需要前端拼上服务器根地址（不含 /api/v1）才能访问。
 */
import { SERVER_URL } from './config.js'

/**
 * 相对路径 → 可访问地址；已是绝对地址（http/https）或空值时原样返回
 * @param {String} value
 * @returns {String}
 */
export function buildFileUrl(value) {
  if (!value) return ''
  const url = String(value).trim()
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  if (url.indexOf('//') === 0) return 'http:' + url
  return SERVER_URL + (url.charAt(0) === '/' ? url : '/' + url)
}

/** 批量拼接（过滤空值、去重） */
export function buildFileUrlList(list) {
  if (!Array.isArray(list)) return []
  const out = []
  list.forEach((item) => {
    const url = buildFileUrl(item)
    if (url && out.indexOf(url) === -1) out.push(url)
  })
  return out
}

export default { buildFileUrl, buildFileUrlList }
