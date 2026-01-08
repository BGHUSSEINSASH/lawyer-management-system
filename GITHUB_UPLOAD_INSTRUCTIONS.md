# خطوات رفع المشروع على GitHub

## الطريقة 1: من خلال GitHub Desktop (الأسهل)

1. حمّل وثبت GitHub Desktop من: https://desktop.github.com/
2. افتح GitHub Desktop
3. اضغط File → Add Local Repository
4. اختر المجلد: `c:\Users\BGHUSSEINSASH\Desktop\منصة حسابات محامين`
5. اضغط Publish Repository
6. اختر اسم المستودع: `lawyer-accounting-platform`
7. اختر Public أو Private
8. اضغط Publish Repository

## الطريقة 2: من خلال موقع GitHub مباشرة

1. اذهب إلى https://github.com/new
2. اسم المستودع: `lawyer-accounting-platform`
3. اختر Public
4. **لا تضف** README أو .gitignore أو License
5. اضغط "Create repository"

6. بعد إنشاء المستودع، نفذ الأوامر التالية في PowerShell:

```powershell
Set-Location "c:\Users\BGHUSSEINSASH\Desktop\منصة حسابات محامين"

# استبدل YOUR_USERNAME باسم حسابك على GitHub
git remote add origin https://github.com/YOUR_USERNAME/lawyer-accounting-platform.git

# رفع الملفات
git branch -M main
git push -u origin main
```

## الطريقة 3: باستخدام GitHub CLI (يتطلب التثبيت)

```powershell
# تثبيت GitHub CLI
winget install --id GitHub.cli

# إعادة فتح PowerShell ثم:
Set-Location "c:\Users\BGHUSSEINSASH\Desktop\منصة حسابات محامين"

# تسجيل الدخول
gh auth login

# إنشاء المستودع ورفعه
gh repo create lawyer-accounting-platform --public --source=. --remote=origin --push
```

## ✅ تم بالفعل:
- ✅ تهيئة Git repository
- ✅ إضافة جميع الملفات
- ✅ عمل commit أول
- ✅ إنشاء .gitignore
- ✅ إنشاء README.md شامل

## 📌 بيانات المستودع المقترحة:

**الاسم:** lawyer-accounting-platform  
**الوصف:** منصة شاملة لإدارة حسابات مكاتب المحاماة - Full Stack Platform for Lawyer Accounting Management  
**Topics:** lawyer, accounting, asp-net-core, entity-framework, jwt-authentication, arabic-interface

---

**ملاحظة:** الملفات جاهزة في Git محلياً، فقط تحتاج لإنشاء المستودع على GitHub واستخدام أحد الطرق أعلاه.
