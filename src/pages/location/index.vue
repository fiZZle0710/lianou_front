<template>
  <!-- 定位选择页面 -->
  <view class="page">
    <CustomNavbar title="选择位置" showBack />

    <view class="location-container">
      <!-- 顶部搜索输入框 -->
      <view class="search-section">
        <view class="search-input-wrapper">
          <text class="search-icon">🔍</text>
          <input
            class="search-input"
            v-model="keyword"
            type="text"
            placeholder="搜索地点..."
            confirm-type="search"
            @confirm="searchLocation"
          />
          <text v-if="keyword" class="clear-btn" @click="keyword = ''">✕</text>
        </view>
      </view>

      <!-- 不显示位置选项 -->
      <view class="no-location" @click="selectNoLocation">
        <view class="no-location-icon">
          <text>🚫</text>
        </view>
        <text class="no-location-text">不显示位置</text>
        <view class="radio-box">
          <view v-if="selectedLocation === 'none'" class="radio-dot"></view>
        </view>
      </view>

      <!-- 距离范围选择 -->
      <view class="section">
        <view class="section-title">距离范围</view>
        <view class="distance-list">
          <view
            v-for="(item, index) in distances"
            :key="index"
            class="distance-item"
            :class="{ selected: selectedDistance === item.value }"
            @click="selectedDistance = item.value"
          >
            <text class="distance-label">{{ item.label }}</text>
            <view class="radio-box">
              <view v-if="selectedDistance === item.value" class="radio-dot"></view>
            </view>
          </view>
        </view>
      </view>

      <!-- 热门地点列表 -->
      <view class="section">
        <view class="section-title">热门地点</view>
        <view class="location-list">
          <view
            v-for="(item, index) in hotLocations"
            :key="index"
            class="location-item"
            :class="{ selected: selectedLocation === item.name }"
            @click="selectLocation(item)"
          >
            <view class="location-icon">
              <text>📍</text>
            </view>
            <view class="location-info">
              <text class="location-name">{{ item.name }}</text>
              <text class="location-address">{{ item.address }}</text>
            </view>
            <view class="radio-box">
              <view v-if="selectedLocation === item.name" class="radio-dot"></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部确定按钮 -->
    <view class="bottom-action">
      <view class="confirm-btn" @click="confirmLocation">
        <text>确定</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import CustomNavbar from '@/components/common/CustomNavbar.vue'

const keyword = ref('')
const selectedLocation = ref('none')
const selectedDistance = ref('1km')

const distances = [
  { label: '10米', value: '10m' },
  { label: '30米', value: '30m' },
  { label: '1公里', value: '1km' },
  { label: '20公里', value: '20km' }
]

const hotLocations = ref([
  { name: '创意产业园', address: '科技路128号' },
  { name: '城市广场', address: '中心大道88号' },
  { name: '艺术中心', address: '文化路66号' },
  { name: '书店咖啡', address: '文艺路22号' }
])

function searchLocation() {
  uni.showToast({ title: `搜索: ${keyword.value}`, icon: 'none' })
}

function selectNoLocation() {
  selectedLocation.value = 'none'
}

function selectLocation(item) {
  selectedLocation.value = item.name
}

function confirmLocation() {
  uni.navigateBack()
}
</script>

<style scoped>
.page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.location-container {
  padding: 20rpx;
}

/* 搜索栏 */
.search-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 10rpx;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 24rpx;
  height: 72rpx;
}

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  height: 72rpx;
}

.clear-btn {
  font-size: 28rpx;
  color: #999;
  padding: 8rpx;
}

/* 不显示位置 */
.no-location {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 10rpx;
}

.no-location-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.no-location-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

/* 区块 */
.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 10rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

/* 距离列表 */
.distance-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.distance-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 20rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
  border: 1px solid transparent;
}

.distance-item.selected {
  background: #f0f7ff;
  border-color: #007aff;
}

.distance-label {
  font-size: 26rpx;
  color: #333;
}

.distance-item.selected .distance-label {
  color: #007aff;
}

.distance-item .radio-box {
  width: 28rpx;
  height: 28rpx;
  display: none;
}

.distance-item.selected .radio-box {
  display: flex;
}

/* 地点列表 */
.location-list {
  display: flex;
  flex-direction: column;
}

.location-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid #f5f5f5;
}

.location-item:last-child {
  border-bottom: none;
}

.location-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.location-info {
  flex: 1;
  min-width: 0;
}

.location-name {
  font-size: 28rpx;
  color: #333;
  display: block;
}

.location-address {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
  display: block;
}

.radio-box {
  width: 36rpx;
  height: 36rpx;
  border: 2px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.radio-dot {
  width: 20rpx;
  height: 20rpx;
  background: #007aff;
  border-radius: 50%;
}

.location-item.selected .radio-box {
  border-color: #007aff;
}

/* 底部按钮 */
.bottom-action {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
}

.confirm-btn {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #007aff;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
}

.confirm-btn:active {
  opacity: 0.8;
}
</style>