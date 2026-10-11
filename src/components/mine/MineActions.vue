<template>
  <!-- 两个快捷入口：设计稿为并排的深色半透明按钮（各 167px 宽、44px 高、圆角 12px） -->
  <view class="actions">
    <view class="action" @click="goHistory">
      <image class="action-icon" :src="ICON_CLOCK" mode="aspectFit" />
      <text class="action-text">浏览记录</text>
    </view>

    <view class="action" @click="goGroup">
      <view class="action-icon-wrap">
        <image class="action-icon" :src="ICON_PEOPLE" mode="aspectFit" />
        <!-- 红点：群聊有新消息（后端没有未读数，先按设计稿常显） -->
        <view class="action-dot"></view>
      </view>
      <text class="action-text">我的群聊</text>
    </view>
  </view>
</template>

<script setup>
/** 细线图标：与设计稿的线性图标同风格（白色描边） */
const ICON_CLOCK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
  'stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
  '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.4V12l3.2 2"/></svg>'
)
const ICON_PEOPLE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
  'stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
  '<circle cx="9.2" cy="8" r="3.3"/><path d="M3.4 19.6c0-3.1 2.6-5.2 5.8-5.2s5.8 2.1 5.8 5.2"/>' +
  '<path d="M16.2 5.4a3 3 0 0 1 0 5.4"/><path d="M17.6 14.9c1.9.5 3.2 2.1 3.2 4.7"/></svg>'
)

function goHistory() {
  uni.navigateTo({ url: '/pages/history/index' })
}

function goGroup() {
  uni.navigateTo({ url: '/pages/group/index' })
}
</script>

<style scoped>
.actions {
  display: flex;
  margin: 22rpx 41rpx 0; /* 设计稿：与数据卡间距 11px、左右各 22px */
}

.action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 92rpx; /* 设计稿：约 49px */
  border-radius: 24rpx;
  background: rgba(26, 32, 29, 0.82);
}

.action + .action {
  margin-left: 30rpx; /* 设计稿：两按钮间距 15.5px */
}

.action:active {
  opacity: 0.75;
}

.action-icon-wrap {
  position: relative;
}

.action-icon {
  width: 34rpx;
  height: 34rpx;
}

.action-dot {
  position: absolute;
  top: -4rpx;
  right: -6rpx;
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #e5484d;
}

.action-text {
  margin-left: 14rpx;
  font-size: 26rpx;
  color: #ffffff;
}
</style>
