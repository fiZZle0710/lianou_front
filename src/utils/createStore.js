/**
 * 创作流程跨页传递的临时数据（内存态，不持久化）
 * - 相册选图页（真实相册照片）→ 图片发布编辑页
 * - 对接后端后，可替换为接口/全局状态，页面逻辑不变
 */
// [{ id, src: 相册返回的真实图片路径（App/H5 均为本地临时路径）, gradient: 无真实图时的色块兜底, label }]
export const selectedImages = []

export function setSelectedImages(list) {
  selectedImages.length = 0
  ;(list || []).forEach((x) => selectedImages.push(x))
}

export function clearSelectedImages() {
  selectedImages.length = 0
}