<template>
  <!-- 项目卡片：发起人/标题/截止/简介/条件/成员/箭头 -->
  <view class="proj-card" @click="emit('click')">
    <!-- 发起人 + 标题 + 截止 -->
    <view class="head">
      <view class="avatar-bg"><text class="avatar-txt">{{ ownerName[0] }}</text></view>
      <view class="head-info">
        <text class="title">{{ title }}</text>
        <view class="meta-line">
          <text class="meta">截止 {{ deadline }}</text>
          <text v-if="ownerLevel > 0" class="lv">LV.{{ ownerLevel }}</text>
        </view>
      </view>
      <text class="arrow">›</text>
    </view>

    <!-- 简介 -->
    <text class="intro">{{ intro }}</text>

    <!-- 项目条件 -->
    <view class="cond-row">
      <text class="cond-tag">主题：{{ topic }}</text>
      <text class="cond-tag">等级 {{ levelReq }}</text>
      <text class="cond-tag">{{ experienceReq }}</text>
    </view>
    <view class="skill-row">
      <text class="skill-label">优先技能：</text>
      <text v-for="(s, i) in skills" :key="i" class="skill-tag">{{ s }}</text>
    </view>

    <!-- 招募成员 + 人数 -->
    <view class="member-row">
      <view class="member-avatars">
        <view v-for="(m, i) in members" :key="i" class="mini-avatar"><text class="mini-txt">{{ m[0] }}</text></view>
        <view class="mini-avatar more"><text class="mini-txt">+</text></view>
      </view>
      <text class="member-count">({{ current }}/{{ total }})</text>
    </view>
  </view>
</template>
<script setup>
const props = defineProps({
  ownerName: { type: String, default: "" },
  ownerLevel: { type: Number, default: 0 },
  title: { type: String, default: "" },
  deadline: { type: String, default: "" },
  intro: { type: String, default: "" },
  topic: { type: String, default: "" },
  levelReq: { type: String, default: "" },
  experienceReq: { type: String, default: "" },
  skills: { type: Array, default: () => [] },
  members: { type: Array, default: () => [] },
  current: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
})
const emit = defineEmits(["click"])
</script>

<style scoped>
.proj-card { background: #fff; border-radius: 24rpx; padding: 28rpx; margin-bottom: 20rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04); }
.proj-card:active { opacity: .92; }
.head { display: flex; align-items: center; }
.avatar-bg { width: 84rpx; height: 84rpx; border-radius: 50%; background: linear-gradient(135deg, #f0c7bb, #d9a29e); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-txt { font-size: 32rpx; color: #fff; }
.head-info { flex: 1; min-width: 0; margin-left: 20rpx; }
.title { font-size: 32rpx; color: #333; font-weight: 600; display: block; }
.meta-line { display: flex; align-items: center; margin-top: 8rpx; }
.meta { font-size: 24rpx; color: #999; }
.lv { font-size: 20rpx; color: #d9a23e; background: #fff4e0; padding: 2rpx 12rpx; border-radius: 10rpx; margin-left: 12rpx; }
.arrow { font-size: 40rpx; color: #ccc; margin-left: 12rpx; }
.intro { font-size: 28rpx; color: #666; line-height: 1.6; margin-top: 20rpx; display: block; }
.cond-row { display: flex; flex-wrap: wrap; margin-top: 20rpx; gap: 12rpx; }
.cond-tag { font-size: 24rpx; color: #7a6f66; background: #f7f3ee; border-radius: 10rpx; padding: 8rpx 16rpx; }
.skill-row { display: flex; align-items: center; flex-wrap: wrap; margin-top: 16rpx; }
.skill-label { font-size: 24rpx; color: #999; }
.skill-tag { font-size: 22rpx; color: #d98983; background: #fdece8; border-radius: 10rpx; padding: 6rpx 14rpx; margin-right: 10rpx; margin-top: 6rpx; }
.member-row { display: flex; align-items: center; justify-content: space-between; margin-top: 24rpx; padding-top: 20rpx; border-top: 1rpx solid #f3f4f6; }
.member-avatars { display: flex; }
.mini-avatar { width: 56rpx; height: 56rpx; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; margin-right: -10rpx; border: 3rpx solid #fff; }
.mini-avatar.more { background: #f7f3ee; color: #999; }
.mini-txt { font-size: 24rpx; color: #888; }
.member-count { font-size: 24rpx; color: #999; }
</style>