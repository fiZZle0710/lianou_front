<template>
  <!-- 项目招募详情页（二级页） -->
  <view class="page">
    <view class="nav">
      <view class="nav-back" @click="goBack"><text class="back-icon">←</text></view>
      <text class="nav-title">{{ ownerName }} 发起的共创项目招募</text>
      <view class="nav-right"></view>
    </view>

    <!-- 演示数据灰标：接口不可用、回退到本地假数据时显示 -->
    <DemoBadge :show="isDemo" position="top-right" />

    <scroll-view scroll-y class="body-scroll">
      <!-- 发起人卡片 -->
      <view class="owner-card">
        <view class="owner-avatar" @click="goProfile"><text class="owner-avatar-t">{{ initial(ownerName) }}</text></view>
        <view class="owner-info">
          <view class="owner-name-row">
            <text class="owner-name">{{ ownerName }}</text>
            <text class="owner-lv">LV.{{ ownerLevel }}</text>
          </view>
          <text class="owner-stats">共创 {{ coopCount }} 次</text>
          <view class="owner-skills">
            <text v-for="(s, i) in skills" :key="i" class="skill-tag">{{ s }}</text>
          </view>
        </view>
        <view class="contact-btn" @click="contact"><text class="contact-t">私信</text></view>
      </view>

      <!-- 招募要求清单 -->
      <view class="section">
        <text class="sec-title">招募要求</text>
        <view class="req-item" v-for="(r, i) in requirements" :key="i">
          <text class="req-text">{{ r.label }}</text>
          <!-- 后端未返回「当前用户是否符合」的判断（无该接口），故 ok 为空时不显示徽标 -->
          <view v-if="typeof r.ok === 'boolean'" class="req-status" :class="r.ok ? 'ok' : 'no'">
            <text class="req-status-t">{{ r.ok ? "已符合" : "未符合" }}</text>
          </view>
        </view>
      </view>

      <!-- 成员预览 -->
      <view class="section">
        <text class="sec-title">成员</text>
        <view class="member-row">
          <view v-for="(m, i) in memberAvatars" :key="m.id || i" class="member-a">
            <text class="member-a-t">{{ initial(m.nickname) }}</text>
          </view>
          <view v-if="!total || current < total" class="member-a more"><text class="member-a-t">+</text></view>
        </view>
        <text class="member-count">成员（{{ total ? current + '/' + total : current }}）</text>
      </view>

      <view class="section">
        <text class="sec-title">招募截止日期</text>
        <text class="deadline">{{ deadline }}</text>
      </view>
      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="footer">
      <view
        v-if="showApplyBtn"
        class="apply-btn"
        :class="{ disabled: applied || full || expired }"
        @click="openApply"
      >
        <text class="apply-btn-t">{{ applied ? "已申请" : (full ? "已招满" : "申请加入") }}</text>
      </view>
      <view v-if="expired" class="apply-btn disabled"><text class="apply-btn-t">已截止</text></view>
    </view>

    <!-- 申请弹窗 -->
    <view v-if="showApplyModal" class="apply-mask" @click="showApplyModal = false">
      <view class="apply-panel" @click.stop>
        <text class="apply-title">是否发送加入申请给 {{ ownerName }}？</text>
        <textarea class="apply-textarea" v-model="leaveMsg" placeholder="留言（50字上限）" maxlength="50" />
        <view class="apply-actions">
          <view class="a-btn cancel" @click="showApplyModal = false"><text class="a-btn-t">取消</text></view>
          <view class="a-btn ok" @click="submitApply"><text class="a-btn-t">确认</text></view>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref, computed } from "vue"
import { onLoad } from '@dcloudio/uni-app'
import DemoBadge from "@/components/common/DemoBadge.vue"
import { mockProjects } from '@/mock/index.js'
import { getProjectDetail, applyProject } from '@/api/project.js'
import { getSkills } from '@/api/user.js'
import { normalizeProject, skillNamesOf } from '@/api/adapter.js'
import { withFallback } from '@/utils/fallback.js'
import nav from '@/utils/nav.js'

// 当前项目 id（由路由参数 id 传入）
const projectId = ref(null)

const ownerName = ref("")
const ownerLevel = ref(0)
const ownerId = ref(null)
const coopCount = ref(0)
const skills = ref([])
const requirements = ref([])
const memberAvatars = ref([])
const current = ref(0)
const total = ref(0)
const deadline = ref("")
const projectStatus = ref("")
const applied = ref(false)
const leaveMsg = ref("")
const showApplyModal = ref(false)
const isDemo = ref(false)

onLoad((options) => {
  projectId.value = options && options.id
  loadDetail()
})

async function loadDetail() {
  if (!projectId.value) return
  const { data, isFallback } = await withFallback(
    async () => {
      // 5.3 项目详情；同时取 2.8 技能字典（免登录）用于把 required_skills 的 ID 翻成名字
      const [detail, dict] = await Promise.all([
        getProjectDetail(projectId.value),
        getSkills().catch(() => null)
      ])
      return { detail: normalizeProject(detail), dict }
    },
    () => {
      const p = mockProjects[projectId.value]
      return p ? { detail: p, dict: null } : null
    },
    'project/detail: 项目详情'
  )
  isDemo.value = isFallback
  if (!data || !data.detail) return
  applyDetail(data.detail, data.dict)
}

/** 把适配后的项目对象铺到页面字段（mock 回退对象的字段名基本一致，可复用） */
function applyDetail(p, dict) {
  ownerName.value = p.owner || ''
  ownerId.value = p.ownerId || null
  ownerLevel.value = p.ownerLevel || 0
  coopCount.value = p.coopCount || 0
  current.value = p.current || 0
  total.value = p.total || 0
  deadline.value = p.deadlineText || p.deadline || ''
  projectStatus.value = p.status || ''

  // 技能标签：优先队长技能，其次项目的 required_skills，最后兜底原字段
  const ownerSkills = p.ownerInfo && p.ownerInfo.raw && Array.isArray(p.ownerInfo.raw.skills)
    ? p.ownerInfo.raw.skills.map((s) => s && s.name).filter(Boolean)
    : []
  // required_skills：后端 2026-09-27 起为对象数组（自带 skill.name），文档仍写 int[]，
  // 统一交给 skillNamesOf（对象 / ID 两种都能吃；只拿到 ID 时用 2.8 字典翻名）
  const reqNames = skillNamesOf(p.requiredSkills, dict)
  skills.value = ownerSkills.length ? ownerSkills : (reqNames.length ? reqNames : (p.skills || []))

  // 招募要求：后端只给结构化字段，没有「当前用户是否符合」的判定（无该接口），ok 置 null
  const reqs = []
  if (p.requiredLevel) reqs.push({ label: '等级 LV.' + p.requiredLevel + ' 以上', ok: null })
  if (p.requiredProjectCount) reqs.push({ label: '有 ' + p.requiredProjectCount + ' 次共创经历', ok: null })
  const skillReq = skillRequirementText(p.requiredSkills, reqNames)
  if (skillReq) reqs.push({ label: '优先技能：' + skillReq, ok: null })
  requirements.value = reqs.length ? reqs : (p.requirements || [])

  memberAvatars.value = p.memberAvatars && p.memberAvatars.length
    ? p.memberAvatars
    : (p.members || []).map((nickname) => ({ nickname }))
}

/**
 * 「技能名（已招/需求）」文案。
 * requiredSkills 为适配层规整后的对象数组（`{ id, name, requiredCount, filledCount }`），
 * 后端未给 required_count 时只显示技能名。
 */
function skillRequirementText(list, names) {
  return (list || [])
    .map((s, i) => {
      const name = names[i] || (s && s.name) || ('技能#' + (s && s.id))
      const need = s && s.requiredCount ? s.requiredCount : 0
      return need > 0 ? (name + '（' + (s.filledCount || 0) + '/' + need + '）') : name
    })
    .join('、')
}

const full = computed(() => total.value > 0 && current.value >= total.value)
/** 只有 recruiting 才可申请（后端状态：recruiting/ongoing/completed/closed） */
const expired = computed(() => !!projectStatus.value && projectStatus.value !== 'recruiting')
const showApplyBtn = computed(() => !expired.value)

function initial(name) { return (name || '?').charAt(0) }
function goBack() { uni.navigateBack() }
function goProfile() { if (ownerId.value) nav.goDetail('user', ownerId.value) }
function contact() { if (ownerId.value) nav.goDetail('chat', ownerId.value) }

function openApply() {
  if (applied.value || full.value || expired.value) return
  showApplyModal.value = true
}

async function submitApply() {
  const message = (leaveMsg.value || '').trim()
  showApplyModal.value = false
  try {
    // 5.5 申请加入（5004 不能申请自己的项目 / 5005 已申请过）；写操作不回退 mock
    await applyProject(projectId.value, message ? { message } : {})
    applied.value = true
    leaveMsg.value = ''
    uni.showToast({ title: "已提交申请", icon: "success" })
  } catch (err) {
    // 已经申请过：按「已申请」展示，避免用户反复点
    if (err && Number(err.code) === 5005) applied.value = true
  }
}
</script>

<style scoped>
.page { background: #f5f6fa; height: 100vh; display: flex; flex-direction: column; }
.nav { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 24rpx; padding-top: calc(env(safe-area-inset-top) + 20rpx); background: #fff; }
.nav-back { width: 70rpx; height: 60rpx; display: flex; align-items: center; }
.back-icon { font-size: 40rpx; color: #333; }
.nav-title { flex: 1; font-size: 30rpx; font-weight: 700; color: #333; text-align: center; }
.nav-right { width: 70rpx; }
.body-scroll { flex: 1; padding: 20rpx; box-sizing: border-box; }
.owner-card { background: #fff; border-radius: 20rpx; padding: 26rpx; display: flex; align-items: flex-start; }
.owner-avatar { width: 96rpx; height: 96rpx; border-radius: 50%; background: linear-gradient(135deg, #f0c7bb, #d9a29e); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.owner-avatar-t { font-size: 36rpx; color: #fff; }
.owner-info { flex: 1; min-width: 0; margin-left: 20rpx; }
.owner-name-row { display: flex; align-items: center; }
.owner-name { font-size: 32rpx; color: #333; font-weight: 600; }
.owner-lv { font-size: 22rpx; color: #d9a23e; background: #fff4e0; padding: 2rpx 12rpx; border-radius: 10rpx; margin-left: 12rpx; }
.owner-stats { font-size: 24rpx; color: #999; margin-top: 8rpx; display: block; }
.owner-skills { display: flex; flex-wrap: wrap; margin-top: 12rpx; gap: 10rpx; }
.skill-tag { font-size: 22rpx; color: #d98983; background: #fdece8; border-radius: 10rpx; padding: 6rpx 14rpx; }
.contact-btn { padding: 12rpx 28rpx; border: 2rpx solid #d9a29e; border-radius: 30rpx; flex-shrink: 0; }
.contact-t { font-size: 26rpx; color: #d98983; }
.section { background: #fff; border-radius: 20rpx; padding: 26rpx; margin-top: 20rpx; }
.sec-title { font-size: 28rpx; color: #333; font-weight: 600; display: block; margin-bottom: 16rpx; }
.req-item { display: flex; align-items: center; justify-content: space-between; padding: 18rpx 0; border-bottom: 1rpx solid #f3f4f6; }
.req-item:last-child { border-bottom: none; }
.req-text { font-size: 28rpx; color: #555; }
.req-status { padding: 4rpx 18rpx; border-radius: 20rpx; }
.req-status.ok { background: #e7f7ec; }
.req-status.no { background: #f1f1f1; }
.req-status-t { font-size: 22rpx; color: #999; }
.req-status.ok .req-status-t { color: #34c759; }
.member-row { display: flex; }
.member-a { width: 64rpx; height: 64rpx; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; margin-right: -10rpx; border: 3rpx solid #fff; }
.member-a.more { background: #f7f3ee; }
.member-a-t { font-size: 26rpx; color: #888; }
.member-count { font-size: 24rpx; color: #999; display: block; margin-top: 16rpx; }
.deadline { font-size: 28rpx; color: #666; }
.bottom-space { height: 160rpx; }
.footer { padding: 16rpx 24rpx; padding-bottom: calc(16rpx + env(safe-area-inset-bottom)); background: #fff; border-top: 1rpx solid #f0f0f0; }
.apply-btn { height: 88rpx; border-radius: 44rpx; background: #d9a29e; display: flex; align-items: center; justify-content: center; }
.apply-btn.disabled { background: #e0e0e0; }
.apply-btn-t { font-size: 32rpx; color: #fff; }
.apply-btn.disabled .apply-btn-t { color: #aaa; }
.apply-mask { position: fixed; left:0; right:0; top:0; bottom:0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.apply-panel { width: 80%; background: #fff; border-radius: 24rpx; padding: 36rpx 30rpx; }
.apply-title { font-size: 30rpx; color: #333; text-align: center; display: block; }
.apply-textarea { width: 100%; height: 160rpx; background: #f5f6fa; border-radius: 16rpx; padding: 20rpx; font-size: 26rpx; margin-top: 24rpx; box-sizing: border-box; }
.apply-actions { display: flex; gap: 20rpx; margin-top: 28rpx; }
.a-btn { flex: 1; height: 80rpx; border-radius: 40rpx; display: flex; align-items: center; justify-content: center; }
.a-btn.cancel { background: #f5f6fa; }
.a-btn.ok { background: #d9a29e; }
.a-btn-t { font-size: 28rpx; color: #333; }
.a-btn.ok .a-btn-t { color: #fff; }
</style>
