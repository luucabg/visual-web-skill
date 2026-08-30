[CmdletBinding()]
param([switch]$Force)

$ErrorActionPreference = 'Stop'
$sourceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'skill\visual-web'))
if (-not (Test-Path -LiteralPath $sourceRoot -PathType Container)) { throw "Install source not found: $sourceRoot" }
$codexRoot = if ($env:CODEX_HOME) { [IO.Path]::GetFullPath($env:CODEX_HOME) } else { [IO.Path]::GetFullPath((Join-Path $env:USERPROFILE '.codex')) }

function Assert-DirectChild([string]$Parent, [string]$Child) {
  $parentPath = [IO.Path]::GetFullPath($Parent).TrimEnd([IO.Path]::DirectorySeparatorChar)
  $childPath = [IO.Path]::GetFullPath($Child)
  $expectedParent = $parentPath + [IO.Path]::DirectorySeparatorChar
  if (-not $childPath.StartsWith($expectedParent, [StringComparison]::OrdinalIgnoreCase) -or [IO.Path]::GetDirectoryName($childPath) -ine $parentPath) { throw "Unsafe path outside its expected parent: $childPath" }
}
function Assert-RealDirectory([string]$Directory) {
  $absolute = [IO.Path]::GetFullPath($Directory)
  if (-not [IO.Path]::IsPathRooted($absolute)) { throw "Directory path is not absolute: $Directory" }
  $item = Get-Item -LiteralPath $absolute -Force
  if (-not $item.PSIsContainer -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw "Directory must be real, not a symbolic link or junction: $absolute" }
  return $item.FullName
}
$sourceRoot = Assert-RealDirectory $sourceRoot
if (-not (Test-Path -LiteralPath $codexRoot)) { New-Item -ItemType Directory -Path $codexRoot -Force | Out-Null }
$codexRoot = Assert-RealDirectory $codexRoot
$skillsRoot = [IO.Path]::GetFullPath((Join-Path $codexRoot 'skills'))
Assert-DirectChild $codexRoot $skillsRoot
if (-not (Test-Path -LiteralPath $skillsRoot)) { New-Item -ItemType Directory -Path $skillsRoot | Out-Null }
$skillsRoot = Assert-RealDirectory $skillsRoot
$destination = [IO.Path]::GetFullPath((Join-Path $skillsRoot 'visual-web'))
Assert-DirectChild $skillsRoot $destination

function Get-TreeManifest([string]$Root) {
  $rootPath = [IO.Path]::GetFullPath($Root).TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
  $entries = Get-ChildItem -LiteralPath $Root -Recurse -Force
  foreach ($entry in $entries) { if (($entry.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw "Symbolic links and junctions are not installable: $($entry.FullName)" } }
  return @($entries | Where-Object { -not $_.PSIsContainer } | ForEach-Object {
    $stream = [IO.File]::OpenRead($_.FullName)
    $algorithm = [Security.Cryptography.SHA256]::Create()
    try { $hash = ([BitConverter]::ToString($algorithm.ComputeHash($stream))).Replace('-', '').ToLowerInvariant() }
    finally { $algorithm.Dispose(); $stream.Dispose() }
    [PSCustomObject]@{ Path = $_.FullName.Substring($rootPath.Length).Replace('\', '/'); Length = $_.Length; SHA256 = $hash }
  } | Sort-Object Path)
}
function Test-SameManifest($Left, $Right) {
  $leftEntries = @($Left)
  $rightEntries = @($Right)
  if ($leftEntries.Count -ne $rightEntries.Count) { return $false }
  for ($index = 0; $index -lt $leftEntries.Count; $index++) {
    if ($leftEntries[$index].Path -cne $rightEntries[$index].Path -or $leftEntries[$index].Length -ne $rightEntries[$index].Length -or $leftEntries[$index].SHA256 -cne $rightEntries[$index].SHA256) { return $false }
  }
  return $true
}

$sourceManifest = Get-TreeManifest $sourceRoot
if ($sourceManifest.Count -eq 0) { throw 'Install source is empty.' }
if (Test-Path -LiteralPath $destination) {
  $destination = Assert-RealDirectory $destination
  $destinationManifest = Get-TreeManifest $destination
  if (Test-SameManifest $sourceManifest $destinationManifest) { Write-Output "Already installed and hash-verified: $destination"; return }
  if (-not $Force) { throw "Destination exists and differs: $destination. Existing files were preserved; rerun with -Force to install with a backup." }
}

$suffix = "$PID-$([Guid]::NewGuid().ToString('N'))"
$backupRoot = [IO.Path]::GetFullPath((Join-Path $codexRoot 'skill-backups'))
Assert-DirectChild $codexRoot $backupRoot
if (-not (Test-Path -LiteralPath $backupRoot)) { New-Item -ItemType Directory -Path $backupRoot | Out-Null }
$backupRoot = Assert-RealDirectory $backupRoot
$visualWebBackups = [IO.Path]::GetFullPath((Join-Path $backupRoot 'visual-web'))
Assert-DirectChild $backupRoot $visualWebBackups
if (-not (Test-Path -LiteralPath $visualWebBackups)) { New-Item -ItemType Directory -Path $visualWebBackups | Out-Null }
$visualWebBackups = Assert-RealDirectory $visualWebBackups
$updateRoot = [IO.Path]::GetFullPath((Join-Path $visualWebBackups $suffix))
Assert-DirectChild $visualWebBackups $updateRoot
New-Item -ItemType Directory -Path $updateRoot | Out-Null
$updateRoot = Assert-RealDirectory $updateRoot
$staging = [IO.Path]::GetFullPath((Join-Path $updateRoot 'incoming'))
$backup = [IO.Path]::GetFullPath((Join-Path $updateRoot 'previous'))
$failed = [IO.Path]::GetFullPath((Join-Path $updateRoot 'failed'))
Assert-DirectChild $updateRoot $staging
Assert-DirectChild $updateRoot $backup
Assert-DirectChild $updateRoot $failed
New-Item -ItemType Directory -Path $staging | Out-Null
$staging = Assert-RealDirectory $staging
Get-ChildItem -LiteralPath $sourceRoot -Force | ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $staging -Recurse -Force }
$stagedManifest = Get-TreeManifest $staging
if (-not (Test-SameManifest $sourceManifest $stagedManifest)) { throw "Staging hash verification failed. Staging was preserved for inspection: $staging" }

$hadDestination = Test-Path -LiteralPath $destination
try {
  if ($hadDestination) {
    Assert-RealDirectory $destination | Out-Null
    Move-Item -LiteralPath $destination -Destination $backup
    Assert-RealDirectory $backup | Out-Null
  }
  Assert-RealDirectory $staging | Out-Null
  Move-Item -LiteralPath $staging -Destination $destination
  Assert-RealDirectory $destination | Out-Null
  $installedManifest = Get-TreeManifest $destination
  if (-not (Test-SameManifest $sourceManifest $installedManifest)) { throw 'Installed hash verification failed.' }
} catch {
  if (Test-Path -LiteralPath $destination) {
    Assert-RealDirectory $destination | Out-Null
    Move-Item -LiteralPath $destination -Destination $failed
    Assert-RealDirectory $failed | Out-Null
  }
  if ($hadDestination -and (Test-Path -LiteralPath $backup) -and -not (Test-Path -LiteralPath $destination)) {
    Assert-RealDirectory $backup | Out-Null
    Move-Item -LiteralPath $backup -Destination $destination
    Assert-RealDirectory $destination | Out-Null
  }
  throw
}
Write-Output "Installed and hash-verified: $destination"
if ($hadDestination) { Write-Output "Previous installation preserved: $backup" }
