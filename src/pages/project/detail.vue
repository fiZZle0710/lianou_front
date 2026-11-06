<template>
  <!-- 项目招募详情页（二级页）—— 按 tif/项目.pptm slide3 / slide4 -->
  <view class="page" :style="{ '--sbh': statusBarHeight + 'px' }">
    <view class="nav">
      <view class="nav-back" @click="goBack">
        <image class="nav-back-ic" src="/static/icons/icon-arrow-left-grey.svg" mode="aspectFit" />
      </view>
      <text class="nav-title">{{ ownerName }}发起的共创项目招募</text>
      <view class="nav-right"></view>
    </view>

    <!-- 演示数据灰标：接口不可用、回退到本地假数据时显示 -->
    <DemoBadge :show="isDemo" position="top-right" />

    <scroll-view scroll-y class="body-scroll">
      <!-- 发起人 -->
      <text class="sec-label">发起人</text>
      <view class="card owner-card">
        <view class="owner-avatar avatar-ring-white" @click="goProfile"><text class="owner-avatar-t">{{ initial(ownerName) }}</text></view>
        <view class="owner-main">
          <view class="owner-name-row">
            <text class="owner-name">{{ ownerName }}</text>
            <view class="lv-pill"><text class="lv-t">Lv.{{ ownerLevel }}</text></view>
          </view>
          <text class="owner-stats">共创经历 <text class="num">{{ coopCount }}</text> 次 发起共创 <text class="num">{{ publishedCount }}</text> 次</text>
          <view class="owner-skills">
            <text class="skill-label">技能</text>
            <view v-for="(s, i) in skills" :key="i" class="skill-pill"><text class="skill-pill-t">{{ s }}</text></view>
          </view>
        </view>
        <image class="owner-arrow" src="/static/icons/icon-arrow-right-grey.svg" mode="aspectFit" />
      </view>

      <!-- 简介 -->
      <text class="sec-label">简介</text>
      <view class="card intro-card">
        <text class="intro-t">“{{ intro }}”</text>
      </view>

      <!-- 项目要求 -->
      <text class="sec-label">项目要求</text>
      <view class="card req-card" @click="goRequire">
        <text class="req-t">点击查看</text>
        <image class="req-arrow" src="/static/icons/icon-arrow-right-grey.svg" mode="aspectFit" />
      </view>

      <!-- 成员 -->
      <text class="sec-label">成员（{{ total ? current + '/' + total : current }}）</text>
      <view class="card member-card">
        <view class="member-list">
          <view v-for="(m, i) in memberAvatars" :key="m.id || i" class="member-col">
            <view class="member-a avatar-ring-white"><text class="member-a-t">{{ initial(m.nickname) }}</text></view>
            <text class="member-name">{{ m.nickname }}</text>
          </view>
          <view class="member-more"><text class="member-more-t">…</text></view>
        </view>
      </view>

      <!-- 截止招募时间 -->
      <text class="sec-label">截止招募时间</text>
      <view class="card date-card">
        <text class="date-t">{{ deadline }}</text>
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
      <view v-else class="apply-btn disabled"><text class="apply-btn-t">已截止</text></view>
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

const statusBarHeight = (uni.getSystemInfoSync().statusBarHeight || 0)

// 当前项目 id（由路由参数 id 传入）
const projectId = ref(null)

const ownerName = ref("")
const ownerLevel = ref(0)
const ownerId = ref(null)
const coopCount = ref(0)
const publishedCount = ref(0)
const intro = ref("")
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
  publishedCount.value = p.publishedCount || 0
  current.value = p.current || 0
  total.value = p.total || 0
  deadline.value = p.deadlineText || p.deadline || ''
  projectStatus.value = p.status || ''
  intro.value = p.intro || p.description || ''

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
function goRequire() { uni.navigateTo({ url: '/pages/project/require?id=' + projectId.value }) }

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
/* 稿：402×874。导航 83.3px；「发起人」标签顶 87.7；发起人卡 355.6×99.4 @x22.8；
   标签到卡固定 32.7px（61rpx），卡到下一个标签 10~12.5px（21rpx）；
   底部 CTA 177.2×69.3 圆角 34.6px @y710.8 */
.page { background: #fff; height: 100vh; display: flex; flex-direction: column; }

.nav {
  /* 稿上导航条总高 83.3px（155rpx）含状态栏：真机 sbh 吃掉多少就减多少，
     headless 无状态栏时仍是 83.3px，量出来的坐标可直接和稿对比 */
  height: calc(155rpx - var(--sbh, 0px));
  padding: 0 52rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  flex-shrink: 0;
}
.nav-back { width: 60rpx; height: 60rpx; display: flex; align-items: center; }
.nav-back-ic { width: 47rpx; height: 47rpx; }
/* 标题 17.9px（33rpx），色 #262626，单行省略 */
.nav-title { flex: 1; font-size: 33rpx; color: #262626; font-weight: 600; text-align: center; margin: 0 8rpx; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.nav-right { width: 60rpx; }

.body-scroll { flex: 1; min-height: 0; padding: 5rpx 0 0; box-sizing: border-box; overflow: hidden; }

/* 标签：17.9px（33rpx）粗体 #3A3A3A，左缘 21.4px（40rpx），到下方卡 32.7px（61rpx） */
.sec-label {
  display: block;
  font-size: 33rpx;
  line-height: 1;
  color: #3a3a3a;
  font-weight: 700;
  margin: 21rpx 0 28rpx 40rpx;
}
.body-scroll .sec-label:first-child { margin-top: 4rpx; }

/* 卡片：白底 + 稿上 outerShdw dx/dy 4.21 blur 7.94 alpha .20 */
.card {
  background: #fff;
  margin: 0 43rpx;
  box-shadow: 8rpx 8rpx 15rpx rgba(0, 0, 0, 0.2);
}

/* 发起人卡 99.4px（185rpx），圆角 7.25px（14rpx） */
.owner-card { position: relative; height: 185rpx; border-radius: 14rpx; padding: 27rpx 0 0 32rpx; box-sizing: border-box; }
.owner-avatar {
  width: 125rpx;
  height: 125rpx;
  border-radius: 50%;
  background: #4e6f66;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.owner-avatar-t { font-size: 42rpx; color: #fff; }
.owner-main { position: absolute; left: 156rpx; top: 24rpx; right: 96rpx; }
.owner-name-row { display: flex; align-items: center; }
/* 名字 19.8px（37rpx）粗体 #3A3A3A */
.owner-name { font-size: 37rpx; color: #3a3a3a; font-weight: 700; line-height: 1; }
/* Lv 胶囊：37.8×16.5px（70×31rpx），描边 #77BBAC 1px，字 9.9px（18rpx） */
.lv-pill {
  height: 31rpx;
  border: 1rpx solid #77bbac;
  border-radius: 15rpx;
  padding: 0 10rpx;
  margin-left: 14rpx;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.lv-t { font-size: 18rpx; color: #77bbac; line-height: 1; }
/* 共创经历 11.9px（22rpx）灰，数字 13.9px（26rpx） */
.owner-stats { display: block; font-size: 22rpx; color: #3a3a3a; margin-top: 10rpx; }
.owner-stats .num { font-size: 26rpx; }
.owner-skills { display: flex; align-items: center; margin-top: 10rpx; }
.skill-label { font-size: 22rpx; color: #3a3a3a; margin-right: 8rpx; }
/* 技能胶囊：40×18.2px（75×34rpx），底 #E6EEED，字 11.9px（22rpx）#747474 */
.skill-pill {
  height: 34rpx;
  background: #e6eeed;
  border-radius: 17rpx;
  padding: 0 14rpx;
  margin-right: 8rpx;
  display: flex;
  align-items: center;
}
.skill-pill-t { font-size: 22rpx; color: #747474; line-height: 1; }
.owner-arrow { position: absolute; right: 42rpx; top: 50%; margin-top: -22rpx; width: 45rpx; height: 45rpx; }

/* 简介卡 67.3px（126rpx），圆角 4.9px（9rpx） */
.intro-card { border-radius: 9rpx; padding: 14rpx 20rpx; min-height: 126rpx; box-sizing: border-box; }
/* 正文 13.9px（26rpx）#3A3A3A */
.intro-t { font-size: 26rpx; color: #3a3a3a; line-height: 1.6; }

/* 项目要求卡 37.9px（71rpx），圆角 6.24px（12rpx） */
.req-card { position: relative; height: 71rpx; border-radius: 12rpx; display: flex; align-items: center; padding-left: 24rpx; }
.req-t { font-size: 26rpx; color: #747474; }
.req-arrow { position: absolute; right: 22rpx; top: 50%; margin-top: -22rpx; width: 44rpx; height: 44rpx; }

/* 成员卡 99.4px（185rpx） */
.member-card { height: 185rpx; border-radius: 14rpx; padding: 27rpx 20rpx 0 14rpx; box-sizing: border-box; }
.member-list { display: flex; align-items: flex-start; }
.member-col { width: 108rpx; display: flex; flex-direction: column; align-items: center; }
/* 头像 54.2px（101rpx）底 #4E6F66 */
.member-a {
  width: 101rpx;
  height: 101rpx;
  border-radius: 50%;
  background: #4e6f66;
  display: flex;
  align-items: center;
  justify-content: center;
}
.member-a-t { font-size: 34rpx; color: #fff; }
.member-name { font-size: 18rpx; color: #404040; margin-top: 8rpx; white-space: nowrap; }
/* 「…」气泡 34.5px（64rpx）底 #E6EEED，字 20.8px（39rpx）#4E6F66 */
.member-more {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #e6eeed;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 18rpx 0 0 4rpx;
}
.member-more-t { font-size: 39rpx; color: #4e6f66; line-height: 1; }

/* 截止时间卡 */
.date-card { height: 71rpx; border-radius: 12rpx; display: flex; align-items: center; padding-left: 24rpx; }
.date-t { font-size: 26rpx; color: #747474; }

.bottom-space { height: 40rpx; }

/* 底部 CTA：177.2×69.3px（330×129rpx），圆角 34.6px（65rpx），字 21.8px（41rpx）白 */
.footer { flex-shrink: 0; display: flex; justify-content: center; padding: 16rpx 0 calc(20rpx + env(safe-area-inset-bottom)); background: #fff; }
.apply-btn {
  width: 330rpx;
  height: 129rpx;
  border-radius: 65rpx;
  background: linear-gradient(90deg, #538474 0%, #5ba188 53%, #77bbac 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.apply-btn.disabled { background: #e0e0e0; }
.apply-btn-t { font-size: 41rpx; color: #fff; }
.apply-btn.disabled .apply-btn-t { color: #9a9a9a; }

.apply-mask { position: fixed; left: 0; right: 0; top: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.apply-panel { width: 80%; background: #fff; border-radius: 24rpx; padding: 36rpx 30rpx; }
.apply-title { font-size: 30rpx; color: #3a3a3a; text-align: center; display: block; }
.apply-textarea { width: 100%; height: 160rpx; background: #f6f8f7; border-radius: 16rpx; padding: 20rpx; font-size: 26rpx; margin-top: 24rpx; box-sizing: border-box; }
.apply-actions { display: flex; gap: 20rpx; margin-top: 28rpx; }
.a-btn { flex: 1; height: 80rpx; border-radius: 40rpx; display: flex; align-items: center; justify-content: center; }
.a-btn.cancel { background: #f2f2f2; }
.a-btn.ok { background: #5ba188; }
.a-btn-t { font-size: 28rpx; color: #3a3a3a; }
.a-btn.ok .a-btn-t { color: #fff; }
</style>
