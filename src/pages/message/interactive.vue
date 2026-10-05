<template>
  <!-- 互动消息 / 待办事项（二级页，?tab=todo 切待办） -->
  <view class="page">
    <!-- 顶部导航 -->
    <view class="nav">
      <view class="nav-back" @click="goBack"><text class="back-icon">←</text></view>
      <text class="nav-title">{{ pageTitle }}</text>
      <view class="nav-right"></view>
    </view>

    <DemoBadge :show="isDemo" />

    <!-- 子类型筛选（互动：全部/赞/评论/关注；待办：全部/入队申请） -->
    <view class="tabs">
      <view
        v-for="t in subTabs"
        :key="t.key"
        class="tab-item"
        :class="{ active: subtype === t.key }"
        @click="switchSubtype(t.key)"
      >
        <text class="tab-text">{{ t.label }}</text>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="list-scroll"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <view class="row" v-for="it in items" :key="it.id" @click="onRow(it)">
        <!-- 头像（无头像时组件内首字母兜底） -->
        <UserAvatar :src="it.avatar" size="small" />

        <!-- 中部内容 -->
        <view class="center">
          <view class="line1">
            <text class="name">{{ it.nickname || '系统通知' }}</text>
            <text class="act">{{ it.actionText }}</text>
            <text v-if="it.subtype === 'like'" class="act-emoji">❤️</text>
          </view>

          <!-- 关注：回关按钮（10.1） -->
          <view v-if="it.subtype === 'follow'" class="follow-row">
            <view class="follow-btn" @click.stop="followBack(it)">
              <text class="follow-btn-t">{{ it.followed ? '已回关' : '回关' }}</text>
            </view>
          </view>

          <!-- 评论：评论原文 + 回复入口 -->
          <view v-if="it.subtype === 'comment'" class="comment-box">
            <text class="comment-orig">{{ it.content || '（评论内容为空）' }}</text>
            <view class="reply-btn" @click.stop="reply(it)">
              <text class="reply-btn-t">回复</text>
            </view>
          </view>

          <!-- 待办：去项目申请页处理 -->
          <view v-if="isTodoMode" class="comment-box">
            <text class="comment-orig">{{ it.content || '点击去处理' }}</text>
          </view>

          <text class="time">{{ it.time }}</text>
        </view>

        <!-- 右侧作品缩略图（互动通知带 related_work 快照；9.3 待办契约无此快照，故换引导文案） -->
        <view class="thumb" v-if="!isTodoMode" @click.stop="goWork(it)">
          <image v-if="it.cover" :src="it.cover" mode="aspectFill" class="thumb-img" />
          <text v-else class="thumb-icon">🎬</text>
        </view>
        <text v-else class="thumb-go">去处理 ›</text>
      </view>

      <view class="list-empty" v-if="!items.length">
        <text class="empty-text">{{ loading ? '加载中...' : emptyText }}</text>
      </view>
      <view class="list-empty" v-else-if="loading">
        <text class="empty-text">加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>
<script setup>
import { ref, computed } from "vue"
import { onLoad } from "@dcloudio/uni-app"
import UserAvatar from "@/components/common/UserAvatar.vue"
import DemoBadge from "@/components/common/DemoBadge.vue"
import nav from '@/utils/nav.js'
import { getInteractionNotifications, getTodoNotifications } from '@/api/chat.js'
import { normalizeNotification } from '@/api/adapter.js'
import { withFallback, unwrapPage } from '@/utils/fallback.js'
import { followUser } from '@/api/user.js'

const PAGE_SIZE = 20

// 两种模式：互动（9.2，subtype: like/comment/follow）与待办（9.3，subtype: apply）
const MODES = {
  interactive: {
    title: '互动消息',
    empty: '暂无互动消息',
    tabs: [
      { key: '', label: '全部' },
      { key: 'like', label: '赞' },
      { key: 'comment', label: '评论' },
      { key: 'follow', label: '关注' }
    ]
  },
  todo: {
    // 后端 9.3 只支持 subtype=apply（退出/被移出暂无接口，故不列出）
    title: '待办事项',
    empty: '暂无待办事项',
    tabs: [
      { key: '', label: '全部' },
      { key: 'apply', label: '入队申请' }
    ]
  }
}

const mode = ref('interactive')
const subtype = ref('')
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const isDemo = ref(false)
const page = ref(1)
const total = ref(0)
const items = ref([])

const isTodoMode = computed(() => mode.value === 'todo')
const subTabs = computed(() => MODES[mode.value].tabs)
const pageTitle = computed(() => MODES[mode.value].title)
const emptyText = computed(() => MODES[mode.value].empty)

/** 通知 → 行视图（subtypeText 由适配层按 9.x 子类型给出中文，如「赞了你」） */
function toItem(raw) {
  const n = normalizeNotification(raw)
  const work = n.relatedWork
  return {
    id: n.id,
    subtype: n.subtype,
    actionText: n.subtypeText || n.title || '有新消息',
    nickname: n.nickname || '',
    senderId: n.senderId,
    avatar: n.avatar || '',
    content: n.content || '',
    relatedId: n.relatedId,
    relatedType: n.relatedType,
    cover: work ? work.cover : '',
    followed: false,
    time: n.time || ''
  }
}

/** 回退数据（后端未就绪时页面仍可用；收藏分支后端无表无接口，已按契约移除） */
function mockItems() {
  return [
    { id: 'm1', subtype: 'like', actionText: '赞了你', nickname: '罗大侠', senderId: 1, avatar: '', content: '', relatedId: 1, cover: '', followed: false, time: '3 分钟前' },
    { id: 'm2', subtype: 'comment', actionText: '评论了你', nickname: '剪辑达人', senderId: 5, avatar: '', content: '这个创意真的很棒！', relatedId: 4, cover: '', followed: false, time: '1 小时前' },
    { id: 'm3', subtype: 'follow', actionText: '关注了你', nickname: '创意设计师', senderId: 3, avatar: '', content: '', relatedId: 0, cover: '', followed: false, time: '20 分钟前' }
  ]
}

/** 拉一页；reset=true 用于切换子类型 / 下拉刷新 */
async function loadItems(reset = false) {
  if (loading.value) return
  if (!reset && finished.value) return
  if (reset) {
    page.value = 1
    finished.value = false
  }
  loading.value = true
  try {
    const params = { page: page.value, page_size: PAGE_SIZE }
    if (subtype.value) params.subtype = subtype.value
    const fetcher = () => (isTodoMode.value
      ? getTodoNotifications(params)
      : getInteractionNotifications(params))
    const res = await withFallback(fetcher, mockItems, 'notification/' + mode.value)
    const p = unwrapPage(res.data)
    const list = p.list.map(toItem)
    items.value = reset ? list : items.value.concat(list)
    total.value = p.total || items.value.length
    isDemo.value = res.isFallback
    finished.value = list.length < PAGE_SIZE || items.value.length >= total.value
    page.value += 1
  } finally {
    loading.value = false
  }
}

onLoad((options) => {
  mode.value = (options && options.tab === 'todo') ? 'todo' : 'interactive'
  subtype.value = ''
  loadItems(true)
})

function onRefresh() {
  refreshing.value = true
  loadItems(true).finally(() => { refreshing.value = false })
}

function loadMore() {
  loadItems(false)
}

function switchSubtype(key) {
  if (key === subtype.value) return
  subtype.value = key
  items.value = []
  finished.value = false
  loadItems(true)
}

function goBack() { uni.navigateBack() }

/** 回关（10.1）：写操作不回退 mock，失败由 request 层提示 */
async function followBack(it) {
  if (!it.senderId) {
    uni.showToast({ title: '缺少用户信息', icon: 'none' })
    return
  }
  if (it.followed) {
    uni.showToast({ title: '已回关', icon: 'none' })
    return
  }
  try {
    await followUser(it.senderId)
    it.followed = true
    uni.showToast({ title: '已回关', icon: 'none' })
  } catch (e) {
    // 失败提示由 request.js 统一弹出（3006 已关注等由后端 message 说明）
  }
}

// 回复：进作品详情页评论区（详情页有评论输入入口；暂不支持 focus 参数）
function reply(it) {
  if (!it.relatedId) {
    uni.showToast({ title: '该通知没有关联作品', icon: 'none' })
    return
  }
  nav.goDetail('work', it.relatedId)
}

function goWork(it) {
  if (it.relatedId && it.relatedType !== 'project') nav.goDetail('work', it.relatedId)
}

/** 待办：跳该项目的申请审批页（apply.vue 认 ?id=项目ID） */
function goTodo(it) {
  if (!it.relatedId) {
    uni.showToast({ title: '该待办没有关联项目', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/project/apply?id=' + it.relatedId })
}

// 点击整行：待办去处理，互动进关联作品
function onRow(it) {
  if (isTodoMode.value) {
    goTodo(it)
  } else if (it.relatedId) {
    nav.goDetail('work', it.relatedId)
  }
}
</script>

<style scoped>
.page { background: #f5f6fa; min-height: 100vh; }
.nav { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 24rpx; padding-top: calc(env(safe-area-inset-top) + 20rpx); background: #fff; }
.nav-back { width: 70rpx; height: 60rpx; display: flex; align-items: center; }
.back-icon { font-size: 40rpx; color: #333; }
.nav-title { font-size: 34rpx; font-weight: 700; color: #333; }
.nav-right { width: 70rpx; }
/* 子类型筛选 */
.tabs { display: flex; align-items: center; padding: 16rpx 16rpx 0; gap: 12rpx; background: #f5f6fa; }
.tab-item { padding: 10rpx 26rpx; border-radius: 30rpx; background: #fff; }
.tab-item.active { background: #fdece8; }
.tab-text { font-size: 26rpx; color: #666; }
.tab-item.active .tab-text { color: #d98983; font-weight: 600; }

.list-scroll { box-sizing: border-box; padding: 16rpx; height: calc(100vh - 170rpx); }
/* 空态 / 加载中 */
.list-empty { padding: 80rpx 0; text-align: center; }
.empty-text { font-size: 26rpx; color: #bbb; }
.row { display: flex; align-items: flex-start; background: #fff; border-radius: 20rpx; padding: 24rpx; margin-bottom: 16rpx; }
.thumb-img { width: 100%; height: 100%; border-radius: 14rpx; }
.center { flex: 1; min-width: 0; margin-left: 20rpx; }
.line1 { display: flex; align-items: center; }
.name { font-size: 30rpx; color: #333; font-weight: 500; }
.act { font-size: 26rpx; color: #666; margin-left: 8rpx; }
.act-emoji { margin-left: 6rpx; }
.time { font-size: 22rpx; color: #bbb; display: block; margin-top: 12rpx; }
.follow-btn { margin-top: 10rpx; display: inline-flex; padding: 10rpx 28rpx; border-radius: 30rpx; background: #d9a29e; }
.follow-btn:active { opacity: .8; }
.follow-btn-t { font-size: 26rpx; color: #fff; }
.comment-box { margin-top: 12rpx; background: #f5f6fa; border-radius: 14rpx; padding: 16rpx; }
.comment-orig { font-size: 26rpx; color: #555; }
.reply-btn { margin-top: 12rpx; display: inline-flex; padding: 8rpx 24rpx; border-radius: 26rpx; border: 2rpx solid #d9a29e; }
.reply-btn-t { font-size: 24rpx; color: #d98983; }
.thumb { width: 120rpx; height: 120rpx; border-radius: 14rpx; background: #eef0f4; margin-left: 16rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.thumb-go { font-size: 24rpx; color: #d9a29e; margin-left: 16rpx; margin-top: 8rpx; flex-shrink: 0; }
.thumb-icon { font-size: 44rpx; }
</style>
