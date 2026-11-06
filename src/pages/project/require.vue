<template>
  <!-- 项目要求（三级页）—— 按 tif/项目.pptm slide5 -->
  <view class="page" :style="{ '--sbh': statusBarHeight + 'px' }">
    <view class="nav">
      <view class="nav-back" @click="goBack">
        <image class="nav-back-ic" src="/static/icons/icon-arrow-left-grey.svg" mode="aspectFit" />
      </view>
      <text class="nav-title">项目要求</text>
      <view class="nav-right"></view>
    </view>

    <scroll-view scroll-y class="body-scroll">
      <text class="sec-label">等级</text>
      <view class="card">
        <text class="val-t">需达<text class="hl">Lv.{{ level }}</text></text>
      </view>

      <text class="sec-label">项目经历</text>
      <view class="card">
        <text class="val-t">需至少有<text class="hl">{{ experience }}</text><text class="hl">次</text>共创经历</text>
      </view>

      <text class="sec-label">技能</text>
      <view class="skill-row">
        <view v-for="(s, i) in skills" :key="i" class="skill-pill">
          <text class="skill-pill-t">{{ s }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { mockProjects } from '@/mock/index.js'
import { getProjectDetail } from '@/api/project.js'
import { getSkills } from '@/api/user.js'
import { normalizeProject, skillNamesOf } from '@/api/adapter.js'
import { withFallback } from '@/utils/fallback.js'

const statusBarHeight = (uni.getSystemInfoSync().statusBarHeight || 0)

const level = ref('3')
const experience = ref('3')
const skills = ref([])

onLoad((options) => {
  const id = options && options.id
  if (id) load(id)
})

async function load(id) {
  const { data } = await withFallback(
    async () => {
      const [detail, dict] = await Promise.all([
        getProjectDetail(id),
        getSkills().catch(() => null)
      ])
      return { detail: normalizeProject(detail), dict }
    },
    () => {
      const p = mockProjects[id]
      return p ? { detail: p, dict: null } : null
    },
    'project/require: 项目要求'
  )
  if (!data || !data.detail) return
  const p = data.detail
  if (p.requiredLevel) level.value = String(p.requiredLevel)
  if (p.requiredProjectCount) experience.value = String(p.requiredProjectCount)
  const names = skillNamesOf(p.requiredSkills, data.dict)
  skills.value = names.length ? names : (p.skills || [])
}

function goBack() { uni.navigateBack() }
</script>

<style scoped>
/* 稿：402×874。导航 83.3px；标签 17.9px（33rpx）粗 #3A3A3A 左缘 22.2（41rpx）；
   值卡 355.6×37.9（663×71rpx）圆角 6.24（12rpx）；标签→卡 32.6px（61rpx），卡→下一标签 7.4px（14rpx）；
   技能胶囊 74.9×37.9 圆角 18.95（全圆），字 15.9px（30rpx）白粗 */
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
.nav-right { width: 60rpx; }

.body-scroll { flex: 1; min-height: 0; padding: 2rpx 0 0; box-sizing: border-box; overflow: hidden; }

.sec-label {
  display: block;
  font-size: 33rpx;
  line-height: 1;
  color: #3a3a3a;
  font-weight: 700;
  margin: 13rpx 0 28rpx 41rpx;
}
.body-scroll .sec-label:first-child { margin-top: 7rpx; }

.card {
  height: 71rpx;
  margin: 0 42rpx;
  border-radius: 12rpx;
  background: #fff;
  box-shadow: 8rpx 8rpx 15rpx rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  padding-left: 24rpx;
  box-sizing: border-box;
}
/* 值文字 13.9px（26rpx）#747474，强调 #77BBAC */
.val-t { font-size: 26rpx; color: #747474; }
.hl { color: #77bbac; }

.skill-row { display: flex; padding-left: 49rpx; }
/* 技能胶囊 74.9×37.9px（140×71rpx），渐变 #AFD5CD→#77BBAC 180deg */
.skill-pill {
  width: 140rpx;
  height: 71rpx;
  border-radius: 71rpx;
  background: linear-gradient(180deg, #afd5cd 0%, #77bbac 100%);
  /* 稿上技能胶囊右下深灰阴影（与值卡同组 outerShdw） */
  box-shadow: 8rpx 8rpx 15rpx rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14rpx;
}
.skill-pill-t { font-size: 30rpx; color: #fff; font-weight: 700; }
</style>
