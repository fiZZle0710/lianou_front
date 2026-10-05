<template>
  <view class="user-header">
    <view class="top" @click="openProfile">
      <!-- 头像区域 - 使用UserAvatar组件，带头像框 -->
      <view class="avatar-wrapper">
        <UserAvatar
          :src="userInfo.avatar"
          :size="72"
          :frame="userInfo.avatarFrame"
          :showCrown="true"
        />
      </view>

      <view class="info">
        <text class="name">{{ userInfo.nickname }}</text>
        <text class="id">ID: {{ userInfo.id }}</text>
      </view>

      <text class="arrow">›</text>
    </view>

    <view class="intro">
      {{ userInfo.intro || '这个人很懒，什么都没写...' }}
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import UserAvatar from '@/components/common/UserAvatar.vue'

const userInfo = ref({
  avatar: '/static/default-avatar.png',
  avatarFrame: '', // 可传入头像框图片URL
  nickname: '冯大侠',
  id: '12345678',
  intro: '热爱创作，分享生活'
})

function openProfile() {
  uni.navigateTo({
    url: '/pages/user/detail'
  })
}
</script>

<style scoped>
.user-header {
  padding: 20px;
  background: white;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.top {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
}

.top:active {
  background: #f5f5f5;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.info {
  margin-left: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.id {
  margin-top: 6px;
  color: #888;
  font-size: 13px;
}

.arrow {
  margin-left: auto;
  font-size: 24px;
  color: #ccc;
  font-weight: bold;
  flex-shrink: 0;
}

.intro {
  margin-top: 12px;
  padding: 0 10px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}
</style>