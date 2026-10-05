<template>
  <view class="page">
    <view class="nav">
      <view class="nav-back" @click="goBack"><text class="back-icon">←</text></view>
      <text class="nav-title">我的擅长</text>
    </view>

    <!-- 下拉模块：我的擅长 -->
    <view class="module">
      <view class="module-head">
        <text class="module-title">我的擅长</text>
        <view class="module-line"></view>
      </view>

      <view class="group-list">
        <view v-for="g in groups" :key="g.key" class="group">
          <view class="g-head" @click="toggleGroup(g.key)">
            <view class="ico" :class="'ico-' + g.icon"></view>
            <text class="g-title">{{ g.title }}</text>
            <view class="g-wave"><view class="w-bar" :style="{ width: g.wave + '%' }"></view></view>
            <text class="g-arrow" :class="{ open: isExpanded(g.key) }">▾</text>
          </view>

          <view v-show="isExpanded(g.key)" class="g-items">
            <view
              v-for="it in g.items"
              :key="it.key"
              class="chip"
              :class="{ on: isPicked(g.key, it.key) }"
              @click="toggleItem(g.key, it.key)"
            >
              <text class="chip-t">{{ it.label }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="next-btn" @click="goLevel"><text class="next-btn-t">下一步</text></view>
  </view>
</template>
<script setup>
import { ref } from "vue"
import { getUserInfo, setUserInfo } from "@/utils/auth.js"

// 分组 + 子能力项（线稿低保真草图）
const groups = [
  {
    key: "text", icon: "book", title: "文字创作", wave: 70,
    items: [
      { key: "script", label: "剧本撰写" },
      { key: "outline", label: "大纲创作" },
      { key: "copy", label: "视频文案" },
      { key: "other", label: "其他" }
    ]
  },
  {
    key: "visual", icon: "palette", title: "视觉创作", wave: 45,
    items: [
      { key: "storyboard", label: "分镜" },
      { key: "art", label: "人物场景美术" },
      { key: "scene", label: "画面设定" },
      { key: "other", label: "其他" }
    ]
  },
  {
    key: "video", icon: "camera", title: "影像类", wave: 30,
    items: [
      { key: "shoot", label: "拍摄" },
      { key: "edit", label: "剪辑" },
      { key: "grade", label: "调色" },
      { key: "other", label: "其他" }
    ]
  },
  {
    key: "audio", icon: "mic", title: "音频类", wave: 20,
    items: [
      { key: "dub", label: "配音" },
      { key: "sfx", label: "音效配乐" },
      { key: "other", label: "其他" }
    ]
  }
]

const expanded = ref([]) // 已展开的分类
const selected = ref([]) // 已选子项，key 形如 "text.script"

function isExpanded(key) { return expanded.value.indexOf(key) > -1 }

function toggleGroup(key) {
  const i = expanded.value.indexOf(key)
  if (i > -1) expanded.value.splice(i, 1)
  else expanded.value.push(key)
}

function isPicked(gKey, iKey) { return selected.value.indexOf(gKey + "." + iKey) > -1 }

function toggleItem(gKey, iKey) {
  const k = gKey + "." + iKey
  const i = selected.value.indexOf(k)
  if (i > -1) selected.value.splice(i, 1)
  else selected.value.push(k)
}

function goBack() { uni.navigateBack() }

function goLevel() {
  if (!selected.value.length) {
    uni.showToast({ title: "请至少选择 1 项擅长", icon: "none" })
    return
  }
  // ⚠️ 对接后端 —— 记录用户擅长，将来提交接口
  const skills = groups
    .map((g) => {
      const items = g.items.filter((it) => isPicked(g.key, it.key)).map((it) => it.key)
      return items.length ? { group: g.key, groupName: g.title, items } : null
    })
    .filter(Boolean)
  const info = getUserInfo() || {}
  info.skills = skills
  setUserInfo(info)
  uni.navigateTo({ url: "/pages/level/index" })
}
</script>
<style scoped>
.page { min-height: 100vh; background: #faf7f2; padding: 0 48rpx; padding-top: calc(env(safe-area-inset-top) + 20rpx); padding-bottom: calc(env(safe-area-inset-bottom) + 220rpx); box-sizing: border-box; }
.nav { display: flex; align-items: center; padding: 20rpx 0 30rpx; }
.nav-back { position: absolute; left: 40rpx; width: 60rpx; height: 60rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 40rpx; color: #6b5f57; }
.nav-title { flex: 1; text-align: center; font-size: 40rpx; color: #3a3735; letter-spacing: 8rpx; margin-right: 60rpx; font-weight: 600; }

/* 下拉模块 */
.module { margin-top: 20rpx; border: 2rpx solid #e2d9cf; border-radius: 24rpx; background: #fffdfa; padding: 0 24rpx; }
.module-head { padding: 28rpx 6rpx 20rpx; }
.module-title { font-size: 30rpx; color: #3a3735; font-weight: 600; letter-spacing: 4rpx; display: block; }
.module-line { margin-top: 16rpx; height: 2rpx; background: #ece4da; }

/* 分组 */
.group + .group { border-top: 2rpx dashed #ece4da; }
.g-head { display: flex; align-items: center; padding: 30rpx 6rpx; }
.g-title { font-size: 30rpx; color: #3a3735; margin-left: 16rpx; }
.g-wave { flex: 1; margin: 0 20rpx; height: 10rpx; border-radius: 6rpx; background: #f1eae1; overflow: hidden; }
.w-bar { height: 100%; border-radius: 6rpx; background: #ddd2c6; }
.g-arrow { font-size: 24rpx; color: #a99f96; transition: transform 0.2s; }
.g-arrow.open { transform: rotate(180deg); }

/* 线稿图标：书本 / 调色盘 / 相机 / 麦克风 */
.ico { width: 34rpx; height: 34rpx; position: relative; flex-shrink: 0; color: #8b8078; }
.ico::before, .ico::after { content: ""; position: absolute; box-sizing: border-box; border: 2rpx solid currentColor; }
.ico-book::before { left: 1rpx; top: 5rpx; width: 32rpx; height: 24rpx; border-radius: 3rpx; }
.ico-book::after { left: 16rpx; top: 5rpx; width: 2rpx; height: 24rpx; border: 0; border-left: 2rpx solid currentColor; }
.ico-palette::before { left: 1rpx; top: 1rpx; width: 32rpx; height: 32rpx; border-radius: 50%; }
.ico-palette::after { left: 9rpx; top: 9rpx; width: 8rpx; height: 8rpx; border-radius: 50%; }
.ico-camera::before { left: 1rpx; top: 7rpx; width: 32rpx; height: 24rpx; border-radius: 4rpx; }
.ico-camera::after { left: 12rpx; top: 13rpx; width: 10rpx; height: 10rpx; border-radius: 50%; }
.ico-mic::before { left: 11rpx; top: 1rpx; width: 12rpx; height: 20rpx; border-radius: 8rpx; }
.ico-mic::after { left: 5rpx; top: 18rpx; width: 24rpx; height: 13rpx; border: 2rpx solid currentColor; border-top: 0; border-radius: 0 0 12rpx 12rpx; }

/* 子能力项（低保证描边标签） */
.g-items { display: flex; flex-wrap: wrap; padding: 0 6rpx 26rpx; }
.chip { border: 2rpx solid #ded5cb; border-radius: 10rpx; padding: 12rpx 22rpx; margin: 0 16rpx 16rpx 0; background: #fff; }
.chip-t { font-size: 26rpx; color: #6b5f57; }
.chip.on { border-color: #d9a29e; background: #fdf3ec; }
.chip.on .chip-t { color: #c0847f; }

.next-btn { position: fixed; left: 40rpx; right: 40rpx; bottom: calc(env(safe-area-inset-bottom) + 60rpx); height: 96rpx; border-radius: 48rpx; background: #d9a29e; display: flex; align-items: center; justify-content: center; }
.next-btn-t { font-size: 32rpx; color: #fff; letter-spacing: 8rpx; text-indent: 8rpx; }
.next-btn:active { opacity: 0.85; }
</style>