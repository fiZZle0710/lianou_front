<template>
  <!-- 广场首页：顶部胶囊 Tab（关注｜推荐）+ 推荐双列瀑布流 / 关注单列动态
       设计稿：tif/m_2.tif（推荐）、tif/m_3.tif（关注）；主色 #4E6F66 -->
  <view class="page">
    <CustomNavbar>
      <!-- 左槽：写笔记入口（与底栏 + / 项目中心 + 共用同一份 CreateModal 菜单）
           图标取自设计稿 pptm 的矢量原稿（image18.svg 及其兼容位图），42rpx = 设计值 21.1px -->
      <template #left>
        <view class="nav-icon-btn" @click="showCreateModal = true">
          <image class="nav-icon-img nav-icon-note" src="/static/icon-note.png" mode="aspectFit" />
        </view>
      </template>

      <!-- 中间：胶囊 Tab，顺序同设计稿（关注在前、推荐在后），选中态为主色实心胶囊 -->
      <view class="pill-tabs">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="pill"
          :class="{ 'pill-on': activeTab === tab.key }"
          :data-key="tab.key"
          @click="switchTab"
        >
          <text>{{ tab.label }}</text>
        </view>
      </view>

      <!-- 右槽：搜索（同样取自设计稿 pptm 的矢量原稿 image16.svg），33rpx = 设计值 16.5px -->
      <template #right>
        <view class="nav-icon-btn" @click="goSearch">
          <image class="nav-icon-img nav-icon-search" src="/static/icon-search.png" mode="aspectFit" />
        </view>
      </template>
    </CustomNavbar>

    <!-- 胶囊下方的短横线（设计稿里的下拉指示装饰） -->
    <view class="tab-handle"></view>

    <!-- 演示数据灰标：读接口失败回退 mock 时显示（写操作不回退） -->
    <DemoBadge :show="isDemo" />

    <!-- ===================== 推荐 Tab：双列瀑布流 ===================== -->
    <scroll-view
      v-if="activeTab === 'recommend'"
      class="feed-scroll"
      scroll-y
      :show-scrollbar="false"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <view v-if="list.length" class="waterfall">
        <view v-for="(col, ci) in columns" :key="'col-' + ci" class="waterfall-col">
          <view v-for="item in col" :key="item.id" class="rcard" @click="goDetail(item)">
            <!-- 大图 → 标题（2 行）→ 头像昵称 + 心形（设计稿 m_2） -->
            <SafeImage class="rcard-cover" :src="item.cover" mode="widthFix" />
            <view class="rcard-info">
              <text class="rcard-title">{{ item.title || item.text || '未命名作品' }}</text>
              <view class="rcard-meta">
                <UserAvatar :src="item.avatar" :size="20" />
                <text class="rcard-user">{{ item.username }}</text>
                <view class="rcard-like" @click.stop="toggleLike(item)">
                  <text class="heart" :class="{ 'heart-on': item.isLiked }">{{ item.isLiked ? '♥' : '♡' }}</text>
                </view>
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
    <!-- ===================== 关注 Tab：关注人横条 + 我的关注 + 单列动态 ===================== -->
    <scroll-view
      v-else
      class="feed-scroll"
      scroll-y
      :show-scrollbar="false"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <!-- 关注人横条（10.4 GET /following）：头像 + 在线标 + 右上红点 -->
      <scroll-view class="follow-strip" scroll-x :show-scrollbar="false">
        <view class="follow-row">
          <view v-for="u in following" :key="u.id" class="follow-cell" @click="goUser(u)">
            <view class="follow-avatar">
              <UserAvatar :src="u.avatar" :size="56" />
              <!-- online / hasNew 后端暂无字段，只有接口给了才显示（mock 里有样例） -->
              <view v-if="u.hasNew" class="new-dot"></view>
              <view v-if="u.online" class="online-pill"><text class="online-text">在线</text></view>
            </view>
            <text class="follow-name">{{ u.nickname }}</text>
          </view>
          <view v-if="!following.length" class="strip-empty">
            <text class="strip-empty-text">还没有关注的人</text>
          </view>
        </view>
      </scroll-view>

      <!-- 我的关注 + 全部 / 朋友 -->
      <view class="mhead">
        <text class="mhead-title">我的关注</text>
        <view class="mhead-filter">
          <text class="filter-item" :class="{ 'filter-on': showMode === 'all' }" @click="setShowMode('all')">全部</text>
          <view class="filter-split"></view>
          <text class="filter-item" :class="{ 'filter-on': showMode === 'friend' }" @click="setShowMode('friend')">朋友</text>
        </view>
      </view>

      <view class="plist-block">
        <view v-if="feedList.length" class="plist">
          <view v-for="item in feedList" :key="item.id" class="pcard" @click="goDetail(item)">
            <!-- 头像 / 昵称 / 时间 -->
            <view class="pcard-head">
              <UserAvatar :src="item.avatar" :size="32" />
              <view class="pcard-user">
                <text class="pcard-name">{{ item.username }}</text>
                <text class="pcard-time">{{ item.time }}</text>
              </view>
            </view>

            <!-- 正文：#话题# 用主色高亮并可点进搜索，其余原样（表情走文本） -->
            <text class="pcard-text">
              <text
                v-for="(seg, i) in item.segments"
                :key="i"
                :class="{ 'topic': seg.topic }"
                @click.stop="onSegment(seg)"
              >{{ seg.text }}</text>
            </text>

            <!-- 大图 -->
            <SafeImage v-if="item.images.length" class="pcard-cover" :src="item.images[0]" mode="widthFix" />

            <!-- 关联共创项目轻量入口（设计稿无此项，但后端作品带 project_id，保留可点） -->
            <view v-if="item.projectId" class="pcard-coop" @click.stop="goProject(item)">
              <text class="pcard-coop-text">🤝 关联共创项目 ›</text>
            </view>

            <!-- 赞 / 评论 / 分享 + 更多 -->
            <view class="pcard-actions">
              <view class="paction" @click.stop="toggleLike(item)">
                <text class="paction-icon" :class="{ 'heart-on': item.isLiked }">{{ item.isLiked ? '♥' : '♡' }}</text>
                <text class="paction-text">赞</text>
              </view>
              <view class="paction" @click.stop="goDetail(item)">
                <text class="paction-icon">💬</text>
                <text class="paction-text">评论</text>
              </view>
              <view class="paction" @click.stop="shareFeed(item)">
                <text class="paction-icon">↗</text>
                <text class="paction-text">分享</text>
              </view>
              <view class="paction-more" @click.stop="openMore(item)">
                <text class="paction-more-icon">⋮</text>
              </view>
            </view>
          </view>
        </view>

        <view v-if="!feedList.length" class="list-empty">
          <text v-if="loading" class="empty-text">加载中...</text>
          <text v-else class="empty-text">{{ emptyText }}</text>
        </view>

        <view v-if="feedList.length" class="loading-more">
          <text v-if="loading">加载中...</text>
          <text v-else-if="finished">— 没有更多了 —</text>
        </view>
      </view>
    </scroll-view>

    <!-- 左上角写笔记 → 与底栏 + / 项目中心 + 共用同一份菜单（CreateModal） -->
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
import SafeImage from '@/components/common/SafeImage.vue'
import nav from '@/utils/nav.js'
import { getFeed, getFollowingFeed, shareWork, likeWork, unlikeWork } from '@/api/works.js'
import { getFollowing } from '@/api/user.js'
import { normalizeWork, normalizeFollowUserList } from '@/api/adapter.js'
import { withFallback, unwrapPage } from '@/utils/fallback.js'
import { mockWorks, mockFollowingUsers } from '@/mock/index.js'

// 顺序同设计稿（m_2 / m_3）：关注在前、推荐在后；默认落在推荐
const tabs = [
  { key: 'follow', label: '关注' },
  { key: 'recommend', label: '推荐' }
]

const PAGE_SIZE = 10
const FRIEND_FILL_MAX = 3 // 「朋友」筛选时最多补拉几页

const activeTab = ref('recommend')
const showMode = ref('all')     // 关注 Tab 的「全部 / 朋友」
const showCreateModal = ref(false)
const loading = ref(false)      // 首屏/分页请求中
const refreshing = ref(false)   // 下拉刷新中
const finished = ref(false)     // 没有更多了
const isDemo = ref(false)       // 读接口失败回退到 mock
const page = ref(1)
const total = ref(0)
const list = ref([])
const following = ref([])       // 关注人横条（10.4 GET /following）

// 推荐瀑布流两列：按索引奇偶拆分，卡片标记只在模板里写一次
const columns = computed(() => {
  const cols = [[], []]
  list.value.forEach((item, i) => { cols[i % 2].push(item) })
  return cols
})

// 互关用户 id（「朋友」= 互关）。后端 /works/feed/following 暂无 only_mutual 参数，
// 所以用 10.4 关注列表里的 is_mutual 在前端筛「已加载」的动态
const mutualIds = computed(() => {
  const set = new Set()
  following.value.forEach((u) => { if (u.isMutual) set.add(u.id) })
  return set
})

// 关注 Tab 实际渲染的列表
const feedList = computed(() => (showMode.value === 'friend'
  ? list.value.filter((item) => mutualIds.has(item.authorId))
  : list.value))

const emptyText = computed(() => {
  if (activeTab.value !== 'follow') return '暂时没有内容，下拉刷新试试'
  return showMode.value === 'friend' ? '互关的朋友还没发布新动态' : '关注的伙伴还没发布新动态'
})

/** 正文里的 #话题# 拆成片段（话题段主色高亮 + 可点进搜索）
 *  话题需在**行首或空白之后**，避免把 A#B、C#语言 这类误判成话题 */
function splitTopics(text) {
  const src = String(text || '')
  const re = /(^|\s)(#[^#\s]{1,30}#?)/g
  const out = []
  let last = 0
  let m = re.exec(src)
  while (m) {
    const topicStart = m.index + m[1].length // 跳过话题前的空白
    if (topicStart > last) out.push({ text: src.slice(last, topicStart), topic: false })
    out.push({ text: m[2], topic: true })
    last = topicStart + m[2].length
    m = re.exec(src)
  }
  if (last < src.length) out.push({ text: src.slice(last), topic: false })
  return out.length ? out : [{ text: src, topic: false }]
}

/** 接口作品 → 卡片形状（过滤空图片串，否则会渲染成灰块） */
function toCard(raw) {
  const w = normalizeWork(raw)
  const text = w.text || ''
  return {
    id: w.id,
    authorId: w.authorId || 0,
    avatar: w.avatar || '',
    username: w.username || '匿名用户',
    time: w.time || '',
    title: w.title || '',
    text,
    segments: splitTopics(text),
    // 推荐卡片用封面（后端 cover_url，缺失时退到第一张图）
    cover: w.cover || (w.images || [])[0] || '',
    images: (w.images || []).filter(Boolean),
    likes: w.likes || 0,
    comments: w.comments || 0,
    views: w.views || 0,
    isLiked: !!w.isLiked,
    // 后端作品结构里没有项目标题，只有 project_id → 卡片只显示轻量入口
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

/** 关注人横条（10.4）：失败回退 mock，保证设计稿效果可见 */
async function loadFollowing() {
  const res = await withFallback(
    () => getFollowing({ page: 1, page_size: 20 }),
    () => Object.values(mockFollowingUsers || {}),
    'square/following'
  )
  following.value = normalizeFollowUserList(res.data)
}

// 首次进入加载；从发布页返回时也刷新第一页，避免看不到刚发的内容
onShow(() => {
  loadFeed(true)
})

function onRefresh() {
  refreshing.value = true
  const tasks = [loadFeed(true)]
  if (activeTab.value === 'follow') tasks.push(loadFollowing())
  Promise.all(tasks).finally(() => { refreshing.value = false })
}

function switchTab(e) {
  const key = e.currentTarget.dataset.key
  if (key === activeTab.value) return
  activeTab.value = key
  showMode.value = 'all'
  list.value = []
  finished.value = false
  loadFeed(true)
  // 关注 Tab 需要顶部横条，首次进入时拉一次
  if (key === 'follow' && !following.value.length) loadFollowing()
}

function loadMore() {
  loadFeed(false)
}

/**
 * 「全部 / 朋友」切换。
 * 「朋友」= 互关：后端推流接口没有 mutual 参数，先用互关 id 筛已加载内容，
 * 不够一屏时自动补拉后续页（最多 FRIEND_FILL_MAX 页），避免看起来「空」
 */
async function setShowMode(mode) {
  if (mode === showMode.value) return
  showMode.value = mode
  if (mode !== 'friend') return
  if (!following.value.length) await loadFollowing()
  let guard = 0
  while (guard < FRIEND_FILL_MAX && !finished.value && feedList.value.length < PAGE_SIZE) {
    guard++
    await loadFeed(false)
  }
}

function goDetail(item) {
  if (item && item.id) nav.goDetail('work', item.id)
}

/** 关注人横条点人 → 用户主页 */
function goUser(u) {
  if (u && u.id) nav.goDetail('user', u.id)
}

/** 卡片上的「关联共创项目」入口 */
function goProject(item) {
  if (item && item.projectId) nav.goDetail('project', item.projectId)
}

/** 右上角搜索 */
function goSearch() {
  uni.navigateTo({ url: '/pages/search/index' })
}

/** 正文片段点击：只有 #话题# 才跳搜索 */
function onSegment(seg) {
  if (!seg || !seg.topic) return
  goTopic(seg.text)
}

function goTopic(text) {
  const kw = String(text || '').replace(/^#+/, '').replace(/#+$/, '')
  if (!kw) return
  uni.navigateTo({ url: '/pages/search/index?keyword=' + encodeURIComponent(kw) })
}

/** 点赞 / 取消点赞：乐观更新 + 失败回滚（4003/4004 由 request 层静默忽略） */
async function toggleLike(item) {
  if (!item || !item.id) return
  const next = !item.isLiked
  item.isLiked = next
  item.likes = Math.max(0, (item.likes || 0) + (next ? 1 : -1))
  try {
    await (next ? likeWork(item.id) : unlikeWork(item.id))
  } catch (e) {
    item.isLiked = !next
    item.likes = Math.max(0, (item.likes || 0) + (next ? -1 : 1))
  }
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

/**
 * 关注卡片的「⋮」菜单：
 * - 「不感兴趣」本端隐藏（后端无该接口，退出页面即失效，不做持久化）
 * - 「举报」后端接口未提供（见 docs/给后端的接口问题清单.md），如实提示、不假装成功
 */
function openMore(item) {
  if (!item || !item.id) return
  uni.showActionSheet({
    itemList: ['不感兴趣', '举报'],
    success: (res) => {
      if (res.tapIndex === 0) {
        list.value = list.value.filter((w) => w.id !== item.id)
        uni.showToast({ title: '已减少此类内容', icon: 'none' })
      } else {
        uni.showToast({ title: '举报接口后端暂未提供', icon: 'none' })
      }
    },
    fail: () => {}
  })
}
</script>

<style scoped>
/* 主色 #4E6F66；页面底 #EDEFEE；卡片白；正文 #262626 —— 设计稿 m_2 / m_3 */
.page {
  background: #EDEFEE;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶栏图标按钮（左：写笔记 / 右：搜索） */
.nav-icon-btn {
  width: 40px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 顶栏图标（设计稿 pptm 的矢量原稿，尺寸按设计值 ×2 换算为 rpx） */
.nav-icon-img {
  display: block;
}

.nav-icon-note {
  width: 42rpx;
  height: 42rpx;
}

.nav-icon-search {
  width: 33rpx;
  height: 33rpx;
}

/* 中间胶囊 Tab */
.pill-tabs {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.pill {
  padding: 8rpx 30rpx;
  border-radius: 32rpx;
  font-size: 30rpx;
  color: #262626;
}

.pill-on {
  background: #4E6F66;
  color: #FFFFFF;
  font-weight: 600;
}

/* 胶囊下方的短横线（设计稿里的下拉指示装饰） */
.tab-handle {
  width: 56rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background: #B9C2BE;
  margin: 8rpx auto 0;
  flex-shrink: 0;
}

.feed-scroll {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ---------- 推荐 Tab：双列瀑布流 ---------- */
.waterfall {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 20rpx 180rpx;
}

.waterfall-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.rcard {
  background: #FFFFFF;
  border-radius: 20rpx;
  overflow: hidden;
}

.rcard-cover {
  display: block;
  width: 100%;
  background: #F2F2F2;
}

.rcard-info {
  padding: 16rpx 20rpx 18rpx;
}

.rcard-title {
  font-size: 28rpx;
  color: #262626;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rcard-meta {
  display: flex;
  align-items: center;
  margin-top: 14rpx;
}

.rcard-user {
  flex: 1;
  min-width: 0;
  margin-left: 10rpx;
  font-size: 24rpx;
  color: #8A8F8C;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.rcard-like {
  padding-left: 10rpx;
}

/* 心形 / 点赞图标：未赞描边灰、已赞实心红 */
.heart {
  font-size: 36rpx;
  color: #B0B0B0;
}

.heart-on {
  color: #E64340;
}

/* ---------- 关注 Tab：关注人横条 ---------- */
.follow-strip {
  background: #FFFFFF;
  padding: 20rpx 0 16rpx;
  flex-shrink: 0;
  white-space: nowrap;
}

.follow-row {
  display: inline-flex;
  align-items: flex-start;
  padding: 0 20rpx;
}

.follow-cell {
  width: 140rpx;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.follow-avatar {
  position: relative;
  width: 112rpx;
  height: 112rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 右上红点：有新动态（后端暂无字段，接口给了才显示） */
.new-dot {
  position: absolute;
  top: 2rpx;
  right: 2rpx;
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: #E64340;
  border: 3rpx solid #FFFFFF;
}

/* 在线小标：压在头像下沿（后端暂无字段，接口给了才显示） */
.online-pill {
  position: absolute;
  bottom: 2rpx;
  left: 50%;
  transform: translateX(-50%);
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 0 10rpx;
}

.online-text {
  font-size: 18rpx;
  color: #4E6F66;
  line-height: 26rpx;
}

.follow-name {
  margin-top: 10rpx;
  max-width: 132rpx;
  font-size: 24rpx;
  color: #262626;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.strip-empty {
  padding: 40rpx 0;
}

.strip-empty-text {
  font-size: 24rpx;
  color: #9AA09D;
}

/* ---------- 关注 Tab：我的关注 + 全部 / 朋友 ---------- */
.mhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 20rpx 20rpx;
  background: #FFFFFF;
  border-top: 1rpx solid #E8EAE9;
}

.mhead-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #262626;
}

.mhead-filter {
  display: flex;
  align-items: center;
}

.filter-item {
  padding: 0 16rpx;
  font-size: 28rpx;
  color: #8A8F8C;
}

.filter-on {
  color: #262626;
  font-weight: 700;
}

.filter-split {
  width: 1rpx;
  height: 28rpx;
  background: #DADDDC;
}

/* ---------- 关注 Tab：单列动态卡片 ---------- */
.plist-block {
  background: #FFFFFF;
  padding-bottom: 180rpx;
}

.pcard {
  padding: 24rpx 20rpx 8rpx;
  border-bottom: 1rpx solid #EEF0EF;
}

.pcard-head {
  display: flex;
  align-items: center;
}

.pcard-user {
  flex: 1;
  min-width: 0;
  margin-left: 16rpx;
}

.pcard-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #262626;
}

.pcard-time {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #9AA09D;
}

.pcard-text {
  display: block;
  margin: 16rpx 0;
  font-size: 28rpx;
  color: #262626;
  line-height: 1.6;
}

/* #话题# 用主色高亮 */
.topic {
  color: #4E6F66;
}

.pcard-cover {
  display: block;
  width: 100%;
  border-radius: 16rpx;
  background: #F2F2F2;
}

/* 关联共创项目轻量入口（设计稿没有，但后端作品带 project_id，保留入口） */
.pcard-coop {
  display: inline-flex;
  align-items: center;
  margin-top: 16rpx;
  padding: 6rpx 18rpx;
  background: #F1F5F3;
  border-radius: 24rpx;
}

.pcard-coop-text {
  font-size: 22rpx;
  color: #4E6F66;
}

.pcard-actions {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
}

.paction {
  display: flex;
  align-items: center;
  margin-right: 48rpx;
}

.paction-icon {
  font-size: 30rpx;
  color: #4A4A4A;
}

.paction-text {
  margin-left: 8rpx;
  font-size: 26rpx;
  color: #6B6F6D;
}

.paction-more {
  margin-left: auto;
  padding: 0 8rpx;
}

.paction-more-icon {
  font-size: 34rpx;
  color: #6B6F6D;
}

/* 加载更多 / 空态 */
.loading-more {
  text-align: center;
  padding: 30rpx;
  color: #C4C9C7;
  font-size: 24rpx;
}

.list-empty {
  text-align: center;
  padding: 120rpx 40rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #B4B9B7;
}
</style>





