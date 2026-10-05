<template>
  <view class="page">
    <view class="hero">
      <text class="t-title">在下立见此道</text>
      <text class="t-sub">技艺早已炉火纯青</text>
    </view>
    <view class="done-btn" @click="goMine"><text class="done-btn-t">完成</text></view>
  </view>
</template>
<script setup>
import { getUserInfo, setUserInfo } from "@/utils/auth.js"

// 完成资料：标记已完善并进入主界面（广场）
function goMine() {
  // ⚠️ 对接后端 —— 完成资料，标记已完善
  const info = getUserInfo() || {}
  info.profileCompleted = true
  setUserInfo(info)
  uni.reLaunch({ url: "/pages/square/index" })
}
</script>
<style scoped>
.page { min-height: 100vh; background: #faf7f2; display: flex; flex-direction: column; align-items: center; justify-content: space-around; padding: 0 64rpx; box-sizing: border-box; }
.hero { display: flex; flex-direction: column; align-items: center; margin-top: 20vh; }
.t-title { font-size: 46rpx; color: #3a3735; font-weight: 600; letter-spacing: 8rpx; text-align: center; line-height: 1.9; }
.t-sub { font-size: 32rpx; color: #7a6f66; letter-spacing: 6rpx; text-align: center; margin-top: 30rpx; line-height: 1.8; }
.done-btn { position: fixed; left: 40rpx; right: 40rpx; bottom: calc(env(safe-area-inset-bottom) + 60rpx); height: 96rpx; border-radius: 48rpx; background: #d9a29e; display: flex; align-items: center; justify-content: center; }
.done-btn-t { font-size: 32rpx; color: #fff; letter-spacing: 8rpx; text-indent: 8rpx; }
.done-btn:active { opacity: 0.85; }
</style>
