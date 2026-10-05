<template>
  <!-- 页面3：浏览记录页（二级页面） -->
  <view class="page">
    <!-- 顶部导航栏 -->
    <CustomNavbar title="浏览记录" showBack>
      <template #right>
        <view class="nav-btn" @click="toggleSelectMode">
          <text class="nav-btn-text">{{ isSelectMode ? '取消' : '选择' }}</text>
        </view>
        <view class="nav-btn" @click="search">
          <text class="search-icon">🔍</text>
        </view>
      </template>
    </CustomNavbar>

    <!-- Tab切换 -->
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab"
        :class="{ active: activeTab === tab.key }"
        :data-key="tab.key"
        @click="switchTab"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- 列表区域 -->
    <scroll-view
      scroll-y
      class="list-scroll"
      @scrolltolower="loadMore"
    >
      <view class="history-list">
        <view
          v-for="(item, index) in historyList"
          :key="index"
          class="history-item"
          :class="{ 'select-mode': isSelectMode, 'selected': item.selected, 'dimmed': isSelectMode && !item.selected }"
          :data-id="item.id"
          @click="handleItemClick"
        >
          <!-- 多选模式下的选择框 -->
          <view v-if="isSelectMode" class="select-box">
            <view class="checkbox" :class="{ checked: item.selected }">
              <text v-if="item.selected" class="check-mark">✓</text>
            </view>
          </view>

          <!-- 左侧视频缩略图 -->
          <view class="item-thumb" :class="{ 'thumb-dimmed': isSelectMode && !item.selected }">
            <image :src="item.thumb" mode="aspectFill" class="thumb-image"></image>
            <!-- 观看进度 -->
            <view class="progress-overlay">
              <view class="progress-bar" :style="{ width: item.progress + '%' }"></view>
            </view>
          </view>

          <!-- 右侧信息 -->
          <view class="item-info">
            <text class="item-title">{{ item.title }}</text>
            <text class="item-date">{{ item.date }}</text>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="load-more">
        <text v-if="hasMore" class="load-text">上拉加载更多</text>
        <text v-else class="load-text">— 没有更多了 —</text>
      </view>
    </scroll-view>

    <!-- 批量操作底部栏 -->
    <view v-if="isSelectMode && selectedCount > 0" class="batch-bar">
      <view class="batch-btn delete" @click="showDeleteConfirm">
        <text class="batch-btn-text">删除 ({{ selectedCount }})</text>
      </view>
      <view class="batch-btn fav" @click="batchFav">
        <text class="batch-btn-text">收藏 ({{ selectedCount }})</text>
      </view>
    </view>

    <!-- 删除确认弹窗 -->
    <ConfirmModal
      :visible="showDeleteModal"
      title="确认删除"
      message="确定要删除选中的浏览记录吗？"
      @confirm="confirmDelete"
      @close="showDeleteModal = false"
    />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import CustomNavbar from '@/components/common/CustomNavbar.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const tabs = [
  { key: 'user', label: '用户' },
  { key: 'video', label: '视频' }
]

const activeTab = ref('video')
const isSelectMode = ref(false)
const showDeleteModal = ref(false)
const hasMore = ref(true)

// 浏览记录数据（占位）
const historyList = ref([
  { id: 1, title: '视频标题1', thumb: '/static/default-avatar.png', progress: 60, date: '2024-01-15', selected: false },
  { id: 2, title: '视频标题2', thumb: '/static/default-avatar.png', progress: 30, date: '2024-01-14', selected: false },
  { id: 3, title: '视频标题3', thumb: '/static/default-avatar.png', progress: 90, date: '2024-01-13', selected: false },
  { id: 4, title: '视频标题4', thumb: '/static/default-avatar.png', progress: 45, date: '2024-01-12', selected: false },
  { id: 5, title: '视频标题5', thumb: '/static/default-avatar.png', progress: 75, date: '2024-01-11', selected: false }
])

// 选中数量
const selectedCount = computed(() => {
  return historyList.value.filter(item => item.selected).length
})

// 切换Tab
function switchTab(e) {
  const key = e.currentTarget.dataset.key
  activeTab.value = key
  isSelectMode.value = false
}

// 切换多选模式
function toggleSelectMode() {
  isSelectMode.value = !isSelectMode.value
  if (!isSelectMode.value) {
    // 退出多选模式时清除选中状态
    historyList.value.forEach(item => { item.selected = false })
  }
}

// 点击条目
function handleItemClick(e) {
  const id = parseInt(e.currentTarget.dataset.id)
  const item = historyList.value.find(function(item) { return item.id === id })
  if (!item) return
  if (isSelectMode.value) {
    // 多选模式：切换选中状态
    item.selected = !item.selected
  } else {
    // 非多选模式跳转详情
    uni.showToast({ title: '跳转视频详情', icon: 'none' })
  }
}

// 加载更多
function loadMore() {
  if (!hasMore.value) return
  uni.showToast({ title: '加载更多...', icon: 'none' })
}

// 搜索
function search() {
  uni.navigateTo({ url: '/pages/search/index' })
}

// 显示删除确认弹窗
function showDeleteConfirm() {
  showDeleteModal.value = true
}

// 确认删除
function confirmDelete() {
  historyList.value = historyList.value.filter(item => !item.selected)
  isSelectMode.value = false
  uni.showToast({ title: '删除成功', icon: 'success' })
}

// 批量收藏
function batchFav() {
  uni.showToast({ title: '收藏成功', icon: 'success' })
  isSelectMode.value = false
  historyList.value.forEach(item => { item.selected = false })
}
</script>

<style scoped>
.page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 60px;
}

.nav-btn {
  padding: 8px;
}

.nav-btn-text {
  font-size: 14px;
  color: #007aff;
}

.search-icon {
  font-size: 20px;
}

/* Tab切换 */
.tabs {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.tab {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  position: relative;
}

.tab.active {
  color: #333;
  font-weight: 600;
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

/* 列表 */
.list-scroll {
  height: calc(100vh - 132px);
}

.history-list {
  background: #fff;
  padding: 0 16px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  transition: opacity 0.2s;
}

.history-item.select-mode {
  padding-left: 0;
}

/* 未选中的条目变灰 */
.history-item.dimmed {
  opacity: 0.4;
}

/* 选中的条目 */
.history-item.selected {
  background: #f8f8f8;
  margin: 0 -16px;
  padding-left: 16px;
  padding-right: 16px;
}

/* 选择框 */
.select-box {
  margin-right: 10px;
  flex-shrink: 0;
}

.checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.checked {
  background: #007aff;
  border-color: #007aff;
}

.check-mark {
  color: #fff;
  font-size: 12px;
  font-weight: bold;
}

/* 缩略图 */
.item-thumb {
  width: 100px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  background: #f0f0f0;
  transition: opacity 0.2s;
}

.thumb-dimmed {
  opacity: 0.5;
}

.thumb-image {
  width: 100%;
  height: 100%;
}

.progress-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0,0,0,0.3);
}

.progress-bar {
  height: 100%;
  background: #007aff;
}

/* 信息 */
.item-info {
  flex: 1;
  margin-left: 12px;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  color: #333;
  display: block;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-date {
  font-size: 12px;
  color: #999;
  margin-top: 6px;
  display: block;
}

/* 加载更多 */
.load-more {
  padding: 20px;
  text-align: center;
}

.load-text {
  font-size: 13px;
  color: #bbb;
}

/* 批量操作栏 */
.batch-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 56px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid #f0f0f0;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
}

.batch-btn {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 20px;
  border-radius: 20px;
}

.batch-btn.delete {
  background: #ff4757;
}

.batch-btn.fav {
  background: #f0f0f0;
}

.batch-btn-text {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

.batch-btn.fav .batch-btn-text {
  color: #333;
}
</style>