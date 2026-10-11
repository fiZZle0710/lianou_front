<template>
  <!--
    「我的」页（设计稿：Figma「莲藕加号」node 172-576 / pptm 的「我的首页」）
    结构：封面画 + 透明导航（右上两个深色玻璃按钮）+ 资料块 + 深色数据卡 + 两个入口 + 分类内容
    页面底色为白色；封面、深色卡片都压在白底上
  -->
  <view class="page">
    <!-- 透明导航：压在封面图上，只保留右上两个操作按钮 -->
    <view class="nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-right">
        <view class="nav-btn" @click="scan">
          <image class="nav-btn-icon" :src="ICON_SCAN" mode="aspectFit" />
        </view>
        <view class="nav-btn" @click="openSetting">
          <image class="nav-btn-icon" :src="ICON_MORE" mode="aspectFit" />
        </view>
      </view>
    </view>

    <!-- 用户头像信息区域（含封面图） -->
    <UserHeader />

    <!-- 数据统计栏 -->
    <UserStats />

    <!-- 功能按钮组 -->
    <MineActions />

    <!-- 分类标签栏及内容 -->
    <ContentTabs :publishStatus="publishStatus" @clearPublish="publishStatus = ''" />

    <!-- 设置侧边抽屉 -->
    <SettingDrawer v-if="showSetting" @close="showSetting = false" />

    <!-- 底部Tab导航 -->
    <CustomTabbar />
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

import CustomTabbar from '@/components/common/CustomTabbar.vue'

import UserHeader from '@/components/mine/UserHeader.vue'
import UserStats from '@/components/mine/UserStats.vue'
import MineActions from '@/components/mine/MineActions.vue'
import ContentTabs from '@/components/mine/ContentTabs.vue'
import SettingDrawer from '@/components/mine/SettingDrawer.vue'

/** 细线图标：扫描（取景框）与更多（三点），白色描边，压在封面上 */
const ICON_SCAN = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
  'stroke="#FFFFFF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M3.5 8.5V6a2.5 2.5 0 0 1 2.5-2.5h2.5"/><path d="M15.5 3.5H18A2.5 2.5 0 0 1 20.5 6v2.5"/>' +
  '<path d="M20.5 15.5V18a2.5 2.5 0 0 1-2.5 2.5h-2.5"/><path d="M8.5 20.5H6A2.5 2.5 0 0 1 3.5 18v-2.5"/>' +
  '<path d="M3.5 12h17"/></svg>'
)
const ICON_MORE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">' +
  '<circle cx="6" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18" cy="12" r="1.8"/></svg>'
)

const showSetting = ref(false)
const publishStatus = ref('')

// 状态栏高度：透明导航要靠它把按钮压到状态栏下面
const statusBarHeight = ref(0)
statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 0

// 监听发布状态事件
function onPublishStatus(status) {
  publishStatus.value = status
  if (status === 'publishing') {
    // 模拟2秒后发布完成
    setTimeout(() => {
      publishStatus.value = 'done'
    }, 2000)
  }
}

onMounted(() => {
  uni.$on('publishStatus', onPublishStatus)
})

onUnmounted(() => {
  uni.$off('publishStatus', onPublishStatus)
})

function openSetting() {
  showSetting.value = true
}

function scan() {
  uni.navigateTo({
    url: '/pages/scan/index'
  })
}
</script>

<style scoped>
.page {
  position: relative;
  background: #ffffff;
  min-height: 100vh;
  padding-bottom: 70px;
}

/* 透明导航：绝对定位压在封面图上 */
.nav {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: 20;
}

.nav-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 44px;
  padding-right: 24rpx;
}

/* 深色玻璃小按钮（设计稿里是两个圆角方块） */
.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68rpx;
  height: 68rpx;
  border-radius: 20rpx;
  background: rgba(26, 32, 29, 0.42);
}

.nav-btn + .nav-btn {
  margin-left: 18rpx;
}

.nav-btn:active {
  opacity: 0.7;
}

.nav-btn-icon {
  width: 36rpx;
  height: 36rpx;
}
</style>
