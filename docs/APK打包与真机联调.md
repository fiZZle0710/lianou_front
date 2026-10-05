# APK 打包与真机联调

> 适用范围：`my-app-new`（uni-app Vue3 CLI 工程）→ Android APK
> 相关文档：`新人上手.md`（一页纸入门：工具栈 / 必备知识 / 打包流程 / 排错表）、`前端联调对照.md`、`给后端的功能缺口清单.md`

## 一、应用信息（已写入 `src/manifest.json`）

| 项 | 值 | 说明 |
| --- | --- | --- |
| 应用名称 | 莲藕 | `manifest.json` → `name`，与启动页 `pages/launch/index.vue` 的文案一致 |
| AppID | `__UNI__F1A3968` | DCloud 平台分配，云打包必需 |
| 包名 | `com.lianou.app` | `app-plus.distribute.android.packagename`，上架后不可随意更改 |
| 版本 | versionName 1.0.0 / versionCode 100 | 每次发版需递增 versionCode |
| 图标母版 | `lianou.jpg`（1280×1280，工程根目录） | 根目录文件不会打进 APK |
| 图标产物 | `src/static/app-icon/icon-{72,96,144,192}.png` | 由母版缩放，分别对应 hdpi/xhdpi/xxhdpi/xxxhdpi |

**改图标**：替换根目录 `lianou.jpg`（正方形，≥192×192），重新生成 4 个 PNG 后覆盖 `src/static/app-icon/`。

## 二、AppID 申请（备查）

1. 打开 https://dev.dcloud.net.cn/ ，注册账号（邮箱注册 + 邮件验证）
2. 进入「应用管理」→「我的应用」→「创建应用」
3. 应用名称填「莲藕」，**应用类型必须选 `uni-app`**（选成 5+App 等 uni-app 云打包不认）
4. 创建完成后列表中显示 AppID（形如 `__UNI__F1A3968`），复制
5. HBuilderX 中双击 `src/manifest.json` → 基础配置 → 填入「应用标识(AppID)」
   - 或直接点可视化界面的「重新获取 appid」，登录后自动回填

**云打包的两条硬性前提（缺一不可；不满足时 HBuilderX 界面常常"点了没反应"，看不到任何提示）**：

1. **账号必须绑定手机号** —— 打开 https://dev.dcloud.net.cn/pages/user/info 绑定（需短信验证）。
   未绑定时云端直接返回：`[Error] 当前账号 xxx 尚未绑定手机号，请绑定手机号后再重新打包`。
2. **不要用「公共测试证书」** —— DCloud 已停用：`[Error] Android公共测试证书存在安全隐患，新应用不再支持使用此证书提交打包。推荐使用云端证书`。
   请改用 **云端证书**（免自己 keytool，DCloud 自动生成并托管，免费）。

## 三、打包前置（本机环境）

- HBuilderX 5.24 **已安装**：`D:\HBuilderX`（标准版；App 相关插件会在首次使用打包功能时自动下载，**下载完必须重启 HBuilderX** 菜单才完整生效）
- 本机**无独立 JDK / Android SDK**（HBuilderX 自带 JDK 17：`D:\HBuilderX\plugins\amazon-corretto`），因此走 **HBuilderX 云打包**路线（不需要 JDK 与 SDK）

CLI 侧已配置：

```bash
npm run build:app     # uni build -p app，产出 app 平台资源，可用于验证编译无错
```

> `npm run build`（= build:h5）只出 H5，**不能出 APK**。官方明确：发布 App 必须使用 HBuilderX，其他开发工具无法发布。

**已实测 `npm run build:app` 通过**：

```
> uni-preset-vue@0.0.0 build:app
> uni build -p app
Compiler version: 5.15（vue3）
Compiling...
DONE  Build complete.
Run method: open HBuilderX, import dist\build\app run.
```

产物在 `dist/build/app/`，生成的 `manifest.json` 已正确带上：`id = __UNI__F1A3968`、`name = 莲藕`、`version 1.0.0 / code 100`、`distribute.icons.android` 四个图标路径、`distribute.google.packagename = com.lianou.app`；`static/app-icon/*.png` 四个图标文件也已一并复制。

## 四、打包路线（三条，推荐 C）

### 路线 A：CLI 先构建，HBuilderX 导入 `dist/build/app`（官方 CLI 提示的方式）

```bash
npm run build:app          # 产出 dist/build/app
```

1. 下载 **HBuilderX App 开发版**（绿色版解压即用，无需 JDK / Android SDK）
2. 打开 HBuilderX，**登录 DCloud 账号**（云打包强制登录）
3. **文件 → 打开目录**，选择 `d:\Data\app_project\my-app-new\dist\build\app`
4. 确认打开后 `manifest.json` 中应用名称「莲藕」、AppID `__UNI__F1A3968` 正确、图标已显示
5. **发行 → 原生App-云打包** → 平台选 Android → 包名 `com.lianou.app` → 证书选 **云端证书（推荐）**
   - ⚠️ 不要选「公共测试证书」，已被 DCloud 停用，会直接报错（见第二节）
   - 云端证书由 DCloud 自动生成并托管，无需自己 `keytool`；首次使用若提示"云端证书生成中"，稍等 1–2 分钟重试
6. 等待 **2–5 分钟**（免费队列高峰可达 30 分钟以上），控制台输出打包结果并给出 APK 下载地址。注意该地址是**不带 `.apk` 后缀、只能下载 5 次的临时链接**（形如 `https://app.liuyingyong.cn/build/download/<uuid>`），且 HBuilderX **不一定**自动下载（本次实测就没有），务必尽快手动下载保存
7. 装到手机，用测试账号登录验收

### 路线 B：HBuilderX 直接打开工程根目录

把 `d:\Data\app_project\my-app-new` **整个拖入** HBuilderX（自动识别为 CLI 工程，HBuilderX 会调用工程内脚本，`dev:app` / `build:app` 已在 `package.json` 中补齐）。

- 优点：可以**运行 → 运行到手机或模拟器 → 运行到 Android App 基座**做真机调试（打包前强烈建议先走这一步，手机需开 USB 调试）
- 后续发行步骤与路线 A 的第 5–7 步相同

> **每次改动源码后都必须重新 `npm run build:app`**，路线 A 打开的 `dist/build/app` 是构建产物而不是源码。

### 路线 C：命令行一键云打包（**已实测可用**，最省事）

HBuilderX 自带命令行工具 `D:\HBuilderX\cli.exe`，可直接从命令行提交云打包，不需要在界面里点。
工程内已封装好脚本与 npm 命令：

```bash
npm run pack:app -- -Open     # 0) 先启动 HBuilderX（cli 检测不到它在运行就根本不提交任务，见下方 ⚠️）
npm run build:app             # 1) 源码有改动时先重新构建
npm run pack:app              # 2) 提交云打包（默认云端证书，包名 com.lianou.app）
npm run watch:pack -- -OutDir release      # 3) 盯进度，出包后自动下载到 dist 之外的 release\（日志 %TEMP%\pack-watch.log）
npm run pack:app -- -Status   # 查打包状态（会显示队列位次与预计时间）
npm run pack:app -- -Cancel   # 取消打包任务
```

脚本位置：`scripts/pack-android.ps1`（提交）、`scripts/watch-pack.ps1`（盯进度，可选 `-IntervalSec 30 -TimeoutMin 120`）。
`watch:pack` 可以丢在后台跑：它每 45 秒查一次状态，遇到"打包成功"就抓下载链接下载 APK 并写 `DONE`；也可以自己看日志：
`Get-Content "$env:TEMP\pack-watch.log" -Wait`。

⚠️ **`pack:app` 最常见的失败原因是「HBuilderX 没开」**：cli 只会打印一句
`未检测到已打开的HBuilderX，请先执行cli open启动HBuilderX后再重试`，**任务根本没提交**（旧版脚本把这句话当成功、误报「已提交」，09-18 已修：现在红字报错并 `exit 1`）。先 `npm run pack:app -- -Open`。

⚠️ **APK 要下载到 `dist\build\app` 之外**：`dist\build\app\unpackage\release\apk\` 会被下一次 `npm run build:app` **清空删除**（09-18 实测丢掉了 09-16 的包，回收站里也没有），所以固定用 `npm run watch:pack -- -OutDir release`（相对工程根目录，即 `d:\Data\app_project\my-app-new\release\`）；`-OutDir` 不传时仍默认工程内路径（兼容旧用法）。

`npm run pack:app` 等价于下面这条命令：

```powershell
D:\HBuilderX\cli.exe pack --project "D:\Data\app_project\my-app-new\dist\build\app" `
  --platform android --android.packagename com.lianou.app --android.androidpacktype 3
```

参数速查（`cli pack --help` 可看全量）：

| 参数 | 说明 |
| --- | --- |
| `--project` | **HBuilderX 中已导入项目**的绝对路径（当前是 `dist\build\app`） |
| `--platform` | `android` / `ios`，默认 android |
| `--android.packagename` | Android 包名，打 Android 必填 |
| `--android.androidpacktype` | `3`=云端证书(推荐) / `0`=自有证书 / `1`=公共测试证书(已停用) |
| `--android.certfile` `--android.certalias` `--android.certpassword` `--android.storepassword` | 仅 `packtype 0` 自有证书时需要 |

> 命令行报错比界面更清楚，是排查"点打包没反应"的首选手段。实测未绑手机号时的原始返回：
> `[Error] 当前账号 54748633@qq.com 尚未绑定手机号，请绑定手机号后再重新打包`。

> **排队是常态：提交成功 ≠ 打完。** 实测 22:37 提交后一直显示"队列中"，`--Status` 才给出细节：
> `目前云打包排队人数较多，当前打包任务位于队列第 147 位，预计 33 分钟内进入打包状态`。
> 免费队列高峰时段可能要等半小时以上；提示里会附 DCloud 的「**付费独享打包机**」加速链接（按次收费，1 分钟内进入打包）。
>
> ⚠️ **不要在排队期间取消重提**：`--Cancel` 再重新提交会**丢失已排的位次**（实测从"已排 28 分钟"变成"重新排到第 147 位"）。云端提示原文也是"不要反复打包"。
> 只有任务真的卡死（例如提交它的客户端进程被意外结束）才需要取消重提。
> 出包后 CLI 会打印下载地址。**务必第一时间拉回本地**：`打包成功：… 下载地址: https://app.liuyingyong.cn/build/download/<uuid>`。
> 该地址**不带 `.apk` 后缀、且是临时地址，只能下载 5 次**（云端原文提示）；本次实测 HBuilderX **没有**自动下载到工程目录，是手动拉的。
> `watch:pack` 已支持识别这种"`下载地址: URL`"格式并自动下载（早期版本按 `.apk` 后缀匹配，会漏掉该格式，已修）。
> 09-18 又补了三个漏洞：① 见到「打包成功」后即使状态输出里暂时没有链接也**不再收工**，继续轮询直到抓到地址（09-16 就是因此在成功瞬间没收工、也没抓到链接，只能第二天手动下载）；② 增加 `app.liuyingyong.cn/…/download/…` 这类**不带 `.apk` 后缀**链接的兜底匹配；③ 只认本次监听开始后新出现的 APK，避免 `-OutDir` 里的旧包让它误判「已出包」。
> 拿到地址后会自动下载到 `-OutDir`（本工程固定用 `release`，即工程根目录下的 `release\`），并打印 `DONE` 与文件大小。

**本次出包实录（2026-09-16 → 09-17）**

| 步骤 | 时间 | 结果 |
| --- | --- | --- |
| `npm run pack:app` 提交 | 23:05:32 | 提交成功，进入免费队列（第 147 位，预计 33 分钟） |
| 进入打包 | 约 23:36 | `正在云端打包`，预计 2–5 分钟 |
| 打包成功 | 23:38:30 | `打包成功` + 临时下载地址 |
| 下载 APK | 09-17 07:34 | `dist\build\app\unpackage\release\apk\lianou-com.lianou.app-20260916.apk`（14.29 MB） |
| APK 指纹 | — | SHA256 `f9c5ce3e1ab04454e473e58633c2973640b82cc303d7c515b86e77432c481b87`（交接/校验用） |

> ⚠️ **上面这个 APK 已经不存在了**：`dist\build\app` 是 `npm run build:app` 的输出目录，**构建时会先清空整个目录**，于是 `unpackage\release\apk\` 里的 APK 被一并删除（09-18 重新构建产物时实测删除，且**不进回收站、无法恢复**）。
> **规矩**：出包/下载后第一时间把 APK **复制到 `dist\build\app` 之外**（例如工程根目录 `release\`），再动源码或重新构建。

**本次出包实录（2026-09-18，版本统一到 5.24 后重打）**

| 步骤 | 时间 | 结果 |
| --- | --- | --- |
| 启动 HBuilderX | 16:47 | `npm run pack:app -- -Open`（旧脚本不会做这步，会静默不提交） |
| `npm run build:app` | 16:50 | banner `Compiler version: 5.24（vue3）`，产物 `manifest.json` 的 `compilerVersion = 5.24` |
| `npm run check:version` | 16:50 | 编译器 / HBuilderX / 产物 三处全 `[ OK ]` |
| `npm run pack:app` 提交 | 16:51:01 | 提交成功，免费队列第 206 位 |
| 进入打包 | 17:02:59 | `正在云端打包` |
| 打包成功 | 17:03:48 | `打包成功` + 临时下载地址（uuid `1ed6bc80-…`） |
| 自动下载 | 17:04:44 | **`release\lianou-0918-1703.apk`**（14.29 MB）——`watch:pack -OutDir release` 全程自动，只消耗 5 次下载额度中的 1 次 |
| APK 指纹 | — | SHA256 `83FB0B487D46DE75ED8FEB6886DB567A2B87157CA4BD1686C721D806DA1ACEF6` |

新 APK 自检（版本提示是否已修掉，直接读包验证）：

| 检查项 | 结果 |
| --- | --- |
| APK 内 `assets/apps/__UNI__F1A3968/www/manifest.json` | `compilerVersion: 5.24`、`control: uni-v3`、`vueVersion: 3` ✅（旧包此处是 `5.15`，正是弹窗的根源；与手机端 5.24 一致后提示不再出现） |
| 运行时引擎 | APK 内 `assets/data/dcloud_control.xml` → `hbuilder version="1.9.9.82669"`、`appid="__UNI__F1A3968"`、`appver="1.0.0"` |
| CPU 架构 | 仅 `arm64-v8a`（真机可用；x86 模拟器装不了） |
| 体积 / 出包时间 | 14.29 MB / 2026-09-18 17:04（与 09-16 那版体积相同，属正常） |


APK 自检（逐项对得上）：

| 检查项 | 结果 |
| --- | --- |
| 文件头 / ZIP 结构 | `50 4B 03 04`，共 859 个条目 |
| 包名 | `com.lianou.app`（manifest 字符串池是 UTF-16LE，用 UTF-8 直接搜会搜不到，属正常） |
| 应用名 / AppID | `莲藕` / `__UNI__F1A3968` |
| CPU 架构 | 仅 `arm64-v8a`（真机够用；模拟器需 x86，需另行勾选） |
| 签名 | v1（`META-INF/CERT.SF`+`CERT.RSA`+`MANIFEST.MF`）+ v2（`APK Sig Block 42`）→ 可正常安装 |

**正式上架换自有证书**：当前 HBuilderX 自带的是 **JDK 17**，用它生成 keystore 需显式指定 `-storetype JKS`（且 SHA1 签名在新 JDK 上受限）。
没有 JRE8 时，**优先用云端证书**；确需自有证书时再单独装 JRE8 生成（老版 JDK 生成的证书云打包兼容性最好）。

## 五、装机后如何登录（当前阶段）

登录页有本地测试账号兜底（`src/pages/login/index.vue`，后端就绪后删除该分支）：

| 账号 | 密码 |
| --- | --- |
| 13700000000 | 123456 |

配置位置：`src/utils/config.js` → `TEST_ACCOUNTS`。

## 六、真机连后端的 3 个坑

1. **`127.0.0.1` 必然失败**：手机上的 127.0.0.1 指手机自己。必须改成后端电脑的局域网 IP（`src/utils/config.js` 的 `DEV_BASE_URL`），或写成 `USE_PROD = true` 用 `PROD_BASE_URL`（测试/正式环境地址）。切换环境只改 `USE_PROD` 一行。
2. **明文 HTTP**：Android 9+ 默认限制 `http://`。云打包的 `app-plus.distribute.android` 字段表中**没有** `usesCleartextTraffic` 开关（只有 packagename / keystore / permissions / abiFilters / minSdkVersion / targetSdkVersion / aaptOptions 等）。若装机后所有请求均失败，优先怀疑此项，解决办法是让后端起 https 或提供带域名的测试地址。
3. **局域网可达性**：后端需监听 `0.0.0.0`，手机与后端电脑连同一 WiFi，Windows 防火墙放行对应端口（如 8080）。

补充：APK 内不是浏览器环境，**不受 CORS 同源策略限制**；但 H5 调试（`npm run dev:h5`）会受 CORS 影响。

## 七、已发现、待联调修复的问题（不影响打包出包）

1. **接口路径全不匹配**：`src/api/*.js` 用的是 `/api/login`、`/api/logout`、`/api/user/me`、`/api/works/list`、`/api/works/detail` 等占位路径，而后端文档为 `/api/v1/auth/login`、`/api/v1/works/...`；且 `BASE_URL` 不含 `/api/v1` 前缀。联调前需统一重写（4 个文件：`user.js` / `works.js` / `project.js` / `chat.js`）。
2. **上传链路未接**：`src/utils/upload.js` 默认打 `/api/upload`（错误），且当前无任何页面调用；后端 3 个上传接口为 `/api/v1/works/upload`、`/api/v1/profile/upload`、`/api/v1/messages/upload`，契约**已由 09-15 版文档补全**（字段名 `file`、`folder` 取值、大小限制、三种返回结构，见 `docs/backend/API-2026-09-15.md` 第四节）。
3. **未处理 Android 9+ 明文 HTTP**（见第六节第 2 条）。

## 八、编译端 / 运行端版本必须一致（重要）

**症状**：装好 APK（或基座）启动时弹提示：

> 本应用使用HBuilderX 5.15 或对应的cli版本编译，而手机端SDK版本是 5.24。不匹配的版本可能造成应用异常。

**原因**：App 的 JS 资源由「编译器」编译，跑在「运行时（HBuilderX 的 SDK / 云打包机 / 基座）」上，**两者版本必须相同**。这句话里的第一个版本号来自产物 manifest，第二个来自手机端 SDK。

| 版本 | 来源（本项目实际取值） |
| --- | --- |
| 编译器（cli） | `node_modules\@dcloudio\vite-plugin-uni\package.json` → `"uni-app".compilerVersion`；由 `package.json` 里 `@dcloudio/*` 共 20 处版本号决定 |
| HBuilderX / 运行时 | `D:\HBuilderX\ReleaseNote.md` 首行（`## 5.24.2026081301`）；基座与云打包 SDK 同源，可看基座包 `assets/data/dcloud_control.xml` 里的 `appver`（`15.24` = 5.24） |
| 产物里写死的编译版本 | `dist\build\app\manifest.json` → `plus["uni-app"].compilerVersion`（会随资源一起打进 APK） |

**npm 版本号 → HBuilderX 版本对照**（格式 `3.0.0-<大版本><2位minor><2位patch><8位日期><3位序号>`）：

| `@dcloudio/*` 版本 | 对应 HBuilderX |
| --- | --- |
| `3.0.0-5010520260709002` | 5.15（2026-07-09）—— 统一前的旧值 |
| `3.0.0-5020420260813003` | **5.24（2026-08-13）← 当前值，与本机 HBuilderX 5.24.2026081301 完全对应** |
| `3.0.0-5020620260917001` | 5.26（2026-09-17，npm `vue3` tag） |

**校验（换机器、改依赖、打包前先跑）**：

```bash
npm run check:version
```

三项全 `[ OK ]` 才打包；`npm run build:app` 的 banner（`Compiler version: 5.24（vue3）`）与产物 `manifest.json` 的 `compilerVersion` 也必须同为 5.24。

**统一版本的两条路**：

1. **升级 CLI 编译器（推荐，工程内一处改完）**：

   ```bash
   npx @dcloudio/uvm@latest 5.24.2026081301 --manager npm   # 官方工具，自动解析到 3.0.0-5020420260813003
   # 或手工：把 package.json 里全部 20 处 @dcloudio/* 改成 3.0.0-5020420260813003 后 npm install
   npm run build:app && npm run check:version
   ```

   - ⚠️ 手工改时必须**整组一起改**：DCloud 各子包在同一构建号下互相**精确依赖**，漏改一个就 `ETARGET No matching version found`（实测 `uni-mp-alipay` / `uni-cloud` 在 `...0813001` 下就不全，`...0813003` 才齐）。
   - ⚠️ `npm install` **不要加 `--prefer-offline`**：会命中过期的 packument，误报「某版本不存在」，去掉后即可正常装（实测 21s 装完 35 个包）。
2. **让 HBuilderX 用自带编译器出包**：把 **`src` 目录**（不是整个工程）拖进 HBuilderX。整工程拖入走的仍是项目下的编译器，解决不了问题（官方文档明确区分这两种拖法）。

**「能不能忽略继续测」**：提示措辞是「**可能造成应用异常**」，**不阻断启动**，点掉可以继续；但跨版本可能出现白屏、API 不生效、样式/生命周期差异，**不能用它下验收结论**，正式验收前必须同版本重打。

**顺带：模拟器上装不上我们的包**。云打包 APK 默认只含 `arm64-v8a`（见第四节 APK 自检表），x86_64 的 Pixel 4 模拟器上装的其实是 HBuilderX **标准基座**（`D:\HBuilderX\plugins\launcher\base\android_base.apk`，含 `arm64-v8a`/`armeabi-v7a`/`x86`，`appver="15.24"`）。确认装了哪个包：

```bash
adb shell pm list packages | findstr lianou   # 出现 com.lianou.app 才是我们的包；HBuilder 是基座
```

要在模拟器上跑真包，需给 `manifest.json` → `app-plus.distribute.android` 增加 `abiFilters` 并勾上 `x86`（**仅测试包**，正式包保持 arm64）。

## 九、待办

- [x] HBuilderX 已安装（`D:\HBuilderX` 5.24）并已打开 `d:\Data\app_project\my-app-new\dist\build\app`
- [x] App 打包插件已自动装好（`launcher` / `app-safe-pack` 等）
- [x] **绑定 DCloud 账号手机号**（https://dev.dcloud.net.cn/pages/user/info）→ 已绑定，重新提交时手机号报错已消失
- [x] 云打包出 APK（`npm run pack:app`，证书选云端证书）→ 09-16 23:38 打包成功，APK 曾下载到 `dist\build\app\unpackage\release\apk\`（**该文件已被 09-18 的 `npm run build:app` 清空删除、不可恢复**；替代包见下一行）
- [x] **编译器版本与 HBuilderX 统一到 5.24**：`package.json` 里 20 处 `@dcloudio/*` 由 `3.0.0-5010520260709002`（5.15）改为 `3.0.0-5020420260813003`（5.24），09-18 重装依赖并重建产物，`npm run check:version` 三项 `OK` → 修掉启动时「HBuilderX 5.15 编译 vs 手机端 SDK 5.24」提示
- [x] **重打包**：09-18 17:03:48 云端打包成功，17:04:44 由 `watch:pack` 自动下载为 **`release\lianou-0918-1703.apk`**（14.29 MB，SHA256 `83FB0B48…ACEF6`；包内 `compilerVersion = 5.24`，已在 `dist` 之外，构建不会清掉）
- [ ] **装机验收**：安装 `release\lianou-0918-1703.apk`，用 **13700000000 / 123456** 登录（走登录页 `TEST_ACCOUNTS` 兜底分支），确认启动**不再弹**版本不匹配提示
- [ ] 确认测试机上装的是 `com.lianou.app` 而不是 HBuilderX 标准基座（本机 **adb 未安装**，装好 Android 平台工具后跑 `adb shell pm list packages | findstr lianou`）；如需在 x86 模拟器跑真包，临时给 `abiFilters` 加 `x86`
- [ ] 包名 `com.lianou.app` 在开发者中心「应用详情 → 各平台信息」录入（正式包需要，测试包会自动注册）
- [ ] 运行到 Android 基座，确认界面无白屏、可用测试账号登录
- [ ] 后端给出可访问地址后，填入 `config.js` 的 `PROD_BASE_URL` 并把 `USE_PROD` 置为 `true`
- [ ] 联调开始时重写 `src/api/*.js` 路径、接通上传链路
