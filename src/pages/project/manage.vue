<template>
  <!-- 项目管理（二级页）—— 按 tif/项目.pptm slide7 -->
  <view class="page" :style="{ '--sbh': statusBarHeight + 'px' }">
    <view class="nav">
      <view class="nav-back" @click="goBack">
        <image class="nav-back-ic" src="/static/icons/icon-arrow-left-grey.svg" mode="aspectFit" />
      </view>
      <text class="nav-title">项目管理</text>
      <view class="nav-right"></view>
    </view>

    <view class="menu">
      <view class="menu-pill" @click="goMine">
        <text class="menu-t">我的项目</text>
        <image class="menu-arrow" src="/static/icons/icon-arrow-right-white.svg" mode="aspectFit" />
        <view class="dot" v-if="hasNewMine"></view>
      </view>
      <view class="menu-pill" @click="goApply">
        <text class="menu-t">项目申请列表</text>
        <image class="menu-arrow" src="/static/icons/icon-arrow-right-white.svg" mode="aspectFit" />
        <view class="dot" v-if="hasNewApply"></view>
      </view>
      <view class="menu-pill" @click="goMyApply">
        <text class="menu-t">我的申请</text>
        <image class="menu-arrow" src="/static/icons/icon-arrow-right-white.svg" mode="aspectFit" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 状态栏高度：稿上导航条 83.3px 含状态栏，H5 没有原生状态栏，用系统值补齐
import { DEMO_MODE } from '@/utils/config.js'

const statusBarHeight = (uni.getSystemInfoSync().statusBarHeight || 0)

// 稿上前两枚按钮各带一枚红点（=有新的待处理）。后端暂无未读计数接口：
// 演示模式（DEMO_MODE，数据全为 mock）按稿显示，真实联调时隐藏，等接口补 unread_count 再打开。
const hasNewMine = ref(DEMO_MODE)
const hasNewApply = ref(DEMO_MODE)

function goBack() { uni.navigateBack() }
function goMine() { uni.navigateTo({ url: '/pages/project/mine' }) }
function goApply() { uni.navigateTo({ url: '/pages/project/apply' }) }
function goMyApply() { uni.navigateTo({ url: '/pages/project/myapply' }) }
</script>

<style scoped>
/* 稿：402×874，导航高 83.3px，三枚渐变胶囊 257.5×85.6 居中，圆角 19.25px */
.page {
  background: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav {
  height: 155rpx;
  padding-top: var(--sbh, 0px);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 52rpx;
  padding-right: 52rpx;
  background: #fff;
  flex-shrink: 0;
}
.nav-back { width: 60rpx; height: 60rpx; display: flex; align-items: center; }
.nav-back-ic { width: 47rpx; height: 47rpx; }
.nav-title { font-size: 33rpx; color: #262626; font-weight: 600; }
.nav-right { width: 60rpx; }

.menu {
  padding-top: 339rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.menu-pill {
  position: relative;
  width: 480rpx;
  height: 160rpx;
  border-radius: 36rpx;
  margin-bottom: 21rpx;
  padding: 0 39rpx 0 24rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, #538474 0%, #5ba188 53%, #77bbac 100%);
  /* 稿上三枚渐变胶囊右下深灰阴影 */
  box-shadow: 8rpx 8rpx 15rpx rgba(0, 0, 0, 0.2);
}
.menu-pill:active { opacity: 0.92; }
.menu-t { font-size: 28rpx; color: #fff; font-weight: 500; }
.menu-arrow { width: 53rpx; height: 53rpx; flex-shrink: 0; }
/* 稿上红点 9.9px，浮在胶囊右上角外沿 */
.dot {
  position: absolute;
  right: 20rpx;
  top: -9rpx;
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: #df4c41;
}
</style>
