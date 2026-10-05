<template>
  <!-- 页面1：个人资料详情页（二级页面） -->
  <view class="page">
    <!-- 顶部导航栏 -->
    <CustomNavbar title="个人资料" showBack>
      <template #right>
        <view v-if="isSelf" class="nav-btn" @click="showQRCode">
          <text class="qrcode-icon">📱</text>
        </view>
      </template>
    </CustomNavbar>

    <!-- 演示数据灰标：接口不可用、回退到本地假数据时显示 -->
    <DemoBadge :show="isDemo" position="top-right" />

    <scroll-view scroll-y class="page-scroll">
      <!-- 头像与用户名区域 -->
      <view class="profile-header">
        <view class="avatar-edit-wrapper" @click="editAvatar">
          <UserAvatar :src="userInfo.avatar" :size="80" :frame="userInfo.avatarFrame" :showCrown="true" />
          <view v-if="isSelf" class="avatar-edit-overlay">
            <text class="edit-icon">📷</text>
          </view>
        </view>
        <text class="user-name">{{ userInfo.nickname }}</text>
        <text class="user-id">ID: {{ userInfo.id }}</text>

        <!-- 个人二维码入口（仅本人可见：二维码指向自己的主页） -->
        <view v-if="isSelf" class="qrcode-entry" @click="showQRCode">
          <text class="qrcode-entry-icon">📱</text>
          <text class="qrcode-entry-text">我的二维码</text>
          <text class="qrcode-entry-arrow">›</text>
        </view>
      </view>

      <!-- 资料完善度进度条 -->
      <view class="profile-progress">
        <view class="progress-header">
          <text class="progress-label">资料完善度</text>
          <text class="progress-value">{{ profileProgress }}%</text>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: profileProgress + '%' }"></view>
        </view>
      </view>

      <!-- 个人标签 -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">个人标签</text>
          <text v-if="isSelf" class="section-edit" @click="editTags">编辑</text>
        </view>
        <view class="tags-list">
          <view v-for="(tag, index) in userTags" :key="index" class="tag-item">
            <text class="tag-text">{{ tag }}</text>
          </view>
          <view v-if="isSelf" class="tag-item add-tag" @click="editTags">
            <text class="tag-text add-text">＋</text>
          </view>
        </view>
      </view>

      <!-- 信息模块列表 -->
      <view class="info-section">
        <!-- 教育背景 -->
        <view class="info-card" @click="editEducation">
          <view class="info-card-header">
            <text class="info-card-icon">🎓</text>
            <text class="info-card-title">教育背景</text>
          </view>
          <view class="info-card-body">
            <text v-if="userInfo.education" class="info-text">{{ userInfo.education }}</text>
            <text v-else class="info-placeholder">点击添加教育背景</text>
          </view>
          <view class="info-card-arrow">
            <text class="arrow-icon">›</text>
          </view>
        </view>

        <!-- 职业经历 -->
        <view class="info-card" @click="editCareer">
          <view class="info-card-header">
            <text class="info-card-icon">💼</text>
            <text class="info-card-title">职业经历</text>
          </view>
          <view class="info-card-body">
            <text v-if="userInfo.career" class="info-text">{{ userInfo.career }}</text>
            <text v-else class="info-placeholder">点击添加职业经历</text>
          </view>
          <view class="info-card-arrow">
            <text class="arrow-icon">›</text>
          </view>
        </view>

        <!-- 作品集 -->
        <view class="info-card" @click="editPortfolio">
          <view class="info-card-header">
            <text class="info-card-icon">🖼️</text>
            <text class="info-card-title">作品集</text>
          </view>
          <view class="info-card-body">
            <scroll-view scroll-x class="portfolio-scroll" v-if="portfolioList.length > 0">
              <view class="portfolio-list">
                <view v-for="(item, index) in portfolioList" :key="index" class="portfolio-item">
                  <WorkCard
                    :src="item.src"
                    :title="item.title"
                    :author="item.author"
                    :likes="item.likes"
                  />
                </view>
              </view>
            </scroll-view>
            <text v-else class="info-placeholder">点击添加作品</text>
          </view>
          <view class="info-card-arrow">
            <text class="arrow-icon">›</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import CustomNavbar from '@/components/common/CustomNavbar.vue'
import UserAvatar from '@/components/common/UserAvatar.vue'
import WorkCard from '@/components/common/WorkCard.vue'
import DemoBadge from '@/components/common/DemoBadge.vue'
import { mockUsers, mockWorks } from '@/mock/index.js'
import { getHomepage, getProfile, uploadProfileFile } from '@/api/user.js'
import { getUserWorks } from '@/api/works.js'
import { normalizeUser, normalizeWorkList } from '@/api/adapter.js'
import { withFallback } from '@/utils/fallback.js'
import { getUserInfo } from '@/utils/auth.js'

const userId = ref(null)
const isSelf = ref(true) // 是否本人（后端 2.4 返回 is_self；他人主页隐藏编辑入口）
const isDemo = ref(false)

// 用户信息：2.4 个人主页聚合 + 2.3 完整档案（教育/工作经历）
const userInfo = ref({
  avatar: '/static/default-avatar.png',
  avatarFrame: '',
  nickname: '用户',
  id: '',
  bio: '',
  identity: '',
  education: '',
  career: ''
})
const userTags = ref([])
const profileProgress = ref(0)
const portfolioList = ref([])

onLoad((options) => {
  userId.value = options && (options.id || options.userId)
  loadAll()
})

async function loadAll() {
  if (!userId.value) {
    isDemo.value = true
    return
  }
  const { data, isFallback } = await withFallback(
    async () => {
      const [home, profile, works] = await Promise.all([
        getHomepage(userId.value),
        getProfile(userId.value).catch(() => null), // 无档案时返回 404，忽略
        getUserWorks(userId.value, { page: 1, page_size: 6 }).catch(() => null)
      ])
      return { home, profile, works: normalizeWorkList(works) }
    },
    () => {
      const u = mockUsers[userId.value]
      return u ? { mock: u } : null
    },
    'user/detail: 个人主页'
  )
  isDemo.value = isFallback
  if (!data) return
  if (data.mock) {
    fillFromMock(data.mock)
    return
  }
  if (!data.home) return
  fillFromApi(data.home, data.profile, data.works)
}

function myId() {
  const me = getUserInfo() || {}
  return me.user_id || me.id || ''
}

/** 真实数据 → 页面字段 */
function fillFromApi(home, profile, works) {
  const u = normalizeUser(home.user || {})
  const p = profile || {}
  const edu = Array.isArray(p.education_experiences) ? p.education_experiences : []
  const jobs = Array.isArray(p.work_experiences) ? p.work_experiences : []
  const hp = home.profile || {}
  const skills = hp.skills || p.skills || []
  const styles = hp.style_tags || p.style_tags || []

  userInfo.value = {
    avatar: u.avatar || '/static/default-avatar.png',
    avatarFrame: '', // 后端无头像框字段（见 docs/给后端的接口问题清单.md）
    nickname: u.nickname || '用户',
    id: u.id,
    bio: u.bio,
    identity: hp.identity || p.identity || '',
    education: edu.map(formatEdu).filter(Boolean).join(' / '),
    career: jobs.map(formatJob).filter(Boolean).join(' / ')
  }
  userTags.value = skills
    .concat(styles)
    .map((t) => t && t.name)
    .filter(Boolean)

  portfolioList.value = (works || []).map((w) => ({
    src: w.cover || (w.images && w.images[0]) || '',
    title: w.title || w.text,
    author: w.author,
    likes: w.likes
  }))

  const mine = myId()
  isSelf.value = home.is_self === true || (!!mine && String(mine) === String(u.id))
  profileProgress.value = computeProgress(userInfo.value, userTags.value, edu.length, jobs.length)
}

/** 演示数据 → 页面字段（保持原有编辑入口可见） */
function fillFromMock(u) {
  userInfo.value = {
    avatar: u.avatar || '/static/default-avatar.png',
    avatarFrame: u.avatarFrame || '',
    nickname: u.nickname || '用户',
    id: u.id,
    bio: u.intro || '',
    identity: '',
    education: u.education || '',
    career: u.career || ''
  }
  userTags.value = u.tags || []
  portfolioList.value = Object.values(mockWorks).slice(0, 3).map((w) => ({
    src: w.cover || (w.images && w.images[0]) || '',
    title: w.title,
    author: w.author,
    likes: w.likes
  }))
  isSelf.value = true
  profileProgress.value = computeProgress(userInfo.value, userTags.value, 0, 0)
}

function formatEdu(e) {
  if (!e) return ''
  return [e.school_name, e.major].filter(Boolean).join('·')
}

function formatJob(j) {
  if (!j) return ''
  return [j.company_name, j.position].filter(Boolean).join('·')
}

/** 完善度：头像 / 昵称 / 简介 / 身份 / 标签 / 教育 / 工作 七项里已填的占比 */
function computeProgress(info, tags, eduCount, jobCount) {
  const items = [
    !!info.avatar && info.avatar.indexOf('default-avatar') === -1,
    !!info.nickname && info.nickname !== '用户',
    !!info.bio,
    !!info.identity,
    tags.length > 0,
    eduCount > 0,
    jobCount > 0
  ]
  return Math.round((items.filter(Boolean).length / items.length) * 100)
}

// 编辑头像：2.27 档案文件上传（单文件，字段名 file）
function editAvatar() {
  if (!isSelf.value) return
  uni.chooseImage({
    count: 1,
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const filePath = (res.tempFilePaths || [])[0]
      if (!filePath) return
      uni.showLoading({ title: '上传中...', mask: true })
      try {
        const file = await uploadProfileFile(filePath)
        // TODO(契约待后端确认)：把 file.url 写入用户头像的字段名（avatar？）与对应接口
        // 09-15 文档未给出，故这里不本地伪造「已保存」，仅提示上传结果
        console.log('[profile upload]', file.url)
        uni.showToast({ title: '头像已上传，落库字段待后端确认', icon: 'none' })
      } catch (e) {
        /* 失败已由 upload 层提示 */
      } finally {
        uni.hideLoading()
      }
    }
  })
}

// 编辑标签（技能 / 风格词汇：2.9 / 2.13，编辑入口在技能页，后续接入）
function editTags() {
  uni.showToast({ title: '编辑个人标签', icon: 'none' })
}

// 编辑教育背景（2.19~2.22）
function editEducation() {
  uni.showToast({ title: '打开教育背景编辑', icon: 'none' })
}

// 编辑职业经历（2.15~2.18）
function editCareer() {
  uni.showToast({ title: '打开职业经历编辑', icon: 'none' })
}

// 编辑作品集（作品由 3.1 创建/3.2 编辑）
function editPortfolio() {
  uni.showToast({ title: '打开作品集编辑', icon: 'none' })
}

// 跳转二维码页
function showQRCode() {
  uni.navigateTo({
    url: '/pages/qrcode/index'
  })
}
</script>

<style scoped>
.page {
  background: #f5f5f5;
  min-height: 100vh;
}

.page-scroll {
  height: calc(100vh - 88px);
}

.nav-btn {
  padding: 8px;
}

.qrcode-icon {
  font-size: 22px;
}

/* 头像区域 */
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px 20px;
  background: #fff;
}

.avatar-edit-wrapper {
  position: relative;
  cursor: pointer;
}

.avatar-edit-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background: #007aff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.edit-icon {
  font-size: 14px;
  color: #fff;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-top: 12px;
}

.user-id {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

/* 二维码入口 */
.qrcode-entry {
  display: flex;
  align-items: center;
  margin-top: 12px;
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 20px;
}

.qrcode-entry-icon {
  font-size: 16px;
  margin-right: 6px;
}

.qrcode-entry-text {
  font-size: 13px;
  color: #007aff;
}

.qrcode-entry-arrow {
  font-size: 16px;
  color: #007aff;
  margin-left: 4px;
}

/* 进度条 */
.profile-progress {
  background: #fff;
  padding: 0 20px 20px;
  margin-bottom: 10px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 13px;
  color: #666;
}

.progress-value {
  font-size: 13px;
  color: #007aff;
  font-weight: 500;
}

.progress-bar {
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007aff, #00c6ff);
  border-radius: 3px;
  transition: width 0.3s;
}

/* 个人标签 */
.section-card {
  background: #fff;
  padding: 16px 20px;
  margin-bottom: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.section-edit {
  font-size: 13px;
  color: #007aff;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 6px 14px;
  background: #f0f7ff;
  border-radius: 16px;
}

.tag-text {
  font-size: 13px;
  color: #007aff;
}

.tag-item.add-tag {
  background: #f5f5f5;
  border: 1px dashed #ddd;
}

.add-text {
  color: #999;
}

/* 信息卡片 */
.info-section {
  padding: 0 16px 20px;
}

.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
  position: relative;
}

.info-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-card-icon {
  font-size: 18px;
  margin-right: 8px;
}

.info-card-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.info-card-body {
  padding-left: 26px;
}

.info-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.info-placeholder {
  font-size: 14px;
  color: #bbb;
}

.info-card-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.arrow-icon {
  font-size: 20px;
  color: #ccc;
  font-weight: bold;
}

/* 作品集横向滚动 */
.portfolio-scroll {
  width: 100%;
  overflow: hidden;
}

.portfolio-list {
  display: flex;
  gap: 10px;
  padding: 4px 0;
}

.portfolio-item {
  width: 140px;
  flex-shrink: 0;
}
</style>
