<template>
  <!-- 我的消息（一级页） -->
  <view class="page">
    <view class="page-inner">
      <!-- 顶部导航：客服 + 标题 + 搜索/清理 -->
      <view class="nav">
        <view class="nav-left" @click="goService">
          <text class="nav-icon">🎧</text>
        </view>
        <text class="nav-title">我的消息</text>
        <view class="nav-right">
          <text class="nav-icon" @click="onSearch">🔍</text>
          <text class="nav-icon" @click="onClean">🧹</text>
        </view>
      </view>

      <DemoBadge :show="isDemo" />

      <!-- 顶部三个功能卡片 -->
      <view class="func-cards">
        <view class="func-card" @click="goOfficial">
          <view class="func-icon-wrap">
            <text class="func-icon">📣</text>
            <view v-if="unread.official > 0" class="badge red"><text class="badge-text">{{ badgeText(unread.official) }}</text></view>
          </view>
          <text class="func-label">官方消息</text>
        </view>
        <view class="func-card" @click="goInteractive">
          <view class="func-icon-wrap">
            <text class="func-icon">💗</text>
            <view v-if="unread.interaction > 0" class="badge red"><text class="badge-text">{{ badgeText(unread.interaction) }}</text></view>
          </view>
          <text class="func-label">互动消息</text>
        </view>
        <view class="func-card" @click="goTodo">
          <view class="func-icon-wrap">
            <text class="func-icon">📋</text>
            <view v-if="unread.todo > 0" class="badge red"><text class="badge-text">{{ badgeText(unread.todo) }}</text></view>
          </view>
          <text class="func-label">待办事项</text>
        </view>
      </view>

      <!-- Tab 切换：联系人 / 群聊 -->
      <view class="tabs">
        <view class="tab-item" :class="{ active: activeTab === 'contact' }" @click="switchTab('contact')">
          <text class="tab-text">联系人</text>
        </view>
        <view class="tab-item" :class="{ active: activeTab === 'group' }" @click="switchTab('group')">
          <text class="tab-text">群聊</text>
        </view>
        <view class="tab-line" :class="activeTab === 'group' ? 'right' : 'left'"></view>
      </view>
      <!-- 会话列表 -->
      <scroll-view
        scroll-y
        class="list-scroll"
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
        @scrolltolower="loadMore"
      >
        <MessageListItem
          v-for="item in currentList"
          :key="item.type + '-' + item.id"
          :nickname="item.nickname"
          :preview="item.preview"
          :time="item.time"
          :unread="item.unread"
          :level="item.level"
          :avatar="item.avatar"
          @click="goChat(item)"
        />
        <view class="list-empty" v-if="currentList.length === 0">
          <text class="empty-text">{{ loading ? '加载中...' : emptyText }}</text>
        </view>
        <view class="list-empty" v-else-if="loading">
          <text class="empty-text">加载中...</text>
        </view>
      </scroll-view>
    </view>
  </view>
<CustomTabbar />
</template>
<script setup>
import { ref, computed } from "vue"
import { onShow } from "@dcloudio/uni-app"
import MessageListItem from "@/components/message/MessageListItem.vue"
import CustomTabbar from "@/components/common/CustomTabbar.vue"
import DemoBadge from "@/components/common/DemoBadge.vue"
import nav from '@/utils/nav.js'
import {
  getConversations,
  getGroups,
  getUnreadCounts,
  getOfficialConversation,
  readAllNotifications
} from '@/api/chat.js'
import { normalizeConversation, normalizeGroup } from '@/api/adapter.js'
import { withFallback, unwrapPage } from '@/utils/fallback.js'
import { mockUsers, mockGroups } from '@/mock/index.js'

const PAGE_SIZE = 20

const activeTab = ref("contact")
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const isDemo = ref(false)
const page = ref(1)
const total = ref(0)

const contactList = ref([])
const groupList = ref([])

// 三角标未读数（9.1 → { official, interaction, todo }）
const unread = ref({ official: 0, interaction: 0, todo: 0 })

const currentList = computed(() => (activeTab.value === "contact" ? contactList.value : groupList.value))

const emptyText = computed(() => (activeTab.value === "contact" ? "还没有聊天，去广场逛逛吧" : "还没有加入任何群聊"))

function badgeText(n) { return n > 99 ? "99+" : String(n) }

/**
 * 6.1 会话项 → 列表项
 * 注意：私聊页 chat/private.vue 认的是 **userId**（6.2 靠它建会话），不是 conversation_id
 */
function toContactItem(raw) {
  const c = normalizeConversation(raw)
  return {
    id: c.id,
    type: 'private',
    userId: c.userId,
    nickname: c.name || '用户',
    level: c.contact ? c.contact.level : 0,
    preview: c.lastMessage || '',
    time: c.time || '',
    unread: c.unreadCount || 0,
    avatar: c.avatar || ''
  }
}

/** 7.1 群项 → 列表项（chat/group.vue 认 groupId） */
function toGroupItem(raw) {
  const g = normalizeGroup(raw)
  return {
    id: g.id,
    type: 'group',
    nickname: g.name || '群聊',
    level: 0,
    preview: g.lastMessage || '',
    time: g.time || '',
    unread: g.unreadCount || 0,
    avatar: g.avatar || ''
  }
}

/** 回退数据（后端未就绪时页面仍可用）：mockUsers / mockGroups 都是按 id 索引的对象 */
function mockContactList() {
  return Object.values(mockUsers || {}).map((u) => toContactItem({
    conversation_id: 'mock-' + u.id,
    contact: u,
    last_message: '',
    last_message_at: null,
    unread_count: 0
  }))
}
function mockGroupList() {
  return Object.keys(mockGroups || {}).map((gid) => toGroupItem({
    group_id: Number(gid),
    name: '群聊 ' + gid,
    last_message: '',
    last_message_at: null,
    unread_count: 0
  }))
}

/** 拉当前 Tab 的列表；reset=true 用于切 Tab / 下拉刷新 */
async function loadList(reset = false) {
  if (loading.value) return
  if (!reset && finished.value) return
  if (reset) {
    page.value = 1
    finished.value = false
  }
  loading.value = true
  const isContact = activeTab.value === 'contact'
  try {
    const fetcher = () => (isContact
      ? getConversations({ page: page.value, page_size: PAGE_SIZE })
      : getGroups({ page: page.value, page_size: PAGE_SIZE }))
    const res = await withFallback(fetcher, isContact ? mockContactList : mockGroupList, 'message/' + activeTab.value)
    const p = unwrapPage(res.data)
    const items = p.list.map(isContact ? toContactItem : toGroupItem)
    const target = isContact ? contactList : groupList
    target.value = reset ? items : target.value.concat(items)
    total.value = p.total || target.value.length
    isDemo.value = res.isFallback
    finished.value = items.length < PAGE_SIZE || target.value.length >= total.value
    page.value += 1
  } finally {
    loading.value = false
  }
}

/** 9.1 三角标未读数（失败就保持 0，不打扰用户） */
async function loadUnread() {
  const res = await withFallback(() => getUnreadCounts(), () => ({ official: 0, interaction: 0, todo: 0 }), 'message/unread-counts')
  const d = res.data || {}
  unread.value = {
    official: Number(d.official || 0),
    interaction: Number(d.interaction || 0),
    todo: Number(d.todo || 0)
  }
}

// 进入/返回本页：刷新未读数 + 当前 Tab 第一页（Tab 列表按需加载）
onShow(() => {
  loadUnread()
  loadList(true)
})

function onRefresh() {
  refreshing.value = true
  Promise.all([loadUnread(), loadList(true)]).finally(() => { refreshing.value = false })
}

function loadMore() {
  loadList(false)
}

function switchTab(type) {
  if (type === activeTab.value) return
  activeTab.value = type
  finished.value = false
  loadList(true)
}

// 点击会话：联系人 → 私聊（传 userId），群聊 → 群聊（传 groupId）
function goChat(item) {
  if (item.type === "group") {
    nav.goDetail('group', item.id)
  } else if (item.userId) {
    nav.goDetail('chat', item.userId)
  } else {
    uni.showToast({ title: '该会话缺少用户信息', icon: 'none' })
  }
}

function goService() { uni.navigateTo({ url: "/pages/message/service" }) }

/** 官方消息：6.6 自动获取/创建官方会话 → 带 conversationId 进私聊页 */
async function goOfficial() {
  try {
    const res = await getOfficialConversation()
    const cid = res && (res.conversation_id || res.id)
    if (!cid) {
      uni.showToast({ title: '未取到官方会话', icon: 'none' })
      return
    }
    uni.navigateTo({ url: '/pages/chat/private?conversationId=' + cid + '&name=' + encodeURIComponent('官方消息') })
  } catch (e) {
    // 失败提示由 request.js 统一弹出
  }
}

function goInteractive() { uni.navigateTo({ url: "/pages/message/interactive" }) }

/** 待办事项 = 互动子页的 todo 视图（9.3） */
function goTodo() { uni.navigateTo({ url: "/pages/message/interactive?tab=todo" }) }

function onSearch() { uni.navigateTo({ url: "/pages/search/index?type=user" }) }

/** 🧹 一键已读：9.5 批量已读（不传 type = 全部） */
async function onClean() {
  try {
    await readAllNotifications()
    unread.value = { official: 0, interaction: 0, todo: 0 }
    uni.showToast({ title: '已全部标记为已读', icon: 'none' })
  } catch (e) {
    // 失败提示由 request.js 统一弹出
  }
}
</script>
<style scoped>
.page { background: #f5f6fa; min-height: 100vh; }
.page-inner { display: flex; flex-direction: column; height: 100vh; }

/* 导航 */
.nav { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 24rpx; padding-top: calc(env(safe-area-inset-top) + 20rpx); background: #fff; }
.nav-left { width: 80rpx; height: 60rpx; display: flex; align-items: center; }
.nav-right { width: 110rpx; display: flex; justify-content: space-between; }
.nav-icon { font-size: 36rpx; }
.nav-title { font-size: 34rpx; font-weight: 700; color: #333; }

/* 功能卡片 */
.func-cards { display: flex; justify-content: space-between; padding: 24rpx; background: #fff; }
.func-card { width: 30%; background: #f7f8fa; border-radius: 20rpx; padding: 30rpx 0; display: flex; flex-direction: column; align-items: center; }
.func-card:active { transform: scale(0.96); background: #f0f1f4; }
.func-icon-wrap { position: relative; width: 96rpx; height: 96rpx; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.func-icon { font-size: 48rpx; }
.badge { position: absolute; top: -8rpx; right: -16rpx; min-width: 44rpx; height: 32rpx; border-radius: 16rpx; display: flex; align-items: center; justify-content: center; padding: 0 8rpx; }
.badge.red { background: #ff5b5b; }
.badge-text { font-size: 20rpx; color: #fff; }
.func-label { margin-top: 16rpx; font-size: 26rpx; color: #333; }

/* Tab */
.tabs { display: flex; position: relative; background: #fff; border-bottom: 1rpx solid #f0f0f0; }
.tab-item { flex: 1; text-align: center; padding: 24rpx 0; }
.tab-text { font-size: 30rpx; color: #666; }
.tab-item.active .tab-text { color: #d98983; font-weight: 600; }
.tab-line { position: absolute; bottom: 0; width: 40%; left: 5%; height: 6rpx; border-radius: 3rpx; background: #d98983; transition: left .25s; }
.tab-line.right { left: 55%; }

/* 列表 */
.list-scroll { flex: 1; overflow: hidden; }
.list-empty { padding: 80rpx 0; text-align: center; }
.empty-text { font-size: 28rpx; color: #bbb; }
</style>
