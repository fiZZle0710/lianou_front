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
            <image class="nav-icon" src="/static/icons/icon-search-thin.svg" mode="aspectFit" />
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
  readAllNotifications,
  readConversation,
  readGroup
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

// 扫把清理：cleaned=true 后按状态过滤会话（普通会话保留，避免误删聊天）
const cleaned = ref(false)

/** 是否保留某条消息（仅对两类项目审核消息做清理）
 *  分类来自会话的 category / audit_status / needs_action 字段：真实接口需要在
 *  会话里下发这些字段（或由后端按消息类型判定）；演示数据里已带，可直接验证效果。
 *  未带分类的普通聊天一律保留，避免误删。 */
function shouldKeep(item) {
  if (!cleaned.value) return true
  // 受他人审核：仅保留「审核中」和「未读（右上角小红点）」
  if (item.category === 'await-others') {
    return item.auditStatus === 'reviewing' || item.unread > 0
  }
  // 要自己审核：仅保留需要操作的对应消息（待审）
  if (item.category === 'need-my-review') {
    return item.needsAction === true
  }
  return true
}

const currentList = computed(() => {
  const base = activeTab.value === "contact" ? contactList.value : groupList.value
  return cleaned.value ? base.filter(shouldKeep) : base
})

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
    muted: !!c.muted,
    // 扫把清理用的分类：await-others=受他人审核 / need-my-review=要自己审核 / normal=普通会话
    category: raw.category || 'normal',
    auditStatus: raw.audit_status || raw.auditStatus || '',
    needsAction: !!raw.needs_action
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
    muted: !!g.muted,
    category: raw.category || 'normal',
    auditStatus: raw.audit_status || raw.auditStatus || '',
    needsAction: !!raw.needs_action
  }
}

/** 回退数据（后端未就绪时页面仍可用）：mockUsers / mockGroups 都是按 id 索引的对象。
 *  返回「接口原始形状」，由 loadList 里的 toContactItem / toGroupItem 统一归一化一次
 *  （不要再在工厂里调 toContactItem，否则会被二次归一化丢掉 preview / 分类字段）。
 *  演示模式里混入「受他人审核 / 要自己审核」两类项目消息，供右上角扫把按状态清理演示。 */
function mockContactList() {
  const rows = [
    { u: 1, category: 'await-others',   auditStatus: 'reviewing', needsAction: false, unread: 0, preview: '桂花糕 项目的申请 · 审核中' },
    { u: 2, category: 'await-others',   auditStatus: 'approved',  needsAction: false, unread: 1, preview: '铁皮青蛙 项目的申请 · 已通过' },
    { u: 3, category: 'need-my-review', auditStatus: 'pending',   needsAction: true,  unread: 1, preview: '纸鸢 申请加入你的项目' },
    { u: 4, category: 'await-others',   auditStatus: 'expired',   needsAction: false, unread: 0, preview: '罗大侠 项目的申请 · 已过期' },
    { u: 5, category: 'await-others',   auditStatus: 'rejected',  needsAction: false, unread: 0, preview: '纸鸢 项目的申请 · 未通过' },
    { u: 6, category: 'need-my-review', auditStatus: 'approved',  needsAction: false, unread: 0, preview: '桂花糕 的申请已处理' },
    { u: 7, category: 'normal',         auditStatus: '',          needsAction: false, unread: 0, preview: '暂无消息' }
  ]
  return rows.map((r) => ({
    conversation_id: 'mock-' + r.u,
    contact: (mockUsers || {})[r.u] || {},
    last_message: r.preview,
    last_message_at: null,
    unread_count: r.unread,
    category: r.category,
    audit_status: r.auditStatus,
    needs_action: r.needsAction
  }))
}
function mockGroupList() {
  return Object.keys(mockGroups || {}).map((gid) => ({
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
// 点开详情即清除右上角小红点（未读），变为已读状态
function goChat(item) {
  if (item.unread > 0) {
    item.unread = 0
    // 真实联调时调后端标记已读；演示模式只清本地，避免无后端时报网络错误
    if (!isDemo.value) {
      const task = item.type === 'group' ? readGroup(item.id) : readConversation(item.id)
      if (task && typeof task.catch === 'function') task.catch(() => {})
    }
  }
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

/** 右上角扫把：按状态清理消息。
 *  受他人审核 → 仅保留「审核中」+「未读（小红点，点开详情后变已读）」；
 *  要自己审核 → 仅保留「需要操作」的对应消息；普通聊天不清。 */
async function onClean() {
  const before = currentList.value.length
  cleaned.value = true
  try {
    // 9.5 批量已读：清掉三宫格未读角标（演示模式无后端，跳过请求避免报错）
    if (!isDemo.value) await readAllNotifications()
    unread.value = { official: 0, interaction: 0, todo: 0 }
  } catch (e) {
    // 失败提示由 request.js 统一弹出
  }
  const removed = Math.max(0, before - currentList.value.length)
  uni.showToast({
    title: removed ? `已清理 ${removed} 条消息` : '没有可清理的消息',
    icon: 'none'
  })
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
  padding-top: calc(env(safe-area-inset-top) + var(--sbh-blank, 0px) + 12rpx);
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
}
.tab-item.active .tab-text { color: #1f1f1f; font-weight: 700; }

/* 列表 */
.list-scroll { flex: 1; overflow: hidden; }
.list-empty { padding: 80rpx 0; text-align: center; }
.empty-text { font-size: 28rpx; color: #bbb; }
</style>
