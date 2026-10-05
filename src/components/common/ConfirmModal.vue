<template>
  <!-- 通用确认弹窗组件 -->
  <view v-if="visible" class="modal-mask" @click="handleMaskClick">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="modal-title">{{ title }}</text>
      </view>
      <view class="modal-body">
        <text class="modal-message">{{ message }}</text>
      </view>
      <view class="modal-footer">
        <view class="modal-btn cancel" @click="handleCancel">
          <text>{{ cancelText }}</text>
        </view>
        <view class="modal-btn confirm" @click="handleConfirm">
          <text>{{ confirmText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '提示'
  },
  message: {
    type: String,
    default: ''
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  maskClosable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['cancel', 'confirm', 'close'])

function handleCancel() {
  emit('cancel')
  emit('close')
}

function handleConfirm() {
  emit('confirm')
  emit('close')
}

function handleMaskClick() {
  if (props.maskClosable) {
    emit('close')
  }
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 280px;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
}

.modal-header {
  padding: 20px 20px 8px;
  text-align: center;
}

.modal-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.modal-body {
  padding: 8px 20px 20px;
  text-align: center;
}

.modal-message {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  border-top: 1px solid #f0f0f0;
}

.modal-btn {
  flex: 1;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.modal-btn.cancel {
  color: #666;
  border-right: 1px solid #f0f0f0;
}

.modal-btn.confirm {
  color: #007aff;
  font-weight: 600;
}

.modal-btn:active {
  background: #f5f5f5;
}
</style>