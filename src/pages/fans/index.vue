<template>
  <!-- 页面2：粉丝列表页（二级页面） -->
  <view class="page">
    <CustomNavbar title="粉丝" showBack />

    <scroll-view
      scroll-y
      class="list-scroll"
      @scrolltolower="loadMore"
    >
      <!-- 粉丝列表 -->
      <view class="fans-list">
        <view
          v-for="(item, index) in fansList"
          :key="index"
          class="fans-item"
        >
          <!-- 左侧头像 -->
          <UserAvatar
            :src="item.avatar"
            :size="48"
            :data-id="item.id"
            @click="goUserPage"
          />

          <!-- 中间昵称 -->
          <view class="fans-info" :data-id="item.id" @click="goUserPage">
            <text class="fans-name">{{ item.nickname }}</text>
            <text v-if="item.signature" class="fans-signature">{{ item.signature }}</text>
          </view>

          <!-- 右侧发消息按钮 -->
          <view class="fans-action">
            <view class="msg-btn" :data-id="item.id" @click="sendMessage">
              <text class="msg-btn-text">发消息</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多提示 -->
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
import UserAvatar from '@/components/common/UserAvatar.vue'

// 粉丝列表数据（占位）
const fansList = ref([
  { id: '1001', nickname: '用户A', avatar: '/static/default-avatar.png', signature: '这个人很懒，什么都没写' },
  { id: '1002', nickname: '用户B', avatar: '/static/default-avatar.png', signature: '' },
  { id: '1003', nickname: '用户C', avatar: '/static/default-avatar.png', signature: '热爱创作每一天' }
])

const hasMore = ref(true)
const page = ref(1)

// 无限滚动加载
function loadMore() {
  if (!hasMore.value) return
  page.value++
  // 模拟加载更多数据
  uni.showToast({ title: '加载更多...', icon: 'none' })
}

// 点击用户头像/昵称进入对方主页
function goUserPage(e) {
  const id = e.currentTarget ? e.currentTarget.dataset.id : null
  if (!id) return
  uni.navigateTo({
    url: `/pages/user/detail?userId=${id}`
  })
}

// 点击发消息跳转聊天页
function sendMessage(e) {
  const id = e.currentTarget ? e.currentTarget.dataset.id : null
  if (!id) return
  const item = fansList.value.find(function(item) { return item.id === id })
  if (!item) return
  uni.navigateTo({
    url: `/pages/chat/index?userId=${id}&nickname=${item.nickname}`
  })
}
</script>

<style scoped>
.page {
  background: #f5f5f5;
  min-height: 100vh;
}

.list-scroll {
  height: calc(100vh - 88px);
}

.fans-list {
  background: #fff;
  padding: 0 16px;
}

.fans-item {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
}

.fans-item:last-child {
  border-bottom: none;
}

.fans-info {
  flex: 1;
  margin-left: 12px;
  min-width: 0;
}

.fans-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  display: block;
}

.fans-signature {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fans-action {
  flex-shrink: 0;
  margin-left: 12px;
}

.msg-btn {
  padding: 6px 16px;
  border: 1px solid #007aff;
  border-radius: 20px;
}

.msg-btn-text {
  font-size: 13px;
  color: #007aff;
}

.msg-btn:active {
  background: #f0f7ff;
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