/**
 * 公共层打包自检入口：只做 import，用于让 esbuild 验证
 *   src/api/*.js 与 src/utils/*.js 的语法、import 路径（`@/` 别名）是否都正确。
 *
 * 用法：
 *   npx esbuild scripts/check-bundle.js --bundle --format=esm --alias:@=./src --outfile=.tmp-bundle.js
 */
import '../src/api/auth.js'
import '../src/api/works.js'
import '../src/api/user.js'
import '../src/api/project.js'
import '../src/api/chat.js'
import '../src/api/adapter.js'
import '../src/utils/config.js'
import '../src/utils/request.js'
import '../src/utils/fallback.js'
import '../src/utils/format.js'
import '../src/utils/fileUrl.js'
import '../src/utils/auth.js'
import '../src/utils/upload.js'
import '../src/utils/errorCodes.js'
import '../src/utils/nav.js'
