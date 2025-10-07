# Test BSSC Chain ID
Write-Host "Testing BSSC RPC Chain ID..." -ForegroundColor Green
Write-Host ""

$response = Invoke-RestMethod -Uri "https://bssc-rpc.bssc.live" -Method Post -ContentType "application/json" -Body '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}' -Headers @{"Cache-Control"="no-cache"}

Write-Host "Response from RPC:" -ForegroundColor Cyan
Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
Write-Host ""

$chainIdHex = $response.result
$chainIdDecimal = [Convert]::ToInt32($chainIdHex, 16)

Write-Host "Chain ID (Hex): $chainIdHex" -ForegroundColor Yellow
Write-Host "Chain ID (Decimal): $chainIdDecimal" -ForegroundColor Yellow
Write-Host ""

if ($chainIdDecimal -eq 47964) {
    Write-Host "SUCCESS! Chain ID is 47964 (BSSC)" -ForegroundColor Green
} elseif ($chainIdDecimal -eq 56) {
    Write-Host "Still showing 56 (BSC) - Render cache may not be cleared yet" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try these steps:" -ForegroundColor Yellow
    Write-Host "1. Hard refresh: Ctrl+F5 in MetaMask" -ForegroundColor White
    Write-Host "2. Clear browser cache" -ForegroundColor White
    Write-Host "3. Wait 1-2 more minutes for CDN cache to clear" -ForegroundColor White
} else {
    Write-Host "Chain ID: $chainIdDecimal" -ForegroundColor White
}

