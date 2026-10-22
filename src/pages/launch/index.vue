<template>
  <!--
    登录首页（设计稿：Figma「莲藕登录」node 0-1 左屏）
    纯白底 + 中间大片吉祥物预留区 + 底部「应用图标 + 莲藕字标」。
    吉祥物与字标素材还没给，先用现有应用图标 + 楷体文字占位：
      · 吉祥物：放到 .mascot-stage 里即可，位置已按稿留好
      · 字标：把 .brand-word 的 text 换成 <image src="/static/xxx.png"> 即可
  -->
  <view class="page">
    <!-- 吉祥物预留区（当前留白） -->
    <view class="mascot-stage"></view>

    <!-- 底部品牌锁定：图标 + 莲藕字标；整块可点，进登录页 -->
    <view class="brand-lockup" @click="goLogin">
      <image class="brand-icon" src="/static/app-icon/icon-192.png" mode="aspectFit" />
      <text class="brand-word">莲藕</text>
    </view>

    <!-- 设计稿这一屏没有按钮；为保证登录/注册入口可用，先放两个弱化文字入口 -->
    <view class="auth-links">
      <text class="auth-link" @click="goLogin">登录</text>
      <text class="auth-dot">·</text>
      <text class="auth-link" @click="goRegister">注册</text>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { isLoggedIn } from '@/utils/auth.js'

function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

function goRegister() {
  uni.navigateTo({ url: '/pages/register/index' })
}

// 已登录直接进主界面（广场）
onLoad(() => {
  if (isLoggedIn()) {
    uni.reLaunch({ url: '/pages/square/index' })
  }
})
</script>

<style scoped>
.page {
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 吉祥物区域：设计稿里是整屏中间的大留白 */
.mascot-stage {
  flex: 1;
  min-height: 0;
}

/* 品牌锁定：图标 + 字标，水平居中，落在屏幕约 78% 高度（设计稿位置） */
.brand-lockup {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14vh;
}

.brand-icon {
  width: 100rpx; /* 设计稿：约 52px */
  height: 100rpx;
  border-radius: 24rpx;
}

.brand-word {
  margin-left: 18rpx;
  font-family: 'STKaiti', 'KaiTi', 'Kaiti SC', '楷体', serif;
  font-size: 56rpx; /* 设计稿：约 28px */
  font-weight: 700;
  letter-spacing: 4rpx;
  color: #1b1b1b;
  line-height: 1;
}

/* 弱化的登录/注册入口（等吉祥物版把按钮补上后可删掉这一块） */
.auth-links {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: calc(env(safe-area-inset-bottom) + 36rpx);
}

.auth-link {
  padding: 10rpx 16rpx;
  font-size: 24rpx;
  color: #9a9a9a;
}

.auth-dot {
  font-size: 24rpx;
  color: #c9c9c9;
}
</style>
