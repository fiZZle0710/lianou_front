<template>
  <!-- 我的项目（二级页）—— 按 tif/项目.pptm slide2 -->
  <view class="page" :style="{ '--sbh': statusBarHeight + 'px' }">
    <view class="sb-blank"></view>
    <view class="nav">
      <view class="nav-back" @click="goBack">
        <image class="nav-back-ic" src="/static/icons/icon-arrow-left-grey.svg" mode="aspectFit" />
      </view>
      <text class="nav-title">我的项目</text>
      <view class="nav-right"></view>
    </view>

    <scroll-view scroll-y class="list-scroll">
      <ProjectCard
        v-for="(p, i) in published"
        :key="'p' + i"
        variant="mine"
        :owner-name="p.owner"
        :date="p.date"
        :intro="p.intro"
        :topic="p.topic"
        :level-req="p.levelReq"
        :experience-req="p.experienceReq"
        :skills="p.skills"
        :members="p.members"
        :current="p.current"
        :total="p.total"
        @click="goDetail(p)"
      />

      <ProjectCard
        v-for="(p, i) in joined"
        :key="'j' + i"
        variant="mine"
        :owner-name="p.owner"
        :date="p.date"
        :intro="p.intro"
        :topic="p.topic"
        :level-req="p.levelReq"
        :experience-req="p.experienceReq"
        :skills="p.skills"
        :members="p.members"
        :current="p.current"
        :total="p.total"
        @click="goDetail(p)"
      />
    </scroll-view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import ProjectCard from '@/components/project/ProjectCard.vue'

const statusBarHeight = (uni.getSystemInfoSync().statusBarHeight || 0)

// 我发布的项目：后续替换为后端 getMyPublishedProjects
const published = ref([
  {
    id: 1,
    owner: '我',
    date: '2026/8/8',
    intro: '欢迎所有对视频创作感兴趣的伙伴加入~',
    topic: '红色教育',
    levelReq: 'Lv.5',
    experienceReq: '3次共创经历',
    skills: ['善写剧本', '配音者优先'],
    members: ['桂', '小', '纸', '糯', '铁'],
    current: 8,
    total: 10
  }
])
// 我加入的项目：后续替换为 getMyJoinedProjects
const joined = ref([
  {
    id: 2,
    owner: '桂花糕',
    date: '2026/8/8',
    intro: '欢迎所有对视频创作感兴趣的伙伴加入~',
    topic: '红色教育',
    levelReq: 'Lv.5',
    experienceReq: '3次共创经历',
    skills: ['善写剧本', '配音者优先'],
    members: ['桂', '小', '纸', '糯', '铁'],
    current: 8,
    total: 10
  }
])

function goBack() { uni.navigateBack() }
function goDetail(p) { uni.navigateTo({ url: '/pages/project/detail?id=' + p.id }) }
</script>

<style scoped>
/* 稿：402×874，导航 83.3px，首卡顶 97.2，卡 355.6×159.6（左右各留 22.8） */
.page { background: #fff; height: 100vh; display: flex; flex-direction: column; }

.nav {
  /* 稿上导航条总高 83.3px（155rpx）含状态栏：真机 sbh 吃掉多少就减多少，
     headless 无状态栏时仍是 83.3px，量出来的坐标可直接和稿对比 */
  height: calc(155rpx - var(--sbh, 0px));
  padding: 0 52rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  flex-shrink: 0;
}
.nav-back { width: 60rpx; height: 60rpx; display: flex; align-items: center; }
.nav-back-ic { width: 47rpx; height: 47rpx; }
.nav-title { font-size: 33rpx; color: #262626; font-weight: 600; }
.nav-right { width: 60rpx; }

/* 卡左右各 22.8px（= 43rpx），给阴影再让 16rpx */
.list-scroll { flex: 1; padding: 26rpx 27rpx 24rpx; box-sizing: border-box; overflow: hidden; }
.sec-title {
  display: block;
  font-size: 24rpx;
  color: #747474;
  padding: 24rpx 16rpx 16rpx;
}
</style>
