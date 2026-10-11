<template>
  <!--
    发布动态（按 Figma「莲藕加号」稿 node 136-18 重做）
    结构：固定导航栏 + 可滚动正文 + 固定底栏（可见范围 + 发布）
    与旧版的差异：稿里没有标题输入、添加音乐、高级设置弹窗、@提到/预览，
      这里一并去掉；话题、位置、可见范围保留为真实交互。
    尺寸换算：画板 402px ↔ 750rpx（1px ≈ 1.8657rpx），
      下面的数值都是按稿实测后的取整值，注释里保留原稿 px。
  -->
  <view class="page">
    <CustomNavbar showBack>
      <text class="nav-title">发布动态</text>
      <template #right>
        <text class="nav-draft" @click="saveDraft">草稿</text>
      </template>
    </CustomNavbar>

    <scroll-view scroll-y class="body">
      <!-- 正文：浅青底输入区，近乎通栏（稿：左右各 9.5px），右下角字数 0 / 500 -->
      <view class="composer">
        <textarea
          class="composer-input"
          v-model="body"
          :maxlength="MAX_LEN"
          placeholder="提笔叙怀，记一纸光景与此时心境…"
          placeholder-class="composer-ph"
        />
        <text class="composer-count">{{ body.length }} / {{ MAX_LEN }}</text>
      </view>

      <!-- 添加图片：「入画」虚线占位在前，已选缩略图依次在后（与稿一致） -->
      <view class="label">添加图片</view>
      <view class="image-row">
        <view v-if="images.length < MAX_IMAGES" class="up-tile" @click="addImage">
          <view class="plus">
            <view class="plus-h"></view>
            <view class="plus-v"></view>
          </view>
          <text class="up-tile-text">入画</text>
        </view>

        <view v-for="(img, index) in images" :key="img.path + index" class="thumb">
          <image class="thumb-img" :src="img.path" mode="aspectFill" />
          <!-- 角标是缩略图里唯一的删除入口：z-index 必须高于文件名，否则会被文字盖住点不动 -->
          <view class="thumb-badge" @click.stop="removeImage(index)">
            <text class="thumb-badge-t">✕</text>
          </view>
          <text class="thumb-name">{{ img.name }}</text>
        </view>
      </view>

      <!-- 话题 / 位置：左标签 + 右侧当前值 + 细箭头 -->
      <view class="divider"></view>
      <view class="rows">
        <view class="row" @click="pickTopic">
          <view class="row-left">
            <text class="row-hash">#</text>
            <text class="row-label">话题</text>
          </view>
          <view class="row-right">
            <text class="row-value" :class="{ empty: !topic }">{{ topic || '选择话题' }}</text>
            <view class="chev"></view>
          </view>
        </view>

        <view class="row" @click="pickLocation">
          <view class="row-left">
            <!-- 细线图标走内联 SVG，省掉为两个小图标新增图片资源 -->
            <image class="row-icon" :src="ICON_PIN" mode="aspectFit" />
            <text class="row-label">位置</text>
          </view>
          <view class="row-right">
            <text class="row-value" :class="{ empty: !location }">{{ location || '选择位置' }}</text>
            <view class="chev"></view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 固定底栏：可见范围（右对齐）+ 发布按钮（340×50px 胶囊） -->
    <view class="bottom">
      <view class="visibility" @click="pickVisibility">
        <image class="visibility-icon" :src="ICON_PEOPLE" mode="aspectFit" />
        <text class="visibility-text">{{ visibilityLabel }}</text>
        <view class="chev down"></view>
      </view>
      <view class="publish-btn" @click="publish">发布</view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import CustomNavbar from '@/components/common/CustomNavbar.vue'
import { uploadWorkFile, createWork } from '@/api/works.js'

const MAX_LEN = 500
const MAX_IMAGES = 9

/** 位置页选完后回传用的 storage key（两个页面共用同一个常量，避免字符串拼错） */
const PICKED_LOCATION_KEY = 'picked_location'

/** 细线图标：与稿里的线性图标同风格，1.5px 描边、圆头收笔 */
const ICON_PIN = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
  'stroke="#786F6C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M12 21.4c4-4.9 6-8.1 6-10.2A6 6 0 1 0 6 11.2c0 2.1 2 5.3 6 10.2z"/>' +
  '<circle cx="12" cy="11" r="2.2"/></svg>'
)
const ICON_PEOPLE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
  'stroke="#786F6C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
  '<circle cx="9.2" cy="8" r="3.3"/>' +
  '<path d="M3.4 19.6c0-3.1 2.6-5.2 5.8-5.2s5.8 2.1 5.8 5.2"/>' +
  '<path d="M16.2 5.4a3 3 0 0 1 0 5.4"/>' +
  '<path d="M17.6 14.9c1.9.5 3.2 2.1 3.2 4.7"/></svg>'
)

const body = ref('')
/** 已选图片：[{ path, name }]，path 是本地临时路径（上传前） */
const images = ref([])
const topic = ref('')
const location = ref('')

/**
 * 可见范围：label 沿用设计稿的「同袍」说法，key 对齐
 * docs/backend/API-2026-09-27.md §3.1 的 visibility_type 六种取值。
 * ⚠️ 默认仍是 public（与原页面一致）；「同袍可见 → public」这层对应关系待与后端/设计确认。
 */
const VISIBILITY_OPTS = [
  { key: 'public', label: '同袍可见' },
  { key: 'followers', label: '粉丝可见' },
  { key: 'mutual', label: '仅互关可见' },
  { key: 'private', label: '仅自己可见' }
]
const visibility = ref('public')
const visibilityLabel = computed(() => {
  const found = VISIBILITY_OPTS.find(o => o.key === visibility.value)
  return found ? found.label : VISIBILITY_OPTS[0].label
})

// 位置页是 navigateBack 回来（不触发事件），只能靠 onShow 从 storage 取值。
// 存的是 { name } 对象：「不显示位置」写空串，也能和「没选过」区分开
onShow(() => {
  const picked = uni.getStorageSync(PICKED_LOCATION_KEY)
  if (picked && typeof picked === 'object') {
    location.value = picked.name || ''
    uni.removeStorageSync(PICKED_LOCATION_KEY)
  }
})

/** 文件名：优先用 chooseImage 的 name，取不到就取路径末段，再取不到按序号兜底 */
function fileNameOf(file, path, seq) {
  const raw = (file && (file.name || file.fileName)) || String(path).split(/[\\/]/).pop() || ''
  const name = raw.split('?')[0]
  if (!name) return `图片${seq}`
  // 超长名截断，免得在小方图里糊成一片（稿里是「山岚叠翠.jpg」这类短名）
  return name.length > 16 ? name.slice(0, 6) + '…' + name.slice(-8) : name
}

function addImage() {
  const rest = MAX_IMAGES - images.value.length
  if (rest <= 0) {
    uni.showToast({ title: `最多 ${MAX_IMAGES} 张`, icon: 'none' })
    return
  }
  uni.chooseImage({
    count: rest,
    success: (res) => {
      const paths = res.tempFilePaths || []
      paths.forEach((path, i) => {
        const file = (res.tempFiles || [])[i]
        images.value.push({ path, name: fileNameOf(file, path, images.value.length + i + 1) })
      })
    }
  })
}

function removeImage(index) {
  images.value.splice(index, 1)
}

/** 话题：后端作品模型暂无话题字段（API-2026-09-27 §3.1），先只做本地填写 */
function pickTopic() {
  uni.showModal({
    title: '添加话题',
    editable: true,
    placeholderText: '例如：临江仙·茶叙',
    success: (res) => {
      if (res.confirm) topic.value = (res.content || '').trim()
    }
  })
}

function pickLocation() {
  uni.navigateTo({ url: '/pages/location/index' })
}

function pickVisibility() {
  uni.showActionSheet({
    itemList: VISIBILITY_OPTS.map(o => o.label),
    success: (res) => {
      const opt = VISIBILITY_OPTS[res.tapIndex]
      if (opt) visibility.value = opt.key
    }
  })
}

/**
 * 存草稿 / 发动态共用一套提交逻辑，只有 status 不同（后端 §3.1：status = draft | published）
 * @param {'draft'|'published'} status
 */
async function submit(status) {
  const text = body.value.trim()
  if (!text && !images.value.length) {
    uni.showToast({
      title: status === 'draft' ? '写点什么再保存吧' : '写点什么再发布吧',
      icon: 'none'
    })
    return
  }

  uni.showLoading({ title: status === 'draft' ? '保存中...' : '发布中...', mask: true })
  try {
    // ① 图片逐张上传（后端是单文件接口，字段名 file）→ 拿到相对 URL
    const files = []
    for (const img of images.value) {
      const up = await uploadWorkFile(img.path)
      if (up && up.url) files.push(up.url)
    }

    // ② 3.1 创建作品：有图 → visual + flip；纯文字 → text_only（title 由 text_content 派生）
    // TODO(契约待后端确认)：话题(#)、@好友、定时发布等，09-15 文档的作品模型里没有对应字段，
    //   先不传，避免发出去与 UI 不一致的假设置。
    const pureText = files.length === 0
    await createWork({
      content_type: pureText ? 'text_only' : 'original',
      channel: pureText ? 'writing' : 'visual',
      image_layout: 'flip',
      title: text.slice(0, 50) || '未命名动态',
      text_content: text,
      files,
      cover_url: files[0] || '',
      visibility_type: visibility.value,
      location: location.value || undefined,
      status
    })

    uni.hideLoading()
    uni.showToast({ title: status === 'draft' ? '已存草稿' : '发布成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 800)
  } catch (err) {
    uni.hideLoading()
    // 失败原因由 upload / request 层按错误码提示（3004 渠道、3005 文件超限、3007 可见性…）
  }
}

function saveDraft() {
  submit('draft')
}

function publish() {
  submit('published')
}
</script>

<style scoped>
/* 页面 = 固定导航栏 + 滚动正文 + 固定底栏（正文不够长时中间留白，与稿一致） */
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #ffffff;
}

/* ── 导航栏 ── */
.nav-title {
  font-size: 34rpx; /* 稿：18px */
  font-weight: 600;
  color: #2a2625;
}

.nav-draft {
  font-size: 22rpx; /* 稿：12px */
  color: #575350;
  /* 稿里「草稿」右边缘距屏 35.5px；导航栏自带 15px 内边距，这里补 20px */
  margin-right: 38rpx;
  padding: 12rpx 0;
}

.body {
  flex: 1;
  overflow: hidden;
}

/* ── 正文输入区 ── */
.composer {
  position: relative;
  margin: 8rpx 18rpx 0; /* 稿：左右各 9.5px，紧贴导航栏 */
  height: 344rpx; /* 稿：184.5px */
  padding: 40rpx 35rpx 0;
  background: #e9efec;
  border-radius: 36rpx; /* 稿：20px */
  box-sizing: border-box;
}

.composer-input {
  width: 100%;
  height: 220rpx;
  font-size: 28rpx; /* 稿：15px */
  line-height: 1.6;
  color: #2a2625;
  background: transparent;
}

.composer-ph {
  font-size: 28rpx;
  color: #afa6a2;
}

.composer-count {
  position: absolute;
  right: 34rpx; /* 稿：距输入框右边缘 18px */
  bottom: 36rpx;
  font-size: 22rpx;
  color: #a8a29e;
  letter-spacing: 2rpx;
}

/* ── 添加图片 ── */
.label {
  margin: 54rpx 52rpx 0; /* 稿：与输入框间距 29px，左右内缩 28px */
  font-size: 22rpx;
  color: #786f6c;
}

.image-row {
  display: flex;
  flex-wrap: wrap;
  gap: 22rpx; /* 稿：两个方图间距 12px */
  margin: 22rpx 52rpx 0;
}

.up-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150rpx; /* 稿：80px */
  height: 150rpx;
  border: 2rpx dashed #dbd8d6;
  border-radius: 36rpx;
  box-sizing: border-box;
}

/* 「＋」用两条细线拼，比文字「+」更接近稿里的线性图标 */
.plus {
  position: relative;
  width: 36rpx; /* 稿：18.5px */
  height: 36rpx;
}

.plus-h,
.plus-v {
  position: absolute;
  background: #a8a29e;
}

.plus-h {
  left: 0;
  top: 17rpx;
  width: 36rpx;
  height: 2rpx;
}

.plus-v {
  left: 17rpx;
  top: 0;
  width: 2rpx;
  height: 36rpx;
}

.up-tile-text {
  margin-top: 14rpx;
  font-size: 20rpx; /* 稿：11px */
  color: #a8a29e;
}

.thumb {
  position: relative;
  width: 150rpx;
  height: 150rpx;
  border-radius: 36rpx;
  overflow: hidden;
  background: #2b2b2b;
}

.thumb-img {
  width: 100%;
  height: 100%;
}

.thumb-badge {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52rpx; /* 稿：直径约 28px */
  height: 52rpx;
  border-radius: 50%;
  background: rgba(24, 23, 21, 0.92);
}

.thumb-badge-t {
  font-size: 24rpx;
  line-height: 1;
  color: #ffffff;
}

.thumb-name {
  position: absolute;
  left: 14rpx;
  right: 14rpx;
  bottom: 8rpx;
  font-size: 20rpx; /* 稿：11px */
  line-height: 1.2;
  color: #ffffff;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ── 话题 / 位置 ── */
.divider {
  height: 2rpx;
  margin: 41rpx 52rpx 0; /* 稿：与图片行间距 22px */
  background: #f3f2f2;
}

.rows {
  margin: 0 52rpx;
  padding-top: 26rpx; /* 稿：分隔线到「话题」行中心 31px */
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 63rpx; /* 稿：两行间距 34px */
}

.row-left,
.row-right {
  display: flex;
  align-items: center;
}

.row-hash {
  margin-right: 13rpx;
  font-size: 22rpx;
  color: #786f6c;
}

.row-icon {
  width: 26rpx;
  height: 26rpx;
  margin-right: 13rpx;
}

.row-label {
  font-size: 22rpx; /* 稿：12px */
  color: #786f6c;
}

.row-value {
  font-size: 22rpx;
  color: #575350;
}

.row-value.empty {
  color: #a8a29e;
}

/* 细箭头：正方形只留上/右边框再旋转 45° */
.chev {
  width: 12rpx;
  height: 12rpx;
  margin-left: 16rpx;
  border-top: 2rpx solid #a8a29e;
  border-right: 2rpx solid #a8a29e;
  transform: rotate(45deg);
}

.chev.down {
  margin-top: -6rpx;
  margin-left: 12rpx;
  transform: rotate(135deg);
}

/* ── 固定底栏 ── */
.bottom {
  padding: 0 58rpx calc(24rpx + env(safe-area-inset-bottom)); /* 稿：按钮左右各 31px */
  background: #ffffff;
}

.visibility {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  /* 稿里可见范围右边缘比按钮再内缩约 18.5px */
  padding: 0 34rpx 23rpx 0;
}

.visibility-icon {
  width: 26rpx;
  height: 26rpx;
  margin-right: 12rpx;
}

.visibility-text {
  font-size: 22rpx;
  color: #786f6c;
}

.publish-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 94rpx; /* 稿：50px */
  border-radius: 94rpx;
  background: #495f54;
  color: #ffffff;
  font-size: 34rpx; /* 稿：18px */
  letter-spacing: 2rpx;
}

.publish-btn:active {
  background: #3f534a;
}
</style>
