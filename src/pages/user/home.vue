<template>
  <!--
    他人「我的」主页（只读）：点其他用户头像进入。
    - 读路由 id / userId，按这个用户取数据（getHomepage + getUserWorks），失败回退 mock
    - 去掉右上角「扫一扫 / 设置」，只保留左上返回
    - 封面 / 头像不可点编辑（UserHeader readonly）
    - 「活动」里「我参与的」改为「参与的」（ContentTabs isOther）
  -->
  <view class="page">
    <view class="nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-left">
        <view class="nav-btn" @click="goBack">
          <image class="nav-btn-icon" :src="ICON_BACK" mode="aspectFit" />
        </view>
      </view>
    </view>

    <UserHeader :readonly="true" :profile="profile" />
    <UserStats :stats="stats" />
    <MineActions />
    <ContentTabs :isOther="true" :externalWorks="works" />
    <CustomTabbar />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import CustomTabbar from '@/components/common/CustomTabbar.vue'
import UserHeader from '@/components/mine/UserHeader.vue'
import UserStats from '@/components/mine/UserStats.vue'
import MineActions from '@/components/mine/MineActions.vue'
import ContentTabs from '@/components/mine/ContentTabs.vue'
import { getHomepage, getProfile } from '@/api/user.js'
import { getUserWorks } from '@/api/works.js'
import { normalizeUser, normalizeWorkList } from '@/api/adapter.js'
import { withFallback } from '@/utils/fallback.js'
import { mockUsers, mockWorks } from '@/mock/index.js'

const ICON_BACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
  'stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M15 4.5 7.5 12l7.5 7.5"/></svg>'
)
const WHITE_FRAME = '/static/avatar-frame/white.png'

const statusBarHeight = ref(0)
statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 25

// 路由参数名两套都有人用（nav.js/goDetail 传 id，fans/follow 传 userId），这里统一收口
const userId = ref('')
const profile = ref(null)
const stats = ref(null)
const works = ref(null)

onLoad((options) => {
  const id = options && (options.id || options.userId)
  userId.value = id ? String(id) : ''
  loadAll()
})

function toCard(w) {
  return {
    src: w.cover || '',
    title: w.title || w.text || '未命名作品',
    subtitle: w.subtitle || w.description || '',
    views: String(w.views != null ? w.views : 0),
    likes: w.likes || 0,
    featured: !!w.featured,
    liked: !!w.isLiked
  }
}

async function loadAll() {
  // 没带 id 就不碰组件数据，「我的」页那套示例原样保留
  if (!userId.value) return
  const { data } = await withFallback(async () => {
    const [home, p, ws] = await Promise.all([
      getHomepage(userId.value),
      getProfile(userId.value).catch(() => null),
      getUserWorks(userId.value, { page: 1, page_size: 12 }).catch(() => null)
    ])
    const u = normalizeUser((home && home.user) || {})
    const hp = (home && home.profile) || p || {}
    const tags = []
      .concat(hp.skills || (p && p.skills) || [], hp.style_tags || (p && p.style_tags) || [])
      .map((t) => (typeof t === 'string' ? t : t && (t.name || t.skill_name)))
      .filter(Boolean)
    return {
      profile: {
        avatar: u.avatar || '',
        avatarFrame: WHITE_FRAME,
        cover: u.cover || '',
        nickname: u.nickname || '用户',
        id: u.id || userId.value,
        badge: '',
        tags,
        intro: u.bio || u.intro || ''
      },
      stats: [
        { name: 'fans', num: String(u.followerCount || 0), label: '粉丝', url: '/pages/fans/index' },
        { name: 'follow', num: String(u.followingCount || 0), label: '关注', url: '/pages/follow/index' },
        { name: 'works', num: String(u.workCount || 0), label: '作品', url: '' }
      ],
      works: normalizeWorkList(ws).map(toCard)
    }
  }, () => {
    const u = mockUsers[userId.value] || mockUsers[2]
    const list = Object.values(mockWorks).filter((w) => String(w.authorId) === String(u.id))
    return {
      profile: {
        avatar: u.avatar || '',
        avatarFrame: WHITE_FRAME,
        cover: '',
        nickname: u.nickname || '用户',
        id: u.id,
        badge: u.level ? 'Lv.' + u.level : '',
        tags: u.tags || [],
        intro: u.intro || ''
      },
      stats: [
        { name: 'fans', num: '3.2万', label: '粉丝', url: '/pages/fans/index' },
        { name: 'follow', num: '128', label: '关注', url: '/pages/follow/index' },
        { name: 'works', num: String(list.length), label: '作品', url: '' }
      ],
      works: list.map(toCard)
    }
  }, 'user/home: 他人主页')
  profile.value = data.profile
  stats.value = data.stats
  works.value = data.works
}

function goBack() { uni.navigateBack() }
</script>

<style scoped>
.page {
  position: relative;
  background: #ffffff;
  min-height: 100vh;
  padding-bottom: 70px;
}

.nav {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: 20;
}

.nav-left {
  display: flex;
  align-items: center;
  height: 44px;
  padding-left: 24rpx;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68rpx;
  height: 68rpx;
  border-radius: 20rpx;
  background: rgba(26, 32, 29, 0.42);
}

.nav-btn:active { opacity: 0.7; }

.nav-btn-icon {
  width: 36rpx;
  height: 36rpx;
}
</style>
