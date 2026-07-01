$ErrorActionPreference = 'Stop'

$timestamp = Get-Date -Format 'yyyyMMddHHmmss'
$outputZip = "$timestamp.zip"

$baseIgnorePatterns = @(
  '.git',
  'pack_zip.bat',
  'pack_zip.ps1',
  '*.zip',
  '*.7z',
  '*.rar'
)

$ignorePatterns = New-Object System.Collections.Generic.List[string]
$allowPatterns = New-Object System.Collections.Generic.List[string]

foreach ($pattern in $baseIgnorePatterns) {
  $ignorePatterns.Add($pattern)
}

if (Test-Path '.gitignore') {
  $lines = Get-Content '.gitignore'

  foreach ($line in $lines) {
    $p = $line.Trim()

    if ([string]::IsNullOrWhiteSpace($p)) {
      continue
    }

    if ($p.StartsWith('#')) {
      continue
    }

    if ($p.StartsWith('!')) {
      $allow = $p.Substring(1).Trim().TrimEnd('/')
      if (-not [string]::IsNullOrWhiteSpace($allow)) {
        $allowPatterns.Add($allow)
      }
      continue
    }

    $ignore = $p.TrimEnd('/')
    if (-not [string]::IsNullOrWhiteSpace($ignore)) {
      $ignorePatterns.Add($ignore)
    }
  }
}

function Test-PatternMatch {
  param(
    [string] $Name,
    [string] $Pattern
  )

  $normalizedName = $Name -replace '\\', '/'
  $normalizedPattern = $Pattern -replace '\\', '/'

  return ($normalizedName -like $normalizedPattern)
}

function Test-IsAllowed {
  param(
    [string] $Name
  )

  foreach ($pattern in $allowPatterns) {
    if (Test-PatternMatch -Name $Name -Pattern $pattern) {
      return $true
    }
  }

  return $false
}

function Test-IsIgnored {
  param(
    [string] $Name
  )

  foreach ($pattern in $ignorePatterns) {
    if (Test-PatternMatch -Name $Name -Pattern $pattern) {
      return $true
    }
  }

  return $false
}

$items = Get-ChildItem -Force | Where-Object {
  $name = $_.Name

  if (Test-IsAllowed -Name $name) {
    return $true
  }

  if (Test-IsIgnored -Name $name) {
    return $false
  }

  return $true
}

if ($items.Count -eq 0) {
  Write-Host '[ERROR] No files found to pack.'
  exit 1
}

Write-Host "Output file: $outputZip"
Write-Host ''
Write-Host 'Packing items:'

foreach ($item in $items) {
  Write-Host "  - $($item.Name)"
}

Compress-Archive -Path $items.FullName -DestinationPath $outputZip -Force

Write-Host ''
Write-Host "[OK] Packed: $outputZip"