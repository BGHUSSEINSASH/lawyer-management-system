// ==================== نظام الدائن والمدين ====================

// أنواع الديون
const DEBT_TYPES = {
    ClientDebt: 'ديون العملاء',
    VendorPayable: 'ديون الموردين',
    EmployeeSalary: 'رواتب الموظفين',
    LoanPayable: 'قروض على الشركة',
    LoanReceivable: 'قروض معطاة',
    Other: 'أخرى'
};

// حالات الديون
const DEBT_STATUS = {
    Active: 'نشطة',
    Overdue: 'متأخرة',
    PartiallyPaid: 'مسددة جزئياً',
    Paid: 'مسددة',
    Written_Off: 'معدومة',
    Settled: 'مغلقة'
};

// قاعدة بيانات الديون المحلية
let debtDatabase = {
    debtRecords: [],
    debtPayments: [],
    debtProjections: []
};

// ==================== عمليات الديون ====================

async function createDebt(debt) {
    // محاولة الحفظ في Backend
    if (useBackend) {
        const result = await apiCall('/debts', 'POST', debt);
        if (result) {
            showToast('✅ تم إنشاء الدين بنجاح', 'success');
            return result;
        }
    }
    
    // الحفظ المحلي
    debt.id = Math.max(...debtDatabase.debtRecords.map(d => d.id || 0), 0) + 1;
    debt.createdAt = new Date().toISOString();
    debt.lastModified = new Date().toISOString();
    debt.remainingAmount = debt.totalAmount;
    debt.status = debt.status || 'Active';
    
    debtDatabase.debtRecords.push(debt);
    saveLocalData();
    
    showToast('✅ تم إنشاء الدين بنجاح', 'success');
    return debt;
}

async function updateDebt(debtId, updates) {
    // محاولة التحديث في Backend
    if (useBackend) {
        const result = await apiCall(`/debts/${debtId}`, 'PUT', { id: debtId, ...updates });
        if (result) {
            showToast('✅ تم تحديث الدين بنجاح', 'success');
            return result;
        }
    }
    
    // التحديث المحلي
    const debt = debtDatabase.debtRecords.find(d => d.id === debtId);
    if (!debt) {
        showToast('❌ الدين غير موجود', 'error');
        return null;
    }
    
    Object.assign(debt, updates);
    debt.lastModified = new Date().toISOString();
    
    // تحديث الحالة تلقائياً
    if (debt.remainingAmount === 0 && debt.status !== 'Paid') {
        debt.status = 'Paid';
        debt.paidDate = new Date().toISOString();
    }
    
    saveLocalData();
    showToast('✅ تم تحديث الدين بنجاح', 'success');
    return debt;
}

async function deleteDebt(debtId) {
    if (!confirm('هل أنت متأكد من حذف هذا الدين؟')) return false;
    
    // محاولة الحذف من Backend
    if (useBackend) {
        const result = await apiCall(`/debts/${debtId}`, 'DELETE');
        if (result) {
            showToast('✅ تم حذف الدين بنجاح', 'success');
            return true;
        }
    }
    
    // الحذف المحلي
    debtDatabase.debtRecords = debtDatabase.debtRecords.filter(d => d.id !== debtId);
    saveLocalData();
    showToast('✅ تم حذف الدين بنجاح', 'success');
    return true;
}

async function getDebt(debtId) {
    // محاولة الحصول من Backend
    if (useBackend) {
        const result = await apiCall(`/debts/${debtId}`);
        if (result) return result;
    }
    
    // البحث محلياً
    return debtDatabase.debtRecords.find(d => d.id === debtId);
}

async function getAllDebts(filters = {}) {
    // محاولة الحصول من Backend
    if (useBackend) {
        let url = '/debts';
        if (filters.type) url += `?type=${filters.type}`;
        if (filters.status) url += `${filters.type ? '&' : '?'}status=${filters.status}`;
        if (filters.clientId) url += `${filters.type || filters.status ? '&' : '?'}clientId=${filters.clientId}`;
        
        const result = await apiCall(url);
        if (result) return result;
    }
    
    // البحث المحلي
    let debts = [...debtDatabase.debtRecords];
    
    if (filters.type) {
        debts = debts.filter(d => d.type === filters.type);
    }
    if (filters.status) {
        debts = debts.filter(d => d.status === filters.status);
    }
    if (filters.clientId) {
        debts = debts.filter(d => d.clientId === filters.clientId);
    }
    
    return debts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ==================== العمليات المالية ====================

async function recordPayment(debtId, paymentData) {
    // محاولة التسجيل في Backend
    if (useBackend) {
        const result = await apiCall(`/debts/${debtId}/payment`, 'POST', paymentData);
        if (result) {
            showToast('✅ تم تسجيل الدفع بنجاح', 'success');
            return result;
        }
    }
    
    // التسجيل المحلي
    const debt = debtDatabase.debtRecords.find(d => d.id === debtId);
    if (!debt) {
        showToast('❌ الدين غير موجود', 'error');
        return null;
    }
    
    if (paymentData.amount > debt.remainingAmount) {
        showToast('❌ مبلغ الدفع يتجاوز الدين المتبقي', 'error');
        return null;
    }
    
    // إضافة الدفة
    const payment = {
        id: Math.max(...debtDatabase.debtPayments.map(p => p.id || 0), 0) + 1,
        debtRecordId: debtId,
        amount: paymentData.amount,
        paymentDate: new Date().toISOString(),
        paymentMethod: paymentData.paymentMethod,
        referenceNumber: paymentData.referenceNumber,
        createdAt: new Date().toISOString()
    };
    
    debtDatabase.debtPayments.push(payment);
    
    // تحديث الدين
    debt.paidAmount = (debt.paidAmount || 0) + paymentData.amount;
    debt.remainingAmount -= paymentData.amount;
    
    if (debt.remainingAmount === 0) {
        debt.status = 'Paid';
        debt.paidDate = new Date().toISOString();
    } else if (debt.paidAmount > 0) {
        debt.status = 'PartiallyPaid';
    }
    
    debt.lastModified = new Date().toISOString();
    
    saveLocalData();
    showToast('✅ تم تسجيل الدفع بنجاح', 'success');
    return payment;
}

async function getDebtPayments(debtId) {
    return debtDatabase.debtPayments.filter(p => p.debtRecordId === debtId)
        .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
}

// ==================== التقارير والإحصائيات ====================

async function getDebtSummary() {
    // محاولة الحصول من Backend
    if (useBackend) {
        const result = await apiCall('/debts/reports/summary');
        if (result) return result;
    }
    
    // الحساب المحلي
    const debts = debtDatabase.debtRecords;
    
    return {
        totalDebtRecords: debts.length,
        clientDebts: debts.filter(d => d.type === 'ClientDebt').reduce((s, d) => s + d.totalAmount, 0),
        vendorPayables: debts.filter(d => d.type === 'VendorPayable').reduce((s, d) => s + d.totalAmount, 0),
        employeeSalaries: debts.filter(d => d.type === 'EmployeeSalary').reduce((s, d) => s + d.totalAmount, 0),
        loansPayable: debts.filter(d => d.type === 'LoanPayable').reduce((s, d) => s + d.totalAmount, 0),
        loansReceivable: debts.filter(d => d.type === 'LoanReceivable').reduce((s, d) => s + d.totalAmount, 0),
        
        activeCount: debts.filter(d => d.status === 'Active').length,
        overdueCount: debts.filter(d => d.status === 'Overdue').length,
        partialllyPaidCount: debts.filter(d => d.status === 'PartiallyPaid').length,
        paidCount: debts.filter(d => d.status === 'Paid').length,
        
        totalRemaining: debts.reduce((s, d) => s + (d.remainingAmount || 0), 0),
        totalPaid: debts.reduce((s, d) => s + (d.paidAmount || 0), 0),
        totalAmount: debts.reduce((s, d) => s + d.totalAmount, 0),
        
        averageDebtAmount: debts.length > 0 ? debts.reduce((s, d) => s + d.totalAmount, 0) / debts.length : 0,
        averageRemainingAmount: debts.length > 0 ? debts.reduce((s, d) => s + (d.remainingAmount || 0), 0) / debts.length : 0
    };
}

async function getDebtAnalytics() {
    // محاولة الحصول من Backend
    if (useBackend) {
        const result = await apiCall('/debts/reports/analytics');
        if (result) return result;
    }
    
    // الحساب المحلي
    const debts = debtDatabase.debtRecords;
    const now = new Date();
    
    const overdue = debts.filter(d => d.dueDate && new Date(d.dueDate) < now && d.remainingAmount > 0);
    const receivables = debts.filter(d => (d.type === 'ClientDebt' || d.type === 'LoanReceivable') && d.remainingAmount > 0);
    const payables = debts.filter(d => (d.type === 'VendorPayable' || d.type === 'EmployeeSalary' || d.type === 'LoanPayable') && d.remainingAmount > 0);
    
    const totalReceivables = receivables.reduce((s, d) => s + d.remainingAmount, 0);
    const totalPayables = payables.reduce((s, d) => s + d.remainingAmount, 0);
    const totalAmount = debts.reduce((s, d) => s + d.totalAmount, 0);
    const totalPaid = debts.reduce((s, d) => s + (d.paidAmount || 0), 0);
    
    return {
        overdueAmount: overdue.reduce((s, d) => s + d.remainingAmount, 0),
        overdueCount: overdue.length,
        daysAverageOverdue: overdue.length > 0 ? Math.round(overdue.reduce((s, d) => s + (now - new Date(d.dueDate)) / (1000 * 60 * 60 * 24), 0) / overdue.length) : 0,
        
        totalReceivables: totalReceivables,
        totalPayables: totalPayables,
        netPosition: totalReceivables - totalPayables,
        
        collectionRate: totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100 * 100) / 100 : 0,
        
        debtsByTypeBreakdown: {
            'ClientDebt': debts.filter(d => d.type === 'ClientDebt').reduce((s, d) => s + d.remainingAmount, 0),
            'VendorPayable': debts.filter(d => d.type === 'VendorPayable').reduce((s, d) => s + d.remainingAmount, 0),
            'EmployeeSalary': debts.filter(d => d.type === 'EmployeeSalary').reduce((s, d) => s + d.remainingAmount, 0),
            'LoanPayable': debts.filter(d => d.type === 'LoanPayable').reduce((s, d) => s + d.remainingAmount, 0),
            'LoanReceivable': debts.filter(d => d.type === 'LoanReceivable').reduce((s, d) => s + d.remainingAmount, 0)
        }
    };
}

async function getOverdueDebts() {
    const debts = await getAllDebts();
    const now = new Date();
    
    return debts.filter(d => d.dueDate && new Date(d.dueDate) < now && d.remainingAmount > 0)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

async function getDebtAgeAnalysis() {
    // محاولة الحصول من Backend
    if (useBackend) {
        const result = await apiCall('/debts/reports/age-analysis');
        if (result) return result;
    }
    
    // الحساب المحلي
    const debts = debtDatabase.debtRecords.filter(d => d.remainingAmount > 0);
    const now = new Date();
    
    const ageGroups = [];
    
    const current = debts.filter(d => !d.dueDate || new Date(d.dueDate) > now);
    if (current.length > 0 || current.reduce((s, d) => s + d.remainingAmount, 0) > 0) {
        ageGroups.push({
            ageRange: 'لم تستحق بعد',
            count: current.length,
            amount: current.reduce((s, d) => s + d.remainingAmount, 0)
        });
    }
    
    const days30 = debts.filter(d => d.dueDate && new Date(d.dueDate) <= now && new Date(d.dueDate) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
    if (days30.length > 0) {
        ageGroups.push({
            ageRange: 'متأخرة 1-30 يوم',
            count: days30.length,
            amount: days30.reduce((s, d) => s + d.remainingAmount, 0)
        });
    }
    
    const days60 = debts.filter(d => d.dueDate && new Date(d.dueDate) <= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) && new Date(d.dueDate) > new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000));
    if (days60.length > 0) {
        ageGroups.push({
            ageRange: 'متأخرة 31-60 يوم',
            count: days60.length,
            amount: days60.reduce((s, d) => s + d.remainingAmount, 0)
        });
    }
    
    const days90 = debts.filter(d => d.dueDate && new Date(d.dueDate) <= new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) && new Date(d.dueDate) > new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000));
    if (days90.length > 0) {
        ageGroups.push({
            ageRange: 'متأخرة 61-90 يوم',
            count: days90.length,
            amount: days90.reduce((s, d) => s + d.remainingAmount, 0)
        });
    }
    
    const over90 = debts.filter(d => d.dueDate && new Date(d.dueDate) <= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000));
    if (over90.length > 0) {
        ageGroups.push({
            ageRange: 'متأخرة أكثر من 90 يوم',
            count: over90.length,
            amount: over90.reduce((s, d) => s + d.remainingAmount, 0)
        });
    }
    
    return ageGroups;
}

// ==================== دوال التخزين المحلي ====================

function saveLocalDebtData() {
    try {
        localStorage.setItem('debtSystem_v1', JSON.stringify(debtDatabase));
    } catch (e) {
        showToast('❌ خطأ في حفظ بيانات الديون', 'error');
    }
}

function loadLocalDebtData() {
    const saved = localStorage.getItem('debtSystem_v1');
    if (saved) {
        try {
            debtDatabase = JSON.parse(saved);
            console.log('✅ تم تحميل بيانات الديون');
        } catch (e) {
            console.error('❌ خطأ في تحميل بيانات الديون', e);
        }
    }
}

// تحميل البيانات عند بدء التطبيق
loadLocalDebtData();
