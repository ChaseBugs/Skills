$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$dataPath = Join-Path $projectRoot '.local\mysql-data'
if (-not (Test-Path -LiteralPath $dataPath)) { throw 'The isolated local database has not been initialized. Follow README.md for normal MySQL setup.' }
$mysqlPidFile = Join-Path $projectRoot '.local\mysql.pid'
$mysqlRunning = $false
if (Test-Path -LiteralPath $mysqlPidFile) {
  $storedPid = [int](Get-Content -LiteralPath $mysqlPidFile)
  $candidate = Get-CimInstance Win32_Process -Filter "ProcessId=$storedPid" -ErrorAction SilentlyContinue
  $mysqlRunning = $candidate -and $candidate.Name -eq 'mysqld.exe' -and $candidate.CommandLine.Contains($dataPath)
}
if (-not $mysqlRunning) {
  $mysqlExe = 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe'
  $mysqlBase = Split-Path -Parent (Split-Path -Parent $mysqlExe)
  $logPath = Join-Path $projectRoot '.local\mysql-logs\mysql.err'
  $arguments = @('--no-defaults', "--basedir=`"$mysqlBase`"", "--datadir=`"$dataPath`"", '--port=3311', '--bind-address=127.0.0.1', '--mysqlx=OFF', "--log-error=`"$logPath`"")
  $process = Start-Process -FilePath $mysqlExe -ArgumentList $arguments -WindowStyle Hidden -PassThru
  $process.Id | Set-Content -LiteralPath $mysqlPidFile
}
Write-Host 'Local demo: http://localhost:3100. Sign-in details: .local/demo-login.txt'
Write-Host 'MySQL may take a few seconds to become ready after a restart.'
npm run dev
