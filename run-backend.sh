#!/usr/bin/env bash
# ==================== سكريبت تشغيل نظام الدائن والمدين ====================
# This script helps you set up and run the Debtor/Creditor system

echo "🚀 مرحباً بك في نظام الدائن والمدين"
echo "=========================================="
echo ""

# Check if .NET is installed
if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET SDK غير مثبت. يرجى تثبيت .NET 8 أو أحدث"
    exit 1
fi

echo "✅ تم اكتشاف .NET SDK"
dotnet --version
echo ""

# Navigate to backend
echo "📁 الانتقال إلى مجلد Backend..."
cd backend || exit 1
echo "✅ تم الانتقال إلى Backend"
echo ""

# Restore dependencies
echo "📦 استعادة الحزم المطلوبة..."
dotnet restore
echo "✅ تم استعادة الحزم"
echo ""

# Build project
echo "🔨 بناء المشروع..."
dotnet build
echo "✅ تم بناء المشروع"
echo ""

# Run the application
echo "🚀 تشغيل التطبيق..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 الخادم سيعمل على: http://localhost:5088"
echo "📍 Swagger UI: http://localhost:5088/swagger"
echo "📍 API Base: http://localhost:5088/api"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

dotnet run --urls "http://localhost:5088"
