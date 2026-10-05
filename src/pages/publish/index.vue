<template>
  <!-- 作品发布页面 -->
  <view class="page">
    <!-- 顶部导航栏 -->
    <CustomNavbar title="发布作品" showBack />

    <scroll-view scroll-y class="publish-scroll">
      <!-- 顶部预览视频窗口 -->
      <view class="preview-section">
        <view class="preview-video">
          <view class="preview-placeholder">
            <text class="preview-icon">🎬</text>
            <text class="preview-text">视频预览</text>
          </view>
        </view>
      </view>

      <!-- 添加标题输入框 -->
      <view class="title-section">
        <textarea
          class="title-input"
          v-model="title"
          placeholder="君执笔绘万象，不妨细说一番"
          maxlength="100"
        />
        <text class="title-count">{{ title.length }}/100</text>
      </view>

      <!-- 功能按钮区域 -->
      <view class="actions-section">
        <view class="action-row">
          <view class="action-item" @click="addTopic">
            <text class="action-icon">#</text>
            <text class="action-label">话题</text>
          </view>
          <view class="action-item" @click="addCategory">
            <text class="action-icon">📂</text>
            <text class="action-label">添加类别</text>
          </view>
          <view class="action-item" @click="atFriends">
            <text class="action-icon">@</text>
            <text class="action-label">@朋友</text>
          </view>
          <view class="action-item" @click="setLocation">
            <text class="action-icon">📍</text>
            <text class="action-label">定位</text>
          </view>
        </view>
      </view>

      <!-- 功能选项 -->
      <view class="options-section">
        <view class="option-row" @click="showPrivacyModal">
          <view class="option-left">
            <text class="option-icon">🔒</text>
            <view class="option-info">
              <text class="option-label">隐私设置</text>
              <text class="option-value">{{ privacyLabel }}</text>
            </view>
          </view>
          <text class="option-arrow">›</text>
        </view>

        <view class="option-row" @click="promoteHot">
          <view class="option-left">
            <text class="option-icon">🔥</text>
            <view class="option-info">
              <text class="option-label">上热门</text>
              <text class="option-value">推荐给更多用户</text>
            </view>
          </view>
          <view class="switch-box" :class="{ on: promoteOn }" @click.stop="togglePromote">
            <view class="switch-knob"></view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部双按钮 -->
    <view class="bottom-actions">
      <view class="action-btn draft" @click="saveDraft">
        <text>存草稿</text>
      </view>
      <view class="action-btn publish" @click="publishWork">
        <text>发布</text>
      </view>
    </view>

    <!-- 隐私设置弹窗 -->
    <view v-if="showPrivacy" class="modal-mask" @click="showPrivacy = false">
      <view class="privacy-sheet" @click.stop>
        <view class="sheet-handle">
          <view class="handle-bar"></view>
        </view>
        <view class="sheet-title">隐私设置</view>

        <view class="privacy-list">
          <view
            v-for="(item, index) in privacyOptions"
            :key="index"
            class="privacy-item"
            :class="{ selected: selectedPrivacy === item.key }"
            @click="selectedPrivacy = item.key"
          >
            <text class="privacy-label">{{ item.label }}</text>
            <view class="radio-box">
              <view v-if="selectedPrivacy === item.key" class="radio-dot"></view>
            </view>
          </view>
        </view>

        <view class="sheet-actions">
          <view class="sheet-btn cancel" @click="showPrivacy = false">取消</view>
          <view class="sheet-btn confirm" @click="confirmPrivacy">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import CustomNavbar from '@/components/common/CustomNavbar.vue'
import { createWork } from '@/api/works.js'

const title = ref('')

// 隐私设置
const showPrivacy = ref(false)
const selectedPrivacy = ref('public')
const privacyLabel = ref('公开可见')
const promoteOn = ref(false)

const privacyOptions = [
  { key: 'public', label: '公开可见' },
  { key: 'only_show', label: '只给谁看' },
  { key: 'mutual', label: '仅互关好友可见' },
  { key: 'private', label: '仅自己可见' },
  { key: 'block', label: '不给谁看' }
]

function addTopic() {
  uni.showToast({ title: '添加话题', icon: 'none' })
}

function addCategory() {
  uni.showToast({ title: '选择类别', icon: 'none' })
}

function atFriends() {
  uni.showToast({ title: '@朋友', icon: 'none' })
}

function setLocation() {
  // 跳转定位选择页
  uni.navigateTo({ url: '/pages/location/index' })
}

function showPrivacyModal() {
  showPrivacy.value = true
}

function confirmPrivacy() {
  const item = privacyOptions.find(i => i.key === selectedPrivacy.value)
  privacyLabel.value = item ? item.label : '公开可见'
  showPrivacy.value = false
}

function togglePromote() {
  promoteOn.value = !promoteOn.value
}

function promoteHot() {
  togglePromote()
}

function saveDraft() {
  uni.showToast({ title: '已保存到草稿箱', icon: 'success' })
}

async function publishWork() {
  // 成片来自视频编辑器：导出后由 editor 完成 3.9 上传，并把相对 URL 缓存到这里
  const payload = uni.getStorageSync('video_publish_payload') || {}
  const videoUrl = payload.url
  if (!videoUrl) {
    uni.showToast({ title: '请先在视频编辑器导出并上传成片', icon: 'none' })
    return
  }
  if (!title.value.trim()) {
    uni.showToast({ title: '请填写标题', icon: 'none' })
    return
  }
  // custom_allow（只给谁看）/ custom_deny（不给谁看）需要传**用户 ID 列表**，本页还没有选人器
  if (selectedPrivacy.value === 'only_show' || selectedPrivacy.value === 'block') {
    uni.showToast({ title: '该可见性需要选择用户，暂未开放', icon: 'none' })
    return
  }

  uni.$emit('publishStatus', 'publishing')
  try {
    // 3.1 创建作品：视频 → channel=video（TODO：话题/推广位后端无字段，先忽略）
    await createWork({
      content_type: 'original',
      channel: 'video',
      title: title.value.trim(),
      files: [videoUrl],
      cover_url: '',
      visibility_type: selectedPrivacy.value,
      status: 'published'
    })
    uni.removeStorageSync('video_publish_payload')
    uni.$emit('publishStatus', 'done')
    uni.showToast({ title: '发布成功', icon: 'success' })
    setTimeout(() => uni.reLaunch({ url: '/pages/mine/index' }), 600)
  } catch (err) {
    uni.$emit('publishStatus', 'failed')
    // 失败原因由 request 层按错误码提示
  }
}
</script>

<style scoped>
.page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.publish-scroll {
  height: calc(100vh - 120rpx);
}

/* 视频预览 */
.preview-section {
  padding: 20rpx;
  background: #fff;
}

.preview-video {
  width: 100%;
  height: 400rpx;
  background: #000;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-icon {
  font-size: 80rpx;
}

.preview-text {
  font-size: 28rpx;
  color: #666;
  margin-top: 20rpx;
}

/* 标题输入 */
.title-section {
  background: #fff;
  padding: 24rpx 30rpx;
  position: relative;
  margin-top: 10rpx;
}

.title-input {
  width: 100%;
  min-height: 100rpx;
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
}

.title-count {
  position: absolute;
  right: 30rpx;
  bottom: 20rpx;
  font-size: 24rpx;
  color: #bbb;
}

/* 功能按钮区 */
.actions-section {
  background: #fff;
  padding: 20rpx 30rpx;
  margin-top: 10rpx;
}

.action-row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  flex: 1;
  padding: 20rpx 0;
}

.action-item:active {
  background: #f8f8f8;
  border-radius: 16rpx;
}

.action-icon {
  font-size: 40rpx;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
}

.action-label {
  font-size: 24rpx;
  color: #666;
}

/* 功能选项 */
.options-section {
  background: #fff;
  padding: 0 30rpx;
  margin-top: 10rpx;
}

.option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.option-row:last-child {
  border-bottom: none;
}

.option-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.option-icon {
  font-size: 36rpx;
}

.option-info {
  display: flex;
  flex-direction: column;
}

.option-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.option-value {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.option-arrow {
  font-size: 32rpx;
  color: #ccc;
  font-weight: bold;
}

/* 开关 */
.switch-box {
  width: 80rpx;
  height: 44rpx;
  background: #ddd;
  border-radius: 22rpx;
  position: relative;
  transition: 0.2s;
}

.switch-box.on {
  background: #007aff;
}

.switch-knob {
  width: 36rpx;
  height: 36rpx;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: 0.2s;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
}

.switch-box.on .switch-knob {
  left: 40rpx;
}

/* 底部按钮 */
.bottom-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 600;
}

.action-btn.draft {
  background: #f5f5f5;
  color: #666;
}

.action-btn.publish {
  background: #007aff;
  color: #fff;
}

.action-btn:active {
  opacity: 0.8;
}

/* 隐私设置弹窗 */
.modal-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.privacy-sheet {
  width: 100%;
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  animation: slideUp 0.3s ease;
  padding-bottom: env(safe-area-inset-bottom);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.sheet-handle {
  display: flex;
  justify-content: center;
  padding: 20rpx 0 10rpx;
}

.handle-bar {
  width: 60rpx;
  height: 6rpx;
  background: #ddd;
  border-radius: 3rpx;
}

.sheet-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  padding: 10rpx 0 20rpx;
}

.privacy-list {
  padding: 0 30rpx;
}

.privacy-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.privacy-item:last-child {
  border-bottom: none;
}

.privacy-label {
  font-size: 28rpx;
  color: #333;
}

.privacy-item.selected .privacy-label {
  color: #007aff;
  font-weight: 500;
}

.radio-box {
  width: 36rpx;
  height: 36rpx;
  border: 2px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-dot {
  width: 20rpx;
  height: 20rpx;
  background: #007aff;
  border-radius: 50%;
}

.sheet-actions {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
}

.sheet-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.sheet-btn.cancel {
  background: #f5f5f5;
  color: #666;
}

.sheet-btn.confirm {
  background: #007aff;
  color: #fff;
}
</style>
