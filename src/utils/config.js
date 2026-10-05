/**
 * 全局配置
 * 后端接口地址 / 文件地址统一在此维护，方便切换 本地/云端 环境
 *
 * 契约来源：docs/backend/API-2026-09-27.md
 *   - 基础路径：`http://{host}:8080/api/v1`
 *   - 响应包裹：`{ "code": 200, "message": "success", "data": {...} }`
 *     ⚠️ 后端 2026-09-27 答复里的 4 段 JSON 示例都写成 `"code": 0`，与文档首节及本约定不符，
 *        已列为待确认问题；/pages/dev/check 自检页会把 `code=0` 单独标成「契约不符（warn）」以便一眼定位。
 *   - 分页：`?page=1&page_size=20` → `{ total, page, page_size, total_pages, list }`
 *   - 上传：单文件，字段名 `file`，返回**相对 URL**（前端自己拼 host）
 */

// 开发/联调环境（2026-09-27 后端答复 A-1 确认：入口 `app.py` → `app.run(host='0.0.0.0', port=8080)`）
// 本地/同机：`http://localhost:8080/api/v1/{路由}`；H5 本地开发不会跨域（后端 CORS `origins: *`）
// ⚠️ 安卓真机调试时必须换成**后端电脑的局域网 IP**，例如 http://192.168.x.x:8080
// （手机上的 127.0.0.1 指的是手机自己，一定连不上后端；且手机需与后端电脑同一 WiFi，
//   后端监听 0.0.0.0 并放行 8080 端口）→ 该项**仍在等后端提供局域网 IP**
// ⚠️ 本机起后端时注意 8080 是否被占用（曾实测被 Steam 的 steamwebhelper.exe 占用）；
//    若冲突就让后端换端口启动（如 8081）再同步改这一行。
//    改完打开 /pages/dev/check 自检页可一键验证「前端到底连没连上后端」。
const DEV_BASE_URL = 'http://127.0.0.1:8080'

// 测试/生产服务器环境（后端提供地址后填这里；建议 https，可避开 Android 9+ 禁明文 HTTP 的限制）
const PROD_BASE_URL = 'http://127.0.0.1:8080'

// 👉 切换环境只改这一行：false = 用 DEV_BASE_URL，true = 用 PROD_BASE_URL
const USE_PROD = false

// 是否开启请求日志，便于联调
const DEBUG = true

// 接口失败时是否自动回退到 src/mock 假数据（后端未就绪时保证页面可用，页面上会显示「演示数据」灰标）
// 👉 联调通过后改 false = 只用真实数据，失败就报错
const DEBUG_FALLBACK = true

// 后端统一的 API 前缀
export const API_PREFIX = '/api/v1'

// 服务器根地址（**不含** /api/v1）—— 用于把后端返回的相对文件 URL 拼成可访问地址
export const SERVER_URL = USE_PROD ? PROD_BASE_URL : DEV_BASE_URL

/**
 * 接口基础地址（含 /api/v1；src/api/*.js 里只写 '/auth/login' 这样的相对路径，
 * 由 src/utils/request.js 负责拼接）
 */
export const BASE_URL = SERVER_URL + API_PREFIX

// 上传地址：三个上传接口按用途区分（文档第四节《上传接口细节》），字段名统一 `file`
export const UPLOAD_URLS = {
  works: BASE_URL + '/works/upload',
  profile: BASE_URL + '/profile/upload',
  messages: BASE_URL + '/messages/upload'
}

// 兼容写法：默认（作品）上传地址
export const UPLOAD_URL = UPLOAD_URLS.works

/**
 * ⚠️ 对接后端 —— 测试账号（2026-09-27 后端答复 A-2 提供的预置账号，需后端先跑 scripts/seed_test_data.py）
 * 密码规则：8-20 位、含字母+数字（`^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$`）
 * 另外：后端明确 `POST /auth/send-code` **始终**在 `data.dev_code` 返回验证码（无环境判断），
 *   所以也可以完全不用预置账号，自助注册任意手机号（见 /pages/dev/check 的「自助注册+登录」）。
 */
export const TEST_ACCOUNTS = [
  {
    account: '15500000001',
    password: 'Pass1234',
    userInfo: {
      id: 1,
      nickname: '艺小A',
      avatar: '',
      intro: '',
      education: '',
      career: '',
      tags: [],
      skills: [],
      level: '',
      profileCompleted: true
    }
  },
  {
    account: '15500000002',
    password: 'Pass1234',
    userInfo: {
      id: 2,
      nickname: '艺小B',
      avatar: '',
      intro: '',
      education: '',
      career: '',
      tags: [],
      skills: [],
      level: '',
      profileCompleted: true
    }
  }
]

/**
 * 本地假 token 直登总开关（登录页用）
 * ⚠️ 必须为 false：`TEST_ACCOUNTS` 现在是**真实后端账号**，若仍为 true，
 *   登录页会命中下面的本地分支、发放 `test-token-xxx` 假 token 而**根本不打后端**（接口全 401）。
 * 仅在后端完全不可用、只想看页面样式时临时改 true。
 */
export const MOCK_LOGIN_ENABLED = false

// 注册页固定测试验证码（联调过渡用；后端 dev_code 可用后应走 sendCode 返回的真实码）
export const TEST_SMS_CODE = '123456'

// 验证码倒计时秒数
export const SMS_COUNTDOWN = 60

export { DEBUG, DEBUG_FALLBACK }
