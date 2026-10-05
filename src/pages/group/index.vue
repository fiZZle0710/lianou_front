<template>
  <!-- 页面4：群聊列表页（二级页面） -->
  <view class="page">
    <!-- 顶部导航栏 -->
    <CustomNavbar title="群聊" showBack>
      <template #right>
        <view class="nav-btn" @click="createGroup">
          <text class="add-icon">＋</text>
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

    <!-- 群聊列表 -->
    <scroll-view
      scroll-y
      class="list-scroll"
      @scrolltolower="loadMore"
    >
      <view class="group-list">
        <view
          v-for="(item, index) in groupList"
          :key="index"
          class="group-item"
          :data-id="item.id"
          @click="enterGroup"
        >
          <!-- 左侧群聊头像 -->
          <view class="group-avatar">
            <image :src="item.avatar" mode="aspectFill" class="avatar-image"></image>
          </view>

          <!-- 中间信息 -->
          <view class="group-info">
            <text class="group-name">{{ item.name }}</text>
            <text class="group-members">{{ item.memberCount }}人</text>
          </view>

          <!-- 右侧箭头 -->
          <view class="group-arrow">
            <text class="arrow-icon">›</text>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="load-more">
        <text v-if="hasMore" class="load-text">上拉加载更多</text>
        <text v-else class="load-text">— 没有更多了 —</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import CustomNavbar from '@/components/common/CustomNavbar.vue'

const tabs = [
  { key: 'created', label: '我创建的' },
  { key: 'joined', label: '我加入的' }
]

const activeTab = ref('created')
const hasMore = ref(true)

// 群聊列表数据（占位）
const groupList = ref([
  { id: 'g1', name: '创作交流群', avatar: '/static/default-avatar.png', memberCount: 128 },
  { id: 'g2', name: '项目讨论组', avatar: '/static/default-avatar.png', memberCount: 56 },
  { id: 'g3', name: '设计灵感群', avatar: '/static/default-avatar.png', memberCount: 89 }
])

// 切换Tab
function switchTab(e) {
  const key = e.currentTarget.dataset.key
  activeTab.value = key
}

// 创建群聊
function createGroup() {
  uni.showToast({ title: '创建群聊', icon: 'none' })
}

// 进入群聊会话
function enterGroup(e) {
  const id = e.currentTarget.dataset.id
  const item = groupList.value.find(function(item) { return item.id === id })
  if (!item) return
  uni.navigateTo({
    url: `/pages/chat/index?groupId=${item.id}&groupName=${item.name}`
  })
}

// 加载更多
function loadMore() {
  if (!hasMore.value) return
  uni.showToast({ title: '加载更多...', icon: 'none' })
}
</script>

<style scoped>
.page {
  background: #f5f5f5;
  min-height: 100vh;
}

.nav-btn {
  padding: 8px;
}

.add-icon {
  font-size: 24px;
  font-weight: bold;
  color: #333;
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

.group-list {
  background: #fff;
  padding: 0 16px;
}

.group-item {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
}

.group-item:last-child {
  border-bottom: none;
}

.group-avatar {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f0f0f0;
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.group-info {
  flex: 1;
  margin-left: 12px;
  min-width: 0;
}

.group-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  display: block;
}

.group-members {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  display: block;
}

.group-arrow {
  flex-shrink: 0;
  margin-left: 12px;
}

.arrow-icon {
  font-size: 20px;
  color: #ccc;
  font-weight: bold;
}

.load-more {
  padding: 20px;
  text-align: center;
}

.load-text {
  font-size: 13px;
  color: #bbb;
}
</style>