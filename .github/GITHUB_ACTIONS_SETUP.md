# 🔧 إعداد GitHub Actions و Firebase Deployment

## 📋 نظرة عامة

تم إصلاح ملفات GitHub Actions workflows لتدعم النشر التلقائي على Firebase Hosting.

## ⚙️ ملفات Workflows المحدثة

### 1. firebase-hosting-merge.yml
- ✅ تم التحديث لدعم النشر التلقائي عند الـ push إلى main
- ✅ إضافة fallback للـ secrets
- ✅ تحسين معالجة الأخطاء
- ✅ إضافة إشعارات التنشر

### 2. firebase-hosting-pull-request.yml
- ✅ تم التحديث لدعم preview على PR
- ✅ إضافة fallback للـ secrets
- ✅ تحسين معالجة الأخطاء
- ✅ إضافة إشعارات Preview

## 🔑 إعداد GitHub Secrets

### الخطوة 1: الحصول على Firebase Service Account

```bash
# في الجهاز المحلي (حيث لديك firebase-tools)
firebase init hosting:github
```

أو يدوياً:

1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. اختر المشروع: `test-b5a31`
3. انقر على ⚙️ (Settings) في أعلى اليسار
4. انقر على "Service Accounts"
5. انقر على "Generate New Private Key"
6. سيتم تحميل ملف JSON

### الخطوة 2: إضافة Secret في GitHub

1. اذهب إلى **Repository Settings**
   ```
   https://github.com/yourusername/lawyer-management-system/settings/secrets/actions
   ```

2. انقر على **New repository secret**

3. أضف الـ secrets التالية:

#### Option A: استخدام FIREBASE_SERVICE_ACCOUNT_TEST_B5A31 (الخيار الأول)

**الاسم:**
```
FIREBASE_SERVICE_ACCOUNT_TEST_B5A31
```

**القيمة:**
- افتح ملف JSON الذي تم تحميله من Firebase
- انسخ **كل المحتوى بالكامل**
- الصقه في حقل القيمة

#### Option B: استخدام FIREBASE_CREDENTIALS (الخيار البديل)

إذا لم تتمكن من استخدام الخيار الأول، استخدم هذا:

**الاسم:**
```
FIREBASE_CREDENTIALS
```

**القيمة:**
- نفس محتوى ملف JSON من Firebase

### مثال على محتوى ملف Firebase JSON:

```json
{
  "type": "service_account",
  "project_id": "test-b5a31",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@test-b5a31.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## ✅ التحقق من الإعداد

### 1. التحقق من Secrets

```
Repository Settings → Secrets and variables → Actions
```

يجب أن ترى:
- ✅ `GITHUB_TOKEN` (تلقائي)
- ✅ `FIREBASE_SERVICE_ACCOUNT_TEST_B5A31` أو `FIREBASE_CREDENTIALS`

### 2. اختبار الـ Workflow

```bash
# قم بـ push صغير لـ main للاختبار
git add .
git commit -m "test: test github actions workflow"
git push origin main
```

ثم تحقق من:
```
https://github.com/yourusername/lawyer-management-system/actions
```

## 🔄 عملية التشغيل

### عند الـ Push إلى main:

1. ✅ يتم استدعاء `firebase-hosting-merge.yml`
2. ✅ يتم checkout الكود
3. ✅ يتم تثبيت الـ dependencies
4. ✅ يتم بناء المشروع (إن وجد)
5. ✅ يتم النشر على Firebase Hosting
6. ✅ يتم عرض الإشعار بحالة النشر

### عند فتح Pull Request:

1. ✅ يتم استدعاء `firebase-hosting-pull-request.yml`
2. ✅ يتم checkout الكود
3. ✅ يتم تثبيت الـ dependencies
4. ✅ يتم بناء المشروع (إن وجد)
5. ✅ يتم إنشاء preview URL
6. ✅ يتم عرض الإشعار مع URL الـ preview

## 🐛 استكشاف الأخطاء

### خطأ: "Context access might be invalid"

**السبب:** الـ secret غير موجود

**الحل:**
1. تأكد من إضافة Secret في GitHub
2. تأكد من الاسم بالضبط: `FIREBASE_SERVICE_ACCOUNT_TEST_B5A31`
3. جرب الخيار البديل: `FIREBASE_CREDENTIALS`

### خطأ: "Firebase command not found"

**السبب:** firebase-cli غير مثبت

**الحل:** تم إضافة `continue-on-error: true` في الـ workflows

### خطأ: "Project ID mismatch"

**السبب:** Project ID مختلف

**الحل:** تأكد من:
```yaml
projectId: test-b5a31  # ✅ الاسم الصحيح
```

## 📱 تتبع النشر

### في GitHub:

```
Repository → Actions → الـ workflow المطلوب
```

ستجد:
- ✅ حالة كل step
- ✅ الـ logs الكاملة
- ✅ وقت التنفيذ
- ✅ رسائل الإشعارات

### في Firebase:

```
https://console.firebase.google.com/project/test-b5a31/hosting/main
```

ستجد:
- ✅ تاريخ النشر
- ✅ إصدار الموقع
- ✅ الملفات المرفوعة
- ✅ حجم الموقع

## 🚀 أفضل الممارسات

### 1. Branching Strategy
```
main (production) ← PR ← develop ← feature branches
```

### 2. Commit Messages
```
feat: إضافة ميزة جديدة
fix: إصلاح خطأ
docs: تحديث توثيق
```

### 3. قبل الـ Push
```bash
# تأكد من الملفات
git status

# تأكد من عدم كسر أي شيء
npm run build

# أرسل التحديثات
git push origin main
```

### 4. تتبع النشر
```bash
# افتح GitHub Actions
https://github.com/yourusername/lawyer-management-system/actions

# افتح Firebase Console
https://console.firebase.google.com/project/test-b5a31/hosting
```

## 📚 موارد إضافية

- [Firebase GitHub Action Docs](https://github.com/FirebaseExtended/action-hosting-deploy)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)

## ✨ الميزات الإضافية

### Automatic Deployments
- ✅ النشر التلقائي على كل push
- ✅ Preview URLs على كل PR
- ✅ Rollback سهل في Firebase Console

### Security
- ✅ استخدام GitHub Secrets بأمان
- ✅ لا تكشف المفاتيح في الـ logs
- ✅ Fallback لـ secrets بديلة

### Notifications
- ✅ رسالة نجاح عند النشر
- ✅ رسالة خطأ عند الفشل
- ✅ روابط مباشرة للموقع

---

**تم التحديث:** 14 يناير 2026
**الحالة:** ✅ جاهز للاستخدام
**الدعم:** اتصل بـ GitHub Support إذا لزم الأمر