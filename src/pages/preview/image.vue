<template>
  <!-- 选择图片后的展示页（按 Figma node-id=317-22 设计稿） -->
  <view class="page" :style="{ '--sbh': statusBarHeight + 'px' }">
    <!-- 顶部：返回 / 计数胶囊 / 更多 -->
    <view class="nav">
      <view class="nav-btn nav-left" @click="goBack">
        <text class="nav-ic">←</text>
      </view>
      <view class="counter-pill">
        <text class="cp-t">{{ total ? current + 1 : 0 }} / {{ total }}</text>
      </view>
      <view class="nav-btn nav-right" @click="onMore">
        <text class="nav-ic more-ic">⋯</text>
      </view>
    </view>

    <!-- 图片舞台：长图铺满（cover）/ 短图上下留 #282828 灰框（contain） -->
    <view id="stage" class="stage">
      <view v-if="!total" class="stage-empty">
        <text class="se-t">暂无图片，请返回重新选择</text>
      </view>
      <swiper v-else class="stage-swiper" :current="current" @change="onSwiperChange">
        <swiper-item v-for="(img, i) in images" :key="img.id || i">
          <view class="slide">
            <image
              v-if="img.src"
              class="slide-img"
              :src="img.src"
              :mode="fitModes[i] || 'aspectFill'"
              @load="onImgLoad(i, $event)"
            ></image>
            <view v-else class="slide-ph" :style="placeholderStyle(img)">
              <text class="ph-t">{{ img.label || ('图片' + (i + 1)) }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 底部信息行：头像 + 多图缩略条 + 文案 -->
    <view class="info">
      <view class="info-avatar avatar-ring-white">
        <text class="ia-t">{{ avatarLetter }}</text>
      </view>
      <view v-if="total > 0" class="info-thumbs">
        <view
          v-for="(img, i) in images"
          :key="'th' + (img.id || i)"
          class="thumb"
          :class="{ 'thumb-on': i === current }"
          @click="current = i"
        >
          <image v-if="img.src" class="thumb-img" :src="img.src" mode="aspectFill"></image>
          <!-- 右上角小灰圆叉：移除这张图（Figma node-id=317-22 更新版） -->
          <view v-if="i === current" class="thumb-del" @click.stop="removeImage(i)"></view>
        </view>
      </view>
      <view class="info-main">
        <text class="info-name">{{ nickname }}</text>
        <text class="info-sub">{{ total }} 张图片 · 左右滑动查看</text>
      </view>
    </view>

    <!-- 底部主按钮 -->
    <view class="cta-bar">
      <view class="cta-btn" @click="goNext">
        <text class="cta-t">下一步</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { selectedImages, setSelectedImages } from '@/utils/createStore.js'
import { getUserInfo } from '@/utils/auth.js'

const images = ref(selectedImages.slice())
const current = ref(0)
const total = computed(() => images.value.length)

/** 状态栏高度：自定义导航栏需要自己让位（H5 下为 0） */
const statusBarHeight = ref(0)
try {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 25
} catch (e) {
  statusBarHeight.value = 25
}

/** 每张图的 natural 宽高比（w/h），拿不到时按 1 处理 */
const aspects = ref({})
/** 舞台容器的宽高比（W/H），随窗口/设备变化 */
const stageAspect = ref(402 / 594)
/** 每张图最终用的 uni image mode */
const fitModes = ref({})

const me = getUserInfo() || {}
const nickname = computed(() => me.nickname || me.name || me.username || '我')
const avatarLetter = computed(() => String(nickname.value).slice(0, 1))

/**
 * 长图（相对更高）→ aspectFill 铺满舞台，与设计稿左帧一致；
 * 短图（相对更宽）→ aspectFit 按宽度适配，上下露出 #282828 底色，与设计稿右帧一致。
 */
function decideMode(i) {
  const ar = aspects.value[i]
  if (!ar) {
    fitModes.value[i] = 'aspectFill'
    return
  }
  fitModes.value[i] = ar >= stageAspect.value ? 'aspectFit' : 'aspectFill'
}

function decideAll() {
  images.value.forEach(function(_, i) { decideMode(i) })
}

function loadAspect(i, src) {
  if (!src) return
  uni.getImageInfo({
    src: src,
    success(res) {
      if (res && res.width && res.height) {
        aspects.value[i] = res.width / res.height
        decideMode(i)
      }
    },
    fail() {
      decideMode(i)
    }
  })
}

/** H5 下 image 的 load 事件带 detail.height/width，可兜底 getImageInfo 失败的情况 */
function onImgLoad(i, e) {
  const d = (e && e.detail) || {}
  if (!aspects.value[i] && d.width && d.height) {
    aspects.value[i] = d.width / d.height
    decideMode(i)
  }
}

function measureStage() {
  uni
    .createSelectorQuery()
    .select('#stage')
    .boundingClientRect(function(rect) {
      if (rect && rect.width && rect.height) {
        stageAspect.value = rect.width / rect.height
        decideAll()
      }
    })
    .exec()
}

function onSwiperChange(e) {
  current.value = e.detail.current
}

function placeholderStyle(img) {
  const g = img && img.gradient
  return { background: g ? 'linear-gradient(135deg,' + g + ')' : '#3a3a3a' }
}

function onMore() {
  if (!total.value) return
  uni.showActionSheet({
    itemList: ['保存这张图片'],
    success(res) {
      if (res.tapIndex !== 0) return
      const cur = images.value[current.value]
      if (!cur || !cur.src) return
      uni.saveImageToPhotosAlbum({
        filePath: cur.src,
        success() { uni.showToast({ title: '已保存', icon: 'none' }) },
        fail() { uni.showToast({ title: '保存失败', icon: 'none' }) }
      })
    }
  })
}

/** 缩略图右上角小灰叉：移除这张图，并同步全局选图列表（发布页依赖它） */
function removeImage(i) {
  if (i < 0 || i >= images.value.length) return
  const oldAspects = aspects.value
  images.value.splice(i, 1)
  // 宽高比缓存按索引存：删除点之后的索引整体前移一位
  const nextAspects = {}
  images.value.forEach(function(_, k) {
    const from = k >= i ? k + 1 : k
    if (oldAspects[from] != null) nextAspects[k] = oldAspects[from]
  })
  aspects.value = nextAspects
  fitModes.value = {}
  decideAll()
  setSelectedImages(images.value.slice())
  if (current.value >= images.value.length) {
    current.value = Math.max(0, images.value.length - 1)
  }
  if (!images.value.length) {
    uni.showToast({ title: '已移除全部图片', icon: 'none' })
  }
}

function goBack() {
  uni.navigateBack()
}

function goNext() {
  if (!total.value) {
    uni.showToast({ title: '请先选择图片', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/publish/image' })
}

onMounted(function() {
  nextTick(function() {
    measureStage()
    images.value.forEach(function(img, i) {
      loadAspect(i, img.src)
    })
  })
})
</script>

<style scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #282828;
}

/* ---- 顶部导航 ---- */
.nav {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 71rpx;
  /* 顶部让出系统状态栏 + 13rpx：设计稿上导航圆钮顶边 y=54（状态栏 ~47 + 7） */
  padding-top: calc(var(--sbh, 0px) + 13rpx);
  box-sizing: content-box;
}
.nav-btn {
  position: absolute;
  top: calc(var(--sbh, 0px) + 13rpx);
  width: 71rpx;
  height: 71rpx;
  border-radius: 50%;
  background: #343f38;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-left { left: 24rpx; }
.nav-right { right: 23rpx; }
.nav-ic {
  font-size: 32rpx;
  color: #ffffff;
  line-height: 1;
}
.more-ic {
  font-size: 36rpx;
  letter-spacing: -2rpx;
  margin-top: -14rpx;
}
.counter-pill {
  height: 56rpx;
  min-width: 150rpx;
  padding: 0 28rpx;
  border-radius: 28rpx;
  background: #343f38;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.cp-t {
  font-size: 22rpx;
  color: #e4e4e4;
  letter-spacing: 1rpx;
}

/* ---- 图片舞台 ---- */
.stage {
  flex: 1;
  min-height: 0;
  margin: 32rpx 0 33rpx;
  overflow: hidden;
  background: #282828;
}
.stage-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.se-t {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.45);
}
.stage-swiper {
  width: 100%;
  height: 100%;
}
.slide {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.slide-img {
  width: 100%;
  height: 100%;
  display: block;
}
.slide-ph {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ph-t {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
}

/* ---- 底部信息行 ---- */
.info {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 43rpx 0 43rpx;
}
.info-avatar {
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  background: #3e4a43;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ia-t {
  font-size: 36rpx;
  color: #d1fae5;
  line-height: 1;
}
.info-main {
  flex: 1;
  min-width: 0;
  margin-left: 43rpx;
  display: flex;
  flex-direction: column;
}
/* 多图时的缩略条：稿上两枚 46×46 圆角块，块间距 12px */
.info-thumbs {
  display: flex;
  align-items: center;
  margin-left: 43rpx;
  flex-shrink: 0;
}
.thumb {
  position: relative;
  width: 86rpx;
  height: 86rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #8c928f;
  margin-right: 22rpx;
  box-sizing: border-box;
}
.thumb:last-child { margin-right: 0; }
/* 有缩略条时，文案紧贴缩略条（稿上间距约 11px） */
.info-thumbs + .info-main { margin-left: 22rpx; }
.thumb-on { box-shadow: 0 0 0 3rpx #d1fae5; }
/* 右上角小灰圆叉：深灰半透明圆底 + 白色圆头 ×，压在缩略图右上角内侧 */
.thumb-del {
  position: absolute;
  top: 6rpx;
  right: 6rpx;
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  background: rgba(58, 63, 59, 0.86);
  z-index: 2;
}
.thumb-del::before,
.thumb-del::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 15rpx;
  height: 3rpx;
  border-radius: 3rpx;
  background: #ffffff;
  transform: translate(-50%, -50%) rotate(45deg);
}
.thumb-del::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}
.thumb-img {
  width: 100%;
  height: 100%;
  display: block;
}
.info-name {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.35;
}
.info-sub {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.35;
}

/* ---- 底部主按钮 ---- */
.cta-bar {
  flex-shrink: 0;
  padding: 33rpx 50rpx calc(52rpx + env(safe-area-inset-bottom));
}
.cta-btn {
  height: 99rpx;
  border-radius: 50rpx;
  background: linear-gradient(90deg, #38503e 0%, #485e53 50%, #374d3c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.cta-t {
  font-size: 25rpx;
  color: #ffffff;
  font-weight: 500;
  letter-spacing: 10rpx;
  text-indent: -5rpx; /* 抵消 letter-spacing 在末字后多出的半个字距，保持视觉居中 */
}
</style>
