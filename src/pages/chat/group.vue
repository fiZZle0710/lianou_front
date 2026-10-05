<template>
  <!-- 群聊页（二级页） -->
  <view class="page">
    <view class="nav">
      <view class="nav-back" @click="goBack"><text class="back-icon">←</text></view>
      <text class="nav-title">{{ title }}</text>
      <view class="nav-right" @click="openMenu"><text class="menu-icon">⋯</text></view>
    </view>

    <!-- 演示数据灰标：接口不可用、回退到本地假数据时显示 -->
    <DemoBadge :show="isDemo" position="top-right" />

    <!-- 演示数据灰标：接口不可用、回退到本地假数据时显示 -->
    <DemoBadge :show="isDemo" position="top-right" />

    <scroll-view scroll-y class="chat-scroll" :scroll-into-view="scrollToId" scroll-with-animation>
      <view class="msg-list" id="chat-list">
        <view v-if="messages.length" class="time-tag">
          <text class="time-tag-text">{{ messages[0].time || '群聊记录' }}</text>
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

    <ChatInputBar @send="sendText" @plus="showPanel" @emoji="sendEmoji" />

    <view v-if="showMore" class="panel-mask" @click="showMore = false">
      <view class="more-panel" @click.stop>
        <view class="grid-row">
          <view class="grid-cell" @click="pickImage"><text class="cell-icon">🖼</text><text class="cell-label">相册</text></view>
          <view class="grid-cell" @click="takePhoto"><text class="cell-icon">📷</text><text class="cell-label">相机</text></view>
          <view class="grid-cell" @click="groupReview"><text class="cell-icon">📊</text><text class="cell-label">项目互评</text></view>
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
import { mockGroups } from '@/mock/index.js'
import {
  getGroupMessages,
  sendGroupMessage,
  readGroup,
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
const title = computed(() => query.value.name || "群聊")
const scrollToId = ref("chat-list")
const showMore = ref(false)
const groupId = ref(null)

// 群聊记录：真实接口 7.3（后端按时间倒序，适配层已反转成正序）
const messages = ref([])
const isDemo = ref(false)

const myInfo = computed(() => getUserInfo() || {})
const myUserId = computed(() => myInfo.value.user_id || myInfo.value.id || '')
const myAvatar = computed(() => myInfo.value.avatar || '')

onLoad(async (options) => {
  groupId.value = options && options.groupId
  await loadMessages()
})

async function loadMessages() {
  if (!groupId.value) return
  const { data, isFallback } = await withFallback(
    async () => {
      const page = await getGroupMessages(groupId.value, { page: 1, page_size: 20 })
      // 7.5 标记群已读（失败不影响消息展示）
      readGroup(groupId.value).catch(() => {})
      return normalizeMessageList(page, myUserId.value)
    },
    () => mockGroups[groupId.value] || [],
    'chat/group: 群消息'
  )
  isDemo.value = isFallback
  messages.value = data || []
  scrollToBottom()
}

/** 本地乐观追加（写操作不回退 mock） */
function pushLocal({ type, content }) {
  messages.value.push({ role: 'right', type, content, isMine: true, avatar: '', time: '刚刚' })
  scrollToBottom()
}

function sendText(text) {
  const content = (text || '').trim()
  if (!content) return
  pushLocal({ type: 'text', content })
  if (!groupId.value) return
  sendGroupMessage(groupId.value, { msg_type: 'text', content }).catch(() => {})
}

function sendEmoji() {
  pushLocal({ type: 'emoji', content: '😊' })
}

function scrollToBottom() {
  nextTick(() => { scrollToId.value = "chat-list" })
}
function goBack() { uni.navigateBack() }
function openMenu() { uni.showToast({ title: "群设置", icon: "none" }) }
function showPanel() { showMore.value = !showMore.value }

/** 相册选图 → 8.1 消息附件上传 → 7.4 发群图片消息 */
function pickImage() {
  chooseAndSendImage(['album'])
}
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
      if (!filePath || !groupId.value) return
      uni.showLoading({ title: '发送中...', mask: true })
      try {
        const file = await uploadMessageFile(filePath)
        await sendGroupMessage(groupId.value, {
          msg_type: 'image',
          content: file.url,
          file_name: file.file_name,
          file_size: file.file_size
        })
        pushLocal({ type: 'image', content: file.full_url })
      } catch (e) {
        /* 失败已由 upload / request 层提示 */
      } finally {
        uni.hideLoading()
      }
    }
  })
}

/**
 * 项目互评：7.4 的 msg_type=rating_request，需传 project_id（后端会校验项目存在性）
 * 群聊里没有项目选择器，这里先用弹窗输入项目 ID（后续可换成项目列表选择器）
 */
function groupReview() {
  showMore.value = false
  if (!groupId.value) return
  uni.showModal({
    title: '发起项目互评',
    editable: true,
    placeholderText: '请输入项目 ID',
    success: async (res) => {
      if (!res.confirm) return
      const projectId = Number((res.content || '').trim())
      if (!projectId) {
        uni.showToast({ title: '项目 ID 无效', icon: 'none' })
        return
      }
      try {
        await sendGroupMessage(groupId.value, {
          msg_type: 'rating_request',
          content: String(projectId), // content 必填，后端实际取 project_id
          project_id: projectId
        })
        pushLocal({ type: 'card', content: '已发起项目互评（项目 ID ' + projectId + '）' })
      } catch (e) {
        /* 失败已提示（5001 项目不存在等） */
      }
    }
  })
}

function makeCall() {
  // TODO: 语音/视频通话（后端无对应接口）
  uni.showToast({ title: "发起通话", icon: "none" })
}
function pickFile() {
  // 后端支持 msg_type=file，但 uni.chooseFile 在 App 端不可用，暂降级
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
.panel-mask { position: fixed; left:0; right:0; bottom:0; top:0; background: rgba(0,0,0,.3); z-index:1000; }
.more-panel { position: absolute; left:0; right:0; bottom:0; background:#fff; border-radius: 28rpx 28rpx 0 0; padding: 30rpx 24rpx 40rpx; padding-bottom: calc(40rpx + env(safe-area-inset-bottom)); }
.grid-row { display: flex; flex-wrap: wrap; }
.grid-cell { width: 25%; display: flex; flex-direction: column; align-items: center; padding: 20rpx 0; }
.grid-cell:active { opacity:.7; }
.cell-icon { font-size: 56rpx; }
.cell-label { font-size: 24rpx; color:#666; margin-top: 8rpx; }
</style>
