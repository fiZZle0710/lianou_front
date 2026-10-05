<template>
  <!-- 会话列表项：头像/昵称+等级/预览/时间/未读角标 -->
  <view class="session-item" @click="emit('click')">
    <!-- 左侧头像 + 未读黑点 -->
    <view class="item-left">
      <view class="avatar-wrap">
        <view class="avatar-bg"><text class="avatar-txt">{{ nickname[0] }}</text></view>
        <view v-if="unread > 0" class="dot-black"></view>
      </view>
    </view>

    <!-- 中部：昵称 + 等级 + 预览 -->
    <view class="item-center">
      <view class="name-row">
        <text class="name">{{ nickname }}</text>
        <text v-if="level > 0" class="level-tag">LV.{{ level }}</text>
      </view>
      <text class="preview">{{ preview }}</text>
    </view>

    <!-- 右侧：时间 + 未读数字 -->
    <view class="item-right">
      <text class="time">{{ time }}</text>
      <view v-if="unread > 0" class="unread-num"><text class="unread-text">{{ unread > 99 ? "99+" : unread }}</text></view>
    </view>
  </view>
</template>
<script setup>
const props = defineProps({
  nickname: { type: String, default: "" },
  level: { type: Number, default: 0 },
  preview: { type: String, default: "" },
  time: { type: String, default: "" },
  unread: { type: Number, default: 0 },
  avatar: { type: String, default: "" }
})
const emit = defineEmits(["click"])
</script>

<style scoped>
.session-item {
  display: flex;
  align-items: center;
  padding: 26rpx 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #f3f4f6;
}
.session-item:active {
  background: #f8f8f8;
}
.item-left { flex-shrink: 0; }
.avatar-wrap { position: relative; }
.avatar-bg { width: 92rpx; height: 92rpx; border-radius: 50%; background: linear-gradient(135deg, #f0c7bb, #d9a29e); display: flex; align-items: center; justify-content: center; }
.avatar-txt { font-size: 36rpx; color: #fff; font-weight: 600; }
.dot-black { position: absolute; right: 0; bottom: 0; width: 22rpx; height: 22rpx; border-radius: 50%; background: #2b2b2b; border: 3rpx solid #fff; }
.item-center { flex: 1; min-width: 0; margin-left: 20rpx; }
.name-row { display: flex; align-items: center; }
.name { font-size: 32rpx; color: #333; font-weight: 500; }
.level-tag { margin-left: 12rpx; padding: 2rpx 12rpx; background: #fff4e0; color: #d9a23e; border-radius: 10rpx; font-size: 20rpx; }
.preview { font-size: 26rpx; color: #999; margin-top: 8rpx; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-right { display: flex; flex-direction: column; align-items: flex-end; margin-left: 12rpx; flex-shrink: 0; }
.time { font-size: 22rpx; color: #bbb; }
.unread-num { margin-top: 10rpx; min-width: 36rpx; height: 36rpx; border-radius: 18rpx; background: #ff5b5b; display: flex; align-items: center; justify-content: center; padding: 0 8rpx; }
.unread-text { font-size: 20rpx; color: #fff; }
</style>