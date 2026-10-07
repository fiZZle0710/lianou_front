<template>
  <!-- 广场首页（推荐/关注Tab切换 + 双列瀑布流） -->
  <view class="page">
    <CustomNavbar title="广场">
      <template #right>
        <view class="nav-btn" @click="showCreateModal = true">
          <text class="nav-icon publish-icon">+</text>
        </view>
      </template>
    </CustomNavbar>

    <!-- 顶部Tab切换 -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        :data-key="tab.key"
        @click="switchTab"
      >
        <text>{{ tab.label }}</text>
        <view v-if="activeTab === tab.key" class="tab-underline"></view>
      </view>
    </view>

    <!-- 瀑布流内容 -->
    <!-- 演示数据灰标：读接口失败回退 mock 时显示（写操作不回退） -->
    <DemoBadge :show="isDemo" />

    <scroll-view
      class="feed-scroll"
      scroll-y
      :show-scrollbar="false"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <view v-if="list.length" class="waterfall">
        <view
          v-for="(col, ci) in columns"
          :key="'col-' + ci"
          class="waterfall-col"
        >
          <view
            v-for="item in col"
            :key="item.id"
            class="feed-card"
            @click="goDetail(item)"
          >
            <!-- 用户头像+信息 -->
            <view class="card-header">
              <UserAvatar :src="item.avatar" size="small" />
              <view class="card-user-info">
                <text class="card-username">{{ item.username }}</text>
                <text class="card-time">{{ item.time }}</text>
              </view>
            </view>

            <!-- 动态内容 -->
            <view class="card-body">
              <text class="card-text">{{ item.text }}</text>
              <view v-if="item.images.length" class="card-images">
                <image
                  v-for="(img, i) in item.images.slice(0, 1)"
                  :key="i"
                  :src="img"
                  mode="aspectFill"
                  class="card-img"
                />
              </view>
            </view>

            <!-- 关联共创项目：后端作品结构里没有 coop 招募卡片（adapter 恒 null），
                 有 project_id 时降级成轻量入口，点击进项目详情 -->
            <view v-if="item.projectId" class="coop-card" @click.stop="goProject(item)">
              <view class="coop-header">
                <text class="coop-icon">🤝</text>
                <text class="coop-title">关联共创项目</text>
              </view>
              <text class="coop-topic">{{ item.projectTitle || '项目 #' + item.projectId }}</text>
              <view class="coop-meta">
                <text class="coop-count">查看项目详情</text>
                <text class="coop-deadline">›</text>
              </view>
            </view>

            <!-- 互动区 -->
            <view class="card-actions">
              <view class="action-item">
                <text class="action-icon">💬</text>
                <text class="action-count">{{ item.comments }}</text>
              </view>
              <view class="action-item">
                <text class="action-icon">👁</text>
                <text class="action-count">{{ item.views }}</text>
              </view>
              <view class="action-item" @click.stop="shareFeed(item)">
                <text class="action-icon">🔗</text>
                <text class="action-count">分享</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空态 / 首屏加载中 -->
      <view v-if="!list.length" class="list-empty">
        <text v-if="loading" class="empty-text">加载中...</text>
        <text v-else class="empty-text">{{ emptyText }}</text>
      </view>

      <view v-if="list.length" class="loading-more">
        <text v-if="loading">加载中...</text>
        <text v-else-if="finished">— 没有更多了 —</text>
      </view>
    </scroll-view>

    <!-- 右上角加号 → 与底栏 + / 项目中心 + 共用同一份菜单（CreateModal） -->
    <CreateModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @select="handleCreate"
    />

  </view>
    <CustomTabbar />
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CustomNavbar from '@/components/common/CustomNavbar.vue'
import UserAvatar from '@/components/common/UserAvatar.vue'
import CustomTabbar from '@/components/common/CustomTabbar.vue'
import CreateModal from '@/components/common/CreateModal.vue'
import DemoBadge from '@/components/common/DemoBadge.vue'
import nav from '@/utils/nav.js'
import { getFeed, getFollowingFeed, shareWork } from '@/api/works.js'
import { normalizeWork } from '@/api/adapter.js'
import { withFallback, unwrapPage } from '@/utils/fallback.js'
import { mockWorks } from '@/mock/index.js'

const tabs = [
  { key: 'recommend', label: '推荐' },
  { key: 'follow', label: '关注' }
]

const PAGE_SIZE = 10

const activeTab = ref('recommend')
const showCreateModal = ref(false)
const loading = ref(false)     // 首屏/分页请求中
const refreshing = ref(false)  // 下拉刷新中
const finished = ref(false)    // 没有更多了
const isDemo = ref(false)      // 读接口失败回退到 mock
const page = ref(1)
const total = ref(0)
const list = ref([])

// 瀑布流两列：按索引奇偶拆分，卡片标记只在模板里写一次
const columns = computed(() => {
  const cols = [[], []]
  list.value.forEach((item, i) => { cols[i % 2].push(item) })
  return cols
})

const emptyText = computed(() => (activeTab.value === 'follow'
  ? '关注的伙伴还没发布新动态'
  : '暂时没有内容，下拉刷新试试'))

/** 接口作品 → 卡片形状（过滤空图片串，否则会渲染成灰块） */
function toCard(raw) {
  const w = normalizeWork(raw)
  return {
    id: w.id,
    avatar: w.avatar || '',
    username: w.username || '匿名用户',
    time: w.time || '',
    text: w.text || '',
    images: (w.images || []).filter(Boolean),
    comments: w.comments || 0,
    views: w.views || 0,
    // 后端作品结构里没有项目标题，只有 project_id → 卡片只显示「关联共创项目」入口
    projectId: w.projectId || 0,
    projectTitle: ''
  }
}

/** 回退数据：mockWorks 是按 id 索引的对象，取值数组（后端未就绪时页面仍可用） */
function mockList() {
  return Object.values(mockWorks || {}).map(toCard)
}

/** 拉一页；reset=true 用于切 Tab / 下拉刷新 */
async function loadFeed(reset = false) {
  if (loading.value) return
  if (!reset && finished.value) return
  if (reset) {
    page.value = 1
    finished.value = false
  }
  loading.value = true
  try {
    const fetcher = () => (activeTab.value === 'follow'
      ? getFollowingFeed({ page: page.value, page_size: PAGE_SIZE })
      : getFeed({ page: page.value, page_size: PAGE_SIZE, sort: 'latest' }))
    const res = await withFallback(fetcher, mockList, 'square/feed:' + activeTab.value)
    const p = unwrapPage(res.data)
    const cards = p.list.map(toCard)
    list.value = reset ? cards : list.value.concat(cards)
    total.value = p.total || list.value.length
    isDemo.value = res.isFallback
    // 返回不足一页，或已收满 total → 没有更多
    finished.value = cards.length < PAGE_SIZE || list.value.length >= total.value
    page.value += 1
  } finally {
    loading.value = false
  }
}

// 首次进入加载；从发布页返回时也刷新第一页，避免看不到刚发的内容
onShow(() => {
  loadFeed(true)
})

function onRefresh() {
  refreshing.value = true
  loadFeed(true).finally(() => { refreshing.value = false })
}

function switchTab(e) {
  const key = e.currentTarget.dataset.key
  if (key === activeTab.value) return
  activeTab.value = key
  list.value = []
  finished.value = false
  loadFeed(true)
}

function loadMore() {
  loadFeed(false)
}

function goDetail(item) {
  if (item && item.id) nav.goDetail('work', item.id)
}

/** 卡片上的「关联共创项目」入口 */
function goProject(item) {
  if (item && item.projectId) nav.goDetail('project', item.projectId)
}

// 菜单 key → 页面路由统一维护在 utils/nav.js 的 goCreate()
function handleCreate(key) {
  showCreateModal.value = false
  nav.goCreate(key)
}

/**
 * 分享：后端 3.15 只做计数（分享记录表后端明确暂缓），
 * 这里据实提示「已记录分享」，不假装唤起分享面板
 */
async function shareFeed(item) {
  if (!item || !item.id) return
  try {
    await shareWork(item.id)
    uni.showToast({ title: '已记录分享', icon: 'none' })
  } catch (e) {
    // 失败提示由 src/utils/request.js 统一弹出
  }
}
</script>

<style scoped>
.page {
  background: #f5f5f5;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.publish-icon {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

/* Tab栏 */
.tab-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80rpx;
  background: #fff;
  gap: 60rpx;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
  z-index: 10;
}

.tab-item {
  position: relative;
  font-size: 28rpx;
  color: #666;
  padding: 0 10rpx;
  height: 100%;
  display: flex;
  align-items: center;
}

.tab-item.active {
  color: #333;
  font-weight: 600;
}

.tab-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: #333;
  border-radius: 2rpx;
}

/* 瀑布流 */
.feed-scroll {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.waterfall {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 16rpx 180rpx;
}

.waterfall-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

/* 动态卡片 */
.feed-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.card-header {
  display: flex;
  align-items: center;
  padding: 20rpx 20rpx 0;
  gap: 12rpx;
}

.card-user-info {
  flex: 1;
  min-width: 0;
}

.card-username {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.card-time {
  font-size: 20rpx;
  color: #999;
  margin-top: 2rpx;
  display: block;
}

.card-body {
  padding: 16rpx 20rpx;
}

.card-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
}

.card-images {
  margin-top: 12rpx;
}

.card-img {
  width: 100%;
  height: 280rpx;
  border-radius: 8rpx;
  background: #f0f0f0;
}

/* 共创招募卡片 */
.coop-card {
  margin: 12rpx 20rpx 4rpx;
  padding: 16rpx;
  background: #f7f8ff;
  border-radius: 12rpx;
  border: 1px solid #e8ecff;
}

.coop-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.coop-icon {
  font-size: 24rpx;
}

.coop-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #4455ee;
}

.coop-topic {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}

.coop-meta {
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: #999;
}

/* 互动区 */
.card-actions {
  display: flex;
  gap: 24rpx;
  padding: 16rpx 20rpx;
  border-top: 1px solid #f5f5f5;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.action-icon {
  font-size: 24rpx;
}

.action-count {
  font-size: 22rpx;
  color: #999;
}

/* 加载更多 */
.loading-more {
  text-align: center;
  padding: 30rpx;
  color: #ccc;
  font-size: 24rpx;
}

/* 空态 */
.list-empty {
  text-align: center;
  padding: 120rpx 40rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #bbb;
}
</style>
