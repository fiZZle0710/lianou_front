/**
 * SFC 编译自检：逐个检查 .vue（script setup + template + style）能否编译
 *
 * 用法（可一次传多个文件）：
 *   node scripts/check-vue.cjs src/pages/square/index.vue src/pages/dev/check.vue
 *   （PowerShell 不展开 glob，需要自己列出文件）
 *
 * 退出码：0 = 全部通过；1 = 有文件编译失败；2 = 参数缺失
 */
const fs = require('fs')
const { parse, compileScript, compileTemplate, compileStyle } = require('@vue/compiler-sfc')

const files = process.argv.slice(2)
if (!files.length) {
  console.error('用法: node scripts/check-vue.cjs <file.vue> [more.vue ...]')
  process.exit(2)
}

let failed = 0

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error('✗ 文件不存在: ' + file)
    failed++
    continue
  }

  const source = fs.readFileSync(file, 'utf8')
  const { descriptor, errors } = parse(source, { filename: file })
  if (errors && errors.length) {
    console.error('✗ ' + file + ' parse errors: ' + errors.map((e) => e.message).join('; '))
    failed++
    continue
  }

  const id = 'check'
  let bindings = {}
  try {
    if (descriptor.scriptSetup || descriptor.script) {
      bindings = compileScript(descriptor, { id }).bindings || {}
    }
  } catch (e) {
    console.error('✗ ' + file + ' script compile error: ' + e.message)
    failed++
    continue
  }

  if (descriptor.template) {
    const tpl = compileTemplate({
      source: descriptor.template.content,
      filename: file,
      id,
      scoped: true,
      compilerOptions: { bindingMetadata: bindings }
    })
    if (tpl.errors && tpl.errors.length) {
      console.error('✗ ' + file + ' template errors: ' + tpl.errors.map((e) => (e.message || e)).join('; '))
      failed++
      continue
    }
  }

  let styleFailed = false
  for (const style of descriptor.styles) {
    const res = compileStyle({ source: style.content, filename: file, id, scoped: style.scoped })
    if (res.errors && res.errors.length) {
      console.error('✗ ' + file + ' style errors: ' + res.errors.map((e) => (e.message || e)).join('; '))
      styleFailed = true
      failed++
    }
  }
  if (styleFailed) continue

  console.log('OK  ' + file)
}

console.log(failed ? ('共 ' + failed + ' 个文件失败') : ('全部通过（' + files.length + ' 个文件）'))
process.exit(failed ? 1 : 0)
