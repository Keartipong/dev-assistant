param(
    [string]$TargetDir = "$HOME\.claude\skills\dev-assistant"
)

$ErrorActionPreference = "Stop"
$RepoUrl = "https://github.com/Keartipong/dev-assistant.git"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Error: ไม่พบคำสั่ง git ในเครื่อง กรุณาติดตั้ง Git ก่อนดำเนินการ"
    exit 1
}

if (Test-Path (Join-Path $TargetDir ".git")) {
    Write-Host "กำลังอัปเดต dev-assistant ใน $TargetDir ..."
    git -C $TargetDir pull --ff-only
} elseif (Test-Path $TargetDir) {
    Write-Host "พบโฟลเดอร์ $TargetDir ที่ไม่มี .git กำลังซิงก์และอัปเดตจาก GitHub ..."
    git -C $TargetDir init
    git -C $TargetDir remote remove origin 2>$null
    git -C $TargetDir remote add origin $RepoUrl
    git -C $TargetDir fetch origin main
    git -C $TargetDir checkout -f -B main origin/main
} else {
    $ParentDir = Split-Path -Parent $TargetDir
    if ($ParentDir -and -not (Test-Path $ParentDir)) {
        New-Item -ItemType Directory -Path $ParentDir -Force | Out-Null
    }
    Write-Host "กำลังติดตั้ง dev-assistant ไปยัง $TargetDir ..."
    git clone $RepoUrl $TargetDir
}

Write-Host "ติดตั้ง/อัปเดตสำเร็จที่: $TargetDir"
