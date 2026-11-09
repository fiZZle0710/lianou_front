<template>
  <!--
    「我的」页头部：封面画 + 头像（金环 + 活动款角标）/ 昵称 / 莲藕账号 / 擅长标签 / 签名
    尺寸按设计稿实测（头像 66px、昵称 32px、页面左右内缩 22px）换算成 rpx（1px ≈ 1.8657rpx）
  -->
  <view class="user-header">
    <!--
      封面：设计稿里是一张示例背景图，先按老师要求留白（不加图 = 透出页面白底）。
      以后要换背景：把 userInfo.cover 设成图片地址即可，标题/头像等位置不用动。
    -->
    <image v-if="userInfo.cover" class="cover" :src="userInfo.cover" mode="aspectFill" />
    <view v-if="userInfo.cover" class="cover-fade"></view>
    <!-- 点击封面区域即可从相册换图；覆盖到资料块上方，不遮挡头像与右上操作按钮 -->
    <view v-if="!readonly" class="cover-tap" @click="changeCover"></view>
    <text v-if="!readonly && !userInfo.cover" class="cover-hint">点击更换封面</text>

    <view class="profile">
      <view class="avatar-wrap" @click="onAvatarClick">
        <!-- 头像框：走 UserAvatar 现成的 frame 能力，素材放 /static/avatar-frame/
             （先用默认白色框 white.png 占位，详细样式定了换文件即可） -->
        <UserAvatar :src="userInfo.avatar" :size="58" :frame="userInfo.avatarFrame" />
        <view v-if="userInfo.badge" class="avatar-badge">
          <text class="avatar-badge-t">{{ userInfo.badge }}</text>
        </view>
      </view>

      <view class="info">
        <text class="name">{{ userInfo.nickname }}</text>
        <text class="account">莲藕账号:{{ userInfo.id }}</text>
        <view class="tags">
          <text class="tags-label">擅长:</text>
          <text v-for="tag in userInfo.tags" :key="tag" class="tag">{{ tag }}</text>
        </view>
      </view>
    </view>

    <view class="intro-wrap">
      <view class="intro-line" :class="{ 'intro-open': introExpanded }">
        <text class="intro-txt" :class="{ 'intro-1line': !introExpanded }">{{ userInfo.intro }}</text>
        <text class="intro-more" @click="introExpanded = !introExpanded">{{ introExpanded ? '收起' : '……展开' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 他人主页只读：不允许换封面、点头像跳资料页
const props = defineProps({
  readonly: { type: Boolean, default: false }
})

// 签名收起/展开（设计稿：仅一行，多余收拢为「……展开」，点击向下展开）
const introExpanded = ref(false)
import UserAvatar from '@/components/common/UserAvatar.vue'

// 后端还没有「我的资料」接口，先按设计稿的示例数据占位
const userInfo = ref({
  avatar: '',
  // 头像框素材；后端给每个用户的框 ID 后，这里换成对应的 URL
  avatarFrame: '/static/avatar-frame/white.png',
  // 封面背景图：先留白；以后设为 '/static/xxx.png' 即可换上
  cover: '',
  nickname: '冯大侠',
  id: '1234567',
  badge: '活动款',
  tags: ['分镜', '编剧'],
  intro: '从不鸽人 · 致力于水墨与人间月色'
})

// 点击封面从相册换图：仅本次会话内生效。
// 后端「我的资料」暂无封面字段，且 H5 的 tempFilePath 是 blob URL，
// 刷新后会失效，所以不落 storage，避免下次进页面显示破图。
function changeCover() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album'],
    success(res) {
      const p = (res.tempFilePaths || [])[0]
      if (!p) return
      userInfo.value.cover = p
    }
  })
}

function onAvatarClick() {
  if (props.readonly) return
  uni.navigateTo({ url: '/pages/user/detail' })
}
</script>

<style scoped>
.user-header {
  position: relative;
  /* 头像顶边在设计稿里落在 y=196px → 366rpx；封面从页面最顶端铺起 */
  padding-top: 366rpx;
}

/* 封面图铺到屏幕最上方（含状态栏区域），导航与资料块都压在它上面 */
.cover {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  /* 设计稿：封面多露一些，图片下缘渐渐消失变成透明，与下方自然交接 */
  height: 720rpx;
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 66%, transparent 100%);
  mask-image: linear-gradient(180deg, #000 0%, #000 66%, transparent 100%);
}

/* 封面点击区：覆盖到资料块上方；右上按钮 z-index 更高，仍可点 */
.cover-tap {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 366rpx;
  z-index: 1;
}

/* 没有封面图时给一个极淡的可发现性提示（不拦截点击） */
.cover-hint {
  position: absolute;
  left: 0;
  right: 0;
  top: 150rpx;
  text-align: center;
  font-size: 22rpx;
  color: rgba(60, 70, 66, 0.35);
  z-index: 0;
  pointer-events: none;
}

/* 封面下缘渐隐到页面白底（设计稿里画是会淡出的） */
.cover-fade {
  position: absolute;
  left: 0;
  top: 560rpx;
  width: 100%;
  height: 160rpx;
  /* 辅助柔和交接：不再硬切成纯白 */
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.55) 100%);
}

.profile {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 0 41rpx; /* 设计稿：左右各 22px */
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.avatar-badge {
  position: absolute;
  left: -6rpx;
  bottom: -10rpx;
  height: 34rpx;
  padding: 0 14rpx;
  border-radius: 17rpx;
  background: #db5543;
  display: flex;
  align-items: center;
}

.avatar-badge-t {
  font-size: 19rpx;
  color: #ffffff;
}

.info {
  flex: 1;
  min-width: 0;
  margin-left: 24rpx;
  padding-top: 4rpx;
}

.name {
  display: block;
  font-size: 64rpx; /* 设计稿：32px */
  font-weight: 600;
  color: #1f2422;
  line-height: 1.15;
}

.account {
  display: block;
  margin-top: 6rpx;
  font-size: 21rpx;
  color: #4a5450;
}

.tags {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
}

.tags-label {
  margin-right: 10rpx;
  font-size: 22rpx;
  color: #3c4642;
}

.tag {
  height: 36rpx;
  padding: 0 14rpx;
  margin-right: 10rpx;
  border-radius: 10rpx;
  /* 设计稿：擅长胶囊是绿底白字（比原来的半透明灰绿更偏绿） */
  background: #8bad9a;
  color: #ffffff;
  font-size: 22rpx;
  line-height: 36rpx;
}

.intro-wrap {
  position: relative;
  /* 签名与上方资料块、下方内容区的间距都拉大 */
  margin-top: 40rpx;
  padding: 0 41rpx 36rpx;
}
.intro-line {
  display: flex;
  align-items: flex-end;
}
.intro-open {
  align-items: flex-start;
}
.intro-txt {
  flex: 1;
  min-width: 0;
  font-size: 22rpx;
  color: #46504c;
  line-height: 1.5;
}
.intro-1line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.intro-more {
  flex-shrink: 0;
  margin-left: 8rpx;
  font-size: 22rpx;
  color: #6a9a7e;
  line-height: 1.5;
}
</style>
