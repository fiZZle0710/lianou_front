<template>
  <!-- 我的申请（申请人视角，二级页） -->
  <view class="page">
    <view class="nav">
      <view class="nav-back" @click="goBack"><text class="back-icon">←</text></view>
      <text class="nav-title">我的申请</text>
      <view class="nav-right"></view>
    </view>

    <!-- 演示数据灰标：接口不可用、回退到本地假数据时显示 -->
    <DemoBadge :show="isDemo" position="top-right" />

    <scroll-view scroll-y class="list-scroll">
      <view class="apply-row" v-for="(a, i) in list" :key="a.id || i" @click="goDetail(a)">
        <view class="avatar-bg"><text class="avatar-txt">{{ initial(a.projectName) }}</text></view>
        <view class="center">
          <text class="proj-name">{{ a.projectName || '（项目不可见）' }}</text>
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

/** CSS 类仍是旧的 reviewing/approved/expired 三态，这里把后端状态映射过来 */
function statusClass(s) {
  if (s === 'approved') return 'approved'
  if (s === 'pending' || s === 'reviewing') return 'reviewing'
  return 'expired'
}

function statusText(s) {
  if (s === 'approved') return "已通过"
  if (s === 'pending' || s === 'reviewing') return "审核中"
  if (s === 'rejected') return "已拒绝"
  if (s === 'left') return "已退出"
  if (s === 'removed') return "已移除"
  return "审核中"
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
.apply-row { display: flex; align-items: center; background: #fff; border-radius: 20rpx; padding: 26rpx; margin-bottom: 20rpx; }
.apply-row:active { opacity: .92; }
.avatar-bg { width: 84rpx; height: 84rpx; border-radius: 50%; background: linear-gradient(135deg, #f0c7bb, #d9a29e); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-txt { font-size: 32rpx; color: #fff; }
.center { flex: 1; min-width: 0; margin-left: 20rpx; }
.proj-name { font-size: 30rpx; color: #333; font-weight: 500; display: block; }
.time { font-size: 24rpx; color: #999; margin-top: 8rpx; display: block; }
.status { padding: 8rpx 20rpx; border-radius: 24rpx; }
.status.reviewing { background: #eee; }
.status.approved { background: #e7f7ec; }
.status.expired { background: #f1f1f1; }
.status-t { font-size: 24rpx; color: #999; }
.status.approved .status-t { color: #34c759; }
.status.expired .status-t { color: #b0b0b0; }
.empty { padding: 120rpx 0; text-align: center; }
.empty-t { font-size: 26rpx; color: #999; }
</style>
