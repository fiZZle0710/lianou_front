<script>
import { DEMO_MODE, TEST_ACCOUNTS } from '@/utils/config.js'
import { getToken, setToken, setUserInfo } from '@/utils/auth.js'

export default {
  onLaunch: function () {
    console.log('App Launch')
    // 主页面都是白底（广场 / 我的 / 登录首页），状态栏用深色图标才看得见
    // #ifdef APP-PLUS
    try {
      plus.navigator.setStatusBarStyle('dark')
    } catch (e) {
      /* 旧版基座不支持时忽略 */
    }
    // #endif
    // 无后端演示包：没有登录态时注入演示账号，启动页会直接进主界面。
    // DEMO_MODE=false（正常联调/正式包）时这段不执行，登录完全走真实接口。
    if (DEMO_MODE && !getToken()) {
      const demo = TEST_ACCOUNTS[0]
      if (demo) {
        setToken('demo-token-' + Date.now())
        setUserInfo({ ...demo.userInfo })
        console.log('[demo] 已注入演示登录态，接口读失败将回退 mock 数据')
      }
    }
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/*每个页面公共css */

/* 隐藏右侧滚动条（H5 预览用；App 端 scroll-view 默认无滚动条） */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
scroll-view {
  scrollbar-width: none;
}
/* 通用白色头像框：所有手写圆头像统一叠加（与 UserAvatar.vue 的 white.png 一致）。
   ::after 比容器大 12%，圆环刚好落在头像内容之外；不裁切内容、不拦截点击。 */
.avatar-ring-white { position: relative; isolation: isolate; }
.avatar-ring-white::after {
  content: '';
  position: absolute;
  top: -6%;
  left: -6%;
  width: 112%;
  height: 112%;
  box-sizing: border-box;
  border-radius: 50%;
  background: url('/static/avatar-frame/white.png') center / 100% 100% no-repeat;
  pointer-events: none;
  /* z-index 只在 isolation:isolate 建出的容器内生效：白环跟着各自头像，
     后面头像（圆+环）整体盖前面头像，不再所有白环统一浮到顶层形成螺旋 */
  z-index: 1;
}
/* 有 overflow:hidden 的容器会裁掉外扩圆环：放开裁切，并让内部内容保持正圆 */
.avatar-ring-white.ring-unclip { overflow: visible !important; }
.avatar-ring-white.ring-unclip > view,
.avatar-ring-white.ring-unclip > image,
.avatar-ring-white.ring-unclip > .avatar-img,
.avatar-ring-white.ring-unclip > .avatar-bg { border-radius: 50% !important; }
</style>
