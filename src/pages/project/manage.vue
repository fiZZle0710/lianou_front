<template>
  <!-- 项目管理主页（二级页） -->
  <view class="page">
    <view class="nav">
      <view class="nav-back" @click="goBack"><text class="back-icon">←</text></view>
      <text class="nav-title">项目管理</text>
      <view class="nav-right"></view>
    </view>

    <view class="menu">
      <view class="menu-item" @click="goMine">
        <text class="menu-t">我的项目</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goApply">
        <text class="menu-t">项目申请列表</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goMyApply">
        <text class="menu-t">我的申请</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup>
function goBack() { uni.navigateBack() }
function goMine() { uni.navigateTo({ url: "/pages/project/mine" }) }
function goApply() { uni.navigateTo({ url: "/pages/project/apply" }) }
function goMyApply() { uni.navigateTo({ url: "/pages/project/myapply" }) }
</script>

<style scoped>
.page { background: #f5f6fa; min-height: 100vh; }
.nav { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 24rpx; padding-top: calc(env(safe-area-inset-top) + 20rpx); background: #fff; }
.nav-back { width: 70rpx; height: 60rpx; display: flex; align-items: center; }
.back-icon { font-size: 40rpx; color: #333; }
.nav-title { font-size: 34rpx; font-weight: 700; color: #333; }
.nav-right { width: 70rpx; }
.menu { margin: 20rpx; background: #fff; border-radius: 20rpx; }
.menu-item { display: flex; align-items: center; justify-content: space-between; padding: 32rpx 30rpx; border-bottom: 1rpx solid #f3f4f6; }
.menu-item:last-child { border-bottom: none; }
.menu-item:active { background: #f8f8f8; }
.menu-t { font-size: 30rpx; color: #333; }
.menu-arrow { font-size: 40rpx; color: #ccc; }
</style>