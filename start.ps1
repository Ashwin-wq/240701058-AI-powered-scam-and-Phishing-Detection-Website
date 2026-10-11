# Start PHISHSENSE — launches backend and frontend in separate terminal windows

$root = "c:\Users\Ashwin C\OneDrive\Documents\WP Project\PHISHSENSE"

Write-Host "Starting PHISHSENSE Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; uvicorn backend.main:app --reload --port 8000"

Start-Sleep -Seconds 2

Write-Host "Starting PHISHSENSE Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "Both services starting!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
