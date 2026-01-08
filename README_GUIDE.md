# منصة حسابات المحامين - دليل التشغيل الكامل

## 🚀 التشغيل السريع

### 1. تشغيل Backend (ASP.NET Core)

```powershell
# من مجلد المشروع
Set-Location "c:\Users\BGHUSSEINSASH\Desktop\منصة حسابات محامين\backend"

# استعادة الحزم
dotnet restore

# تشغيل الخادم
dotnet run --urls "http://localhost:5088"
```

الخادم سيعمل على: `http://localhost:5088`
- Swagger UI: `http://localhost:5088/swagger`
- Health Check: `http://localhost:5088/`

### 2. تشغيل Frontend

```powershell
# فتح الواجهة في المتصفح
Start-Process "c:\Users\BGHUSSEINSASH\Desktop\منصة حسابات محامين\index.html"
```

## 🔑 بيانات الدخول الافتراضية

- **اسم المستخدم:** `admin`
- **كلمة المرور:** `admin123`

## 🔄 آلية العمل

### الوضع المدمج (Backend + Frontend)

1. **عند تسجيل الدخول:**
   - يحاول النظام الاتصال بـ API أولاً
   - إذا نجح: يستخدم قاعدة البيانات من الخادم + JWT
   - إذا فشل: يتحول تلقائياً للوضع المحلي (localStorage)

2. **العمليات (CRUD):**
   - جميع العمليات تُرسل للـ API أولاً
   - عند النجاح: تُحفظ أيضاً محلياً كنسخة احتياطية
   - عند الفشل: تعمل محلياً فقط

3. **الأمان:**
   - JWT Token مخزن في localStorage
   - كلمات المرور مشفرة بـ BCrypt
   - الصلاحيات محمية على مستوى الخادم

## 🧪 اختبار API

### تسجيل الدخول

```powershell
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Method Post -Uri "http://localhost:5088/api/auth/login" -Body $body -ContentType "application/json"
$token = $response.token
Write-Output "Token: $token"
```

### جلب الموكلين

```powershell
$headers = @{
    Authorization = "Bearer $token"
}
Invoke-RestMethod -Method Get -Uri "http://localhost:5088/api/clients" -Headers $headers
```

### إضافة موكل جديد

```powershell
$client = @{
    name = "أحمد محمد"
    phone = "+966500000000"
    email = "ahmad@example.com"
    address = "الرياض"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:5088/api/clients" -Body $client -Headers $headers -ContentType "application/json"
```

## 📊 Endpoints المتاحة

### المصادقة
- `POST /api/auth/login` - تسجيل الدخول

### المستخدمين
- `GET /api/users` - قائمة المستخدمين (مدير فقط)
- `POST /api/users` - إضافة مستخدم (مدير فقط)
- `PUT /api/users/{id}` - تعديل مستخدم
- `DELETE /api/users/{id}` - حذف مستخدم

### الموكلين
- `GET /api/clients` - قائمة الموكلين
- `GET /api/clients/{id}` - تفاصيل موكل + معاملاته
- `POST /api/clients` - إضافة موكل
- `PUT /api/clients/{id}` - تعديل موكل
- `DELETE /api/clients/{id}` - حذف موكل

### المحامين
- `GET /api/lawyers` - قائمة المحامين
- `POST /api/lawyers` - إضافة محامي
- `PUT /api/lawyers/{id}` - تعديل محامي
- `DELETE /api/lawyers/{id}` - حذف محامي

### القضايا
- `GET /api/cases` - قائمة القضايا
- `POST /api/cases` - إضافة قضية
- `PUT /api/cases/{id}` - تعديل قضية
- `DELETE /api/cases/{id}` - حذف قضية

### المعاملات المالية
- `GET /api/transactions` - قائمة المعاملات
- `POST /api/transactions` - إضافة معاملة
- `PUT /api/transactions/{id}` - تعديل معاملة
- `DELETE /api/transactions/{id}` - حذف معاملة

### التقارير
- `GET /api/reports/summary` - ملخص عام
- `GET /api/reports/client-balances` - أرصدة الموكلين
- `GET /api/reports/monthly-revenue?year=2025` - الإيرادات الشهرية

### الإعدادات
- `GET /api/settings/company` - بيانات الشركة
- `POST /api/settings/company` - حفظ بيانات الشركة

## 🔧 الإعدادات المتقدمة

### تعطيل Backend والعمل محلياً فقط

في `app.js`، غيّر:
```javascript
let useBackend = false; // تبديل إلى false للاستخدام المحلي فقط
```

### تغيير رابط API

في `app.js`، غيّر:
```javascript
const API_BASE_URL = 'http://your-server:port/api';
```

## 📁 هيكل المشروع

```
منصة حسابات محامين/
├── backend/                    # ASP.NET Core Web API
│   ├── Controllers/           # REST API Controllers
│   ├── Models/                # Entity Models
│   ├── Data/                  # DbContext & Seeding
│   ├── Services/              # Business Logic (Logging)
│   ├── Program.cs             # App Configuration
│   └── lawyer_platform.db     # SQLite Database
├── index.html                 # الواجهة الرئيسية
├── app.js                     # منطق التطبيق + API Integration
├── style.css                  # التصميم
└── README_GUIDE.md           # هذا الملف
```

## 🛡️ الأمان

- ✅ كلمات المرور مشفرة بـ BCrypt
- ✅ JWT للمصادقة
- ✅ CORS محمي
- ✅ التحقق من الصلاحيات على الخادم
- ✅ تسجيل النشاطات (Activity Logs)

## 💾 قاعدة البيانات

- **النوع:** SQLite
- **الموقع:** `backend/lawyer_platform.db`
- **التهيئة التلقائية:** عند أول تشغيل
- **البيانات الأولية:** مستخدم admin + عينات

## 🎯 الميزات الرئيسية

### Frontend
- ✅ واجهة عربية كاملة
- ✅ نظام صلاحيات متقدم
- ✅ إدارة الموكلين مع نظام دائن/مدين
- ✅ طباعة الفواتير والكشوفات
- ✅ تصدير PDF/Excel
- ✅ وضع داكن/فاتح
- ✅ قائمة جانبية قابلة للإخفاء

### Backend
- ✅ RESTful API كامل
- ✅ Entity Framework Core
- ✅ JWT Authentication
- ✅ Activity Logging
- ✅ Password Hashing
- ✅ Role-based Access Control
- ✅ Swagger Documentation

## 🐛 استكشاف الأخطاء

### الخادم لا يعمل
```powershell
# تحقق من المنفذ
netstat -ano | findstr :5088

# أوقف العملية إذا كانت مشغولة
Stop-Process -Id <PID> -Force
```

### خطأ في الاتصال بـ API
- تأكد من تشغيل الخادم
- تحقق من عنوان API في `app.js`
- افتح Console في المتصفح للتفاصيل

### لا يمكن تسجيل الدخول
- تأكد من اسم المستخدم: `admin`
- كلمة المرور: `admin123`
- تحقق من Console للأخطاء

## 📞 الدعم

للمزيد من المساعدة، راجع:
- `backend/README.md` - وثائق API
- Swagger UI عند التشغيل
- Activity Logs في قاعدة البيانات
