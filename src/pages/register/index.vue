<template>
  <!-- 莲藕 注册页 -->
  <view class="page">
    <view class="nav">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">注册</text>
    </view>
    <view class="form">
      <view class="input-group">
        <text class="input-icon">📱</text>
        <input class="input-field" v-model="phone" type="text" placeholder="输入手机号" placeholder-class="placeholder" />
      </view>
      <view class="input-group">
        <text class="input-icon">🔑</text>
        <input class="input-field" v-model="code" type="text" placeholder="输入验证码" placeholder-class="placeholder" />
        <view class="code-btn" @click="getCode">
          <text class="code-btn-text">{{ countdown > 0 ? countdown + 's' : '获取验证码' }}</text>
        </view>
      </view>
      <view class="input-group">
        <text class="input-icon">🔒</text>
        <input class="input-field" v-model="password" :password="true" type="text" placeholder="设置密码" placeholder-class="placeholder" />
      </view>
      <view class="btn-submit" @click="doRegister">
        <text class="btn-submit-text">注册</text>
      </view>
    </view>
    <view class="third">
      <view class="divider">
        <view class="divider-line"></view>
        <text class="divider-text">第三方登录</text>
        <view class="divider-line"></view>
      </view>
      <view class="icons">
        <view class="icon-circle" @click="qqLogin"><text class="icon-text">Q</text></view>
        <view class="icon-circle" @click="wxLogin"><text class="icon-text">微</text></view>
        <view class="icon-circle placeholder"><text class="icon-text">＋</text></view>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref } from "vue"
import { onUnload } from "@dcloudio/uni-app"
import { TEST_SMS_CODE, SMS_COUNTDOWN, DEBUG_FALLBACK } from "@/utils/config.js"
import { setToken, setUserInfo } from "@/utils/auth.js"
import { sendCode, register } from "@/api/auth.js"

const phone = ref("")
const password = ref("")
const code = ref("")
const countdown = ref(0)
let timer = null

function goBack() { uni.navigateBack() }

// 与后端 1007 规则一致：8-20 位、含字母和数字
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/

function startCountdown() {
  countdown.value = SMS_COUNTDOWN
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

/** 1.1 发送验证码（scene=register；开发环境后端会回传 dev_code） */
async function getCode() {
  if (countdown.value > 0) return
  const p = (phone.value || "").trim()
  if (!/^1[3-9]\d{9}$/.test(p)) {
    uni.showToast({ title: "请输入正确的 11 位手机号", icon: "none" })
    return
  }
  try {
    const res = await sendCode(p, "register")
    startCountdown()
    const devCode = res && res.dev_code
    uni.showToast({
      title: devCode ? "验证码已发送（开发环境：" + devCode + "）" : "验证码已发送",
      icon: "none"
    })
  } catch (err) {
    // 1005 该手机号已注册 / 1008 场景不合法 / 429 发送过频，已由 request 层提示
  }
}

/** 1.2 注册（成功后 auth.js 已写入 token + user + is_new_user） */
async function doRegister() {
  const p = (phone.value || "").trim()
  if (!/^1[3-9]\d{9}$/.test(p)) {
    uni.showToast({ title: "请输入正确的 11 位手机号", icon: "none" })
    return
  }
  if (!PASSWORD_RE.test(password.value || "")) {
    uni.showToast({ title: "密码需 8-20 位且含字母和数字", icon: "none" })
    return
  }
  if (!code.value) {
    uni.showToast({ title: "请输入验证码", icon: "none" })
    return
  }

  try {
    await register({ phone: p, code: code.value, password: password.value })
    uni.showToast({ title: "注册成功", icon: "success" })
    setTimeout(() => {
      uni.navigateTo({ url: "/pages/skill/index" })
    }, 400)
  } catch (err) {
    // 联调过渡期：接口不可用且填的是本地测试码时，走演示通道（DEBUG_FALLBACK=false 后失效）
    if (DEBUG_FALLBACK && code.value === TEST_SMS_CODE) {
      setToken("test-token-" + Date.now())
      setUserInfo({
        id: 0,
        nickname: "新用户",
        avatar: "",
        phone: p,
        skills: [],
        level: "",
        profileCompleted: false
      })
      uni.showToast({ title: "演示注册成功", icon: "success" })
      setTimeout(() => {
        uni.navigateTo({ url: "/pages/skill/index" })
      }, 400)
      return
    }
    // 1002 验证码错误 / 1003 已过期 / 1004 未发送 / 1005 已注册 / 1007 密码格式，已提示
  }
}

function qqLogin() { uni.showToast({ title: "QQ 登录", icon: "none" }) }
function wxLogin() { uni.showToast({ title: "微信登录", icon: "none" }) }

onUnload(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>
<style scoped>
.page {
  min-height: 100vh;
  background: #faf7f2;
  padding: 0 64rpx;
  padding-top: calc(env(safe-area-inset-top) + 20rpx);
  box-sizing: border-box;
}
.nav { display: flex; align-items: center; padding: 20rpx 0 40rpx; }
.nav-back { position: absolute; left: 40rpx; width: 60rpx; height: 60rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 40rpx; color: #6b5f57; }
.nav-title { flex: 1; text-align: center; font-size: 38rpx; color: #3a3735; letter-spacing: 8rpx; margin-right: 60rpx; font-weight: 500; }
.form { margin-top: 60rpx; }
.input-group { display: flex; align-items: center; border-bottom: 2rpx solid #e3d8cd; padding: 24rpx 8rpx; margin-bottom: 40rpx; }
.input-icon { font-size: 30rpx; margin-right: 20rpx; }
.input-field { flex: 1; font-size: 30rpx; height: 40rpx; color: #3a3735; }
.placeholder { color: #c3b8ac; }
.code-btn { padding: 8rpx 20rpx; border: 2rpx solid #c0847f; border-radius: 28rpx; }
.code-btn-text { font-size: 24rpx; color: #c0847f; }
.btn-submit { margin-top: 80rpx; height: 96rpx; border-radius: 48rpx; background: #d9a29e; display: flex; align-items: center; justify-content: center; }
.btn-submit-text { font-size: 32rpx; color: #fff; letter-spacing: 8rpx; text-indent: 8rpx; }
.btn-submit:active { opacity: 0.85; }
.third { position: absolute; left: 64rpx; right: 64rpx; bottom: calc(env(safe-area-inset-bottom) + 80rpx); }
.divider { display: flex; align-items: center; }
.divider-line { flex: 1; height: 2rpx; background: #e3d8cd; }
.divider-text { font-size: 24rpx; color: #b5a99c; padding: 0 24rpx; }
.icons { display: flex; justify-content: center; gap: 60rpx; margin-top: 40rpx; }
.icon-circle { width: 88rpx; height: 88rpx; border-radius: 50%; background: #fff; border: 2rpx solid #e0d4c8; display: flex; align-items: center; justify-content: center; }
.icon-circle.placeholder { border-style: dashed; background: transparent; }
.icon-text { font-size: 32rpx; color: #8a7f74; }
.icon-circle:active { opacity: 0.85; }
</style>