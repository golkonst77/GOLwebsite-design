# Local mocks only: no ssh/scp executable is ever invoked.
$ErrorActionPreference = 'Stop'
$scriptUnderTest = Join-Path $PSScriptRoot 'SiteConfig-Backup.ps1'
$fixture = Join-Path ([IO.Path]::GetTempPath()) ('gol-wrapper-' + [Guid]::NewGuid().ToString('N'))
$null = New-Item -ItemType Directory -Path $fixture
$directory = Join-Path $fixture 'owner folder with spaces'
$key = Join-Path $fixture 'fake deploy key'
[IO.File]::WriteAllText($key, 'TEST FIXTURE ONLY; NOT A KEY')
$configPath = Join-Path $fixture 'backup.local.json'
@{ ServerAddress='operator@example.invalid'; KeyPath=$key; AppDirectory='/fixture/app'; AppName='sample-app';
   Domains=@('site.example.invalid'); ExpectedCommit=('a' * 40); RemoteBackupDirectory='/fixture/ciphertexts';
   RemoteWorkDirectory='/fixture/memory'; Pm2Home='/fixture/process-manager'; NginxDirectory='/fixture/proxy';
   NodeBinDirectory='/fixture/runtime' } | ConvertTo-Json | Set-Content -LiteralPath $configPath -Encoding UTF8
$global:MockCalls = [Collections.Generic.List[string]]::new()
$global:FailVerify = $false
$oldOS = $env:OS
$env:OS = 'Windows_NT'

function global:ssh {
    $items = @($args)
    $command = [string]$items[-1]
    $global:MockCalls.Add('ssh ' + $command)
    $global:LASTEXITCODE = 0
    if ($global:FailVerify -and $command -match ' verify ') { $global:LASTEXITCODE = 1 }
}
function global:scp {
    $items = @($args)
    $source = [string]$items[-2]
    $target = [string]$items[-1]
    $global:MockCalls.Add('scp ' + $source + ' ' + $target)
    if ($source.StartsWith('operator@example.invalid:')) {
        if ($source.EndsWith('.sha256')) {
            $archive = $target.Substring(0, $target.Length - 7)
            $hash = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant()
            [IO.File]::WriteAllText($target, $hash + '  ' + [IO.Path]::GetFileName($archive) + "`n")
        } else {
            [IO.File]::WriteAllBytes($target, [Text.Encoding]::UTF8.GetBytes('SYNTHETIC ENCRYPTED TRANSFER FIXTURE'))
        }
    }
    $global:LASTEXITCODE = 0
}
function Assert($condition, [string]$message) {
    if (-not $condition) { throw $message }
}

try {
    & $scriptUnderTest -Mode Create -ConfigPath $configPath -BackupDirectory $directory
    $archive = (Get-ChildItem -LiteralPath $directory -Filter '*.gpg' -File).FullName
    Assert ($null -ne $archive) 'Create did not download ciphertext'
    Assert (Test-Path -LiteralPath ($archive + '.sha256')) 'SHA256 sidecar missing'
    Assert (@($global:MockCalls | Where-Object { $_ -match ' create ' }).Count -eq 1) 'Create command count differs'
    & $scriptUnderTest -Mode Check -ConfigPath $configPath -BackupDirectory $directory
    Assert (@($global:MockCalls | Where-Object { $_ -match ' verify ' }).Count -eq 1) 'Verify was not called'
    Assert (@($global:MockCalls | Where-Object { $_ -match ' cleanup ' }).Count -eq 1) 'Encrypted verification copy was not cleaned'

    $global:FailVerify = $true
    $failed = $false
    try { & $scriptUnderTest -Mode Check -Archive $archive -ConfigPath $configPath -BackupDirectory $directory }
    catch { $failed = $true }
    Assert $failed 'Remote decryption error was not surfaced'
    Assert (@($global:MockCalls | Where-Object { $_ -match ' cleanup ' }).Count -eq 2) 'Cleanup missing after failed decryption'

    $count = $global:MockCalls.Count
    [IO.File]::AppendAllText($archive, 'CORRUPTED')
    $failed = $false
    try { & $scriptUnderTest -Mode Check -Archive $archive -ConfigPath $configPath -BackupDirectory $directory }
    catch { $failed = $true }
    Assert $failed 'Corrupted local ciphertext was accepted'
    Assert ($global:MockCalls.Count -eq $count) 'Local hash failure should stop before any SSH/SCP'
    $badConfig = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
    $badConfig.RemoteWorkDirectory = '/fixture/unsafe;command'
    $badConfig | ConvertTo-Json | Set-Content -LiteralPath $configPath -Encoding UTF8
    $failed = $false
    try { & $scriptUnderTest -Mode Create -ConfigPath $configPath -BackupDirectory $directory }
    catch { $failed = $true }
    Assert $failed 'Unsafe remote path was accepted'
    Assert ($global:MockCalls.Count -eq $count) 'Unsafe config should stop before SSH/SCP'
    Remove-Item -LiteralPath $configPath
    $failed = $false
    try { & $scriptUnderTest -Mode Create -ConfigPath $configPath -BackupDirectory $directory }
    catch { $failed = $true }
    Assert $failed 'Missing local configuration was accepted'
    Assert ($global:MockCalls.Count -eq $count) 'Missing config should stop before SSH/SCP'
    Assert (-not (@($global:MockCalls | Where-Object { $_ -match 'pm2 (restart|save|resurrect)|systemctl reload|nginx -s' }).Count)) 'Unexpected runtime mutation'
    'POWERSHELL_MOCK_CREATE_CHECK_FAILURE_CLEANUP_AND_HASH_TESTS_OK'
}
finally {
    $env:OS = $oldOS
    Remove-Item Function:\ssh -ErrorAction SilentlyContinue
    Remove-Item Function:\scp -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $fixture -Recurse -Force
}
