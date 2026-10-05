<template>
  <!-- 用户头像组件 - 支持头像框 -->
  <view class="avatar-wrapper" :style="wrapperStyle" @click="handleClick">
    <image :src="src" mode="aspectFill" class="avatar" :style="avatarStyle"></image>
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
import { computed } from 'vue'

// 命名尺寸（对应原 px 设计值，供 size="small" 等字符串使用）
const SIZE_MAP = { small: 40, normal: 44, large: 80 }

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