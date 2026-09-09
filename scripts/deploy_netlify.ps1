Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$projectDir = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $projectDir "out"
$zipPath = Join-Path $projectDir "deploy.zip"

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
$files = Get-ChildItem -Path $outDir -Recurse -File

foreach ($f in $files) {
    $rel = $f.FullName.Substring($outDir.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $f.FullName, $rel) | Out-Null
}
$zip.Dispose()

$envFile = Join-Path $projectDir ".env"
$netlifyToken = ""

if (Test-Path $envFile) {
    $envLines = Get-Content $envFile
    foreach ($line in $envLines) {
        if ($line -match '^NETLIFY_AUTH_TOKEN=(.*)$') {
            $netlifyToken = $matches[1].Trim()
        }
    }
}

if ($netlifyToken) {
    $siteId = "e5e64f46-f20e-463c-87ed-1054abd35817"
    $bytes = [System.IO.File]::ReadAllBytes($zipPath)
    $uri = "https://api.netlify.com/api/v1/sites/$siteId/deploys"
    
    $headers = @{
        "Authorization" = "Bearer $netlifyToken"
        "Content-Type"  = "application/zip"
    }

    $resp = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $bytes
    Write-Host "Netlify Deploy ID: $($resp.id)"
    Write-Host "Deploy State: $($resp.state)"
    Write-Host "Deploy URL: $($resp.ssl_url)"
} else {
    Write-Host "NETLIFY_AUTH_TOKEN not found in .env"
}

