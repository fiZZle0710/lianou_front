<template>
  <!-- 项目申请列表（发起人后台，二级页） -->
  <view class="page">
    <view class="nav">
      <view class="nav-back" @click="goBack"><text class="back-icon">←</text></view>
      <text class="nav-title">项目申请列表</text>
      <view class="nav-right"></view>
    </view>

    <!-- 演示数据灰标：接口不可用、回退到本地假数据时显示 -->
    <DemoBadge :show="isDemo" position="top-right" />

    <scroll-view scroll-y class="list-scroll">
      <view class="apply-item" v-for="(a, i) in list" :key="a.id || i">
        <view class="a-head">
          <view class="avatar-bg"><text class="avatar-txt">{{ initial(a.name) }}</text></view>
          <view class="a-info">
            <view class="a-name-row">
              <text class="a-name">{{ a.name }}</text>
              <text v-if="a.level" class="a-lv">LV.{{ a.level }}</text>
              <text v-if="a.coopCount" class="a-coop">共创 {{ a.coopCount }} 次</text>
            </view>
            <text class="a-intro">{{ a.message }}</text>
          </view>
        </view>
        <view class="a-actions">
          <view class="act-btn reject" @click="reject(a)"><text class="act-btn-t">拒绝</text></view>
          <view class="act-btn pass" @click="pass(a)"><text class="act-btn-t">通过</text></view>
        </view>
      </view>

      <view v-if="!list.length" class="empty">
        <text class="empty-t">暂无待审申请</text>
      </view>
    </scroll-view>

    <!-- 通过确认弹窗 -->
    <view v-if="current" class="confirm-mask" @click="current = null">
      <view class="confirm-panel" @click.stop>
        <text class="confirm-title">确认通过 {{ current.name }} 的加入申请？</text>
        <text v-if="current.total" class="confirm-sub">项目招募进度（{{ current.filled }}/{{ current.total }}）</text>
        <text v-else class="confirm-sub">通过后对方将成为项目成员</text>
        <view class="confirm-actions">
          <view class="c-btn cancel" @click="current = null"><text class="c-btn-t">取消</text></view>
          <view class="c-btn ok" @click="confirmPass"><text class="c-btn-t">确认</text></view>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref } from "vue"
import { onLoad } from '@dcloudio/uni-app'
import DemoBadge from "@/components/common/DemoBadge.vue"
import { mockProjectApplications } from '@/mock/index.js'
import { getProjectApplications, approveApplication, rejectApplication } from '@/api/project.js'
import { normalizeApplicationList } from '@/api/adapter.js'
import { withFallback } from '@/utils/fallback.js'

// 待审申请列表：真实接口为 5.8（仅项目 owner 可看，非 owner 返回 5002）
const projectId = ref(null)
const list = ref([])
const current = ref(null)
const isDemo = ref(false)

onLoad((options) => {
  projectId.value = (options && options.id) || null
  loadList()
})

async function loadList() {
  const { data, isFallback } = await withFallback(
    async () => {
      const page = await getProjectApplications(projectId.value, {
        status: 'pending',
        page: 1,
        page_size: 20
      })
      return normalizeApplicationList(page)
    },
    () => mockProjectApplications[projectId.value] || mockProjectApplications[1] || [],
    'project/apply: 待审申请'
  )
  isDemo.value = isFallback
  list.value = data || []
}

function goBack() { uni.navigateBack() }
function initial(name) { return (name || '?').charAt(0) }

async function reject(a) {
  try {
    // 5.7 拒绝申请（仅 owner）；写操作不回退 mock
    await rejectApplication(projectId.value, a.id)
    list.value = list.value.filter((item) => item !== a)
    uni.showToast({ title: "已拒绝", icon: "none" })
  } catch (e) {
    /* 失败已由 request 层按错误码提示（5002/5006/5007） */
  }
}

function pass(a) {
  current.value = a
}

async function confirmPass() {
  const a = current.value
  current.value = null
  if (!a) return
  try {
    // 5.6 通过申请（仅 owner），后端会把申请人转为项目成员
    await approveApplication(projectId.value, a.id)
    list.value = list.value.filter((item) => item !== a)
    uni.showToast({ title: "已通过，成员已加入", icon: "success" })
  } catch (e) {
    /* 5007 申请已处理等，已提示 */
  }
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
.apply-item { background: #fff; border-radius: 20rpx; padding: 26rpx; margin-bottom: 20rpx; }
.a-head { display: flex; align-items: flex-start; }
.avatar-bg { width: 84rpx; height: 84rpx; border-radius: 50%; background: linear-gradient(135deg, #f0c7bb, #d9a29e); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-txt { font-size: 32rpx; color: #fff; }
.a-info { flex: 1; margin-left: 20rpx; min-width: 0; }
.a-name-row { display: flex; align-items: center; }
.a-name { font-size: 30rpx; color: #333; font-weight: 600; }
.a-lv { font-size: 22rpx; color: #d9a23e; background: #fff4e0; padding: 2rpx 12rpx; border-radius: 10rpx; margin-left: 12rpx; }
.a-coop { font-size: 22rpx; color: #999; margin-left: 12rpx; }
.a-intro { font-size: 26rpx; color: #666; line-height: 1.5; margin-top: 10rpx; }
.a-actions { display: flex; gap: 20rpx; margin-top: 20rpx; }
.act-btn { flex: 1; height: 72rpx; border-radius: 36rpx; display: flex; align-items: center; justify-content: center; }
.act-btn.reject { border: 2rpx solid #d0d0d0; }
.act-btn.pass { background: #d9a29e; }
.act-btn-t { font-size: 28rpx; color: #666; }
.act-btn.pass .act-btn-t { color: #fff; }
.confirm-mask { position: fixed; left:0; right:0; top:0; bottom:0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.confirm-panel { width: 76%; background: #fff; border-radius: 24rpx; padding: 40rpx 30rpx; }
.confirm-title { font-size: 30rpx; color: #333; text-align: center; display: block; line-height: 1.5; }
.confirm-sub { font-size: 26rpx; color: #999; text-align: center; display: block; margin-top: 20rpx; }
.confirm-actions { display: flex; gap: 20rpx; margin-top: 36rpx; }
.c-btn { flex: 1; height: 80rpx; border-radius: 40rpx; display: flex; align-items: center; justify-content: center; }
.c-btn.cancel { background: #f5f6fa; }
.c-btn.ok { background: #d9a29e; }
.c-btn-t { font-size: 28rpx; color: #333; }
.c-btn.ok .c-btn-t { color: #fff; }
.empty { padding: 120rpx 0; text-align: center; }
.empty-t { font-size: 26rpx; color: #999; }
</style>
