<template>
  <!-- 作品卡片组件 - 双列瀑布流使用 -->
  <view class="work-card" @click="handleClick">
    <view class="card-image">
      <image :src="src" mode="aspectFill" class="image"></image>
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