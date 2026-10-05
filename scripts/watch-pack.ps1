<#
.SYNOPSIS
  轮询 HBuilderX 云打包状态；出包后自动抓取下载链接并下载 APK。

.DESCRIPTION
  与 scripts/pack-android.ps1 配套使用：pack-android.ps1 提交打包（提交后即返回/排队），
  本脚本负责盯进度。云打包免费队列高峰时可排到 30 分钟以上，适合丢到后台跑。

.EXAMPLE
  npm run watch:pack
  npm run watch:pack -- -IntervalSec 30 -TimeoutMin 120
#>
[CmdletBinding()]
param(
  [string]$Hbx = 'D:\HBuilderX\cli.exe',
  [string]$Project,
  [int]$IntervalSec = 45,
  [int]$TimeoutMin = 90,
  [string]$OutDir
)

$ErrorActionPreference = 'Continue'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch { }

# PS 5.1 中 $PSScriptRoot 在 param() 默认值里可能为空，故在正文里兜底
if (-not $Project) { $Project = Join-Path $PSScriptRoot '..\dist\build\app' }
$Project = (Resolve-Path $Project).Path
if (-not $OutDir) { $OutDir = Join-Path $Project 'unpackage\release\apk' }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$script:log = Join-Path $env:TEMP 'pack-watch.log'
"==== 开始监听云打包（$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))，最长 $TimeoutMin 分钟）====" |
  Add-Content -Path $script:log -Encoding UTF8

function Write-Log([string]$Message) {
  $line = '{0}  {1}' -f (Get-Date -Format 'HH:mm:ss'), $Message
  Write-Host $line
  Add-Content -Path $script:log -Value $line -Encoding UTF8
}

$deadline = (Get-Date).AddMinutes($TimeoutMin)
$lastState = ''
# 是否见过「打包成功」；见过之后即使状态输出里暂时没有下载地址，也不能收工（否则会像 09-16 那样漏掉临时下载链接）
$sawSuccess = $false
# 「已打包成功但还没拿到地址」时打日志的节流计数
$waitTicks = 0
# 只认本次监听开始之后产生的 APK，避免目录里的旧包让脚本误判「已出包」
$watchStart = (Get-Date).AddMinutes(-1)

while ((Get-Date) -lt $deadline) {
  $raw = (& $Hbx pack status --project $Project 2>&1 | Out-String)
  $plain = ($raw -replace '</li>', "`n") -replace '<[^>]+>', ''

  # 状态输出可能同时列出多个历史任务（最新任务在最前），只取第一段，否则会被历史任务的
  # "用户取消打包" 等字样误判为已结束
  $lines = @($plain -split "`n" | ForEach-Object { ($_ -replace '\s{2,}', ' ').Trim() } | Where-Object { $_ })
  $start = -1
  for ($i = 0; $i -lt $lines.Count; $i++) { if ($lines[$i] -match '时间[:：]') { $start = $i; break } }
  if ($start -ge 0) {
    $end = $lines.Count - 1
    for ($j = $start + 1; $j -lt $lines.Count; $j++) { if ($lines[$j] -match '时间[:：]') { $end = $j - 1; break } }
    $current = $lines[$start..$end] -join "`n"
  }
  else { $current = $plain }

  $state = '未知'
  if ($current -match '打包成功[:：]') { $state = '打包成功' }
  elseif ($current -match '打包失败') { $state = '打包失败' }
  elseif ($current -match '用户取消打包') { $state = '用户取消打包' }
  elseif ($current -match '正在云端打包') { $state = '正在云端打包' }
  elseif ($current -match '准备打包') { $state = '准备打包' }
  elseif ($current -match '队列中') { $state = '队列中' }

  if ($state -eq '打包成功') { $sawSuccess = $true }

  $queue = ($current -split "`n" | Where-Object { $_ -match '队列第' } | Select-Object -First 1)
  if ($state -ne $lastState -or $queue) {
    $msg = "状态: $state"
    if ($queue) { $msg += '  ' + ($queue -replace '\s{2,}', ' ').Trim() }
    Write-Log $msg
    $lastState = $state
  }

  # 出包后云端会给出下载地址。注意：链接形如 https://app.liuyingyong.cn/build/download/<uuid>，
  # 不带 .apk 后缀，且是"只能下载 5 次"的临时地址 —— 必须及时抓取。
  $url = ([regex]::Match($current, 'https?://[^\s"<>]+\.apk[^\s"<>]*')).Value
  if (-not $url) { $url = ([regex]::Match($current, '下载地址[:：]\s*(https?://[^\s"<>]+)')).Groups[1].Value }
  # 兜底：云端链接常是 https://app.liuyingyong.cn/build/download/<uuid>，既不带 .apk 也可能没有「下载地址:」前缀
  if (-not $url) { $url = ([regex]::Match($current, 'https?://[^\s"<>]*(?:app\.liuyingyong\.cn|/download/)[^\s"<>]*')).Value }

  if ($url) {
    Write-Log (($current -replace "\r?\n", ' | ').Trim())
    Write-Log "发现下载链接: $url"
    $dest = Join-Path $OutDir ("lianou-{0}.apk" -f (Get-Date -Format 'MMdd-HHmm'))
    try {
      [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
      Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
      Write-Log "已下载: $dest （$([math]::Round((Get-Item $dest).Length / 1MB, 2)) MB）"
      Write-Log 'DONE'
      exit 0
    }
    catch {
      Write-Log "自动下载失败（请尽快手动打开上面的链接，该地址只能下载 5 次）: $($_.Exception.Message)"
      Write-Log 'DONE'
      exit 1
    }
  }

  if ($sawSuccess) {
    # 已打包成功但这一刻的状态输出里还没有下载地址：继续轮询，拿到就立刻下载
    # （09-16 就是因为此处直接收工，结果只能第二天手动下载）
    $waitTicks++
    if ($waitTicks % 5 -eq 1) {
      Write-Log '云端已打包成功，等待下载地址出现...（也可直接点 HBuilderX 右下角的打包完成弹窗下载）'
    }
  }

  # HBuilderX 也可能把包直接下载到工程目录
  $apk = Get-ChildItem $OutDir -Filter *.apk -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -gt $watchStart } |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if ($apk) {
    Write-Log "已发现产物 APK: $($apk.FullName) （$([math]::Round($apk.Length / 1MB, 2)) MB）"
    Write-Log 'DONE'
    exit 0
  }

  if ($state -eq '打包失败' -or $state -eq '用户取消打包') { Write-Log 'DONE'; exit 1 }

  Start-Sleep -Seconds $IntervalSec
}

if ($sawSuccess) {
  Write-Log "已打包成功，但 $TimeoutMin 分钟内始终没取到下载地址：请到 HBuilderX 菜单「发行 - 查看云打包状态」手动下载（临时地址只能下载 5 次）"
  exit 3
}

Write-Log "超过 $TimeoutMin 分钟仍未出包，监听结束"
exit 2
