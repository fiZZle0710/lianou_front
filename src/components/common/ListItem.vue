<template>
  <!-- 通用列表条目组件 -->
  <view class="list-item" :class="{ 'no-border': noBorder }" @click="handleClick">
    <!-- 左侧图标/头像 -->
    <view v-if="$slots.left || leftIcon" class="item-left">
      <slot name="left">
        <image v-if="leftIcon" :src="leftIcon" mode="aspectFill" class="left-icon"></image>
      </slot>
    </view>

    <!-- 中间内容 -->
    <view class="item-center">
      <slot name="center">
        <text class="item-title">{{ title }}</text>
        <text v-if="subtitle" class="item-subtitle">{{ subtitle }}</text>
      </slot>
    </view>

    <!-- 右侧内容 -->
    <view class="item-right">
      <slot name="right">
        <text v-if="rightText" class="right-text">{{ rightText }}</text>
        <view v-if="showArrow" class="right-arrow">
          <text class="arrow-icon">›</text>
        </view>
      </slot>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  leftIcon: {
    type: String,
    default: ''
  },
  rightText: {
    type: String,
    default: ''
  },
  showArrow: {
    type: Boolean,
    default: false
  },
  noBorder: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

function handleClick() {
  emit('click')
}
</script>

<style scoped>
.list-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  min-height: 50px;
}

.list-item.no-border {
  border-bottom: none;
}

.item-left {
  margin-right: 12px;
  flex-shrink: 0;
}

.left-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.item-center {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 15px;
  color: #333;
  display: block;
  line-height: 1.4;
}

.item-subtitle {
  font-size: 12px;
  color: #999;
  display: block;
  margin-top: 4px;
}

.item-right {
  display: flex;
  align-items: center;
  margin-left: 12px;
  flex-shrink: 0;
}

.right-text {
  font-size: 13px;
  color: #999;
  margin-right: 6px;
}

.right-arrow {
  display: flex;
  align-items: center;
}

.arrow-icon {
  font-size: 20px;
  color: #ccc;
  font-weight: bold;
}
</style>