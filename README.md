# 莲藕（lianou）前端工程

uni-app + Vue 3 跨端前端工程，一套代码出 **Android App / H5 / 各平台小程序**。
安卓壳与签名由 **DCloud 云打包**完成 —— 本机不需要 Android Studio、独立 JDK 或 Gradle。

> 新人请先读 **[`docs/新人上手.md`](docs/新人上手.md)**（一页纸入门：用什么、学什么、怎么出包）。

## 技术栈

| 层 | 工具 / 版本 |
| --- | --- |
| 框架 | Vue 3.4（SFC + 组合式 API）、SCSS |
| 跨端 | uni-app `@dcloudio/* = 3.0.0-5020420260813003`（对应 HBuilderX 5.24） |
| 构建 | Vite 5.2.8 + `@dcloudio/vite-plugin-uni` + Rollup 4.14.3 |
| 运行时 | Node.js 18+（本机实测 v24.18.0 / npm 11.16.0） |
| 打包发行 | HBuilderX 5.24（默认装在 `D:\HBuilderX`）+ DCloud 云打包 |
| 自动化 | PowerShell 5.1（`scripts/*.ps1`） |

## 快速开始

```powershell
npm install                 # ⚠️ 不要加 --prefer-offline，会命中过期缓存误报「版本不存在」
npm run dev:h5              # 浏览器开发调试 → http://127.0.0.1:5173（最快）
```

真机调试需另开 HBuilderX：「运行 → 运行到手机或模拟器」（`npm run dev:app`）。

## 常用命令

| 目的 | 命令 |
| --- | --- |
| 浏览器里开发调试 | `npm run dev:h5` → `http://127.0.0.1:5173` |
| 真机 / 模拟器调试 | `npm run dev:app` + HBuilderX「运行到手机或模拟器」 |
| 编译 App 资源（打包前置） | `npm run build:app` → `dist/build/app/` |
| 校验版本一致性 | `npm run check:version` |
| 启动 HBuilderX | `npm run pack:app -- -Open` |
| 提交云打包 | `npm run pack:app` |
| 盯进度并自动下载 APK | `npm run watch:pack -- -OutDir release` |
| 出 H5 网页版 | `npm run build:h5` → `dist/build/h5/` |
| 出微信小程序 | `npm run build:mp-weixin` → 用微信开发者工具导入 `dist/build/mp-weixin/` |

## 目录结构

| 路径 | 作用 |
| --- | --- |
| `src/pages.json` | 页面路由 + 全局样式。**新增页面必须在这里登记** |
| `src/manifest.json` | 应用配置：AppID、包名 `com.lianou.app`、版本、图标、权限 |
| `src/static/app-icon/` | **APK 图标产物**：4 档 PNG（`manifest.json` → `app-plus.distribute.icons` 声明，路径相对 `src/`） |
| `src/assets/app-icon/` | 图标 1280 母版 `lianou-master-1280.jpg`。**只作缩放源，不进任何端包体**（只有 `static/` 会被整体复制） |
| `logs/` | dev 运行日志（已 gitignore） |
| `src/App.vue` / `src/main.js` | 全局入口 |
| `src/utils/config.js` | 环境地址开关（`USE_PROD` / `DEV_BASE_URL` / `PROD_BASE_URL`） |
| `src/utils/request.js`、`src/api/*.js` | 请求封装 / 接口函数 |
| `src/components/` | 公共组件（底部导航为自绘组件 `common/CustomTabbar.vue`，不在 `tabBar` 里） |
| `src/mock/` | 后端未就绪时的假数据回退 |
| `scripts/*.ps1` | 打包、盯进度、版本校验三个脚本 |
| `docs/` | 项目文档 |
| `dist/build/app/` | `npm run build:app` 的产物（⚠️ 每次构建**先清空**；已 gitignore） |
| `release/` | **APK 存放处**（构建不会动它；已 gitignore，不进版本库） |

## 出 APK 标准流程

```powershell
npm run pack:app -- -Open                     # 0) 先启动 HBuilderX（不开会静默不提交任务）
npm run build:app                             # 1) 源码 → dist/build/app（⚠️ 会清空该目录）
npm run check:version                         # 2) 三处版本一致才继续（必须全 [ OK ]）
npm run pack:app                              # 3) 提交云打包（免费队列，高峰要等半小时+）
npm run watch:pack -- -OutDir release         # 4) 盯队列，出包自动下载到 release\
```

实测提交到出包约 **12 分钟**（含排队）。细节见 [`docs/APK打包与真机联调.md`](docs/APK打包与真机联调.md)。

## 三条硬规矩

1. **编译器版本必须等于 HBuilderX 版本**，否则 App 启动弹「版本不匹配」→ 打包前先 `npm run check:version`。
2. **`npm run build:app` 会清空 `dist/build/app`**，放在里面的 APK 会被删且不可恢复 → **APK 一律放 `release\`**。
3. **打包前 HBuilderX 必须在运行**，否则任务静默不提交 → 先 `npm run pack:app -- -Open`。

## 文档索引

| 文档 | 内容 |
| --- | --- |
| [`docs/新人上手.md`](docs/新人上手.md) | 一页纸入门：工具、知识、出包流程、排错表 |
| [`docs/APK打包与真机联调.md`](docs/APK打包与真机联调.md) | 打包路线、真机联调、版本一致性详解 |
| [`docs/前端联调对照.md`](docs/前端联调对照.md) | 与后端的接口联调对照 |
| [`docs/给后端的接口问题清单.md`](docs/给后端的接口问题清单.md) | 待后端确认的接口问题 |
| [`docs/给后端的功能缺口清单.md`](docs/给后端的功能缺口清单.md) | 待后端补齐的功能缺口 |
| `docs/backend/` | 后端 API / 数据库文档 |

## 注意事项

- **签名证书不要入库**：`pack-android.ps1 -Cert 0` 使用自有证书时，keystore 放 `certs\`，该目录已加入 `.gitignore`。
- **测试账号**集中在 `src/utils/config.js` 的 `TEST_ACCOUNTS`，仅用于联调。
- 当前是**测试包**（云端证书、`versionCode 100`、接口地址为本地/测试环境）；正式发版需换正式证书、递增 versionCode，并把 `config.js` 切到 `USE_PROD = true`。
