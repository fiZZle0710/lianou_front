<template>
  <!-- 通用安全图片：src 为空或加载失败时回落到内置占位图，避免裂图
       （与 UserAvatar / WorkCard 的 @error 兜底同一套思路，抽出来给页面直接用） -->
  <image :src="current" :mode="mode" @error="onError"></image>
</template>

<script setup>
import { ref, watch } from 'vue'

// 内联占位图（浅灰底 + 图片图标 + 文案），视觉与 WorkCard 的兜底图一致
const DEFAULT_IMAGE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#F2F2F2"/>' +
  '<g fill="#C8C8C8"><rect x="250" y="150" width="100" height="80" rx="6"/>' +
  '<circle cx="278" cy="180" r="10" fill="#A8A8A8"/>' +
  '<path d="M268 222 L292 196 L312 214 L336 188 L342 222 Z" fill="#A8A8A8"/></g>' +
  '<text x="300" y="270" font-family="Helvetica,Arial,sans-serif" font-size="22" fill="#9A9A9A" text-anchor="middle">暂无图片</text></svg>'
)

const props = defineProps({
  // 图片地址，可为空
  src: {
    type: String,
    default: ''
  },
  // 同 uni <image> 的 mode
  mode: {
    type: String,
    default: 'aspectFill'
  },
  // 自定义占位图（不传则用内置的）
  fallback: {
    type: String,
    default: ''
  }
})

/** 当前生效的占位图 */
function placeholder() {
  return props.fallback || DEFAULT_IMAGE
}

// current 跟随 props.src；src 为空或加载失败时回落到占位图
const current = ref(props.src || placeholder())
watch(() => [props.src, props.fallback], () => { current.value = props.src || placeholder() })

function onError() {
  if (current.value !== placeholder()) current.value = placeholder()
}
</script>
