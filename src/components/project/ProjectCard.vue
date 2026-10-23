<template>
  <!-- 项目卡片：对齐 tif/项目.tif 设计稿
       结构 = 发起人头像 + 「XX 发布的共创项目招募」+ 引言 + 左右两块浅绿信息区 + 右下箭头 -->
  <view class="proj-card" @click="emit('click')">
    <!-- 发起人 + 标题 + 更多 -->
    <view class="head">
      <view class="avatar-bg"><text class="avatar-txt">{{ ownerName[0] }}</text></view>
      <view class="head-info">
        <view class="name-row">
          <text class="name">{{ ownerName }}</text>
          <text class="name-sub">发布的共创项目招募</text>
        </view>
        <text v-if="intro" class="quote">“{{ intro }}”</text>
      </view>
      <view class="kebab">
        <view class="dot"></view>
        <view class="dot"></view>
        <view class="dot"></view>
      </view>
    </view>

    <!-- 条件 + 招募人数 -->
    <view class="body">
      <!-- 左：主题与门槛 -->
      <view class="block block-req">
        <text class="block-title">主题：{{ topic }}</text>
        <view class="req-line">
          <text class="req-t">· 加入本项目需达到</text>
          <text class="chip">{{ levelReq }}</text>
        </view>
        <view class="req-line">
          <text class="req-t">· 至少有</text>
          <text class="chip">{{ experienceReq }}</text>
        </view>
        <text class="req-t ellipsis">· {{ skillText }}</text>
      </view>

      <!-- 右：招募人数与成员 -->
      <view class="block block-mem">
        <text class="block-title">招募人数（{{ current }}/{{ total }}）</text>
        <view class="members">
          <view v-for="(m, i) in memberSlots" :key="i" class="m-avatar">
            <text class="m-txt">{{ m }}</text>
          </view>
          <view v-if="hasMoreThanSlots" class="m-more"><text class="m-more-t">···</text></view>
        </view>
      </view>
    </view>

    <image class="arrow" src="/static/icons/icon-arrow-right.svg" mode="aspectFit" />
  </view>
</template>
<script setup>
import { computed } from 'vue'

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

const MAX_MEMBERS = 4

/** 稿上最多 4 个头像 + 「···」；成员信息缺失时按已报名人数占位，避免整块空白 */
const memberSlots = computed(() => {
  const list = (props.members || []).filter(Boolean)
  if (list.length) {
    return list.slice(0, MAX_MEMBERS).map((m) => (typeof m === 'string' ? m[0] : (m.nickname || '')[0] || ''))
  }
  const n = Math.min(props.current || 0, MAX_MEMBERS)
  return new Array(n).fill('')
})

/** 成员多于 4 个（或人数未填满但已有人在看）时显示省略号 */
const hasMoreThanSlots = computed(() => (props.members || []).filter(Boolean).length > MAX_MEMBERS || (!props.members.length && props.current > MAX_MEMBERS))

/** 设计稿里技能是一行灰字「·善写剧本 配音者优先」 */
const skillText = computed(() => {
  const list = (props.skills || []).filter(Boolean)
  return list.length ? list.join(' ') : '技能不限'
})
</script>

<style scoped>
/* 稿上标题类文字用宋体（衬线），系统无宋体时回落到默认字体 */
.serif {
  font-family: "Songti SC", "STSong", "Noto Serif SC", "Source Han Serif SC", serif;
}

.proj-card {
  position: relative;
  background: #fff;
  border-radius: 30rpx;
  padding: 22rpx 22rpx 26rpx;
  margin-bottom: 22rpx;
  /* 四边都要有阴影（原来只有 y 偏移，右侧几乎看不出，用户反馈补上） */
  box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.07), 0 8rpx 22rpx rgba(0, 0, 0, 0.05);
}
.proj-card:active { opacity: .94; }

/* 头部 */
.head { display: flex; align-items: flex-start; }
.avatar-bg {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #4e6f66;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatar-txt { font-size: 28rpx; color: #fff; }
.head-info { flex: 1; min-width: 0; margin-left: 16rpx; padding-top: 2rpx; }
.name-row { display: flex; align-items: baseline; flex-wrap: wrap; }
.name {
  font-size: 30rpx;
  color: #2e2e2e;
  font-weight: 700;
  font-family: "Songti SC", "STSong", "Noto Serif SC", "Source Han Serif SC", serif;
}
.name-sub { font-size: 24rpx; color: #6b6b6b; margin-left: 6rpx; }
.quote {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #8a8a8a;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 右上角「更多」三点 */
.kebab { width: 40rpx; display: flex; flex-direction: column; align-items: center; padding-top: 10rpx; }
.dot { width: 8rpx; height: 8rpx; border-radius: 50%; background: #b3b3b3; margin-bottom: 8rpx; }

/* 两块信息区：左右等宽，右侧留出箭头位置（稿上箭头在两块之外） */
.body { display: flex; align-items: stretch; margin-top: 18rpx; padding-right: 52rpx; }
.block {
  background: #e6eeed;
  border-radius: 16rpx;
  padding: 18rpx 20rpx;
  min-height: 150rpx;
  box-sizing: border-box;
}
.block-req { flex: 1; margin-right: 12rpx; }
.block-mem { flex: 1; }
.block-title {
  display: block;
  font-size: 19rpx;
  color: #3c3c3c;
  font-weight: 700;
  font-family: "Songti SC", "STSong", "Noto Serif SC", "Source Han Serif SC", serif;
  margin-bottom: 10rpx;
  white-space: nowrap;
}
.req-line { display: flex; align-items: center; margin-bottom: 4rpx; white-space: nowrap; }
.req-t { font-size: 18rpx; color: #4a4a4a; line-height: 1.6; white-space: nowrap; }
.ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
.chip {
  margin-left: 8rpx;
  padding: 0 10rpx;
  border: 1rpx solid #9cc3b6;
  border-radius: 20rpx;
  font-size: 18rpx;
  color: #4f8a78;
  line-height: 28rpx;
  flex-shrink: 0;
}

/* 招募成员 */
.members { display: flex; align-items: center; margin-top: 10rpx; }
.m-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #cfded9;
  border: 3rpx solid #fbfdfc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: -16rpx;
}
.m-txt { font-size: 22rpx; color: #4e6f66; }
.m-more {
  width: 54rpx;
  height: 54rpx;
  border-radius: 50%;
  background: #f7fbfa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 24rpx;
}
.m-more-t { font-size: 24rpx; color: #8a9a96; letter-spacing: -2rpx; }

/* 右下箭头 */
.arrow {
  position: absolute;
  right: 24rpx;
  bottom: 30rpx;
  width: 36rpx;
  height: 30rpx;
}
</style>
