<template>
  <!-- 我的项目（加号 →「发起项目」的落地页）
       设计稿：png/iPhone 17 - 1.png（402×874，按画板 402px ↔ 750rpx 换算，1px ≈ 1.8657rpx）
       结构：导航「我的项目」+ 返回 ← ｜ 2 列封面卡网格 ｜ 末尾「添加新项目」占位卡 -->
  <view class="page">
    <!-- 页面背景：设计稿导出图（402×874 模糊底图，纯背景无内容，覆盖整屏含状态栏/导航区）
         同名约定见 components/common/CreateModal.vue 的 /static/create-sheet-bg.png -->
    <image class="page-bg" src="/static/mine-grid-bg.png" mode="scaleToFill" />

    <!-- 顶部导航（设计稿：透明底，不用白色导航条）
         返回键 34×34 → left 24px / top 66px（= 状态栏 + (48-34)/2，内容区 48px）
         标题「我的项目」#434645 / Regular(400) / 22px，屏幕水平居中 -->
    <view class="nav">
      <view :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="nav-content">
        <view class="nav-back" @click="goBack">
          <text class="nav-back-icon">←</text>
        </view>
        <text class="nav-title">我的项目</text>
      </view>
    </view>

    <!-- 搜索框（设计稿：360×56 / 圆角 28 / 白底 opacity 0.3 / 左侧放大镜 / gap 4px） -->
    <view class="search-bar">
      <text class="search-icon">🔍</text>
      <input
        class="search-input"
        v-model="keyword"
        type="text"
        placeholder="搜索我的项目"
        placeholder-class="search-placeholder"
        confirm-type="search"
      />
      <text v-if="keyword" class="clear-btn" @click="keyword = ''">✕</text>
    </view>

    <scroll-view
      scroll-y
      class="grid-scroll"
      :style="{ height: scrollHeight }"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <view class="grid">
        <!-- 已有项目：封面 + 项目名 -->
        <view
          v-for="item in shownList"
          :key="item.id"
          class="cell"
          @click="goDetail(item)"
        >
          <image v-if="item.cover" class="cover" :src="item.cover" mode="aspectFill" />
          <!-- 无封面兜底：沿用 ProjectCard 同款渐变 + 项目名首字 -->
          <view v-else class="cover cover-fallback">
            <text class="cover-fallback-t">{{ initial(item.title) }}</text>
          </view>
          <text class="cell-name">{{ item.title }}</text>
        </view>

        <!-- 末尾占位卡：添加新项目（设计稿：卡内无文字，文字在卡下方；本次按要求在卡片正中加一个「+」） -->
        <view class="cell" @click="goCreate">
          <view class="cover cover-add">
            <view class="add-plus">
              <view class="add-plus-bar"></view>
              <view class="add-plus-bar add-plus-bar-v"></view>
            </view>
          </view>
          <text class="cell-name">添加新项目</text>
        </view>
      </view>

      <!-- 首屏加载 / 搜索无结果提示（设计稿无此元素，仅在必要时出现） -->
      <view v-if="loading && !list.length" class="grid-tip">
        <text class="grid-tip-t">加载中...</text>
      </view>
      <view v-else-if="keyword && !shownList.length" class="grid-tip">
        <text class="grid-tip-t">没有找到相关项目</text>
      </view>
    </scroll-view>

    <!-- 演示数据灰标：接口回退到 mock 时显示 -->
    <DemoBadge :show="isDemo" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import DemoBadge from '@/components/common/DemoBadge.vue'
import nav from '@/utils/nav.js'
import { getMyProjects } from '@/api/project.js'
import { normalizeProject } from '@/api/adapter.js'
import { withFallback, unwrapPage } from '@/utils/fallback.js'
import { mockProjects } from '@/mock/index.js'

const PAGE_SIZE = 20

// 导航内容区 48px（返回键 34×34 居中 → 距导航顶 7px；状态栏 59pt 时正好落在设计稿的 top: 66px）
const NAV_CONTENT_H = 48
// 搜索区高度 80px = 56px 搜索框 + 20rpx(≈11px) + 24rpx(≈13px) 上下外边距
// —— 恰好等于设计稿「导航底 107px → 首行卡片 187px」那段 79px 留白，所以首行卡片位置不变
const SEARCH_BLOCK_H = 80

/** 状态栏高度（自定义导航要自己占位，口径与 CustomNavbar 一致） */
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0

/** 搜索关键词（前端本地过滤；后端 5.16 我的项目无 keyword 参数） */
const keyword = ref("")

const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const isDemo = ref(false)
const page = ref(1)
const total = ref(0)
const list = ref([])

/** 滚动区高度 = 视口 - 状态栏 - 导航 - 搜索区（导航/搜索框不参与滚动，固定在上方） */
const scrollHeight = computed(
  () => `calc(100vh - ${statusBarHeight}px - ${NAV_CONTENT_H + SEARCH_BLOCK_H}px)`
)

/** 网格实际渲染用：关键词本地过滤（项目名包含即命中，「添加新项目」占位卡不受影响） */
const shownList = computed(() => {
  const kw = keyword.value.trim()
  if (!kw) return list.value
  return list.value.filter((it) => (it.title || "").includes(kw))
})

/** 项目名首字（无封面时的兜底显示） */
function initial(name) {
  return (name || '?').charAt(0)
}

/** 接口项目 → 网格卡（只要 id / title / cover，其余字段由适配层统一兜住） */
function toCell(raw) {
  const p = normalizeProject(raw)
  return {
    id: p.id,
    title: p.title || '未命名项目',
    cover: p.cover || ''
  }
}

/** 回退数据：mockProjects 是按 id 索引的对象，本身没有封面（正好走渐变兜底） */
function mockCellList() {
  return Object.values(mockProjects || {}).map((m) => ({
    id: m.id,
    title: m.title || '未命名项目',
    cover: ''
  }))
}

/** 拉一页 5.16 我的项目；reset=true 用于首次进入 / 下拉刷新 */
async function loadList(reset = false) {
  if (loading.value) return
  if (!reset && finished.value) return
  if (reset) {
    page.value = 1
    finished.value = false
  }
  loading.value = true
  try {
    const res = await withFallback(
      () => getMyProjects({ page: page.value, page_size: PAGE_SIZE }),
      mockCellList,
      'project/mine-grid'
    )
    const p = unwrapPage(res.data)
    const items = p.list.map(toCell)
    const all = reset ? items : list.value.concat(items)
    list.value = all
    total.value = p.total || all.length
    isDemo.value = res.isFallback
    finished.value = items.length < PAGE_SIZE || all.length >= total.value
    page.value += 1
  } finally {
    loading.value = false
  }
}

// onShow：共创招募表单发布成功是 uni.navigateBack() 退回本页，用 onShow 才能立刻看到新项目
onShow(() => {
  loadList(true)
})

function onRefresh() {
  refreshing.value = true
  loadList(true).finally(() => {
    refreshing.value = false
  })
}

function loadMore() {
  loadList(false)
}

function goBack() {
  uni.navigateBack()
}

function goDetail(item) {
  if (!item.id) return
  nav.goDetail('project', item.id)
}

/** 「添加新项目」→ 共创招募表单（5.1 POST /projects/） */
function goCreate() {
  nav.goCoopEdit()
}
</script>

<style scoped>
.page {
  height: 100vh;
  overflow: hidden;
  position: relative;
  /* 底图加载前/失败时的兜底渐变（取底图实测色：左上 #BFC6C2 / 中段 #D8DEDA / 下方 #7D948D） */
  background: linear-gradient(160deg, #bfc6c2 0%, #d8deda 35%, #7d948d 100%);
}

/* 底图：设计稿导出图 /static/mine-grid-bg.png（402×874），铺满整屏并在导航/网格之下 */
.page-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

/* ══ 顶部导航（设计稿：透明底，不要白色导航条） ══ */
.nav {
  position: relative;
  z-index: 1;
}

/* 内容区 48px：返回键 34×34 垂直居中 → 距导航顶 7px，状态栏 59pt 时即设计稿的 top: 66px */
.nav-content {
  position: relative;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 返回键 34×34，left: 24px（设计稿给定值） */
.nav-back {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back:active {
  opacity: 0.6;
}

.nav-back-icon {
  /* ← 字形大小（设计稿未给字号，取 24px，与 CustomNavbar 同口径） */
  font-size: 44rpx;
  color: #434645;
  line-height: 1;
}

/* Static/Title Large：字号按设计稿像素实测反推 = 22px（4 字墨迹宽 83px、高 20px） */
.nav-title {
  font-size: 41rpx;        /* 22px */
  line-height: 52rpx;      /* 28px */
  font-weight: 400;        /* Regular */
  color: #434645;          /* 设计稿指定色 */
  letter-spacing: 0;       /* Static/Title Large/Tracking 未给值，按 0 处理 */
  vertical-align: middle;
}

/* ══ 搜索框（设计稿：360×56 / 圆角 28 / 白底 opacity 0.3 / 左放大镜 / gap 4px） ══ */
.search-bar {
  position: relative;
  z-index: 1;
  width: 672rpx;           /* 360px */
  max-width: 720px;        /* 设计稿 max-width: 720px */
  height: 104rpx;          /* 56px */
  margin: 20rpx auto 24rpx;/* 上 11px + 下 13px：与 56px 合计 80px，正好等于设计稿该处 79px 留白 */
  border-radius: 52rpx;    /* 28px */
  background: #ffffff;
  opacity: 0.3;            /* 设计稿 opacity: 0.3（整块含图标/文字一起淡出） */
  display: flex;
  align-items: center;
  gap: 8rpx;               /* 设计稿 gap: 4px */
  padding: 0 30rpx;        /* 左内边距 16px（设计稿未给，按 (56-24)/2 取） */
  box-sizing: border-box;
}

.search-icon {
  font-size: 32rpx;
  line-height: 1;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 32rpx;
  color: #434645;
}

.search-placeholder {
  font-size: 32rpx;
  color: #434645;
}

.clear-btn {
  font-size: 28rpx;
  color: #434645;
  flex-shrink: 0;
}

/* 滚动区高度由 scrollHeight（视口 - 状态栏 - 导航 - 搜索区）动态给出 */
.grid-scroll {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
}

/* 左右留白 21px→40rpx；列间距 21px→40rpx；行间距 30rpx
   首行卡片 y≈187px = 导航底 107 + 搜索区 80，与设计稿实测 186~188px 对齐 */
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 30rpx 40rpx;
  padding: 0 40rpx 40rpx;
  box-sizing: border-box;
}

.cell {
  width: 312rpx;
}

.cell:active {
  opacity: 0.92;
}

/* 卡片 167×214px → 312×399rpx，圆角 ≈27px → 50rpx */
.cover {
  width: 312rpx;
  height: 399rpx;
  border-radius: 50rpx;
  display: block;
}

/* 无封面兜底：与 components/project/ProjectCard.vue 同款渐变，保持全站视觉一致 */
.cover-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0c7bb, #d9a29e);
}

.cover-fallback-t {
  font-size: 96rpx;
  color: #fff;
  font-weight: 600;
}

/* 「添加新项目」占位卡：设计稿实测像素 235,238,237 → 白色半透明叠在底图上 */
.cover-add {
  background: rgba(255, 255, 255, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 卡片正中的「+」：与卡片等比缩放（不照抄设计稿绝对值）
   设计稿（更宽画板）：图标框 45×45，内边距 9.38 → 真正的「+」笔画盒 26.25×26.25
   （校验：9.38 × 2 + 26.25 = 45.01 ≈ 45 ✓）
   比例换算：设计稿卡宽 205.95px ↔ 本页卡宽 312rpx（1 设计px ≈ 1.5149rpx）
     图标框 45    → 68rpx
     「+」 26.25  → 40rpx（四周各留 14rpx，即设计稿的 9.38px）
     描边   ≈2px  → 3rpx
   用两根 view 拼成（不用字体符号，避免各端字形/字宽差异），两端圆头 */
.add-plus {
  position: relative;
  width: 68rpx;   /* 图标框 45px */
  height: 68rpx;
  opacity: 1;     /* opacity: 1（不做淡出） */
}

/* 横杆 */
.add-plus-bar {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 40rpx;   /* 「+」 26.25px */
  height: 3rpx;
  border-radius: 3rpx;
  background: #434645;
  transform: translate(-50%, -50%);
}

/* 竖杆（与横杆交叉成「+」） */
.add-plus-bar-v {
  width: 3rpx;
  height: 40rpx;  /* 「+」 26.25px */
}

/* 卡片 → 项目名 19px→36rpx；字号 18px→34rpx，对齐卡片宽度居中 */
.cell-name {
  display: block;
  margin-top: 36rpx;
  font-size: 34rpx;
  line-height: 1.2;
  color: #4a4a4a;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.grid-tip {
  padding: 20rpx 0 60rpx;
  text-align: center;
}

.grid-tip-t {
  font-size: 26rpx;
  color: #8a9a94;
}
</style>
