<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <CustomNavbar title="我的">
      <template #right>
        <view class="nav-btn" @click="scan">
          <text class="nav-icon">📷</text>
        </view>
        <view class="nav-btn" @click="openSetting">
          <text class="nav-icon">⚙️</text>
        </view>
      </template>
    </CustomNavbar>

    <!-- 用户头像信息区域（带头像框） -->
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

import CustomNavbar from '@/components/common/CustomNavbar.vue'
import CustomTabbar from '@/components/common/CustomTabbar.vue'

import UserHeader from '@/components/mine/UserHeader.vue'
import UserStats from '@/components/mine/UserStats.vue'
import MineActions from '@/components/mine/MineActions.vue'
import ContentTabs from '@/components/mine/ContentTabs.vue'
import SettingDrawer from '@/components/mine/SettingDrawer.vue'

const showSetting = ref(false)
const publishStatus = ref('')

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
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 70px;
}

.nav-btn {
  font-size: 22px;
  padding: 10px;
}

.nav-icon {
  font-size: 22px;
}
</style>