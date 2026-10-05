<template>
  <!-- 页面6：账号与安全页（三级页面） -->
  <view class="page">
    <CustomNavbar title="账号与安全" showBack />

    <scroll-view scroll-y class="page-scroll">
      <!-- 账号信息列表 -->
      <view class="section">
        <view class="section-title">账号信息</view>
        <view class="list-group">
          <view class="list-item" @click="editPhone">
            <view class="item-left">
              <text class="item-icon">📱</text>
              <text class="item-label">手机号</text>
            </view>
            <view class="item-right">
              <text class="item-value">{{ phoneNumber }}</text>
              <text class="item-arrow">›</text>
            </view>
          </view>

          <view class="list-item" @click="editPassword">
            <view class="item-left">
              <text class="item-icon">🔑</text>
              <text class="item-label">密码</text>
            </view>
            <view class="item-right">
              <text class="item-value">已设置</text>
              <text class="item-arrow">›</text>
            </view>
          </view>

          <view class="list-item" @click="editEmail">
            <view class="item-left">
              <text class="item-icon">📧</text>
              <text class="item-label">邮箱</text>
            </view>
            <view class="item-right">
              <text class="item-value">{{ email || '未绑定' }}</text>
              <text class="item-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 安全设置 -->
      <view class="section">
        <view class="section-title">安全设置</view>
        <view class="list-group">
          <view class="list-item" @click="manageDevices">
            <view class="item-left">
              <text class="item-icon">💻</text>
              <text class="item-label">设备管理</text>
            </view>
            <view class="item-right">
              <text class="item-arrow">›</text>
            </view>
          </view>

          <view class="list-item" @click="manageBlacklist">
            <view class="item-left">
              <text class="item-icon">🚫</text>
              <text class="item-label">黑名单</text>
            </view>
            <view class="item-right">
              <text class="item-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部操作按钮 -->
      <view class="bottom-actions">
        <view class="action-btn switch-account" @click="switchAccount">
          <text class="action-btn-text">切换账号</text>
        </view>

        <view class="action-btn logout" @click="showLogoutConfirm">
          <text class="action-btn-text logout-text">退出登录</text>
        </view>
      </view>
    </scroll-view>

    <!-- 退出登录确认弹窗 -->
    <ConfirmModal
      :visible="showLogoutModal"
      title="退出登录"
      message="确定要退出当前账号吗？"
      confirmText="退出"
      @confirm="confirmLogout"
      @close="showLogoutModal = false"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import CustomNavbar from '@/components/common/CustomNavbar.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { logout } from '@/api/auth.js'

const phoneNumber = ref('138****8888')
const email = ref('')
const showLogoutModal = ref(false)

function editPhone() {
  uni.showToast({ title: '编辑手机号', icon: 'none' })
}

function editPassword() {
  uni.showToast({ title: '修改密码', icon: 'none' })
}

function editEmail() {
  uni.showToast({ title: '绑定邮箱', icon: 'none' })
}

function manageDevices() {
  uni.showToast({ title: '设备管理', icon: 'none' })
}

function manageBlacklist() {
  uni.showToast({ title: '黑名单管理', icon: 'none' })
}

function switchAccount() {
  uni.showToast({ title: '切换账号', icon: 'none' })
}

function showLogoutConfirm() {
  showLogoutModal.value = true
}

function confirmLogout() {
  showLogoutModal.value = false
  // 1.7 登出接口：JWT 无状态，后端只回 message；auth.logout() 不论成败都会清除本地登录态
  logout().then(() => {
    uni.showToast({ title: '已退出登录', icon: 'success' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/launch/index' })
    }, 400)
  })
}
</script>

<style scoped>
.page {
  background: #f5f5f5;
  min-height: 100vh;
}

.page-scroll {
  height: calc(100vh - 88px);
}

.section {
  margin-bottom: 10px;
}

.section-title {
  font-size: 13px;
  color: #999;
  padding: 16px 16px 8px;
}

.list-group {
  background: #fff;
  padding: 0 16px;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}

.list-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
}

.item-icon {
  font-size: 18px;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.item-label {
  font-size: 15px;
  color: #333;
}

.item-right {
  display: flex;
  align-items: center;
}

.item-value {
  font-size: 14px;
  color: #999;
  margin-right: 8px;
}

.item-arrow {
  font-size: 18px;
  color: #ccc;
  font-weight: bold;
}

/* 底部操作按钮 */
.bottom-actions {
  padding: 30px 16px 40px;
}

.action-btn {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  margin-bottom: 12px;
}

.action-btn.switch-account {
  background: #fff;
  border: 1px solid #ddd;
}

.action-btn.logout {
  background: #fff;
  border: 1px solid #ff4757;
}

.action-btn-text {
  font-size: 16px;
  color: #333;
}

.logout-text {
  color: #ff4757;
}

.action-btn:active {
  opacity: 0.8;
}
</style>
