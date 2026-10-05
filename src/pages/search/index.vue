<template>
  <!-- 页面8：搜索页（二级页面） -->
  <view class="page">
    <!-- 顶部搜索栏 -->
    <view class="search-header">
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="keyword"
          type="text"
          placeholder="搜索作品、用户..."
          confirm-type="search"
          @confirm="doSearch"
          @input="onInput"
          focus
        />
        <text v-if="keyword" class="clear-btn" @click="clearSearch">✕</text>
      </view>
      <text class="cancel-btn" @click="goBack">取消</text>
    </view>

    <!-- 搜索结果区域 -->
    <scroll-view scroll-y class="result-scroll" @scrolltolower="loadMore">
      <!-- 搜索提示 -->
      <view v-if="!searched" class="search-hint">
        <text class="hint-text">输入关键词搜索作品</text>
      </view>

      <!-- 搜索结果 -->
      <view v-else class="result-content">
        <!-- 搜索结果统计 -->
        <view class="result-stats">
          <text class="stats-text">共找到 {{ resultCount }} 个结果</text>
        </view>

        <!-- 双列瀑布流作品卡片 -->
        <view class="waterfall">
          <view class="waterfall-column">
            <view
              v-for="(item, index) in leftColumn"
              :key="index"
              class="waterfall-item"
            >
              <WorkCard
                :src="item.src"
                :title="item.title"
                :author="item.author"
                :likes="item.likes"
                :showFav="item.showFav"
                :data-id="item.id"
                @click="goWorkDetail"
              />
            </view>
          </view>
          <view class="waterfall-column">
            <view
              v-for="(item, index) in rightColumn"
              :key="index"
              class="waterfall-item"
            >
              <WorkCard
                :src="item.src"
                :title="item.title"
                :author="item.author"
                :likes="item.likes"
                :showFav="item.showFav"
                :data-id="item.id"
                @click="goWorkDetail"
              />
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view class="load-more">
          <text v-if="hasMore" class="load-text">上拉加载更多</text>
          <text v-else class="load-text">— 没有更多了 —</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import WorkCard from '@/components/common/WorkCard.vue'

const keyword = ref('')
const searched = ref(false)
const hasMore = ref(true)
const resultCount = ref(0)

// 模拟搜索结果数据（占位）
const searchResults = ref([])

// 双列瀑布流数据拆分
const leftColumn = computed(() => {
  return searchResults.value.filter((_, index) => index % 2 === 0)
})

const rightColumn = computed(() => {
  return searchResults.value.filter((_, index) => index % 2 === 1)
})

// 输入防抖
let searchTimer = null
function onInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (keyword.value.trim()) {
      doSearch()
    }
  }, 500)
}

// 执行搜索
function doSearch() {
  if (!keyword.value.trim()) return
  searched.value = true
  // 模拟搜索结果
  searchResults.value = [
    { id: 1, src: '', title: `搜索结果 - ${keyword.value} 1`, author: '作者A', likes: 128, showFav: true },
    { id: 2, src: '', title: `搜索结果 - ${keyword.value} 2`, author: '作者B', likes: 256, showFav: false },
    { id: 3, src: '', title: `搜索结果 - ${keyword.value} 3`, author: '作者C', likes: 64, showFav: true },
    { id: 4, src: '', title: `搜索结果 - ${keyword.value} 4`, author: '作者D', likes: 512, showFav: false }
  ]
  resultCount.value = searchResults.value.length
}

// 清除搜索
function clearSearch() {
  keyword.value = ''
  searched.value = false
  searchResults.value = []
}

// 返回
function goBack() {
  uni.navigateBack()
}

// 加载更多
function loadMore() {
  if (!hasMore.value) return
  uni.showToast({ title: '加载更多...', icon: 'none' })
}

// 跳转作品详情
function goWorkDetail(e) {
  const id = e.currentTarget ? e.currentTarget.dataset.id : null
  if (!id) return
  uni.showToast({ title: `查看作品: ${id}`, icon: 'none' })
}
</script>

<style scoped>
.page {
  background: #f5f5f5;
  min-height: 100vh;
}

/* 搜索栏 */
.search-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #fff;
  padding-top: calc(44px + env(safe-area-inset-top));
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 0 12px;
  height: 36px;
}

.search-icon {
  font-size: 16px;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  font-size: 14px;
  height: 36px;
}

.clear-btn {
  font-size: 14px;
  color: #999;
  padding: 4px 8px;
}

.cancel-btn {
  font-size: 14px;
  color: #007aff;
  margin-left: 12px;
  flex-shrink: 0;
}

/* 搜索结果区域 */
.result-scroll {
  height: calc(100vh - 60px);
}

.search-hint {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.hint-text {
  font-size: 14px;
  color: #bbb;
}

.result-stats {
  padding: 12px 16px;
}

.stats-text {
  font-size: 13px;
  color: #999;
}

/* 双列瀑布流 */
.waterfall {
  display: flex;
  padding: 0 8px;
  gap: 8px;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.waterfall-item {
  break-inside: avoid;
}

.load-more {
  padding: 20px;
  text-align: center;
}

.load-text {
  font-size: 13px;
  color: #bbb;
}
</style>