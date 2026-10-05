<#
.SYNOPSIS
  校验「项目编译器版本 = HBuilderX 版本 = 构建产物里的 compilerVersion」三者是否一致。

.DESCRIPTION
  三处版本来源（必须相同，否则 App 启动时会弹提示）：
    1. 项目编译器   node_modules\@dcloudio\vite-plugin-uni\package.json → "uni-app".compilerVersion
    2. HBuilderX     <HBuilderX目录>\ReleaseNote.md 首行 "## 5.24.2026081301" → 取 5.24
    3. 构建产物     dist\build\app\manifest.json → plus["uni-app"].compilerVersion（由 1 写入）

  版本不一致时手机端会提示：
    本应用使用HBuilderX %s 或对应的cli版本编译，而手机端SDK版本是 %s。不匹配的版本可能造成应用异常。
  （第 1 个 %s 来自产物 manifest 的 compilerVersion，第 2 个来自打包/运行时的 HBuilderX 运行时 SDK）

  编译器与 HBuilderX 的 npm 版本对应关系（npm 版本形如 3.0.0-5020420260813003）：
    5020420260813003 → HBuilderX 5.24.2026081301
    5010520260709002 → HBuilderX 5.15.2026070902
    5020620260917001 → HBuilderX 5.26.2026091701

.EXAMPLE
  npm run check:version
  powershell -ExecutionPolicy Bypass -NoProfile -File scripts\check-version.ps1 -HbxDir D:\HBuilderX
#>
[CmdletBinding()]
param(
  # HBuilderX 安装目录（用于读取 ReleaseNote.md 里的版本号）
  [string]$HbxDir = 'D:\HBuilderX',
  # 构建产物目录；不存在时只跳过第 3 项检查
  [string]$Project
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch { }

if (-not $Project) { $Project = Join-Path $PSScriptRoot '..\dist\build\app' }

function Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red; $script:failed = $true }
function Ok($msg)   { Write-Host "  [ OK ] $msg" -ForegroundColor Green }
function Info($msg) { Write-Host "         $msg" -ForegroundColor DarkGray }

$script:failed = $false

Write-Host "== 版本一致性检查 ==" -ForegroundColor Cyan

# 1) 项目编译器
$pluginPkg = Join-Path $PSScriptRoot '..\node_modules\@dcloudio\vite-plugin-uni\package.json'
if (-not (Test-Path $pluginPkg)) {
  Fail "找不到 $pluginPkg —— 先执行 npm install"
  exit 1
}
$plugin = [IO.File]::ReadAllText($pluginPkg, [Text.Encoding]::UTF8) | ConvertFrom-Json
$cliVersion = "$($plugin.'uni-app'.compilerVersion)"
$cliPkgVersion = "$($plugin.version)"
Write-Host "1) 项目编译器（cli）"
Ok "compilerVersion = $cliVersion   （npm 包版本 $cliPkgVersion）"

# 2) HBuilderX
Write-Host "2) HBuilderX"
$hbxVersion = $null
$releaseNote = Join-Path $HbxDir 'ReleaseNote.md'
if (-not (Test-Path $releaseNote)) {
  Fail "找不到 $releaseNote —— 用 -HbxDir 指定 HBuilderX 安装目录"
} else {
  $firstLine = Get-Content $releaseNote -TotalCount 3 | Where-Object { $_ -match '^##\s' } | Select-Object -First 1
  if ($firstLine -match '##\s*(\d+)\.(\d+)') {
    $hbxVersion = "$($Matches[1]).$($Matches[2])"
    Ok "版本 = $hbxVersion   （ReleaseNote 首行：$($firstLine.Trim())）"
  } else {
    Fail "无法从 ReleaseNote.md 解析版本号（首行：$firstLine）"
  }
}

# 3) 构建产物
Write-Host "3) 构建产物 dist\build\app"
$builtManifest = Join-Path $Project 'manifest.json'
$builtVersion = $null
if (Test-Path $builtManifest) {
  $built = [IO.File]::ReadAllText($builtManifest, [Text.Encoding]::UTF8) | ConvertFrom-Json
  $builtVersion = "$($built.plus.'uni-app'.compilerVersion)"
  $builtTime = (Get-Item $builtManifest).LastWriteTime
  Ok "compilerVersion = $builtVersion   （构建时间 $builtTime）"
} else {
  Info "未找到 $builtManifest（还没执行 npm run build:app），跳过"
}

# 结论
Write-Host ""
if ($hbxVersion -and $cliVersion -ne $hbxVersion) {
  Fail "编译器 $cliVersion ≠ HBuilderX $hbxVersion —— 装机后会弹“版本不匹配”提示"
  Info "统一方式一（推荐）：npx @dcloudio/uvm@latest $hbxVersion.???????? --manager npm 后重新 npm install"
  Info "统一方式二：手工把 package.json 里全部 @dcloudio/* 改成本机 HBuilderX 对应的构建号"
} elseif ($hbxVersion) {
  Ok "编译器与 HBuilderX 一致（$cliVersion）"
}
if ($builtVersion -and $builtVersion -ne $cliVersion) {
  Fail "构建产物里的 compilerVersion（$builtVersion）≠ 当前编译器（$cliVersion）—— 产物是旧的，重新 npm run build:app"
} elseif ($builtVersion) {
  Ok "构建产物 compilerVersion 与编译器一致"
}

if ($script:failed) {
  Write-Host "`n== 检查未通过 ==" -ForegroundColor Red
  exit 1
}
Write-Host "`n== 检查通过：三处版本一致，可以打包 ==" -ForegroundColor Green
exit 0
