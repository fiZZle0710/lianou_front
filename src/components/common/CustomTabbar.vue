<template>
  <view v-if="showTabbar" class="tabbar">
    <view
      class="tab-item"
      :class="{ active: currentPage === 'square' }"
      @click="goPage('/pages/square/index', 'square')"
    >
      <image class="tab-icon" :src="iconSrc('square', currentPage === 'square')" mode="aspectFit" />
      <text class="tab-label">广场</text>
    </view>

    <view
      class="tab-item"
      :class="{ active: currentPage === 'project' }"
      @click="goPage('/pages/project/index', 'project')"
    >
      <image class="tab-icon" :src="iconSrc('project', currentPage === 'project')" mode="aspectFit" />
      <text class="tab-label">项目</text>
    </view>

    <!-- 中间创作加号按钮 -->
    <view class="add" @click="showCreateModal = true">
      <text>＋</text>
    </view>

    <view
      class="tab-item"
      :class="{ active: currentPage === 'message' }"
      @click="goPage('/pages/message/index', 'message')"
    >
      <image class="tab-icon" :src="iconSrc('message', currentPage === 'message')" mode="aspectFit" />
      <text class="tab-label">消息</text>
    </view>

    <view
      class="tab-item"
      :class="{ active: currentPage === 'mine' }"
      @click="goPage('/pages/mine/index', 'mine')"
    >
      <image class="tab-icon" :src="iconSrc('mine', currentPage === 'mine')" mode="aspectFit" />
      <text class="tab-label">我的</text>
    </view>
  </view>

  <!-- 创作选择弹窗 -->
  <CreateModal
    v-if="showCreateModal"
    @close="showCreateModal = false"
    @select="handleCreateSelect"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CreateModal from './CreateModal.vue'
import nav from '@/utils/nav.js'

const showTabbar = ref(true)
const currentPage = ref('')
const showCreateModal = ref(false)

/**
 * 底栏图标：从标识库 Figma 的 Footer 组件导出的原始矢量路径，
 * 已生成 8 个 SVG（未选中灰 #808080 / 选中绿 #34D399）放在 src/static/tabbar/。
 * 四枚图标统一 24×24 画布、按设计原比例居中，任意 DPI 都清晰。
 */
function iconSrc(key, active) {
  return `/static/tabbar/${key}${active ? '-on' : ''}.svg`
}

onMounted(() => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  const route = page ? page.route : ''
  // 4 个 Tab 页都渲染了本组件，默认始终显示底栏
  showTabbar.value = true
  if (route === 'pages/square/index') currentPage.value = 'square'
  else if (route === 'pages/project/index') currentPage.value = 'project'
  else if (route === 'pages/message/index') currentPage.value = 'message'
  else if (route === 'pages/mine/index') currentPage.value = 'mine'
})

function goPage(url, name) {
  uni.reLaunch({
    url: url
  })
}

// 菜单 key → 页面路由统一维护在 utils/nav.js 的 goCreate()
function handleCreateSelect(key) {
  showCreateModal.value = false
  nav.goCreate(key)
}
</script>

<style scoped>
.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100rpx;
  z-index: 999;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1px solid #eee;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #747474;
  gap: 4rpx;
}

.tab-item.active {
  /* 选中态颜色同步到图标与文字 */
  color: #34d399;
}

.tab-icon {
  width: 44rpx; /* 24px，四枚图标统一画布，完整显示不裁切 */
  height: 44rpx;
}

.tab-label {
  font-size: 20rpx;
  line-height: 1.2;
}

.add {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #1da775; /* 标识库：中间加号为薄荷绿 */
  color: white;
  font-size: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -40rpx;
  z-index: 1000;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
}

.add:active {
  transform: scale(0.95);
}
</style>
