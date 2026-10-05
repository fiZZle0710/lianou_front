<template>
  <!-- 莲藕 启动首页 -->
  <view class="page">
    <view class="hero">
      <text class="brand-name">莲藕</text>
      <text class="brand-sub">创作者 · 社交 · 分享</text>
    </view>
    <view class="footer">
      <view class="btn btn-login" @click="goLogin">
        <text class="btn-text">登录</text>
      </view>
      <view class="btn btn-register" @click="goRegister">
        <text class="btn-text">注册</text>
      </view>
      <view class="footer-note">从这一刻，遇见更多创作者</view>
    </view>
  </view>
</template>
<script setup>
import { onLoad } from "@dcloudio/uni-app"
import { isLoggedIn } from "@/utils/auth.js"

function goLogin() {
  uni.navigateTo({ url: "/pages/login/index" })
}
function goRegister() {
  uni.navigateTo({ url: "/pages/register/index" })
}

// 已登录则直接进入主界面（广场）
onLoad(() => {
  if (isLoggedIn()) {
    uni.reLaunch({ url: "/pages/square/index" })
  }
})
</script>
<style scoped>
.page {
  min-height: 100vh;
  background: #faf7f2;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 64rpx;
  padding-top: calc(env(safe-area-inset-top) + 120rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 100rpx);
}
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 24vh;
}
.brand-name {
  font-size: 140rpx;
  color: #3a3735;
  letter-spacing: 24rpx;
  text-indent: 24rpx;
  font-weight: 600;
  line-height: 1.2;
}
.brand-sub {
  margin-top: 24rpx;
  font-size: 26rpx;
  color: #a99f96;
  letter-spacing: 6rpx;
}
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.btn {
  width: 100%;
  height: 96rpx;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}
.btn-login {
  background: transparent;
  border: 2rpx solid #c9b9ad;
}
.btn-login .btn-text {
  color: #6b5f57;
}
.btn-register {
  background: #d9a29e;
  border: none;
}
.btn-register .btn-text {
  color: #fff;
}
.btn-text {
  font-size: 32rpx;
  letter-spacing: 8rpx;
  text-indent: 8rpx;
}
.btn:active {
  opacity: 0.85;
}
.footer-note {
  margin-top: 40rpx;
  font-size: 22rpx;
  color: #b9aea4;
  letter-spacing: 2rpx;
}
</style>