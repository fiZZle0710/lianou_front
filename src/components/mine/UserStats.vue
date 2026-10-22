<template>
  <!-- 数据卡：设计稿为深色半透明卡片，三列之间用细分隔线（105px 高、圆角 16px、左右内缩 22px） -->
  <view class="stats">
    <template v-for="(item, i) in list" :key="item.name">
      <view v-if="i > 0" class="split"></view>
      <view class="item" @click="handleClick(item)">
        <text class="num">{{ item.num }}</text>
        <text class="label">{{ item.label }}</text>
      </view>
    </template>
  </view>
</template>

<script setup>
// 数值先按设计稿示例；后端有「我的资料」接口后替换
const list = [
  { name: 'fans', num: '3.2万', label: '粉丝', url: '/pages/fans/index' },
  { name: 'follow', num: '128', label: '关注', url: '/pages/follow/index' },
  { name: 'works', num: '49', label: '作品', url: '' }
]

function handleClick(item) {
  if (!item.url) return
  uni.navigateTo({ url: item.url })
}
</script>

<style scoped>
.stats {
  display: flex;
  align-items: center;
  margin: 26rpx 41rpx 0; /* 设计稿：左右各 22px */
  height: 196rpx; /* 设计稿：105px */
  border-radius: 30rpx; /* 设计稿：16px */
  /* 左（白底）版实测：#6B746F；用 30,38,34 @0.66 叠在白底上得到同一观感 */
  background: rgba(30, 38, 34, 0.66);
}

.item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.item:active {
  opacity: 0.7;
}

.num {
  font-size: 38rpx; /* 设计稿：20px */
  font-weight: 600;
  color: #ffffff;
}

.label {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
}

.split {
  width: 2rpx;
  height: 48rpx;
  background: rgba(255, 255, 255, 0.16);
}
</style>
