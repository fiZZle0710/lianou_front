<template>
  <!-- 联调自检页（开发用，不挂 tabBar）：一键验证「前端到底连没连上后端」 -->
  <view class="page">
    <view class="nav">
      <view class="nav-back" @click="goBack"><text class="back-icon">←</text></view>
      <text class="nav-title">联调自检</text>
      <view class="nav-right"></view>
    </view>

    <scroll-view scroll-y class="body">
      <!-- 环境信息 -->
      <view class="card">
        <text class="card-title">环境</text>
        <view class="kv"><text class="k">BASE_URL</text><text class="v">{{ baseUrl }}</text></view>
        <view class="kv"><text class="k">服务器根地址</text><text class="v">{{ serverUrl }}</text></view>
        <view class="kv"><text class="k">失败回退 mock</text><text class="v">{{ debugFallback ? '开（页面会显示「演示数据」灰标）' : '关（失败即报错）' }}</text></view>
        <view class="kv"><text class="k">本地假登录</text><text class="v">{{ mockLogin ? '开（登录页发假 token，不打后端）' : '关（登录走真实接口）' }}</text></view>
        <view class="kv"><text class="k">登录态</text><text class="v">{{ hasToken ? '已登录' : '未登录' }}</text></view>
        <view class="kv"><text class="k">Token</text><text class="v">{{ maskedToken }}</text></view>
        <view class="kv"><text class="k">当前用户</text><text class="v">{{ userText }}</text></view>
      </view>

      <!-- 结论 -->
      <view class="card" :class="'summary-' + conclusion.state">
        <text class="card-title">结论</text>
        <text class="conclusion">{{ conclusion.text }}</text>
      </view>

      <!-- 操作 -->
      <view class="btn-row">
        <view class="btn primary" @click="runAll"><text class="btn-t">一键全部检查</text></view>
        <view class="btn" @click="selfRegister"><text class="btn-t">自助注册+登录</text></view>
        <view class="btn" @click="doLogin"><text class="btn-t">预置账号登录</text></view>
        <view class="btn" @click="doLogout"><text class="btn-t">登出</text></view>
        <view class="btn" @click="copyResult"><text class="btn-t">复制结果</text></view>
      </view>

      <!-- 逐条结果 -->
      <view class="card">
        <text class="card-title">接口连通性：{{ okCount }} 通过<text v-if="warnCount"> · {{ warnCount }} 契约不符</text><text v-if="failCount"> · {{ failCount }} 失败</text> / 共 {{ items.length }}</text>
        <view class="row" v-for="it in items" :key="it.key">
          <view class="row-head">
            <text class="dot" :class="it.state">{{ stateText(it.state) }}</text>
            <text class="row-name">{{ it.name }}</text>
            <text class="row-ms" v-if="it.ms >= 0">{{ it.ms }}ms</text>
          </view>
          <text class="row-url">{{ it.method }} {{ it.path }}</text>
          <text class="row-detail">{{ it.detail }}</text>
        </view>
      </view>

      <view class="tips">
        <text class="tips-text">说明：本页直连 BASE_URL，不走 mock 回退，专门用来区分「接口真的通了」和「页面看着有数据（其实是灰标演示数据）」。</text>
        <text class="tips-text">「契约?!」= HTTP 已通、但响应 code 为 0（后端 2026-09-27 答复示例口径）；若后端确实如此，改 src/utils/request.js 的 SUCCESS_CODE。</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { BASE_URL, SERVER_URL, DEBUG_FALLBACK, MOCK_LOGIN_ENABLED, TEST_ACCOUNTS } from '@/utils/config.js'
import { getToken, getUserInfo } from '@/utils/auth.js'
import { login, logout, sendCode, register } from '@/api/auth.js'

/**
 * 自检清单：路径与编号对应 docs/backend/API-2026-09-27.md
 * 覆盖广场 / 项目 / 消息 / 通知四条主链路的「读」接口（写接口不在此页验证）
 */
const CHECKS = [
  { key: 'me', name: '当前用户（1.6）', method: 'GET', path: '/auth/me', needAuth: true },
  { key: 'feed', name: '推荐流（3.10）', method: 'GET', path: '/works/feed?page=1&page_size=5&exclude_self=false', needAuth: true },
  { key: 'following', name: '关注流（3.11）', method: 'GET', path: '/works/feed/following?page=1&page_size=5', needAuth: true },
  { key: 'myworks', name: '我的作品（3.6）', method: 'GET', path: '/works/mine?page=1&page_size=5', needAuth: true },
  { key: 'projects', name: '项目列表（5.2）', method: 'GET', path: '/projects/?page=1&page_size=5', needAuth: true },
  { key: 'skills', name: '技能字典（2.8）', method: 'GET', path: '/profile/skills', needAuth: false },
  { key: 'conversations', name: '联系人列表（6.1）', method: 'GET', path: '/conversations/?page=1&page_size=5', needAuth: true },
  { key: 'groups', name: '群聊列表（7.1）', method: 'GET', path: '/groups/?page=1&page_size=5', needAuth: true },
  { key: 'unread', name: '未读数（9.1）', method: 'GET', path: '/notifications/unread-counts', needAuth: true },
  { key: 'interaction', name: '互动通知（9.2）', method: 'GET', path: '/notifications/interaction?page=1&page_size=5', needAuth: true },
  { key: 'todo', name: '待办通知（9.3）', method: 'GET', path: '/notifications/todo?page=1&page_size=5', needAuth: true }
]

const baseUrl = computed(() => BASE_URL)
const serverUrl = computed(() => SERVER_URL)
const debugFallback = computed(() => DEBUG_FALLBACK)
const mockLogin = computed(() => MOCK_LOGIN_ENABLED)

const token = ref(getToken() || '')
const hasToken = computed(() => !!token.value)
const maskedToken = computed(() => {
  const t = token.value
  if (!t) return '（无）'
  return t.length <= 12 ? t : (t.slice(0, 6) + '…' + t.slice(-4))
})
const userText = computed(() => {
  const u = getUserInfo() || {}
  if (!u || (!u.nickname && !u.user_id && !u.id)) return '（未登录 / 未缓存）'
  return (u.nickname || '未命名') + ' #' + (u.user_id || u.id)
})

const items = ref(CHECKS.map((c) => ({ ...c, state: 'idle', ms: -1, http: 0, detail: '未检查' })))
const running = ref(false)

const okCount = computed(() => items.value.filter((i) => i.state === 'ok').length)
const failCount = computed(() => items.value.filter((i) => i.state === 'fail').length)
const warnCount = computed(() => items.value.filter((i) => i.state === 'warn').length)
const doneCount = computed(() => items.value.filter((i) => ['ok', 'fail', 'warn'].indexOf(i.state) >= 0).length)

const conclusion = computed(() => {
  if (failCount.value > 0) {
    const names = items.value.filter((i) => i.state === 'fail').map((i) => i.name).slice(0, 3).join('、')
    return { state: 'fail', text: '❌ ' + failCount.value + ' 项失败（' + names + '…）：前端还没真正连上后端，页面上看到的多半是 mock 演示数据' }
  }
  if (warnCount.value > 0) {
    return { state: 'warn', text: '⚠️ ' + warnCount.value + ' 项「契约不符」：HTTP 通了但响应 code=0（后端 2026-09-27 答复的示例即如此）。若确实返回 0，请把 src/utils/request.js 的 SUCCESS_CODE 改成 0' }
  }
  if (okCount.value === items.value.length) {
    return { state: 'ok', text: '✅ 全部 ' + items.value.length + ' 项通过：前端已连上 ' + BASE_URL }
  }
  if (doneCount.value) return { state: 'part', text: '已检查 ' + doneCount.value + ' / ' + items.value.length + ' 项，暂无失败' }
  return { state: 'idle', text: '点「一键全部检查」开始（约几秒）' }
})

function stateText(state) {
  if (state === 'ok') return '通过'
  if (state === 'warn') return '契约?!'
  if (state === 'fail') return '失败'
  if (state === 'running') return '检查中'
  return '待检'
}

/** 数据摘要：分页看 total/条数，数组看长度，对象看前几个字段 */
function digestOf(data) {
  if (data === null || data === undefined) return 'data 为空'
  if (Array.isArray(data)) return '数组 ' + data.length + ' 项'
  if (typeof data === 'object') {
    if (Array.isArray(data.list)) {
      return 'total=' + (data.total === undefined ? '-' : data.total) + '，本页 ' + data.list.length + ' 项'
    }
    const keys = Object.keys(data)
    if (!keys.length) return '空对象'
    return '字段：' + keys.slice(0, 6).join('、') + (keys.length > 6 ? ' …' : '')
  }
  return String(data)
}

/** 直连请求：不走 src/utils/request.js（它会 toast / 抛错），这里要拿原始 HTTP 状态 */
function rawRequest(path, method = 'GET') {
  const started = Date.now()
  return new Promise((resolve) => {
    uni.request({
      url: BASE_URL + path,
      method,
      timeout: 8000,
      header: token.value ? { Authorization: 'Bearer ' + token.value } : {},
      success: (res) => resolve({ http: res.statusCode, ms: Date.now() - started, body: res.data }),
      fail: (err) => resolve({ http: 0, ms: Date.now() - started, error: (err && err.errMsg) || '请求失败' })
    })
  })
}

async function runOne(it) {
  it.state = 'running'
  it.detail = '检查中...'
  it.ms = -1
  const res = await rawRequest(it.path, it.method)
  it.ms = res.ms
  if (res.http === 0) {
    it.state = 'fail'
    it.detail = '连不上：' + res.error + '（后端没启动 / 端口不对 / 真机需用局域网 IP）'
    return
  }
  it.http = res.http
  const body = res.body || {}
  const code = body.code
  const httpOk = res.http >= 200 && res.http < 300
  if (httpOk && code === 0) {
    // 后端 2026-09-27 答复的 JSON 示例全部写 `"code": 0`，与文档首节的 200 冲突。
    // 这里单独标成 warn，方便一眼区分「真的连上了」和「连上了但成功码口径不同」。
    it.state = 'warn'
    it.detail = 'HTTP ' + res.http + ' · code 0（契约不符：约定 200）· '
      + digestOf(body.data !== undefined ? body.data : body)
    return
  }
  const ok = httpOk && (code === undefined || code === 200)
  if (ok) {
    it.state = 'ok'
    it.detail = 'HTTP ' + res.http + ' · code ' + (code === undefined ? '(无包裹)' : code)
      + ' · ' + digestOf(body.data !== undefined ? body.data : body)
  } else {
    it.state = 'fail'
    it.detail = 'HTTP ' + res.http + ' · code ' + (code === undefined ? '-' : code) + ' · ' + (body.message || '失败')
      + (res.http === 401 ? '（token 无效或未登录，先点「自助注册+登录」或「预置账号登录」）' : '')
  }
}

/** 依次跑完，避免并发把日志搅在一起 */
async function runAll() {
  if (running.value) return
  running.value = true
  uni.showLoading({ title: '检查中...', mask: true })
  try {
    for (const it of items.value) {
      await runOne(it)
    }
  } finally {
    running.value = false
    uni.hideLoading()
  }
  const tip = failCount.value
    ? (failCount.value + ' 项失败')
    : (warnCount.value ? (warnCount.value + ' 项契约不符') : '全部通过')
  uni.showToast({ title: tip, icon: 'none' })
}

/** 1.3 密码登录：用 config.js 的 TEST_ACCOUNTS */
async function doLogin() {
  const acc = TEST_ACCOUNTS[0]
  if (!acc) {
    uni.showToast({ title: 'config.js 里没有测试账号', icon: 'none' })
    return
  }
  try {
    const res = await login({ phone: acc.account, password: acc.password })
    token.value = getToken() || ''
    uni.showToast({ title: res && res.token ? '登录成功' : '登录返回异常', icon: 'none' })
  } catch (e) {
    // request.js 已提示
  }
}

/**
 * 自助注册 + 登录（不依赖后端预置账号 / seed 脚本）
 * 流程：1.1 sendCode(scene=register) → 取 data.dev_code（后端明确**始终**返回）
 *       → 1.2 register({phone, code, password})（auth.js 内已写入登录态）
 * ⚠️ password 必须满足 ^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$（故用 Pass1234）
 */
function randomPhone() {
  // 155 + 时间戳后 8 位：同一秒内重复点击会撞号（1005 已注册），换一次即可
  return '155' + String(Date.now()).slice(-8)
}

async function selfRegister() {
  if (running.value) return
  const phone = randomPhone()
  const password = 'Pass1234'
  uni.showLoading({ title: '注册中...', mask: true })
  try {
    const codeRes = await sendCode(phone, 'register')
    const code = codeRes && codeRes.dev_code
    if (!code) {
      uni.hideLoading()
      uni.showToast({ title: '后端未返回 dev_code，请确认后端为开发环境', icon: 'none' })
      return
    }
    const res = await register({ phone, code, password })
    token.value = getToken() || ''
    uni.hideLoading()
    uni.showToast({ title: (res && res.token ? '已注册并登录 ' : '注册返回异常 ') + phone, icon: 'none' })
  } catch (e) {
    uni.hideLoading()
    // request.js 已提示（如 1005 已注册：再点一次会换号）
  }
}

/** 1.7 登出（JWT 无状态，前端清本地登录态） */
async function doLogout() {
  await logout()
  token.value = ''
  uni.showToast({ title: '已登出', icon: 'none' })
}

function copyResult() {
  const lines = [
    '[联调自检] ' + new Date().toLocaleString(),
    'BASE_URL: ' + BASE_URL,
    'DEBUG_FALLBACK: ' + (DEBUG_FALLBACK ? 'true' : 'false'),
    'MOCK_LOGIN_ENABLED: ' + (MOCK_LOGIN_ENABLED ? 'true（登录页发假 token，不打后端）' : 'false'),
    '登录态: ' + (hasToken.value ? ('已登录 ' + userText.value) : '未登录'),
    '结论: ' + conclusion.value.text,
    '通过 ' + okCount.value + ' / 契约不符 ' + warnCount.value + ' / 失败 ' + failCount.value,
    '----------------------------------------'
  ]
  items.value.forEach((it) => {
    lines.push(it.name + ' [' + stateText(it.state) + '] ' + it.method + ' ' + it.path)
    lines.push('    ' + it.detail)
  })
  uni.setClipboardData({
    data: lines.join('\n'),
    success: () => uni.showToast({ title: '已复制', icon: 'none' })
  })
}

function goBack() { uni.navigateBack() }
</script>

<style scoped>
.page { background: #f5f6fa; min-height: 100vh; }
.nav { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 24rpx; padding-top: calc(env(safe-area-inset-top) + 20rpx); background: #fff; }
.nav-back { width: 70rpx; height: 60rpx; display: flex; align-items: center; }
.back-icon { font-size: 40rpx; color: #333; }
.nav-title { font-size: 34rpx; font-weight: 700; color: #333; }
.nav-right { width: 70rpx; }

.body { height: calc(100vh - 100rpx); box-sizing: border-box; padding: 20rpx; }

/* 卡片 */
.card { background: #fff; border-radius: 20rpx; padding: 24rpx; margin-bottom: 20rpx; }
.card-title { font-size: 28rpx; font-weight: 700; color: #333; display: block; margin-bottom: 16rpx; }
.kv { display: flex; margin-bottom: 10rpx; }
.k { width: 220rpx; flex-shrink: 0; font-size: 24rpx; color: #999; }
.v { flex: 1; font-size: 24rpx; color: #333; word-break: break-all; }

/* 结论配色 */
.summary-ok { background: #eaf9ef; }
.summary-fail { background: #fdeaea; }
.summary-warn { background: #fff1e6; }
.summary-part { background: #fff8e6; }
.conclusion { font-size: 26rpx; color: #333; line-height: 1.6; }

/* 按钮 */
.btn-row { display: flex; flex-wrap: wrap; gap: 16rpx; margin-bottom: 20rpx; }
.btn { flex: 1; min-width: 220rpx; height: 80rpx; border-radius: 40rpx; background: #fff; display: flex; align-items: center; justify-content: center; }
.btn.primary { background: #d9a29e; }
.btn:active { opacity: .85; }
.btn-t { font-size: 26rpx; color: #333; }
.btn.primary .btn-t { color: #fff; }

/* 结果行 */
.row { padding: 16rpx 0; border-bottom: 1rpx solid #f5f6fa; }
.row-head { display: flex; align-items: center; }
.dot { font-size: 22rpx; padding: 2rpx 14rpx; border-radius: 20rpx; background: #f0f0f0; color: #666; margin-right: 12rpx; }
.dot.ok { background: #eaf9ef; color: #2ba471; }
.dot.warn { background: #fff1e6; color: #e07b1f; }
.dot.fail { background: #fdeaea; color: #e34d4d; }
.dot.running { background: #fff8e6; color: #d9a23e; }
.row-name { flex: 1; font-size: 26rpx; color: #333; }
.row-ms { font-size: 22rpx; color: #bbb; }
.row-url { font-size: 22rpx; color: #999; display: block; margin-top: 6rpx; word-break: break-all; }
.row-detail { font-size: 22rpx; color: #666; display: block; margin-top: 6rpx; line-height: 1.5; }

/* 说明 */
.tips { padding: 0 8rpx 60rpx; }
.tips-text { font-size: 22rpx; color: #999; line-height: 1.6; }
</style>
