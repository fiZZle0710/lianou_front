<template>
  <!-- 我的客服（二级页） -->
  <view class="page">
    <view class="nav">
      <view class="nav-back" @click="goBack"><text class="back-icon">←</text></view>
      <text class="nav-title">我的客服</text>
      <view class="nav-right" @click="openMenu"><text class="menu-icon">⋯</text></view>
    </view>

    <scroll-view scroll-y class="chat-scroll" :scroll-into-view="scrollToId" scroll-with-animation>
      <view class="msg-list" id="chat-list">
        <view class="time-tag"><text class="time-tag-text">今天</text></view>
        <ChatBubble v-for="(m, i) in messages" :key="i" :role="m.role" :type="m.type" :content="m.content" />

        <!-- 快捷问题卡片 -->
        <view class="quick-card">
          <text class="quick-title">当前你想问，可快捷点击</text>
          <view
            class="quick-item"
            v-for="(q, i) in quickQuestions"
            :key="i"
            @click="askQuick(q)"
          >
            <text class="quick-label">{{ q }}</text>
            <text class="quick-arrow">›</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <ChatInputBar placeholder="输入你的问题..." @send="sendText" @plus="showMore" @emoji="sendEmoji" />
  </view>
</template>
<script setup>
import { ref, nextTick } from "vue"
import ChatBubble from "@/components/message/ChatBubble.vue"
import ChatInputBar from "@/components/message/ChatInputBar.vue"

const scrollToId = ref("chat-list")
// 客服对话数据：后续接客服系统/长连接
// TODO: 建立客服会话，onServiceReply
const messages = ref([
  { role: "left", type: "text", content: "我是你的专属客服～" }
])

const quickQuestions = ref([
  "共创项目被删除怎么找回？",
  "如何升级等级？",
  "如何在广场发布共创招募",
  "如何联系人工客服？"
])

function askQuick(q) {
  // 点击快捷问题自动发送
  sendText(q)
  // 跳转对应帮助详情：可按需打开帮助文档
  // uni.navigateTo({ url: "/pages/help/detail?q=" + encodeURIComponent(q) })
}
function sendText(text) {
  messages.value.push({ role: "right", type: "text", content: text })
  scrollToBottom()
  // TODO: 调用客服接口 sendServiceMessage
  setTimeout(() => {
    messages.value.push({ role: "left", type: "text", content: "收到，正在为您处理～" })
    scrollToBottom()
  }, 500)
}
function sendEmoji() {
  messages.value.push({ role: "right", type: "emoji" })
  scrollToBottom()
}
function scrollToBottom() {
  nextTick(() => { scrollToId.value = "chat-list" })
}
function goBack() { uni.navigateBack() }
function openMenu() { uni.showToast({ title: "客服菜单", icon: "none" }) }
function showMore() { uni.showToast({ title: "更多", icon: "none" }) }
</script>

<style scoped>
.page { background: #eef0f4; height: 100vh; display: flex; flex-direction: column; }
.nav { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 24rpx; padding-top: calc(env(safe-area-inset-top) + 20rpx); background: #fff; }
.nav-back { width: 70rpx; height: 60rpx; display: flex; align-items: center; }
.back-icon { font-size: 40rpx; color: #333; }
.nav-title { font-size: 32rpx; font-weight: 700; color: #333; }
.nav-right { width: 70rpx; text-align: right; }
.menu-icon { font-size: 44rpx; color: #333; }
.chat-scroll { flex: 1; padding: 24rpx 20rpx; box-sizing: border-box; }
.msg-list { min-height: 100%; }
.time-tag { text-align: center; margin-bottom: 28rpx; }
.time-tag-text { font-size: 22rpx; color: #aaa; background: #e4e6ea; padding: 6rpx 20rpx; border-radius: 20rpx; }
.quick-card { margin-top: 30rpx; background: #fff; border-radius: 20rpx; padding: 26rpx; }
.quick-title { font-size: 28rpx; color: #333; font-weight: 600; display: block; margin-bottom: 16rpx; }
.quick-item { display: flex; align-items: center; justify-content: space-between; padding: 24rpx 0; border-bottom: 1rpx solid #f3f4f6; }
.quick-item:last-child { border-bottom: none; }
.quick-item:active { opacity: .7; }
.quick-label { font-size: 27rpx; color: #555; flex: 1; }
.quick-arrow { font-size: 34rpx; color: #ccc; margin-left: 16rpx; }
</style>