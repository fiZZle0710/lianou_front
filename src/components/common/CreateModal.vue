<template>
  <!-- 创作选择弹窗 - 底部弹出 -->
  <view class="modal-mask" @click="close">
    <view class="modal-sheet" @click.stop>
      <view class="sheet-handle" @click="close">
        <view class="handle-bar"></view>
      </view>

      <view class="sheet-title">创作</view>

      <view class="option-list">
        <view
          v-for="(item, index) in options"
          :key="index"
          class="option-item"
          @click="selectOption(item)"
        >
          <view class="option-icon">
            <text class="icon-text">{{ item.icon }}</text>
          </view>
          <view class="option-info">
            <text class="option-name">{{ item.name }}</text>
            <text class="option-desc">{{ item.desc }}</text>
          </view>
          <text class="option-arrow">›</text>
        </view>
      </view>

      <view class="sheet-footer">
        <view class="cancel-btn" @click="close">
          <text>取消</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
const emit = defineEmits(['close', 'select'])

const options = [
  { key: 'shoot_video', name: '拍摄视频', desc: '调用相机拍摄后编辑', icon: '📷' },
  { key: 'import_video', name: '导入视频素材', desc: '从相册导入视频', icon: '🎬' },
  { key: 'import_image', name: '导入图片素材', desc: '从相册选图发布', icon: '🖼️' },
  { key: 'new_coop', name: '发起共创项目', desc: '创建一个共创项目', icon: '🤝' }
]

function close() {
  emit('close')
}

function selectOption(item) {
  emit('select', item.key)
  close()
}
</script>

<style scoped>
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

.modal-sheet {
  width: 100%;
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  animation: slideUp 0.3s ease;
  padding-bottom: env(safe-area-inset-bottom);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
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
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
  padding: 20rpx 0 30rpx;
}

.option-list {
  padding: 0 30rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx;
  border-bottom: 1px solid #f5f5f5;
}

.option-item:last-child {
  border-bottom: none;
}

.option-item:active {
  background: #f8f8f8;
  border-radius: 16rpx;
}

.option-icon {
  width: 80rpx;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-text {
  font-size: 36rpx;
}

.option-info {
  flex: 1;
  margin-left: 20rpx;
  min-width: 0;
}

.option-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.option-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.option-arrow {
  font-size: 32rpx;
  color: #ccc;
  font-weight: bold;
  flex-shrink: 0;
}

.sheet-footer {
  padding: 30rpx;
}

.cancel-btn {
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 45rpx;
  font-size: 30rpx;
  color: #666;
}

.cancel-btn:active {
  background: #eee;
}
</style>
