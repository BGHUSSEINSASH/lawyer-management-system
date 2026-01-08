<!-- ==================== تعليمات الدمج (Integration Instructions) ==================== -->

## 🔧 تعليمات دمج نظام الديون في الواجهة الأمامية

### الخطوة 1: إضافة المكتبات المطلوبة في `index.html`

أضف هذه الأسطر في نهاية `<head>` في ملف `index.html`:

```html
<!-- مكتبة الرسوم البيانية (اختيارية لكن موصى بها) -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- ملف نظام الديون -->
<script src="debts.js"></script>
```

### الخطوة 2: إضافة قسم الديون في `<main>`

انسخ محتوى ملف `debtor-section.html` بالكامل وأضفه في العنصر `<main class="main-content">` في `index.html` بعد جميع الأقسام الأخرى.

**موقع الإدراج:**
```html
<main class="main-content">
    <!-- جميع الأقسام الأخرى (dashboard, lawyers, cases, etc) -->
    
    <!-- هنا: أضف محتوى debtor-section.html -->
    
</main>
```

### الخطوة 3: تفعيل زر القائمة الجانبية

يجب أن يكون هناك بالفعل زر في القائمة الجانبية:
```html
<button class="nav-item" onclick="showSection('debtor')">
    <span class="icon">💵</span>
    <span>المدينون والدائنون</span>
</button>
```

### الخطوة 4: إضافة دوال JavaScript الأساسية

أضف هذه الدوال في ملف `app.js`:

```javascript
// ==================== دوال إدارة أقسام الديون ====================

function switchDebtTab(tabName) {
    // إخفاء جميع أقسام الديون
    document.querySelectorAll('.debt-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // إظهار القسم المختار
    const sectionId = {
        'overview': 'debtOverview',
        'create': 'debtCreate',
        'list': 'debtList',
        'analytics': 'debtAnalytics'
    }[tabName];
    
    if (sectionId) {
        document.getElementById(sectionId).style.display = 'block';
    }
    
    // تحديث الأزرار النشطة
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.style.color = '#7f8c8d';
        btn.style.borderBottomColor = 'transparent';
    });
    event.target.style.color = '#2c3e50';
    event.target.style.borderBottomColor = '#667eea';
    
    // تحديث البيانات
    if (tabName === 'overview') {
        loadDebtOverview();
    } else if (tabName === 'list') {
        loadDebtList();
    } else if (tabName === 'analytics') {
        loadDebtAnalytics();
    }
}

function loadDebtOverview() {
    // تحميل البيانات من Backend أو localStorage
    loadDebtSummary();
    loadOverdueDebts();
    loadDebtAgeAnalysis();
}

function loadDebtList() {
    // تحميل قائمة الديون
    filterDebts();
}

function loadDebtAnalytics() {
    // تحميل التحليلات
    loadDebtAnalyticsData();
}

async function loadDebtSummary() {
    const summary = await getDebtSummary();
    
    // تحديث الإحصائيات
    document.getElementById('totalReceivables').textContent = formatCurrency(summary.totalReceivables);
    document.getElementById('totalPayables').textContent = formatCurrency(summary.totalPayables);
    document.getElementById('netPosition').textContent = formatCurrency(summary.netPosition);
    document.getElementById('overdueAmount').textContent = formatCurrency(summary.overdueAmount);
    
    // رسم المخططات
    drawDebtTypeChart(summary);
    drawDebtStatusChart(summary);
}

async function loadOverdueDebts() {
    const overdueDebts = await getOverdueDebts();
    const container = document.getElementById('overdueDebtsList');
    
    if (overdueDebts.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#27ae60;font-size:1.1em">✅ لا توجد ديون متأخرة</p>';
        return;
    }
    
    container.innerHTML = overdueDebts.map(debt => `
        <div class="debt-item">
            <div class="debt-item-header">
                <div>
                    <div class="debt-item-title">🚨 ${debt.name}</div>
                    <small style="color:#7f8c8d">${DEBT_TYPES[debt.type]}</small>
                </div>
                <span class="debt-item-badge" style="background:#e74c3c;color:white">
                    متأخرة ${Math.floor((new Date() - new Date(debt.dueDate)) / (1000 * 60 * 60 * 24))} يوم
                </span>
            </div>
            <div class="debt-item-details">
                <div class="debt-item-detail">
                    <span class="debt-item-detail-label">المبلغ المتبقي:</span>
                    <span class="debt-item-detail-value">${formatCurrency(debt.remainingAmount)}</span>
                </div>
                <div class="debt-item-detail">
                    <span class="debt-item-detail-label">تاريخ الاستحقاق:</span>
                    <span class="debt-item-detail-value">${new Date(debt.dueDate).toLocaleDateString('ar-SA')}</span>
                </div>
            </div>
        </div>
    `).join('');
}

async function loadDebtAgeAnalysis() {
    const ageAnalysis = await getDebtAgeAnalysis();
    const container = document.getElementById('debtAgeAnalysisChart');
    
    // إذا كانت مكتبة Chart.js متاحة
    if (typeof Chart !== 'undefined') {
        const ctx = document.createElement('canvas');
        container.innerHTML = '';
        container.appendChild(ctx);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ageAnalysis.map(a => a.ageRange),
                datasets: [{
                    label: 'المبلغ',
                    data: ageAnalysis.map(a => a.amount),
                    backgroundColor: ['#27ae60', '#f39c12', '#e67e22', '#e74c3c'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    } else {
        // جدول بديل إذا لم تكن Chart.js متاحة
        container.innerHTML = `
            <table style="width:100%;border-collapse:collapse">
                <tr style="background:#f8f9fa;border-bottom:2px solid #ecf0f1">
                    <th style="padding:12px;text-align:right">الفئة العمرية</th>
                    <th style="padding:12px;text-align:right">العدد</th>
                    <th style="padding:12px;text-align:right">المبلغ</th>
                </tr>
                ${ageAnalysis.map(a => `
                    <tr style="border-bottom:1px solid #ecf0f1">
                        <td style="padding:12px">${a.ageRange}</td>
                        <td style="padding:12px">${a.count}</td>
                        <td style="padding:12px">${formatCurrency(a.amount)}</td>
                    </tr>
                `).join('')}
            </table>
        `;
    }
}

async function filterDebts() {
    const typeFilter = document.getElementById('debtFilterType')?.value || '';
    const statusFilter = document.getElementById('debtFilterStatus')?.value || '';
    const searchTerm = document.getElementById('debtSearchBox')?.value.toLowerCase() || '';
    
    const debts = await getAllDebts({ type: typeFilter, status: statusFilter });
    
    const filtered = debts.filter(debt =>
        debt.name.toLowerCase().includes(searchTerm) ||
        (debt.description && debt.description.toLowerCase().includes(searchTerm))
    );
    
    displayDebtTable(filtered);
}

function displayDebtTable(debts) {
    const container = document.getElementById('debtTableContainer');
    
    if (debts.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#7f8c8d">لا توجد ديون مطابقة</p>';
        return;
    }
    
    container.innerHTML = `
        <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse">
                <thead>
                    <tr style="background:#f8f9fa;border-bottom:2px solid #ecf0f1">
                        <th style="padding:15px;text-align:right;font-weight:600">الاسم</th>
                        <th style="padding:15px;text-align:right;font-weight:600">النوع</th>
                        <th style="padding:15px;text-align:right;font-weight:600">المبلغ</th>
                        <th style="padding:15px;text-align:right;font-weight:600">المتبقي</th>
                        <th style="padding:15px;text-align:right;font-weight:600">الحالة</th>
                        <th style="padding:15px;text-align:right;font-weight:600">الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${debts.map(debt => `
                        <tr style="border-bottom:1px solid #ecf0f1;hover:background:#f8f9fa">
                            <td style="padding:15px">${debt.name}</td>
                            <td style="padding:15px">${DEBT_TYPES[debt.type]}</td>
                            <td style="padding:15px">${formatCurrency(debt.totalAmount)}</td>
                            <td style="padding:15px">${formatCurrency(debt.remainingAmount)}</td>
                            <td style="padding:15px">
                                <span class="debt-item-badge" style="background:${getStatusColor(debt.status)};color:white">
                                    ${DEBT_STATUS[debt.status]}
                                </span>
                            </td>
                            <td style="padding:15px">
                                <div class="debt-actions">
                                    <button class="debt-action-btn edit" onclick="showDebtDetails(${debt.id})">✏️ تفاصيل</button>
                                    ${debt.remainingAmount > 0 ? `<button class="debt-action-btn pay" onclick="showPaymentForm(${debt.id})">💳 دفع</button>` : ''}
                                    <button class="debt-action-btn delete" onclick="deleteDebt(${debt.id})">🗑️ حذف</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function loadDebtAnalyticsData() {
    const analytics = await getDebtAnalytics();
    
    // تحديث جدول التحليلات
    const tbody = document.getElementById('analyticsTableBody');
    tbody.innerHTML = `
        <tr style="border-bottom:1px solid #ecf0f1">
            <td style="padding:15px">الديون المستحقة</td>
            <td style="padding:15px;font-weight:600">${formatCurrency(analytics.totalReceivables)}</td>
        </tr>
        <tr style="border-bottom:1px solid #ecf0f1">
            <td style="padding:15px">الديون على الشركة</td>
            <td style="padding:15px;font-weight:600">${formatCurrency(analytics.totalPayables)}</td>
        </tr>
        <tr style="border-bottom:1px solid #ecf0f1">
            <td style="padding:15px">الرصيد الصافي</td>
            <td style="padding:15px;font-weight:600;color:${analytics.netPosition >= 0 ? '#27ae60' : '#e74c3c'}">${formatCurrency(analytics.netPosition)}</td>
        </tr>
        <tr style="border-bottom:1px solid #ecf0f1">
            <td style="padding:15px">نسبة التحصيل</td>
            <td style="padding:15px;font-weight:600">${analytics.collectionRate}%</td>
        </tr>
        <tr style="border-bottom:1px solid #ecf0f1">
            <td style="padding:15px">الديون المتأخرة</td>
            <td style="padding:15px;font-weight:600;color:#e74c3c">${formatCurrency(analytics.overdueAmount)}</td>
        </tr>
        <tr>
            <td style="padding:15px">متوسط التأخير</td>
            <td style="padding:15px;font-weight:600">${analytics.daysAverageOverdue} يوم</td>
        </tr>
    `;
}

function getStatusColor(status) {
    const colors = {
        'Active': '#3498db',
        'Overdue': '#e74c3c',
        'PartiallyPaid': '#f39c12',
        'Paid': '#27ae60',
        'Written_Off': '#95a5a6',
        'Settled': '#9b59b6'
    };
    return colors[status] || '#7f8c8d';
}

// معالج نموذج إنشاء الدين
document.getElementById('createDebtForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!hasPermission('debts', 'add')) {
        showToast('⛔ ليس لديك صلاحية لإضافة ديون', 'error');
        return;
    }
    
    const debtData = {
        name: document.getElementById('debtName').value,
        type: document.getElementById('debtType').value,
        totalAmount: parseFloat(document.getElementById('debtAmount').value),
        clientId: document.getElementById('debtClient').value ? parseInt(document.getElementById('debtClient').value) : null,
        dueDate: document.getElementById('debtDueDate').value || null,
        notes: document.getElementById('debtNotes').value
    };
    
    await createDebt(debtData);
    document.getElementById('createDebtForm').reset();
    loadDebtList();
});

async function showDebtDetails(debtId) {
    const debt = await getDebt(debtId);
    const payments = await getDebtPayments(debtId);
    
    // عرض نافذة تفاصيل الدين
    const modal = createModal(`📋 تفاصيل الدين: ${debt.name}`, `
        <div style="padding:20px">
            <h4>المعلومات الأساسية</h4>
            <p><strong>النوع:</strong> ${DEBT_TYPES[debt.type]}</p>
            <p><strong>المبلغ الكلي:</strong> ${formatCurrency(debt.totalAmount)}</p>
            <p><strong>المبلغ المدفوع:</strong> ${formatCurrency(debt.paidAmount)}</p>
            <p><strong>المبلغ المتبقي:</strong> ${formatCurrency(debt.remainingAmount)}</p>
            <p><strong>الحالة:</strong> ${DEBT_STATUS[debt.status]}</p>
            <p><strong>تاريخ الاستحقاق:</strong> ${debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('ar-SA') : 'لا يوجد'}</p>
            
            ${payments.length > 0 ? `
                <h4>السجل المالي</h4>
                <table style="width:100%;border-collapse:collapse">
                    <tr style="background:#f8f9fa;border-bottom:2px solid #ecf0f1">
                        <th style="padding:10px;text-align:right">التاريخ</th>
                        <th style="padding:10px;text-align:right">المبلغ</th>
                        <th style="padding:10px;text-align:right">الطريقة</th>
                    </tr>
                    ${payments.map(p => `
                        <tr style="border-bottom:1px solid #ecf0f1">
                            <td style="padding:10px">${new Date(p.paymentDate).toLocaleDateString('ar-SA')}</td>
                            <td style="padding:10px">${formatCurrency(p.amount)}</td>
                            <td style="padding:10px">${p.paymentMethod}</td>
                        </tr>
                    `).join('')}
                </table>
            ` : ''}
        </div>
    `);
}

async function showPaymentForm(debtId) {
    const debt = await getDebt(debtId);
    const modal = createModal('💳 تسجيل دفع', `
        <form id="paymentForm" style="padding:20px;display:grid;gap:15px">
            <input type="hidden" id="paymentDebtId" value="${debtId}">
            <div>
                <label style="font-weight:600">الدين: ${debt.name}</label>
                <p>المبلغ المتبقي: ${formatCurrency(debt.remainingAmount)}</p>
            </div>
            <div>
                <label>مبلغ الدفع</label>
                <input type="number" id="paymentAmount" max="${debt.remainingAmount}" step="1" required style="width:100%;padding:10px;border:2px solid #ecf0f1;border-radius:8px">
            </div>
            <div>
                <label>طريقة الدفع</label>
                <select id="paymentMethod" required style="width:100%;padding:10px;border:2px solid #ecf0f1;border-radius:8px">
                    <option>نقد</option>
                    <option>تحويل بنكي</option>
                    <option>شيك</option>
                </select>
            </div>
            <div>
                <label>رقم المرجع (اختياري)</label>
                <input type="text" id="paymentRef" placeholder="رقم الشيك أو الحوالة" style="width:100%;padding:10px;border:2px solid #ecf0f1;border-radius:8px">
            </div>
            <button type="submit" style="background:#27ae60;color:white;padding:12px;border:none;border-radius:8px;cursor:pointer;font-weight:600">✅ تأكيد الدفع</button>
        </form>
    `);
    
    document.getElementById('paymentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('paymentAmount').value);
        const method = document.getElementById('paymentMethod').value;
        const ref = document.getElementById('paymentRef').value;
        
        await recordPayment(debtId, { amount, paymentMethod: method, referenceNumber: ref });
        modal.remove();
        loadDebtList();
    });
}

// دالة مساعدة لإنشاء نوافذ مشروط (Modal)
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.5);display:flex;align-items:center;
        justify-content:center;z-index:10000
    `;
    modal.innerHTML = `
        <div style="background:white;padding:0;border-radius:12px;max-width:600px;width:90%;box-shadow:0 10px 40px rgba(0,0,0,0.3)">
            <div style="padding:20px;border-bottom:2px solid #ecf0f1;display:flex;justify-content:space-between;align-items:center">
                <h3 style="margin:0">${title}</h3>
                <button onclick="this.closest('div').parentElement.remove()" style="background:none;border:none;font-size:1.5em;cursor:pointer">✕</button>
            </div>
            <div>${content}</div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}
```

### الخطوة 5: تفعيل البيانات الأولية (Seeds)

تأكد من تحميل البيانات الأولية عند بدء التطبيق:
```javascript
// في app.js - عند تسجيل الدخول الناجح
loadLocalDebtData();
loadDebtSummary();
```

---

## ✅ قائمة التحقق

- [ ] تم إضافة `debts.js` في `<head>`
- [ ] تم إضافة محتوى `debtor-section.html` في `<main>`
- [ ] تم إضافة جميع الدوال في `app.js`
- [ ] تم تحديث Backend مع الـ Controllers والـ Models
- [ ] تم تفعيل `useBackend = true` في `app.js`
- [ ] تم اختبار الواجهة والتحقق من عمل جميع الميزات

---

## 🧪 الاختبار

### اختبار إنشاء دين:
1. افتح الواجهة
2. انقر على "المدينون والدائنون"
3. انقر على "➕ إضافة دين"
4. ملأ النموذج وأنقر "حفظ"

### اختبار التقارير:
1. انقر على "📈 التحليلات"
2. تحقق من ظهور الرسوم البيانية والإحصائيات

---

**تم بنجاح! ✅ نظام الديون والدائنين جاهز للاستخدام الآن.**
