/**
 * 基于 uni.uploadFile 的文件上传封装
 *
 * 契约（docs/backend/API-2026-09-27.md 第四节《上传接口细节》）：
 *   - 三个接口均为**单文件**上传，字段名 `file`（多文件由前端循环调用）
 *   - POST /api/v1/works/upload    → { url }
 *   - POST /api/v1/profile/upload  → { url, file_name, file_type }
 *   - POST /api/v1/messages/upload → { file_url, file_name, file_size, file_type }（20MB 上限）
 *   - 返回的是**相对 URL**（如 /uploads/works/a.png），展示前需拼服务器根地址
 *
 * 统一返回：{ url, full_url, file_name, file_size, file_type, raw }
 */
import { UPLOAD_URLS, DEBUG } from './config.js'
import { getToken, clearAuth, toLogin } from './auth.js'
import { buildFileUrl } from './fileUrl.js'

/**
 * @param {Object} options
 * @param {string} options.filePath 本地文件路径（uni.chooseImage / chooseVideo 得到的 tempFilePaths[0]）
 * @param {string} options.name     后端接收文件的字段名，固定 file
 * @param {string} options.folder   上传用途：works / profile / messages（决定打哪个接口）
 * @param {Object} options.formData 额外表单字段
 * @param {string} options.url      自定义上传地址（优先级最高）
 */
export function uploadFile(options = {}) {
  const {
    filePath = '',
    name = 'file',
    folder = 'works',
    formData = {},
    url = '',
    showError = true
  } = options

  const target = url || UPLOAD_URLS[folder] || UPLOAD_URLS.works

  const token = getToken()
  const header = token ? { Authorization: 'Bearer ' + token } : {}

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: target,
      filePath,
      name,
      formData,
      header,
      success: (res) => {
        if (DEBUG) console.log('[upload]', target, '=>', res.statusCode, res.data)

        let body = res.data
        try {
          body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
        } catch (e) {
          /* 非 JSON 返回保持不变 */
        }

        // 登录失效：HTTP 401 或业务码 401
        if (res.statusCode === 401 || (body && Number(body.code) === 401)) {
          clearAuth()
          uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
          setTimeout(() => toLogin(), 500)
          reject(body || res)
          return
        }

        // HTTP 非 2xx
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const err = {
            code: res.statusCode,
            message: (body && body.message) || '上传失败(' + res.statusCode + ')'
          }
          if (showError) uni.showToast({ title: err.message, icon: 'none' })
          reject(err)
          return
        }

        // 业务码失败
        if (body && body.code !== undefined && Number(body.code) !== 200) {
          const err = { code: Number(body.code), message: body.message || '上传失败' }
          if (showError) uni.showToast({ title: err.message, icon: 'none' })
          reject(err)
          return
        }

        const data = (body && body.data) || body || {}
        const relative = data.url || data.file_url || ''
        resolve({
          url: relative, // 相对路径，提交给后端时用这个
          full_url: buildFileUrl(relative), // 可直接给 <image src> 显示
          file_name: data.file_name || '',
          file_size: data.file_size || 0,
          file_type: data.file_type || '',
          raw: data
        })
      },
      fail: (err) => {
        if (DEBUG) console.error('[upload] fail', target, err)
        if (showError) uni.showToast({ title: '上传失败，请检查网络后重试', icon: 'none' })
        reject(err)
      }
    })
  })
}

/**
 * 批量上传（后端仅支持单文件，这里按顺序循环调用）
 * @param {Array<string>} filePaths
 * @returns {Promise<Array>} 与入参顺序一致的统一结果数组
 */
export async function uploadFiles(filePaths = [], options = {}) {
  const results = []
  for (const filePath of filePaths) {
    results.push(await uploadFile({ ...options, filePath }))
  }
  return results
}

export { buildFileUrl }
export default uploadFile
