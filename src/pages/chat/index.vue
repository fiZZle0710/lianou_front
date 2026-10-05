<template>
  <!-- 聊天会话页（二级/三级页面） -->
  <view class="page">
    <CustomNavbar :title="chatTitle" showBack />

    <scroll-view
      scroll-y
      class="chat-scroll"
      ref="chatScroll"
      :scroll-into-view="scrollToId"
    >
      <view class="message-list">
        <!-- 消息占位 -->
        <view class="empty-chat">
          <text class="empty-text">暂无消息，开始聊天吧</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部输入栏 -->
    <view class="input-bar">
      <input
        class="msg-input"
        v-model="inputText"
        type="text"
        placeholder="输入消息..."
        confirm-type="send"
        @confirm="sendMessage"
      />
      <view class="send-btn" @click="sendMessage">
        <text class="send-text">发送</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import CustomNavbar from '@/components/common/CustomNavbar.vue'

const inputText = ref('')
const scrollToId = ref('')

// 获取路由参数
const query = computed(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return currentPage.$page?.options || {}
})

const chatTitle = computed(() => {
  return query.value.groupName || query.value.nickname || '聊天'
})

function sendMessage() {
  if (!inputText.value.trim()) return
  uni.showToast({ title: '消息已发送', icon: 'none' })
  inputText.value = ''
}
</script>

<style scoped>
.page {
  background: #f5f5f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.chat-scroll {
  flex: 1;
  padding: 16px;
}

.message-list {
  min-height: 100%;
}

.empty-chat {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.empty-text {
  font-size: 14px;
  color: #bbb;
}

/* 输入栏 */
.input-bar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
}

.msg-input {
  flex: 1;
  height: 40px;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 0 16px;
  font-size: 14px;
}

.send-btn {
  margin-left: 10px;
  padding: 8px 20px;
  background: #007aff;
  border-radius: 20px;
}

.send-text {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}
</style>