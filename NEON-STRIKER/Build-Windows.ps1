$ErrorActionPreference = 'Stop'
try {
    $source = Join-Path $PSScriptRoot 'app'
    if (!(Test-Path (Join-Path $source 'index.html'))) { throw 'Missing app/index.html. Extract the entire ZIP first.' }
    $version = '44.9.3'
    $archiveName = "electron-v$version-win32-x64.zip"
    $release = "https://github.com/electron/electron/releases/download/v$version"
    $cache = Join-Path $PSScriptRoot '.build-cache'
    New-Item -ItemType Directory -Path $cache -Force | Out-Null
    $archive = Join-Path $cache $archiveName
    $expected = '41a1ffa0541cb0f2c9b9fe920dd2cef1793ad0ea2ada1a9582958880f4d1b23c'
    if (!(Test-Path $archive)) {
        Write-Host 'Downloading the official Windows runtime...'
        Invoke-WebRequest "$release/$archiveName" -OutFile "$archive.partial" -UseBasicParsing
        if ((Get-FileHash "$archive.partial" -Algorithm SHA256).Hash -ne $expected) { throw 'Runtime checksum verification failed.' }
        Move-Item "$archive.partial" $archive
    }
    if ((Get-FileHash $archive -Algorithm SHA256).Hash -ne $expected) { throw 'Cached runtime checksum verification failed. Delete .build-cache and retry.' }
    $destination = Join-Path $PSScriptRoot ('dist\NEON-STRIKER-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
    Write-Host 'Creating NEON STRIKER...'
    Expand-Archive -LiteralPath $archive -DestinationPath $destination
    $appDir = Join-Path $destination 'resources\app'
    New-Item -ItemType Directory -Path $appDir | Out-Null
    Copy-Item (Join-Path $source '*') $appDir -Recurse
    Rename-Item (Join-Path $destination 'electron.exe') 'NEON-STRIKER.exe'
    Write-Host "Ready: $destination\NEON-STRIKER.exe"
    Start-Process explorer.exe -ArgumentList ('"' + $destination + '"')
} catch {
    Write-Host ('Build stopped: ' + $_.Exception.Message) -ForegroundColor Red
    exit 1
}
