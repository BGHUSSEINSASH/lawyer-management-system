# نشر النظام على استضافة مجانية

يوضّح هذا الدليل كيفية نشر الواجهة الأمامية (Frontend) على GitHub Pages مجانًا، ونشر الـ Backend (ASP.NET Core .NET 8) على Render.com مجانًا.

## المتطلبات
- حساب GitHub.
- (اختياري) حساب على Render.com لنشر الـ Backend.
- Git مثبّت على جهازك.

---

## 1) نشر الواجهة الأمامية على GitHub Pages
الواجهة الأمامية موجودة في المجلد `public/` وهي موقع ثابت.

### الخطوات
1. أنشئ مستودعًا جديدًا على GitHub (عام).
2. ادفع هذا المشروع إلى GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
3. تمّت إضافة ملف عمل تلقائي `.github/workflows/deploy-pages.yml` الذي ينشر محتويات `public/` تلقائيًا عند الدفع إلى الفرع `main`/`master`.
4. بعد اكتمال الـ Action، فعّل GitHub Pages من Settings → Pages إذا لزم؛ العنوان سيكون:
   - https://<your-username>.github.io/<your-repo>

ملاحظات:
- أضفنا `public/404.html` لإعادة التوجيه للصفحة الرئيسة.
- الواجهة تعمل محليًا بالكامل (LocalStorage). لتفعيل الاتصال بالـ Backend، تحتاج لتعديل الإعدادات في الملف `public/app.js` لاحقًا (انظر القسم 3).

---

## 2) نشر الـ Backend على Render (مجاني)
أعددنا ملف `render.yaml` في الجذر.

### الخطوات
1. ادفع المستودع إلى GitHub (كما في الخطوة السابقة).
2. في Render.com:
   - Create New → Blueprint → اربط بالمستودع.
   - Render سيقرأ `render.yaml` ويُنشئ خدمة ويب `.NET` من مجلد `backend/`.
   - الخطة: Free.
3. متغيرات البيئة معدّة في `render.yaml`:
   - `ASPNETCORE_ENVIRONMENT=Production`
   - `Frontend__Origin=https://<your-username>.github.io/<your-repo>` (عدّلها قبل النشر أو من لوحة Render)
   - `Jwt__Key` تُولّد تلقائيًا
4. بعد الإطلاق، ستحصل على نطاق عام مثل: `https://lawyer-backend.onrender.com`

ملاحظات مهمّة:
- قاعدة البيانات الحالية SQLite محلية؛ على خطة مجانية قد تُفقد البيانات عند إعادة التشغيل/إعادة النشر. للاستخدام الجاد، استخدم قاعدة مدارة (Postgres) أو قرص دائم.
- CORS: في `backend/Program.cs` يُقرأ الأصل من `Frontend:Origin`؛ حدّث قيمة `Frontend__Origin` لتطابق رابط GitHub Pages.

---

## 3) ربط الواجهة الأمامية بالـ Backend
بشكل افتراضي، الواجهة تعمل بوضع محلي (`useBackend = false`).

لتفعيل الاتصال:
1. افتح الملف: `public/app.js`.
2. عدّل:
   - `const API_BASE_URL = 'http://localhost:5088/api';` → إلى رابط Render مثل: `https://lawyer-backend.onrender.com/api`
   - `let useBackend = false;` → `true`
3. ادفع التعديلات إلى GitHub؛ سيُعاد نشر GitHub Pages تلقائيًا.

بديل سريع (اختباري): يمكنك إبقاء الواجهة محلية والاعتماد على LocalStorage فقط دون Backend.

---

## استكشاف الأخطاء
- فشل تشغيل Render:
  - تحقّق من السجلات، ومن أن منفذ التشغيل مضبوط: أمر البدء يربط على `0.0.0.0:${PORT}`.
  - تأكد من `Frontend__Origin` مضبوط بشكل صحيح لتجنّب أخطاء CORS.
- GitHub Pages لا يعرض التحديثات:
  - افحص Actions → Deploy Pages لرسائل الخطأ.
  - تأكد أن محتوى `public/` يحوي `index.html` وملفاتك.

## روابط مفيدة
- GitHub Pages: https://pages.github.com/
- Render (.NET): https://render.com/docs/deploy-dotnet
