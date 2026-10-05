<template>
  <!-- 演示数据灰标：接口回退到本地 mock 时显示，避免把假数据当成真实数据 -->
  <view v-if="visible" class="demo-badge" :class="'pos-' + position" @click="handleClick">
    <text class="demo-dot"></text>
    <text class="demo-text">{{ text }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 是否处于演示数据状态
  show: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: '演示数据'
  },
  // 位置：top-left / top-right / bottom-left / bottom-right / inline
  position: {
    type: String,
    default: 'top-right'
  }
})

const emit = defineEmits(['click'])

const visible = computed(() => props.show)

function handleClick() {
  emit('click')
}
</script>

<style scoped>
.demo-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 20px;
  z-index: 999;
}

/* 位置：默认右上角悬浮 */
.pos-top-right {
  position: fixed;
  right: 16px;
  top: 88px;
}

.pos-top-left {
  position: fixed;
  left: 16px;
  top: 88px;
}

.pos-bottom-right {
  position: fixed;
  right: 16px;
  bottom: 32px;
}

.pos-bottom-left {
  position: fixed;
  left: 16px;
  bottom: 32px;
}

/* inline：跟随文档流，放在标题旁边 */
.pos-inline {
  position: static;
  margin-left: 8px;
}

.demo-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffd666;
  margin-right: 6px;
  flex-shrink: 0;
}

.demo-text {
  font-size: 11px;
  color: #fff;
  line-height: 1.4;
}
</style>
