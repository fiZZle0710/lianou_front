<template>
  <!-- 通用底部输入栏组件：语音/输入切换 + 输入框 + 表情 + 加号 -->
  <view class="chat-input-bar">
    <!-- 键盘/语音切换 -->
    <view class="bar-btn" @click="toggleVoice">
      <text class="bar-icon">{{ voiceMode ? "⌨️" : "🎤" }}</text>
    </view>

    <!-- 中间输入区 -->
    <view class="input-wrap">
      <input
        v-if="!voiceMode"
        class="msg-input"
        v-model="text"
        type="text"
        :placeholder="placeholder"
        placeholder-class="input-ph"
        confirm-type="send"
        @confirm="sendText"
        :adjust-position="false"
      />
      <view v-else class="voice-box" @click="voiceTap">
        <text class="voice-text">按住说话</text>
      </view>
    </view>

    <!-- 表情 -->
    <view class="bar-btn" @click="emit('emoji', text)">
      <text class="bar-icon">😊</text>
    </view>

    <!-- 加号 -->
    <view class="bar-btn" @click="emit('plus', text)">
      <text class="bar-icon">➕</text>
    </view>
  </view>
</template>
<script setup>
import { ref, computed } from "vue"

const props = defineProps({
  placeholder: { type: String, default: "输入消息..." }
})
const emit = defineEmits(["send", "plus", "emoji", "voice"])

const text = ref("")
const voiceMode = ref(false)

// 输入框可发送，语音模式隐藏输入框
const canSend = computed(() => text.value.trim().length > 0)

function toggleVoice() {
  voiceMode.value = !voiceMode.value
}

function voiceTap() {
  // 语音输入占位：后续接入录音/语音接口
  // TODO: 语音长按/松开录音，上传语音文件
  uni.showToast({ title: "语音功能开发中", icon: "none" })
}

function sendText() {
  const val = text.value
  if (!val.trim()) return
  emit("send", val)
  text.value = ""
}
</script>
<style scoped>
.chat-input-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1rpx solid #f0f0f0;
}
.bar-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bar-icon {
  font-size: 40rpx;
}
.bar-btn:active {
  background: #f5f5f5;
  border-radius: 12rpx;
}
.input-wrap {
  flex: 1;
  margin: 0 8rpx;
  min-width: 0;
}
.msg-input {
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 28rpx;
  font-size: 28rpx;
  color: #333;
}
.input-ph {
  color: #c0c0c0;
}
.voice-box {
  height: 72rpx;
  background: #f5f5f5;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.voice-text {
  font-size: 28rpx;
  color: #666;
}
</style>