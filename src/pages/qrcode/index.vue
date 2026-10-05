<template>
  <!-- 页面7：我的二维码分享页（三级页面） -->
  <view class="page">
    <!-- 顶部导航栏 -->
    <CustomNavbar title="我的二维码" showBack>
      <template #right>
        <view class="nav-btn" @click="sendQRCode">
          <text class="nav-icon">📤</text>
        </view>
        <view class="nav-btn" @click="saveQRCode">
          <text class="nav-icon">💾</text>
        </view>
      </template>
    </CustomNavbar>

    <view class="qrcode-container">
      <!-- 二维码卡片 -->
      <view class="qrcode-card">
        <!-- 大二维码区域 -->
        <view class="qrcode-image">
          <view class="qrcode-placeholder">
            <view class="qrcode-grid">
              <view v-for="i in 49" :key="i" class="grid-cell" :class="{ dark: Math.random() > 0.5 }"></view>
            </view>
          </view>
        </view>

        <!-- 分隔线 -->
        <view class="divider"></view>

        <!-- 用户信息 -->
        <view class="user-info">
          <UserAvatar :src="userInfo.avatar" :size="40" />
          <view class="user-text">
            <text class="user-name">{{ userInfo.nickname }}</text>
            <text class="user-id">ID: {{ userInfo.id }}</text>
          </view>
        </view>
      </view>

      <!-- 底部水印 -->
      <text class="watermark">扫一扫上面的二维码，关注我吧</text>
    </view>

    <!-- 分享渠道弹窗 -->
    <view v-if="showShareSheet" class="share-mask" @click="showShareSheet = false">
      <view class="share-sheet" @click.stop>
        <view class="share-title">分享到</view>
        <view class="share-options">
          <view class="share-option" data-channel="wechat" @click="shareTo">
            <text class="share-icon">💬</text>
            <text class="share-label">微信</text>
          </view>
          <view class="share-option" data-channel="moments" @click="shareTo">
            <text class="share-icon">🔄</text>
            <text class="share-label">朋友圈</text>
          </view>
          <view class="share-option" data-channel="qq" @click="shareTo">
            <text class="share-icon">🐧</text>
            <text class="share-label">QQ</text>
          </view>
          <view class="share-option" data-channel="weibo" @click="shareTo">
            <text class="share-icon">📢</text>
            <text class="share-label">微博</text>
          </view>
        </view>
        <view class="share-cancel" @click="showShareSheet = false">
          <text>取消</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import CustomNavbar from '@/components/common/CustomNavbar.vue'
import UserAvatar from '@/components/common/UserAvatar.vue'

const showShareSheet = ref(false)

const userInfo = ref({
  avatar: '/static/default-avatar.png',
  nickname: '冯大侠',
  id: '12345678'
})

// 发送二维码
function sendQRCode() {
  showShareSheet.value = true
}

// 保存二维码到本地
function saveQRCode() {
  uni.showToast({ title: '二维码已保存到相册', icon: 'success' })
}

// 分享到渠道
function shareTo(e) {
  const channel = e.currentTarget.dataset.channel
  showShareSheet.value = false
  uni.showToast({ title: `分享到${channel}`, icon: 'none' })
}
</script>

<style scoped>
.page {
  background: #f5f5f5;
  min-height: 100vh;
}

.nav-btn {
  padding: 8px;
}

.nav-icon {
  font-size: 22px;
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.qrcode-card {
  background: #fff;
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 大二维码 */
.qrcode-image {
  width: 220px;
  height: 220px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.qrcode-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qrcode-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(7, 1fr);
  gap: 4px;
  width: 180px;
  height: 180px;
}

.grid-cell {
  background: #fff;
  border-radius: 2px;
}

.grid-cell.dark {
  background: #333;
}

/* 分隔线 */
.divider {
  height: 1px;
  background: #f0f0f0;
  margin: 20px 0;
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.user-text {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.user-id {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.watermark {
  font-size: 12px;
  color: #bbb;
  margin-top: 20px;
}

/* 分享弹窗 */
.share-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.share-sheet {
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 20px 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.share-title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.share-options {
  display: flex;
  justify-content: space-around;
  padding: 0 20px;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.share-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 12px;
}

.share-label {
  font-size: 12px;
  color: #666;
}

.share-cancel {
  text-align: center;
  padding: 16px 0 8px;
  margin-top: 16px;
  border-top: 1px solid #f0f0f0;
  font-size: 16px;
  color: #666;
}
</style>