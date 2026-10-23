<template>
  <!-- 项目中心（一级页）—— 视觉对齐 tif/项目.tif -->
  <view class="page">
    <!-- 顶部导航：清单（进入我的项目管理） + 标题 + 搜索 -->
    <view class="nav">
      <view class="nav-side" @click="goManage">
        <image class="nav-icon" src="/static/icons/icon-doc-list.svg" mode="aspectFit" />
      </view>
      <text class="nav-title">项目中心</text>
      <view class="nav-side right" @click="goSearch">
        <image class="nav-icon" src="/static/icons/icon-search-line.svg" mode="aspectFit" />
      </view>
    </view>

    <!-- 演示数据灰标：接口回退到 mock 时显示（放筛选栏下方，避免压住胶囊） -->
    <view v-if="isDemo" class="demo-row">
      <DemoBadge :show="isDemo" position="inline" />
    </view>

    <!-- 分类筛选栏 + 漏斗（打开筛选面板） -->
    <view class="filter-bar">
      <scroll-view scroll-x class="pill-scroll" :show-scrollbar="false">
        <view class="pill-wrap">
          <view
            v-for="tag in filterTags"
            :key="tag.key"
            class="pill"
            :class="{ active: activePill === tag.key }"
            @click="selectPill(tag)"
          >
            <text class="pill-t">{{ tag.label }}</text>
          </view>
        </view>
      </scroll-view>
      <view class="funnel" @click="showFilter = true">
        <image class="funnel-icon" src="/static/icons/icon-funnel.svg" mode="aspectFit" />
      </view>
    </view>

    <!-- 项目列表 -->
    <scroll-view
      scroll-y
      class="list-scroll"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <ProjectCard
        v-for="item in list"
        :key="item.id"
        :owner-name="item.ownerName"
        :owner-level="item.ownerLevel"
        :title="item.title"
        :deadline="item.deadline"
        :intro="item.intro"
        :topic="item.topic"
        :level-req="item.levelReq"
        :experience-req="item.experienceReq"
        :skills="item.skills"
        :members="item.members"
        :current="item.current"
        :total="item.total"
        @click="goDetail(item)"
      />
      <view class="list-empty" v-if="!list.length">
        <text class="empty-text">{{ loading ? '加载中...' : '暂无项目，下拉刷新试试' }}</text>
      </view>
      <view class="list-empty" v-else-if="loading">
        <text class="empty-text">加载中...</text>
      </view>
      <view class="list-empty" v-else-if="finished">
        <text class="empty-text">— 没有更多了 —</text>
      </view>
    </scroll-view>

    <!-- 筛选 / 排序弹窗 -->
    <view v-if="showFilter" class="filter-mask" @click="showFilter = false">
      <view class="filter-panel" @click.stop>
        <text class="panel-title">筛选</text>
        <view class="panel-block">
          <text class="block-label">排序</text>
          <view class="opt-wrap">
            <view
              v-for="opt in sortOptions"
              :key="opt"
              class="opt"
              :class="{ on: activeSort === opt }"
              @click="activeSort = opt; applyFilter()"
            >
              <text class="opt-t">{{ opt }}</text>
            </view>
          </view>
        </view>
        <view class="panel-block">
          <text class="block-label">所需技能（单选，后端只支持一个 skill_id）</text>
          <view class="opt-wrap">
            <view
              v-for="s in skillOptions"
              :key="s.id"
              class="opt"
              :class="{ on: selectedSkills.includes(s.id) }"
              @click="toggleSkill(s.id)"
            >
              <text class="opt-t">{{ s.name }}</text>
            </view>
            <text v-if="!skillOptions.length" class="opt-empty">技能字典未加载（2.8）</text>
          </view>
        </view>
        <view class="panel-block">
          <text class="block-label">所需人数</text>
          <view class="opt-wrap">
            <view
              v-for="r in peopleOptions"
              :key="r"
              class="opt"
              :class="{ on: peopleRange === r }"
              @click="peopleRange = r"
            >
              <text class="opt-t">{{ r }}</text>
            </view>
          </view>
        </view>
        <view class="panel-actions">
          <view class="act-btn cancel" @click="cancelFilter"><text class="act-btn-t">取消</text></view>
          <view class="act-btn ok" @click="applyFilter"><text class="act-btn-t">完成</text></view>
        </view>
      </view>
    </view>

    <CustomTabbar />
  </view>
</template>
<script setup>
import { ref, computed } from "vue"
import { onLoad } from "@dcloudio/uni-app"
import CustomTabbar from "@/components/common/CustomTabbar.vue"
import ProjectCard from "@/components/project/ProjectCard.vue"
import DemoBadge from "@/components/common/DemoBadge.vue"
import nav from '@/utils/nav.js'
import { getProjects } from '@/api/project.js'
import { getSkills } from '@/api/user.js'
import { normalizeProject, skillNamesOf } from '@/api/adapter.js'
import { withFallback, unwrapPage } from '@/utils/fallback.js'
import { mockProjects } from '@/mock/index.js'

const PAGE_SIZE = 10

/**
 * 一级分类（稿上的 5 枚胶囊）
 * 后端 5.2 没有「热度/类别」字段：
 *   - 综合：不传参
 *   - 热度最高：前端按已加载数据的 memberCount 倒序（真实字段）
 *   - 新手友好：前端按 required_project_count === 0 过滤（真实字段）
 *   - 纯娱乐 / 大佬带队：无对应字段（见 docs/前端联调对照.md 第 269 行），点击先提示
 */
const filterTags = [
  { key: "all", label: "综合" },
  { key: "hot", label: "热度最高" },
  { key: "newbie", label: "新手友好" },
  { key: "fun", label: "纯娱乐" },
  { key: "veteran", label: "大佬带队" }
]
const activePill = ref("all")

// 排序：后端 5.2 无排序参数 → 前端本地排序（面板里选择）
const sortOptions = ["综合排序", "最新", "即将截止", "人数最少", "人数最多"]
const activeSort = ref("综合排序")

// 技能字典（2.8 getSkills）：筛选值用 skill_id（后端只收单个）
const skillOptions = ref([])
const peopleOptions = ["1~5 人", "5~10 人", "10 人 + "]
const selectedSkills = ref([])
const peopleRange = ref("")
const showFilter = ref(false)

const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const isDemo = ref(false)
const page = ref(1)
const total = ref(0)
const list = ref([])

/** 人数区间 → [min, max]（后端无该参数，前端本地过滤） */
function peopleLimit() {
  if (peopleRange.value === "1~5 人") return [1, 5]
  if (peopleRange.value === "5~10 人") return [5, 10]
  if (peopleRange.value === "10 人 + ") return [10, Infinity]
  return null
}

/** 本地排序（综合排序保持后端返回顺序；热度最高按成员数倒序） */
function sortList(arr) {
  const copy = arr.slice()
  if (activePill.value === "hot") {
    return copy.sort((a, b) => b.memberCount - a.memberCount)
  }
  if (activeSort.value === "最新") {
    return copy.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
  }
  if (activeSort.value === "即将截止") {
    return copy.sort((a, b) => String(a.deadlineRaw || '9999').localeCompare(String(b.deadlineRaw || '9999')))
  }
  if (activeSort.value === "人数最少") return copy.sort((a, b) => a.memberCount - b.memberCount)
  if (activeSort.value === "人数最多") return copy.sort((a, b) => b.memberCount - a.memberCount)
  return copy
}

/**
 * required_skills 元素结构：后端 2026-09-27 答复为**对象数组**（含 skill.name / required_count / filled_count），
 * 文档仍写 int[]；解析统一走适配层的 skillNamesOf（两种都能吃），此处不再自行实现。
 */

/** 接口项目 → ProjectCard 的 props */
function toCard(raw) {
  const p = normalizeProject(raw)
  return {
    id: p.id,
    ownerName: p.owner || '发起人',
    ownerLevel: p.ownerLevel || 0,
    title: p.title || '未命名项目',
    deadline: p.deadlineText || '待定',
    deadlineRaw: p.deadline || '',
    intro: p.intro || '',
    topic: p.topic || '不限',
    levelReq: p.requiredLevel > 0 ? ('Lv.' + p.requiredLevel) : 'Lv.1',
    experienceReq: p.requiredProjectCount > 0 ? (p.requiredProjectCount + '次共创经历') : '无共创经历',
    requiredCount: p.requiredProjectCount || 0,
    skills: skillNamesOf(p.requiredSkills, skillOptions.value), // 对象数组自带名字；ID 数组查 2.8 字典
    members: p.members || [],
    current: p.current || 0,
    total: p.total || 0,
    memberCount: p.memberCount || 0,
    createdAt: p.createdAt || ''
  }
}

/** 回退数据：mockProjects 是按 id 索引的对象，形状本就匹配卡片，不必过适配层 */
function mockProjectList() {
  return Object.values(mockProjects || {}).map((m) => ({
    id: m.id,
    ownerName: m.owner || '发起人',
    ownerLevel: m.ownerLevel || 0,
    title: m.title || '未命名项目',
    deadline: m.deadline || '待定',
    deadlineRaw: m.deadline || '',
    intro: m.intro || '',
    topic: (m.skills && m.skills[0]) || '不限',
    levelReq: 'Lv.1',
    experienceReq: '无共创经历',
    requiredCount: 0,
    skills: m.skills || [],
    members: m.members || [],
    current: m.current || 0,
    total: m.total || 0,
    memberCount: m.current || 0,
    createdAt: ''
  }))
}

/** 拉一页；reset=true 用于切分类 / 下拉刷新 */
async function loadList(reset = false) {
  if (loading.value) return
  if (!reset && finished.value) return
  if (reset) {
    page.value = 1
    finished.value = false
  }
  loading.value = true
  try {
    const params = { page: page.value, page_size: PAGE_SIZE }
    if (selectedSkills.value.length) params.skill_id = selectedSkills.value[0]
    const res = await withFallback(() => getProjects(params), mockProjectList, 'project/list')
    const p = unwrapPage(res.data)
    let items = p.list.map(toCard)
    const limit = peopleLimit()
    if (limit) items = items.filter((it) => it.memberCount >= limit[0] && it.memberCount <= limit[1])
    if (activePill.value === "newbie") items = items.filter((it) => !it.requiredCount)
    const all = reset ? items : list.value.concat(items)
    list.value = sortList(all)
    total.value = p.total || all.length
    isDemo.value = res.isFallback
    finished.value = items.length < PAGE_SIZE || all.length >= total.value
    page.value += 1
  } finally {
    loading.value = false
  }
}

/** 2.8 技能字典（筛选面板用；失败就显示空提示） */
async function loadSkillOptions() {
  const res = await withFallback(() => getSkills(), () => ({ skills: [] }), 'project/skills')
  const d = res.data || {}
  const arr = Array.isArray(d) ? d : (d.skills || d.list || [])
  skillOptions.value = arr.map((s) => ({
    id: s.skill_id || s.id,
    name: s.name || s.skill_name || ('技能#' + (s.skill_id || s.id))
  }))
}

onLoad(() => {
  loadSkillOptions()
  loadList(true)
})

function onRefresh() {
  refreshing.value = true
  loadList(true).finally(() => { refreshing.value = false })
}

function loadMore() {
  loadList(false)
}

function selectPill(tag) {
  if (tag.key === activePill.value) return
  // 后端没有「类别」字段，这两枚暂时只做提示（见文件顶部注释与 docs/前端联调对照.md）
  if (tag.key === "fun" || tag.key === "veteran") {
    uni.showToast({ title: '该分类等后端补字段，先按综合看', icon: 'none' })
    return
  }
  activePill.value = tag.key
  list.value = []
  finished.value = false
  loadList(true)
}

// 后端只收单个 skill_id → 单选（再点一次取消）
function toggleSkill(id) {
  selectedSkills.value = selectedSkills.value.includes(id) ? [] : [id]
}

function cancelFilter() { showFilter.value = false }

function applyFilter() {
  showFilter.value = false
  list.value = []
  finished.value = false
  loadList(true)
}

function goDetail(item) { nav.goDetail('project', item.id) }
function goManage() { uni.navigateTo({ url: "/pages/project/manage" }) }
function goSearch() { uni.navigateTo({ url: "/pages/search/index" }) }
</script>
<style scoped>
.page { --page-gutter: 32rpx; background: #fff; height: 100vh; display: flex; flex-direction: column; }

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
.nav-side.right { justify-content: flex-end; }
.nav-icon { width: 44rpx; height: 44rpx; }
.nav-title {
  font-size: 32rpx;
  color: #1f1f1f;
  font-weight: 700;
  font-family: "Songti SC", "STSong", "Noto Serif SC", "Source Han Serif SC", serif;
}

/* 分类胶囊 */
.filter-bar { display: flex; align-items: center; padding: 16rpx 0 12rpx var(--page-gutter); background: #fff; }
.demo-row { display: flex; justify-content: flex-end; padding: 0 28rpx; }
.pill-scroll { flex: 1; white-space: nowrap; overflow: hidden; }
.pill-wrap { display: inline-flex; align-items: center; }
.pill { background: #f1f1f1; border-radius: 14rpx; padding: 8rpx 22rpx; margin-right: 10rpx; white-space: nowrap; }
.pill.active { background: #e4e9e7; }
.pill-t { font-size: 22rpx; color: #8a8a8a; white-space: nowrap; }
.pill.active .pill-t { color: #2e2e2e; font-weight: 600; }
.funnel { width: 60rpx; height: 60rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.funnel-icon { width: 34rpx; height: 34rpx; }

/* 列表 */
.list-scroll { flex: 1; padding: 8rpx var(--page-gutter) 24rpx; box-sizing: border-box; overflow: hidden; }
.list-empty { text-align: center; padding: 80rpx 20rpx; }
.empty-text { font-size: 26rpx; color: #bbb; }

/* 筛选弹窗 */
.filter-mask { position: fixed; left:0; right:0; top:0; bottom:0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.filter-panel { width: 82%; background: #fff; border-radius: 24rpx; padding: 30rpx; max-height: 76vh; overflow-y: auto; }
.panel-title { font-size: 32rpx; font-weight: 700; color: #333; text-align: center; display: block; margin-bottom: 24rpx; }
.panel-block { margin-bottom: 24rpx; }
.block-label { font-size: 28rpx; color: #666; font-weight: 600; display: block; margin-bottom: 16rpx; }
.opt-wrap { display: flex; flex-wrap: wrap; gap: 14rpx; }
.opt { padding: 14rpx 28rpx; border-radius: 30rpx; background: #f2f4f3; }
.opt.on { background: #e6eeed; }
.opt-t { font-size: 26rpx; color: #666; }
.opt.on .opt-t { color: #4e6f66; font-weight: 600; }
.opt-empty { font-size: 24rpx; color: #bbb; }
.panel-actions { display: flex; gap: 20rpx; margin-top: 12rpx; }
.act-btn { flex: 1; height: 80rpx; border-radius: 40rpx; display: flex; align-items: center; justify-content: center; }
.act-btn.cancel { background: #f2f4f3; }
.act-btn.ok { background: #4e6f66; }
.act-btn-t { font-size: 28rpx; color: #333; }
.act-btn.ok .act-btn-t { color: #fff; }
</style>
