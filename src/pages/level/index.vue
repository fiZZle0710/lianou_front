<template>
  <view class="page">
    <view class="nav">
      <view class="nav-back" @click="goBack"><text class="back-icon">←</text></view>
      <text class="nav-title">我的专业程度</text>
    </view>

    <view class="cards">
      <view class="card" @click="goPro">
        <view class="penguin hero"><text class="pe">🦸</text></view>
        <text class="card-label">我是专业的！</text>
      </view>
      <view class="card" @click="goNew">
        <view class="penguin"><text class="pe">🐧</text></view>
        <text class="card-label">我是萌新</text>
      </view>
    </view>
  </view>
</template>
<script setup>
import { getUserInfo, setUserInfo } from "@/utils/auth.js"

function goBack() { uni.navigateBack() }

// ⚠️ 对接后端 —— 记录专业程度，将来提交接口
function choose(level, url) {
  const info = getUserInfo() || {}
  info.level = level
  setUserInfo(info)
  uni.navigateTo({ url })
}

function goPro() { choose("pro", "/pages/text2/index") }
function goNew() { choose("new", "/pages/text1/index") }
</script>
<style scoped>
.page { min-height: 100vh; background: #faf7f2; padding: 0 48rpx; padding-top: calc(env(safe-area-inset-top) + 20rpx); box-sizing: border-box; }
.nav { display: flex; align-items: center; padding: 20rpx 0 40rpx; }
.nav-back { position: absolute; left: 40rpx; width: 60rpx; height: 60rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 40rpx; color: #6b5f57; }
.nav-title { flex: 1; text-align: center; font-size: 38rpx; color: #3a3735; letter-spacing: 4rpx; margin-right: 60rpx; font-weight: 600; }
.cards { display: flex; justify-content: space-between; align-items: center; margin-top: 100rpx; }
.card { width: 300rpx; height: 380rpx; border-radius: 32rpx; border: 2rpx solid #e0d4c8; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.card:active { opacity: 0.85; }
.penguin { width: 180rpx; height: 180rpx; border-radius: 50%; background: #fdf3ec; display: flex; align-items: center; justify-content: center; }
.penguin.hero { background: #f7e6e0; }
.pe { font-size: 90rpx; }
.card-label { margin-top: 26rpx; font-size: 28rpx; color: #3a3735; }
</style>