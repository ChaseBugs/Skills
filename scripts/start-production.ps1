$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
if (-not (Test-Path -LiteralPath '.next\BUILD_ID')) { throw 'Run npm run build first.' }
$env:NODE_ENV = 'production'
$nodeExe = (Get-Command node.exe -ErrorAction Stop).Source
& $nodeExe 'node_modules\next\dist\bin\next' start --hostname 127.0.0.1 --port 3100
exit $LASTEXITCODE
