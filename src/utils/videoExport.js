/**
 * 视频导出抽象层（模式 B：编辑 UI 由本项目负责，仅用 SDK 的“合成导出”能力）
 * ------------------------------------------------------------------
 * 数据流：
 *   editor 工程数据(projectConfig) --exportVideo()--> 渲染计划(renderPlan) --nativeExport()--> 成片路径
 *
 * 目前：nativeExport 为占位实现（不合成，仅做校验 + 延时返回），保证 UI 流程可跑通。
 * 将来：接入腾讯云视立方·短视频 SDK（TXUGC）后，只需替换 nativeExport 内部实现，
 *       编辑页与调用方代码无需改动。
 *
 * ⚠️ 对接 SDK：见文件底部 nativeExport() 注释
 */

/** 输出分辨率 → 像素尺寸 */
export const RESOLUTION_MAP = {
  '480p': { width: 852, height: 480 },
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '2k': { width: 2560, height: 1440 },
  '4k': { width: 3840, height: 2160 }
}

/** 裁剪比例 → [宽, 高] */
export const CROP_MAP = {
  '16:9': [16, 9],
  '1:1': [1, 1],
  '4:3': [4, 3],
  '9:16': [9, 16]
}

/** 获取输出像素尺寸（默认 1080p） */
export function getOutputSize(project) {
  const key = (project && project.output && project.output.resolution) || '1080p'
  return RESOLUTION_MAP[key] || RESOLUTION_MAP['1080p']
}

/**
 * 把编辑器工程数据规范化为「渲染计划」
 * 该结构即将来喂给 SDK 的入参（片段序列 / 音频 / 文字 / 导出参数）
 */
export function buildRenderPlan(project) {
  const p = project || {}
  const output = p.output || {}
  const audio = p.audioSettings || {}
  const clips = (p.videoClips || []).map(function (c, i) {
    return {
      index: i,
      path: c.path,
      // 单段起止时间（裁剪）
      startTime: c.startTime || 0,
      endTime: c.endTime || c.duration || 0,
      duration: c.duration || 0,
      speed: c.speed || 1.0,
      crop: c.crop || output.crop || null,
      source: { width: c.width || 0, height: c.height || 0 }
    }
  })
  return {
    version: p.version || (p.meta && p.meta.version) || '1.0.0',
    clips: clips,
    audio: {
      originalEnabled: audio.originalEnabled !== false,
      originalVolume: audio.originalVolume != null ? audio.originalVolume : 100,
      backgroundMusic: (audio.backgroundMusic || []).map(function (a) {
        return {
          path: a.path,
          volume: a.volume != null ? a.volume : 80,
          startTime: a.startTime || 0,
          duration: a.duration || 0,
          fadeIn: a.fadeIn || 0,
          fadeOut: a.fadeOut || 0
        }
      }),
      voice: (audio.voice || []).map(function (a) {
        return {
          path: a.path,
          volume: a.volume != null ? a.volume : 100,
          startTime: a.startTime || 0,
          duration: a.duration || 0
        }
      })
    },
    textLayers: (p.textLayers || []).map(function (t, i) {
      return {
        index: i,
        content: t.content,
        font: t.font,
        size: t.size,
        color: t.color,
        // 位置：SDK 多用归一化坐标（0~1），此处保留原始画布坐标，接入时再换算
        x: t.x,
        y: t.y,
        rotation: t.rotation || 0,
        opacity: t.opacity != null ? t.opacity : 1,
        startTime: t.startTime || 0,
        endTime: t.endTime || 0
      }
    }),
    output: {
      resolution: output.resolution || '1080p',
      size: getOutputSize(p),
      crop: output.crop || null,
      fps: output.fps || 30,
      bitrate: output.bitrate || 10
    }
  }
}

/**
 * 导出成片
 * @param {Object} project 编辑器工程数据（projectConfig）
 * @param {Object} [options] 附加选项，如 { delay }
 * @returns {Promise<{ success: boolean, videoPath: string, placeholder: boolean, plan: Object }>}
 */
export function exportVideo(project, options = {}) {
  const plan = buildRenderPlan(project)
  if (!plan.clips.length) {
    return Promise.reject(new Error('请先导入视频素材'))
  }
  return nativeExport(plan, options)
}

/**
 * ⚠️ 对接 SDK —— 腾讯云视立方·短视频 SDK（TXUGC）接入位置
 *
 * 目前为占位实现：不合成，延时返回，保证页面流程可跑通。
 * 接入时在此处调用 SDK（模式 B，无 UI 合成导出），例如：
 *   1) 用 plan.clips 初始化拼接器 / 剪辑器（含 startTime/endTime、speed、crop）
 *   2) 设置背景音乐、配音、原音音量（plan.audio）
 *   3) 叠加文字图层（plan.textLayers，注意坐标换算）
 *   4) 按 plan.output 设置分辨率/帧率/码率并合成输出
 *   5) resolve({ success: true, videoPath: 成片本地路径, placeholder: false, plan })
 */
function nativeExport(plan, options) {
  return new Promise(function (resolve) {
    console.log('[videoExport] 渲染计划（待接入 SDK 合成）', plan)
    setTimeout(function () {
      resolve({ success: true, videoPath: '', placeholder: true, plan: plan })
    }, options.delay != null ? options.delay : 1500)
  })
}

export default exportVideo