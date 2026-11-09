<template>
  <!-- 项目卡片：按 tif/项目.pptm
       variant="list" → slide1 项目中心：343.2×154，右上「⋯」，右下箭头
       variant="mine" → slide2 我的项目：355.6×159.6，右上日期，右下「⋯」 -->
  <view class="proj-card" :class="'v-' + variant" @click="emit('click')">
    <!-- 发起人 + 标题 + 右侧附属 -->
    <view class="head">
      <view class="avatar-bg avatar-ring-white"><text class="avatar-txt">{{ ownerName[0] }}</text></view>
      <view class="head-info">
        <view class="name-row">
          <text class="name">{{ ownerName }}</text>
          <text class="name-sub">发布的共创项目招募</text>
        </view>
        <text v-if="intro" class="quote">“{{ intro }}”</text>
      </view>
      <text v-if="variant === 'mine' && date" class="head-date">{{ date }}</text>
      <image v-else-if="variant === 'list'" class="kebab" src="/static/icons/icon-dots-grey.svg" mode="aspectFit" />
    </view>

    <!-- 条件 + 招募人数 -->
    <view class="body">
      <!-- 左：主题与门槛 -->
      <view class="block block-req">
        <text class="block-title">主题：{{ topic }}</text>
        <view class="req-line">
          <text class="req-t">·加入本项目需达到</text>
          <text class="chip">{{ levelReq }}</text>
        </view>
        <view class="req-line">
          <text class="req-t">·至少有</text>
          <text class="chip">{{ experienceReq }}</text>
        </view>
        <text class="req-t ellipsis">·{{ skillText }}</text>
      </view>

      <!-- 右：招募人数与成员 -->
      <view class="block block-mem">
        <text class="block-title">招募人数（{{ current }}/{{ total }}）</text>
        <view class="members">
          <view v-for="(m, i) in memberSlots" :key="i" class="m-avatar avatar-ring-white">
            <text class="m-txt">{{ m }}</text>
          </view>
          <view v-if="hasMoreThanSlots" class="m-more"><text class="m-more-t">…</text></view>
        </view>
      </view>
    </view>

    <!-- 右下角：列表卡是箭头，我的卡是「⋯」 -->
    <image
      class="corner"
      :src="variant === 'mine' ? '/static/icons/icon-dots-grey.svg' : '/static/icons/icon-arrow-right-grey.svg'"
      mode="aspectFit"
    />
  </view>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'list' },
  ownerName: { type: String, default: "" },
  ownerLevel: { type: Number, default: 0 },
  title: { type: String, default: "" },
  deadline: { type: String, default: "" },
  date: { type: String, default: "" },
  intro: { type: String, default: "" },
  topic: { type: String, default: "" },
  levelReq: { type: String, default: "" },
  experienceReq: { type: String, default: "" },
  skills: { type: Array, default: () => [] },
  skillTextRaw: { type: String, default: "" },
  members: { type: Array, default: () => [] },
  current: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
})
const emit = defineEmits(["click"])

// 稿上右块内是 5 枚成员圆 + 末尾一枚白色「…」气泡
const MAX_MEMBERS = 5

/** 成员信息缺失时按已报名人数占位，避免整块空白 */
const memberSlots = computed(() => {
  const list = (props.members || []).filter(Boolean)
  if (list.length) {
    return list.slice(0, MAX_MEMBERS).map((m) => (typeof m === 'string' ? m[0] : (m.nickname || '')[0] || ''))
  }
  const n = Math.min(props.current || 0, MAX_MEMBERS)
  return new Array(n).fill('')
})

/** 成员多于 5 个（或人数未填满但已有人在看）时显示省略气泡 */
const hasMoreThanSlots = computed(() => (props.members || []).filter(Boolean).length > MAX_MEMBERS || (!props.members.length && props.current > MAX_MEMBERS))

/** 设计稿里技能是一行灰字「·善写剧本 配音者优先」 */
const skillText = computed(() => {
  if (props.skillTextRaw) return props.skillTextRaw
  const list = (props.skills || []).filter(Boolean)
  return list.length ? list.join(' ') : '技能不限'
})
</script>

<style scoped>
/* ---------- 通用 ---------- */
.proj-card {
  position: relative;
  background: #fff;
  border: 1px solid #e5e5e5;
  box-sizing: border-box;
}
.proj-card:active { opacity: .94; }

.head { display: flex; align-items: flex-start; }
.avatar-bg {
  border-radius: 50%;
  background: #4e6f66;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatar-txt { color: #fff; }
.head-info { flex: 1; min-width: 0; }
.name-row { display: flex; align-items: baseline; flex-wrap: wrap; }
.name { font-weight: 700; color: #3a3a3a; }
.name-sub { font-weight: 700; color: #747474; }
.quote {
  display: block;
  color: #3a3a3a;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.body { display: flex; align-items: stretch; }
.block {
  background: #e6eeed;
  box-sizing: border-box;
}
.block-req { flex: 1; }
.block-mem { flex: 1; }
.block-title {
  display: block;
  color: #595959;
  line-height: 1.5;
  white-space: nowrap;
}
.req-line { display: flex; align-items: center; white-space: nowrap; }
.req-t { color: #404040; line-height: 1.5; white-space: nowrap; }
.ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
/* 稿上两枚描边胶囊：圆角 6.7，描边 #77BBAC 0.5 */
.chip {
  border: 1rpx solid #77bbac;
  color: #77bbac;
  flex-shrink: 0;
}

.members { display: flex; align-items: center; }
.m-avatar {
  border-radius: 50%;
  background: #4e6f66;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.m-txt { color: #fff; }
.m-more {
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.m-more-t { color: #4e6f66; line-height: 1; }

/* ---------- slide1：项目中心列表卡 ---------- */
/* 卡 343.2×154，圆角 11.25，左内边距 13.5，信息块右留 43.3（给右下箭头） */
/* 卡 343.2×154（= 屏宽 402 左右各留 29.4），圆角 11.25，左内边距 13.5，信息块右留 43.3（给右下箭头） */
.v-list {
  min-height: 287rpx;
  border-radius: 21rpx;
  padding: 21rpx 81rpx 23rpx 25rpx;
  margin: 0 16rpx 22rpx;
}
.v-list .avatar-bg { width: 73rpx; height: 73rpx; }
.v-list .avatar-txt { font-size: 28rpx; }
.v-list .head-info { margin-left: 20rpx; }
.v-list .name { font-size: 30rpx; }
.v-list .name-sub { font-size: 22rpx; margin-left: 4rpx; }
.v-list .quote { margin-top: 5rpx; font-size: 15rpx; }
/* 三点右移到与右下角箭头同一 x（中心距右 43.5rpx），上下位置不变（top=21+14=35rpx） */
.v-list .kebab { position: absolute; right: 26rpx; top: 35rpx; width: 35rpx; height: 35rpx; margin-top: 0; }
.v-list .body { margin-top: 20rpx; }
.v-list .block { border-radius: 12rpx; padding: 8rpx 10rpx; height: 151rpx; }
.v-list .block-req { margin-right: 13rpx; }
.v-list .block-title { font-size: 18rpx; margin-bottom: 2rpx; }
.v-list .req-line { margin-top: 2rpx; }
.v-list .req-t { font-size: 15rpx; }
.v-list .chip { margin-left: 4rpx; padding: 0 6rpx; border-radius: 13rpx; font-size: 15rpx; line-height: 25rpx; }
.v-list .members { margin-top: 30rpx; }
.v-list .m-avatar { width: 54rpx; height: 54rpx; margin-right: -20rpx; }
.v-list .m-txt { font-size: 20rpx; }
.v-list .m-more { width: 36rpx; height: 36rpx; margin-left: 13rpx; }
.v-list .m-more-t { font-size: 30rpx; }
.v-list .corner { position: absolute; right: 18rpx; bottom: 16rpx; width: 51rpx; height: 51rpx; }

/* ---------- slide2：我的项目卡 ---------- */
/* 卡 355.6×159.6，圆角 11.65，左内边距 14，右上日期，右下「⋯」 */
.v-mine {
  width: 663rpx;
  max-width: 100%;
  min-height: 298rpx;
  border-radius: 22rpx;
  padding: 22rpx 22rpx 24rpx 26rpx;
  margin: 0 auto 20rpx;
}
/* 稿：两块信息区各 143.7 宽、间距 7.3，右缘止于 333.6（右侧 33px 留给右下「⋯」） */
.v-mine .body { padding-right: 66rpx; }
.v-mine .avatar-bg { width: 75rpx; height: 75rpx; }
.v-mine .avatar-txt { font-size: 28rpx; }
.v-mine .head-info { margin-left: 20rpx; }
.v-mine .name { font-size: 30rpx; }
.v-mine .name-sub { font-size: 22rpx; margin-left: 4rpx; }
.v-mine .quote { margin-top: 5rpx; font-size: 15rpx; }
.v-mine .head-date {
  flex-shrink: 0;
  font-size: 18rpx;
  color: #808080;
  line-height: 1;
  margin-top: 8rpx;
}
.v-mine .body { margin-top: 20rpx; }
.v-mine .block { border-radius: 12rpx; padding: 8rpx 10rpx; height: 156rpx; }
.v-mine .block-req { margin-right: 13rpx; }
.v-mine .block-title { font-size: 18rpx; margin-bottom: 2rpx; }
.v-mine .req-line { margin-top: 2rpx; }
.v-mine .req-t { font-size: 15rpx; }
.v-mine .chip { margin-left: 4rpx; padding: 0 6rpx; border-radius: 13rpx; font-size: 15rpx; line-height: 25rpx; }
.v-mine .members { margin-top: 32rpx; }
.v-mine .m-avatar { width: 56rpx; height: 56rpx; margin-right: -20rpx; }
.v-mine .m-txt { font-size: 20rpx; }
.v-mine .m-more { width: 37rpx; height: 37rpx; margin-left: 13rpx; }
.v-mine .m-more-t { font-size: 30rpx; }
.v-mine .corner { position: absolute; right: 18rpx; bottom: 22rpx; width: 36rpx; height: 36rpx; }
</style>
