<template>
  <!-- 我的申请（申请人视角，二级页）—— 按 tif/项目.pptm slide6 -->
  <view class="page" :style="{ '--sbh': statusBarHeight + 'px' }">
    <view class="sb-blank"></view>
    <view class="nav">
      <view class="nav-back" @click="goBack">
        <image class="nav-back-ic" src="/static/icons/icon-arrow-left-grey.svg" mode="aspectFit" />
      </view>
      <text class="nav-title">我的申请</text>
      <view class="nav-right">
        <image class="nav-icon" src="/static/icons/icon-headset-grey.svg" mode="aspectFit" />
      </view>
    </view>

    <!-- 演示数据灰标：接口不可用、回退到本地假数据时显示 -->
    <DemoBadge :show="isDemo" position="top-right" />

    <scroll-view scroll-y class="list-scroll">
      <view class="apply-row" v-for="(a, i) in list" :key="a.id || i" @click="goDetail(a)">
        <view class="dot" v-if="a.unread"></view>
        <view class="avatar-bg avatar-ring-white"><text class="avatar-txt">{{ initial(a.projectName) }}</text></view>
        <view class="center">
          <view class="name-row">
            <text class="proj-name">{{ a.projectName || '（项目不可见）' }}</text>
            <text class="proj-sub">项目的申请</text>
          </view>
          <text class="time">{{ a.time }}</text>
        </view>
        <view class="status" :class="statusClass(a.status)">
          <text class="status-t">{{ a.statusText || statusText(a.status) }}</text>
        </view>
      </view>

      <view v-if="!list.length" class="empty">
        <text class="empty-t">暂无申请记录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from "vue"
import { onLoad } from '@dcloudio/uni-app'
import DemoBadge from "@/components/common/DemoBadge.vue"
import { mockMyApplications } from '@/mock/index.js'
import { getMyApplications } from '@/api/project.js'
import { normalizeMyApplicationList } from '@/api/adapter.js'
import { withFallback } from '@/utils/fallback.js'
import nav from '@/utils/nav.js'

const statusBarHeight = (uni.getSystemInfoSync().statusBarHeight || 0)

// 我的申请：真实接口 5.17（分页）
const list = ref([])
const isDemo = ref(false)

onLoad((options) => {
  loadList(options && options.id)
})

async function loadList(uid) {
  const { data, isFallback } = await withFallback(
    async () => {
      const page = await getMyApplications({ page: 1, page_size: 20 })
      return normalizeMyApplicationList(page)
    },
    () => mockMyApplications[uid] || mockMyApplications[1] || [],
    'project/myapply: 我的申请'
  )
  isDemo.value = isFallback
  list.value = data || []
}

function goBack() { uni.navigateBack() }

/**
 * 跳项目详情
 * ⚠️ 这里的 a.id 是**申请 ID**；必须用 projectId，否则会跳到别的项目
 */
function goDetail(a) {
  if (a.projectId) nav.goDetail('project', a.projectId)
}

function initial(name) { return (name || '?').charAt(0) }

/** 稿(slide6)：已通过=渐变胶囊 / 审核中=#E6EEED 胶囊 / 未通过=灰色胶囊 / 已过期=无胶囊纯文字 */
function statusClass(s) {
  if (s === 'approved') return 'approved'
  if (s === 'pending' || s === 'reviewing') return 'reviewing'
  if (s === 'rejected') return 'rejected'
  return 'expired'
}

function statusText(s) {
  if (s === 'approved') return "已通过"
  if (s === 'pending' || s === 'reviewing') return "审核中"
  if (s === 'rejected') return "未通过"
  if (s === 'expired') return "已过期"
  if (s === 'left') return "已退出"
  if (s === 'removed') return "已移除"
  return "审核中"
}
</script>

<style scoped>
/* 稿：402×874。卡 355.6×85.9（663×160rpx）@x22.8，圆角 6.27（12rpx），卡间距 95.8（卡高 85.9 + 9.9）
   头像 50.8²（95rpx）@x36.8；名字 15.9px（30rpx）粗 #3A3A3A + 「项目的申请」11.9px（22rpx）#747474
   时间 9.9px（18rpx）#808080；状态胶囊 63.1×26.8（118×50rpx）圆角全圆 @x300.6，字 11.9px（22rpx） */
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
.nav-title { flex: 1; font-size: 33rpx; color: #262626; font-weight: 600; text-align: center; }
.nav-right { width: 60rpx; height: 60rpx; display: flex; align-items: center; justify-content: flex-end; }
.nav-icon { width: 33rpx; height: 33rpx; }

/* 首卡顶 94.4px（含导航 83.3 + 11.1 间距 = 21rpx） */
.list-scroll { flex: 1; min-height: 0; padding: 21rpx 43rpx 24rpx; box-sizing: border-box; overflow: hidden; }

.apply-row {
  position: relative;
  display: flex;
  align-items: flex-start;
  height: 160rpx;
  background: #fff;
  border-radius: 12rpx;
  padding: 0 20rpx 0 26rpx;
  margin-bottom: 19rpx;
  box-shadow: 8rpx 8rpx 15rpx rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}
.apply-row:active { opacity: .92; }

/* 未读红点：9.9px（18rpx）#DF4C41，压在卡片右上角外沿 */
.dot { position: absolute; right: -5rpx; top: -9rpx; width: 18rpx; height: 18rpx; border-radius: 50%; background: #df4c41; }

.avatar-bg {
  /* 稿：头像 y108.5，卡 y94.4 → 距卡顶 14.1px（26rpx） */
  margin-top: 26rpx;
  width: 95rpx;
  height: 95rpx;
  border-radius: 50%;
  background: #4e6f66;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatar-txt { font-size: 34rpx; color: #fff; }
/* 稿：文字块 x82.8（头像右缘 87.6），文本框比头像略靠左，这里贴头像右缘起排 */
.center { flex: 1; min-width: 0; margin-left: 14rpx; padding-top: 22rpx; }
.name-row { display: flex; align-items: baseline; }
.proj-name { font-size: 30rpx; color: #3a3a3a; font-weight: 700; }
.proj-sub { font-size: 22rpx; color: #747474; font-weight: 700; margin-left: 6rpx; }
.time { font-size: 18rpx; color: #808080; margin-top: 10rpx; display: block; }

/* 状态胶囊：已通过=渐变白字；审核中=#E6EEED+#4E6F66；已过期/未通过=#E8E8E8+#747474 */
.status {
  /* 稿：胶囊右缘距卡右 14.7px（28rpx），纵向比居中高 3.4px；
     所有胶囊统一右下深灰阴影（outerShdw dx/dy 4.21 blur 7.94 a=0.20） */
  margin: 50rpx 8rpx 0 0;
  height: 50rpx;
  min-width: 118rpx;
  border-radius: 25rpx;
  padding: 0 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  flex-shrink: 0;
  box-shadow: 8rpx 8rpx 15rpx rgba(0, 0, 0, 0.2);
}
.status.approved { background: linear-gradient(90deg, #538474 0%, #5ba188 53%, #77bbac 100%); }
.status.reviewing { background: #e6eeed; }
.status.rejected { background: #e8e8e8; }
/* 已过期：稿上只有纯文字、没有胶囊，去掉底色/阴影/内边距 */
.status.expired {
  background: transparent;
  box-shadow: none;
  min-width: 0;
  padding: 0;
}
.status-t { font-size: 22rpx; color: #747474; line-height: 1; }
.status.approved .status-t { color: #fff; }
.status.reviewing .status-t { color: #4e6f66; }

.empty { padding: 120rpx 0; text-align: center; }
.empty-t { font-size: 26rpx; color: #808080; }
</style>
