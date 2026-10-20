# Standalone script: the embedded helper contains code only, never production secrets.
[CmdletBinding()]
param(
    [ValidateSet('Create','Check','Diagnose')][string]$Mode = 'Create',
    [string]$Archive = '',
    [string]$ConfigPath = '',
    [string]$KeyPath = '',
    [string]$BackupDirectory = ''
)
$ErrorActionPreference = 'Stop'
# Resolve automatic script variables AFTER parameter binding (Windows PowerShell 5.1).
if (-not $ConfigPath) {
    $scriptDirectory = $PSScriptRoot
    if ([string]::IsNullOrWhiteSpace($scriptDirectory) -and $PSCommandPath) {
        $scriptDirectory = Split-Path -Parent $PSCommandPath
    }
    if ([string]::IsNullOrWhiteSpace($scriptDirectory) -and $MyInvocation.MyCommand.Path) {
        $scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
    }
    if ([string]::IsNullOrWhiteSpace($scriptDirectory)) {
        throw 'Script location unavailable. Run the saved .ps1 with -File or supply -ConfigPath.'
    }
    $ConfigPath = Join-Path $scriptDirectory 'backup.local.json'
}
if ($env:OS -ne 'Windows_NT') { throw 'Run this script in Windows PowerShell or PowerShell 7 on Windows.' }
foreach ($tool in @('ssh','scp')) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { throw "Windows OpenSSH is required: $tool was not found." }
}
if (-not (Test-Path -LiteralPath $ConfigPath -PathType Leaf)) { throw 'Create private backup.local.json beside this script. See the README; do not upload it.' }
$config = Get-Content -LiteralPath $ConfigPath -Raw -Encoding UTF8 | ConvertFrom-Json
foreach ($name in @('ServerAddress','KeyPath','AppDirectory','AppName','Domains','ExpectedCommit','RemoteBackupDirectory','RemoteWorkDirectory','Pm2Home','NginxDirectory','NodeBinDirectory')) {
    if (-not $config.$name) { throw ('Missing private configuration field: ' + $name) }
}
$serverAddress = [string]$config.ServerAddress
if ($serverAddress -notmatch '^[A-Za-z_][A-Za-z0-9_-]*@[A-Za-z0-9.-]+$') { throw 'Invalid SSH destination.' }
foreach ($name in @('AppDirectory','RemoteBackupDirectory','RemoteWorkDirectory','Pm2Home','NginxDirectory','NodeBinDirectory')) {
    $value = [string]$config.$name
    if ($value -notmatch '^/[A-Za-z0-9_./-]+$' -or $value -eq '/' -or $value.Split('/') -contains '..') { throw ('Unsafe remote path field: ' + $name) }
}
if ($config.AppName -notmatch '^[A-Za-z0-9_.-]+$' -or $config.ExpectedCommit -notmatch '^[a-f0-9]{40}$') { throw 'Invalid application name or commit SHA.' }
if (-not $KeyPath) { $KeyPath = [Environment]::ExpandEnvironmentVariables([string]$config.KeyPath) }
if (-not (Test-Path -LiteralPath $KeyPath -PathType Leaf)) { throw 'SSH key not found.' }
if (-not $BackupDirectory) {
    if ($config.BackupDirectory) { $BackupDirectory = [Environment]::ExpandEnvironmentVariables([string]$config.BackupDirectory) }
    else { $BackupDirectory = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'SiteConfig-Backups' }
}
$remoteDirectory = ([string]$config.RemoteBackupDirectory).TrimEnd('/')
$remoteSettings = @{}
foreach ($name in @('AppDirectory','AppName','Domains','ExpectedCommit','RemoteBackupDirectory','RemoteWorkDirectory','Pm2Home','NginxDirectory')) { $remoteSettings[$name] = $config.$name }
$remoteSettings['ServerHost'] = $serverAddress.Split('@')[1]
$remoteSettings['AdditionalNginxIncludes'] = @($config.AdditionalNginxIncludes | Where-Object { $_ })
$id = [Guid]::NewGuid().ToString('N')
$remoteName = 'site-config-' + [DateTime]::UtcNow.ToString('yyyy-MM-ddTHHmmssZ') + '-' + $id.Substring(0,12) + '.tar.gz.gpg'
$remoteCodeDirectory = ([string]$config.RemoteWorkDirectory).TrimEnd('/') + '/site-backup-code-' + $id
$remoteHelper = $remoteCodeDirectory + '/helper.py'
$remoteConfig = $remoteCodeDirectory + '/config.json'
$localConfig = Join-Path ([IO.Path]::GetTempPath()) ('site-backup-config-' + $id + '.json')
$localHelper = Join-Path ([IO.Path]::GetTempPath()) ('site-backup-code-' + $id + '.py')
$sshOptions = @('-i', $KeyPath, '-o', 'IdentitiesOnly=yes')
$helperUploaded = $false
$codeDirectoryCreated = $false
$checkUploaded = $false

function Native-Check([string]$step) {
    if ($LASTEXITCODE -ne 0) { throw "$step failed. The site has not been restarted or reconfigured." }
}
function Check-LocalHash([string]$file) {
    $sidecar = $file + '.sha256'
    if (-not (Test-Path -LiteralPath $sidecar -PathType Leaf)) { throw 'SHA256 sidecar file is missing.' }
    $text = [IO.File]::ReadAllText($sidecar).Trim()
    if ($text -notmatch '^([a-fA-F0-9]{64})  ([^\r\n]+)$') { throw 'Invalid SHA256 sidecar.' }
    $expected = $Matches[1]
    if ($Matches[2] -cne [IO.Path]::GetFileName($file)) { throw 'SHA256 sidecar belongs to another file.' }
    $actual = (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash
    if ($actual -ine $expected) { throw 'SHA256 MISMATCH. Do not use this backup.' }
    Write-Host 'LOCAL_SHA256_OK'
}

try {
    if ($Mode -eq 'Check') {
        if (-not $Archive) {
            $latest = Get-ChildItem -LiteralPath $BackupDirectory -Filter 'site-config-*.tar.gz.gpg' -File |
                Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
            if (-not $latest) { throw 'No backup found. Create one first, or supply -Archive.' }
            $Archive = $latest.FullName
        }
        $Archive = (Resolve-Path -LiteralPath $Archive).Path
        Check-LocalHash $Archive
    } elseif ($Mode -eq 'Create') {
        if (-not (Test-Path -LiteralPath $BackupDirectory)) {
            $null = New-Item -ItemType Directory -Path $BackupDirectory
        }
        $Archive = Join-Path $BackupDirectory $remoteName
        if ((Test-Path -LiteralPath $Archive) -or (Test-Path -LiteralPath ($Archive + '.sha256'))) { throw 'Backup destination already exists.' }
    }
    # This temporary file is public helper code, not settings or a decrypted archive.
    [IO.File]::WriteAllBytes($localHelper, [Convert]::FromBase64String('__HELPER_BASE64__'))
    $preflight = "import os,sys,stat; p=sys.argv[1]; s=os.stat(p); (s.st_uid==os.geteuid() and not s.st_mode & 0o022 and stat.S_ISDIR(s.st_mode) and not os.path.islink(p)) or sys.exit(1); os.mkdir(sys.argv[2],0o700)"
    & ssh @sshOptions $serverAddress ("python3 -c '" + $preflight + "' " + $config.RemoteWorkDirectory + ' ' + $remoteCodeDirectory)
    Native-Check 'Private helper directory creation'
    $codeDirectoryCreated = $true
    & scp @sshOptions -q $localHelper ($serverAddress + ':' + $remoteHelper)
    Native-Check 'Helper upload'
    $helperUploaded = $true
    [IO.File]::WriteAllText($localConfig, ($remoteSettings | ConvertTo-Json -Depth 10), [Text.UTF8Encoding]::new($false))
    & scp @sshOptions -q $localConfig ($serverAddress + ':' + $remoteConfig)
    Native-Check 'Private settings upload'
    $prefix = 'PATH=' + $config.NodeBinDirectory + ':$PATH PM2_HOME=' + $config.Pm2Home + ' python3 ' + $remoteHelper
    if ($Mode -ne 'Diagnose') {
    & ssh @sshOptions $serverAddress ($prefix + ' prepare ' + $remoteName + ' ' + $remoteConfig)
    Native-Check 'Read-only preflight and private backup directory'
    }
    if ($Mode -eq 'Diagnose') {
        & ssh @sshOptions $serverAddress ($prefix + ' diagnose ' + $remoteName + ' ' + $remoteConfig)
        Native-Check 'Read-only Nginx ownership diagnosis'
    } elseif ($Mode -eq 'Create') {
        Write-Host 'Enter a NEW backup password of exactly 10 characters, then repeat it. Input is hidden.'
        & ssh @sshOptions -t $serverAddress ($prefix + ' create ' + $remoteName + ' ' + $remoteConfig)
        Native-Check 'Encrypted backup and server-side decryption test'
        & scp @sshOptions -q ($serverAddress + ':' + $remoteDirectory + '/' + $remoteName) $Archive
        Native-Check 'Encrypted archive download'
        & scp @sshOptions -q ($serverAddress + ':' + $remoteDirectory + '/' + $remoteName + '.sha256') ($Archive + '.sha256')
        Native-Check 'SHA256 download'
        Check-LocalHash $Archive
        Write-Host 'BACKUP_COMPLETE (encrypted copy retained in the configured private remote directory)'
    } else {
        $checkUploaded = $true
        & scp @sshOptions -q $Archive ($serverAddress + ':' + $remoteDirectory + '/' + $remoteName)
        Native-Check 'Encrypted verification copy upload'
        Write-Host 'Enter the backup password. Input is hidden. Decrypted files will not be extracted.'
        & ssh @sshOptions -t $serverAddress ($prefix + ' verify ' + $remoteName + ' ' + $remoteConfig)
        Native-Check 'GPG authentication, decryption and manifest verification'
        Write-Host 'BACKUP_CHECK_PASSED'
    }
    if ($Mode -ne 'Diagnose') { Write-Host ('Windows archive: ' + $Archive) }
}
finally {
    if ($helperUploaded) {
        if ($Mode -eq 'Check' -and $checkUploaded) {
            & ssh @sshOptions $serverAddress ($prefix + ' cleanup ' + $remoteName + ' ' + $remoteConfig)
            if ($LASTEXITCODE -ne 0) { Write-Warning 'Could not remove the temporary ENCRYPTED verification copy. No plaintext was written.' }
        }
    }
    if ($codeDirectoryCreated) {
        & ssh @sshOptions $serverAddress ('rm -f -- ' + $remoteHelper + ' ' + $remoteConfig + ' && rmdir -- ' + $remoteCodeDirectory)
        if ($LASTEXITCODE -ne 0) { Write-Warning 'Could not remove the private temporary helper directory. It contains code only, no secrets.' }
    }
    Remove-Item -LiteralPath $localConfig -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $localHelper -Force -ErrorAction SilentlyContinue
}
