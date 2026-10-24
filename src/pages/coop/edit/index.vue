<template>
  <!-- 发起项目招募（按 Figma node-id=62-61 设计稿重做） -->
  <view class="page">
    <CustomNavbar title="" showBack />
    <view class="nav-divider"></view>

    <scroll-view scroll-y class="form-scroll">
      <!-- 发起人信息卡 -->
      <view class="intro-card">
        <view class="ic-avatar">
          <text class="ic-avatar-t">{{ avatarLetter }}</text>
        </view>
        <view class="ic-main">
          <text class="ic-name">{{ nickname }}</text>
          <view class="ic-line"></view>
        </view>
        <text class="ic-title">发起的项目招募</text>
      </view>

      <!-- 项目名称 -->
      <text class="f-label lbl-first">项目名称</text>
      <view class="f-input-wrap">
        <input
          class="f-input"
          v-model="title"
          type="text"
          placeholder=""
          maxlength="50"
        />
      </view>

      <!-- 简介 -->
      <text class="f-label lbl-intro">简介</text>
      <view class="f-textarea-wrap">
        <view class="intro-rule"></view>
        <textarea
          class="f-textarea"
          v-model="intro"
          placeholder=""
          maxlength="500"
        />
      </view>

      <!-- 招募技能 -->
      <text class="f-label lbl-skill">招募技能</text>
      <view class="chip-row">
        <view
          v-for="s in selectedSkills"
          :key="s.id"
          class="chip"
          @click="toggleSkill(s.id)"
        >
          <text class="chip-t">{{ s.name }}</text>
        </view>
        <view class="chip chip-add" @click="openSkillPicker">
          <text class="chip-add-t">＋</text>
        </view>
      </view>

      <!-- 招募人数 -->
      <text class="f-label lbl-mem">招募人数</text>
      <view class="stepper">
        <view class="step-btn" @click="stepMembers(-1)">
          <text class="step-btn-t">−</text>
        </view>
        <text class="step-val">{{ members }}</text>
        <view class="step-btn" @click="stepMembers(1)">
          <text class="step-btn-t">＋</text>
        </view>
      </view>

      <!-- 截止日期 -->
      <text class="f-label lbl-date">截止日期</text>
      <picker mode="date" :value="deadlineDate" @change="onDateChange">
        <view class="date-row">
          <image class="date-icon" src="/static/icons/icon-calendar.svg" mode="aspectFit" />
          <text class="date-y">{{ dateParts.year }}</text>
          <text class="date-m">{{ dateParts.month }}</text>
          <text class="date-d">{{ dateParts.day }}</text>
        </view>
      </picker>

      <view class="form-tail"></view>
    </scroll-view>

    <!-- 底部发布 -->
    <view class="cta-bar">
      <view class="cta-btn" :class="{ disabled: submitting }" @click="publish">
        <text class="cta-t">发布</text>
        <image class="cta-arrow" src="/static/icons/icon-cta-arrow.svg" mode="aspectFit" />
      </view>
    </view>

    <!-- 技能选择弹层 -->
    <view v-if="pickerOpen" class="picker-mask" @click="pickerOpen = false">
      <view class="picker-sheet" @click.stop>
        <view class="picker-head">
          <text class="picker-title">选择招募技能（最多 {{ MAX_SKILLS }} 个）</text>
          <text class="picker-done" @click="pickerOpen = false">完成</text>
        </view>
        <scroll-view scroll-y class="picker-body">
          <view class="picker-grid">
            <view
              v-for="s in skillOptions"
              :key="s.id"
              class="picker-opt"
              :class="{ on: isSkillOn(s.id) }"
              @click="toggleSkill(s.id)"
            >
              <text class="picker-opt-t">{{ s.name }}</text>
            </view>
          </view>
          <text v-if="!skillOptions.length" class="picker-empty">技能字典未加载</text>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import CustomNavbar from '@/components/common/CustomNavbar.vue'
import { createProject } from '@/api/project.js'
import { getSkills } from '@/api/user.js'
import { getUserInfo } from '@/utils/auth.js'

const MAX_SKILLS = 5

/** 稿上示例日期是 2024-11-15，但那是过期日期；实际默认取「今天 +30 天」 */
function defaultDeadline() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const title = ref('')
const intro = ref('')
const members = ref(3)
const deadlineDate = ref(defaultDeadline())
const submitting = ref(false)

const pickerOpen = ref(false)
const skillOptions = ref([])
const selectedSkills = ref([])

const me = getUserInfo() || {}
const nickname = computed(() => me.nickname || me.name || me.username || '我')
const avatarLetter = computed(() => String(nickname.value).slice(0, 1))

/** 日期拆成 年 / 月 / 日 三段展示（稿上是三段分列） */
const dateParts = computed(() => {
  const [y = '', m = '', d = ''] = String(deadlineDate.value || '').split('-')
  return { year: y, month: m ? m + ' 月' : '', day: d ? d + ' 日' : '' }
})

function onDateChange(e) {
  deadlineDate.value = e.detail.value
}

function stepMembers(delta) {
  const next = Number(members.value || 0) + delta
  if (next < 1) return
  if (next > 999) return
  members.value = next
}

function isSkillOn(id) {
  return selectedSkills.value.some((s) => String(s.id) === String(id))
}

function toggleSkill(id) {
  if (isSkillOn(id)) {
    selectedSkills.value = selectedSkills.value.filter((s) => String(s.id) !== String(id))
    return
  }
  if (selectedSkills.value.length >= MAX_SKILLS) {
    uni.showToast({ title: '最多选 ' + MAX_SKILLS + ' 个技能', icon: 'none' })
    return
  }
  const hit = skillOptions.value.find((s) => String(s.id) === String(id))
  if (hit) selectedSkills.value = [...selectedSkills.value, hit]
}

function openSkillPicker() {
  pickerOpen.value = true
}

/** 2.8 技能字典（失败不阻塞发布，只是选不了技能） */
async function loadSkills() {
  try {
    const res = await getSkills()
    const d = res && res.data !== undefined ? res.data : res
    const list = Array.isArray(d) ? d : ((d && d.skills) || [])
    skillOptions.value = list
      .map((s) => ({ id: s.skill_id || s.id, name: s.name }))
      .filter((s) => s.id !== undefined && s.id !== null && s.name)
  } catch (e) {
    skillOptions.value = []
  }
}

onMounted(loadSkills)

/**
 * 截止时间 → ISO 8601（如 `2026-12-31T00:00:00`）
 * ⚠️ 后端用 `datetime.fromisoformat()` 解析，纯日期会 ValueError（接口 500），必须补时间。
 */
function buildDeadline() {
  if (!deadlineDate.value) return undefined
  return deadlineDate.value + 'T00:00:00'
}

async function publish() {
  if (submitting.value) return
  if (!title.value.trim()) {
    uni.showToast({ title: '请填写项目名称', icon: 'none' })
    return
  }
  submitting.value = true
  uni.showLoading({ title: '发布中...', mask: true })
  try {
    await createProject({
      title: title.value.trim(),
      description: intro.value.trim() || undefined,
      max_members: members.value || undefined,
      required_skills: selectedSkills.value.length
        ? selectedSkills.value.map((s) => Number(s.id))
        : undefined,
      deadline: buildDeadline()
    })
    uni.hideLoading()
    uni.showToast({ title: '招募已发布', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1000)
  } catch (err) {
    uni.hideLoading()
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* 402 宽稿 → rpx：1px ≈ 1.8657rpx */
.page {
  height: 100vh;
  overflow: hidden;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

/* 稿 y84 有一条通栏 #f6f6f4 细线（导航与内容的分界） */
.nav-divider {
  height: 1rpx;
  background: #f6f6f4;
  flex-shrink: 0;
}

.form-scroll {
  flex: 1;
  height: 0;
  min-height: 0;
  padding: 0 37rpx;
  box-sizing: border-box;
}

/* 稿上无滚动条；H5 的 scroll-view 会画出滚动条，遮掉 */
.form-scroll ::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

/* ---------- 发起人卡 ---------- */
.intro-card {
  margin-top: 63rpx;
  height: 142rpx;
  border-radius: 37rpx;
  background: #576960;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  box-sizing: border-box;
}

.ic-avatar {
  width: 78rpx;
  height: 78rpx;
  border-radius: 50%;
  background: #22211f;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ic-avatar-t {
  font-size: 27rpx;
  color: #d1fae5;
}

/* 稿上昵称顶部距卡片顶 22px，下划线在 38px 处（不是垂直居中） */
.ic-main {
  margin-left: 47rpx;
  min-width: 0;
  align-self: stretch;
  padding-top: 41rpx;
  box-sizing: border-box;
}

.ic-name {
  display: block;
  font-size: 24rpx;
  line-height: 1;
  color: #b0b0b0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 稿上下划线比昵称宽（x94.5..224，129.5px），是固定长度的可编辑下划线 */
.ic-line {
  width: 242rpx;
  height: 1rpx;
  margin-left: -19rpx;
  margin-top: 6rpx;
  background: #72817b;
}

.ic-title {
  align-self: flex-start;
  margin-top: 36rpx;
  margin-left: auto;
  margin-right: 55rpx;
  padding-left: 20rpx;
  font-size: 25rpx;
  color: #ffffff;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ---------- 标签 ---------- */
.f-label {
  display: block;
  margin-top: 36rpx;
  margin-left: 19rpx;
  font-size: 26rpx;
  line-height: 1;
  color: #7c7c7c;
}

/* 稿上各标签与上一块的距离不同，逐个对齐（1x px） */
.f-label.lbl-first {
  margin-top: 35rpx;
}

.f-label.lbl-intro {
  margin-top: 43rpx;
}

.f-label.lbl-skill {
  margin-top: 0;
}

.f-label.lbl-mem {
  margin-top: 30rpx;
}

.f-label.lbl-date {
  margin-top: 30rpx;
}

/* ---------- 项目名称 ---------- */
.f-input-wrap {
  margin-top: 18rpx;
  height: 78rpx;
  border: 1rpx solid #ebe9e9;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.f-input {
  width: 100%;
  font-size: 26rpx;
  color: #2b2b2b;
}

/* ---------- 简介 ---------- */
.f-textarea-wrap {
  margin-top: 8rpx;
}

/* 稿上「简介」标签下有一条 168px 宽的浅灰分隔线，不是输入框边框 */
.intro-rule {
  width: 313rpx;
  height: 2rpx;
  margin-left: 19rpx;
  margin-bottom: 0;
  background: #b7b7b7;
}

.f-textarea {
  width: 100%;
  height: 201rpx;
  font-size: 26rpx;
  color: #2b2b2b;
  line-height: 1.5;
}

/* ---------- 技能胶囊 ---------- */
.chip-row {
  margin-top: 17rpx;
  padding-left: 6rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 19rpx;
}

.chip {
  height: 48rpx;
  padding: 0 28rpx;
  border-radius: 24rpx;
  background: #8bad9a;
  border: 1rpx solid #c7dcd1;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.chip-t {
  font-size: 24rpx;
  color: #ffffff;
}

.chip-add {
  background: transparent;
  border: 1rpx solid #c8ddd1;
}

.chip-add-t {
  font-size: 26rpx;
  color: #8bad9a;
  line-height: 1;
}

/* ---------- 招募人数步进器 ---------- */
.stepper {
  margin-top: 16rpx;
  height: 93rpx;
  border: 1rpx solid #ebe9e8;
  border-radius: 15rpx;
  background: #fbfbfa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15rpx;
  box-sizing: border-box;
}

.step-btn {
  width: 70rpx;
  height: 70rpx;
  box-sizing: border-box;
  border-radius: 8rpx;
  background: #ffffff;
  border: 1rpx solid #e9e9e9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-btn-t {
  font-size: 32rpx;
  color: #57534e;
  line-height: 1;
}

.step-val {
  font-size: 36rpx;
  color: #254737;
}

/* ---------- 截止日期 ---------- */
.date-row {
  margin-top: 16rpx;
  width: 328rpx;
  height: 52rpx;
  border: 1rpx solid #d7e8df;
  border-radius: 10rpx;
  background: #f2f7f4;
  display: flex;
  align-items: center;
  padding: 0 16rpx;
  box-sizing: border-box;
}

.date-icon {
  width: 24rpx;
  height: 24rpx;
  margin-right: 40rpx;
}

.date-y,
.date-m,
.date-d {
  font-size: 22rpx;
  color: #44403c;
}

.date-m {
  margin-left: 20rpx;
}

.date-d {
  margin-left: 35rpx;
}

.form-tail {
  height: 40rpx;
}

/* ---------- 底部 CTA ---------- */
.cta-bar {
  flex-shrink: 0;
  padding: 20rpx 37rpx calc(37rpx + env(safe-area-inset-bottom));
  background: #ffffff;
}

.cta-btn {
  height: 86rpx;
  border-radius: 17rpx;
  background: #1b382b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cta-btn.disabled {
  opacity: 0.6;
}

.cta-t {
  font-size: 30rpx;
  color: #ffffff;
}

/* 稿上按钮内容＝「发布」两字 + 20px 圆形箭头（圆 #4a6258、白色 →），整体居中 */
.cta-arrow {
  width: 37rpx;
  height: 37rpx;
  margin-left: 21rpx;
  flex-shrink: 0;
}

/* ---------- 技能弹层 ---------- */
.picker-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.picker-sheet {
  width: 100%;
  max-height: 70vh;
  background: #ffffff;
  border-radius: 28rpx 28rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  flex-direction: column;
}

.picker-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 37rpx 20rpx;
}

.picker-title {
  font-size: 28rpx;
  color: #2b2b2b;
}

.picker-done {
  font-size: 28rpx;
  color: #4e6f66;
}

.picker-body {
  max-height: 50vh;
  padding: 0 37rpx 30rpx;
  box-sizing: border-box;
}

.picker-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
}

.picker-opt {
  padding: 12rpx 26rpx;
  border-radius: 24rpx;
  border: 1rpx solid #dfe7e3;
  background: #ffffff;
}

.picker-opt.on {
  background: #8bad9a;
  border-color: #c7dcd1;
}

.picker-opt-t {
  font-size: 24rpx;
  color: #4a4a4a;
}

.picker-opt.on .picker-opt-t {
  color: #ffffff;
}

.picker-empty {
  font-size: 24rpx;
  color: #b4b4b4;
}
</style>
