<template>
  <view class="stats">
    <view
      v-for="item in list"
      :key="item.name"
      class="item"
      :class="{ active: clickItem === item.name }"
      @click="handleClick(item)"
    >
      <text class="num">{{ item.num }}</text>
      <text>{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const clickItem = ref('')

const list = [
  { name: 'fans', num: 128, label: '粉丝' },
  { name: 'follow', num: 56, label: '关注' },
  { name: 'works', num: 23, label: '作品' }
]

function handleClick(item) {
  // 作品暂时无效果
  if (item.name === 'works') {
    return
  }

  // 设置点击态
  clickItem.value = item.name

  // 延迟跳转，并在跳转后恢复状态
  setTimeout(() => {
    if (item.name === 'fans') {
      uni.navigateTo({
        url: '/pages/fans/index',
        complete: () => {
          // 跳转完成后恢复点击状态
          setTimeout(() => {
            clickItem.value = ''
          }, 100)
        }
      })
    }

    if (item.name === 'follow') {
      uni.navigateTo({
        url: '/pages/follow/index',
        complete: () => {
          setTimeout(() => {
            clickItem.value = ''
          }, 100)
        }
      })
    }
  }, 150)
}
</script>

<style scoped>
.stats {
  display: flex;
  flex-direction: row;
  background: white;
  padding: 20px 0;
}

.item {
  flex: 1;
  height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: 0.15s;
}

.item.active {
  background: #eee;
}

.num {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}
</style>