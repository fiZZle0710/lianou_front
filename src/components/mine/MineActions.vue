<template>
  <view class="actions">
    <view
      class="action"
      :class="{ active: active === 'history' }"
      @click="history"
    >
      浏览记录
    </view>

    <view
      class="action"
      :class="{ active: active === 'group' }"
      @click="group"
    >
      群聊
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const active = ref('')

function history() {
  active.value = 'history'

  setTimeout(() => {
    uni.navigateTo({
      url: '/pages/history/index',
      complete: () => {
        // 跳转完成后恢复点击状态
        setTimeout(() => {
          active.value = ''
        }, 100)
      }
    })
  }, 150)
}

function group() {
  active.value = 'group'

  setTimeout(() => {
    uni.navigateTo({
      url: '/pages/group/index',
      complete: () => {
        setTimeout(() => {
          active.value = ''
        }, 100)
      }
    })
  }, 150)
}
</script>

<style scoped>
.actions {
  display: flex;
  background: white;
  padding: 12px 20px;
}

.action {
  padding: 8px 18px;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 13px;
  margin-right: 12px;
  transition: 0.15s;
}

.action.active {
  background: #ddd;
  transform: scale(0.95);
}
</style>