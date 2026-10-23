<template>
  <!--
    「我的」页作品墙的单张卡（设计稿 pptm：深色卡 + 大图 + 精选角标 + 标题/副标题 + 浏览·点赞）
    与广场页的 WorkCard 区分开：那张是白底 + 作者 + 赞，这张是深色 + 浏览/点赞，避免互相干扰
  -->
  <view class="mcard" @click="emit('click')">
    <view class="mcard-cover">
      <image class="mcard-img" :src="current" mode="aspectFill" @error="onError" />
      <view v-if="featured" class="mcard-badge">
        <text class="mcard-badge-star">★</text>
        <text class="mcard-badge-text">精选</text>
      </view>
    </view>

    <view class="mcard-body">
      <text class="mcard-title">{{ title }}</text>
      <text v-if="subtitle" class="mcard-sub">{{ subtitle }}</text>
      <view class="mcard-line"></view>
      <view class="mcard-stats">
        <view class="mstat">
          <image class="mstat-icon" :src="ICON_EYE" mode="aspectFit" />
          <text class="mstat-text">{{ views }}</text>
        </view>
        <view class="mstat">
          <image class="mstat-icon" :src="liked ? ICON_HEART_ON : ICON_HEART" mode="aspectFit" />
          <text class="mstat-text">{{ likes }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

// 内联占位图（同 SafeImage 的浅灰底），避免封面失效时裂图
const DEFAULT_WORK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="#EDEFEE"/>' +
  '<g fill="#C8C8C8"><rect x="250" y="350" width="100" height="80" rx="6"/>' +
  '<circle cx="278" cy="380" r="10" fill="#A8A8A8"/>' +
  '<path d="M268 422 L292 396 L312 414 L336 388 L342 422 Z" fill="#A8A8A8"/></g></svg>'
)

/** 细线图标（与设计稿的线性图标同风格） */
const ICON_EYE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
  'stroke="#B9C0BD" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/>' +
  '<circle cx="12" cy="12" r="3.2"/></svg>'
)
const ICON_HEART = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
  'stroke="#B9C0BD" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M12 20.2S3.6 15 3.6 9.4A4.6 4.6 0 0 1 12 6.9a4.6 4.6 0 0 1 8.4 2.5c0 5.6-8.4 10.8-8.4 10.8z"/></svg>'
)
const ICON_HEART_ON = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" ' +
  'fill="#E5484D" stroke="#E5484D" stroke-width="1.6" stroke-linejoin="round">' +
  '<path d="M12 20.2S3.6 15 3.6 9.4A4.6 4.6 0 0 1 12 6.9a4.6 4.6 0 0 1 8.4 2.5c0 5.6-8.4 10.8-8.4 10.8z"/></svg>'
)

const props = defineProps({
  src: { type: String, default: '' },
  title: { type: String, default: '未命名作品' },
  subtitle: { type: String, default: '' },
  views: { type: [String, Number], default: 0 },
  likes: { type: [String, Number], default: 0 },
  featured: { type: Boolean, default: false },
  liked: { type: Boolean, default: false }
})

const emit = defineEmits(['click'])

const current = ref(props.src || DEFAULT_WORK)
watch(() => props.src, (v) => { current.value = v || DEFAULT_WORK })
function onError() {
  if (current.value !== DEFAULT_WORK) current.value = DEFAULT_WORK
}
</script>

<style scoped>
.mcard {
  background: #1d2923; /* 左（白底）版实测：卡片信息区是深绿近黑 */
  border-radius: 22rpx;
  overflow: hidden;
}

.mcard-cover {
  position: relative;
  width: 100%;
  background: #3a3f3d;
}

.mcard-img {
  display: block;
  width: 100%;
  /* 设计稿卡片约 150x280（图:文 ≈ 70:30），原来 560rpx 太高，用户反馈「卡片太长」 */
  height: 380rpx;
}

/* 精选：红色胶囊角标 */
.mcard-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  display: flex;
  align-items: center;
  height: 40rpx;
  padding: 0 14rpx;
  border-radius: 20rpx;
  background: #db5543;
}

.mcard-badge-star {
  margin-right: 6rpx;
  font-size: 20rpx;
  color: #ffe9a8;
}

.mcard-badge-text {
  font-size: 20rpx;
  color: #ffffff;
}

.mcard-body {
  padding: 20rpx 22rpx 16rpx;
}

.mcard-title {
  display: block;
  font-size: 27rpx;
  font-weight: 600;
  color: #f3f5f4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.mcard-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 21rpx;
  color: #9aa39f;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.mcard-line {
  height: 2rpx;
  margin: 18rpx 0 14rpx;
  background: rgba(255, 255, 255, 0.12);
}

.mcard-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mstat {
  display: flex;
  align-items: center;
}

.mstat-icon {
  width: 26rpx;
  height: 26rpx;
  margin-right: 8rpx;
}

.mstat-text {
  font-size: 21rpx;
  color: #c9cfcc;
}
</style>
