<template>
  <!-- 动态编辑页面 -->
  <view class="page">
    <CustomNavbar title="发布动态" showBack />

    <scroll-view scroll-y class="edit-scroll">
      <!-- 图片上传区域 -->
      <view class="upload-section">
        <view class="upload-grid">
          <view
            v-for="(img, index) in images"
            :key="index"
            class="upload-item"
          >
            <image :src="img" mode="aspectFill" class="upload-img" />
            <text class="remove-img" @click="removeImage(index)">✕</text>
          </view>
          <view v-if="images.length < 9" class="upload-add" @click="addImage">
            <text class="add-icon">+</text>
            <text class="add-text">{{ images.length }}/9</text>
          </view>
        </view>
      </view>

      <!-- 标题输入 -->
      <view class="input-section">
        <input
          class="title-input"
          v-model="title"
          type="text"
          placeholder="添加标题"
          maxlength="50"
        />
        <textarea
          class="body-input"
          v-model="body"
          placeholder="添加正文..."
          maxlength="500"
        />
      </view>

      <!-- 功能选项列表 -->
      <view class="options-section">
        <view class="option-row" @click="addMusic">
          <view class="option-left">
            <text class="option-icon">🎵</text>
            <text class="option-label">添加音乐</text>
          </view>
          <view class="option-right">
            <text class="option-hint">选择音乐</text>
            <text class="option-arrow">›</text>
          </view>
        </view>

        <view class="option-row" @click="goLocation">
          <view class="option-left">
            <text class="option-icon">📍</text>
            <text class="option-label">添加地点</text>
          </view>
          <view class="option-right">
            <text class="option-hint">{{ location || '选择地点' }}</text>
            <text class="option-arrow">›</text>
          </view>
        </view>

        <view class="option-row" @click="addTopic">
          <view class="option-left">
            <text class="option-icon">#</text>
            <text class="option-label">添加话题</text>
          </view>
          <view class="option-right">
            <text class="option-hint">{{ topic || '添加话题' }}</text>
            <text class="option-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 高级设置入口 -->
      <view class="advanced-section" @click="showAdvanced = true">
        <view class="option-row">
          <view class="option-left">
            <text class="option-icon">⚙️</text>
            <text class="option-label">高级设置</text>
          </view>
          <view class="option-right">
            <text class="option-hint">{{ privacyLabel }}</text>
            <text class="option-arrow">›</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部功能栏 -->
    <view class="bottom-bar">
      <view class="bar-left">
        <view class="bar-btn" @click="atSomeone">
          <text class="bar-btn-icon">@</text>
          <text class="bar-btn-label">提到</text>
        </view>
        <view class="bar-btn" @click="previewFeed">
          <text class="bar-btn-icon">👁</text>
          <text class="bar-btn-label">预览</text>
        </view>
      </view>
      <view class="publish-btn" @click="publishFeed">发布动态</view>
    </view>

    <!-- 高级设置弹窗 -->
    <view v-if="showAdvanced" class="modal-mask" @click="showAdvanced = false">
      <view class="advanced-sheet" @click.stop>
        <view class="sheet-handle">
          <view class="handle-bar"></view>
        </view>
        <view class="sheet-title">高级设置</view>

        <view class="sheet-body">
          <!-- 隐私权限 -->
          <view class="setting-group">
            <text class="setting-label">隐私权限</text>
            <view class="radio-list">
              <view
                v-for="opt in privacyOpts"
                :key="opt.key"
                class="radio-item"
                :class="{ selected: privacy === opt.key }"
                @click="privacy = opt.key"
              >
                <text class="radio-text">{{ opt.label }}</text>
                <view class="radio-box">
                  <view v-if="privacy === opt.key" class="radio-dot"></view>
                </view>
              </view>
            </view>
          </view>

          <!-- 定时发布 -->
          <view class="setting-group">
            <text class="setting-label">定时发布</text>
            <view class="setting-row">
              <picker mode="date" :value="scheduleDate" @change="onDateChange">
                <view class="picker-btn">
                  <text>{{ scheduleDate || '选择日期' }}</text>
                  <text class="picker-arrow">›</text>
                </view>
              </picker>
              <picker mode="time" :value="scheduleTime" @change="onTimeChange">
                <view class="picker-btn">
                  <text>{{ scheduleTime || '选择时间' }}</text>
                  <text class="picker-arrow">›</text>
                </view>
              </picker>
            </view>
          </view>

          <!-- 开关选项 -->
          <view class="setting-group">
            <view class="switch-row">
              <text class="switch-label">内容原创声明</text>
              <view class="switch-box" :class="{ on: originalOn }" @click="originalOn = !originalOn">
                <view class="switch-knob"></view>
              </view>
            </view>
            <view class="switch-row">
              <text class="switch-label">AI生成内容提示</text>
              <view class="switch-box" :class="{ on: aiOn }" @click="aiOn = !aiOn">
                <view class="switch-knob"></view>
              </view>
            </view>
            <view class="switch-row">
              <text class="switch-label">允许保存内容</text>
              <view class="switch-box" :class="{ on: allowSave }" @click="allowSave = !allowSave">
                <view class="switch-knob"></view>
              </view>
            </view>
            <view v-if="allowSave" class="sub-switch-row">
              <text class="sub-switch-label">保存自动加水印</text>
              <view class="switch-box small" :class="{ on: watermarkOn }" @click="watermarkOn = !watermarkOn">
                <view class="switch-knob"></view>
              </view>
            </view>
            <view class="switch-row">
              <text class="switch-label">允许转载</text>
              <view class="switch-box" :class="{ on: allowRepost }" @click="allowRepost = !allowRepost">
                <view class="switch-knob"></view>
              </view>
            </view>
          </view>
        </view>

        <view class="sheet-footer">
          <view class="sheet-btn confirm" @click="confirmAdvanced">完成</view>
        </view>
      </view>
    </view>

    <!-- 存草稿/删除弹窗 -->
    <view v-if="showDraftModal" class="modal-mask" @click="showDraftModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-item" @click="saveDraft">
          <text class="modal-label-center">存为草稿</text>
        </view>
        <view class="modal-item danger" @click="deleteFeed">
          <text class="modal-label-center">删除</text>
        </view>
        <view class="modal-cancel" @click="showDraftModal = false">取消</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import CustomNavbar from '@/components/common/CustomNavbar.vue'
import { uploadWorkFile, createWork } from '@/api/works.js'

const images = ref([])
const title = ref('')
const body = ref('')
const location = ref('')
const topic = ref('')
const showAdvanced = ref(false)
const showDraftModal = ref(false)

// 高级设置
const privacy = ref('public')
const privacyLabel = ref('公开可见')
const scheduleDate = ref('')
const scheduleTime = ref('')
const originalOn = ref(false)
const aiOn = ref(false)
const allowSave = ref(false)
const watermarkOn = ref(false)
const allowRepost = ref(false)

const privacyOpts = [
  { key: 'public', label: '公开可见' },
  { key: 'fans', label: '粉丝可见' },
  { key: 'mutual', label: '仅互关好友可见' },
  { key: 'private', label: '仅自己可见' }
]

function addImage() {
  uni.chooseImage({
    count: 9 - images.value.length,
    success: (res) => {
      images.value = [...images.value, ...res.tempFilePaths]
    }
  })
}

function removeImage(index) {
  images.value.splice(index, 1)
}

function addMusic() {
  uni.showToast({ title: '选择音乐', icon: 'none' })
}

function goLocation() {
  uni.navigateTo({ url: '/pages/location/index' })
}

function addTopic() {
  uni.showToast({ title: '添加话题', icon: 'none' })
}

function atSomeone() {
  uni.showToast({ title: '@提到', icon: 'none' })
}

function previewFeed() {
  uni.showToast({ title: '预览模式', icon: 'none' })
}

async function publishFeed() {
  if (!title.value.trim() && !body.value.trim() && !images.value.length) {
    uni.showToast({ title: '写点什么再发布吧', icon: 'none' })
    return
  }
  uni.showLoading({ title: '发布中...', mask: true })
  try {
    // ① 图片逐张上传（后端单文件接口，字段名 file）→ 拿到相对 URL
    const files = []
    for (const path of images.value) {
      const up = await uploadWorkFile(path)
      if (up && up.url) files.push(up.url)
    }
    // ② 3.1 创建作品：有图 → visual + flip；纯文字 → text_only（title 由 text_content 派生）
    const pureText = files.length === 0
    // 隐私映射：fans→followers；mutual/private/public 同名直传
    const visibility = privacy.value === 'fans' ? 'followers' : privacy.value
    // TODO(契约待后端确认)：话题(#)、@好友、定时发布、原创声明/水印/允许保存与转发等开关，
    //   09-15 文档的作品模型里都没有对应字段，先忽略（避免发出去与 UI 不一致的假设置）
    await createWork({
      content_type: pureText ? 'text_only' : 'original',
      channel: pureText ? 'writing' : 'visual',
      image_layout: 'flip',
      title: title.value.trim() || body.value.trim().slice(0, 50),
      text_content: body.value.trim(),
      files,
      cover_url: files[0] || '',
      visibility_type: visibility,
      location: location.value || undefined,
      status: 'published'
    })
    uni.hideLoading()
    uni.showToast({ title: '发布成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1000)
  } catch (err) {
    uni.hideLoading()
    // 失败原因由 upload / request 层按错误码提示
  }
}

function onDateChange(e) {
  scheduleDate.value = e.detail.value
}

function onTimeChange(e) {
  scheduleTime.value = e.detail.value
}

function confirmAdvanced() {
  const found = privacyOpts.find(p => p.key === privacy.value)
  privacyLabel.value = found ? found.label : '公开可见'
  showAdvanced.value = false
}

function saveDraft() {
  showDraftModal.value = false
  uni.showToast({ title: '已保存草稿', icon: 'success' })
}

function deleteFeed() {
  showDraftModal.value = false
  uni.navigateBack()
}
</script>

<style scoped>
.page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.edit-scroll {
  height: calc(100vh - 120rpx);
}

/* 图片上传 */
.upload-section {
  background: #fff;
  padding: 24rpx;
}

.upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.upload-item {
  width: 200rpx;
  height: 200rpx;
  position: relative;
  border-radius: 12rpx;
  overflow: hidden;
}

.upload-img {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
}

.remove-img {
  position: absolute;
  top: 6rpx;
  right: 6rpx;
  width: 36rpx;
  height: 36rpx;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
}

.upload-add {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background: #fafafa;
}

.add-icon {
  font-size: 48rpx;
  color: #ccc;
}

.add-text {
  font-size: 22rpx;
  color: #bbb;
}

/* 输入区域 */
.input-section {
  background: #fff;
  padding: 24rpx 30rpx;
  margin-top: 10rpx;
}

.title-input {
  width: 100%;
  height: 80rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.body-input {
  width: 100%;
  min-height: 160rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  margin-top: 12rpx;
}

/* 功能选项 */
.options-section {
  background: #fff;
  margin-top: 10rpx;
  padding: 0 30rpx;
}

.option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.option-row:last-child {
  border-bottom: none;
}

.option-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.option-icon {
  font-size: 32rpx;
}

.option-label {
  font-size: 28rpx;
  color: #333;
}

.option-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.option-hint {
  font-size: 24rpx;
  color: #999;
}

.option-arrow {
  font-size: 28rpx;
  color: #ccc;
}

/* 高级设置入口 */
.advanced-section {
  background: #fff;
  margin-top: 10rpx;
  padding: 0 30rpx;
}

/* 底部栏 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 30rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.bar-left {
  display: flex;
  gap: 24rpx;
}

.bar-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 20rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
}

.bar-btn-icon {
  font-size: 24rpx;
}

.bar-btn-label {
  font-size: 24rpx;
  color: #666;
}

.publish-btn {
  background: #007aff;
  color: #fff;
  padding: 18rpx 40rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
  font-weight: 600;
}

/* 高级设置弹窗 */
.modal-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.advanced-sheet {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
  animation: slideUp 0.3s ease;
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
  padding: 0 30rpx 20rpx;
}

.sheet-body {
  padding: 0 30rpx;
}

.setting-group {
  margin-bottom: 28rpx;
}

.setting-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.radio-list {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.radio-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.radio-item.selected .radio-text {
  color: #007aff;
  font-weight: 500;
}

.radio-text {
  font-size: 28rpx;
  color: #333;
}

.radio-box {
  width: 32rpx;
  height: 32rpx;
  border: 2px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-dot {
  width: 18rpx;
  height: 18rpx;
  background: #007aff;
  border-radius: 50%;
}

.setting-row {
  display: flex;
  gap: 16rpx;
}

.picker-btn {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #333;
}

.picker-arrow {
  color: #ccc;
}

/* 开关 */
.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.switch-label {
  font-size: 28rpx;
  color: #333;
}

.switch-box {
  width: 72rpx;
  height: 40rpx;
  background: #ddd;
  border-radius: 20rpx;
  position: relative;
  transition: 0.2s;
}

.switch-box.on {
  background: #007aff;
}

.switch-box.small {
  width: 64rpx;
  height: 36rpx;
}

.switch-knob {
  width: 32rpx;
  height: 32rpx;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: 0.2s;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
}

.switch-box.on .switch-knob {
  left: 36rpx;
}

.switch-box.small.on .switch-knob {
  left: 28rpx;
}

.switch-box.small .switch-knob {
  width: 28rpx;
  height: 28rpx;
  top: 4rpx;
  left: 4rpx;
}

.sub-switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0 16rpx 30rpx;
  border-bottom: 1px solid #f5f5f5;
}

.sub-switch-label {
  font-size: 26rpx;
  color: #888;
}

.sheet-footer {
  padding: 24rpx 30rpx 30rpx;
}

.sheet-btn.confirm {
  width: 100%;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #007aff;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
}

/* 底部弹窗 */
.modal-content {
  width: 480rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  margin: auto;
  animation: popIn 0.2s ease;
}

@keyframes popIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-item {
  display: flex;
  justify-content: center;
  padding: 30rpx;
  border-bottom: 1px solid #f0f0f0;
}

.modal-item.danger .modal-label-center {
  color: #ff3b30;
}

.modal-label-center {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.modal-cancel {
  display: flex;
  justify-content: center;
  padding: 30rpx;
  font-size: 28rpx;
  color: #999;
}
</style>