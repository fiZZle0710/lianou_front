<template>
  <!-- 会话列表项：对齐 tif/消息.tif
       头像（带描边环）+ 昵称 + 预览 + 右侧时间/静音/未读红点；未读行整行浅灰底 -->
  <view class="session-item" :class="{ unread: unread > 0 }" @click="emit('click')">
    <view class="avatar-ring">
      <image v-if="avatar" class="avatar-img" :src="avatar" mode="aspectFill" />
      <view v-else class="avatar-bg"><text class="avatar-txt">{{ nickname[0] }}</text></view>
    </view>

    <view class="item-center">
      <text class="name">{{ nickname }}</text>
      <text class="preview">{{ preview }}</text>
    </view>

    <view class="item-right">
      <text class="time">{{ time }}</text>
      <view class="right-bottom">
        <image v-if="muted" class="mute-icon" src="/static/icons/icon-bell-off.svg" mode="aspectFit" />
        <view v-if="unread > 0" class="unread-num">
          <text class="unread-text">{{ unread > 99 ? "99+" : unread }}</text>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup>
defineProps({
  nickname: { type: String, default: "" },
  level: { type: Number, default: 0 },
  preview: { type: String, default: "" },
  time: { type: String, default: "" },
  unread: { type: Number, default: 0 },
  avatar: { type: String, default: "" },
  muted: { type: Boolean, default: false }
})
const emit = defineEmits(['click'])
</script>

<style scoped>
.session-item {
  display: flex;
  align-items: center;
  height: 128rpx;
  padding: 0 28rpx;
  background: #fff;
  position: relative;
}
.session-item.unread { background: #f2f2f2; }
.session-item:active { background: #f6f6f6; }
/* 分隔线从头像右侧开始，与稿一致 */
.session-item::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2rpx;
  background: #ededed;
}

.avatar-ring {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 5rpx solid #fff;
  box-shadow: 0 0 0 3rpx #a9c8be;
  box-sizing: border-box;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
.avatar-img { width: 100%; height: 100%; }
.avatar-bg {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #cfe0db, #9fbfb5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-txt { font-size: 34rpx; color: #fff; font-weight: 600; }

.item-center { flex: 1; min-width: 0; margin-left: 24rpx; }
.name {
  font-size: 36rpx;
  color: #2b2b2b;
  font-weight: 700;
  font-family: "Songti SC", "STSong", "Noto Serif SC", "Source Han Serif SC", serif;
  display: block;
  line-height: 1.25;
}
.preview {
  font-size: 24rpx;
  color: #8a8a8a;
  margin-top: 6rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 16rpx;
  flex-shrink: 0;
  height: 92rpx;
  justify-content: space-between;
}
.time { font-size: 22rpx; color: #b4b4b4; }
.right-bottom { display: flex; align-items: center; }
.mute-icon { width: 28rpx; height: 28rpx; margin-right: 8rpx; }
.unread-num {
  min-width: 34rpx;
  height: 34rpx;
  border-radius: 17rpx;
  background: #df4c41;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}
.unread-text { font-size: 20rpx; color: #fff; }
</style>
