<template>
  <!-- 共创招募编辑页面 -->
  <view class="page">
    <CustomNavbar title="发起共创" showBack />

    <scroll-view scroll-y class="edit-scroll">
      <!-- 图片上传区域 -->
      <view class="upload-section">
        <view class="upload-grid">
          <view
            v-for="(img, index) in images"
            :key="index"
            class="upload-item"
          >
            <image :src="img" mode="aspectFill" class="upload-img" />
            <text class="remove-img" @click="removeImage(index)">✕</text>
          </view>
          <view v-if="images.length < 9" class="upload-add" @click="addImage">
            <text class="add-icon">+</text>
            <text class="add-text">{{ images.length }}/9</text>
          </view>
        </view>
      </view>

      <!-- 输入区域 -->
      <view class="input-section">
        <input
          class="title-input"
          v-model="topic"
          type="text"
          placeholder="添加共创主题"
          maxlength="50"
        />
        <textarea
          class="body-input"
          v-model="intro"
          placeholder="添加简介..."
          maxlength="500"
        />
      </view>

      <!-- 功能选项 -->
      <view class="options-section">
        <view class="option-row" @click="addTopic">
          <view class="option-left">
            <text class="option-icon">#</text>
            <text class="option-label">添加话题</text>
          </view>
          <view class="option-right">
            <text class="option-hint">{{ topicTag || '添加话题' }}</text>
            <text class="option-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 高级设置入口 -->
      <view class="advanced-section" @click="showAdvanced = true">
        <view class="option-row">
          <view class="option-left">
            <text class="option-icon">⚙️</text>
            <text class="option-label">高级设置</text>
          </view>
          <view class="option-right">
            <text class="option-hint">{{ privacyLabel }}</text>
            <text class="option-arrow">›</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部栏 -->
    <view class="bottom-bar">
      <view class="bar-left">
        <view class="bar-btn" @click="atSomeone">
          <text class="bar-btn-icon">@</text>
          <text class="bar-btn-label">提到</text>
        </view>
        <view class="bar-btn" @click="previewCoop">
          <text class="bar-btn-icon">👁</text>
          <text class="bar-btn-label">预览</text>
        </view>
      </view>
      <view class="publish-btn" @click="publishCoop">发布招募</view>
    </view>

    <!-- 高级设置弹窗 -->
    <view v-if="showAdvanced" class="modal-mask" @click="showAdvanced = false">
      <view class="advanced-sheet" @click.stop>
        <view class="sheet-handle">
          <view class="handle-bar"></view>
        </view>
        <view class="sheet-title">共创高级设置</view>

        <view class="sheet-body">
          <!-- 隐私权限 -->
          <view class="setting-group">
            <text class="setting-label">隐私权限</text>
            <view class="radio-list">
              <view
                v-for="opt in privacyOpts"
                :key="opt.key"
                class="radio-item"
                :class="{ selected: privacy === opt.key }"
                @click="privacy = opt.key"
              >
                <text class="radio-text">{{ opt.label }}</text>
                <view class="radio-box">
                  <view v-if="privacy === opt.key" class="radio-dot"></view>
                </view>
              </view>
            </view>
          </view>

          <!-- 定时发布 -->
          <view class="setting-group">
            <text class="setting-label">定时发布</text>
            <view class="setting-row">
              <picker mode="date" :value="scheduleDate" @change="onDateChange">
                <view class="picker-btn">
                  <text>{{ scheduleDate || '选择日期' }}</text>
                  <text class="picker-arrow">›</text>
                </view>
              </picker>
              <picker mode="time" :value="scheduleTime" @change="onTimeChange">
                <view class="picker-btn">
                  <text>{{ scheduleTime || '选择时间' }}</text>
                  <text class="picker-arrow">›</text>
                </view>
              </picker>
            </view>
          </view>

          <!-- 招募人数 -->
          <view class="setting-group">
            <text class="setting-label">共创招募人数</text>
            <view class="number-input-row">
              <view class="number-btn" data-action="decrement" data-target="recruitCount" @click="onNumberBtn">−</view>
              <input
                class="number-input"
                v-model.number="recruitCount"
                type="number"
                maxlength="3"
              />
              <view class="number-btn" data-action="increment" data-target="recruitCount" @click="onNumberBtn">+</view>
            </view>
          </view>

          <!-- 报酬（5.1 mode / budget） -->
          <view class="setting-group">
            <text class="setting-label">共创报酬</text>
            <view class="radio-list">
              <view
                class="radio-item"
                :class="{ selected: payMode === 'free' }"
                @click="payMode = 'free'"
              >
                <text class="radio-text">免费共创</text>
                <view class="radio-box">
                  <view v-if="payMode === 'free'" class="radio-dot"></view>
                </view>
              </view>
              <view
                class="radio-item"
                :class="{ selected: payMode === 'paid' }"
                @click="payMode = 'paid'"
              >
                <text class="radio-text">付费共创</text>
                <view class="radio-box">
                  <view v-if="payMode === 'paid'" class="radio-dot"></view>
                </view>
              </view>
            </view>
            <view v-if="payMode === 'paid'" class="number-input-row sub">
              <text class="filter-label">预算（元）</text>
              <view class="number-btn" data-action="decrement" data-target="budget" @click="onNumberBtn">−</view>
              <input
                class="number-input"
                v-model.number="budget"
                type="number"
                maxlength="6"
              />
              <view class="number-btn" data-action="increment" data-target="budget" @click="onNumberBtn">+</view>
            </view>
          </view>

          <!-- 优先技能（5.1 required_skills，传技能 ID 数组，最多 5 个） -->
          <view class="setting-group">
            <text class="setting-label">优先技能（最多 {{ MAX_SKILLS }} 个，可不选）</text>
            <view class="skill-chip-row">
              <view
                v-for="s in selectedSkills"
                :key="s.id"
                class="skill-chip"
                @click="toggleSkill(s.id)"
              >
                <text class="skill-chip-t">{{ s.name }}</text>
                <text class="skill-chip-x">✕</text>
              </view>
              <text v-if="!selectedSkills.length" class="skill-empty">未选择</text>
            </view>
            <view class="skill-toggle" @click="skillPickerOpen = !skillPickerOpen">
              {{ skillPickerOpen ? '收起技能列表' : '选择技能' }}
            </view>
            <view v-if="skillPickerOpen" class="skill-picker">
              <view
                v-for="s in skillOptions"
                :key="s.id"
                class="skill-opt"
                :class="{ on: isSkillOn(s.id) }"
                @click="toggleSkill(s.id)"
              >
                <text class="skill-opt-t">{{ s.name }}</text>
              </view>
              <text v-if="!skillOptions.length" class="skill-empty">技能字典未加载（2.8 接口）</text>
            </view>
          </view>

          <!-- 其他开关 -->
          <view class="setting-group">
            <view class="switch-row">
              <text class="switch-label">发布后自动创建群聊</text>
              <view class="switch-box" :class="{ on: autoGroup }" @click="autoGroup = !autoGroup">
                <view class="switch-knob"></view>
              </view>
            </view>
            <view class="switch-row">
              <text class="switch-label">设置招募者等级筛选</text>
              <view class="switch-box" :class="{ on: levelFilterOn }" @click="toggleLevelFilter">
                <view class="switch-knob"></view>
              </view>
            </view>
            <view v-if="levelFilterOn" class="number-input-row sub">
              <text class="filter-label">最低等级</text>
              <view class="number-btn" data-action="decrement" data-target="minLevel" @click="onNumberBtn">−</view>
              <input
                class="number-input"
                v-model.number="minLevel"
                type="number"
                maxlength="3"
              />
              <view class="number-btn" data-action="increment" data-target="minLevel" @click="onNumberBtn">+</view>
            </view>
          </view>
        </view>

        <view class="sheet-footer">
          <view class="sheet-btn confirm" @click="confirmAdvanced">完成</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import CustomNavbar from '@/components/common/CustomNavbar.vue'
import { uploadWorkFile } from '@/api/works.js'
import { createProject } from '@/api/project.js'
import { getSkills } from '@/api/user.js'

const images = ref([])
const topic = ref('')
const intro = ref('')
const topicTag = ref('')
const showAdvanced = ref(false)

// 高级设置
const privacy = ref('public')
const privacyLabel = ref('公开可见')
const scheduleDate = ref('')
const scheduleTime = ref('')
const recruitCount = ref(10)
const autoGroup = ref(false)
const levelFilterOn = ref(false)
const minLevel = ref(1)

// 报酬：5.1 `mode`（free/paid）+ `budget`（int，单位元，不能为负）
// —— 后端 2026-09-27 答复 C-3 确认：`mode` 枚举 free/paid；`budget` 是 **int**（旧文档写 string 是错的）
const payMode = ref('free')
const budget = ref(1000)

// 优先技能：5.1 `required_skills` 传**技能 ID 数组**（int[]），上限沿用档案技能约定的 5 个
// ⚠️ 与「返回结构」不一致：项目详情返回的是对象数组（含 required_count/filled_count），入参仍是 int[]
const MAX_SKILLS = 5
const skillOptions = ref([])
const selectedSkills = ref([])
const skillPickerOpen = ref(false)

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
loadSkills()

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

/**
 * 截止时间 → ISO 8601（如 `2026-12-31T23:59:00`）
 * ⚠️ 后端用 `datetime.fromisoformat()` 解析，只传 `2026-12-31` 这种**纯日期**会在
 *   Python ≤ 3.10 抛 ValueError（接口 500）→ 这里补上时间，未选时间则默认 00:00。
 */
function buildDeadline() {
  if (!scheduleDate.value) return undefined
  const t = scheduleTime.value || '00:00'
  return scheduleDate.value + 'T' + (t.length === 5 ? t + ':00' : t)
}

const privacyOpts = [
  { key: 'public', label: '公开可见' },
  { key: 'fans', label: '粉丝可见' },
  { key: 'mutual', label: '仅互关好友可见' },
  { key: 'private', label: '仅自己可见' }
]

function addImage() {
  uni.chooseImage({
    count: 9 - images.value.length,
    success: (res) => {
      images.value = [...images.value, ...res.tempFilePaths]
    }
  })
}

function removeImage(index) {
  images.value.splice(index, 1)
}

function addTopic() {
  uni.showToast({ title: '添加话题', icon: 'none' })
}

function atSomeone() {
  uni.showToast({ title: '@提到', icon: 'none' })
}

function previewCoop() {
  uni.showToast({ title: '预览模式', icon: 'none' })
}

async function publishCoop() {
  if (!topic.value.trim()) {
    uni.showToast({ title: '请填写招募主题', icon: 'none' })
    return
  }
  uni.showLoading({ title: '发布中...', mask: true })
  try {
    // ① 封面图上传：后端没有「项目专用上传」接口，复用作品上传（同为图片/视频类型校验）
    //    TODO(契约待后端确认)：若后端提供项目上传接口再切换
    const covers = []
    for (const path of images.value) {
      const up = await uploadWorkFile(path)
      if (up && up.url) covers.push(up.url)
    }
    // ② 5.1 创建项目（默认状态 recruiting=招募中）
    // TODO：autoGroup（自动建群，需再调 7.2 创建群）、scheduleTime 的「定时发布」语义、
    //   privacy/可见性：文档的项目模型没有可见性字段，先不传
    await createProject({
      title: topic.value.trim(),
      description: intro.value.trim() || undefined,
      topic: topicTag.value || undefined,
      // mode/budget：后端 2026-09-27 答复 C-3 —— mode ∈ free|paid，budget 为 int（元）；
      // 免费模式不传 budget（后端默认 0）
      mode: payMode.value,
      budget: payMode.value === 'paid'
        ? Math.max(0, Math.round(Number(budget.value) || 0))
        : undefined,
      cover_url: covers[0] || undefined,
      max_members: recruitCount.value || undefined,
      required_level: levelFilterOn.value ? minLevel.value : undefined,
      // required_skills 入参为 int[]（技能 ID）
      required_skills: selectedSkills.value.length
        ? selectedSkills.value.map((s) => Number(s.id))
        : undefined,
      // deadline 必须 ISO 8601 带时间，见 buildDeadline()
      deadline: buildDeadline()
    })
    uni.hideLoading()
    uni.showToast({ title: '招募已发布', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1000)
  } catch (err) {
    uni.hideLoading()
    // 失败原因由 upload / request 层按错误码提示
  }
}

function onDateChange(e) {
  scheduleDate.value = e.detail.value
}

function onTimeChange(e) {
  scheduleTime.value = e.detail.value
}

function toggleLevelFilter() {
  levelFilterOn.value = !levelFilterOn.value
}

function onNumberBtn(e) {
  const target = e.currentTarget.dataset.target
  const action = e.currentTarget.dataset.action
  if (target === 'recruitCount') {
    if (action === 'decrement' && recruitCount.value > 1) recruitCount.value--
    if (action === 'increment') recruitCount.value++
  } else if (target === 'minLevel') {
    if (action === 'decrement' && minLevel.value > 1) minLevel.value--
    if (action === 'increment') minLevel.value++
  } else if (target === 'budget') {
    if (action === 'decrement' && budget.value > 0) budget.value = Math.max(0, budget.value - 100)
    if (action === 'increment') budget.value = (Number(budget.value) || 0) + 100
  }
}

function confirmAdvanced() {
  const found = privacyOpts.find(p => p.key === privacy.value)
  privacyLabel.value = found ? found.label : '公开可见'
  showAdvanced.value = false
}
</script>

<style scoped>
.page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.edit-scroll {
  height: calc(100vh - 120rpx);
}

/* 图片上传 */
.upload-section {
  background: #fff;
  padding: 24rpx;
}

.upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.upload-item {
  width: 200rpx;
  height: 200rpx;
  position: relative;
  border-radius: 12rpx;
  overflow: hidden;
}

.upload-img {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
}

.remove-img {
  position: absolute;
  top: 6rpx;
  right: 6rpx;
  width: 36rpx;
  height: 36rpx;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
}

.upload-add {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background: #fafafa;
}

.add-icon {
  font-size: 48rpx;
  color: #ccc;
}

.add-text {
  font-size: 22rpx;
  color: #bbb;
}

/* 输入区域 */
.input-section {
  background: #fff;
  padding: 24rpx 30rpx;
  margin-top: 10rpx;
}

.title-input {
  width: 100%;
  height: 80rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.body-input {
  width: 100%;
  min-height: 160rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  margin-top: 12rpx;
}

/* 功能选项 */
.options-section {
  background: #fff;
  margin-top: 10rpx;
  padding: 0 30rpx;
}

.option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.option-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.option-icon {
  font-size: 32rpx;
}

.option-label {
  font-size: 28rpx;
  color: #333;
}

.option-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.option-hint {
  font-size: 24rpx;
  color: #999;
}

.option-arrow {
  font-size: 28rpx;
  color: #ccc;
}

/* 高级设置入口 */
.advanced-section {
  background: #fff;
  margin-top: 10rpx;
  padding: 0 30rpx;
}

/* 底部栏 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 30rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.bar-left {
  display: flex;
  gap: 24rpx;
}

.bar-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 20rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
}

.bar-btn-icon {
  font-size: 24rpx;
}

.bar-btn-label {
  font-size: 24rpx;
  color: #666;
}

.publish-btn {
  background: #4455ee;
  color: #fff;
  padding: 18rpx 40rpx;
  border-radius: 36rpx;
  font-size: 28rpx;
  font-weight: 600;
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.advanced-sheet {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.sheet-handle {
  display: flex;
  justify-content: center;
  padding: 20rpx 0 10rpx;
}

.handle-bar {
  width: 60rpx;
  height: 6rpx;
  background: #ddd;
  border-radius: 3rpx;
}

.sheet-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  padding: 0 30rpx 20rpx;
}

.sheet-body {
  padding: 0 30rpx;
}

.setting-group {
  margin-bottom: 28rpx;
}

.setting-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.radio-list {
  display: flex;
  flex-direction: column;
}

.radio-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.radio-item.selected .radio-text {
  color: #4455ee;
  font-weight: 500;
}

.radio-text {
  font-size: 28rpx;
  color: #333;
}

.radio-box {
  width: 32rpx;
  height: 32rpx;
  border: 2px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-dot {
  width: 18rpx;
  height: 18rpx;
  background: #4455ee;
  border-radius: 50%;
}

.setting-row {
  display: flex;
  gap: 16rpx;
}

.picker-btn {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #333;
}

.picker-arrow {
  color: #ccc;
}

/* 数字输入 */
.number-input-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  justify-content: center;
}

.number-input-row.sub {
  margin-top: 12rpx;
  padding-left: 30rpx;
}

.number-btn {
  width: 64rpx;
  height: 64rpx;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}

.number-btn:active {
  background: #dcdcdc;
}

.number-input {
  width: 100rpx;
  height: 64rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.filter-label {
  font-size: 26rpx;
  color: #888;
}

/* 优先技能选择 */
.skill-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.skill-chip {
  display: flex;
  align-items: center;
  padding: 8rpx 18rpx;
  background: #eef0ff;
  border-radius: 24rpx;
}

.skill-chip-t {
  font-size: 26rpx;
  color: #4455ee;
}

.skill-chip-x {
  font-size: 22rpx;
  color: #4455ee;
  margin-left: 10rpx;
}

.skill-empty {
  font-size: 24rpx;
  color: #bbb;
}

.skill-toggle {
  height: 64rpx;
  border-radius: 32rpx;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #4455ee;
}

.skill-toggle:active {
  background: #ececec;
}

.skill-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  padding: 20rpx;
  margin-top: 16rpx;
  background: #fafafa;
  border-radius: 12rpx;
}

.skill-opt {
  padding: 10rpx 20rpx;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 24rpx;
}

.skill-opt.on {
  background: #eef0ff;
  border-color: #4455ee;
}

.skill-opt-t {
  font-size: 26rpx;
  color: #333;
}

.skill-opt.on .skill-opt-t {
  color: #4455ee;
}

/* 开关 */
.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.switch-label {
  font-size: 28rpx;
  color: #333;
}

.switch-box {
  width: 72rpx;
  height: 40rpx;
  background: #ddd;
  border-radius: 20rpx;
  position: relative;
  transition: 0.2s;
}

.switch-box.on {
  background: #4455ee;
}

.switch-knob {
  width: 32rpx;
  height: 32rpx;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: 0.2s;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2);
}

.switch-box.on .switch-knob {
  left: 36rpx;
}

.sheet-footer {
  padding: 24rpx 30rpx 30rpx;
}

.sheet-btn.confirm {
  width: 100%;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #4455ee;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
}
</style>