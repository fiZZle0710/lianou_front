<template>
  <!-- 作品卡片组件 - 双列瀑布流使用 -->
  <view class="work-card" @click="handleClick">
    <view class="card-image">
      <image :src="current" mode="aspectFill" class="image" @error="onError"></image>
      <!-- 收藏角标 -->
      <view v-if="showFav" class="fav-badge">
        <text class="fav-icon">♥</text>
      </view>
    </view>
    <view class="card-info">
      <text class="card-title">{{ title }}</text>
      <view class="card-meta">
        <text class="card-author">{{ author }}</text>
        <text class="card-likes">{{ likes }}赞</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

// 内联默认作品图 SVG（浅灰底 + 图标 + 占位文字），避免 cover 失效时裂图
const DEFAULT_WORK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#F2F2F2"/>' +
  '<g fill="#C8C8C8"><rect x="250" y="150" width="100" height="80" rx="6"/>' +
  '<circle cx="278" cy="180" r="10" fill="#A8A8A8"/>' +
  '<path d="M268 222 L292 196 L312 214 L336 188 L342 222 Z" fill="#A8A8A8"/></g>' +
  '<text x="300" y="270" font-family="Helvetica,Arial,sans-serif" font-size="22" fill="#9A9A9A" text-anchor="middle">暂无图片</text></svg>'
)

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: '作品标题'
  },
  author: {
    type: String,
    default: '作者'
  },
  likes: {
    type: [String, Number],
    default: 0
  },
  showFav: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

// current 跟随 props.src；src 为空或加载失败时回落到 DEFAULT_WORK
const current = ref(props.src || DEFAULT_WORK)
watch(() => props.src, (v) => { current.value = v || DEFAULT_WORK })
function onError() {
  if (current.value !== DEFAULT_WORK) current.value = DEFAULT_WORK
}

function handleClick() {
  emit('click')
}
</script>

<style scoped>
.work-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.card-image {
  position: relative;
  width: 100%;
  height: 200px;
  background: #f0f0f0;
}

.image {
  width: 100%;
  height: 100%;
}

.fav-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fav-icon {
  font-size: 14px;
  color: #ff4757;
}

.card-info {
  padding: 10px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.card-author {
  font-size: 12px;
  color: #999;
}

.card-likes {
  font-size: 11px;
  color: #bbb;
}
</style>