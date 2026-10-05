<template>
  <view class="container">
    <!-- 分类栏 -->
    <view class="tabs">
      <view
        v-for="item in tabs"
        :key="item"
        class="tab"
        :class="{ active: active === item }"
        :data-key="item"
        @click="change"
      >
        {{ item }}
      </view>

      <!-- 搜索图标/搜索框 -->
      <view class="search-wrapper">
        <view v-if="showSearch" class="search-input-box">
          <input
            class="search-input"
            v-model="searchKeyword"
            type="text"
            placeholder="搜索..."
            confirm-type="search"
            @confirm="doSearch"
            @blur="closeSearch"
            focus
          />
          <text class="search-close" @click="closeSearch">✕</text>
        </view>
        <view v-else class="search-icon" @click="openSearch">
          <text class="search-icon-text">🔍</text>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content">
      <!-- 作品标签：双列瀑布流 -->
      <view v-if="active === '作品'" class="tab-content">
        <!-- 发布状态卡片 -->
        <view v-if="publishStatus" class="publish-status-card" :class="publishStatus">
          <view class="status-icon">
            <text v-if="publishStatus === 'publishing'">⏳</text>
            <text v-else>✅</text>
          </view>
          <view class="status-info">
            <text class="status-text">
              {{ publishStatus === 'publishing' ? '发布中……' : '发布成功！' }}
            </text>
            <!-- 发布成功后显示分享渠道 -->
            <view v-if="publishStatus === 'done'" class="share-channels">
              <view class="channel-btn" data-channel="internal" @click="shareTo">
                <text>站内分享</text>
              </view>
              <view class="channel-btn" data-channel="wechat" @click="shareTo">
                <text>微信</text>
              </view>
              <view class="channel-btn" data-channel="qq" @click="shareTo">
                <text>QQ</text>
              </view>
            </view>
          </view>
          <text v-if="publishStatus === 'done'" class="close-status" @click="clearPublishStatus">✕</text>
        </view>

        <view class="waterfall">
          <view class="waterfall-column">
            <view v-for="(item, index) in leftWorks" :key="index" class="waterfall-item">
              <WorkCard
                :src="item.src"
                :title="item.title"
                :author="item.author"
                :likes="item.likes"
                :showFav="item.showFav"
              />
            </view>
          </view>
          <view class="waterfall-column">
            <view v-for="(item, index) in rightWorks" :key="index" class="waterfall-item">
              <WorkCard
                :src="item.src"
                :title="item.title"
                :author="item.author"
                :likes="item.likes"
                :showFav="item.showFav"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 项目标签 -->
      <view v-if="active === '项目'" class="tab-content">
        <view class="project-section">
          <view class="create-btn" @click="createProject">
            <text class="create-btn-text">＋ 创建新项目</text>
          </view>

          <view class="project-block">
            <text class="block-title">我发起的</text>
            <scroll-view scroll-x class="horizontal-scroll" show-scrollbar="false">
              <view class="card-list">
                <view
                  v-for="(item, index) in myProjects"
                  :key="index"
                  class="project-card"
                  :class="{ completed: item.completed }"
                >
                  <text class="card-name">{{ item.name }}</text>
                  <text class="card-status">{{ item.completed ? '已完成' : '进行中' }}</text>
                </view>
              </view>
            </scroll-view>
          </view>

          <view class="project-block">
            <text class="block-title">我参与的</text>
            <scroll-view scroll-x class="horizontal-scroll" show-scrollbar="false">
              <view class="card-list">
                <view
                  v-for="(item, index) in joinedProjects"
                  :key="index"
                  class="project-card placeholder"
                >
                  <text class="card-name">{{ item.name || '空位' }}</text>
                </view>
              </view>
            </scroll-view>
          </view>
        </view>
      </view>

      <!-- 活动标签 -->
      <view v-if="active === '活动'" class="tab-content">
        <view class="activity-section">
          <text class="activity-title">我参与过的活动</text>
          <view class="activity-list">
            <view
              v-for="(item, index) in activities"
              :key="index"
              class="activity-card"
            >
              <view class="activity-image">
                <image :src="item.image" mode="aspectFill" class="act-img"></image>
              </view>
              <view class="activity-info">
                <text class="act-name">{{ item.name }}</text>
                <text class="act-date">{{ item.date }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 收藏标签 -->
      <view v-if="active === '收藏'" class="tab-content">
        <view class="collection-section">
          <view class="create-btn" @click="createCollection">
            <text class="create-btn-text">＋ 创建新收藏集</text>
          </view>

          <scroll-view scroll-x class="horizontal-scroll" show-scrollbar="false">
            <view class="card-list">
              <view
                v-for="(item, index) in collections"
                :key="index"
                class="collection-card"
              >
                <view class="collection-cover">
                  <image :src="item.cover" mode="aspectFill" class="cover-img"></image>
                </view>
                <text class="collection-name">{{ item.name }}</text>
                <text class="collection-count">{{ item.count }}个作品</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import WorkCard from '@/components/common/WorkCard.vue'

const props = defineProps({
  publishStatus: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['clearPublish'])

const tabs = ['作品', '项目', '活动', '收藏']
const active = ref('作品')
const showSearch = ref(false)
const searchKeyword = ref('')

// 作品数据（占位）
const works = ref([
  { src: '', title: '作品标题1', author: '作者A', likes: 128, showFav: true },
  { src: '', title: '作品标题2', author: '作者B', likes: 256, showFav: false },
  { src: '', title: '作品标题3', author: '作者C', likes: 64, showFav: true },
  { src: '', title: '作品标题4', author: '作者D', likes: 512, showFav: false }
])

const leftWorks = computed(() => works.value.filter((_, i) => i % 2 === 0))
const rightWorks = computed(() => works.value.filter((_, i) => i % 2 === 1))

// 项目数据（占位）
const myProjects = ref([
  { name: '项目A', completed: false },
  { name: '项目B', completed: true },
  { name: '项目C', completed: false },
  { name: '项目D', completed: false },
  { name: '项目E', completed: true }
])

const joinedProjects = ref([
  { name: '' },
  { name: '' },
  { name: '' },
  { name: '' }
])

// 活动数据（占位）
const activities = ref([
  { name: '创作大赛2024', date: '2024-01-15', image: '' },
  { name: '设计分享会', date: '2024-01-20', image: '' }
])

// 收藏集数据（占位）
const collections = ref([
  { name: '灵感收集', cover: '', count: 12 },
  { name: '设计参考', cover: '', count: 8 },
  { name: '优秀作品', cover: '', count: 24 },
  { name: 'UI素材', cover: '', count: 16 }
])

function change(e) {
  const item = e.currentTarget.dataset.key
  active.value = item
  closeSearch()
}

// 搜索框展开/收起
function openSearch() {
  showSearch.value = true
  searchKeyword.value = ''
}

function closeSearch() {
  showSearch.value = false
  searchKeyword.value = ''
}

function doSearch() {
  if (!searchKeyword.value.trim()) return
  uni.navigateTo({
    url: `/pages/search/index?keyword=${encodeURIComponent(searchKeyword.value)}`
  })
  closeSearch()
}

function createProject() {
  uni.showToast({ title: '创建新项目', icon: 'none' })
}

function createCollection() {
  uni.showToast({ title: '创建新收藏集', icon: 'none' })
}

function clearPublishStatus() {
  emit('clearPublish')
}

function shareTo(e) {
  const channel = e.currentTarget.dataset.channel
  uni.showToast({ title: `分享到${channel}`, icon: 'none' })
}
</script>

<style scoped>
.container {
  background: #f5f5f5;
}

/* 分类栏 */
.tabs {
  height: 50px;
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab {
  flex: 1;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 14px;
  color: #666;
}

.tab.active {
  font-weight: 600;
  color: #333;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  width: 30px;
  height: 3px;
  background: #333;
  border-radius: 2px;
}

/* 搜索区域 */
.search-wrapper {
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.search-icon {
  padding: 0 8px;
}

.search-icon-text {
  font-size: 20px;
}

.search-input-box {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  left: 0;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 12px;
  z-index: 20;
}

.search-input {
  flex: 1;
  height: 34px;
  background: #f5f5f5;
  border-radius: 17px;
  padding: 0 12px;
  font-size: 13px;
}

.search-close {
  font-size: 14px;
  color: #999;
  margin-left: 8px;
  padding: 4px;
}

/* 内容区域 */
.content {
  min-height: 300px;
  padding-bottom: 20px;
}

.tab-content {
  padding: 12px;
}

/* 发布状态卡片 */
.publish-status-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  position: relative;
}

.publish-status-card.publishing {
  border-left: 4px solid #ff9500;
}

.publish-status-card.done {
  border-left: 4px solid #34c759;
}

.status-icon {
  font-size: 32px;
  margin-right: 12px;
}

.status-info {
  flex: 1;
}

.status-text {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  display: block;
}

.share-channels {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.channel-btn {
  padding: 6px 14px;
  background: #f5f5f5;
  border-radius: 16px;
  font-size: 12px;
  color: #007aff;
}

.channel-btn:active {
  background: #e8e8e8;
}

.close-status {
  position: absolute;
  top: 10px;
  right: 12px;
  font-size: 16px;
  color: #ccc;
  padding: 4px;
}

/* 双列瀑布流 */
.waterfall {
  display: flex;
  gap: 10px;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.waterfall-item {
  break-inside: avoid;
}

/* 项目区域 */
.project-section {
  padding: 0 4px;
}

.create-btn {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 16px;
  border: 1px dashed #ddd;
}

.create-btn-text {
  font-size: 14px;
  color: #007aff;
}

.project-block {
  margin-bottom: 20px;
}

.block-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 10px;
}

.horizontal-scroll {
  width: 100%;
  overflow: hidden;
}

.card-list {
  display: flex;
  gap: 12px;
  padding: 4px 0;
}

.project-card {
  width: 140px;
  height: 100px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.project-card.completed {
  opacity: 0.5;
}

.project-card.placeholder {
  border: 1px dashed #ddd;
  background: transparent;
  justify-content: center;
  align-items: center;
}

.card-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.card-status {
  font-size: 12px;
  color: #999;
}

/* 活动区域 */
.activity-section {
  padding: 0 4px;
}

.activity-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 12px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-card {
  display: flex;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.activity-image {
  width: 100px;
  height: 80px;
  background: #f0f0f0;
  flex-shrink: 0;
}

.act-img {
  width: 100%;
  height: 100%;
}

.activity-info {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.act-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.act-date {
  font-size: 12px;
  color: #999;
  margin-top: 6px;
}

/* 收藏区域 */
.collection-section {
  padding: 0 4px;
}

.collection-card {
  width: 140px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.collection-cover {
  width: 100%;
  height: 100px;
  background: #f0f0f0;
}

.cover-img {
  width: 100%;
  height: 100%;
}

.collection-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: block;
  padding: 8px 10px 2px;
}

.collection-count {
  font-size: 12px;
  color: #999;
  display: block;
  padding: 0 10px 10px;
}
</style>