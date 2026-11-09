<template>
  <!--
    他人「我的」主页（只读）：点其他用户头像进入。
    与「我的」页共用头部/数据/分类组件，但：
    - 去掉右上角「扫一扫 / 设置」，只保留左上返回
    - 封面 / 头像不可点编辑（UserHeader readonly）
    - 「活动」里「我参与的」改为「参与的」（ContentTabs isOther）
    - 不显示设置抽屉
  -->
  <view class="page">
    <view class="nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-left">
        <view class="nav-btn" @click="goBack">
          <image class="nav-btn-icon" :src="ICON_BACK" mode="aspectFit" />
        </view>
      </view>
    </view>

    <UserHeader :readonly="true" />
    <UserStats />
    <MineActions />
    <ContentTabs :isOther="true" />
    <CustomTabbar />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import CustomTabbar from '@/components/common/CustomTabbar.vue'
import UserHeader from '@/components/mine/UserHeader.vue'
import UserStats from '@/components/mine/UserStats.vue'
import MineActions from '@/components/mine/MineActions.vue'
import ContentTabs from '@/components/mine/ContentTabs.vue'

const ICON_BACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
  'stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M15 4.5 7.5 12l7.5 7.5"/></svg>'
)

const statusBarHeight = ref(0)
statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 25

function goBack() { uni.navigateBack() }
</script>

<style scoped>
.page {
  position: relative;
  background: #ffffff;
  min-height: 100vh;
  padding-bottom: 70px;
}

.nav {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: 20;
}

.nav-left {
  display: flex;
  align-items: center;
  height: 44px;
  padding-left: 24rpx;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68rpx;
  height: 68rpx;
  border-radius: 20rpx;
  background: rgba(26, 32, 29, 0.42);
}

.nav-btn:active { opacity: 0.7; }

.nav-btn-icon {
  width: 36rpx;
  height: 36rpx;
}
</style>
