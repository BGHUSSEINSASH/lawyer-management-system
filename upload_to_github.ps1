# ============================================
# سكريبت رفع المشروع على GitHub - نسخة محسّنة
# ============================================

Write-Host "🚀 بدء رفع المشروع على GitHub..." -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor DarkGray

# إعدادات المشروع
$repoName = "lawyer-management-system"
$description = "نظام إدارة المحامين v7.0 - نظام متكامل لإدارة مكتب المحاماة مع Firebase"
$configFile = ".git-credentials"

# التحقق من وجود ملف التوكن المحفوظ
if (Test-Path $configFile) {
    Write-Host "📋 تم العثور على توكن محفوظ..." -ForegroundColor Green
    $savedCreds = Get-Content $configFile | ConvertFrom-Json
    $username = $savedCreds.username
    $tokenPlain = $savedCreds.token
    
    Write-Host "المستخدم: $username" -ForegroundColor Cyan
    $useSaved = Read-Host "استخدام التوكن المحفوظ؟ (Y/n)"
    
    if ($useSaved -eq "" -or $useSaved -eq "Y" -or $useSaved -eq "y") {
        Write-Host "✅ استخدام التوكن المحفوظ" -ForegroundColor Green
    } else {
        Remove-Item $configFile -Force
        $username = $null
        $tokenPlain = $null
    }
}

# طلب التوكن إذا لم يكن محفوظاً
if (-not $username -or -not $tokenPlain) {
    Write-Host "`n📋 إدخال بيانات GitHub:" -ForegroundColor Yellow
    Write-Host "============================================" -ForegroundColor DarkGray
    
    $username = Read-Host "اسم المستخدم على GitHub"
    
    Write-Host "`n💡 لإنشاء Personal Access Token:" -ForegroundColor Yellow
    Write-Host "   1. افتح: https://github.com/settings/tokens/new" -ForegroundColor White
    Write-Host "   2. اختر: No expiration (بدون انتهاء)" -ForegroundColor White
    Write-Host "   3. اختر Scopes: ✅ repo" -ForegroundColor White
    Write-Host "   4. انسخ الـ Token`n" -ForegroundColor White
    
    $token = Read-Host "Personal Access Token (لن يُحفظ إلا إذا نجح الرفع)"
    $tokenPlain = $token
    
    # حفظ التوكن
    $saveToken = Read-Host "`nحفظ التوكن للاستخدام المستقبلي؟ (Y/n)"
    if ($saveToken -eq "" -or $saveToken -eq "Y" -or $saveToken -eq "y") {
        $credentials = @{
            username = $username
            token = $tokenPlain
            created = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        } | ConvertTo-Json
        
        $credentials | Out-File -FilePath $configFile -Encoding UTF8
        Write-Host "💾 تم حفظ التوكن في $configFile" -ForegroundColor Green
    }
}

Write-Host "`n🔨 إنشاء المستودع على GitHub..." -ForegroundColor Green
Write-Host "============================================" -ForegroundColor DarkGray

$headers = @{
    "Authorization" = "token $tokenPlain"
    "Accept" = "application/vnd.github.v3+json"
}

$body = @{
    name = $repoName
    description = $description
    private = $false
    auto_init = $false
    has_issues = $true
    has_projects = $true
    has_wiki = $true
} | ConvertTo-Json

try {
    # محاولة إنشاء المستودع
    try {
        $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
        Write-Host "✅ تم إنشاء المستودع بنجاح!" -ForegroundColor Green
        Write-Host "🔗 رابط المستودع: $($response.html_url)" -ForegroundColor Cyan
    } catch {
        if ($_.Exception.Response.StatusCode -eq 422) {
            Write-Host "⚠️  المستودع موجود مسبقاً - سيتم استخدامه" -ForegroundColor Yellow
        } else {
            throw $_
        }
    }
    
    # رفع الكود
    Write-Host "`n📤 رفع الكود إلى GitHub..." -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor DarkGray
    
    # إزالة remote القديم إن وجد
    git remote remove origin 2>$null
    
    # إعداد Git لاستخدام التوكن
    git config --global credential.helper store
    
    # إضافة remote جديد
    $repoUrl = "https://github.com/${username}/${repoName}.git"
    git remote add origin $repoUrl
    
    # حفظ التوكن في credential helper
    "https://${username}:${tokenPlain}@github.com" | git credential approve
    
    # رفع الكود
    git push -u origin main
    
    Write-Host "`n✨ ============================================" -ForegroundColor Green
    Write-Host "🎉 تم رفع المشروع بنجاح!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "`n📊 روابط المشروع:" -ForegroundColor Cyan
    Write-Host "   🔗 GitHub: https://github.com/${username}/${repoName}" -ForegroundColor White
    Write-Host "   🌐 موقع مباشر: https://test-b5a31.web.app" -ForegroundColor White
    Write-Host "   📱 Firebase: https://console.firebase.google.com/project/test-b5a31" -ForegroundColor White
    Write-Host "`n💡 الملفات المرفوعة:" -ForegroundColor Cyan
    Write-Host "   ✅ public/ - الواجهة الأمامية" -ForegroundColor White
    Write-Host "   ✅ backend/ - الخادم (.NET)" -ForegroundColor White
    Write-Host "   ✅ firebase.json - إعدادات Firebase" -ForegroundColor White
    Write-Host "   ✅ manifest.json - PWA" -ForegroundColor White
    Write-Host "   ✅ sw.js - Service Worker" -ForegroundColor White
    
} catch {
    Write-Host "`n❌ خطأ: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n📋 ملاحظات للإصلاح:" -ForegroundColor Yellow
    Write-Host "   1. تأكد من صحة اسم المستخدم والـ Token" -ForegroundColor White
    Write-Host "   2. تأكد أن الـ Token له صلاحية 'repo'" -ForegroundColor White
    Write-Host "   3. تأكد من اتصالك بالإنترنت" -ForegroundColor White
    Write-Host "   4. إذا فشل، حاول يدوياً:" -ForegroundColor White
    Write-Host "      git remote add origin https://github.com/${username}/${repoName}.git" -ForegroundColor DarkGray
    Write-Host "      git push -u origin main" -ForegroundColor DarkGray
    
    # حذف التوكن المحفوظ إذا فشل
    if (Test-Path $configFile) {
        $removeToken = Read-Host "`nحذف التوكن المحفوظ؟ (y/N)"
        if ($removeToken -eq "y" -or $removeToken -eq "Y") {
            Remove-Item $configFile -Force
            Write-Host "🗑️  تم حذف التوكن المحفوظ" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n============================================" -ForegroundColor DarkGray
Read-Host "اضغط Enter للخروج"
