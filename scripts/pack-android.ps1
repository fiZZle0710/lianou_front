<#
.SYNOPSIS
  莲藕 App · Android 云打包（调用 HBuilderX 自带的 cli.exe，无需手动点界面）

.DESCRIPTION
  打包前置（缺一不可）：
    1. HBuilderX 已安装（默认 D:\HBuilderX，可用 -Hbx 指定 cli.exe 路径）
    2. HBuilderX 中已通过「文件 → 打开目录」导入 $Project 指向的目录
    3. DCloud 账号已登录，且已在 https://dev.dcloud.net.cn/pages/user/info 绑定手机号
       （未绑定手机号会直接报错，且 HBuilderX 界面可能没有任何可见提示）
    4. 源码有改动时，先执行 npm run build:app 重新构建 dist\build\app

  5. **HBuilderX 必须正在运行**：检测不到它时 cli 只打印一句
     「未检测到已打开的HBuilderX，请先执行cli open启动HBuilderX后再重试」，并且**不会提交任务**
     （旧版脚本会把这句当成功、误报「已提交」）。未启动时先执行 npm run pack:app -- -Open

.EXAMPLE
  npm run pack:app -- -Open           # 只启动 HBuilderX（打包前必须先启动它）
  npm run pack:app                    # 云端证书打包（推荐）
  npm run pack:app -- -Status         # 查询打包状态
  npm run pack:app -- -Cancel         # 取消打包任务
  npm run pack:app -- -Cert 0 -CertFile certs\lianou.keystore -CertAlias lianou -CertPassword 123456 -StorePassword 123456
#>
[CmdletBinding()]
param(
  # HBuilderX 命令行工具路径
  [string]$Hbx = 'D:\HBuilderX\cli.exe',
  # 打包目标：必须是「HBuilderX 中已导入的项目」目录（CLI 构建产物目录）
  [string]$Project,
  [string]$PackageName = 'com.lianou.app',
  # 证书类型：3=云端证书(推荐) 0=自有证书 1=公共测试证书(DCloud 已停用)
  [ValidateSet('0', '1', '3')][string]$Cert = '3',
  [string]$CertFile,
  [string]$CertAlias,
  [string]$CertPassword,
  [string]$StorePassword,
  [switch]$Status,
  [switch]$Cancel,
  [switch]$Open
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch { }

# 注意：Windows PowerShell 5.1 中 $PSScriptRoot 在 param() 默认值里可能为空，故在正文里兜底
if (-not $Project) { $Project = Join-Path $PSScriptRoot '..\dist\build\app' }

if (-not (Test-Path $Hbx)) { throw "找不到 HBuilderX 命令行工具：$Hbx（用 -Hbx 指定 cli.exe 的绝对路径）" }
if (-not (Test-Path $Project)) { throw "找不到打包目录：$Project（先执行 npm run build:app）" }
$project = (Resolve-Path $Project).Path

if ($Status) { & $Hbx pack status --project $project; exit $LASTEXITCODE }
if ($Cancel) { & $Hbx pack cancel --project $project --platform app-android; exit $LASTEXITCODE }

# 只启动 HBuilderX（打包前置条件之一：cli 必须检测到 HBuilderX 在运行）
if ($Open) {
  Write-Host "== 启动 HBuilderX ==" -ForegroundColor Cyan
  & $Hbx open
  Write-Host '  等 HBuilderX 窗口完全就绪（左侧项目树出现）后，再执行 npm run pack:app'
  exit 0
}

$cliArgs = @(
  'pack',
  '--project', $project,
  '--platform', 'android',
  '--android.packagename', $PackageName,
  '--android.androidpacktype', $Cert
)

if ($Cert -eq '0') {
  foreach ($p in 'CertFile', 'CertAlias', 'CertPassword', 'StorePassword') {
    if (-not (Get-Variable $p -ValueOnly)) { throw "自有证书（-Cert 0）必须同时提供 -CertFile / -CertAlias / -CertPassword / -StorePassword" }
  }
  if (-not (Test-Path $CertFile)) { throw "证书文件不存在：$CertFile" }
  $cliArgs += @(
    '--android.certfile', (Resolve-Path $CertFile).Path,
    '--android.certalias', $CertAlias,
    '--android.certpassword', $CertPassword,
    '--android.storepassword', $StorePassword
  )
}

Write-Host "== HBuilderX 云打包（Android）==" -ForegroundColor Cyan
Write-Host "  项目目录 : $project"
Write-Host "  包名     : $PackageName"
Write-Host "  证书类型 : $Cert$(if ($Cert -eq '3') { '（云端证书）' } elseif ($Cert -eq '0') { '（自有证书）' } else { '（公共测试证书·已停用，预计会失败）' })"
Write-Host "  命令     : cli $($cliArgs -join ' ')"
Write-Host ""

$lines = @(& $Hbx @cliArgs 2>&1)
$plain = (($lines | Out-String) -replace '</li>', "`n") -replace '<[^>]+>', ''
$items = @($plain -split "`n" | ForEach-Object { ($_ -replace '\s{2,}', ' ').Trim() } | Where-Object { $_ })

# 云端普通的进度输出（如 "22:32 检查打包资源..."）原样打印
$items | Where-Object { $_ -notmatch '^\[(Error|Warning)\]' } | ForEach-Object { Write-Host "  $_" }

$warnings = @($items | Where-Object { $_ -match '^\[Warning\]' })
$errors = @($items | Where-Object { $_ -match '^\[Error\]' })

if ($warnings.Count -gt 0) {
  Write-Host "`n== 警告（不阻塞打包）==" -ForegroundColor Yellow
  $warnings | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
}

if ($errors.Count -gt 0) {
  Write-Host "`n== 打包被拒绝，云端返回的错误 ==" -ForegroundColor Red
  $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  Write-Host "`n常见原因：" -ForegroundColor Yellow
  Write-Host "  1) DCloud 账号未绑定手机号 → https://dev.dcloud.net.cn/pages/user/info" -ForegroundColor Yellow
  Write-Host "  2) 证书类型不可用 → 用 -Cert 3（云端证书）" -ForegroundColor Yellow
  Write-Host "  3) 项目未在 HBuilderX 中「文件 → 打开目录」导入 → 先导入 $project" -ForegroundColor Yellow
  exit 1
}

# HBuilderX 不在运行时，cli 不会返回 [Error]，只打印一句提示；这里显式识别，避免误报「打包任务已提交」
if ($plain -match '未检测到已打开的HBuilderX') {
  Write-Host "`n== 打包没有提交：HBuilderX 不在运行 ==" -ForegroundColor Red
  Write-Host '  先启动 HBuilderX：npm run pack:app -- -Open，等窗口就绪后再打包' -ForegroundColor Yellow
  Write-Host "  并确认已用「文件 → 打开目录」导入：$project" -ForegroundColor Yellow
  exit 1
}

Write-Host "`n== 打包任务已提交 ==" -ForegroundColor Green
Write-Host "  等 2-5 分钟，用 `npm run pack:app -- -Status` 查进度；HBuilderX 界面也会弹出下载提示"

$apkDir = Join-Path $project 'unpackage\release\apk'
if (Test-Path $apkDir) {
  Write-Host "`n== 产物目录：$apkDir ==" -ForegroundColor Green
  Get-ChildItem $apkDir -Filter *.apk -ErrorAction SilentlyContinue |
    Select-Object Name, @{n = 'MB'; e = { [math]::Round($_.Length / 1MB, 2) } }, LastWriteTime |
    Format-Table -AutoSize
}
exit 0
