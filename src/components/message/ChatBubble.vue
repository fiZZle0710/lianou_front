<template>
  <!-- 聊天气泡组件：role=left 对方居左白底；role=right 自己居右主题色 -->
  <view class="bubble-row" :class="role">
    <!-- 对方头像 -->
    <view v-if="role === 'left'" class="bubble-avatar">
      <UserAvatar :src="avatar" :size="76" />
    </view>

    <view class="bubble-main">
      <!-- 文字消息 -->
      <view v-if="type === 'text'" class="bubble" :class="role === 'left' ? 'bubble-left' : 'bubble-right'">
        <text class="bubble-text">{{ content }}</text>
      </view>
      <!-- 图片消息占位 -->
      <view v-else-if="type === 'image'" class="bubble bubble-image">
        <image :src="content" mode="aspectFill" class="bubble-img"></image>
      </view>
      <!-- 表情占位 -->
      <view v-else class="bubble">
        <text class="bubble-emoji">😊</text>
      </view>
    </view>

    <!-- 自己头像 -->
    <view v-if="role === 'right'" class="bubble-avatar">
      <UserAvatar :src="myAvatar" :size="76" />
    </view>
  </view>
</template>
<script setup>
import UserAvatar from "@/components/common/UserAvatar.vue"

defineProps({
  role: { type: String, default: "left" }, // left 对方 / right 自己
  type: { type: String, default: "text" }, // text / image / emoji
  content: { type: String, default: "" },
  avatar: { type: String, default: "" },
  myAvatar: { type: String, default: "" }
})
</script>

<style scoped>
.bubble-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 28rpx;
}
.bubble-row.right {
  justify-content: flex-end;
}
.bubble-avatar {
  flex-shrink: 0;
}
.bubble-main {
  margin: 0 16rpx;
  max-width: 62%;
}
.bubble-row.left .bubble-main {
  margin-left: 16rpx;
  margin-right: 0;
}
.bubble-row.right .bubble-main {
  margin-right: 16rpx;
  margin-left: 0;
  display: flex;
  justify-content: flex-end;
}
.bubble {
  padding: 22rpx 28rpx;
  border-radius: 24rpx;
  font-size: 30rpx;
  line-height: 1.5;
  word-break: break-all;
}
.bubble-left {
  background: #ffffff;
  color: #333;
  border-top-left-radius: 6rpx;
}
.bubble-right {
  background: #d9a29e;
  color: #fff;
  border-top-right-radius: 6rpx;
}
.bubble-text {
  white-space: pre-wrap;
}
.bubble-image {
  padding: 0;
  background: transparent;
}
.bubble-img {
  width: 200rpx;
  height: 260rpx;
  border-radius: 16rpx;
  background: #f0f0f0;
}
.bubble-emoji {
  font-size: 64rpx;
}
</style>