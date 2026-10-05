<template>
  <!-- 图片发布编辑页（分支B·页面3） -->
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack"><text class="back-t">←</text></view>
      <text class="title">图片发布</text>
      <view class="header-right"></view>
    </view>

    <scroll-view scroll-y class="body-scroll">
      <!-- 大图预览 + 缩略图滑块 -->
      <view class="preview-section">
        <swiper class="big-swiper" :current="current" @change="onSwiperChange">
          <swiper-item v-for="(img, i) in images" :key="i">
            <image v-if="img.src" class="big-img" :src="img.src" mode="aspectFit"></image>
            <view v-else class="big" :style="{ background: img.gradient ? 'linear-gradient(135deg,' + img.gradient + ')' : '#eef0f4' }">
              <text class="big-label">{{ img.label || ('图片' + (i + 1)) }}</text>
            </view>
          </swiper-item>
        </swiper>
        <scroll-view scroll-x class="thumbs-scroll">
          <view class="thumbs">
            <view
              v-for="(img, i) in images"
              :key="i"
              class="thumb"
              :class="{ on: i === current }"
              :style="img.src ? '' : { background: img.gradient ? 'linear-gradient(135deg,' + img.gradient + ')' : '#eef0f4' }"
              @click="current = i"
            >
              <image v-if="img.src" class="thumb-img" :src="img.src" mode="aspectFill"></image>
              <text v-else class="thumb-t">{{ img.label || (i + 1) }}</text>
            </view>
            <view class="thumb add" @click="addImages"><text class="add-t">＋</text></view>
          </view>
        </scroll-view>
      </view>

      <!-- 标题输入 -->
      <view class="title-section">
        <textarea class="title-input" v-model="title" placeholder="君执笔绘万象，不妨细说一番" maxlength="100" />
        <text class="title-count">{{ title.length }}/100</text>
      </view>

      <!-- 标签行 -->
      <view class="tag-row">
        <view class="tag-input-wrap">
          <text class="hash">#</text>
          <input class="tag-input" v-model="topicInput" placeholder="话题" confirm-type="done" @confirm="addTopic" />
        </view>
        <view class="tag-btn" @click="addCoop"><text class="tag-btn-t">＋ 添加合作人</text></view>
        <view class="tag-btn" @click="atFriend"><text class="tag-btn-t">@朋友</text></view>
        <view class="tag-btn" @click="chooseLocation"><text class="tag-btn-t">📍 {{ location || '定位' }}</text></view>
      </view>

      <!-- 已生成话题 -->
      <view v-if="topics.length" class="topic-list">
        <view v-for="(t, i) in topics" :key="i" class="topic-item">
          <text class="topic-t">#{{ t }}</text>
          <text class="topic-del" @click="removeTopic(i)">✕</text>
        </view>
      </view>

      <!-- 合作人 / @ 展示 -->
      <view v-if="collaborators.length || atFriends.length" class="people-row">
        <view v-for="(p, i) in collaborators" :key="'c' + i" class="person-chip"><text class="person-t">🤝{{ p }}</text></view>
        <view v-for="(p, i) in atFriends" :key="'a' + i" class="person-chip at"><text class="person-t">@{{ p }}</text></view>
      </view>

      <!-- 设置项 -->
      <view class="options">
        <view class="option-row" @click="showPrivacy = true">
          <text class="option-icon">🔒</text>
          <text class="option-label">隐私设置</text>
          <text class="option-value">{{ privacyLabel }}</text>
          <text class="option-arrow">›</text>
        </view>
        <view class="option-row">
          <text class="option-icon">🔥</text>
          <text class="option-label">上热门</text>
          <view class="switch" :class="{ on: promoteOn }" @click="promoteOn = !promoteOn"><view class="knob"></view></view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部双按钮 -->
    <view class="bottom">
      <view class="btn draft" @click="saveDraft"><text class="btn-t">存草稿</text></view>
      <view class="btn publish" @click="publish"><text class="btn-t">发布</text></view>
    </view>

    <!-- 隐私弹窗 -->
    <view v-if="showPrivacy" class="mask" @click="showPrivacy = false">
      <view class="sheet" @click.stop>
        <view class="sheet-title">隐私设置</view>
        <view v-for="opt in privacyOptions" :key="opt.key" class="sheet-item" :class="{ on: privacy === opt.key }" @click="privacy = opt.key">
          <text class="sheet-item-t">{{ opt.label }}</text>
          <text class="sheet-check">{{ privacy === opt.key ? '✓' : '' }}</text>
        </view>
        <view class="sheet-done" @click="showPrivacy = false"><text class="sheet-done-t">完成</text></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue"
import { selectedImages, setSelectedImages, clearSelectedImages } from "@/utils/createStore.js"
import { uploadWorkFile, createWork } from "@/api/works.js"

const images = ref(selectedImages.slice())
const current = ref(0)
const title = ref("")
const topicInput = ref("")
const topics = ref([])
const collaborators = ref([])
const atFriends = ref([])
const location = ref("")
const privacy = ref("public")
const promoteOn = ref(false)
const showPrivacy = ref(false)
const privacyOptions = [
  { key: "public", label: "公开" },
  { key: "friends", label: "仅好友可见" },
  { key: "private", label: "私密" }
]

const privacyLabel = computed(function() {
  const o = privacyOptions.find(function(x) { return x.key === privacy.value })
  return o ? o.label : "公开"
})

function onSwiperChange(e) {
  current.value = e.detail.current
}

function addImages() {
  // 继续新增图片（真实相册）
  uni.chooseImage({
    count: 9 - images.value.length,
    sizeType: ["compressed"],
    success(res) {
      const add = (res.tempFilePaths || []).map(function(p, i) {
        return { id: Date.now() + i, src: p, gradient: "", label: "图片" }
      })
      images.value.push.apply(images.value, add)
      current.value = images.value.length - 1
    }
  })
}

function addTopic() {
  const t = topicInput.value.trim()
  if (!t) return
  topics.value.push(t)
  topicInput.value = ""
}
function removeTopic(i) {
  topics.value.splice(i, 1)
}

function addCoop() {
  uni.showActionSheet({
    itemList: ["张编剧", "李剪辑", "王插画"],
    success(res) {
      const name = ["张编剧", "李剪辑", "王插画"][res.tapIndex]
      if (collaborators.value.indexOf(name) === -1) collaborators.value.push(name)
    }
  })
}
function atFriend() {
  uni.showActionSheet({
    itemList: ["罗大侠", "冯大侠", "创意设计师"],
    success(res) {
      const name = ["罗大侠", "冯大侠", "创意设计师"][res.tapIndex]
      if (atFriends.value.indexOf(name) === -1) atFriends.value.push(name)
    }
  })
}
function chooseLocation() {
  uni.showActionSheet({
    itemList: ["北京", "上海", "广州", "不显示位置"],
    success(res) {
      const v = ["北京", "上海", "广州", ""][res.tapIndex]
      location.value = v
    }
  })
}

function saveDraft() {
  const draft = {
    images: images.value,
    title: title.value,
    topics: topics.value,
    collaborators: collaborators.value,
    atFriends: atFriends.value,
    location: location.value,
    privacy: privacy.value,
    promoteOn: promoteOn.value
  }
  uni.setStorageSync("image_publish_draft", draft)
  uni.showToast({ title: "已存草稿", icon: "success" })
}

/** 页面隐私选项 → 后端 visibility_type（六选一） */
function mapPrivacy(p) {
  if (p === "friends") return "followers" // followers：作者 + 关注了作者的人可见
  if (p === "private") return "private"
  return "public"
}

async function publish() {
  if (!title.value.trim()) {
    uni.showToast({ title: "请填写标题", icon: "none" })
    return
  }
  if (!images.value.length) {
    uni.showToast({ title: "请至少选择一张图片", icon: "none" })
    return
  }

  uni.showLoading({ title: "发布中...", mask: true })
  try {
    // ① 逐张上传：后端上传接口是**单文件**（字段名 file），多图由前端循环
    const urls = []
    for (let i = 0; i < images.value.length; i++) {
      const up = await uploadWorkFile(images.value[i].src)
      if (up && up.url) urls.push(up.url)
    }
    if (!urls.length) throw new Error("图片上传失败")

    // ② 3.1 创建作品（status=published 直接发布；图文 → channel=visual + image_layout=flip）
    // TODO(契约待后端确认)：话题(#)、@好友、共创成员 后端作品模型没有对应字段；
    //   共创成员需传 collaborators（**用户 ID 数组**），当前页面只有昵称，待取到 ID 后再传。
    //   promoteOn（推广）后端无接口，先忽略。
    await createWork({
      content_type: "original",
      channel: "visual",
      image_layout: "flip",
      title: title.value.trim(),
      files: urls,
      cover_url: urls[0],
      visibility_type: mapPrivacy(privacy.value),
      location: location.value || undefined,
      status: "published"
    })

    clearSelectedImages()
    uni.hideLoading()
    uni.showToast({ title: "发布成功", icon: "success" })
    setTimeout(function() {
      uni.reLaunch({ url: "/pages/square/index" })
    }, 600)
  } catch (err) {
    uni.hideLoading()
    // 失败原因由 upload / request 层按错误码提示（400 参数、3004 渠道、3005 文件超限、3007 可见性…）
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.page { background: #f5f6fa; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 24rpx; padding-top: calc(env(safe-area-inset-top) + 20rpx); background: #fff; }
.back { width: 80rpx; height: 60rpx; display: flex; align-items: center; }
.back-t { font-size: 40rpx; color: #333; }
.title { font-size: 32rpx; font-weight: 700; color: #333; }
.header-right { width: 80rpx; }
.body-scroll { flex: 1; padding: 20rpx; box-sizing: border-box; padding-bottom: 160rpx; }
.preview-section { background: #fff; border-radius: 20rpx; padding: 16rpx; }
.big-swiper { width: 100%; height: 420rpx; border-radius: 12rpx; overflow: hidden; }
.big { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.big-label { font-size: 40rpx; color: #fff; font-weight: 600; }
.big-img { width: 100%; height: 100%; display: block; background: #eef0f4; }
.thumbs-scroll { margin-top: 14rpx; }
.thumbs { display: flex; gap: 10rpx; }
.thumb { width: 110rpx; height: 110rpx; border-radius: 10rpx; flex-shrink: 0; border: 3rpx solid transparent; display: flex; align-items: center; justify-content: center; box-sizing: border-box; overflow: hidden; }
.thumb.on { border-color: #d98983; }
.thumb-t { font-size: 20rpx; color: #fff; }
.thumb-img { width: 100%; height: 100%; border-radius: 8rpx; display: block; }
.thumb.add { border: 2rpx dashed #ccc; background: #fafafa; }
.add-t { font-size: 44rpx; color: #999; }
.title-section { background: #fff; border-radius: 20rpx; padding: 20rpx; margin-top: 20rpx; position: relative; }
.title-input { width: 100%; min-height: 80rpx; font-size: 30rpx; color: #333; }
.title-count { position: absolute; right: 20rpx; bottom: 16rpx; font-size: 22rpx; color: #bbb; }
.tag-row { display: flex; flex-wrap: wrap; gap: 14rpx; margin-top: 20rpx; }
.tag-input-wrap { display: flex; align-items: center; background: #fff; border-radius: 30rpx; padding: 12rpx 24rpx; }
.hash { font-size: 28rpx; color: #d98983; }
.tag-input { font-size: 26rpx; color: #333; width: 140rpx; }
.tag-btn { background: #fff; border-radius: 30rpx; padding: 12rpx 24rpx; display: flex; align-items: center; }
.tag-btn-t { font-size: 26rpx; color: #d98983; }
.topic-list { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 16rpx; }
.topic-item { background: #fdece8; border-radius: 24rpx; padding: 8rpx 20rpx; display: flex; align-items: center; gap: 8rpx; }
.topic-t { font-size: 24rpx; color: #d98983; }
.topic-del { font-size: 22rpx; color: #d98983; }
.people-row { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 16rpx; }
.person-chip { background: #fff; border-radius: 24rpx; padding: 8rpx 20rpx; }
.person-chip.at { background: #f0f7ff; }
.person-t { font-size: 24rpx; color: #666; }
.options { background: #fff; border-radius: 20rpx; margin-top: 20rpx; }
.option-row { display: flex; align-items: center; padding: 26rpx 24rpx; border-bottom: 1rpx solid #f5f5f5; }
.option-row:last-child { border-bottom: none; }
.option-icon { font-size: 32rpx; margin-right: 16rpx; }
.option-label { flex: 1; font-size: 28rpx; color: #333; }
.option-value { font-size: 26rpx; color: #999; }
.option-arrow { font-size: 30rpx; color: #ccc; margin-left: 12rpx; }
.switch { width: 84rpx; height: 44rpx; border-radius: 22rpx; background: #ddd; position: relative; transition: 0.2s; }
.switch.on { background: #d98983; }
.knob { width: 36rpx; height: 36rpx; border-radius: 50%; background: #fff; position: absolute; top: 4rpx; left: 4rpx; transition: 0.2s; box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.2); }
.switch.on .knob { left: 44rpx; }
.bottom { position: fixed; left: 0; right: 0; bottom: 0; display: flex; gap: 20rpx; padding: 16rpx 24rpx; padding-bottom: calc(16rpx + env(safe-area-inset-bottom)); background: #fff; border-top: 1rpx solid #eee; }
.btn { flex: 1; height: 88rpx; border-radius: 44rpx; display: flex; align-items: center; justify-content: center; }
.btn.draft { background: #f5f5f5; }
.btn.publish { background: #d9a29e; }
.btn-t { font-size: 30rpx; font-weight: 600; color: #666; }
.btn.publish .btn-t { color: #fff; }
.mask { position: fixed; left: 0; top: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: flex-end; }
.sheet { width: 100%; background: #fff; border-radius: 20rpx 20rpx 0 0; padding: 20rpx 30rpx; padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); }
.sheet-title { text-align: center; font-size: 32rpx; font-weight: 700; color: #333; padding: 20rpx 0; }
.sheet-item { display: flex; justify-content: space-between; align-items: center; padding: 28rpx 0; border-bottom: 1rpx solid #f5f5f5; }
.sheet-item-t { font-size: 28rpx; color: #333; }
.sheet-item.on .sheet-item-t { color: #d98983; font-weight: 600; }
.sheet-check { font-size: 30rpx; color: #d98983; }
.sheet-done { height: 84rpx; margin-top: 20rpx; border-radius: 42rpx; background: #f5f6fa; display: flex; align-items: center; justify-content: center; }
.sheet-done-t { font-size: 28rpx; color: #666; }
</style>
