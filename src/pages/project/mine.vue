<template>
  <!-- 我的项目（二级页） -->
  <view class="page">
    <view class="nav">
      <view class="nav-back" @click="goBack"><text class="back-icon">←</text></view>
      <text class="nav-title">我的项目</text>
      <view class="nav-right"></view>
    </view>

    <scroll-view scroll-y class="list-scroll">
      <!-- 我发布的共创项目 -->
      <view class="sec-title">我发布的共创项目</view>
      <view class="p-card" v-for="(p, i) in published" :key="'p'+i" @click="goDetail(p)">
        <view class="p-head">
          <text class="p-date">{{ p.date }}</text>
          <view class="more-btn" @click.stop="openMenu(p, 'pub')"><text class="more-dots">⋯</text></view>
        </view>
        <text class="p-intro">{{ p.intro }}</text>
        <view class="p-cond">
          <text v-for="(c, j) in p.conds" :key="j" class="cond-tag">{{ c }}</text>
        </view>
        <view class="p-members">
          <view v-for="(m, k) in p.members" :key="k" class="mini-a"><text class="mini-t">{{ m[0] }}</text></view>
          <view class="mini-a more"><text class="mini-t">+</text></view>
        </view>
      </view>

      <!-- 我已加入的共创项目 -->
      <view class="sec-title">我已加入的共创项目</view>
      <view class="p-card" v-for="(p, i) in joined" :key="'j'+i" @click="goDetail(p)">
        <view class="p-head">
          <text class="p-owner">{{ p.owner }}</text>
          <view class="more-btn" @click.stop="openMenu(p, 'join')"><text class="more-dots">⋯</text></view>
        </view>
        <text class="p-intro">{{ p.intro }}</text>
        <view class="p-cond">
          <text v-for="(c, j) in p.conds" :key="j" class="cond-tag">{{ c }}</text>
        </view>
        <view class="p-members">
          <view v-for="(m, k) in p.members" :key="k" class="mini-a"><text class="mini-t">{{ m[0] }}</text></view>
        </view>
      </view>
    </scroll-view>

    <!-- 三点菜单弹窗 -->
    <view v-if="menu" class="menu-mask" @click="menu = null">
      <view class="menu-panel" @click.stop>
        <view class="menu-item" v-for="(opt, i) in menu.options" :key="i" @click="doMenu(opt)">
          <text class="menu-t">{{ opt }}</text>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref } from "vue"

// 我发布的项目：后续替换为后端 getMyPublishedProjects
const published = ref([
  { id: 1, date: "2026-08-01 发布", intro: "科幻短片共创项目，寻找伙伴", conds: ["科幻", "LV.不限", "1次以上共创"], members: ["张", "李", "王"] }
])
// 我加入的项目：后续替换为 getMyJoinedProjects
const joined = ref([
  { id: 2, owner: "冯大侠", intro: "国风插画合集项目", conds: ["国风", "LV.5", "新手友好"], members: ["张", "冯"] }
])

const menu = ref(null)

function goBack() { uni.navigateBack() }
function goDetail(p) { uni.navigateTo({ url: "/pages/project/detail?id=" + p.id }) }

function openMenu(p, type) {
  // 发起人菜单 / 成员菜单
  const options = type === "pub"
    ? ["发起互评", "结束项目", "编辑项目"]
    : ["查看详情", "退出项目"]
  menu.value = { options, project: p, type }
}

function doMenu(opt) {
  const type = menu.value.type
  menu.value = null
  if (opt === "发起互评") uni.showToast({ title: "发起互评", icon: "none" })
  else if (opt === "结束项目") uni.showToast({ title: "已结束项目", icon: "none" })
  else if (opt === "编辑项目") uni.showToast({ title: "编辑项目", icon: "none" })
  else if (opt === "查看详情") uni.navigateTo({ url: "/pages/project/detail" })
  else if (opt === "退出项目") uni.showToast({ title: "已退出", icon: "none" })
}
</script>

<style scoped>
.page { background: #f5f6fa; min-height: 100vh; }
.nav { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 24rpx; padding-top: calc(env(safe-area-inset-top) + 20rpx); background: #fff; }
.nav-back { width: 70rpx; height: 60rpx; display: flex; align-items: center; }
.back-icon { font-size: 40rpx; color: #333; }
.nav-title { font-size: 34rpx; font-weight: 700; color: #333; }
.nav-right { width: 70rpx; }
.list-scroll { padding: 20rpx; box-sizing: border-box; height: calc(100vh - 100rpx); }
.sec-title { font-size: 28rpx; color: #999; margin: 20rpx 8rpx; }
.p-card { background: #fff; border-radius: 20rpx; padding: 26rpx; margin-bottom: 20rpx; }
.p-card:active { opacity: .92; }
.p-head { display: flex; align-items: center; justify-content: space-between; }
.p-date, .p-owner { font-size: 26rpx; color: #999; }
.more-btn { width: 56rpx; height: 40rpx; display: flex; align-items: center; justify-content: center; }
.more-dots { font-size: 40rpx; color: #999; }
.p-intro { font-size: 30rpx; color: #333; font-weight: 500; margin-top: 16rpx; display: block; }
.p-cond { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 16rpx; }
.cond-tag { font-size: 24rpx; color: #7a6f66; background: #f7f3ee; border-radius: 10rpx; padding: 8rpx 16rpx; }
.p-members { display: flex; margin-top: 20rpx; padding-top: 20rpx; border-top: 1rpx solid #f3f4f6; }
.mini-a { width: 56rpx; height: 56rpx; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; margin-right: -10rpx; border: 3rpx solid #fff; }
.mini-a.more { background: #f7f3ee; color: #999; }
.mini-t { font-size: 24rpx; color: #888; }
.menu-mask { position: fixed; left:0; right:0; top:0; bottom:0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.menu-panel { width: 70%; background: #fff; border-radius: 20rpx; overflow: hidden; }
.menu-item { text-align: center; padding: 30rpx 0; border-bottom: 1rpx solid #f3f4f6; }
.menu-item:last-child { border-bottom: none; }
.menu-item:active { background: #f8f8f8; }
.menu-t { font-size: 30rpx; color: #333; }
</style>