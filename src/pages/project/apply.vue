<template>
  <!-- 项目申请列表（发起人后台，二级页）—— 按 tif/项目.pptm slide8 -->
  <view class="page" :style="{ '--sbh': statusBarHeight + 'px' }">
    <view class="sb-blank"></view>
    <view class="nav">
      <view class="nav-back" @click="goBack">
        <image class="nav-back-ic" src="/static/icons/icon-arrow-left-grey.svg" mode="aspectFit" />
      </view>
      <text class="nav-title">项目申请列表</text>
      <view class="nav-right">
        <image class="nav-icon" src="/static/icons/icon-headset-grey.svg" mode="aspectFit" />
      </view>
    </view>

    <!-- 演示数据灰标：接口不可用、回退到本地假数据时显示 -->
    <DemoBadge :show="isDemo" position="top-right" />

    <scroll-view scroll-y class="list-scroll">
      <view class="apply-item" v-for="(a, i) in list" :key="a.id || i">
        <view class="dot" v-if="a.unread"></view>
        <text class="coop-t">共创{{ a.coopCount || 0 }}次</text>
        <view class="a-main">
          <view class="avatar-bg avatar-ring-white"><text class="avatar-txt">{{ initial(a.name) }}</text></view>
          <view class="a-info">
            <!-- 稿：名字 → Lv 胶囊 → 「申请加入你的项目」，三者同行（胶囊下沉 7.9px） -->
            <view class="a-name-row">
              <text class="a-name">{{ a.name }}</text>
              <view v-if="a.level" class="lv-pill"><text class="lv-t">Lv.{{ a.level }}</text></view>
              <text class="a-sub">申请加入你的项目</text>
            </view>
            <text class="a-intro">“{{ a.message || a.intro }}”</text>
          </view>
          <!-- 待审：通过 / 拒绝；已处理：状态胶囊 -->
          <view v-if="isPending(a)" class="a-actions">
            <view class="act-btn pass" @click="pass(a)"><text class="act-btn-t">通过</text></view>
            <view class="act-btn reject" @click="reject(a)"><text class="act-btn-t">拒绝</text></view>
          </view>
          <view v-else class="status-pill"><text class="status-t">{{ a.statusText || (a.status === 'approved' ? '已通过' : '已拒绝') }}</text></view>
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

const statusBarHeight = (uni.getSystemInfoSync().statusBarHeight || 0)

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

/** 只有 pending/reviewing 才显示「通过 / 拒绝」，其余显示状态胶囊 */
function isPending(a) {
  return !a.status || a.status === 'pending' || a.status === 'reviewing'
}

async function reject(a) {
  try {
    // 5.7 拒绝申请（仅 owner）；写操作不回退 mock
    await rejectApplication(projectId.value, a.id)
    a.status = 'rejected'
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
    a.status = 'approved'
    uni.showToast({ title: "已通过，成员已加入", icon: "success" })
  } catch (e) {
    /* 5007 申请已处理等，已提示 */
  }
}
</script>

<style scoped>
/* 稿：402×874。卡 355.6×78.6（663×147rpx）@x22.8，圆角 5.74（11rpx），卡间距 8.5~8.6
   头像 44.6²（83rpx）@x31.9；名字 13.9px（26rpx）粗 #3A3A3A + 「申请加入你的项目」9.9px（18rpx）#747474
   Lv 胶囊 32.2×14.9（60×28rpx）描边 #77BBAC 字 7.9px（15rpx）；引言 7.9px（15rpx）#404040
   「通过」渐变 48.6×26.8（91×50rpx）@x267.8；「拒绝」#E8E8E8 @x319.3；状态胶囊 60.9×26.8 #E6EEED @x290
   「共创2次」7.9px（15rpx）#AEAEAE 在卡片左上外侧 */
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

/* 首卡顶 98px（导航 83.3 + 14.7，其中 apply-item 自带上内边距 7.5 → 这里 14rpx） */
.list-scroll { flex: 1; min-height: 0; padding: 14rpx 43rpx 24rpx; box-sizing: border-box; overflow: hidden; }

.apply-item {
  position: relative;
  height: 147rpx;
  margin-bottom: 16rpx;
  padding-top: 14rpx;
  box-sizing: border-box;
}
/* 「共创2次」压在卡片左上角外侧 */
.coop-t { position: absolute; left: -4rpx; top: -2rpx; font-size: 15rpx; color: #aeaeae; line-height: 1; z-index: 2; }

.a-main {
  position: relative;
  height: 147rpx;
  background: #fff;
  border-radius: 11rpx;
  box-shadow: 8rpx 8rpx 15rpx rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: flex-start;
  padding: 0 16rpx 0 17rpx;
  box-sizing: border-box;
}
.dot { position: absolute; right: -5rpx; top: -9rpx; width: 18rpx; height: 18rpx; border-radius: 50%; background: #df4c41; z-index: 3; }

.avatar-bg {
  margin-top: 32rpx;
  width: 83rpx;
  height: 83rpx;
  border-radius: 50%;
  background: #4e6f66;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatar-txt { font-size: 30rpx; color: #fff; }
/* 稿：卡 98..176.6；头像 115（距卡顶 17px=32rpx），文字块 113（15px=28rpx） */
.a-info { flex: 1; min-width: 0; margin-left: 22rpx; padding-top: 28rpx; }
.a-name-row { display: flex; align-items: flex-start; }
.a-name { font-size: 26rpx; color: #3a3a3a; font-weight: 700; }
.a-sub { font-size: 18rpx; color: #747474; font-weight: 700; margin-left: 8rpx; line-height: 26rpx; }
/* Lv 胶囊：60×28rpx，描边 #77BBAC */
.lv-pill {
  height: 28rpx;
  border: 1rpx solid #77bbac;
  border-radius: 14rpx;
  padding: 0 8rpx;
  margin: 15rpx 0 0 8rpx;
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  flex-shrink: 0;
  width: fit-content;
}
.lv-t { font-size: 15rpx; color: #77bbac; line-height: 1; }
.a-intro { display: block; font-size: 15rpx; color: #404040; margin-top: 3rpx; line-height: 1.5; }

/* 通过 / 拒绝：各 91×50rpx 圆角全圆，间距 4rpx（稿上 x267.8 与 x319.3，间隙 2.9px） */
.a-actions { display: flex; align-items: center; flex-shrink: 0; margin-top: 49rpx; }
.act-btn {
  width: 91rpx;
  height: 50rpx;
  border-radius: 25rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 与我的申请/项目要求/项目管理统一：胶囊右下深灰阴影（稿 slide8 outerShdw） */
  box-shadow: 8rpx 8rpx 15rpx rgba(0, 0, 0, 0.2);
}
.act-btn.pass { background: linear-gradient(90deg, #538474 0%, #5ba188 53%, #77bbac 100%); }
.act-btn.reject { background: #e8e8e8; margin-left: 6rpx; }
.act-btn-t { font-size: 22rpx; color: #747474; line-height: 1; }
.act-btn.pass .act-btn-t { color: #fff; }

/* 已处理状态胶囊 60.9×26.8px（114×50rpx）底 #E6EEED 字 #4E6F66
   稿上右缘距卡右 27.5px、顶距卡顶 26px（与「通过/拒绝」同一水平线） */
.status-pill {
  margin: 49rpx 35rpx 0 0;
  height: 50rpx;
  min-width: 114rpx;
  border-radius: 25rpx;
  background: #e6eeed;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12rpx;
  box-sizing: border-box;
  flex-shrink: 0;
  box-shadow: 8rpx 8rpx 15rpx rgba(0, 0, 0, 0.2);
}
.status-t { font-size: 22rpx; color: #4e6f66; line-height: 1; }

.confirm-mask { position: fixed; left: 0; right: 0; top: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.confirm-panel { width: 76%; background: #fff; border-radius: 24rpx; padding: 40rpx 30rpx; }
.confirm-title { font-size: 30rpx; color: #3a3a3a; text-align: center; display: block; line-height: 1.5; }
.confirm-sub { font-size: 26rpx; color: #808080; text-align: center; display: block; margin-top: 20rpx; }
.confirm-actions { display: flex; gap: 20rpx; margin-top: 36rpx; }
.c-btn { flex: 1; height: 80rpx; border-radius: 40rpx; display: flex; align-items: center; justify-content: center; }
.c-btn.cancel { background: #f2f2f2; }
.c-btn.ok { background: #5ba188; }
.c-btn-t { font-size: 28rpx; color: #3a3a3a; }
.c-btn.ok .c-btn-t { color: #fff; }
.empty { padding: 120rpx 0; text-align: center; }
.empty-t { font-size: 26rpx; color: #808080; }
</style>
