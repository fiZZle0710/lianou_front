<template>
  <!-- 莲藕 登录页 -->
  <view class="page">
    <!-- 顶部：返回 + 标题 -->
    <view class="nav">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">登录</text>
    </view>

    <!-- 表单区 -->
    <view class="form">
      <view class="input-group">
        <text class="input-icon">📱</text>
        <input
          class="input-field"
          v-model="account"
          type="text"
          placeholder="输入手机号/账号"
          placeholder-class="placeholder"
        />
      </view>
      <view class="input-group">
        <text class="input-icon">🔒</text>
        <input
          class="input-field"
          v-model="password"
          :password="true"
          type="text"
          placeholder="输入密码"
          placeholder-class="placeholder"
        />
      </view>

      <view class="login-meta">
        <text class="meta-text" @click="forgot">忘记密码</text>
        <text class="meta-text link" @click="quick">免密登录</text>
      </view>

      <view class="btn-submit" @click="doLogin">
        <text class="btn-submit-text">登录</text>
      </view>
    </view>

    <!-- 第三方登录 -->
    <view class="third">
      <view class="divider">
        <view class="divider-line"></view>
        <text class="divider-text">第三方登录</text>
        <view class="divider-line"></view>
      </view>
      <view class="icons">
        <view class="icon-circle" @click="qqLogin">
          <text class="icon-text">Q</text>
        </view>
        <view class="icon-circle" @click="wxLogin">
          <text class="icon-text">微</text>
        </view>
        <view class="icon-circle placeholder">
          <text class="icon-text">＋</text>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref } from "vue"
import { TEST_ACCOUNTS, DEBUG_FALLBACK, MOCK_LOGIN_ENABLED } from "@/utils/config.js"
import { setToken, setUserInfo, getUserInfo } from "@/utils/auth.js"
import { login } from "@/api/auth.js"

const account = ref("")
const password = ref("")

function goBack() {
  uni.navigateBack()
}
function forgot() {
  uni.showToast({ title: "忘记密码", icon: "none" })
}
function quick() {
  uni.showToast({ title: "免密登录", icon: "none" })
}

// 进入主界面：新注册 / 资料未完善的用户先走擅长-专业选择，否则直接进广场
function goMain(isNewUser) {
  const info = getUserInfo()
  if (isNewUser === true || (info && info.profileCompleted === false)) {
    uni.reLaunch({ url: "/pages/skill/index" })
  } else {
    uni.reLaunch({ url: "/pages/square/index" })
  }
}

async function doLogin() {
  const acc = (account.value || "").trim()
  const pwd = password.value || ""

  // ===== 前端校验（与后端规则对齐：手机号 ^1[3-9]\d{9}$、密码 8-20 位含字母+数字）=====
  if (!acc) {
    uni.showToast({ title: "请输入手机号/账号", icon: "none" })
    return
  }
  if (/^\d+$/.test(acc)) {
    if (acc.length !== 11) {
      uni.showToast({ title: "请输入 11 位手机号", icon: "none" })
      return
    }
  } else if (acc.length < 3) {
    uni.showToast({ title: "账号长度不正确", icon: "none" })
    return
  }
  if (pwd.length < 6) {
    uni.showToast({ title: "密码至少 6 位", icon: "none" })
    return
  }

  // ① 联调过渡期：本地测试账号直登 —— 仅在 DEBUG_FALLBACK 与 MOCK_LOGIN_ENABLED **同时**为 true 时生效。
  //    ⚠️ MOCK_LOGIN_ENABLED 默认 false：TEST_ACCOUNTS 已是后端真实账号（15500000001/Pass1234），
  //    若这里生效会发假 token、根本不打后端，导致所有接口 401。
  if (DEBUG_FALLBACK && MOCK_LOGIN_ENABLED) {
    const test = TEST_ACCOUNTS.find((t) => t.account === acc && t.password === pwd)
    if (test) {
      setToken("test-token-" + Date.now())
      setUserInfo({ ...test.userInfo })
      uni.showToast({ title: "演示登录成功", icon: "success" })
      setTimeout(goMain, 400)
      return
    }
  }

  // ② 真实登录：1.3 POST /auth/login（成功后 auth.js 已写入 token + user）
  //    错误码 1006 手机号或密码错误、1001 手机号格式 由 request 层弹提示
  uni.showLoading({ title: "登录中...", mask: true })
  try {
    const res = await login(acc, pwd)
    uni.hideLoading()
    uni.showToast({ title: "登录成功", icon: "success" })
    setTimeout(() => goMain(res && res.is_new_user), 400)
  } catch (err) {
    uni.hideLoading()
  }
}

function qqLogin() {
  uni.showToast({ title: "QQ 登录", icon: "none" })
}
function wxLogin() {
  uni.showToast({ title: "微信登录", icon: "none" })
}
</script>
<style scoped>
.page {
  min-height: 100vh;
  background: #faf7f2;
  padding: 0 64rpx;
  padding-top: calc(env(safe-area-inset-top) + 20rpx);
  box-sizing: border-box;
}
.nav {
  display: flex;
  align-items: center;
  padding: 20rpx 0 40rpx;
}
.nav-back {
  position: absolute;
  left: 40rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-icon {
  font-size: 40rpx;
  color: #6b5f57;
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 38rpx;
  color: #3a3735;
  letter-spacing: 8rpx;
  margin-right: 60rpx;
  font-weight: 500;
}
.form {
  margin-top: 60rpx;
}
.input-group {
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #e3d8cd;
  padding: 24rpx 8rpx;
  margin-bottom: 40rpx;
}
.input-icon {
  font-size: 30rpx;
  margin-right: 20rpx;
}
.input-field {
  flex: 1;
  font-size: 30rpx;
  height: 40rpx;
  color: #3a3735;
}
.placeholder {
  color: #c3b8ac;
}
.login-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8rpx;
}
.meta-text {
  font-size: 24rpx;
  color: #a99f96;
}
.meta-text.link {
  color: #c0847f;
}
.btn-submit {
  margin-top: 80rpx;
  height: 96rpx;
  border-radius: 48rpx;
  background: #d9a29e;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-submit-text {
  font-size: 32rpx;
  color: #fff;
  letter-spacing: 8rpx;
  text-indent: 8rpx;
}
.btn-submit:active {
  opacity: 0.85;
}
.third {
  position: absolute;
  left: 64rpx;
  right: 64rpx;
  bottom: calc(env(safe-area-inset-bottom) + 80rpx);
}
.divider {
  display: flex;
  align-items: center;
}
.divider-line {
  flex: 1;
  height: 2rpx;
  background: #e3d8cd;
}
.divider-text {
  font-size: 24rpx;
  color: #b5a99c;
  padding: 0 24rpx;
}
.icons {
  display: flex;
  justify-content: center;
  gap: 60rpx;
  margin-top: 40rpx;
}
.icon-circle {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #fff;
  border: 2rpx solid #e0d4c8;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-circle.placeholder {
  border-style: dashed;
  background: transparent;
}
.icon-text {
  font-size: 32rpx;
  color: #8a7f74;
}
.icon-circle:active {
  opacity: 0.85;
}
</style>