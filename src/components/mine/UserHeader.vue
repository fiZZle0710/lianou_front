<template>
  <!--
    「我的」页头部：封面画 + 头像（金环 + 活动款角标）/ 昵称 / 莲藕账号 / 擅长标签 / 签名
    尺寸按设计稿实测（头像 66px、昵称 32px、页面左右内缩 22px）换算成 rpx（1px ≈ 1.8657rpx）
  -->
  <view class="user-header">
    <!--
      封面：设计稿用的是一张柳枝工笔画。原图没随稿给出（Figma 匿名访问导不出素材），
      先拿仓库里同色系的 mine-grid-bg.png 占位；换成原图只需改下面这一行。
    -->
    <image class="cover" src="/static/mine-grid-bg.png" mode="aspectFill" />
    <view class="cover-fade"></view>

    <view class="profile">
      <view class="avatar-wrap" @click="openProfile">
        <!-- 头像框：走 UserAvatar 现成的 frame 能力，素材放 /static/avatar-frame/
             （先用默认金环 default.png 占位，详细样式定了换文件即可） -->
        <UserAvatar :src="userInfo.avatar" :size="58" :frame="userInfo.avatarFrame" />
        <view v-if="userInfo.badge" class="avatar-badge">
          <text class="avatar-badge-t">{{ userInfo.badge }}</text>
        </view>
      </view>

      <view class="info">
        <text class="name">{{ userInfo.nickname }}</text>
        <text class="account">莲藕账号:{{ userInfo.id }}</text>
        <view class="tags">
          <text class="tags-label">擅长:</text>
          <text v-for="tag in userInfo.tags" :key="tag" class="tag">{{ tag }}</text>
        </view>
      </view>
    </view>

    <text class="intro">{{ userInfo.intro }}</text>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import UserAvatar from '@/components/common/UserAvatar.vue'

// 后端还没有「我的资料」接口，先按设计稿的示例数据占位
const userInfo = ref({
  avatar: '',
  // 头像框素材；后端给每个用户的框 ID 后，这里换成对应的 URL
  avatarFrame: '/static/avatar-frame/default.png',
  nickname: '冯大侠',
  id: '1234567',
  badge: '活动款',
  tags: ['分镜', '编剧'],
  intro: '从不鸽人 · 致力于水墨与人间月色'
})

function openProfile() {
  uni.navigateTo({ url: '/pages/user/detail' })
}
</script>

<style scoped>
.user-header {
  position: relative;
  /* 头像顶边在设计稿里落在 y=196px → 366rpx；封面从页面最顶端铺起 */
  padding-top: 366rpx;
}

/* 封面图铺到屏幕最上方（含状态栏区域），导航与资料块都压在它上面 */
.cover {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 620rpx;
}

/* 封面下缘渐隐到页面白底（设计稿里画是会淡出的） */
.cover-fade {
  position: absolute;
  left: 0;
  top: 300rpx;
  width: 100%;
  height: 320rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ffffff 78%);
}

.profile {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 0 41rpx; /* 设计稿：左右各 22px */
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.avatar-badge {
  position: absolute;
  left: -6rpx;
  bottom: -10rpx;
  height: 34rpx;
  padding: 0 14rpx;
  border-radius: 17rpx;
  background: #db5543;
  display: flex;
  align-items: center;
}

.avatar-badge-t {
  font-size: 19rpx;
  color: #ffffff;
}

.info {
  flex: 1;
  min-width: 0;
  margin-left: 24rpx;
  padding-top: 4rpx;
}

.name {
  display: block;
  font-size: 64rpx; /* 设计稿：32px */
  font-weight: 600;
  color: #1f2422;
  line-height: 1.15;
}

.account {
  display: block;
  margin-top: 6rpx;
  font-size: 21rpx;
  color: #4a5450;
}

.tags {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
}

.tags-label {
  margin-right: 10rpx;
  font-size: 22rpx;
  color: #3c4642;
}

.tag {
  height: 36rpx;
  padding: 0 14rpx;
  margin-right: 10rpx;
  border-radius: 10rpx;
  background: rgba(120, 140, 130, 0.22);
  color: #3c4642;
  font-size: 22rpx;
  line-height: 36rpx;
}

.intro {
  display: block;
  position: relative;
  margin-top: 20rpx;
  padding: 0 41rpx;
  font-size: 22rpx;
  color: #46504c;
}
</style>
