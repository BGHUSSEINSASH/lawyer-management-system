#!/usr/bin/env powershell
# ==================== سكريبت تشغيل نظام الدائن والمدين (PowerShell) ====================
# This script helps you set up and run the Debtor/Creditor system on Windows

Write-Host "🚀 مرحباً بك في نظام الدائن والمدين" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

# Check if .NET is installed
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Host "❌ .NET SDK غير مثبت. يرجى تثبيت .NET 8 أو أحدث" -ForegroundColor Red
    exit 1
}

Write-Host "✅ تم اكتشاف .NET SDK" -ForegroundColor Green
dotnet --version
Write-Host ""

# Navigate to backend
Write-Host "📁 الانتقال إلى مجلد Backend..." -ForegroundColor Yellow
Set-Location backend -ErrorAction SilentlyContinue
Write-Host "✅ تم الانتقال إلى Backend" -ForegroundColor Green
Write-Host ""

# Restore dependencies
Write-Host "📦 استعادة الحزم المطلوبة..." -ForegroundColor Yellow
dotnet restore
Write-Host "✅ تم استعادة الحزم" -ForegroundColor Green
Write-Host ""

# Build project
Write-Host "🔨 بناء المشروع..." -ForegroundColor Yellow
dotnet build
Write-Host "✅ تم بناء المشروع" -ForegroundColor Green
Write-Host ""

# Run the application
Write-Host "🚀 تشغيل التطبيق..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 الخادم سيعمل على: http://localhost:5088" -ForegroundColor Cyan
Write-Host "📍 Swagger UI: http://localhost:5088/swagger" -ForegroundColor Cyan
Write-Host "📍 API Base: http://localhost:5088/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 في متصفح آخر، افتح: index.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "اضغط Ctrl+C لإيقاف الخادم" -ForegroundColor Yellow
Write-Host ""

dotnet run --urls "http://localhost:5088"
