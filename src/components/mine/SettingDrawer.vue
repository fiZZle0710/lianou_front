<template>
  <!-- 页面5：设置侧边抽屉页（从一级页右侧滑出） -->
  <!-- 遮罩层 -->
  <view class="mask" @click="close"></view>

  <!-- 右侧抽屉 -->
  <view class="drawer">
    <scroll-view scroll-y class="drawer-content">
      <!-- 设置标题 -->
      <view class="drawer-header">
        <text class="drawer-title">设置</text>
      </view>

      <!-- 菜单列表 -->
      <view class="menu-list">
        <view
          v-for="(item, index) in menuItems"
          :key="index"
          class="menu-item"
          @click="handleMenuClick(item)"
        >
          <view class="menu-item-left">
            <text class="menu-icon">{{ item.icon }}</text>
            <text class="menu-label">{{ item.label }}</text>
          </view>
          <view class="menu-item-right">
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { DEBUG } from '@/utils/config.js'

const emit = defineEmits(['close'])

// 设置菜单项
const menuItems = [
  { key: 'account', label: '账号与安全', icon: '🔒', page: '/pages/account/index' },
  { key: 'general', label: '通用', icon: '⚙️', page: '' },
  { key: 'notification', label: '通知', icon: '🔔', page: '' },
  { key: 'privacy', label: '隐私', icon: '🛡️', page: '' },
  { key: 'storage', label: '存储', icon: '💾', page: '' },
  { key: 'preference', label: '内容偏好', icon: '🎯', page: '' },
  { key: 'minor', label: '未成年设置', icon: '👶', page: '' },
  { key: 'service', label: '服务', icon: '📋', page: '' },
  { key: 'about', label: '关于APP', icon: 'ℹ️', page: '' },
  { key: 'feedback', label: '意见反馈', icon: '💬', page: '' },
  { key: 'help', label: '帮助中心', icon: '❓', page: '' }
]

// 开发期专用入口：联调自检页（config.js 的 DEBUG=false 后自动消失）
if (DEBUG) {
  menuItems.push({ key: 'devcheck', label: '联调自检（开发）', icon: '🧪', page: '/pages/dev/check' })
}

function close() {
  emit('close')
}

function handleMenuClick(item) {
  close()
  if (item.page) {
    uni.navigateTo({ url: item.page })
  } else {
    uni.showToast({ title: item.label, icon: 'none' })
  }
}
</script>

<style scoped>
.mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 998;
}

.drawer {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 75%;
  background: #fff;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  z-index: 999;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.drawer-content {
  height: 100%;
  padding-top: 60px;
}

.drawer-header {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #f5f5f5;
}

.drawer-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.menu-list {
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f8f8f8;
}

.menu-item:active {
  background: #f5f5f5;
}

.menu-item-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 18px;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.menu-label {
  font-size: 15px;
  color: #333;
}

.menu-arrow {
  font-size: 20px;
  color: #ccc;
  font-weight: bold;
}
</style>