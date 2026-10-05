<template>
  <!-- 扫一扫页面 -->
  <view class="page">
    <CustomNavbar title="扫一扫" showBack />

    <view class="scan-container">
      <!-- 扫描框区域 -->
      <view class="scan-frame-wrapper">
        <view class="scan-frame">
          <!-- 四角装饰 -->
          <view class="corner top-left"></view>
          <view class="corner top-right"></view>
          <view class="corner bottom-left"></view>
          <view class="corner bottom-right"></view>

          <!-- 扫描线动画 -->
          <view class="scan-line"></view>
        </view>
        <text class="scan-hint">将二维码/条形码放入框内，即可自动扫描</text>
      </view>

      <!-- 底部操作按钮 -->
      <view class="scan-actions">
        <view class="scan-action" @click="openAlbum">
          <view class="action-icon">
            <text class="icon-text">🖼️</text>
          </view>
          <text class="action-label">图库</text>
        </view>

        <view class="scan-action" @click="toggleFlash">
          <view class="action-icon">
            <text class="icon-text">{{ flashOn ? '🔦' : '💡' }}</text>
          </view>
          <text class="action-label">{{ flashOn ? '关闭闪光灯' : '开启闪光灯' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import CustomNavbar from '@/components/common/CustomNavbar.vue'

const flashOn = ref(false)

function openAlbum() {
  uni.showToast({ title: '打开相册选择图片', icon: 'none' })
}

function toggleFlash() {
  flashOn.value = !flashOn.value
  uni.showToast({ title: flashOn.value ? '闪光灯已开启' : '闪光灯已关闭', icon: 'none' })
}
</script>

<style scoped>
.page {
  background: #000;
  min-height: 100vh;
}

.scan-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 60px;
}

/* 扫描框 */
.scan-frame-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.scan-frame {
  position: relative;
  width: 250px;
  height: 250px;
  border-radius: 16px;
  overflow: hidden;
}

/* 四角装饰 */
.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border-color: #00ff88;
  border-style: solid;
}

.corner.top-left {
  top: 0;
  left: 0;
  border-width: 3px 0 0 3px;
  border-radius: 4px 0 0 0;
}

.corner.top-right {
  top: 0;
  right: 0;
  border-width: 3px 3px 0 0;
  border-radius: 0 4px 0 0;
}

.corner.bottom-left {
  bottom: 0;
  left: 0;
  border-width: 0 0 3px 3px;
  border-radius: 0 0 0 4px;
}

.corner.bottom-right {
  bottom: 0;
  right: 0;
  border-width: 0 3px 3px 0;
  border-radius: 0 0 4px 0;
}

/* 扫描线动画 */
.scan-line {
  position: absolute;
  left: 10px;
  right: 10px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ff88, transparent);
  animation: scanMove 2s ease-in-out infinite;
  box-shadow: 0 0 8px #00ff88;
}

@keyframes scanMove {
  0% {
    top: 10px;
  }
  50% {
    top: calc(100% - 10px);
  }
  100% {
    top: 10px;
  }
}

.scan-hint {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  margin-top: 20px;
  text-align: center;
  padding: 0 40px;
}

/* 底部操作按钮 */
.scan-actions {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-top: 60px;
}

.scan-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.action-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-text {
  font-size: 24px;
}

.action-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.scan-action:active .action-icon {
  background: rgba(255, 255, 255, 0.3);
}
</style>