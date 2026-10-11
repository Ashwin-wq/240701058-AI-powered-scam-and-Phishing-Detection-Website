param(
    [string]$Message = "Auto-update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

Set-Location "c:\Users\Ashwin C\OneDrive\Documents\WP Project\PHISHSENSE"

Write-Host "Staging all changes..." -ForegroundColor Cyan
git add .

Write-Host "Committing: $Message" -ForegroundColor Cyan
git commit -m $Message

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push

Write-Host "Done! Project updated on GitHub." -ForegroundColor Green
