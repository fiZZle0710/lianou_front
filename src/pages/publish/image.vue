<template>
  <!-- 图片发布页：按 Figma node-id=342-30「选择图片后的发布」重做 -->
  <view class="page" :style="{ '--sbh': statusBarHeight + 'px' }">
    <!-- 顶部：只有返回箭头，稿上无标题 -->
    <view class="nav">
      <view class="nav-back" @click="goBack">
        <image class="nav-back-ic" src="/static/icons/icon-arrow-left.svg" mode="aspectFit"></image>
      </view>
    </view>

    <scroll-view scroll-y class="body-scroll">
      <!-- 大图预览：稿上 122×200（1x），居中 -->
      <view class="preview-wrap">
        <swiper class="big-swiper" :current="current" @change="onSwiperChange">
          <swiper-item v-for="(img, i) in images" :key="'b' + i">
            <image v-if="img.src" class="big-img" :src="img.src" mode="aspectFit"></image>
            <view v-else class="big-ph"></view>
          </swiper-item>
          <swiper-item v-if="!images.length">
            <view class="big-ph"></view>
          </swiper-item>
        </swiper>
      </view>

      <!-- 缩略图行：三枚 + 末尾「＋」 -->
      <view class="thumbs">
        <view
          v-for="(img, i) in images"
          :key="'t' + i"
          class="thumb"
          :class="{ on: i === current }"
          @click="current = i"
        >
          <image v-if="img.src" class="thumb-img" :src="img.src" mode="aspectFill"></image>
          <view v-else class="thumb-ph"></view>
        </view>
        <view class="thumb thumb-add" @click="addImages">
          <text class="thumb-add-t">＋</text>
        </view>
      </view>

      <!-- 标题 -->
      <view class="title-row">
        <input class="title-input" v-model="title" placeholder="添加标题" placeholder-class="ph" maxlength="60" />
      </view>

      <!-- 正文：稿上薄荷卡片，多行无边框 -->
      <view class="desc-card">
        <textarea
          class="desc-input"
          v-model="body"
          placeholder="说说这次创作…"
          placeholder-class="desc-ph"
          maxlength="1000"
          :show-confirm-bar="false"
        />
      </view>

      <!-- 话题胶囊：稿上这一行始终占位（高 27），没有话题时也不塌陷 -->
      <view class="chips">
        <view v-for="(t, i) in topics" :key="'c' + i" class="chip" @click="removeTopic(i)">
          <text class="chip-t">#{{ t }}</text>
        </view>
      </view>

      <!-- 深绿工具栏：四枚胶囊 -->
      <view class="toolbar">
        <view class="tool" @click="focusTopic">
          <text class="tool-t">#话题</text>
        </view>
        <view class="tool" @click="addCoop">
          <text class="tool-t">＋添加合作人</text>
        </view>
        <view class="tool" @click="atFriend">
          <text class="tool-t">@朋友</text>
        </view>
        <view class="tool" @click="chooseLocation">
          <image class="tool-ic" src="/static/icons/icon-pin-white.svg" mode="aspectFit"></image>
          <text class="tool-t">{{ location || '定位' }}</text>
        </view>
      </view>

      <!-- 设置行 1：隐私 -->
      <view class="set-row" @click="showPrivacy = true">
        <view class="set-ic lock">
          <image class="set-ic-img" src="/static/icons/icon-lock-green.svg" mode="aspectFit"></image>
        </view>
        <view class="set-txt">
          <text class="set-title">隐私设置</text>
          <text class="set-sub">控制谁可以看到这篇内容</text>
        </view>
        <text class="set-val">{{ privacyLabel }}</text>
        <image class="set-arrow" src="/static/icons/icon-chevron-right.svg" mode="aspectFit"></image>
      </view>

      <!-- 稿上两行之间有一条 1px 极淡分隔线（y773，x12..392，色 #EFF5F0） -->
      <view class="set-div"></view>

      <!-- 设置行 2：上热门 -->
      <view class="set-row" @click="togglePromote">
        <view class="set-ic flame">
          <image class="set-ic-img" src="/static/icons/icon-flame-orange.svg" mode="aspectFit"></image>
        </view>
        <view class="set-txt">
          <text class="set-title">上热门</text>
          <text class="set-sub">获取更多浏览与共鸣</text>
        </view>
        <text class="set-val">{{ promoteOn ? '已开启' : '开启助力' }}</text>
        <image class="set-arrow" src="/static/icons/icon-chevron-right.svg" mode="aspectFit"></image>
      </view>

      <view class="scroll-pad"></view>
    </scroll-view>

    <!-- 底部固定发布胶囊 -->
    <view class="publish-bar">
      <view class="publish-btn" @click="publish">
        <text class="publish-t">发布</text>
      </view>
    </view>

    <!-- 隐私选择 -->
    <view v-if="showPrivacy" class="mask" @click="showPrivacy = false">
      <view class="sheet" @click.stop>
        <view class="sheet-title">隐私设置</view>
        <view
          v-for="opt in privacyOptions"
          :key="opt.key"
          class="sheet-item"
          :class="{ on: privacy === opt.key }"
          @click="privacy = opt.key"
        >
          <text class="sheet-item-t">{{ opt.label }}</text>
          <text class="sheet-check">{{ privacy === opt.key ? '✓' : '' }}</text>
        </view>
        <view class="sheet-done" @click="showPrivacy = false"><text class="sheet-done-t">完成</text></view>
      </view>
    </view>

    <!-- 话题输入浮层 -->
    <view v-if="showTopic" class="mask" @click="showTopic = false">
      <view class="sheet" @click.stop>
        <view class="sheet-title">添加话题</view>
        <view class="topic-input-wrap">
          <text class="hash">#</text>
          <input
            class="topic-input"
            v-model="topicInput"
            placeholder="输入话题名"
            confirm-type="done"
            focus
            @confirm="addTopic"
          />
        </view>
        <view class="sheet-done" @click="addTopic"><text class="sheet-done-t">添加</text></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue"
import { selectedImages, clearSelectedImages } from "@/utils/createStore.js"
import { uploadWorkFile, createWork } from "@/api/works.js"

const images = ref(selectedImages.slice())
const current = ref(0)
/** 状态栏高度：H5 下由 uni.getSystemInfoSync 取，真机才有值 */
const sysInfo = uni.getSystemInfoSync ? uni.getSystemInfoSync() : {}
const statusBarHeight = ref((sysInfo && sysInfo.statusBarHeight) || 0)
const title = ref("")
const body = ref("")
const topicInput = ref("")
const topics = ref([])
const collaborators = ref([])
const atFriends = ref([])
const location = ref("")
const privacy = ref("public")
const promoteOn = ref(false)
const showPrivacy = ref(false)
const showTopic = ref(false)

const privacyOptions = [
  { key: "public", label: "公开，所有人可见" },
  { key: "friends", label: "仅好友可见" },
  { key: "private", label: "仅自己可见" }
]

const privacyLabel = computed(function() {
  const o = privacyOptions.find(function(x) { return x.key === privacy.value })
  return o ? (o.key === "public" ? "公开" : o.label) : "公开"
})

function onSwiperChange(e) {
  current.value = e.detail.current
}

function addImages() {
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

function focusTopic() {
  showTopic.value = true
}

function addTopic() {
  const t = topicInput.value.trim().replace(/^#/, "")
  if (!t) {
    showTopic.value = false
    return
  }
  if (topics.value.indexOf(t) === -1) topics.value.push(t)
  topicInput.value = ""
  showTopic.value = false
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
      uni.showToast({ title: "已添加 " + name, icon: "none" })
    }
  })
}

function atFriend() {
  uni.showActionSheet({
    itemList: ["罗大侠", "冯大侠", "创意设计师"],
    success(res) {
      const name = ["罗大侠", "冯大侠", "创意设计师"][res.tapIndex]
      if (atFriends.value.indexOf(name) === -1) atFriends.value.push(name)
      uni.showToast({ title: "已 @ " + name, icon: "none" })
    }
  })
}

function chooseLocation() {
  uni.showActionSheet({
    itemList: ["北京", "上海", "广州", "不显示位置"],
    success(res) {
      location.value = ["北京", "上海", "广州", ""][res.tapIndex]
    }
  })
}

function togglePromote() {
  promoteOn.value = !promoteOn.value
  uni.showToast({ title: promoteOn.value ? "已开启助力" : "已关闭助力", icon: "none" })
}

/** 页面隐私选项 → 后端 visibility_type（六选一） */
function mapPrivacy(p) {
  if (p === "friends") return "followers"
  if (p === "private") return "private"
  return "public"
}

async function publish() {
  if (!images.value.length) {
    uni.showToast({ title: "请至少选择一张图片", icon: "none" })
    return
  }
  if (!title.value.trim()) {
    uni.showToast({ title: "请填写标题", icon: "none" })
    return
  }

  uni.showLoading({ title: "发布中...", mask: true })
  try {
    // ① 逐张上传：后端上传接口是单文件（字段名 file），多图由前端循环
    const urls = []
    for (let i = 0; i < images.value.length; i++) {
      const up = await uploadWorkFile(images.value[i].src)
      if (up && up.url) urls.push(up.url)
    }
    if (!urls.length) throw new Error("图片上传失败")

    // ② 创建作品（status=published 直接发布；图文 → channel=visual + image_layout=flip）
    // TODO(契约待后端确认)：正文 body、话题(#)、@好友、共创成员 后端作品模型暂无对应字段。
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
    // 失败原因由 upload / request 层按错误码提示
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
/* 页面：白底，顶部导航 + 可滚动正文 + 底部固定发布条 */
.page {
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 导航：稿上只有返回箭头（墨迹 x24.7..41 / y48.7..63），无标题。
   稿上状态栏 0..44、预览区顶 76 → 导航带 44..76（高 32px = 60rpx），
   箭头墨迹在带内 4.7..19，故 nav-back 再下移 9rpx。 */
.nav {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  height: 60rpx;
  padding-top: var(--sbh, 0px);
  padding-left: 46rpx;
  box-sizing: content-box;
}
.nav-back { width: 60rpx; height: 60rpx; display: flex; align-items: flex-start; margin-top: 9rpx; }
.nav-back-ic { width: 30rpx; height: 30rpx; }

.body-scroll { flex: 1; height: 0; min-height: 0; }

/* 大图预览：稿上 122×200（1x）居中，灰块 #D9D9D9、直角；紧接导航（无额外间距） */
.preview-wrap {
  margin-top: 0;
  display: flex;
  justify-content: center;
}
.big-swiper { width: 228rpx; height: 374rpx; }
.big-img { width: 228rpx; height: 374rpx; }
.big-ph { width: 228rpx; height: 374rpx; background: #d9d9d9; }

/* 缩略图行：稿上 63×62.7、圆角 10、间距 8，整行居中 */
.thumbs {
  margin-top: 31rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
.thumb {
  width: 118rpx;
  height: 117rpx;
  border-radius: 19rpx;
  overflow: hidden;
  margin: 0 7rpx;
  background: #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb.on { box-shadow: 0 0 0 4rpx #4a6258; }
.thumb-img { width: 100%; height: 100%; }
.thumb-ph { width: 100%; height: 100%; background: #d9d9d9; }
.thumb-add { background: #fbfbfb; border: 1rpx solid #ececec; }
.thumb-add-t { font-size: 36rpx; color: #b3b3b3; line-height: 1; }

/* 标题：稿上文字 y382..400.3、左缘 23.3、字高 18.3、占位色 #7C7C7C */
.title-row { margin-top: 36rpx; padding: 0 44rpx; }
.title-input { font-size: 34rpx; color: #1f1f1f; line-height: 1; height: 22px; }
.ph { color: #7c7c7c; font-size: 34rpx; }

/* 正文卡片：稿上 382.7×184.7、圆角 20、底 #E9EFEC，卡顶 y415（标题墨迹底 400.3 + 14.7） */
.desc-card {
  margin: 23rpx 18rpx 0;
  height: 345rpx;
  border-radius: 37rpx;
  background: #e9efec;
  padding: 28rpx 30rpx;
  box-sizing: border-box;
}
.desc-input { width: 100%; height: 100%; font-size: 28rpx; line-height: 1.6; color: #254737; }
.desc-ph { color: #9db3a6; font-size: 28rpx; }

/* 话题胶囊：稿上高 27、圆角 10、底 #E9EFEC、字 #7C7C7C；这一行始终占位 */
.chips {
  margin-top: 23rpx;
  padding: 0 45rpx;
  min-height: 50rpx;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.chip {
  height: 50rpx;
  border-radius: 19rpx;
  background: #e9efec;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  margin: 0 6rpx 6rpx 0;
}
.chip-t { font-size: 21rpx; color: #7c7c7c; }

/* 工具栏：稿上高 31、圆角 12、底 #475A51、白字 13；四枚宽 64.7 / 103.7 / 64.7 / 65.4，间距 5.6 */
.toolbar {
  margin-top: 32rpx;
  padding: 0 43rpx;
  display: flex;
  flex-wrap: wrap;
}
.tool {
  height: 58rpx;
  border-radius: 22rpx;
  background: #475a51;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24rpx;
  margin: 0 10rpx 10rpx 0;
  box-sizing: border-box;
}
.tool-t { font-size: 26rpx; color: #ffffff; }
.tool-ic { width: 24rpx; height: 24rpx; margin-right: 6rpx; }

/* 设置行：稿上圆钮 36²、标题 12.7、副标题 10.7、右侧值 #ABABAB；
   稿上工具栏底 y687 → 第一行顶 y727（40px 间距），两行之间 24.6px */
.set-row {
  margin: 0 22rpx;
  height: 67rpx;
  display: flex;
  align-items: center;
}
.set-row:first-of-type { margin-top: 0; }
.toolbar + .set-row { margin-top: 65rpx; }
/* 稿上两行之间 24.6px（row1 底 763.7 → row2 顶 788.3），中间有 1px #EFF5F0 分隔线 */
.set-row + .set-div { margin-top: 22rpx; }
.set-div {
  height: 2rpx;
  margin: 0 22rpx;
  background: #eff5f0;
}
.set-div + .set-row { margin-top: 22rpx; }
.set-ic {
  width: 67rpx;
  height: 67rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.set-ic.lock { background: #f4f9f5; }
.set-ic.flame { background: #fffbeb; }
.set-ic-img { width: 38rpx; height: 38rpx; }
.set-txt { flex: 1; min-width: 0; margin-left: 24rpx; display: flex; flex-direction: column; }
.set-title { font-size: 24rpx; color: #16281e; line-height: 1.25; }
.set-sub { font-size: 20rpx; color: #6a7d71; line-height: 1.25; margin-top: 4rpx; }
.set-val { font-size: 24rpx; color: #ababab; }
.set-arrow { width: 22rpx; height: 22rpx; margin-left: 10rpx; }

.scroll-pad { height: 40rpx; }

/* 底部固定发布条 */
.publish-bar {
  flex-shrink: 0;
  padding: 16rpx 38rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #ffffff;
}
.publish-btn {
  height: 86rpx;
  border-radius: 86rpx;
  background: linear-gradient(90deg, #38503e 0%, #485e53 50%, #374d3c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.publish-t { font-size: 28rpx; color: #ffffff; }

/* 隐私 / 话题浮层 */
.mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 90;
}
.sheet {
  width: 100%;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx 40rpx calc(32rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.sheet-title { font-size: 30rpx; color: #1f1f1f; margin-bottom: 16rpx; }
.sheet-item {
  height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #f0f0f0;
}
.sheet-item-t { font-size: 28rpx; color: #333333; }
.sheet-item.on .sheet-item-t { color: #4a6258; }
.sheet-check { font-size: 28rpx; color: #4a6258; }
.sheet-done {
  margin-top: 24rpx;
  height: 86rpx;
  border-radius: 86rpx;
  background: #4a6258;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sheet-done-t { font-size: 28rpx; color: #ffffff; }

.topic-input-wrap {
  display: flex;
  align-items: center;
  height: 96rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.hash { font-size: 28rpx; color: #4a6258; margin-right: 8rpx; }
.topic-input { flex: 1; font-size: 28rpx; color: #1f1f1f; }
</style>
