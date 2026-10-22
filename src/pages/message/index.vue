<template>
  <!-- 我的消息（一级页）—— 视觉对齐 tif/消息.tif -->
  <view class="page">
    <view class="page-inner">
      <!-- 顶部导航：客服 + 标题 + 清理/搜索 -->
      <view class="nav">
        <view class="nav-side" @click="goService">
          <image class="nav-icon" src="/static/icons/icon-headset.svg" mode="aspectFit" />
        </view>
        <text class="nav-title">我的消息</text>
        <view class="nav-side right">
          <view class="nav-btn" @click="onClean">
            <image class="nav-icon" src="/static/icons/icon-broom.svg" mode="aspectFit" />
          </view>
          <view class="nav-btn" @click="onSearch">
            <image class="nav-icon" src="/static/icons/icon-search-line.svg" mode="aspectFit" />
          </view>
        </view>
      </view>

      <!-- 演示数据灰标：接口回退到 mock 时显示（放三宫格上方右侧，避免压住图标） -->
      <view v-if="isDemo" class="demo-row">
        <DemoBadge :show="isDemo" position="inline" />
      </view>

      <!-- 顶部三个功能入口（稿上为深绿圆角方块 + 白色线性图标） -->
      <view class="func-cards">
        <view class="func-card" @click="goOfficial">
          <view class="func-tile">
            <image class="tile-icon" src="/static/icons/icon-tile-official.svg" mode="aspectFit" />
            <view v-if="unread.official > 0" class="tile-badge">
              <text class="tile-badge-t">{{ badgeText(unread.official) }}</text>
            </view>
          </view>
          <text class="func-label">官方消息</text>
        </view>
        <view class="func-card" @click="goInteractive">
          <view class="func-tile">
            <image class="tile-icon" src="/static/icons/icon-tile-interact.svg" mode="aspectFit" />
            <view v-if="unread.interaction > 0" class="tile-badge">
              <text class="tile-badge-t">{{ badgeText(unread.interaction) }}</text>
            </view>
          </view>
          <text class="func-label">互动消息</text>
        </view>
        <view class="func-card" @click="goTodo">
          <view class="func-tile">
            <image class="tile-icon" src="/static/icons/icon-tile-todo.svg" mode="aspectFit" />
            <view v-if="unread.todo > 0" class="tile-badge">
              <text class="tile-badge-t">{{ badgeText(unread.todo) }}</text>
            </view>
          </view>
          <text class="func-label">待办事项</text>
        </view>
      </view>

      <!-- 联系人 / 群聊 -->
      <view class="tabs">
        <view class="tab-item" :class="{ active: activeTab === 'contact' }" @click="switchTab('contact')">
          <text class="tab-text">联系人</text>
        </view>
        <view class="tab-item" :class="{ active: activeTab === 'group' }" @click="switchTab('group')">
          <text class="tab-text">群聊</text>
        </view>
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
          :muted="item.muted"
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
    preview: c.lastMessage || '暂无消息',
    time: c.time || '',
    unread: c.unreadCount || 0,
    avatar: c.avatar || '',
    muted: !!c.muted
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
    preview: g.lastMessage || '暂无消息',
    time: g.time || '',
    unread: g.unreadCount || 0,
    avatar: g.avatar || '',
    muted: !!g.muted
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

/** 一键已读：9.5 批量已读（不传 type = 全部） */
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
.page { background: #fff; min-height: 100vh; }
.page-inner { display: flex; flex-direction: column; height: 100vh; }

/* 导航 */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 28rpx;
  padding-top: calc(env(safe-area-inset-top) + 12rpx);
  background: #fff;
}
.nav-side { width: 80rpx; height: 64rpx; display: flex; align-items: center; }
.nav-side.right { width: auto; justify-content: flex-end; }
.nav-btn { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; margin-left: 8rpx; }
.nav-icon { width: 44rpx; height: 44rpx; }
.nav-title {
  font-size: 32rpx;
  color: #1f1f1f;
  font-weight: 700;
  font-family: "Songti SC", "STSong", "Noto Serif SC", "Source Han Serif SC", serif;
}

/* 三个功能入口 */
.demo-row { display: flex; justify-content: flex-end; padding: 8rpx 28rpx 0; }
.func-cards { display: flex; justify-content: space-between; padding: 8rpx 130rpx 0; }
.func-card { display: flex; flex-direction: column; align-items: center; }
.func-tile {
  position: relative;
  width: 102rpx;
  height: 102rpx;
  border-radius: 24rpx;
  background: #4e6f66;
  display: flex;
  align-items: center;
  justify-content: center;
}
.func-card:active .func-tile { opacity: .9; }
.tile-icon { width: 56rpx; height: 56rpx; }
.tile-badge {
  position: absolute;
  top: -14rpx;
  right: -10rpx;
  min-width: 38rpx;
  height: 38rpx;
  border-radius: 19rpx;
  padding: 0 6rpx;
  background: #df4c41;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid #fff;
  box-sizing: border-box;
}
.tile-badge-t { font-size: 18rpx; color: #fff; }
.func-label { margin-top: 16rpx; font-size: 24rpx; color: #3f3f3f; }

/* 联系人 / 群聊 */
.tabs {
  display: flex;
  align-items: flex-end;
  padding: 26rpx 28rpx 14rpx;
  margin-top: 20rpx;
  border-bottom: 1rpx solid #ededed;
}
.tab-item { margin-right: 32rpx; }
.tab-text {
  font-size: 34rpx;
  color: #a0a0a0;
  font-family: "Songti SC", "STSong", "Noto Serif SC", "Source Han Serif SC", serif;
}
.tab-item.active .tab-text { color: #1f1f1f; font-weight: 700; }

/* 列表 */
.list-scroll { flex: 1; overflow: hidden; }
.list-empty { padding: 80rpx 0; text-align: center; }
.empty-text { font-size: 28rpx; color: #bbb; }
</style>
