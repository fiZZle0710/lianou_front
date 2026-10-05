<template>
  <!-- 私聊页（二级页） -->
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav">
      <view class="nav-back" @click="goBack"><text class="back-icon">←</text></view>
      <text class="nav-title">{{ title }}</text>
      <view class="nav-right" @click="openMenu"><text class="menu-icon">⋯</text></view>
    </view>

    <!-- 演示数据灰标：接口不可用、回退到本地假数据时显示 -->
    <DemoBadge :show="isDemo" position="top-right" />

    <!-- 消息滚动区 -->
    <scroll-view
      scroll-y
      class="chat-scroll"
      :scroll-into-view="scrollToId"
      scroll-with-animation
    >
      <view class="msg-list" id="chat-list">
        <view v-if="messages.length" class="time-tag">
          <text class="time-tag-text">{{ messages[0].time || '聊天记录' }}</text>
        </view>
        <ChatBubble
          v-for="(m, i) in messages"
          :key="m.id || i"
          :id="'msg' + i"
          :role="m.role"
          :type="m.type"
          :content="m.content"
          :avatar="m.avatar"
          :my-avatar="myAvatar"
        />
      </view>
    </scroll-view>

    <!-- 底部输入栏 -->
    <ChatInputBar @send="sendText" @plus="showPanel" @emoji="sendEmoji" />

    <!-- 加号功能宫格面板 -->
    <view v-if="showMore" class="panel-mask" @click="showMore = false">
      <view class="more-panel" @click.stop>
        <view class="grid-row">
          <view class="grid-cell" @click="pickImage"><text class="cell-icon">🖼</text><text class="cell-label">相册</text></view>
          <view class="grid-cell" @click="takePhoto"><text class="cell-icon">📷</text><text class="cell-label">相机</text></view>
          <view class="grid-cell" @click="startCoop"><text class="cell-icon">🤝</text><text class="cell-label">发起共创</text></view>
          <view class="grid-cell" @click="makeCall"><text class="cell-icon">📞</text><text class="cell-label">通话</text></view>
          <view class="grid-cell" @click="pickFile"><text class="cell-icon">📁</text><text class="cell-label">文件</text></view>
          <view class="grid-cell"><text class="cell-icon">➕</text><text class="cell-label">待定</text></view>
          <view class="grid-cell"><text class="cell-icon">➕</text><text class="cell-label">待定</text></view>
          <view class="grid-cell"><text class="cell-icon">➕</text><text class="cell-label">待定</text></view>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref, computed, nextTick } from "vue"
import { onLoad } from '@dcloudio/uni-app'
import ChatBubble from "@/components/message/ChatBubble.vue"
import ChatInputBar from "@/components/message/ChatInputBar.vue"
import DemoBadge from "@/components/common/DemoBadge.vue"
import { mockChats, mockUsers } from '@/mock/index.js'
import {
  getConversationWith,
  getMessages,
  sendMessage,
  readConversation,
  uploadMessageFile
} from '@/api/chat.js'
import { normalizeMessageList } from '@/api/adapter.js'
import { withFallback } from '@/utils/fallback.js'
import { getUserInfo } from '@/utils/auth.js'

const query = computed(() => {
  const pages = getCurrentPages()
  const cur = pages[pages.length - 1]
  return cur ? cur.$page?.options || {} : {}
})
const title = computed(() => {
  if (contactName.value) return contactName.value
  if (userId.value && mockUsers[userId.value]) return mockUsers[userId.value].nickname
  return query.value.name || "聊天"
})
const scrollToId = ref("chat-list")
const showMore = ref(false)
const userId = ref(null)
const contactName = ref('')

// 私聊记录：真实接口 → 6.2 建会话 → 6.3 拉消息
const messages = ref([])
const conversationId = ref(null)
const isDemo = ref(false) // 是否已回退到演示数据

// 当前登录用户（决定气泡左右与「我」的头像）
const myInfo = computed(() => getUserInfo() || {})
const myUserId = computed(() => myInfo.value.user_id || myInfo.value.id || '')
const myAvatar = computed(() => myInfo.value.avatar || '')

onLoad(async (options) => {
  userId.value = (options && options.userId) || null
  // 官方会话（6.6）没有 userId，直接带上 conversation_id 进入
  conversationId.value = (options && options.conversationId) || null
  contactName.value = (options && options.name) || ''
  await loadMessages()
})

async function loadMessages() {
  if (!userId.value && !conversationId.value) return
  const { data, isFallback } = await withFallback(
    async () => {
      // 6.2 获取/创建与某用户的会话（不能和自己对话：3003）；带 conversationId 进来时跳过
      if (!conversationId.value) {
        const conv = await getConversationWith(userId.value)
        const cid = conv && conv.conversation_id
        conversationId.value = cid || null
      }
      if (!conversationId.value) return []
      // 6.3 消息记录（后端按时间倒序，适配层已反转成正序）
      const page = await getMessages(conversationId.value, { page: 1, page_size: 20 })
      // 6.5 标记已读（失败不影响消息展示）
      readConversation(conversationId.value).catch(() => {})
      return normalizeMessageList(page, myUserId.value)
    },
    () => mockChats[userId.value] || [],
    'chat/private: 会话或消息'
  )
  isDemo.value = isFallback
  messages.value = data || []
  scrollToBottom()
}

/** 本地乐观追加（写操作不等待接口返回） */
function pushLocal({ type, content }) {
  messages.value.push({ role: 'right', type, content, isMine: true, avatar: '', time: '刚刚' })
  scrollToBottom()
}

function sendText(text) {
  const content = (text || '').trim()
  if (!content) return
  // 6.4 发消息前先本地回显；**写操作不回退 mock**，失败由 request 层提示
  pushLocal({ type: 'text', content })
  if (!conversationId.value) {
    uni.showToast({ title: '会话尚未建立，发送失败', icon: 'none' })
    return
  }
  sendMessage(conversationId.value, { msg_type: 'text', content }).catch(() => {})
}

function sendEmoji() {
  pushLocal({ type: 'emoji', content: '😊' })
}

function scrollToBottom() {
  nextTick(() => { scrollToId.value = "chat-list" })
}
function goBack() { uni.navigateBack() }
function openMenu() { uni.showToast({ title: "聊天设置", icon: "none" }) }

function showPanel() { showMore.value = !showMore.value }

/** 相册选图 → 8.1 消息附件上传 → 6.4 发图片消息 */
function pickImage() {
  chooseAndSendImage(['album'])
}

/** 拍照 → 同上 */
function takePhoto() {
  chooseAndSendImage(['camera'])
}

function chooseAndSendImage(sourceType) {
  showMore.value = false
  uni.chooseImage({
    count: 1,
    sourceType,
    success: async (res) => {
      const filePath = (res.tempFilePaths || [])[0]
      if (!filePath) return
      if (!conversationId.value) {
        uni.showToast({ title: '会话尚未建立，发送失败', icon: 'none' })
        return
      }
      uni.showLoading({ title: '发送中...', mask: true })
      try {
        // 消息附件上限 20MB，字段名固定 file
        const file = await uploadMessageFile(filePath)
        // content 必填：图片消息传**相对 URL**（与后端约定一致），展示时再拼 host
        await sendMessage(conversationId.value, {
          msg_type: 'image',
          content: file.url,
          file_name: file.file_name,
          file_size: file.file_size
        })
        pushLocal({ type: 'image', content: file.full_url })
      } catch (e) {
        /* 上传/发送失败已由 upload / request 层提示；写操作不回退 */
      } finally {
        uni.hideLoading()
      }
    }
  })
}

function startCoop() { uni.navigateTo({ url: "/pages/feed/edit/index" }) }
function makeCall() {
  // TODO: 语音/视频通话（后端无对应接口，见 docs/给后端的接口问题清单.md）
  uni.showToast({ title: "发起通话", icon: "none" })
}
function pickFile() {
  // 后端支持 msg_type=file（需 file_name / file_size），但 uni.chooseFile 在 App 端不可用，暂降级
  showMore.value = false
  uni.showToast({ title: "App 端暂不支持选择文件", icon: "none" })
}
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

/* 加号宫格面板 */
.panel-mask { position: fixed; left: 0; right: 0; bottom: 0; top: 0; background: rgba(0,0,0,.3); z-index: 1000; }
.more-panel { position: absolute; left: 0; right: 0; bottom: 0; background: #fff; border-radius: 28rpx 28rpx 0 0; padding: 30rpx 24rpx 40rpx; padding-bottom: calc(40rpx + env(safe-area-inset-bottom)); }
.grid-row { display: flex; flex-wrap: wrap; }
.grid-cell { width: 25%; display: flex; flex-direction: column; align-items: center; padding: 20rpx 0; }
.grid-cell:active { opacity: .7; }
.cell-icon { font-size: 56rpx; }
.cell-label { font-size: 24rpx; color: #666; margin-top: 8rpx; }
</style>
