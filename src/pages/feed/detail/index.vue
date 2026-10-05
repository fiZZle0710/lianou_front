<template>
  <!-- 动态详情页面 -->
  <view class="page">
    <CustomNavbar title="动态详情" showBack />

    <!-- 演示数据灰标：接口不可用、回退到本地假数据时显示 -->
    <DemoBadge :show="isDemo" position="top-right" />

    <scroll-view scroll-y class="detail-scroll">
      <!-- 横向滚动用户头像栏 -->
      <scroll-view scroll-x class="user-bar" show-scrollbar="false">
        <view
          v-for="(user, index) in relatedUsers"
          :key="index"
          class="user-avatar-item"
          @click="goUserProfile(user.id)"
        >
          <UserAvatar :src="user.avatar" size="small" />
          <text class="user-name">{{ user.name }}</text>
        </view>
      </scroll-view>

      <!-- 动态主体 -->
      <view class="feed-main">
        <!-- 发布者信息 -->
        <view class="feed-header">
          <view class="author-info" @click="goUserProfile(feed.authorId)">
            <UserAvatar :src="feed.avatar" size="small" />
            <view class="author-detail">
              <text class="author-name">{{ feed.username }}</text>
              <text class="feed-time">{{ feed.time }}</text>
            </view>
          </view>
          <view class="follow-btn" v-if="!feed.isFollowed" @click="followAuthor">
            <text>+ 关注</text>
          </view>
        </view>

        <!-- 动态正文 -->
        <view class="feed-body">
          <text class="feed-text">{{ feed.text }}</text>

          <!-- 话题标签 -->
          <view v-if="feed.tags && feed.tags.length" class="feed-tags">
            <text
              v-for="(tag, i) in feed.tags"
              :key="i"
              class="tag"
              @click="searchTag(tag)"
            >
              #{{ tag }}
            </text>
          </view>
        </view>

        <!-- 动态图片 -->
        <view v-if="feed.images && feed.images.length" class="feed-images">
          <image
            v-for="(img, i) in feed.images"
            :key="i"
            :src="img"
            mode="aspectFill"
            class="feed-img"
          />
        </view>

        <!-- 共创招募卡片 -->
        <view v-if="feed.coop" class="feed-coop-card">
          <view class="coop-inner">
            <view class="coop-badge">
              <text>🤝 共创招募</text>
            </view>
            <text class="coop-topic">{{ feed.coop.topic }}</text>
            <view class="coop-stats">
              <text class="coop-stat">👥 {{ feed.coop.count }}人已参与</text>
              <text class="coop-stat">⏰ {{ feed.coop.deadline }}</text>
            </view>
            <view class="coop-actions">
              <view class="coop-btn" @click="applyCoop">申请参与</view>
              <view class="coop-btn outline" @click="shareCoop">分享招募</view>
            </view>
          </view>
        </view>

        <!-- 互动统计 -->
        <view class="feed-stats">
          <text class="stat-item">👁 浏览 {{ feed.views }}</text>
          <text class="stat-item">💬 评论 {{ feed.comments }}</text>
          <text class="stat-item">🔗 分享 {{ feed.shares }}</text>
        </view>

        <!-- 互动操作栏 -->
        <view class="feed-actions-bar">
          <view class="action-btn" @click="likeFeed">
            <text>{{ feed.isLiked ? '❤️' : '🤍' }}</text>
            <text>{{ feed.likes }}</text>
          </view>
          <view class="action-btn" @click="focusComment">
            <text>💬</text>
            <text>评论</text>
          </view>
          <view class="action-btn" @click="collectFeed">
            <text>{{ feed.isCollected ? '⭐' : '☆' }}</text>
            <text>{{ feed.isCollected ? '已收藏' : '收藏' }}</text>
          </view>
          <view class="action-btn" @click="shareFeed">
            <text>🔗</text>
            <text>分享</text>
          </view>
        </view>
      </view>

      <!-- 热门评论区域 -->
      <view class="comments-section">
        <text class="comments-title">热门评论</text>

        <view
          v-for="(comment, index) in hotComments"
          :key="index"
          class="comment-item"
        >
          <UserAvatar :src="comment.avatar" size="small" />
          <view class="comment-body">
            <view class="comment-header">
              <text class="comment-username">{{ comment.username }}</text>
              <text class="comment-time">{{ comment.time }}</text>
            </view>
            <text class="comment-text">{{ comment.text }}</text>
            <view class="comment-meta">
              <view class="comment-tag" v-if="comment.authorLiked">
                <text>作者赞过</text>
              </view>
              <view class="comment-tag replied" v-if="comment.authorReplied">
                <text>作者已回复</text>
              </view>
              <text class="comment-likes" v-if="comment.likes">❤️ {{ comment.likes }}</text>
            </view>
          </view>
        </view>

        <view class="view-all-comments" v-if="hasMoreComments" @click="viewAllComments">
          <text>查看全部 {{ feed.comments }} 条评论</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import CustomNavbar from '@/components/common/CustomNavbar.vue'
import UserAvatar from '@/components/common/UserAvatar.vue'
import DemoBadge from '@/components/common/DemoBadge.vue'
import { mockWorks, mockUsers } from '@/mock/index.js'
import {
  getWorkDetail,
  getComments,
  likeWork,
  unlikeWork,
  shareWork,
  createComment
} from '@/api/works.js'
import { getSkills, getHomepage, followUser } from '@/api/user.js'
import {
  pick,
  normalizeWork,
  normalizeUser,
  normalizeComment,
  normalizeCommentList
} from '@/api/adapter.js'
import { withFallback } from '@/utils/fallback.js'
import nav from '@/utils/nav.js'

// 当前作品 id（由路由参数 id 传入）
const workId = ref(null)

// 作品详情（3.5）
const feed = ref({})
const isDemo = ref(false)
const relatedUsers = ref([])
const hotComments = ref([])
const commentPage = ref(1)

const hasMoreComments = computed(
  () => hotComments.value.length < (feed.value.comments || 0)
)

// 默认兜底数据，避免 id 缺失时页面空白
const fallbackFeed = {
  id: 1,
  avatar: '',
  username: '罗大侠',
  authorId: 1,
  time: '2小时前',
  text: '这是一条示例动态。',
  tags: [],
  images: [''],
  views: 0,
  comments: 0,
  shares: 0,
  likes: 0,
  isLiked: false,
  isFollowed: false,
  isCollected: false,
  coop: null
}

/** 演示数据用的评论（接口不可用时展示） */
function defaultComments() {
  return [
    {
      id: 'd1',
      avatar: '',
      username: '创意设计师',
      time: '1小时前',
      text: '这个风格太棒了！请问是用什么工具做的？',
      likes: 23,
      authorLiked: true,
      authorReplied: false
    },
    {
      id: 'd2',
      avatar: '',
      username: '灵感收藏家',
      time: '30分钟前',
      text: '学习了！期待更多作品分享',
      likes: 15,
      authorLiked: false,
      authorReplied: true
    }
  ]
}

/** 演示数据用的相关用户（取 mock 用户前 6 个） */
function mockRelatedUsers() {
  return Object.values(mockUsers).slice(0, 6).map((u) => ({
    id: u.id,
    avatar: u.avatar,
    name: u.nickname
  }))
}

/** 后端评论 → 页面结构（Comment 无点赞数字段，likes 固定 0，模板会隐藏该行） */
function mapComment(c) {
  return {
    id: c.id,
    parentId: c.parentId,
    avatar: c.avatar,
    username: c.nickname,
    text: c.content,
    time: c.time,
    likes: 0,
    authorLiked: false,
    authorReplied: false
  }
}

onLoad((options) => {
  workId.value = options && options.id
  loadAll()
})

async function loadAll() {
  if (!workId.value) {
    feed.value = fallbackFeed
    hotComments.value = defaultComments()
    relatedUsers.value = mockRelatedUsers()
    isDemo.value = true
    return
  }
  const { data, isFallback } = await withFallback(
    async () => {
      const [detail, comments, dict] = await Promise.all([
        getWorkDetail(workId.value),
        getComments(workId.value, { page: 1, page_size: 20 }).catch(() => null),
        getSkills().catch(() => null) // 技能字典（免登录），把 skill_tags 的 ID 翻成名字
      ])
      const work = normalizeWork(detail)
      // 后端无话题标签，这里用技能标签充当 # 标签展示
      const all = dict && Array.isArray(dict.skills) ? dict.skills : []
      work.tags = (work.skillTags || [])
        .map((id) => {
          const hit = all.find((s) => Number(s.id) === Number(id))
          return hit ? hit.name : ''
        })
        .filter(Boolean)
      const users = await loadCollaborators(work.collaborators, work.authorInfo)
      return { work, comments: normalizeCommentList(comments).map(mapComment), users }
    },
    () => ({
      work: mockWorks[workId.value] || fallbackFeed,
      comments: defaultComments(),
      users: mockRelatedUsers()
    }),
    'feed/detail: 作品详情 / 评论'
  )
  isDemo.value = isFallback
  feed.value = data.work
  hotComments.value = data.comments
  relatedUsers.value = data.users
}

/**
 * 相关用户栏：后端只给协作者 ID（collaborators），逐个取主页补昵称头像（最多 5 个）
 */
async function loadCollaborators(ids, authorInfo) {
  const users = []
  if (authorInfo && authorInfo.nickname) {
    users.push({ id: authorInfo.id, avatar: authorInfo.avatar, name: authorInfo.nickname })
  }
  const list = Array.isArray(ids) ? ids.slice(0, 5) : []
  if (!list.length) return users
  const res = await Promise.all(list.map((id) => getHomepage(id).catch(() => null)))
  res.forEach((item, i) => {
    const u = normalizeUser(pick(item || {}, 'user'))
    if (u.nickname) users.push({ id: list[i], avatar: u.avatar, name: u.nickname })
  })
  return users
}

async function followAuthor() {
  const id = feed.value.authorId
  if (!id || isDemo.value) {
    if (isDemo.value) uni.showToast({ title: '演示数据不支持关注', icon: 'none' })
    return
  }
  try {
    // 10.1 关注某人；3006 = 已关注过
    await followUser(id)
    feed.value.isFollowed = true
    uni.showToast({ title: '已关注', icon: 'success' })
  } catch (err) {
    if (err && Number(err.code) === 3006) feed.value.isFollowed = true
  }
}

async function likeFeed() {
  const id = feed.value.id
  if (!id || isDemo.value) {
    if (isDemo.value) uni.showToast({ title: '演示数据不支持点赞', icon: 'none' })
    return
  }
  const next = !feed.value.isLiked
  // 乐观更新（4003 已点赞 / 4004 未点赞 由 request 层静默忽略）
  feed.value.isLiked = next
  feed.value.likes += next ? 1 : -1
  try {
    if (next) await likeWork(id)
    else await unlikeWork(id)
  } catch (e) {
    // 失败回滚
    feed.value.isLiked = !next
    feed.value.likes += next ? -1 : 1
  }
}

function collectFeed() {
  // 后端**无收藏表、无接口**（见 docs/给后端的接口问题清单.md C-1），明确告知用户
  uni.showToast({ title: '收藏功能暂未开放', icon: 'none' })
}

async function shareFeed() {
  const id = feed.value.id
  if (!id || isDemo.value) {
    uni.showToast({ title: '分享动态', icon: 'none' })
    return
  }
  try {
    // 3.15 分享计数（分享明细后端已暂缓）：只同步计数，不做虚假的"分享成功"提示
    const res = await shareWork(id)
    if (res && typeof res.share_count === 'number') feed.value.shares = res.share_count
    uni.showToast({ title: '已记录分享', icon: 'success' })
  } catch (e) {
    /* 失败已由 request 层提示（3001 不存在） */
  }
}

function focusComment() {
  const id = feed.value.id
  if (!id || isDemo.value) {
    uni.showToast({ title: '演示数据不支持评论', icon: 'none' })
    return
  }
  uni.showModal({
    title: '发表评论',
    editable: true,
    placeholderText: '说点什么...',
    success: async (res) => {
      if (!res.confirm) return
      const content = (res.content || '').trim()
      if (!content) return
      try {
        // 4.4 发表评论（只能回复一级评论）
        const created = await createComment(id, { content })
        hotComments.value.unshift(mapComment(normalizeComment(created)))
        feed.value.comments = (feed.value.comments || 0) + 1
        uni.showToast({ title: '评论成功', icon: 'success' })
      } catch (e) {
        /* 4006 内容为空等，已提示 */
      }
    }
  })
}

async function viewAllComments() {
  if (!feed.value.id || isDemo.value) {
    uni.showToast({ title: '演示数据仅展示部分评论', icon: 'none' })
    return
  }
  commentPage.value += 1
  try {
    const page = await getComments(feed.value.id, { page: commentPage.value, page_size: 20 })
    const list = normalizeCommentList(page).map(mapComment)
    if (!list.length) {
      uni.showToast({ title: '没有更多评论了', icon: 'none' })
      return
    }
    hotComments.value = hotComments.value.concat(list)
  } catch (e) {
    /* 失败已提示 */
  }
}

function goUserProfile(id) {
  nav.goDetail('user', id)
}

function searchTag(tag) {
  uni.showToast({ title: `搜索 #${tag}`, icon: 'none' })
}

function applyCoop() {
  // 共创招募卡片依赖 work.is_collaborative + project_id；后端无「招募卡片」聚合结构，
  // 需要项目标题/人数/截止时请用 getProjectDetail(work.projectId)，此处先保留提示
  uni.showToast({ title: '已申请参与', icon: 'success' })
}

function shareCoop() {
  uni.showToast({ title: '分享招募', icon: 'none' })
}
</script>

<style scoped>
.page {
  background: #f5f5f5;
  min-height: 100vh;
}

.detail-scroll {
  height: 100vh;
}

/* 用户头像栏 */
.user-bar {
  background: #fff;
  padding: 20rpx;
  white-space: nowrap;
  border-bottom: 1px solid #eee;
}

.user-avatar-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-right: 24rpx;
  gap: 8rpx;
}

.user-name {
  font-size: 20rpx;
  color: #666;
  max-width: 80rpx;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 动态主体 */
.feed-main {
  background: #fff;
  margin-bottom: 10rpx;
  padding: 24rpx;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.author-detail {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.feed-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

.follow-btn {
  padding: 10rpx 24rpx;
  border: 1px solid #007aff;
  border-radius: 30rpx;
  color: #007aff;
  font-size: 24rpx;
}

/* 正文 */
.feed-body {
  margin-bottom: 16rpx;
}

.feed-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
}

.feed-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 12rpx;
}

.tag {
  font-size: 24rpx;
  color: #007aff;
  background: #f0f7ff;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

/* 图片 */
.feed-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.feed-img {
  width: 100%;
  height: 400rpx;
  border-radius: 12rpx;
  background: #f0f0f0;
}

/* 共创招募卡片 */
.feed-coop-card {
  margin-bottom: 16rpx;
}

.coop-inner {
  background: #f7f8ff;
  border: 1px solid #e8ecff;
  border-radius: 16rpx;
  padding: 20rpx;
}

.coop-badge {
  margin-bottom: 12rpx;
}

.coop-badge text {
  font-size: 24rpx;
  color: #4455ee;
  font-weight: 600;
}

.coop-topic {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 12rpx;
}

.coop-stats {
  display: flex;
  gap: 24rpx;
  margin-bottom: 16rpx;
}

.coop-stat {
  font-size: 24rpx;
  color: #888;
}

.coop-actions {
  display: flex;
  gap: 16rpx;
}

.coop-btn {
  flex: 1;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #4455ee;
  color: #fff;
  border-radius: 32rpx;
  font-size: 26rpx;
  font-weight: 500;
}

.coop-btn.outline {
  background: transparent;
  border: 1px solid #4455ee;
  color: #4455ee;
}

/* 统计 */
.feed-stats {
  display: flex;
  gap: 24rpx;
  padding: 16rpx 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16rpx;
}

.stat-item {
  font-size: 24rpx;
  color: #999;
}

/* 互动操作栏 */
.feed-actions-bar {
  display: flex;
  justify-content: space-around;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  color: #666;
}

.action-btn:active {
  background: #f5f5f5;
  border-radius: 30rpx;
}

/* 评论区域 */
.comments-section {
  background: #fff;
  padding: 24rpx;
}

.comments-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.comment-item {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
}

.comment-username {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
}

.comment-time {
  font-size: 20rpx;
  color: #999;
}

.comment-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
  display: block;
  margin: 6rpx 0;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 6rpx;
}

.comment-tag {
  padding: 4rpx 12rpx;
  background: #f0f7ff;
  border-radius: 12rpx;
  font-size: 20rpx;
  color: #007aff;
}

.comment-tag.replied {
  background: #f0fff4;
  color: #34c759;
}

.comment-likes {
  font-size: 20rpx;
  color: #999;
}

.view-all-comments {
  text-align: center;
  padding: 20rpx;
  font-size: 26rpx;
  color: #007aff;
}
</style>
