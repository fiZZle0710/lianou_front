<template>
  <!-- 相册选图页（分支B·页面2）——数据来自手机真实相册 -->
  <view class="page">
    <view class="header">
      <view class="close" @click="close"><text class="close-t">✕</text></view>
      <view class="title">
        <text class="title-t">相册</text>
        <text class="arrow">▼</text>
      </view>
      <view class="header-right" @click="pickFromAlbum"><text class="header-add">＋</text></view>
    </view>

    <scroll-view scroll-y class="grid-scroll">
      <view v-if="photos.length" class="grid">
        <view v-for="p in photos" :key="p.id" class="grid-item" @click="openPreview(p.id)">
          <image class="thumb-img" :src="p.src" mode="aspectFill"></image>
          <view class="marker" :class="{ on: isSelected(p.id) }">
            <text class="marker-t">{{ isSelected(p.id) ? orderOf(p.id) : '' }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty">
        <text class="empty-icon">🖼️</text>
        <text class="empty-text">还没有选择照片</text>
        <view class="empty-btn" @click="pickFromAlbum"><text class="empty-btn-t">＋ 从相册添加</text></view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="left">
        <view class="quick">
          <view class="quick-icon" @click="selectAll"><text class="quick-t">⏺</text></view>
          <view class="quick-icon" @click="clearAll"><text class="quick-t">✕</text></view>
        </view>
        <scroll-view scroll-x class="selected-scroll">
          <view class="thumbs">
            <view
              v-for="p in selectedPhotos()"
              :key="p.id"
              class="sel-thumb"
              @click="openPreview(p.id)"
            >
              <image class="sel-thumb-img" :src="p.src" mode="aspectFill"></image>
            </view>
          </view>
        </scroll-view>
      </view>
      <view class="next-btn" @click="goNext"><text class="next-t">下一步 ({{ selected.length }})</text></view>
    </view>

    <view v-if="preview && previewItem" class="preview-mask" @click="closePreview">
      <view class="preview-body" @click.stop>
        <swiper class="preview-swiper" :current="preview.index" @change="onSwiperChange">
          <swiper-item v-for="p in photos" :key="p.id">
            <image class="big-img" :src="p.src" mode="aspectFit"></image>
          </swiper-item>
        </swiper>
        <view class="preview-thumbs">
          <view class="p-thumb" :class="{ active: isSelected(previewItem.id) }">
            <image class="p-thumb-img" :src="previewItem.src" mode="aspectFill"></image>
          </view>
          <view class="p-thumb plus" @click="pickFromAlbum"><text class="p-plus-t">＋</text></view>
        </view>
        <view class="preview-actions">
          <view class="select-btn" :class="{ on: isSelected(previewItem.id) }" @click="toggleSelect(previewItem.id)">
            <text class="select-t">{{ isSelected(previewItem.id) ? '已选择' : '选择' }}</text>
          </view>
          <view class="confirm-btn" @click="closePreview"><text class="confirm-t">确定</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue"
import { onReady } from "@dcloudio/uni-app"
import { setSelectedImages } from "@/utils/createStore.js"

const MAX_COUNT = 9

// 真实相册照片列表：[{ id, src }]，src 为系统相册返回的本地临时路径
const photos = ref([])
// 已选中照片 id（数组顺序即选择顺序）
const selected = ref([])
const preview = ref(null)
let uid = 0

function orderOf(id) {
  const idx = selected.value.indexOf(id)
  return idx === -1 ? 0 : idx + 1
}
function isSelected(id) {
  return selected.value.indexOf(id) > -1
}
function toggleSelect(id) {
  const idx = selected.value.indexOf(id)
  if (idx > -1) selected.value.splice(idx, 1)
  else selected.value.push(id)
}
function selectedPhotos() {
  return selected.value
    .map(function(id) { return photos.value.find(function(p) { return p.id === id }) })
    .filter(Boolean)
}

// ⚠️ 后端缺口说明：09-15 接口文档里**没有相册/照片接口**（档案模块只有「浏览记录」2.5/2.6 与文件上传 2.27/3.9），
// 所以本页保持「本地素材选择」：选图 → 预览/排序 → goNext() 把本地路径写进 createStore，再由发布页统一上传。
// 唤起系统相册选图（真实照片）。sourceType: ['album'] 只走相册，不弹拍摄
function pickFromAlbum() {
  const rest = MAX_COUNT - photos.value.length
  if (rest <= 0) {
    uni.showToast({ title: "最多选择" + MAX_COUNT + "张", icon: "none" })
    return
  }
  uni.chooseImage({
    count: rest,
    sizeType: ["compressed"],
    sourceType: ["album"],
    success(res) {
      const paths = res.tempFilePaths || []
      if (!paths.length) return
      paths.forEach(function(p) {
        photos.value.push({ id: ++uid, src: p })
      })
      // 新加入的照片默认选中，排在已选照片之后
      photos.value.slice(photos.value.length - paths.length).forEach(function(p) {
        if (selected.value.indexOf(p.id) === -1) selected.value.push(p.id)
      })
      uni.showToast({ title: "已添加 " + paths.length + " 张", icon: "none" })
    },
    fail() {
      // 用户取消选择：保留当前列表与选中状态
    }
  })
}

function openPreview(id) {
  preview.value = { index: photos.value.findIndex(function(p) { return p.id === id }) }
}
function closePreview() {
  preview.value = null
}
function onSwiperChange(e) {
  if (preview.value) preview.value.index = e.detail.current
}
const previewItem = computed(function() {
  if (!preview.value) return null
  return photos.value[preview.value.index] || null
})

function selectAll() {
  selected.value = photos.value.slice(0, MAX_COUNT).map(function(p) { return p.id })
}
function clearAll() {
  selected.value = []
}

function goNext() {
  if (selected.value.length === 0) {
    uni.showToast({ title: "请先选择图片", icon: "none" })
    return
  }
  const items = selectedPhotos().map(function(p) {
    return { id: p.id, src: p.src, gradient: "", label: "" }
  })
  setSelectedImages(items)
  uni.navigateTo({ url: "/pages/publish/image" })
}
function close() {
  uni.navigateBack()
}

// 进入页面即唤起系统相册（用户取消则展示空态，可点「＋ 从相册添加」再次唤起）
onReady(function() {
  setTimeout(pickFromAlbum, 200)
})
</script>

<style scoped>
.page { background: #f5f6fa; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 24rpx; padding-top: calc(env(safe-area-inset-top) + 20rpx); background: #fff; }
.close { width: 80rpx; height: 60rpx; display: flex; align-items: center; }
.close-t { font-size: 40rpx; color: #333; }
.title { display: flex; align-items: center; gap: 12rpx; }
.title-t { font-size: 34rpx; font-weight: 700; color: #333; }
.arrow { font-size: 20rpx; color: #999; }
.header-right { width: 80rpx; display: flex; align-items: center; justify-content: flex-end; }
.header-add { font-size: 40rpx; color: #d98983; line-height: 1; }
.grid-scroll { flex: 1; padding: 12rpx; box-sizing: border-box; }
.grid { display: flex; flex-wrap: wrap; }
.grid-item { width: 25%; padding: 4rpx; box-sizing: border-box; position: relative; }
.thumb-img { width: 100%; height: 180rpx; border-radius: 10rpx; display: block; background: #eef0f4; }
.marker { position: absolute; top: 14rpx; right: 14rpx; width: 40rpx; height: 40rpx; border-radius: 50%; background: rgba(0,0,0,0.25); border: 2rpx solid #fff; display: flex; align-items: center; justify-content: center; }
.marker.on { background: #d98983; }
.marker-t { font-size: 22rpx; color: #fff; font-weight: 600; }
.empty { padding: 180rpx 0; display: flex; flex-direction: column; align-items: center; }
.empty-icon { font-size: 96rpx; line-height: 1; }
.empty-text { font-size: 28rpx; color: #999; margin-top: 24rpx; }
.empty-btn { margin-top: 40rpx; padding: 20rpx 46rpx; background: #d9a29e; border-radius: 40rpx; }
.empty-btn-t { font-size: 28rpx; color: #fff; font-weight: 600; }
.bottom-bar { display: flex; align-items: center; justify-content: space-between; padding: 16rpx 20rpx; padding-bottom: calc(16rpx + env(safe-area-inset-bottom)); background: #fff; border-top: 1rpx solid #eee; }
.left { flex: 1; min-width: 0; display: flex; align-items: center; }
.quick { display: flex; gap: 12rpx; margin-right: 12rpx; }
.quick-icon { width: 60rpx; height: 60rpx; background: #f5f6fa; border-radius: 12rpx; display: flex; align-items: center; justify-content: center; }
.quick-t { font-size: 30rpx; color: #555; }
.selected-scroll { flex: 1; min-width: 0; }
.thumbs { display: flex; gap: 8rpx; padding: 4rpx 0; }
.sel-thumb { width: 56rpx; height: 56rpx; border-radius: 8rpx; flex-shrink: 0; border: 2rpx solid #d98983; overflow: hidden; }
.sel-thumb-img { width: 100%; height: 100%; display: block; }
.next-btn { margin-left: 16rpx; padding: 20rpx 34rpx; background: #d9a29e; border-radius: 40rpx; flex-shrink: 0; }
.next-t { font-size: 28rpx; color: #fff; font-weight: 600; }
.preview-mask { position: fixed; left: 0; top: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.preview-body { width: 86%; background: #fff; border-radius: 20rpx; padding: 24rpx; }
.preview-swiper { width: 100%; height: 560rpx; border-radius: 12rpx; overflow: hidden; background: #f5f6fa; }
.big-img { width: 100%; height: 100%; display: block; }
.preview-thumbs { display: flex; gap: 16rpx; margin-top: 20rpx; align-items: center; }
.p-thumb { width: 120rpx; height: 120rpx; border-radius: 12rpx; flex-shrink: 0; border: 4rpx solid transparent; overflow: hidden; box-sizing: border-box; }
.p-thumb-img { width: 100%; height: 100%; display: block; }
.p-thumb.active { border-color: #d98983; }
.p-thumb.plus { border: 2rpx dashed #ccc; display: flex; align-items: center; justify-content: center; }
.p-plus-t { font-size: 40rpx; color: #999; }
.preview-actions { display: flex; gap: 20rpx; margin-top: 24rpx; }
.select-btn { flex: 1; height: 80rpx; border-radius: 40rpx; border: 2rpx solid #d9a29e; display: flex; align-items: center; justify-content: center; }
.select-btn.on { background: #d98983; border-color: #d98983; }
.select-t { font-size: 28rpx; color: #d98983; }
.select-btn.on .select-t { color: #fff; }
.confirm-btn { flex: 1; height: 80rpx; border-radius: 40rpx; background: #d9a29e; display: flex; align-items: center; justify-content: center; }
.confirm-t { font-size: 28rpx; color: #fff; font-weight: 600; }
</style>
