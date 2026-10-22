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
</style>
