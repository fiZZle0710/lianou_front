<template>
  <!-- 关注列表页（二级页面） -->
  <view class="page">
    <CustomNavbar title="关注" showBack />

    <scroll-view
      scroll-y
      class="list-scroll"
      @scrolltolower="loadMore"
    >
      <!-- 关注列表 -->
      <view class="follow-list">
        <view
          v-for="(item, index) in followList"
          :key="index"
          class="follow-item"
        >
          <!-- 左侧头像 -->
          <UserAvatar
            :src="item.avatar"
            :size="48"
            @click="goUserPage(item)"
          />

          <!-- 中间昵称 -->
          <view class="follow-info" @click="goUserPage(item)">
            <text class="follow-name">{{ item.nickname }}</text>
            <text v-if="item.signature" class="follow-signature">{{ item.signature }}</text>
          </view>

          <!-- 右侧发消息按钮 -->
          <view class="follow-action">
            <view class="msg-btn" @click="sendMessage(item)">
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

const followList = ref([
  { id: '2001', nickname: '关注用户A', avatar: '/static/default-avatar.png', signature: '热爱生活' },
  { id: '2002', nickname: '关注用户B', avatar: '/static/default-avatar.png', signature: '' },
  { id: '2003', nickname: '关注用户C', avatar: '/static/default-avatar.png', signature: '设计爱好者' }
])

const hasMore = ref(true)

function loadMore() {
  if (!hasMore.value) return
  uni.showToast({ title: '加载更多...', icon: 'none' })
}

function goUserPage(item) {
  uni.navigateTo({
    url: `/pages/user/detail?userId=${item.id}`
  })
}

function sendMessage(item) {
  uni.navigateTo({
    url: `/pages/chat/index?userId=${item.id}&nickname=${item.nickname}`
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

.follow-list {
  background: #fff;
  padding: 0 16px;
}

.follow-item {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
}

.follow-item:last-child {
  border-bottom: none;
}

.follow-info {
  flex: 1;
  margin-left: 12px;
  min-width: 0;
}

.follow-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  display: block;
}

.follow-signature {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.follow-action {
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