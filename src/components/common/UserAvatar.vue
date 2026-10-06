<template>
  <!-- 用户头像组件 - 支持头像框 -->
  <view class="avatar-wrapper" :style="wrapperStyle" @click="handleClick">
    <image :src="current" mode="aspectFill" class="avatar" :style="avatarStyle" @error="onError"></image>
    <!-- 头像框装饰 -->
    <view v-if="frame" class="avatar-frame" :style="frameStyle">
      <image :src="frame" mode="aspectFit" class="frame-image"></image>
    </view>
    <!-- 皇冠标识 -->
    <view v-if="showCrown" class="crown-badge">
      <text class="crown-icon">👑</text>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

// 命名尺寸（对应原 px 设计值，供 size="small" 等字符串使用）
const SIZE_MAP = { small: 40, normal: 44, large: 80 }

// 内联默认头像 SVG（灰底 + 头像剪影），无需外部文件，避免 src 失效时裂图
const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" fill="#ECECEC"/>' +
  '<circle cx="120" cy="96" r="44" fill="#BDBDBD"/>' +
  '<path d="M44 220 C44 172 80 144 120 144 C160 144 196 172 196 220 Z" fill="#BDBDBD"/></svg>'
)

const props = defineProps({
  src: {
    type: String,
    default: '/static/default-avatar.png'
  },
  size: {
    type: [String, Number],
    default: 'normal'
  },
  frame: {
    type: String,
    default: ''
  },
  showCrown: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

// current 跟随 props.src；src 为空或加载失败时回落到 DEFAULT_AVATAR
const current = ref(props.src || DEFAULT_AVATAR)
watch(() => props.src, (v) => { current.value = v || DEFAULT_AVATAR })
function onError() {
  if (current.value !== DEFAULT_AVATAR) current.value = DEFAULT_AVATAR
}

// 将尺寸解析为 rpx：px 设计值 ×2（750rpx 基准），保持现有视觉大小并随页面缩放
function resolveRpx(size) {
  const px = typeof size === 'number' ? size : (SIZE_MAP[size] || SIZE_MAP.normal)
  return px * 2
}

const wrapperStyle = computed(() => ({
  width: resolveRpx(props.size) + 'rpx',
  height: resolveRpx(props.size) + 'rpx'
}))

const avatarStyle = computed(() => ({
  width: resolveRpx(props.size) + 'rpx',
  height: resolveRpx(props.size) + 'rpx',
  borderRadius: '50%'
}))

const frameStyle = computed(() => ({
  width: (resolveRpx(props.size) + 16) + 'rpx',
  height: (resolveRpx(props.size) + 16) + 'rpx'
}))

function handleClick() {
  emit('click')
}
</script>

<style scoped>
.avatar-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar {
  background: #f0f0f0;
  border: 2px solid #fff;
}

.avatar-frame {
  position: absolute;
  top: -4px;
  left: -4px;
  pointer-events: none;
}

.frame-image {
  width: 100%;
  height: 100%;
}

.crown-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 2;
}

.crown-icon {
  font-size: 16px;
}
</style>