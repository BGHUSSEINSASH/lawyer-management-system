// ⚖️ نظام إدارة المحامين v7.0 Financial System
console.log('🚀 تحميل النظام v7.0...');

// ==================== API Configuration ====================
const API_BASE_URL = 'http://localhost:5088/api';
let authToken = localStorage.getItem('authToken') || null;
let useBackend = false; // تبديل إلى true عند جاهزية الخادم

// ==================== API Helper ====================
async function apiCall(endpoint, method = 'GET', body = null) {
    if (!useBackend) return null;
    showLoader('جاري الاتصال بالخادم...');
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { 'Authorization': `Bearer ${authToken}` })
            }
        };
        
        if (body && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                authToken = null;
                localStorage.removeItem('authToken');
                showToast('⚠️ انتهت الجلسة، يرجى تسجيل الدخول مجدداً', 'error');
                return null;
            }
            throw new Error(`API Error: ${response.status}`);
        }
        
        if (method === 'DELETE') return { success: true };
        return await response.json();
    } catch (error) {
        console.error('API Call Error:', error);
        showToast('⚠️ تحويل إلى الوضع المحلي', 'warning');
        useBackend = false;
        return null;
    } finally {
        hideLoader();
    }
}

// ====================  البيانات ==================== 
let currentUser = null;
let database = {
    lawyers: [
        { id: 1, name: 'أحمد محمد العلي', license: 'LIC-2020-001', specialty: 'قانون جنائي', phone: '07701234567', email: 'ahmed@law.com', salary: 2500000, lawyerId: 1 },
        { id: 2, name: 'فاطمة حسن الزهراء', license: 'LIC-2019-045', specialty: 'قانون مدني', phone: '07709876543', email: 'fatima@law.com', salary: 3000000, lawyerId: 2 },
        { id: 3, name: 'علي كريم الجبوري', license: 'LIC-2021-089', specialty: 'قانون تجاري', phone: '07705554444', email: 'ali@law.com', salary: 2800000, lawyerId: 3 },
        { id: 4, name: 'زينب عبدالله النجفي', license: 'LIC-2018-023', specialty: 'قانون أحوال شخصية', phone: '07703332222', email: 'zainab@law.com', salary: 2700000, lawyerId: 4 }
    ],
    cases: [
        { id: 1, caseNumber: 'C-2024-001', title: 'قضية ميراث عقاري', lawyer: 'فاطمة حسن الزهراء', lawyerId: 2, client: 'محمد سعيد الكربلائي', status: 'active', fees: 5000000, startDate: '2024-01-15', court: 'محكمة الأحوال الشخصية', description: 'نزاع حول تقسيم الميراث العقاري', sessions: [] },
        { id: 2, caseNumber: 'C-2024-002', title: 'دعوى تعويض عن حادث مروري', lawyer: 'أحمد محمد العلي', lawyerId: 1, client: 'سارة خالد البصري', status: 'active', fees: 3500000, startDate: '2024-02-10', court: 'محكمة البداءة', description: 'دعوى تعويض عن أضرار مادية وجسدية', sessions: [] },
        { id: 3, caseNumber: 'C-2024-003', title: 'قضية نزاع تجاري', lawyer: 'علي كريم الجبوري', lawyerId: 3, client: 'شركة النور للتجارة', status: 'pending', fees: 8000000, startDate: '2024-03-05', court: 'محكمة التجارة', description: 'نزاع تجاري حول عقد توريد', sessions: [] },
        { id: 4, caseNumber: 'C-2024-004', title: 'دعوى طلاق وحضانة', lawyer: 'زينب عبدالله النجفي', lawyerId: 4, client: 'مريم أحمد الموصلي', status: 'active', fees: 4000000, startDate: '2024-01-20', court: 'محكمة الأحوال الشخصية', description: 'دعوى طلاق مع طلب حضانة الأطفال', sessions: [] },
        { id: 5, caseNumber: 'C-2023-089', title: 'قضية احتيال مالي', lawyer: 'أحمد محمد العلي', lawyerId: 1, client: 'عمر فاضل الديواني', status: 'closed', fees: 6000000, startDate: '2023-11-10', endDate: '2024-11-25', court: 'محكمة الجنايات', description: 'قضية احتيال مالي - تم الحكم لصالح الموكل', sessions: [] }
    ],
    clients: [
        { id: 1, name: 'محمد سعيد الكربلائي', phone: '07801112233', email: 'm.saeed@email.com', address: 'كربلاء - حي الحسين', idNumber: '19850512001', notes: 'موكل دائم - قضايا عقارية' },
        { id: 2, name: 'سارة خالد البصري', phone: '07802223344', email: 's.khalid@email.com', address: 'البصرة - حي المعقل', idNumber: '19920308002', notes: 'قضية حادث مروري' },
        { id: 3, name: 'شركة النور للتجارة', phone: '07803334455', email: 'info@alnoor.com', address: 'بغداد - المنصور', idNumber: 'COM-2015-456', notes: 'شركة تجارية - نزاعات عقود' },
        { id: 4, name: 'مريم أحمد الموصلي', phone: '07804445566', email: 'm.ahmed@email.com', address: 'الموصل - حي الزهراء', idNumber: '19880625003', notes: 'قضية أحوال شخصية' },
        { id: 5, name: 'عمر فاضل الديواني', phone: '07805556677', email: 'o.fadel@email.com', address: 'الديوانية - حي المعلمين', idNumber: '19780914004', notes: 'قضية جنائية - محسومة' }
    ],
    transactions: [
        { id: 1, date: '2024-11-01', type: 'payment_from_client', client: 'محمد سعيد الكربلائي', lawyer: 'فاطمة حسن الزهراء', lawyerId: 2, lawyerName: 'فاطمة حسن الزهراء', amount: 2000000, description: 'دفعة أولى على أتعاب القضية C-2024-001', caseNumber: 'C-2024-001' },
        { id: 2, date: '2024-11-05', type: 'salary', lawyer: 'أحمد محمد العلي', lawyerId: 1, lawyerName: 'أحمد محمد العلي', amount: 2500000, description: 'راتب شهر نوفمبر 2024' },
        { id: 3, date: '2024-11-05', type: 'salary', lawyer: 'فاطمة حسن الزهراء', lawyerId: 2, lawyerName: 'فاطمة حسن الزهراء', amount: 3000000, description: 'راتب شهر نوفمبر 2024' },
        { id: 4, date: '2024-11-10', type: 'service_fee', client: 'سارة خالد البصري', lawyer: 'أحمد محمد العلي', lawyerId: 1, lawyerName: 'أحمد محمد العلي', amount: 1500000, description: 'رسوم استشارة وتحضير دعوى', caseNumber: 'C-2024-002' },
        { id: 5, date: '2024-11-15', type: 'payment_from_client', client: 'شركة النور للتجارة', lawyer: 'علي كريم الجبوري', lawyerId: 3, lawyerName: 'علي كريم الجبوري', amount: 3000000, description: 'دفعة مقدمة على القضية C-2024-003', caseNumber: 'C-2024-003' },
        { id: 6, date: '2024-11-20', type: 'expense', lawyer: 'علي كريم الجبوري', lawyerId: 3, lawyerName: 'علي كريم الجبوري', amount: 250000, description: 'مصاريف محكمة ورسوم قضائية', caseNumber: 'C-2024-003' },
        { id: 7, date: '2024-11-22', type: 'payment_from_client', client: 'مريم أحمد الموصلي', lawyer: 'زينب عبدالله النجفي', lawyerId: 4, lawyerName: 'زينب عبدالله النجفي', amount: 1800000, description: 'دفعة على قضية الحضانة', caseNumber: 'C-2024-004' },
        { id: 8, date: '2024-11-25', type: 'service_fee', client: 'عمر فاضل الديواني', lawyer: 'أحمد محمد العلي', lawyerId: 1, lawyerName: 'أحمد محمد العلي', amount: 2500000, description: 'أتعاب إنهاء القضية C-2023-089 بالنجاح', caseNumber: 'C-2023-089' },
        { id: 9, date: '2024-11-28', type: 'income', amount: 500000, description: 'استشارة قانونية عامة', lawyer: 'فاطمة حسن الزهراء', lawyerId: 2, lawyerName: 'فاطمة حسن الزهراء' }
    ],
    companyInfo: {
        name: 'مكتب المحاماة المتحد',
        address: 'بغداد - شارع الكندي - بناية المحامين - الطابق الخامس',
        phone: '07700123456',
        email: 'info@unitedlawoffice.com',
        logo: ''
    },
    users: [
        { 
            id: 1, 
            username: 'admin', 
            password: 'admin123', 
            name: 'المدير العام', 
            email: 'admin@law.com', 
            role: 'admin',
            customPermissions: null
        },
        { 
            id: 2, 
            username: 'lawyer', 
            password: 'lawyer123', 
            name: 'أحمد المحامي', 
            email: 'lawyer@law.com', 
            role: 'lawyer',
            customPermissions: null
        },
        { 
            id: 3, 
            username: 'accountant', 
            password: 'acc123', 
            name: 'محمد المحاسب', 
            email: 'accountant@law.com', 
            role: 'accountant',
            customPermissions: null
        }
    ]
};

// ==================== التخزين ====================
function loadData() {
    const saved = localStorage.getItem('lawyerSystem_v5');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            database = { ...database, ...parsed };
            console.log('✅ تم تحميل البيانات');
        } catch (e) {
            console.error('❌ خطأ في تحميل البيانات', e);
        }
    }
}

function saveData() {
    try {
        localStorage.setItem('lawyerSystem_v5', JSON.stringify(database));
    } catch (e) {
        showToast('❌ خطأ في حفظ البيانات', 'error');
    }
}

// ==================== الصلاحيات ====================
const PERMISSIONS = {
    admin: {
        lawyers: { view: true, add: true, edit: true, delete: true },
        cases: { view: true, add: true, edit: true, delete: true },
        clients: { view: true, add: true, edit: true, delete: true },
        transactions: { view: true, add: true, edit: true, delete: true },
        reports: { view: true, export: true },
        settings: { view: true, edit: true },
        users: { view: true, add: true, edit: true, delete: true }
    },
    lawyer: {
        lawyers: { view: true, add: false, edit: false, delete: false },
        cases: { view: true, add: true, edit: true, delete: false },
        clients: { view: true, add: true, edit: true, delete: false },
        transactions: { view: true, add: false, edit: false, delete: false },
        reports: { view: false, export: false },
        settings: { view: false, edit: false },
        users: { view: false, add: false, edit: false, delete: false }
    },
    accountant: {
        lawyers: { view: true, add: false, edit: false, delete: false },
        cases: { view: true, add: false, edit: false, delete: false },
        clients: { view: true, add: false, edit: false, delete: false },
        transactions: { view: true, add: true, edit: true, delete: false },
        reports: { view: false, export: false },
        settings: { view: false, edit: false },
        users: { view: false, add: false, edit: false, delete: false }
    }
};

function hasPermission(module, action) {
    if (!currentUser) return false;
    
    // المدير دائماً لديه كل الصلاحيات
    if (currentUser.role === 'admin') return true;
    
    // عند استخدام الخادم، اعتمد على Claims (perm) من التوكن إن وجدت
    if (currentUser.perms && Array.isArray(currentUser.perms)) {
        return currentUser.perms.includes(`${module}.${action}`);
    }

    // إذا كان لديه صلاحيات مخصصة، استخدمها
    if (currentUser.customPermissions) {
        return currentUser.customPermissions[module]?.[action] || false;
    }
    
    // وإلا استخدم صلاحيات الدور الافتراضية
    return PERMISSIONS[currentUser.role]?.[module]?.[action] || false;
}

function checkPermission(module, action) {
    if (!hasPermission(module, action)) {
        showToast('⛔ ليس لديك صلاحية للقيام بهذا الإجراء', 'error');
        return false;
    }
    return true;
}

// ==================== تسجيل الدخول ====================
// Initialize login form handler
function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.warn('⚠️ لم يتم العثور على نموذج تسجيل الدخول');
        setTimeout(initializeLoginForm, 500);
        return;
    }
    
    console.log('✅ تم تهيئة نموذج تسجيل الدخول');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username')?.value?.trim() || '';
        const password = document.getElementById('password')?.value || '';
        
        if (!username || !password) {
            showToast('❌ الرجاء إدخال اسم المستخدم وكلمة المرور', 'error');
            return;
        }
        
        console.log('🔐 محاولة تسجيل دخول:', username);
        
        // Try API login first
        if (useBackend) {
            console.log('📡 محاولة الاتصال بالخادم...');
            const result = await apiCall('/auth/login', 'POST', { username, password });
            if (result && result.token) {
                authToken = result.token;
                localStorage.setItem('authToken', authToken);
                currentUser = { ...result.user, role: result.user.role || 'admin' };
                // استخراج Claims من التوكن لاستخدامها في التحكم بالعرض
                try {
                    const parts = authToken.split('.');
                    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                    const perms = (payload?.perm && Array.isArray(payload.perm)) ? payload.perm : [];
                    // بعض المولدات تضع Claim مكررة كسلسلة، وحيدة؛ تأكد من المصفوفة
                    currentUser.perms = Array.isArray(perms) ? perms : (perms ? [perms] : []);
                } catch (e) { currentUser.perms = []; }
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                logActivity('login', 'نجح تسجيل الدخول عبر API');
                await loadBackendData();
                showApp();
                showToast(`🎉 مرحباً ${currentUser.fullName || currentUser.username}!`, 'success');
                return;
            }
        }
        
        // Fallback to local authentication
        console.log('💾 البحث في قاعدة البيانات المحلية...');
        if (!database.users || !Array.isArray(database.users)) {
            console.error('❌ قاعدة البيانات المحلية غير متوفرة');
            showToast('❌ خطأ في النظام - قاعدة البيانات غير متوفرة', 'error');
            return;
        }
        
        console.log('المستخدمون المتاحون:', database.users.map(u => u.username));
        const user = database.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            console.log('✅ تم العثور على المستخدم:', username);
            currentUser = user;
            const sessionUser = { ...user };
            delete sessionUser.password;
            localStorage.setItem('currentUser', JSON.stringify(sessionUser));
            logActivity('login', 'نجح تسجيل الدخول محلياً');
            showApp();
            showToast(`🎉 مرحباً ${user.name}!`, 'success');
        } else {
            console.log('❌ فشل التحقق: المستخدم غير موجود أو كلمة المرور خاطئة');
            logActivity('login_failed', `محاولة فاشلة: ${username}`);
            showToast('❌ اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
        }
    });
}

// Load data from backend
async function loadBackendData() {
    if (!useBackend || !authToken) return;
    
    try {
        // Load clients
        const clients = await apiCall('/clients');
        if (clients) {
            database.clients = clients.map(c => ({
                id: c.id,
                name: c.name,
                phone: c.phone,
                email: c.email || '',
                address: c.address || '',
                balance: c.balance || 0
            }));
        }
        
        // Load lawyers
        const lawyers = await apiCall('/lawyers');
        if (lawyers) {
            database.lawyers = lawyers.map(l => ({
                id: l.id,
                name: l.name,
                license: l.phone || 'N/A',
                phone: l.phone,
                email: l.email || '',
                specialty: l.address || ''
            }));
        }
        
        // Load cases
        const cases = await apiCall('/cases');
        if (cases) {
            database.cases = cases.map(c => ({
                id: c.id,
                caseNumber: c.title,
                title: c.title,
                lawyer: c.lawyer?.name || '',
                client: c.client?.name || '',
                status: c.status || 'active',
                fees: 0,
                date: c.createdAt,
                description: c.description || ''
            }));
        }
        
        // Load transactions
        const transactions = await apiCall('/transactions');
        if (transactions) {
            database.transactions = transactions.map(t => {
                const clientName = t.clientId ? (database.clients.find(c => c.id === t.clientId)?.name || '') : '';
                const caseEntry = t.caseId ? (database.cases.find(cs => cs.id === t.caseId) || null) : null;
                const caseNum = caseEntry ? (caseEntry.caseNumber || caseEntry.title || '') : '';
                return {
                    id: t.id,
                    type: mapTransactionType(t.type),
                    amount: t.amount,
                    description: t.notes || '',
                    client: clientName,
                    caseNumber: caseNum,
                    date: (t.date || '').split('T')[0]
                };
            });
        }
        
        // Load company settings
        const company = await apiCall('/settings/company');
        if (company) {
            database.companyInfo = {
                name: company.name || 'مكتب المحاماة',
                address: company.address || '',
                phone: company.phone || '',
                email: company.email || '',
                logo: company.logoUrl || ''
            };
        }
        // Load payment link template
        const paymentLink = await apiCall('/settings/payment-link');
        if (paymentLink && paymentLink.url) {
            database.paymentLinkTemplate = paymentLink.url;
        }
        
        saveData();
        console.log('✅ تم تحميل البيانات من الخادم');
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
    }
}

function mapTransactionType(type) {
    const typeMap = {
        0: 'service_fee',
        1: 'payment_from_client',
        2: 'payment_to_client',
        3: 'expense'
    };
    return typeMap[type] || 'income';
}

function logActivity(action, details) {
    if (!database.activityLog) database.activityLog = [];
    database.activityLog.push({
        id: Date.now(),
        user: currentUser?.username || 'غير معروف',
        action: action,
        details: details,
        timestamp: new Date().toISOString()
    });
    saveData();
}

function fillLogin(username, password) {
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // إزالة كلاس login-active من body
    document.body.classList.remove('login-active');
    
    document.getElementById('currentUserName').textContent = currentUser.name;
    document.getElementById('currentUserRole').textContent = getRoleName(currentUser.role);
    
    // تحديث عناصر الإعدادات إذا كانت موجودة
    const settingsName = document.getElementById('settingsName');
    if (settingsName) settingsName.value = currentUser.name;
    
    const settingsEmail = document.getElementById('settingsEmail');
    if (settingsEmail) settingsEmail.value = currentUser.email;
    
    const settingsRole = document.getElementById('settingsRole');
    if (settingsRole) settingsRole.value = getRoleName(currentUser.role);
    
    // إخفاء الأقسام غير المصرح بها
    applyPermissions();
    
    loadData();
    updateDashboard();
    renderLawyers();
    renderCases();
    renderClients();
    renderTransactions();

    setupUXEnhancements();
}

function applyPermissions() {

    // تقييد خيارات فلتر المعاملات عند العمل مع الخادم
    function syncTransactionTypeFilterOptions() {
        const select = document.getElementById('transactionTypeFilter');
        if (!select) return;
        if (useBackend && authToken) {
            const allowed = ['payment_from_client', 'payment_to_client', 'service_fee', 'expense'];
            const labelMap = {
                'payment_from_client': 'دفعة من عميل',
                'payment_to_client': 'دفعة لعميل',
                'service_fee': 'رسوم خدمة',
                'expense': 'مصروف عام/مرتبط'
            };
            const newOptionsHtml = ['<option value="">جميع الأنواع</option>']
                .concat(allowed.map(v => `<option value="${v}">${labelMap[v]}</option>`))
                .join('');
            select.innerHTML = newOptionsHtml;
        }
    }
    // إخفاء عناصر القائمة الجانبية
    document.querySelectorAll('.nav-item').forEach(item => {
        const section = item.getAttribute('onclick')?.match(/showSection\('(\w+)'\)/)?.[1];
        if (section) {
            if (section === 'settings' && !hasPermission('settings', 'view')) {
                item.style.display = 'none';
            } else if (section === 'reports' && !hasPermission('reports', 'view')) {
                item.style.display = 'none';
            } else if (section === 'permissions') {
                item.style.display = currentUser.role === 'admin' ? 'flex' : 'none';
            } else {
                item.style.display = 'flex';
            }
        }
    });
    
    // إخفاء أزرار الإضافة حسب الصلاحيات
    const addLawyerBtn = document.getElementById('addLawyerBtn');
    if (addLawyerBtn) addLawyerBtn.style.display = hasPermission('lawyers', 'add') ? 'block' : 'none';
    
    const addCaseBtn = document.getElementById('addCaseBtn');
    if (addCaseBtn) addCaseBtn.style.display = hasPermission('cases', 'add') ? 'block' : 'none';
    
    const addClientBtn = document.getElementById('addClientBtn');
    if (addClientBtn) addClientBtn.style.display = hasPermission('clients', 'add') ? 'block' : 'none';
    
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    if (addTransactionBtn) addTransactionBtn.style.display = hasPermission('transactions', 'add') ? 'block' : 'none';
    
    // إظهار قسم إدارة المستخدمين للمدير فقط
    const usersCard = document.getElementById('usersManagementCard');
    if (usersCard) usersCard.style.display = hasPermission('users', 'view') ? 'block' : 'none';
    
    // إظهار زر إدارة الصلاحيات للمدير فقط
    const permissionsNavBtn = document.getElementById('permissionsNavBtn');
    if (permissionsNavBtn) permissionsNavBtn.style.display = currentUser.role === 'admin' ? 'flex' : 'none';
    
    const viewRestrictionsCard = document.getElementById('viewRestrictionsCard');
    if (viewRestrictionsCard) viewRestrictionsCard.style.display = currentUser.role === 'admin' ? 'block' : 'none';
}

// ==================== عرض تقييدات العرض ====================
async function showViewRestrictionsModal() {
    let modules = [];
    if (useBackend && authToken) {
        const res = await apiCall('/settings/view-restrictions');
        if (Array.isArray(res)) modules = res;
    }
    const allModules = ['reports','settings','clients','lawyers','cases','transactions','users'];
    document.getElementById('modalTitle').textContent = '🔐 تقييد عرض الأقسام';
    document.getElementById('modalBody').innerHTML = `
        <form id="viewRestrictionsForm" onsubmit="saveViewRestrictions(event)">
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
                ${allModules.map(m => `
                    <label style="display:flex;align-items:center;gap:8px">
                        <input type="checkbox" name="modules" value="${m}" ${modules.includes(m) ? 'checked' : ''}>
                        <span>${m}</span>
                    </label>
                `).join('')}
            </div>
            <p style="margin-top:10px;color:var(--text-light)">عند تفعيل قسم ما، لا يُعرض إلا للمدير</p>
            <button type="submit" class="btn-primary" style="width:100%">💾 حفظ</button>
        </form>
    `;
    showModal();
}

// ==================== تحسينات تجربة المستخدم ====================
let __loaderCounter = 0;
function showLoader(text = '') {
    const overlay = document.getElementById('loaderOverlay');
    const txt = document.getElementById('loaderText');
    if (txt) txt.textContent = text || 'جاري المعالجة...';
    __loaderCounter++;
    if (overlay) overlay.style.display = 'flex';
}
function hideLoader() {
    __loaderCounter = Math.max(0, __loaderCounter - 1);
    if (__loaderCounter === 0) {
        const overlay = document.getElementById('loaderOverlay');
        if (overlay) overlay.style.display = 'none';
    }
}

function debounce(fn, delay = 200) {
    let t = null;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

function setupUXEnhancements() {
    document.getElementById('lawyerSearch')?.addEventListener('input', debounce(filterLawyers, 150));
    document.getElementById('caseSearch')?.addEventListener('input', debounce(filterCases, 150));
    document.getElementById('clientSearch')?.addEventListener('input', debounce(filterClients, 150));
    document.getElementById('transactionSearch')?.addEventListener('input', debounce(filterTransactions, 150));
    
    // Debtors/Creditors filters
    document.getElementById('debtorFilter')?.addEventListener('change', renderDebtorsCreditors);
    document.getElementById('debtorSort')?.addEventListener('change', renderDebtorsCreditors);
    document.getElementById('debtorSearch')?.addEventListener('input', debounce(renderDebtorsCreditors, 150));
}

function exportAllExcel() {
    if (!(window.XLSX && XLSX.utils && XLSX.writeFile)) {
        showToast('⚠️ مكتبة Excel غير متاحة', 'warning');
        return;
    }
    const wb = XLSX.utils.book_new();
    ['lawyers','cases','clients','transactions'].forEach(type => {
        const cfg = getExcelConfig(type);
        if (cfg && cfg.rows && cfg.rows.length) {
            const aoa = [cfg.headers, ...cfg.rows];
            const ws = XLSX.utils.aoa_to_sheet(aoa);
            if (cfg.colWidths) ws['!cols'] = cfg.colWidths.map(w => ({ wch: w }));
            XLSX.utils.book_append_sheet(wb, ws, cfg.filename);
        }
    });
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `تصدير_شامل_${dateStr}.xlsx`);
    showToast('✅ تم إنشاء ملف Excel شامل', 'success');
}

async function saveViewRestrictions(e) {
    e.preventDefault();
    const form = document.getElementById('viewRestrictionsForm');
    const data = new FormData(form);
    const modules = data.getAll('modules');
    if (useBackend && authToken) {
        const res = await apiCall('/settings/view-restrictions', 'POST', { modules });
        if (res && res.success) {
            showToast('✅ تم حفظ تقييدات العرض', 'success');
            closeModal();
        } else {
            showToast('❌ تعذّر حفظ التقييدات', 'error');
        }
    } else {
        showToast('⚠️ يتطلب الحفظ عبر الخادم', 'warning');
    }
}

function generatePaymentUrl(clientName, amount, desc, caseNumber) {
    const tpl = database.paymentLinkTemplate || 'https://pay.example.com/invoice?client={client}&amount={amount}&desc={desc}&case={case}';
    return tpl
        .replace('{client}', encodeURIComponent(clientName || ''))
        .replace('{amount}', encodeURIComponent(String(amount || 0)))
        .replace('{desc}', encodeURIComponent(desc || ''))
        .replace('{case}', encodeURIComponent(caseNumber || ''));
}

// ==================== إعدادات العملة ====================
function getCurrencySettings() {
    if (!database.currencySettings) {
        database.currencySettings = { baseCurrency: 'IQD', exchangeRate: 1450, showBoth: true };
    }
    return database.currencySettings;
}

async function loadCurrencySettingsFromBackend() {
    if (!useBackend || !authToken) return;
    const cfg = await apiCall('/settings/currency', 'GET');
    if (cfg) {
        database.currencySettings = {
            baseCurrency: cfg.baseCurrency || 'IQD',
            exchangeRate: Number(cfg.exchangeRate || 1450),
            showBoth: Boolean(cfg.showBoth ?? true)
        };
        saveData();
        applyCurrencySettingsToUI();
    }
}

function applyCurrencySettingsToUI() {
    const cfg = getCurrencySettings();
    const baseSel = document.getElementById('baseCurrency');
    if (baseSel) baseSel.value = cfg.baseCurrency;
    const rateInput = document.getElementById('exchangeRate');
    if (rateInput) rateInput.value = cfg.exchangeRate;
    const bothChk = document.getElementById('showBothCurrencies');
    if (bothChk) bothChk.checked = !!cfg.showBoth;
}

function saveCurrencySettings() {
    const base = document.getElementById('baseCurrency')?.value || 'IQD';
    const rate = parseFloat(document.getElementById('exchangeRate')?.value || '1450');
    const showBoth = !!document.getElementById('showBothCurrencies')?.checked;
    database.currencySettings = { baseCurrency: base, exchangeRate: rate, showBoth };
    saveData();
    if (useBackend && authToken) {
        apiCall('/settings/currency', 'POST', { baseCurrency: base, exchangeRate: rate, showBoth });
    }
    showToast('✅ تم حفظ إعدادات العملة', 'success');
    renderDashboard?.();
    renderDebtorsCreditors?.();
    renderLawyers?.();
}

function formatAmountHTML(amountIQD) {
    const cfg = getCurrencySettings();
    const rate = cfg.exchangeRate || 1450;
    const iqd = Number(amountIQD || 0);
    const usd = iqd / rate;
    const iqdHtml = `<span style="font-weight:700">${iqd.toLocaleString('ar-IQ')} د.ع</span>`;
    const usdHtml = `<span style="color:var(--text-light);font-size:0.85em">$${usd.toFixed(2)}</span>`;
    if (cfg.showBoth) {
        return cfg.baseCurrency === 'USD'
            ? `<span style="font-weight:700">$${usd.toFixed(2)}</span><br>${iqdHtml}`
            : `${iqdHtml}<br>${usdHtml}`;
    }
    return cfg.baseCurrency === 'USD' ? `<span style="font-weight:700">$${usd.toFixed(2)}</span>` : iqdHtml;
}

function getRoleName(role) {
    const roles = {
        admin: '👑 مدير النظام',
        lawyer: '👨‍⚖️ محامي',
        accountant: '💼 محاسب'
    };
    return roles[role] || role;
}

function logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('loginForm').reset();
        
        // إضافة كلاس login-active لـ body
        document.body.classList.add('login-active');
        
        showToast('👋 تم تسجيل الخروج بنجاح', 'success');
    }
}

// ==================== التنقل ====================
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(sectionId)?.classList.add('active');
    document.querySelector(`[onclick="showSection('${sectionId}')"]`)?.classList.add('active');
    
    // التمرير إلى الأعلى
    document.querySelector('.main-content').scrollTop = 0;
    
    const titles = {
        dashboard: 'لوحة التحكم',
        lawyers: 'إدارة المحامين',
        cases: 'إدارة القضايا',
        clients: 'إدارة الزبائن',
        transactions: 'المعاملات المالية',
        debtors: 'المدينون والدائنون',
        reports: 'التقارير والإحصائيات',
        settings: 'الإعدادات',
        permissions: 'إدارة الصلاحيات المتقدمة'
    };
    
    document.getElementById('pageTitle').textContent = titles[sectionId] || '';
    
    // إغلاق القائمة الجانبية على الموبايل
    closeSidebarOnMobile();
    
    if (sectionId === 'dashboard') updateDashboard();
    if (sectionId === 'debtors') renderDebtorsCreditors();
    if (sectionId === 'settings') applyCurrencySettingsToUI();
    if (sectionId === 'permissions') renderPermissionsManagement();
}

function toggleSidebarMenu() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    // للشاشات الصغيرة - عرض/إخفاء القائمة
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('sidebar-hidden');
        
        // إضافة overlay للشاشات الصغيرة
        let overlay = document.getElementById('sidebarOverlay');
        if (!overlay && !sidebar.classList.contains('sidebar-hidden')) {
            overlay = document.createElement('div');
            overlay.id = 'sidebarOverlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:999;';
            overlay.onclick = () => toggleSidebarMenu();
            document.body.appendChild(overlay);
        } else if (overlay && sidebar.classList.contains('sidebar-hidden')) {
            overlay.remove();
        }
    } else {
        // للشاشات الكبيرة - تصغير/توسيع القائمة
        sidebar.classList.toggle('hidden');
        mainContent.classList.toggle('sidebar-hidden');
    }
    
    // حفظ الحالة
    const isHidden = sidebar.classList.contains('hidden') || sidebar.classList.contains('sidebar-hidden');
    localStorage.setItem('sidebarHidden', isHidden);
}

function toggleSidebar() {
    // للتوافق مع الأجهزة المحمولة
    toggleSidebarMenu();
}

// إغلاق القائمة عند النقر على عنصر في الشاشات الصغيرة
function closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.add('sidebar-hidden');
        if (overlay) overlay.remove();
    }
}

// ==================== لوحة التحكم ====================
// نظام الإشعارات الذكي
function showNotifications() {
    const notifications = [];
    const today = new Date();
    const inThreeDays = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    // التحقق من القضايا النشطة بدون معاملات مالية
    database.cases.filter(c => c.status === 'active').forEach(caseData => {
        const caseTransactions = database.transactions.filter(t => t.caseNumber === caseData.caseNumber);
        if (caseTransactions.length === 0) {
            notifications.push({
                type: 'warning',
                icon: '⚠️',
                title: 'قضية بدون معاملات مالية',
                message: `القضية ${caseData.caseNumber} (${caseData.title}) ليس لها أي معاملات مالية`,
                action: `showCaseDetails('${caseData.id}')`
            });
        }
    });
    
    // التحقق من المستحقات
    database.cases.filter(c => c.status === 'active').forEach(caseData => {
        const caseTransactions = database.transactions.filter(t => t.caseNumber === caseData.caseNumber);
        const totalPaid = caseTransactions
            .filter(t => t.type === 'payment_from_client')
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        const totalFees = parseFloat(caseData.fees || 0);
        const remaining = totalFees - totalPaid;
        
        if (remaining > 0 && totalFees > 0) {
            notifications.push({
                type: 'info',
                icon: '💵',
                title: 'مستحقات مالية',
                message: `القضية ${caseData.caseNumber} - متبقي ${formatAmountHTML(remaining)} من أصل ${formatAmountHTML(totalFees)}`,
                action: `showCaseDetails('${caseData.id}')`
            });
        }
    });
    
    // عرض الإشعارات
    const notificationsArea = document.getElementById('notificationsArea');
    if (notifications.length === 0) {
        notificationsArea.innerHTML = '';
        return;
    }
    
    // عرض أول 3 إشعارات فقط
    notificationsArea.innerHTML = `
        <div style="background:var(--surface);border-radius:15px;padding:20px;box-shadow:var(--shadow)">
            <h3 style="margin:0 0 15px;display:flex;align-items:center;gap:10px">
                <span>🔔</span>
                <span>الإشعارات (${notifications.length})</span>
            </h3>
            <div style="display:grid;gap:10px">
                ${notifications.slice(0, 3).map(n => `
                    <div style="padding:15px;background:var(--bg);border-radius:10px;border-right:4px solid ${
                        n.type === 'warning' ? 'var(--warning)' : 
                        n.type === 'info' ? 'var(--info)' : 'var(--danger)'
                    };cursor:pointer;transition:all 0.3s"
                         onclick="${n.action}"
                         onmouseenter="this.style.transform='translateX(-5px)'"
                         onmouseleave="this.style.transform='translateX(0)'">
                        <div style="display:flex;align-items:start;gap:12px">
                            <span style="font-size:1.5em">${n.icon}</span>
                            <div style="flex:1">
                                <strong style="display:block;margin-bottom:5px;color:var(--text)">${n.title}</strong>
                                <div style="color:var(--text-light);font-size:0.9em">${n.message}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${notifications.length > 3 ? `
                <p style="text-align:center;margin:10px 0 0;color:var(--text-light);font-size:0.9em">
                    + ${notifications.length - 3} إشعار آخر
                </p>
            ` : ''}
        </div>
    `;
}

function updateDashboard() {
    // عرض الإشعارات
    showNotifications();
    
    // عرض التاريخ الحالي
    const currentDateElem = document.getElementById('currentDate');
    if (currentDateElem) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElem.textContent = now.toLocaleDateString('ar-IQ', options);
    }
    
    document.getElementById('totalLawyers').textContent = database.lawyers.length;
    document.getElementById('totalCases').textContent = database.cases.filter(c => c.status === 'active').length;
    document.getElementById('totalClients').textContent = database.clients.length;
    
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyIncome = database.transactions
        .filter(t => (t.type === 'income' || t.type === 'service_fee' || t.type === 'payment_from_client') && 
                new Date(t.date).getMonth() === thisMonth && 
                new Date(t.date).getFullYear() === thisYear)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const monthlyExpense = database.transactions
        .filter(t => (t.type === 'expense' || t.type === 'payment_to_client' || t.type === 'salary') && 
                new Date(t.date).getMonth() === thisMonth && 
                new Date(t.date).getFullYear() === thisYear)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const netRevenue = monthlyIncome - monthlyExpense;
    document.getElementById('totalRevenue').innerHTML = formatAmountHTML(netRevenue);
    
    // آخر القضايا - تفاعلية
    const recentCases = database.cases.slice(-5).reverse();
    document.getElementById('recentCases').innerHTML = recentCases.length > 0 
        ? recentCases.map(c => `
            <div style="padding:15px;border-bottom:1px solid var(--border);cursor:pointer;transition:all 0.3s"
                 onclick="showCaseDetails('${c.id}')"
                 onmouseenter="this.style.background='var(--bg)'"
                 onmouseleave="this.style.background='transparent'">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
                    <strong style="font-size:1.05em;color:var(--text)">${c.title}</strong>
                    <span class="status-${c.status}">${getStatusText(c.status)}</span>
                </div>
                <div style="color:var(--text-light);font-size:0.9em;margin-bottom:5px">
                    📋 ${c.caseNumber} • 👨‍⚖️ ${c.lawyer}
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <small style="color:var(--text-light)">👤 ${c.client}</small>
                    <small style="color:var(--success);font-weight:700">${formatAmountHTML(parseFloat(c.fees))}</small>
                </div>
            </div>
        `).join('') 
        : '<p style="text-align:center;color:var(--text-light);padding:40px">لا توجد قضايا</p>';
    
    // آخر المعاملات - تفاعلية
    const recentTransactions = database.transactions.slice(-5).reverse();
    document.getElementById('recentTransactions').innerHTML = recentTransactions.length > 0
        ? recentTransactions.map(t => `
            <div style="padding:15px;border-bottom:1px solid var(--border);transition:all 0.3s"
                 onmouseenter="this.style.background='var(--bg)'"
                 onmouseleave="this.style.background='transparent'">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
                    <div style="flex:1">
                        <strong style="font-size:1em">${t.description}</strong>
                        ${t.client ? `<div style="color:var(--text-light);font-size:0.85em;margin-top:3px">👤 ${t.client}</div>` : ''}
                        ${t.caseNumber ? `<div style="color:var(--info);font-size:0.85em;margin-top:3px">📋 ${t.caseNumber}</div>` : ''}
                    </div>
                    <span class="${t.type.includes('payment_to') || t.type === 'expense' || t.type === 'salary' ? 'transaction-expense' : 'transaction-income'}" 
                          style="font-size:1.1em;font-weight:700;white-space:nowrap;margin-right:15px">
                        ${formatAmountHTML(parseFloat(t.amount))}
                    </span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <small style="color:var(--text-light)">📅 ${new Date(t.date).toLocaleDateString('ar-IQ')}</small>
                    <small style="background:var(--bg);padding:4px 10px;border-radius:8px;color:var(--primary);font-weight:600">
                        ${getTransactionTypeText(t.type)}
                    </small>
                </div>
                ${t.lawyer ? `<div style="color:var(--text-light);font-size:0.85em;margin-top:5px">⚖️ ${t.lawyer}</div>` : ''}
            </div>
        `).join('')
        : '<p style="text-align:center;color:var(--text-light);padding:40px">لا توجد معاملات</p>';
}

// ==================== المحامين ====================
function renderLawyers() {
    const search = document.getElementById('lawyerSearch')?.value.toLowerCase() || '';
    const filtered = database.lawyers.filter(l => 
        l.name.toLowerCase().includes(search) || 
        l.license.toLowerCase().includes(search) ||
        l.phone.includes(search)
    );
    
    const tbody = document.getElementById('lawyersTable');
    
    // حساب المجاميع الكلية
    let totalSalary = 0;
    let totalCredit = 0;
    let totalDebt = 0;
    let totalBalance = 0;
    
    const rows = filtered.map(l => {
        const balance = calculateLawyerBalance(l.id);
        const salary = parseFloat(l.salary) || 0;
        
        // حساب الدائن والمدين من المعاملات
        const lawyerTransactions = database.transactions.filter(t => 
            t.lawyerId === l.id || t.lawyer === l.name || t.lawyerName === l.name
        );
        
        // الدائن = ما يستحقه المحامي (إيرادات، رواتب، عمولات)
        const credit = lawyerTransactions
            .filter(t => t.type === 'salary' || t.type === 'service_fee' || t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        
        // المدين = ما دفعه المحامي أو خصم منه (مصروفات، سحوبات)
        const debt = lawyerTransactions
            .filter(t => t.type === 'expense' || t.type === 'payment_to_client')
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        
        totalSalary += salary;
        totalCredit += credit;
        totalDebt += debt;
        totalBalance += balance;
        
        return `
            <tr>
                <td><strong>${l.name}</strong></td>
                <td>${l.license}</td>
                <td>${l.specialty}</td>
                <td style="color:var(--primary);font-weight:700">${formatAmountHTML(salary)}</td>
                <td class="transaction-income" style="font-weight:700">${formatAmountHTML(credit)}</td>
                <td class="transaction-expense" style="font-weight:700">${formatAmountHTML(debt)}</td>
                <td class="${balance >= 0 ? 'transaction-income' : 'transaction-expense'}" style="font-weight:700">
                    ${formatAmountHTML(balance)}
                </td>
                <td>${l.phone}</td>
                <td>
                    <div class="action-btns">
                        ${currentUser && currentUser.role === 'admin' ? `<button class="btn-view" onclick="showLawyerFullReport(${l.id})" title="تقرير شامل - مدير فقط" style="background:linear-gradient(135deg,#f093fb,#f5576c);color:white;font-weight:700">📊</button>` : ''}
                        <button class="btn-view" onclick="showLawyerFinancials(${l.id})" title="عرض التفاصيل المالية">💰</button>
                        ${hasPermission('lawyers', 'edit') ? `<button class="btn-edit" onclick="editLawyer(${l.id})">✏️</button>` : ''}
                        ${hasPermission('lawyers', 'delete') ? `<button class="btn-delete" onclick="deleteLawyer(${l.id})">🗑️</button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // إضافة صف المجموع
    const totalRow = `
        <tr style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;font-weight:900;font-size:1.1em">
            <td colspan="3" style="text-align:center">📊 المجموع الكلي</td>
            <td>${formatAmountHTML(totalSalary)}</td>
            <td>${formatAmountHTML(totalCredit)}</td>
            <td>${formatAmountHTML(totalDebt)}</td>
            <td>${formatAmountHTML(totalBalance)}</td>
            <td colspan="2"></td>
        </tr>
    `;
    
    tbody.innerHTML = filtered.length > 0 
        ? rows + totalRow
        : '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-light)">لا يوجد محامين</td></tr>';
}

function filterLawyers() {
    renderLawyers();
}

function showAddLawyerModal() {
    if (!checkPermission('lawyers', 'add')) return;
    document.getElementById('modalTitle').textContent = '➕ إضافة محامي جديد';
    document.getElementById('modalBody').innerHTML = `
        <form id="lawyerForm" onsubmit="saveLawyer(event)">
            <div class="form-group">
                <label>الاسم الكامل *</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>رقم الترخيص *</label>
                <input type="text" name="license" required>
            </div>
            <div class="form-group">
                <label>التخصص *</label>
                <input type="text" name="specialty" required>
            </div>
            <div class="form-group">
                <label>💰 الراتب الشهري (د.ع) *</label>
                <input type="number" name="salary" value="0" step="1" min="0" required>
                <small>الراتب الثابت الشهري للمحامي</small>
            </div>
            <div class="form-group">
                <label>رقم الهاتف *</label>
                <input type="tel" name="phone" required>
            </div>
            <div class="form-group">
                <label>البريد الإلكتروني</label>
                <input type="email" name="email">
            </div>
            <button type="submit" class="btn-primary" style="width:100%">💾 حفظ المحامي</button>
        </form>
    `;
    showModal();
}

async function saveLawyer(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const lawyer = {
        id: Date.now(),
        lawyerId: Date.now(),
        name: formData.get('name'),
        license: formData.get('license'),
        specialty: formData.get('specialty') || '',
        salary: parseFloat(formData.get('salary')) || 0,
        phone: formData.get('phone'),
        email: formData.get('email') || ''
    };
    
    // Try API first
    if (useBackend && authToken) {
        const result = await apiCall('/lawyers', 'POST', lawyer);
        if (result) {
            lawyer.id = result.id || lawyer.id;
            database.lawyers.push(lawyer);
            saveData();
            renderLawyers();
            updateDashboard();
            closeModal();
            showToast('✅ تم إضافة المحامي بنجاح عبر API', 'success');
            logActivity('add_lawyer', `إضافة محامي: ${lawyer.name}`);
            return;
        }
    }
    
    // Fallback to local
    database.lawyers.push(lawyer);
    saveData();
    renderLawyers();
    updateDashboard();
    closeModal();
    showToast('✅ تم إضافة المحامي بنجاح', 'success');
    logActivity('add_lawyer', `إضافة محامي: ${lawyer.name}`);
}

function editLawyer(id) {
    if (!checkPermission('lawyers', 'edit')) return;
    const lawyer = database.lawyers.find(l => l.id === id);
    if (!lawyer) return;
    
    document.getElementById('modalTitle').textContent = '✏️ تعديل بيانات المحامي';
    document.getElementById('modalBody').innerHTML = `
        <form id="lawyerForm" onsubmit="updateLawyer(event, ${id})">
            <div class="form-group">
                <label>الاسم الكامل *</label>
                <input type="text" name="name" value="${lawyer.name}" required>
            </div>
            <div class="form-group">
                <label>رقم الترخيص *</label>
                <input type="text" name="license" value="${lawyer.license}" required>
            </div>
            <div class="form-group">
                <label>رقم الهاتف *</label>
                <input type="tel" name="phone" value="${lawyer.phone}" required>
            </div>
            <div class="form-group">
                <label>البريد الإلكتروني *</label>
                <input type="email" name="email" value="${lawyer.email}" required>
            </div>
            <div class="form-group">
                <label>التخصص</label>
                <input type="text" name="specialty" value="${lawyer.specialty || ''}">
            </div>
            <button type="submit" class="btn-primary" style="width:100%">حفظ التعديلات</button>
        </form>
    `;
    showModal();
}

function updateLawyer(e, id) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const lawyer = database.lawyers.find(l => l.id === id);
    if (lawyer) {
        lawyer.name = formData.get('name');
        lawyer.license = formData.get('license');
        lawyer.phone = formData.get('phone');
        lawyer.email = formData.get('email');
        lawyer.specialty = formData.get('specialty') || '';
        
        saveData();
        renderLawyers();
        closeModal();
        showToast('✅ تم تحديث بيانات المحامي', 'success');
    }
}

function deleteLawyer(id) {
    if (!checkPermission('lawyers', 'delete')) return;
    if (confirm('هل أنت متأكد من حذف هذا المحامي؟')) {
        logActivity('delete_lawyer', `حذف محامي: ${database.lawyers.find(l => l.id === id)?.name}`);
        database.lawyers = database.lawyers.filter(l => l.id !== id);
        saveData();
        renderLawyers();
        showToast('🗑️ تم حذف المحامي', 'success');
    }
}

// ==================== القضايا ====================
function renderCases() {
    const search = document.getElementById('caseSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('caseStatusFilter')?.value || '';
    
    const filtered = database.cases.filter(c => {
        const matchSearch = c.title.toLowerCase().includes(search) || 
                           c.caseNumber.toLowerCase().includes(search) ||
                           c.client.toLowerCase().includes(search);
        const matchStatus = !statusFilter || c.status === statusFilter;
        return matchSearch && matchStatus;
    });
    
    const tbody = document.getElementById('casesTable');
    tbody.innerHTML = filtered.length > 0
        ? filtered.map(c => `
            <tr>
                <td>${c.caseNumber}</td>
                <td>${c.title}</td>
                <td>${c.lawyer}</td>
                <td>${c.client}</td>
                <td><span class="status-${c.status}">${getStatusText(c.status)}</span></td>
                <td>${parseFloat(c.fees).toLocaleString('ar-IQ')} د.ع</td>
                <td>${new Date(c.date).toLocaleDateString('ar-IQ')}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-primary" onclick="printInvoice('case', ${c.id})" title="طباعة">🖨️</button>
                        ${hasPermission('cases', 'edit') ? `<button class="btn-edit" onclick="editCase(${c.id})">✏️</button>` : ''}
                        ${hasPermission('cases', 'delete') ? `<button class="btn-delete" onclick="deleteCase(${c.id})">🗑️</button>` : ''}
                    </div>
                </td>
            </tr>
        `).join('')
        : '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-light)">لا توجد قضايا</td></tr>';
}

function getStatusText(status) {
    const statuses = {
        active: 'نشطة',
        pending: 'معلقة',
        closed: 'مغلقة'
    };
    return statuses[status] || status;
}

function filterCases() {
    renderCases();
}

function showAddCaseModal() {
    if (!checkPermission('cases', 'add')) return;
    const lawyersOptions = database.lawyers.map(l => `<option value="${l.name}">${l.name}</option>`).join('');
    const clientsOptions = database.clients.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    
    document.getElementById('modalTitle').textContent = '➕ إضافة قضية جديدة';
    document.getElementById('modalBody').innerHTML = `
        <form id="caseForm" onsubmit="saveCase(event)">
            <div class="form-group">
                <label>رقم القضية *</label>
                <input type="text" name="caseNumber" required>
            </div>
            <div class="form-group">
                <label>عنوان القضية *</label>
                <input type="text" name="title" required>
            </div>
            <div class="form-group">
                <label>المحامي المسؤول *</label>
                <select name="lawyer" required>
                    <option value="">اختر المحامي</option>
                    ${lawyersOptions}
                </select>
            </div>
            <div class="form-group">
                <label>العميل *</label>
                <select name="client" required>
                    <option value="">اختر العميل</option>
                    ${clientsOptions}
                </select>
            </div>
            <div class="form-group">
                <label>الحالة</label>
                <select name="status">
                    <option value="active">نشطة</option>
                    <option value="pending">معلقة</option>
                    <option value="closed">مغلقة</option>
                </select>
            </div>
            <div class="form-group">
                <label>الأتعاب (د.ع) *</label>
                <input type="number" name="fees" required min="0">
            </div>
            <div class="form-group">
                <label>تاريخ القضية *</label>
                <input type="date" name="date" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label>الوصف</label>
                <textarea name="description" rows="3"></textarea>
            </div>
            <button type="submit" class="btn-primary" style="width:100%">حفظ</button>
        </form>
    `;
    showModal();
}

async function saveCase(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const caseData = {
        title: formData.get('title'),
        description: formData.get('description') || '',
        status: formData.get('status'),
        createdAt: formData.get('date')
    };
    
    // Try API first
    if (useBackend && authToken) {
        const result = await apiCall('/cases', 'POST', caseData);
        if (result) {
            const localCase = {
                id: result.id,
                caseNumber: formData.get('caseNumber'),
                title: formData.get('title'),
                lawyer: formData.get('lawyer'),
                client: formData.get('client'),
                status: formData.get('status'),
                fees: formData.get('fees'),
                date: formData.get('date'),
                description: formData.get('description') || ''
            };
            database.cases.push(localCase);
            saveData();
            renderCases();
            updateDashboard();
            closeModal();
            showToast('✅ تم إضافة القضية بنجاح', 'success');
            return;
        }
    }
    
    // Fallback to local
    caseData.id = Date.now();
    caseData.caseNumber = formData.get('caseNumber');
    caseData.lawyer = formData.get('lawyer');
    caseData.client = formData.get('client');
    caseData.fees = formData.get('fees');
    caseData.date = formData.get('date');
    database.cases.push(caseData);
    saveData();
    renderCases();
    updateDashboard();
    closeModal();
    showToast('✅ تم إضافة القضية بنجاح (محلي)', 'success');
}

function editCase(id) {
    if (!checkPermission('cases', 'edit')) return;
    const caseData = database.cases.find(c => c.id === id);
    if (!caseData) return;
    
    const lawyersOptions = database.lawyers.map(l => 
        `<option value="${l.name}" ${l.name === caseData.lawyer ? 'selected' : ''}>${l.name}</option>`
    ).join('');
    const clientsOptions = database.clients.map(c => 
        `<option value="${c.name}" ${c.name === caseData.client ? 'selected' : ''}>${c.name}</option>`
    ).join('');
    
    document.getElementById('modalTitle').textContent = '✏️ تعديل القضية';
    document.getElementById('modalBody').innerHTML = `
        <form id="caseForm" onsubmit="updateCase(event, ${id})">
            <div class="form-group">
                <label>رقم القضية *</label>
                <input type="text" name="caseNumber" value="${caseData.caseNumber}" required>
            </div>
            <div class="form-group">
                <label>عنوان القضية *</label>
                <input type="text" name="title" value="${caseData.title}" required>
            </div>
            <div class="form-group">
                <label>المحامي المسؤول *</label>
                <select name="lawyer" required>
                    <option value="">اختر المحامي</option>
                    ${lawyersOptions}
                </select>
            </div>
            <div class="form-group">
                <label>العميل *</label>
                <select name="client" required>
                    <option value="">اختر العميل</option>
                    ${clientsOptions}
                </select>
            </div>
            <div class="form-group">
                <label>الحالة</label>
                <select name="status">
                    <option value="active" ${caseData.status === 'active' ? 'selected' : ''}>نشطة</option>
                    <option value="pending" ${caseData.status === 'pending' ? 'selected' : ''}>معلقة</option>
                    <option value="closed" ${caseData.status === 'closed' ? 'selected' : ''}>مغلقة</option>
                </select>
            </div>
            <div class="form-group">
                <label>الأتعاب (د.ع) *</label>
                <input type="number" name="fees" value="${caseData.fees}" required min="0">
            </div>
            <div class="form-group">
                <label>تاريخ القضية *</label>
                <input type="date" name="date" value="${caseData.date}" required>
            </div>
            <div class="form-group">
                <label>الوصف</label>
                <textarea name="description" rows="3">${caseData.description || ''}</textarea>
            </div>
            <button type="submit" class="btn-primary" style="width:100%">حفظ التعديلات</button>
        </form>
    `;
    showModal();
}

function updateCase(e, id) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const caseData = database.cases.find(c => c.id === id);
    if (caseData) {
        caseData.caseNumber = formData.get('caseNumber');
        caseData.title = formData.get('title');
        caseData.lawyer = formData.get('lawyer');
        caseData.client = formData.get('client');
        caseData.status = formData.get('status');
        caseData.fees = formData.get('fees');
        caseData.date = formData.get('date');
        caseData.description = formData.get('description') || '';
        
        saveData();
        renderCases();
        updateDashboard();
        closeModal();
        showToast('✅ تم تحديث القضية', 'success');
    }
}

async function deleteCase(id) {
    if (!checkPermission('cases', 'delete')) return;
    if (confirm('هل أنت متأكد من حذف هذه القضية؟')) {
        logActivity('delete_case', `حذف قضية: ${database.cases.find(c => c.id === id)?.caseNumber}`);
        
        // Try API first
        if (useBackend && authToken) {
            const result = await apiCall(`/cases/${id}`, 'DELETE');
            if (result) {
                database.cases = database.cases.filter(c => c.id !== id);
                saveData();
                renderCases();
                updateDashboard();
                showToast('🗑️ تم حذف القضية', 'success');
                return;
            }
        }
        
        // Fallback to local
        database.cases = database.cases.filter(c => c.id !== id);
        saveData();
        renderCases();
        updateDashboard();
        showToast('🗑️ تم حذف القضية (محلي)', 'success');
    }
}

// عرض تفاصيل القضية
function showCaseDetails(id) {
    const caseData = database.cases.find(c => c.id === parseInt(id));
    if (!caseData) {
        showToast('❌ القضية غير موجودة', 'error');
        return;
    }
    
    // احصائيات القضية
    const caseTransactions = database.transactions.filter(t => t.caseNumber === caseData.caseNumber);
    const totalIncome = caseTransactions
        .filter(t => t.type === 'payment_from_client' || t.type === 'service_fee')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const totalExpense = caseTransactions
        .filter(t => t.type === 'expense' || t.type === 'payment_to_client')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const netProfit = totalIncome - totalExpense;
    
    document.getElementById('modalTitle').textContent = '📋 تفاصيل القضية';
    document.getElementById('modalBody').innerHTML = `
        <div style="padding:10px">
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-bottom:25px">
                <div style="background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:white;padding:20px;border-radius:15px">
                    <div style="font-size:2.5em;font-weight:900;margin-bottom:5px">${caseData.caseNumber}</div>
                    <div style="opacity:0.9">رقم القضية</div>
                </div>
                <div style="background:linear-gradient(135deg,#43e97b,#38f9d7);color:white;padding:20px;border-radius:15px">
                    <div style="font-size:2em;font-weight:900;margin-bottom:5px">${formatAmountHTML(parseFloat(caseData.fees))}</div>
                    <div style="opacity:0.9">الأتعاب المحددة</div>
                </div>
            </div>
            
            <h3 style="margin:20px 0 15px;color:var(--primary);border-right:4px solid var(--primary);padding-right:10px">📋 معلومات القضية</h3>
            <div style="background:var(--bg);padding:20px;border-radius:12px;margin-bottom:20px">
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:15px">
                    <div><strong>العنوان:</strong> ${caseData.title}</div>
                    <div><strong>المحامي:</strong> ⚖️ ${caseData.lawyer}</div>
                    <div><strong>العميل:</strong> 👤 ${caseData.client}</div>
                    <div><strong>المحكمة:</strong> 🏛️ ${caseData.court || '-'}</div>
                    <div><strong>تاريخ البدء:</strong> 📅 ${new Date(caseData.startDate).toLocaleDateString('ar-IQ')}</div>
                    <div><strong>الحالة:</strong> <span class="status-${caseData.status}">${getStatusText(caseData.status)}</span></div>
                </div>
                ${caseData.description ? `<div style="margin-top:15px;padding-top:15px;border-top:1px solid var(--border)"><strong>الوصف:</strong><br>${caseData.description}</div>` : ''}
            </div>
            
            <h3 style="margin:20px 0 15px;color:var(--success);border-right:4px solid var(--success);padding-right:10px">💰 الحالة المالية</h3>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:20px">
                <div style="background:linear-gradient(135deg,#10b981,#059669);color:white;padding:15px;border-radius:12px;text-align:center">
                    <div style="font-size:1.8em;font-weight:700">${formatAmountHTML(totalIncome)}</div>
                    <div style="opacity:0.9;font-size:0.9em">إجمالي الإيرادات</div>
                </div>
                <div style="background:linear-gradient(135deg,#ef4444,#dc2626);color:white;padding:15px;border-radius:12px;text-align:center">
                    <div style="font-size:1.8em;font-weight:700">${formatAmountHTML(totalExpense)}</div>
                    <div style="opacity:0.9;font-size:0.9em">إجمالي المصروفات</div>
                </div>
                <div style="background:linear-gradient(135deg,${netProfit >= 0 ? '#8b5cf6,#7c3aed' : '#f59e0b,#d97706'});color:white;padding:15px;border-radius:12px;text-align:center">
                    <div style="font-size:1.8em;font-weight:700">${formatAmountHTML(netProfit)}</div>
                    <div style="opacity:0.9;font-size:0.9em">صافي الربح</div>
                </div>
            </div>
            
            ${caseTransactions.length > 0 ? `
                <h3 style="margin:20px 0 15px;color:var(--info);border-right:4px solid var(--info);padding-right:10px">📝 المعاملات المالية (${caseTransactions.length})</h3>
                <div style="max-height:300px;overflow-y:auto">
                    <table class="data-table" style="font-size:0.9em">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>النوع</th>
                                <th>المبلغ</th>
                                <th>الوصف</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${caseTransactions.slice().reverse().map(t => `
                                <tr>
                                    <td>${new Date(t.date).toLocaleDateString('ar-IQ')}</td>
                                    <td><span style="background:var(--bg);padding:4px 10px;border-radius:8px;font-size:0.85em">${getTransactionTypeText(t.type)}</span></td>
                                    <td class="${t.type.includes('payment_to') || t.type === 'expense' ? 'transaction-expense' : 'transaction-income'}">
                                        <strong>${formatAmountHTML(parseFloat(t.amount))}</strong>
                                    </td>
                                    <td>${t.description || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p style="text-align:center;color:var(--text-light);padding:30px;background:var(--bg);border-radius:12px">لا توجد معاملات مالية لهذه القضية</p>'}
            
            <div style="display:flex;gap:10px;margin-top:25px;justify-content:center">
                <button class="btn-primary" onclick="closeModal(); showSection('cases')">
                    📂 عرض جميع القضايا
                </button>
                ${hasPermission('cases', 'edit') ? `
                    <button class="btn-secondary" onclick="closeModal(); setTimeout(() => editCase(${caseData.id}), 100)">
                        ✏️ تعديل القضية
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    showModal();
}

// ==================== العملاء ====================
function renderClients() {
    const search = document.getElementById('clientSearch')?.value.toLowerCase() || '';
    const filtered = database.clients.filter(c => 
        c.name.toLowerCase().includes(search) || 
        c.phone.includes(search)
    );
    
    // تحديث رصيد كل عميل
    filtered.forEach(client => {
        const balance = calculateClientBalance(client.name);
        const clientInDb = database.clients.find(c => c.id === client.id);
        if (clientInDb) clientInDb.balance = balance;
    });
    
    const grid = document.getElementById('clientsGrid');
    grid.innerHTML = filtered.length > 0
        ? filtered.map(c => {
            const balance = c.balance || 0;
            const balanceClass = balance > 0 ? 'debtor' : balance < 0 ? 'creditor' : 'balanced';
            const balanceIcon = balance > 0 ? '💰' : balance < 0 ? '⚠️' : '✅';
            const balanceText = balance > 0 ? `عليه دين لنا: ${formatAmountHTML(Math.abs(balance))}` : 
                               balance < 0 ? `له دين علينا: ${formatAmountHTML(Math.abs(balance))}` : 
                               'لا يوجد دين';
            
            return `
            <div class="client-card">
                <h3>👤 ${c.name}</h3>
                <div class="client-info">📞 ${c.phone}</div>
                ${c.email ? `<div class="client-info">📧 ${c.email}</div>` : ''}
                ${c.address ? `<div class="client-info">📍 ${c.address}</div>` : ''}
                <div class="client-balance ${balanceClass}" style="margin-top:10px;padding:10px;border-radius:8px;font-weight:bold">
                    ${balanceIcon} ${balanceText}
                </div>
                <div style="display:flex;gap:8px;margin-top:15px">
                    <button class="btn-edit" style="flex:1" onclick="viewClientAccount(${c.id})">💳 الحساب</button>
                    <button class="btn-primary" style="flex:1" onclick="printInvoice('client', ${c.id})">🖨️ طباعة</button>
                </div>
                <div style="display:flex;gap:8px;margin-top:8px">
                    ${hasPermission('clients', 'edit') ? `<button class="btn-edit" style="flex:1" onclick="editClient(${c.id})">✏️ تعديل</button>` : ''}
                    ${hasPermission('clients', 'delete') ? `<button class="btn-delete" style="flex:1" onclick="deleteClient(${c.id})">🗑️ حذف</button>` : ''}
                </div>
            </div>
            `;
        }).join('')
        : '<p style="text-align:center;color:var(--text-light);padding:40px">لا يوجد عملاء</p>';
}

function calculateClientBalance(clientName) {
    const clientTransactions = database.transactions.filter(t => t.client === clientName);
    let balance = 0;
    
    clientTransactions.forEach(t => {
        const amount = parseFloat(t.amount);
        if (t.type === 'payment_from_client') {
            // دفع من العميل لنا = يقلل من دينه علينا
            balance -= amount;
        } else if (t.type === 'payment_to_client') {
            // دفع منا للعميل = يزيد من دينه علينا
            balance += amount;
        } else if (t.type === 'service_fee') {
            // رسوم خدمة = يزيد ما يدين به العميل للمكتب
            balance += amount;
        } else if (t.type === 'expense') {
            // مصروف مرتبط بعميل = يزيد ما يدين به العميل للمكتب
            balance += amount;
        }
    });
    
    return balance;
}

function filterClients() {
    renderClients();
}

function showAddClientModal() {
    if (!checkPermission('clients', 'add')) return;
    document.getElementById('modalTitle').textContent = '➕ إضافة عميل جديد';
    document.getElementById('modalBody').innerHTML = `
        <form id="clientForm" onsubmit="saveClient(event)">
            <div class="form-group">
                <label>الاسم الكامل *</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>رقم الهاتف *</label>
                <input type="tel" name="phone" required>
            </div>
            <div class="form-group">
                <label>البريد الإلكتروني</label>
                <input type="email" name="email">
            </div>
            <div class="form-group">
                <label>العنوان</label>
                <input type="text" name="address">
            </div>
            <button type="submit" class="btn-primary" style="width:100%">حفظ</button>
        </form>
    `;
    showModal();
}

async function saveClient(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const client = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email') || '',
        address: formData.get('address') || '',
        balance: 0
    };
    
    // Try API first
    if (useBackend && authToken) {
        const result = await apiCall('/clients', 'POST', client);
        if (result) {
            client.id = result.id;
            database.clients.push(client);
            saveData();
            renderClients();
            updateDashboard();
            closeModal();
            showToast('✅ تم إضافة العميل بنجاح', 'success');
            return;
        }
    }
    
    // Fallback to local
    client.id = Date.now();
    database.clients.push(client);
    saveData();
    renderClients();
    updateDashboard();
    closeModal();
    showToast('✅ تم إضافة العميل بنجاح (محلي)', 'success');
}

function editClient(id) {
    if (!checkPermission('clients', 'edit')) return;
    const client = database.clients.find(c => c.id === id);
    if (!client) return;
    
    document.getElementById('modalTitle').textContent = '✏️ تعديل بيانات العميل';
    document.getElementById('modalBody').innerHTML = `
        <form id="clientForm" onsubmit="updateClient(event, ${id})">
            <div class="form-group">
                <label>الاسم الكامل *</label>
                <input type="text" name="name" value="${client.name}" required>
            </div>
            <div class="form-group">
                <label>رقم الهاتف *</label>
                <input type="tel" name="phone" value="${client.phone}" required>
            </div>
            <div class="form-group">
                <label>البريد الإلكتروني</label>
                <input type="email" name="email" value="${client.email || ''}">
            </div>
            <div class="form-group">
                <label>العنوان</label>
                <input type="text" name="address" value="${client.address || ''}">
            </div>
            <button type="submit" class="btn-primary" style="width:100%">حفظ التعديلات</button>
        </form>
    `;
    showModal();
}

function updateClient(e, id) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const client = database.clients.find(c => c.id === id);
    if (client) {
        client.name = formData.get('name');
        client.phone = formData.get('phone');
        client.email = formData.get('email') || '';
        client.address = formData.get('address') || '';
        
        saveData();
        renderClients();
        closeModal();
        showToast('✅ تم تحديث بيانات العميل', 'success');
    }
}

async function deleteClient(id) {
    if (!checkPermission('clients', 'delete')) return;
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
        logActivity('delete_client', `حذف عميل: ${database.clients.find(c => c.id === id)?.name}`);
        
        // Try API first
        if (useBackend && authToken) {
            const result = await apiCall(`/clients/${id}`, 'DELETE');
            if (result) {
                database.clients = database.clients.filter(c => c.id !== id);
                saveData();
                renderClients();
                updateDashboard();
                showToast('🗑️ تم حذف العميل', 'success');
                return;
            }
        }
        
        // Fallback to local
        database.clients = database.clients.filter(c => c.id !== id);
        saveData();
        renderClients();
        updateDashboard();
        showToast('🗑️ تم حذف العميل (محلي)', 'success');
    }
}

function viewClientAccount(clientId) {
    const client = database.clients.find(c => c.id === clientId);
    if (!client) return;
    
    const clientTransactions = database.transactions
        .filter(t => t.client === client.name)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const balance = calculateClientBalance(client.name);
    const balanceClass = balance > 0 ? 'debtor' : balance < 0 ? 'creditor' : 'balanced';
    const balanceIcon = balance > 0 ? '💰' : balance < 0 ? '⚠️' : '✅';
    const balanceText = balance > 0 ? `عليه دين لنا: ${Math.abs(balance).toLocaleString('ar-IQ')} د.ع` : 
                       balance < 0 ? `له دين علينا: ${Math.abs(balance).toLocaleString('ar-IQ')} د.ع` : 
                       'لا يوجد دين';
    
    let runningBalance = 0;
    const transactionsHtml = clientTransactions.length > 0
        ? clientTransactions.reverse().map(t => {
            const amount = parseFloat(t.amount);
            let debit = 0, credit = 0;
            
            if (t.type === 'payment_from_client') {
                credit = amount;
                runningBalance -= amount;
            } else if (t.type === 'payment_to_client') {
                debit = amount;
                runningBalance += amount;
            } else if (t.type === 'service_fee') {
                credit = amount;
                runningBalance += amount;
            } else if (t.type === 'expense') {
                debit = amount;
                runningBalance += amount;
            }
            
            const typeLabels = {
                'payment_from_client': '💵 دفعة من العميل',
                'payment_to_client': '💰 دفعة للعميل',
                'service_fee': '📋 رسوم خدمة',
                'expense': '💸 مصروف مرتبط'
            };
            
            return `
                <tr>
                    <td>${new Date(t.date).toLocaleDateString('ar-IQ')}</td>
                    <td>${typeLabels[t.type]}</td>
                    <td>${t.description}</td>
                    <td class="transaction-expense">${debit > 0 ? debit.toLocaleString('ar-IQ') : '-'}</td>
                    <td class="transaction-income">${credit > 0 ? credit.toLocaleString('ar-IQ') : '-'}</td>
                    <td><strong>${Math.abs(runningBalance).toLocaleString('ar-IQ')}</strong></td>
                </tr>
            `;
        }).join('')
        : '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-light)">لا توجد معاملات</td></tr>';
    
    document.getElementById('modalTitle').textContent = `💳 حساب العميل: ${client.name}`;
    document.getElementById('modalBody').innerHTML = `
        <div style="margin-bottom:30px">
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:15px;margin-bottom:20px">
                <div style="padding:15px;background:var(--card-bg);border-radius:12px">
                    <div style="color:var(--text-light);margin-bottom:5px">📞 الهاتف</div>
                    <strong>${client.phone}</strong>
                </div>
                ${client.email ? `
                <div style="padding:15px;background:var(--card-bg);border-radius:12px">
                    <div style="color:var(--text-light);margin-bottom:5px">📧 البريد</div>
                    <strong>${client.email}</strong>
                </div>
                ` : ''}
            </div>
            
            <div class="client-balance ${balanceClass}" style="padding:20px;border-radius:12px;text-align:center;font-size:1.2em;font-weight:bold">
                ${balanceIcon} ${balanceText}
            </div>
        </div>
        
        <h4 style="margin:20px 0">📋 كشف الحساب التفصيلي</h4>
        <div style="overflow-x:auto">
            <table class="data-table" style="font-size:0.9em">
                <thead>
                    <tr style="background:var(--primary);color:white">
                        <th>التاريخ</th>
                        <th>النوع</th>
                        <th>البيان</th>
                        <th style="color:#ff6b6b">مدين (له)</th>
                        <th style="color:#51cf66">دائن (عليه)</th>
                        <th>الرصيد</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactionsHtml}
                </tbody>
            </table>
        </div>
        
        <div style="margin-top:20px;display:flex;gap:10px">
            <button class="btn-primary" onclick="addQuickPayment(${clientId}, 'from')" style="flex:1">
                💵 تسجيل دفعة من العميل
            </button>
            <button class="btn-primary" onclick="addQuickPayment(${clientId}, 'to')" style="flex:1">
                💰 تسجيل دفعة للعميل
            </button>
        </div>

        <h4 style="margin:20px 0">🔗 إنشاء رابط دفع</h4>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;align-items:end">
            <div class="form-group">
                <label>المبلغ (د.ع)</label>
                <input type="number" id="payAmount" value="${balance > 0 ? Math.abs(balance) : 0}" min="0" step="1">
            </div>
            <div class="form-group">
                <label>الوصف</label>
                <input type="text" id="payDesc" placeholder="${client.name} - سداد مستحقات">
            </div>
            <button class="btn-secondary" onclick="openPaymentLink(${clientId})">🔗 فتح رابط الدفع</button>
        </div>
    `;
    showModal();
}

function openPaymentLink(clientId) {
    const client = database.clients.find(c => c.id === clientId);
    if (!client) return;
    const amount = parseFloat(document.getElementById('payAmount').value || '0');
    const desc = document.getElementById('payDesc').value || `${client.name} - سداد`;
    const url = generatePaymentUrl(client.name, amount, desc, '');
    if (!url || typeof url !== 'string') {
        showToast('❌ قالب رابط الدفع غير مضبوط', 'error');
        return;
    }
    window.open(url, '_blank');
}

function addQuickPayment(clientId, direction) {
    const client = database.clients.find(c => c.id === clientId);
    if (!client) return;
    
    closeModal();
    setTimeout(() => {
        showAddTransactionModal();
        setTimeout(() => {
            document.getElementById('transactionType').value = direction === 'from' ? 'payment_from_client' : 'payment_to_client';
            updateTransactionForm();
            document.getElementById('clientSelect').value = client.name;
        }, 100);
    }, 300);
}

// ==================== المعاملات المالية ====================
function renderTransactions() {
    const search = document.getElementById('transactionSearch')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('transactionTypeFilter')?.value || '';
    
    const filtered = database.transactions.filter(t => {
        const matchSearch = t.description.toLowerCase().includes(search) || 
                           (t.client && t.client.toLowerCase().includes(search));
        const matchType = !typeFilter || t.type === typeFilter;
        return matchSearch && matchType;
    });
    
    const tbody = document.getElementById('transactionsTable');
    tbody.innerHTML = filtered.length > 0
        ? filtered.map(t => {
            const typeLabels = {
                'salary': '💼 راتب / مستحقات',
                'commission': '📋 عمولة',
                'withdrawal': '💳 سحب',
                'expense': '💸 مصروف'
            };
            const typeClass = (t.type === 'expense' || t.type === 'salary' || t.type === 'commission' || t.type === 'withdrawal') ? 'expense' : 'income';
            
            // الحصول على اسم المحامي بشكل كامل
            let lawyerName = '<span style="color: var(--text-light); font-style: italic;">غير محدد</span>';
            let lawyerDisplay = '';
            
            if (t.lawyerName) {
                lawyerDisplay = t.lawyerName;
            } else if (t.lawyerId) {
                const lawyer = database.lawyers.find(l => l.id === t.lawyerId);
                if (lawyer) lawyerDisplay = lawyer.name;
            }
            
            if (lawyerDisplay) {
                lawyerName = `<strong style="color: var(--primary); display: flex; align-items: center; gap: 5px;">
                    <span style="font-size: 1.2em;">⚖️</span>
                    <span>${lawyerDisplay}</span>
                </strong>`;
            }
            
            return `
            <tr>
                <td>${new Date(t.date).toLocaleDateString('ar-IQ')}</td>
                <td><span class="transaction-${typeClass}">${typeLabels[t.type] || t.type}</span></td>
                <td>${t.client ? `<strong>${t.client}</strong>` : '-'}</td>
                <td>${lawyerName}</td>
                <td class="transaction-${typeClass}"><strong>${parseFloat(t.amount).toLocaleString('ar-IQ')} د.ع</strong></td>
                <td>${t.description}</td>
                <td>${t.caseNumber || '-'}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-primary" onclick="printInvoice('transaction', ${t.id})" title="طباعة سند">🖨️</button>
                        ${hasPermission('transactions', 'edit') ? `<button class="btn-edit" onclick="editTransaction(${t.id})">✏️</button>` : ''}
                        ${hasPermission('transactions', 'delete') ? `<button class="btn-delete" onclick="deleteTransaction(${t.id})">🗑️</button>` : ''}
                    </div>
                </td>
            </tr>
            `;
        }).join('')
        : '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-light)">لا توجد معاملات</td></tr>';
}

function filterTransactions() {
    renderTransactions();
}

function showAddTransactionModal() {
    if (!checkPermission('transactions', 'add')) return;
    const lawyersOptions = database.lawyers.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
    const clientsOptions = database.clients.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    
    document.getElementById('modalTitle').textContent = '➕ إضافة معاملة مالية';
    document.getElementById('modalBody').innerHTML = `
        <form id="transactionForm" onsubmit="saveTransaction(event)">
            <div class="form-group">
                <label>نوع المعاملة *</label>
                <select name="type" id="transactionType" required onchange="onTransactionTypeChange()">
                    <option value="">اختر نوع المعاملة</option>
                    <option value="salary">💼 راتب / مستحقات</option>
                    <option value="commission">📋 عمولة / حصة من القضايا</option>
                    <option value="withdrawal">💳 سحب / دفعة للمحامي</option>
                    <option value="expense">💸 مصروف عام</option>
                </select>
            </div>
            <div class="form-group" id="lawyerGroup" style="display:none">
                <label>⚖️ المحامي *</label>
                <select name="lawyerId" id="lawyerSelect">
                    <option value="">اختر المحامي</option>
                    ${lawyersOptions}
                </select>
            </div>
            <div class="form-group" id="clientGroup" style="display:none">
                <label>👤 العميل *</label>
                <select name="client" id="clientSelect">
                    <option value="">اختر العميل</option>
                    ${clientsOptions}
                </select>
            </div>
            <div class="form-group">
                <label>المبلغ (د.ع) *</label>
                <input type="number" name="amount" required min="0" step="0.01">
            </div>
            <div class="form-group">
                <label>الوصف *</label>
                <input type="text" name="description" required placeholder="مثال: راتب شهر مارس">
            </div>
            <div class="form-group">
                <label>التاريخ *</label>
                <input type="date" name="date" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <button type="submit" class="btn-primary" style="width:100%">حفظ</button>
        </form>
    `;
    showModal();
    onTransactionTypeChange();
}

function onTransactionTypeChange() {
    const typeEl = document.getElementById('transactionType');
    if (!typeEl) return;
    const type = typeEl.value;
    const lawyerGroup = document.getElementById('lawyerGroup');
    const clientGroup = document.getElementById('clientGroup');
    const lawyerSelect = document.getElementById('lawyerSelect');
    const clientSelect = document.getElementById('clientSelect');
    if (!lawyerGroup || !clientGroup) return;
    if (lawyerSelect) lawyerSelect.removeAttribute('required');
    if (clientSelect) clientSelect.removeAttribute('required');
    if (type === 'salary') {
        lawyerGroup.style.display = 'block';
        clientGroup.style.display = 'none';
        if (lawyerSelect) lawyerSelect.setAttribute('required', 'required');
        if (clientSelect) clientSelect.value = '';
    } else if (type === 'commission' || type === 'withdrawal') {
        lawyerGroup.style.display = 'none';
        clientGroup.style.display = 'block';
        if (clientSelect) clientSelect.setAttribute('required', 'required');
        if (lawyerSelect) lawyerSelect.value = '';
    } else if (type === 'expense' || type === '') {
        lawyerGroup.style.display = 'none';
        clientGroup.style.display = 'none';
        if (lawyerSelect) lawyerSelect.value = '';
        if (clientSelect) clientSelect.value = '';
    } else {
        lawyerGroup.style.display = 'none';
        clientGroup.style.display = 'none';
    }
}

async function saveTransaction(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const type = formData.get('type');
    const transaction = {
        type,
        amount: parseFloat(formData.get('amount')),
        notes: formData.get('description'),
        date: formData.get('date')
    };
    if (type === 'salary') {
        const lid = parseInt(formData.get('lawyerId'));
        transaction.lawyerId = lid;
        transaction.lawyerName = database.lawyers.find(l => l.id === lid)?.name || '';
    } else if (type === 'commission' || type === 'withdrawal') {
        const clientName = formData.get('client') || '';
        transaction.client = clientName;
        const clientObj = database.clients.find(c => c.name === clientName);
        if (clientObj) transaction.clientId = clientObj.id;
    }
    
    // Try API first
    if (useBackend && authToken) {
        const result = await apiCall('/transactions', 'POST', transaction);
        if (result) {
            const localTx = {
                id: result.id,
                type,
                amount: formData.get('amount'),
                description: formData.get('description'),
                date: formData.get('date')
            };
            if (type === 'salary') {
                const lid = parseInt(formData.get('lawyerId'));
                localTx.lawyerId = lid;
                localTx.lawyerName = database.lawyers.find(l => l.id === lid)?.name || '';
            } else if (type === 'commission' || type === 'withdrawal') {
                localTx.client = formData.get('client') || '';
            }
            database.transactions.push(localTx);
            saveData();
            renderTransactions();
            loadLawyers();
            updateDashboard();
            closeModal();
            showToast('✅ تم إضافة المعاملة بنجاح', 'success');
            return;
        }
    }
    
    // Fallback to local
    transaction.id = Date.now();
    transaction.description = formData.get('description');
    database.transactions.push(transaction);
    saveData();
    renderTransactions();
    loadLawyers();
    updateDashboard();
    closeModal();
    showToast('✅ تم إضافة المعاملة بنجاح', 'success');
}



function editTransaction(id) {
    if (!checkPermission('transactions', 'edit')) return;
    const transaction = database.transactions.find(t => t.id === id);
    if (!transaction) return;
    
    const casesOptions = database.cases.map(c => 
        `<option value="${c.caseNumber}" ${c.caseNumber === transaction.caseNumber ? 'selected' : ''}>${c.caseNumber} - ${c.title}</option>`
    ).join('');
    const clientsOptions = database.clients.map(c => 
        `<option value="${c.name}" ${c.name === transaction.client ? 'selected' : ''}>${c.name}</option>`
    ).join('');
    const lawyersOptions = database.lawyers.map(l => 
        `<option value="${l.id}" ${l.id === transaction.lawyerId ? 'selected' : ''}>${l.name}</option>`
    ).join('');
    
    const showClient = transaction.type === 'payment_from_client' || 
                      transaction.type === 'payment_to_client' || 
                      transaction.type === 'service_fee';
    
    document.getElementById('modalTitle').textContent = '✏️ تعديل المعاملة';
    document.getElementById('modalBody').innerHTML = `
        <form id="transactionForm" onsubmit="updateTransaction(event, ${id})">
            <div class="form-group">
                <label>نوع المعاملة *</label>
                <select name="type" id="transactionType" onchange="updateTransactionForm()" required>
                    <option value="payment_from_client" ${transaction.type === 'payment_from_client' ? 'selected' : ''}>💵 دفعة من الموكل</option>
                    <option value="payment_to_client" ${transaction.type === 'payment_to_client' ? 'selected' : ''}>💰 دفعة للموكل</option>
                    <option value="service_fee" ${transaction.type === 'service_fee' ? 'selected' : ''}>📋 رسوم خدمة</option>
                    <option value="income" ${transaction.type === 'income' ? 'selected' : ''}>💰 إيراد عام</option>
                    <option value="expense" ${transaction.type === 'expense' ? 'selected' : ''}>💸 مصروف عام</option>
                </select>
            </div>
            <div class="form-group" id="clientGroup" style="display:${showClient ? 'block' : 'none'}">
                <label>الموكل *</label>
                <select name="client" id="clientSelect">
                    <option value="">اختر الموكل</option>
                    ${clientsOptions}
                </select>
            </div>
            <div class="form-group">
                <label>⚖️ المحامي المسؤول *</label>
                <select name="lawyerId" id="lawyerSelect" required>
                    <option value="">اختر المحامي</option>
                    ${lawyersOptions}
                </select>
            </div>
            <div class="form-group">
                <label>المبلغ (د.ع) *</label>
                <input type="number" name="amount" value="${transaction.amount}" required min="0" step="0.01">
            </div>
            <div class="form-group">
                <label>الوصف *</label>
                <input type="text" name="description" value="${transaction.description}" required>
            </div>
            <div class="form-group">
                <label>القضية المرتبطة</label>
                <select name="caseNumber" id="caseSelect" onchange="autoSelectLawyerFromCase()">
                    <option value="">بدون قضية</option>
                    ${casesOptions}
                </select>
            </div>
            <div class="form-group">
                <label>التاريخ *</label>
                <input type="date" name="date" value="${transaction.date}" required>
            </div>
            <button type="submit" class="btn-primary" style="width:100%">حفظ التعديلات</button>
        </form>
    `;
    showModal();
}

function updateTransaction(e, id) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const transaction = database.transactions.find(t => t.id === id);
    if (transaction) {
        const lawyerId = parseInt(formData.get('lawyerId'));
        const lawyer = database.lawyers.find(l => l.id === lawyerId);
        
        transaction.type = formData.get('type');
        transaction.amount = formData.get('amount');
        transaction.description = formData.get('description');
        transaction.client = formData.get('client') || '';
        transaction.caseNumber = formData.get('caseNumber') || '';
        transaction.date = formData.get('date');
        transaction.lawyerId = lawyerId;
        transaction.lawyerName = lawyer ? lawyer.name : '';
        
        saveData();
        renderTransactions();
        renderClients();
        loadLawyers();
        updateDashboard();
        closeModal();
        showToast('✅ تم تحديث المعاملة وربطها بالمحامي', 'success');
    }
}

async function deleteTransaction(id) {
    if (!checkPermission('transactions', 'delete')) return;
    if (confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
        logActivity('delete_transaction', `حذف معاملة: ${database.transactions.find(t => t.id === id)?.description}`);
        
        // Try API first
        if (useBackend && authToken) {
            const result = await apiCall(`/transactions/${id}`, 'DELETE');
            if (result) {
                database.transactions = database.transactions.filter(t => t.id !== id);
                saveData();
                renderTransactions();
                updateDashboard();
                showToast('🗑️ تم حذف المعاملة', 'success');
                return;
            }
        }
        
        // Fallback to local
        database.transactions = database.transactions.filter(t => t.id !== id);
        saveData();
        renderTransactions();
        updateDashboard();
        showToast('🗑️ تم حذف المعاملة (محلي)', 'success');
    }
}

// ==================== التقارير ====================
function generateReport() {
    const type = document.getElementById('reportType').value;
    const fromDate = document.getElementById('reportFromDate').value;
    const toDate = document.getElementById('reportToDate').value;
    
    if (!type) {
        showToast('⚠️ الرجاء اختيار نوع التقرير', 'error');
        return;
    }
    
    let html = '';
    
    if (type === 'financial') {
        html = generateFinancialReport(fromDate, toDate);
    } else if (type === 'clients') {
        html = generateClientsReport(fromDate, toDate);
    } else if (type === 'lawyers') {
        html = generateLawyersReport();
    } else if (type === 'cases') {
        html = generateCasesReport(fromDate, toDate);
    }
    
    document.getElementById('reportContent').innerHTML = html;
}

function generateFinancialReport(from, to) {
    let transactions = database.transactions;
    
    if (from && to) {
        transactions = transactions.filter(t => t.date >= from && t.date <= to);
    }
    
    const income = transactions
        .filter(t => t.type === 'income' || t.type === 'service_fee' || t.type === 'payment_from_client' || t.type === 'commission')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expense = transactions
        .filter(t => t.type === 'expense' || t.type === 'payment_to_client' || t.type === 'salary' || t.type === 'withdrawal')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const balance = income - expense;
    
    // تصنيف حسب النوع
    const byType = {
        'payment_from_client': 0,
        'payment_to_client': 0,
        'service_fee': 0,
        'income': 0,
        'expense': 0,
        'salary': 0,
        'commission': 0,
        'withdrawal': 0
    };
    
    transactions.forEach(t => {
        byType[t.type] = (byType[t.type] || 0) + parseFloat(t.amount);
    });
    
    return `
        <div style="background:var(--surface);padding:30px;border-radius:15px">
            <h2 style="margin:0 0 10px;display:flex;align-items:center;gap:10px">
                <span>📊</span>
                <span>التقرير المالي الشامل</span>
            </h2>
            ${from && to ? `<p style="color:var(--text-light);margin-bottom:25px">📅 الفترة: من ${new Date(from).toLocaleDateString('ar-IQ')} إلى ${new Date(to).toLocaleDateString('ar-IQ')}</p>` : `<p style="color:var(--text-light);margin-bottom:25px">📅 جميع الفترات</p>`}
            
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:30px">
                <div style="padding:25px;background:linear-gradient(135deg,#10b981,#059669);color:white;border-radius:15px;text-align:center;box-shadow:0 4px 15px rgba(16,185,129,0.3)">
                    <div style="font-size:2.5em;font-weight:900;margin-bottom:5px">${income.toLocaleString('ar-IQ')}</div>
                    <div style="font-size:1.1em;opacity:0.9">💰 إجمالي الإيرادات</div>
                    <div style="font-size:0.85em;opacity:0.7;margin-top:5px">${transactions.filter(t => t.type === 'income' || t.type === 'service_fee' || t.type === 'payment_from_client').length} معاملة</div>
                </div>
                <div style="padding:25px;background:linear-gradient(135deg,#ef4444,#dc2626);color:white;border-radius:15px;text-align:center;box-shadow:0 4px 15px rgba(239,68,68,0.3)">
                    <div style="font-size:2.5em;font-weight:900;margin-bottom:5px">${expense.toLocaleString('ar-IQ')}</div>
                    <div style="font-size:1.1em;opacity:0.9">💸 إجمالي المصروفات</div>
                    <div style="font-size:0.85em;opacity:0.7;margin-top:5px">${transactions.filter(t => t.type === 'expense' || t.type === 'payment_to_client' || t.type === 'salary').length} معاملة</div>
                </div>
                <div style="padding:25px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:white;border-radius:15px;text-align:center;box-shadow:0 4px 15px rgba(139,92,246,0.3)">
                    <div style="font-size:2.5em;font-weight:900;margin-bottom:5px">${balance.toLocaleString('ar-IQ')}</div>
                    <div style="font-size:1.1em;opacity:0.9">📈 الرصيد الصافي</div>
                    <div style="font-size:0.85em;opacity:0.7;margin-top:5px">${((income > 0 ? balance/income : 0) * 100).toFixed(1)}% هامش الربح</div>
                </div>
            </div>
            
            <h3 style="margin:30px 0 15px;color:var(--primary);border-right:4px solid var(--primary);padding-right:10px">📊 التصنيف حسب النوع</h3>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:30px">
                <div style="background:var(--bg);padding:15px;border-radius:10px">
                    <div style="color:var(--text-light);font-size:0.9em;margin-bottom:5px">دفعات من موكلين</div>
                    <div style="font-size:1.5em;font-weight:700;color:var(--success)">${byType.payment_from_client.toLocaleString('ar-IQ')} د.ع</div>
                </div>
                <div style="background:var(--bg);padding:15px;border-radius:10px">
                    <div style="color:var(--text-light);font-size:0.9em;margin-bottom:5px">رسوم خدمات</div>
                    <div style="font-size:1.5em;font-weight:700;color:var(--info)">${byType.service_fee.toLocaleString('ar-IQ')} د.ع</div>
                </div>
                <div style="background:var(--bg);padding:15px;border-radius:10px">
                    <div style="color:var(--text-light);font-size:0.9em;margin-bottom:5px">عمولات</div>
                    <div style="font-size:1.5em;font-weight:700;color:var(--success)">${byType.commission.toLocaleString('ar-IQ')} د.ع</div>
                </div>
                <div style="background:var(--bg);padding:15px;border-radius:10px">
                    <div style="color:var(--text-light);font-size:0.9em;margin-bottom:5px">إيرادات عامة</div>
                    <div style="font-size:1.5em;font-weight:700;color:var(--success)">${byType.income.toLocaleString('ar-IQ')} د.ع</div>
                </div>
                <div style="background:var(--bg);padding:15px;border-radius:10px">
                    <div style="color:var(--text-light);font-size:0.9em;margin-bottom:5px">دفعات لموكلين</div>
                    <div style="font-size:1.5em;font-weight:700;color:var(--danger)">${byType.payment_to_client.toLocaleString('ar-IQ')} د.ع</div>
                </div>
                <div style="background:var(--bg);padding:15px;border-radius:10px">
                    <div style="color:var(--text-light);font-size:0.9em;margin-bottom:5px">مصروفات عامة</div>
                    <div style="font-size:1.5em;font-weight:700;color:var(--danger)">${byType.expense.toLocaleString('ar-IQ')} د.ع</div>
                </div>
                <div style="background:var(--bg);padding:15px;border-radius:10px">
                    <div style="color:var(--text-light);font-size:0.9em;margin-bottom:5px">رواتب المحامين</div>
                    <div style="font-size:1.5em;font-weight:700;color:var(--warning)">${byType.salary.toLocaleString('ar-IQ')} د.ع</div>
                </div>
                <div style="background:var(--bg);padding:15px;border-radius:10px">
                    <div style="color:var(--text-light);font-size:0.9em;margin-bottom:5px">سحوبات</div>
                    <div style="font-size:1.5em;font-weight:700;color:var(--danger)">${byType.withdrawal.toLocaleString('ar-IQ')} د.ع</div>
                </div>
            </div>
            
            <h3 style="margin:30px 0 15px;color:var(--primary);border-right:4px solid var(--primary);padding-right:10px">📝 تفاصيل جميع المعاملات (${transactions.length})</h3>
            <div style="max-height:500px;overflow-y:auto">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>النوع</th>
                            <th>الموكل/المحامي</th>
                            <th>القضية</th>
                            <th>المبلغ</th>
                            <th>الوصف</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.slice().reverse().map(t => `
                            <tr>
                                <td>${new Date(t.date).toLocaleDateString('ar-IQ')}</td>
                                <td><span style="background:var(--bg);padding:4px 10px;border-radius:8px;font-size:0.85em;white-space:nowrap">${getTransactionTypeText(t.type)}</span></td>
                                <td>${t.client || t.lawyer || '-'}</td>
                                <td>${t.caseNumber || '-'}</td>
                                <td class="${t.type.includes('payment_to') || t.type === 'expense' || t.type === 'salary' ? 'transaction-expense' : 'transaction-income'}">
                                    <strong>${parseFloat(t.amount).toLocaleString('ar-IQ')} د.ع</strong>
                                </td>
                                <td>${t.description || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function generateLawyersReport() {
    const lawyersData = database.lawyers.map(l => {
        const lawyerCases = database.cases.filter(c => c.lawyer === l.name || c.lawyerId === l.id);
        const activeCases = lawyerCases.filter(c => c.status === 'active').length;
        const closedCases = lawyerCases.filter(c => c.status === 'closed').length;
        
        // الحسابات المالية
        const caseNumbers = lawyerCases.map(c => c.caseNumber);
        const allTransactions = database.transactions.filter(t => 
            t.lawyerId === l.id || 
            t.lawyer === l.name || 
            (t.caseNumber && caseNumbers.includes(t.caseNumber))
        );
        
        const totalIncome = allTransactions
            .filter(t => t.type === 'service_fee' || t.type === 'payment_from_client')
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        
        const totalExpense = allTransactions
            .filter(t => t.type === 'expense' || t.type === 'salary')
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        
        const balance = totalIncome - totalExpense;
        
        return {
            ...l,
            totalCases: lawyerCases.length,
            activeCases,
            closedCases,
            totalIncome,
            totalExpense,
            balance
        };
    });
    
    const totalAllCases = lawyersData.reduce((sum, l) => sum + l.totalCases, 0);
    const totalAllIncome = lawyersData.reduce((sum, l) => sum + l.totalIncome, 0);
    const totalAllExpense = lawyersData.reduce((sum, l) => sum + l.totalExpense, 0);
    const totalAllBalance = totalAllIncome - totalAllExpense;
    
    return `
        <div style="background:var(--surface);padding:30px;border-radius:15px">
            <h2 style="margin:0 0 10px;display:flex;align-items:center;gap:10px">
                <span>👨‍⚖️</span>
                <span>تقرير المحامين الشامل</span>
            </h2>
            <p style="color:var(--text-light);margin-bottom:25px">إحصائيات شاملة لجميع المحامين في المكتب</p>
            
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin-bottom:30px">
                <div style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:white;padding:20px;border-radius:12px;text-align:center">
                    <div style="font-size:2.5em;font-weight:900">${database.lawyers.length}</div>
                    <div style="opacity:0.9">إجمالي المحامين</div>
                </div>
                <div style="background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;padding:20px;border-radius:12px;text-align:center">
                    <div style="font-size:2.5em;font-weight:900">${totalAllCases}</div>
                    <div style="opacity:0.9">إجمالي القضايا</div>
                </div>
                <div style="background:linear-gradient(135deg,#10b981,#059669);color:white;padding:20px;border-radius:12px;text-align:center">
                    <div style="font-size:1.8em;font-weight:900">${totalAllIncome.toLocaleString('ar-IQ')}</div>
                    <div style="opacity:0.9">إجمالي الإيرادات</div>
                </div>
                <div style="background:linear-gradient(135deg,#f59e0b,#d97706);color:white;padding:20px;border-radius:12px;text-align:center">
                    <div style="font-size:1.8em;font-weight:900">${totalAllBalance.toLocaleString('ar-IQ')}</div>
                    <div style="opacity:0.9">صافي الأرباح</div>
                </div>
            </div>
            
            <h3 style="margin:30px 0 15px;color:var(--primary);border-right:4px solid var(--primary);padding-right:10px">📊 تفاصيل كل محامي</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>التخصص</th>
                        <th>رقم الترخيص</th>
                        <th>القضايا النشطة</th>
                        <th>القضايا المنتهية</th>
                        <th>الراتب</th>
                        <th>الدائن</th>
                        <th>المدين</th>
                        <th>الرصيد</th>
                    </tr>
                </thead>
                <tbody>
                    ${lawyersData.map(l => {
                        // حساب الدائن والمدين
                        const lawyerTransactions = database.transactions.filter(t => 
                            t.lawyerId === l.id || t.lawyer === l.name || t.lawyerName === l.name
                        );
                        const credit = lawyerTransactions
                            .filter(t => t.type === 'salary' || t.type === 'service_fee' || t.type === 'income')
                            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
                        const debt = lawyerTransactions
                            .filter(t => t.type === 'expense' || t.type === 'payment_to_client')
                            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
                        const salary = parseFloat(l.salary) || 0;
                        
                        return `
                        <tr style="cursor:pointer" onclick="showLawyerFinancials(${l.id})" 
                            onmouseenter="this.style.background='var(--bg)'"
                            onmouseleave="this.style.background='transparent'">
                            <td><strong>⚖️ ${l.name}</strong></td>
                            <td>${l.specialty}</td>
                            <td>${l.license}</td>
                            <td>
                                <span style="background:var(--success);color:white;padding:4px 10px;border-radius:8px;font-weight:700">
                                    ${l.activeCases}
                                </span>
                            </td>
                            <td>
                                <span style="background:var(--text-light);color:white;padding:4px 10px;border-radius:8px;font-weight:700">
                                    ${l.closedCases}
                                </span>
                            </td>
                            <td style="color:var(--primary);font-weight:700">
                                ${salary.toLocaleString('ar-IQ')} د.ع
                            </td>
                            <td class="transaction-income" style="font-weight:700">
                                ${credit.toLocaleString('ar-IQ')} د.ع
                            </td>
                            <td class="transaction-expense" style="font-weight:700">
                                ${debt.toLocaleString('ar-IQ')} د.ع
                            </td>
                            <td class="${l.balance >= 0 ? 'transaction-income' : 'transaction-expense'}">
                                <strong>${l.balance.toLocaleString('ar-IQ')} د.ع</strong>
                            </td>
                        </tr>
                    `;}).join('')}
                    <tr style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;font-weight:900;font-size:1.1em">
                        <td colspan="3" style="text-align:center">📊 المجموع الإجمالي</td>
                        <td><strong>${lawyersData.reduce((s, l) => s + l.activeCases, 0)}</strong></td>
                        <td><strong>${lawyersData.reduce((s, l) => s + l.closedCases, 0)}</strong></td>
                        <td>${lawyersData.reduce((s, l) => s + (parseFloat(l.salary) || 0), 0).toLocaleString('ar-IQ')} د.ع</td>
                        <td>${lawyersData.map(l => {
                            const lawyerTransactions = database.transactions.filter(t => 
                                t.lawyerId === l.id || t.lawyer === l.name || t.lawyerName === l.name
                            );
                            return lawyerTransactions
                                .filter(t => t.type === 'salary' || t.type === 'service_fee' || t.type === 'income')
                                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
                        }).reduce((a, b) => a + b, 0).toLocaleString('ar-IQ')} د.ع</td>
                        <td>${lawyersData.map(l => {
                            const lawyerTransactions = database.transactions.filter(t => 
                                t.lawyerId === l.id || t.lawyer === l.name || t.lawyerName === l.name
                            );
                            return lawyerTransactions
                                .filter(t => t.type === 'expense' || t.type === 'payment_to_client')
                                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
                        }).reduce((a, b) => a + b, 0).toLocaleString('ar-IQ')} د.ع</td>
                        <td><strong>${totalAllBalance.toLocaleString('ar-IQ')} د.ع</strong></td>
                    </tr>
                </tbody>
            </table>
            
            <p style="margin-top:20px;text-align:center;color:var(--text-light);font-size:0.9em">
                💡 انقر على أي محامي لعرض تفاصيله المالية الكاملة
            </p>
        </div>
    `;
}

function generateCasesReport(from, to) {
    let cases = database.cases;
    
    if (from && to) {
        cases = cases.filter(c => c.startDate >= from && c.startDate <= to);
    }
    
    const active = cases.filter(c => c.status === 'active');
    const pending = cases.filter(c => c.status === 'pending');
    const closed = cases.filter(c => c.status === 'closed');
    const totalFees = cases.reduce((sum, c) => sum + parseFloat(c.fees || 0), 0);
    
    // حساب الإيرادات الفعلية من القضايا
    const caseNumbers = cases.map(c => c.caseNumber);
    const caseTransactions = database.transactions.filter(t => caseNumbers.includes(t.caseNumber));
    const totalIncome = caseTransactions
        .filter(t => t.type === 'payment_from_client' || t.type === 'service_fee')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const totalExpense = caseTransactions
        .filter(t => t.type === 'expense' || t.type === 'payment_to_client')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    return `
        <div style="background:var(--surface);padding:30px;border-radius:15px">
            <h2 style="margin:0 0 10px;display:flex;align-items:center;gap:10px">
                <span>📁</span>
                <span>تقرير القضايا الشامل</span>
            </h2>
            ${from && to ? `<p style="color:var(--text-light);margin-bottom:25px">📅 الفترة: من ${new Date(from).toLocaleDateString('ar-IQ')} إلى ${new Date(to).toLocaleDateString('ar-IQ')}</p>` : `<p style="color:var(--text-light);margin-bottom:25px">📅 جميع الفترات</p>`}
            
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:25px">
                <div style="padding:20px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;border-radius:12px;text-align:center;box-shadow:0 4px 15px rgba(59,130,246,0.3)">
                    <div style="font-size:2.5em;font-weight:900">${cases.length}</div>
                    <div style="font-size:1.1em;opacity:0.9">إجمالي القضايا</div>
                </div>
                <div style="padding:20px;background:linear-gradient(135deg,#10b981,#059669);color:white;border-radius:12px;text-align:center;box-shadow:0 4px 15px rgba(16,185,129,0.3)">
                    <div style="font-size:2.5em;font-weight:900">${active.length}</div>
                    <div style="font-size:1.1em;opacity:0.9">نشطة</div>
                </div>
                <div style="padding:20px;background:linear-gradient(135deg,#f59e0b,#d97706);color:white;border-radius:12px;text-align:center;box-shadow:0 4px 15px rgba(245,158,11,0.3)">
                    <div style="font-size:2.5em;font-weight:900">${pending.length}</div>
                    <div style="font-size:1.1em;opacity:0.9">معلقة</div>
                </div>
                <div style="padding:20px;background:linear-gradient(135deg,#6b7280,#4b5563);color:white;border-radius:12px;text-align:center;box-shadow:0 4px 15px rgba(107,114,128,0.3)">
                    <div style="font-size:2.5em;font-weight:900">${closed.length}</div>
                    <div style="font-size:1.1em;opacity:0.9">منتهية</div>
                </div>
            </div>
            
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:30px">
                <div style="padding:20px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:white;border-radius:12px;text-align:center;box-shadow:0 4px 15px rgba(139,92,246,0.3)">
                    <div style="font-size:1.8em;font-weight:900">${totalFees.toLocaleString('ar-IQ')}</div>
                    <div style="font-size:1.1em;opacity:0.9">إجمالي الأتعاب</div>
                </div>
                <div style="padding:20px;background:linear-gradient(135deg,#10b981,#059669);color:white;border-radius:12px;text-align:center;box-shadow:0 4px 15px rgba(16,185,129,0.3)">
                    <div style="font-size:1.8em;font-weight:900">${totalIncome.toLocaleString('ar-IQ')}</div>
                    <div style="font-size:1.1em;opacity:0.9">الإيرادات الفعلية</div>
                </div>
                <div style="padding:20px;background:linear-gradient(135deg,#ef4444,#dc2626);color:white;border-radius:12px;text-align:center;box-shadow:0 4px 15px rgba(239,68,68,0.3)">
                    <div style="font-size:1.8em;font-weight:900">${totalExpense.toLocaleString('ar-IQ')}</div>
                    <div style="font-size:1.1em;opacity:0.9">المصروفات</div>
                </div>
            </div>
            
            <h3 style="margin:30px 0 15px;color:var(--primary);border-right:4px solid var(--primary);padding-right:10px">📋 تفاصيل جميع القضايا</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>رقم القضية</th>
                        <th>العنوان</th>
                        <th>المحامي</th>
                        <th>الموكل</th>
                        <th>الحالة</th>
                        <th>الأتعاب</th>
                        <th>الإيرادات</th>
                        <th>الربح</th>
                    </tr>
            </thead>
            <tbody>
                ${cases.map(c => {
                    const caseTx = database.transactions.filter(t => t.caseNumber === c.caseNumber);
                    const caseIncome = caseTx
                        .filter(t => t.type === 'payment_from_client' || t.type === 'service_fee')
                        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
                    const caseExpense = caseTx
                        .filter(t => t.type === 'expense' || t.type === 'payment_to_client')
                        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
                    const caseProfit = caseIncome - caseExpense;
                    
                    return `
                        <tr style="cursor:pointer" onclick="showCaseDetails('${c.id}')"
                            onmouseenter="this.style.background='var(--bg)'"
                            onmouseleave="this.style.background='transparent'">
                            <td><strong>${c.caseNumber}</strong></td>
                            <td>${c.title}</td>
                            <td>⚖️ ${c.lawyer}</td>
                            <td>👤 ${c.client}</td>
                            <td><span class="status-${c.status}">${getStatusText(c.status)}</span></td>
                            <td>${parseFloat(c.fees || 0).toLocaleString('ar-IQ')} د.ع</td>
                            <td class="transaction-income"><strong>${caseIncome.toLocaleString('ar-IQ')} د.ع</strong></td>
                            <td class="${caseProfit >= 0 ? 'transaction-income' : 'transaction-expense'}">
                                <strong>${caseProfit.toLocaleString('ar-IQ')} د.ع</strong>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        
        <p style="margin-top:20px;text-align:center;color:var(--text-light);font-size:0.9em">
            💡 انقر على أي قضية لعرض تفاصيلها الكاملة
        </p>
    </div>
    `;
}

function generateClientsReport(from, to) {
    const clients = database.clients || [];
    let tx = database.transactions || [];
    if (from && to) {
        tx = tx.filter(t => t.date >= from && t.date <= to);
    }
    const relevant = tx.filter(t => t.client);
    const rows = clients.map(c => {
        const list = relevant.filter(t => t.client === c.name);
        const commission = list.filter(t => t.type === 'commission').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
        const withdrawal = list.filter(t => t.type === 'withdrawal').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
        const count = list.length;
        const balance = commission - withdrawal;
        return { client: c, commission, withdrawal, count, balance, list };
    }).filter(r => r.count > 0);

    const totals = rows.reduce((acc, r) => ({
        commission: acc.commission + r.commission,
        withdrawal: acc.withdrawal + r.withdrawal,
        balance: acc.balance + r.balance,
        count: acc.count + r.count
    }), { commission: 0, withdrawal: 0, balance: 0, count: 0 });

    return `
    <div style="background:var(--surface);padding:30px;border-radius:15px">
        <h2 style="margin:0 0 10px;display:flex;align-items:center;gap:10px">
            <span>👥</span>
            <span>تقرير الزبائن</span>
        </h2>
        ${from && to ? `<p style="color:var(--text-light);margin-bottom:25px">📅 الفترة: من ${new Date(from).toLocaleDateString('ar-IQ')} إلى ${new Date(to).toLocaleDateString('ar-IQ')}</p>` : `<p style="color:var(--text-light);margin-bottom:25px">📅 جميع الفترات</p>`}

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:30px">
            <div style="padding:20px;background:linear-gradient(135deg,#10b981,#059669);color:white;border-radius:12px;text-align:center">
                <div style="font-size:2em;font-weight:900">${totals.commission.toLocaleString('ar-IQ')}</div>
                <div>📋 إجمالي العمولات</div>
            </div>
            <div style="padding:20px;background:linear-gradient(135deg,#ef4444,#dc2626);color:white;border-radius:12px;text-align:center">
                <div style="font-size:2em;font-weight:900">${totals.withdrawal.toLocaleString('ar-IQ')}</div>
                <div>💳 إجمالي السحوبات</div>
            </div>
            <div style="padding:20px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:white;border-radius:12px;text-align:center">
                <div style="font-size:2em;font-weight:900">${totals.balance.toLocaleString('ar-IQ')}</div>
                <div>⚖️ صافي أرصدة الزبائن</div>
            </div>
        </div>

        <h3 style="margin:30px 0 15px;color:var(--primary);border-right:4px solid var(--primary);padding-right:10px">📊 أرصدة الزبائن</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>الزبون</th>
                    <th>العمولات</th>
                    <th>السحوبات</th>
                    <th>الرصيد</th>
                    <th>المعاملات</th>
                </tr>
            </thead>
            <tbody>
                ${rows.map(r => `
                    <tr>
                        <td><strong>${r.client.name}</strong></td>
                        <td class="transaction-income"><strong>${r.commission.toLocaleString('ar-IQ')} د.ع</strong></td>
                        <td class="transaction-expense"><strong>${r.withdrawal.toLocaleString('ar-IQ')} د.ع</strong></td>
                        <td class="${r.balance >= 0 ? 'transaction-income' : 'transaction-expense'}"><strong>${r.balance.toLocaleString('ar-IQ')} د.ع</strong></td>
                        <td>${r.count}</td>
                    </tr>
                    <tr>
                        <td colspan="5" style="background:var(--bg);padding:0">
                            <div style="max-height:240px;overflow:auto">
                                <table class="data-table" style="margin:0">
                                    <thead>
                                        <tr>
                                            <th>التاريخ</th>
                                            <th>النوع</th>
                                            <th>المبلغ</th>
                                            <th>الوصف</th>
                                            <th>القضية</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${r.list.slice().reverse().map(t => `
                                            <tr>
                                                <td>${new Date(t.date).toLocaleDateString('ar-IQ')}</td>
                                                <td>${getTransactionTypeText(t.type)}</td>
                                                <td class="${t.type === 'commission' ? 'transaction-income' : 'transaction-expense'}"><strong>${parseFloat(t.amount).toLocaleString('ar-IQ')} د.ع</strong></td>
                                                <td>${t.description || t.notes || '-'}</td>
                                                <td>${t.caseNumber || '-'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    `;
}

function printReport() {
    window.print();
}

// ==================== الإعدادات ====================
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    }
    showToast(`✅ تم تغيير المظهر إلى ${theme === 'dark' ? 'الوضع الداكن' : 'الوضع الفاتح'}`, 'success');
}

// ==================== إدارة المستخدمين ====================
function showUsersManagement() {
    if (!checkPermission('users', 'view')) return;
    
    const usersHtml = database.users.map(u => `
        <tr>
            <td>${u.name}</td>
            <td>${u.username}</td>
            <td>${u.email}</td>
            <td>
                <span class="role-badge role-${u.role}">${getRoleName(u.role)}</span>
                ${u.customPermissions ? '<br><small style="color:var(--warning)">🔧 صلاحيات مخصصة</small>' : ''}
            </td>
            <td>
                <div class="action-btns">
                    ${u.role !== 'admin' && hasPermission('users', 'edit') ? `<button class="btn-primary" style="font-size:0.85em" onclick="manageCustomPermissions(${u.id})">🔒 الصلاحيات</button>` : ''}
                    ${hasPermission('users', 'edit') ? `<button class="btn-edit" onclick="editUser(${u.id})">✏️</button>` : ''}
                    ${hasPermission('users', 'delete') && u.id !== currentUser.id ? `<button class="btn-delete" onclick="deleteUser(${u.id})">🗑️</button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
    
    document.getElementById('modalTitle').textContent = '👥 إدارة المستخدمين';
    document.getElementById('modalBody').innerHTML = `
        ${hasPermission('users', 'add') ? `
        <button class="btn-primary" onclick="showAddUserModal()" style="width:100%;margin-bottom:20px">
            ➕ إضافة مستخدم جديد
        </button>
        ` : ''}
        
        <div style="overflow-x:auto">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>اسم المستخدم</th>
                        <th>البريد</th>
                        <th>الدور / الصلاحيات</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    ${usersHtml}
                </tbody>
            </table>
        </div>
        
        <h4 style="margin-top:30px">📊 سجل النشاطات الأخيرة</h4>
        <div style="max-height:300px;overflow-y:auto;margin-top:10px">
            ${renderActivityLog()}
        </div>
    `;
    showModal();
}

function showAddUserModal() {
    if (!checkPermission('users', 'add')) return;
    
    document.getElementById('modalTitle').textContent = '➕ إضافة مستخدم جديد';
    document.getElementById('modalBody').innerHTML = `
        <form id="userForm" onsubmit="saveUser(event)">
            <div class="form-group">
                <label>الاسم الكامل *</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>اسم المستخدم *</label>
                <input type="text" name="username" required>
            </div>
            <div class="form-group">
                <label>كلمة المرور *</label>
                <input type="password" name="password" required minlength="6">
            </div>
            <div class="form-group">
                <label>البريد الإلكتروني *</label>
                <input type="email" name="email" required>
            </div>
            <div class="form-group">
                <label>الدور *</label>
                <select name="role" required>
                    <option value="">اختر الدور</option>
                    <option value="admin">👑 مدير النظام</option>
                    <option value="lawyer">👨‍⚖️ محامي</option>
                    <option value="accountant">💼 محاسب</option>
                </select>
            </div>
            <button type="submit" class="btn-primary" style="width:100%">حفظ</button>
        </form>
    `;
    showModal();
}

function saveUser(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const username = formData.get('username');
    if (database.users.find(u => u.username === username)) {
        showToast('❌ اسم المستخدم موجود مسبقاً', 'error');
        return;
    }
    
    const user = {
        id: Date.now(),
        name: formData.get('name'),
        username: username,
        password: formData.get('password'),
        email: formData.get('email'),
        role: formData.get('role'),
        customPermissions: null // سيتم تعيينها لاحقاً إذا أراد المدير
    };
    
    database.users.push(user);
    saveData();
    logActivity('add_user', `إضافة مستخدم: ${user.name}`);
    showToast('✅ تم إضافة المستخدم بنجاح', 'success');
    showUsersManagement();
}

function editUser(id) {
    if (!checkPermission('users', 'edit')) return;
    const user = database.users.find(u => u.id === id);
    if (!user) return;
    
    document.getElementById('modalTitle').textContent = '✏️ تعديل بيانات المستخدم';
    document.getElementById('modalBody').innerHTML = `
        <form id="userForm" onsubmit="updateUser(event, ${id})">
            <div class="form-group">
                <label>الاسم الكامل *</label>
                <input type="text" name="name" value="${user.name}" required>
            </div>
            <div class="form-group">
                <label>اسم المستخدم *</label>
                <input type="text" name="username" value="${user.username}" required>
            </div>
            <div class="form-group">
                <label>كلمة المرور الجديدة (اتركها فارغة للإبقاء على القديمة)</label>
                <input type="password" name="password" minlength="6">
            </div>
            <div class="form-group">
                <label>البريد الإلكتروني *</label>
                <input type="email" name="email" value="${user.email}" required>
            </div>
            <div class="form-group">
                <label>الدور *</label>
                <select name="role" required>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>👑 مدير النظام</option>
                    <option value="lawyer" ${user.role === 'lawyer' ? 'selected' : ''}>👨‍⚖️ محامي</option>
                    <option value="accountant" ${user.role === 'accountant' ? 'selected' : ''}>💼 محاسب</option>
                </select>
            </div>
            <button type="submit" class="btn-primary" style="width:100%">حفظ التعديلات</button>
        </form>
    `;
    showModal();
}

function updateUser(e, id) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const user = database.users.find(u => u.id === id);
    if (user) {
        const newUsername = formData.get('username');
        if (newUsername !== user.username && database.users.find(u => u.username === newUsername)) {
            showToast('❌ اسم المستخدم موجود مسبقاً', 'error');
            return;
        }
        
        user.name = formData.get('name');
        user.username = newUsername;
        user.email = formData.get('email');
        user.role = formData.get('role');
        
        const newPassword = formData.get('password');
        if (newPassword) {
            user.password = newPassword;
        }
        
        saveData();
        logActivity('edit_user', `تعديل مستخدم: ${user.name}`);
        showToast('✅ تم تحديث بيانات المستخدم', 'success');
        showUsersManagement();
    }
}

function deleteUser(id) {
    if (!checkPermission('users', 'delete')) return;
    if (id === currentUser.id) {
        showToast('❌ لا يمكن حذف حسابك الخاص', 'error');
        return;
    }
    
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        const user = database.users.find(u => u.id === id);
        database.users = database.users.filter(u => u.id !== id);
        saveData();
        logActivity('delete_user', `حذف مستخدم: ${user?.name}`);
        showToast('🗑️ تم حذف المستخدم', 'success');
        showUsersManagement();
    }
}

function renderActivityLog() {
    if (!database.activityLog || database.activityLog.length === 0) {
        return '<p style="text-align:center;color:var(--text-light);padding:20px">لا توجد نشاطات</p>';
    }
    
    const recentActivities = database.activityLog.slice(-20).reverse();
    return recentActivities.map(a => `
        <div style="padding:12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:start">
            <div>
                <strong>${a.user}</strong> - ${a.details}
                <br>
                <small style="color:var(--text-light)">${new Date(a.timestamp).toLocaleString('ar-IQ')}</small>
            </div>
            <span class="activity-badge">${getActivityIcon(a.action)}</span>
        </div>
    `).join('');
}

function getActivityIcon(action) {
    const icons = {
        login: '🔐',
        login_failed: '❌',
        add_user: '➕',
        edit_user: '✏️',
        delete_user: '🗑️',
        delete_lawyer: '🗑️',
        delete_case: '🗑️',
        delete_client: '🗑️',
        delete_transaction: '🗑️',
        export_data: '📥',
        custom_permissions: '🔒'
    };
    return icons[action] || '📌';
}

// ==================== إعدادات الشركة ====================
function showCompanySettings() {
    const company = database.companyInfo || {};
    
    document.getElementById('modalTitle').textContent = '🏢 إعدادات الشركة للطباعة';
    document.getElementById('modalBody').innerHTML = `
        <form id="companyForm" onsubmit="saveCompanySettings(event)">
            <div class="form-group">
                <label>اسم الشركة / المكتب *</label>
                <input type="text" name="name" value="${company.name || ''}" required>
            </div>
            <div class="form-group">
                <label>العنوان</label>
                <input type="text" name="address" value="${company.address || ''}">
            </div>
            <div class="form-group">
                <label>رقم الهاتف</label>
                <input type="tel" name="phone" value="${company.phone || ''}">
            </div>
            <div class="form-group">
                <label>البريد الإلكتروني</label>
                <input type="email" name="email" value="${company.email || ''}">
            </div>
            <div class="form-group">
                <label>رابط الشعار (Logo URL)</label>
                <input type="url" name="logo" value="${company.logo || ''}" placeholder="https://example.com/logo.png">
                ${company.logo ? `<img src="${company.logo}" style="max-width:200px;margin-top:10px;border-radius:8px" onerror="this.style.display='none'">` : ''}
            </div>
            <div class="form-group">
                <label>رفع شعار جديد</label>
                <input type="file" id="logoFile" accept="image/*" onchange="handleLogoUpload(event)">
                <small style="color:var(--text-light);display:block;margin-top:5px">يفضل PNG أو JPG - أقل من 2MB</small>
            </div>
            <button type="submit" class="btn-primary" style="width:100%">💾 حفظ الإعدادات</button>
        </form>
    `;
    showModal();
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        showToast('❌ حجم الملف أكبر من 2MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        document.querySelector('input[name="logo"]').value = e.target.result;
        showToast('✅ تم تحميل الشعار', 'success');
    };
    reader.readAsDataURL(file);
}

function saveCompanySettings(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    database.companyInfo = {
        name: formData.get('name'),
        address: formData.get('address'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        logo: formData.get('logo')
    };
    
    saveData();
    closeModal();
    showToast('✅ تم حفظ إعدادات الشركة', 'success');
}

// ==================== الطباعة ====================
function printInvoice(type, id) {
    let content = '';
    const company = database.companyInfo || {};
    
    if (type === 'client') {
        const client = database.clients.find(c => c.id === id);
        if (!client) return;
        
        const transactions = database.transactions.filter(t => t.client === client.name);
        const balance = calculateClientBalance(client.name);
        
        content = generateClientInvoice(client, transactions, balance, company);
    } else if (type === 'case') {
        const caseData = database.cases.find(c => c.id === id);
        if (!caseData) return;
        
        content = generateCaseInvoice(caseData, company);
    } else if (type === 'transaction') {
        const transaction = database.transactions.find(t => t.id === id);
        if (!transaction) return;
        
        content = generateTransactionInvoice(transaction, company);
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

function generateClientInvoice(client, transactions, balance, company) {
    return `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>كشف حساب - ${client.name}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
                .invoice { max-width: 800px; margin: 0 auto; border: 2px solid #333; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                .logo { max-width: 150px; margin-bottom: 15px; }
                .company-name { font-size: 2em; font-weight: bold; margin-bottom: 10px; }
                .company-info { font-size: 0.9em; opacity: 0.9; }
                .invoice-title { background: #f8f9fa; padding: 20px; border-bottom: 3px solid #667eea; }
                .invoice-title h2 { color: #333; font-size: 1.8em; }
                .client-info { padding: 20px; background: #fff; border-bottom: 1px solid #ddd; }
                .info-row { display: flex; margin: 10px 0; }
                .info-label { font-weight: bold; width: 150px; color: #666; }
                .info-value { flex: 1; color: #333; }
                .balance-box { padding: 20px; margin: 20px; background: ${balance > 0 ? '#d4edda' : balance < 0 ? '#f8d7da' : '#e2e3e5'}; border-radius: 10px; text-align: center; }
                .balance-amount { font-size: 2.5em; font-weight: bold; color: ${balance > 0 ? '#155724' : balance < 0 ? '#721c24' : '#383d41'}; }
                .balance-label { font-size: 1.2em; margin-top: 10px; color: #666; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th { background: #667eea; color: white; padding: 12px; text-align: right; }
                td { padding: 12px; border-bottom: 1px solid #ddd; text-align: right; }
                tr:nth-child(even) { background: #f8f9fa; }
                .footer { text-align: center; padding: 20px; background: #f8f9fa; border-top: 2px solid #667eea; }
                .print-date { color: #666; font-size: 0.9em; }
                @media print {
                    body { padding: 0; }
                    .invoice { border: none; }
                }
            </style>
        </head>
        <body>
            <div class="invoice">
                <div class="header">
                    ${company.logo ? `<img src="${company.logo}" class="logo" alt="Logo">` : ''}
                    <div class="company-name">${company.name || 'مكتب المحاماة'}</div>
                    <div class="company-info">
                        ${company.address ? company.address + '<br>' : ''}
                        ${company.phone ? '📞 ' + company.phone + ' | ' : ''}
                        ${company.email ? '📧 ' + company.email : ''}
                    </div>
                </div>
                
                <div class="invoice-title">
                    <h2>💳 كشف حساب موكل</h2>
                </div>
                
                <div class="client-info">
                    <div class="info-row">
                        <div class="info-label">اسم العميل:</div>
                        <div class="info-value">${client.name}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">رقم الهاتف:</div>
                        <div class="info-value">${client.phone}</div>
                    </div>
                    ${client.email ? `
                    <div class="info-row">
                        <div class="info-label">البريد:</div>
                        <div class="info-value">${client.email}</div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="balance-box">
                    <div class="balance-amount">${Math.abs(balance).toLocaleString('ar-IQ')} د.ع</div>
                    <div class="balance-label">${balance > 0 ? 'له دين علينا' : balance < 0 ? 'عليه دين لنا' : 'لا يوجد دين'}</div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>البيان</th>
                            <th>مدين</th>
                            <th>دائن</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(t => {
                            const amount = parseFloat(t.amount);
                            let debit = 0, credit = 0;
                            if (t.type === 'payment_from_client' || t.type === 'service_fee') credit = amount;
                            else if (t.type === 'payment_to_client') debit = amount;
                            return `
                                <tr>
                                    <td>${new Date(t.date).toLocaleDateString('ar-IQ')}</td>
                                    <td>${t.description}</td>
                                    <td>${debit > 0 ? debit.toLocaleString('ar-IQ') : '-'}</td>
                                    <td>${credit > 0 ? credit.toLocaleString('ar-IQ') : '-'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <div class="print-date">تاريخ الطباعة: ${new Date().toLocaleString('ar-IQ')}</div>
                </div>
            </div>
        </body>
        </html>
    `;
}

function generateCaseInvoice(caseData, company) {
    const transactions = database.transactions.filter(t => t.caseNumber === caseData.caseNumber);
    const totalPaid = transactions.filter(t => t.type === 'payment_from_client').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const totalFees = parseFloat(caseData.fees || 0);
    const remaining = totalFees - totalPaid;
    const statusColors = { active: '#10b981', pending: '#f59e0b', closed: '#6b7280' };
    const statusNames = { active: 'نشطة', pending: 'معلقة', closed: 'منتهية' };
    
    return `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>فاتورة قضية - ${caseData.caseNumber}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', 'Cairo', Tahoma, Geneva, Verdana, sans-serif; 
                    padding: 20px; 
                    background: #f5f7fa;
                }
                .invoice { 
                    max-width: 900px; 
                    margin: 0 auto; 
                    background: white;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                    border-radius: 15px;
                    overflow: hidden;
                }
                .header { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 40px; 
                    text-align: center;
                    position: relative;
                }
                .header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
                    opacity: 0.3;
                }
                .logo { max-width: 120px; margin-bottom: 15px; border-radius: 50%; background: white; padding: 10px; }
                .company-name { 
                    font-size: 2.5em; 
                    font-weight: 900; 
                    margin-bottom: 10px; 
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
                    position: relative;
                    z-index: 1;
                }
                .company-info { 
                    font-size: 1em; 
                    opacity: 0.95;
                    position: relative;
                    z-index: 1;
                }
                .invoice-title { 
                    background: linear-gradient(to bottom, #f8f9fa, white); 
                    padding: 25px 40px; 
                    border-bottom: 3px solid #667eea;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .invoice-title h2 {
                    color: #333;
                    font-size: 2em;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .invoice-number {
                    background: #667eea;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-size: 0.9em;
                    font-weight: 700;
                }
                .case-details { padding: 40px; }
                .detail-row { 
                    display: flex; 
                    margin: 15px 0; 
                    padding: 18px; 
                    background: linear-gradient(to left, #f8f9fa, white); 
                    border-radius: 10px;
                    border-right: 4px solid #667eea;
                    transition: transform 0.2s;
                }
                .detail-row:hover {
                    transform: translateX(-5px);
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .detail-label { 
                    font-weight: 700; 
                    width: 220px; 
                    color: #555;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .detail-value { 
                    flex: 1; 
                    color: #222;
                    font-weight: 600;
                }
                .status-badge {
                    display: inline-block;
                    padding: 6px 16px;
                    border-radius: 20px;
                    color: white;
                    font-size: 0.9em;
                    font-weight: 700;
                }
                .amount-section {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    padding: 30px;
                    margin: 30px 0;
                    border-radius: 15px;
                    color: white;
                }
                .amount-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-top: 20px;
                }
                .amount-box {
                    background: rgba(255,255,255,0.15);
                    padding: 20px;
                    border-radius: 12px;
                    text-align: center;
                    backdrop-filter: blur(10px);
                }
                .amount-label {
                    font-size: 0.9em;
                    opacity: 0.9;
                    margin-bottom: 10px;
                }
                .amount {
                    font-size: 2.2em;
                    font-weight: 900;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
                }
                .transactions-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 30px 0;
                }
                .transactions-table th {
                    background: #667eea;
                    color: white;
                    padding: 15px;
                    text-align: right;
                    font-weight: 700;
                }
                .transactions-table td {
                    padding: 15px;
                    border-bottom: 1px solid #e5e7eb;
                    text-align: right;
                }
                .transactions-table tr:nth-child(even) {
                    background: #f9fafb;
                }
                .transactions-table tr:hover {
                    background: #f3f4f6;
                }
                .footer { 
                    text-align: center; 
                    padding: 30px; 
                    background: linear-gradient(to top, #f8f9fa, white); 
                    border-top: 3px solid #667eea;
                }
                .print-date {
                    color: #666;
                    font-size: 0.95em;
                    margin-top: 15px;
                }
                .watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 8em;
                    opacity: 0.03;
                    font-weight: 900;
                    pointer-events: none;
                }
                @media print {
                    body { padding: 0; background: white; }
                    .invoice { box-shadow: none; }
                }
            </style>
        </head>
        <body>
            <div class="invoice">
                <div class="watermark">⚖️</div>
                
                <div class="header">
                    ${company.logo ? `<img src="${company.logo}" class="logo" alt="Logo">` : ''}
                    <div class="company-name">${company.name || 'مكتب المحاماة'}</div>
                    <div class="company-info">
                        ${company.address ? '📍 ' + company.address + '<br>' : ''}
                        ${company.phone ? '📞 ' + company.phone + ' ' : ''}
                        ${company.email ? '📧 ' + company.email : ''}
                    </div>
                </div>
                
                <div class="invoice-title">
                    <h2>
                        <span style="font-size:1.5em">💼</span>
                        فاتورة قضية
                    </h2>
                    <div class="invoice-number">#${caseData.caseNumber}</div>
                </div>
                
                <div class="case-details">
                    <div class="detail-row">
                        <div class="detail-label"><span>📋</span> رقم القضية:</div>
                        <div class="detail-value">${caseData.caseNumber}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label"><span>📝</span> عنوان القضية:</div>
                        <div class="detail-value">${caseData.title}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label"><span>👨‍⚖️</span> المحامي المسؤول:</div>
                        <div class="detail-value">${caseData.lawyer}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label"><span>👤</span> العميل:</div>
                        <div class="detail-value">${caseData.client}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label"><span>📅</span> تاريخ القضية:</div>
                        <div class="detail-value">${new Date(caseData.date).toLocaleDateString('ar-IQ', {year: 'numeric', month: 'long', day: 'numeric'})}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label"><span>📊</span> حالة القضية:</div>
                        <div class="detail-value">
                            <span class="status-badge" style="background:${statusColors[caseData.status] || '#6b7280'}">
                                ${statusNames[caseData.status] || caseData.status}
                            </span>
                        </div>
                    </div>
                    ${caseData.description ? `
                    <div class="detail-row">
                        <div class="detail-label"><span>📄</span> الوصف:</div>
                        <div class="detail-value">${caseData.description}</div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="amount-section">
                    <h3 style="margin:0 0 20px;text-align:center;font-size:1.8em">💰 الملخص المالي</h3>
                    <div class="amount-grid">
                        <div class="amount-box">
                            <div class="amount-label">إجمالي الأتعاب</div>
                            <div class="amount">${totalFees.toLocaleString('ar-IQ')}</div>
                            <div style="font-size:0.9em;margin-top:5px;opacity:0.9">دينار عراقي</div>
                        </div>
                        <div class="amount-box" style="background:rgba(16,185,129,0.2)">
                            <div class="amount-label">المبلغ المدفوع</div>
                            <div class="amount">${totalPaid.toLocaleString('ar-IQ')}</div>
                            <div style="font-size:0.9em;margin-top:5px;opacity:0.9">دينار عراقي</div>
                        </div>
                        <div class="amount-box" style="background:${remaining > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.3)'}">
                            <div class="amount-label">${remaining > 0 ? 'المتبقي' : 'مكتمل'}</div>
                            <div class="amount">${Math.abs(remaining).toLocaleString('ar-IQ')}</div>
                            <div style="font-size:0.9em;margin-top:5px;opacity:0.9">دينار عراقي</div>
                        </div>
                    </div>
                </div>
                
                ${transactions.length > 0 ? `
                    <div style="padding:0 40px 40px">
                        <h3 style="margin:0 0 20px;color:#667eea;font-size:1.5em">📊 سجل المعاملات المالية</h3>
                        <table class="transactions-table">
                            <thead>
                                <tr>
                                    <th>التاريخ</th>
                                    <th>النوع</th>
                                    <th>الوصف</th>
                                    <th>المبلغ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${transactions.map(t => {
                                    const typeLabels = {
                                        'payment_from_client': '💵 دفعة من عميل',
                                        'payment_to_client': '💸 دفعة لموكل',
                                        'service_fee': '💰 رسوم خدمة',
                                        'expense': '📤 مصروف',
                                        'income': '📥 إيراد'
                                    };
                                    return `
                                        <tr>
                                            <td>${new Date(t.date).toLocaleDateString('ar-IQ')}</td>
                                            <td>${typeLabels[t.type] || t.type}</td>
                                            <td>${t.description}</td>
                                            <td style="font-weight:700;color:${t.type.includes('from') || t.type === 'income' ? '#10b981' : '#ef4444'}">${parseFloat(t.amount).toLocaleString('ar-IQ')} د.ع</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
                
                <div class="footer">
                    <div style="font-size:1.1em;font-weight:700;color:#667eea;margin-bottom:10px">شكراً لثقتكم</div>
                    <div class="print-date">📅 تاريخ الطباعة: ${new Date().toLocaleString('ar-IQ', {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</div>
                    <div style="margin-top:15px;color:#888;font-size:0.85em">
                        هذه فاتورة إلكترونية صادرة من نظام إدارة المحامين v5.0
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

function generateTransactionInvoice(transaction, company) {
    const typeLabels = {
        'payment_from_client': '💵 دفعة من موكل',
        'payment_to_client': '💸 دفعة لموكل',
        'service_fee': '💰 رسوم خدمة',
        'income': '📥 إيراد',
        'expense': '📤 مصروف',
        'salary': '💼 راتب'
    };
    
    const typeColors = {
        'payment_from_client': '#10b981',
        'payment_to_client': '#ef4444',
        'service_fee': '#3b82f6',
        'income': '#10b981',
        'expense': '#ef4444',
        'salary': '#8b5cf6'
    };
    
    const isIncome = ['payment_from_client', 'income', 'service_fee'].includes(transaction.type);
    const receiptType = isIncome ? 'سند قبض' : 'سند صرف';
    const receiptIcon = isIncome ? '📥' : '📤';
    
    return `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>${receiptType} - ${transaction.id}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', 'Cairo', Tahoma, Geneva, Verdana, sans-serif; 
                    padding: 30px;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }
                .receipt { 
                    max-width: 700px; 
                    margin: 0 auto; 
                    background: white;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    border-radius: 20px;
                    overflow: hidden;
                }
                .header { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 40px; 
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                .header::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
                    background-size: 30px 30px;
                    animation: drift 20s linear infinite;
                }
                @keyframes drift {
                    from { transform: rotate(0deg) translate(-50%, -50%); }
                    to { transform: rotate(360deg) translate(-50%, -50%); }
                }
                .logo { 
                    max-width: 100px; 
                    margin-bottom: 15px; 
                    border-radius: 50%;
                    background: white;
                    padding: 10px;
                    position: relative;
                    z-index: 1;
                }
                .company-name {
                    font-size: 2em;
                    font-weight: 900;
                    margin-bottom: 10px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                    position: relative;
                    z-index: 1;
                }
                .company-info {
                    opacity: 0.95;
                    position: relative;
                    z-index: 1;
                }
                .receipt-title { 
                    background: linear-gradient(to bottom, ${typeColors[transaction.type] || '#667eea'}, ${typeColors[transaction.type] || '#667eea'}dd);
                    color: white;
                    font-size: 2em; 
                    font-weight: 900; 
                    padding: 25px;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .receipt-number {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    background: rgba(255,255,255,0.2);
                    padding: 8px 15px;
                    border-radius: 20px;
                    font-size: 0.5em;
                    backdrop-filter: blur(10px);
                }
                .details { padding: 40px; }
                .row { 
                    margin: 20px 0; 
                    padding: 20px; 
                    background: linear-gradient(to left, #f8f9fa, white); 
                    border-radius: 12px;
                    border-right: 5px solid ${typeColors[transaction.type] || '#667eea'};
                    display: flex;
                    align-items: center;
                    transition: all 0.3s;
                }
                .row:hover {
                    transform: translateX(-10px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .label { 
                    font-weight: 700; 
                    width: 180px;
                    color: #555;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 1.05em;
                }
                .value { 
                    flex: 1;
                    color: #222;
                    font-weight: 600;
                    font-size: 1.1em;
                }
                .amount-section { 
                    background: linear-gradient(135deg, ${typeColors[transaction.type] || '#667eea'}, ${typeColors[transaction.type] || '#764ba2'}); 
                    color: white; 
                    padding: 40px; 
                    text-align: center; 
                    margin: 30px 40px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    position: relative;
                    overflow: hidden;
                }
                .amount-section::before {
                    content: '${receiptIcon}';
                    position: absolute;
                    font-size: 15em;
                    opacity: 0.1;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
                .amount-label {
                    font-size: 1.3em;
                    opacity: 0.95;
                    margin-bottom: 15px;
                    position: relative;
                    z-index: 1;
                }
                .amount-value { 
                    font-size: 3.5em; 
                    font-weight: 900;
                    text-shadow: 3px 3px 6px rgba(0,0,0,0.3);
                    position: relative;
                    z-index: 1;
                }
                .amount-words {
                    font-size: 1.1em;
                    opacity: 0.9;
                    margin-top: 15px;
                    font-style: italic;
                    position: relative;
                    z-index: 1;
                }
                .signature { 
                    display: flex; 
                    justify-content: space-around; 
                    padding: 50px 40px 40px;
                    border-top: 3px dashed #ddd;
                }
                .sig-box { text-align: center; }
                .sig-line { 
                    border-top: 3px solid #333; 
                    width: 180px; 
                    margin: 60px auto 15px;
                }
                .sig-label {
                    font-weight: 700;
                    color: #555;
                    font-size: 1.1em;
                }
                .footer {
                    text-align: center;
                    padding: 25px;
                    background: linear-gradient(to top, #f8f9fa, white);
                    color: #666;
                    font-size: 0.9em;
                }
                .watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 6em;
                    opacity: 0.02;
                    font-weight: 900;
                    pointer-events: none;
                }
                @media print {
                    body { padding: 0; background: white; }
                    .receipt { box-shadow: none; }
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="watermark">${receiptIcon}</div>
                
                <div class="header">
                    ${company.logo ? `<img src="${company.logo}" class="logo" alt="Logo">` : ''}
                    <div class="company-name">${company.name || 'مكتب المحاماة'}</div>
                    <div class="company-info">
                        ${company.address ? '📍 ' + company.address + '<br>' : ''}
                        ${company.phone ? '📞 ' + company.phone : ''}
                    </div>
                </div>
                
                <div class="receipt-title" style="position:relative">
                    <span class="receipt-number">#${transaction.id}</span>
                    <span style="font-size:1.5em">${receiptIcon}</span>
                    <span>${receiptType}</span>
                </div>
                
                <div class="details">
                    <div class="row">
                        <div class="label"><span>📅</span> التاريخ:</div>
                        <div class="value">${new Date(transaction.date).toLocaleDateString('ar-IQ', {year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'})}</div>
                    </div>
                    <div class="row">
                        <div class="label"><span>📋</span> نوع المعاملة:</div>
                        <div class="value">${typeLabels[transaction.type] || transaction.type}</div>
                    </div>
                    ${transaction.client ? `
                    <div class="row">
                        <div class="label"><span>👤</span> ${isIncome ? 'المستلم منه' : 'المدفوع له'}:</div>
                        <div class="value">${transaction.client}</div>
                    </div>
                    ` : ''}
                    ${transaction.lawyer || transaction.lawyerName ? `
                    <div class="row">
                        <div class="label"><span>👨‍⚖️</span> المحامي:</div>
                        <div class="value">${transaction.lawyer || transaction.lawyerName}</div>
                    </div>
                    ` : ''}
                    ${transaction.caseNumber ? `
                    <div class="row">
                        <div class="label"><span>📁</span> رقم القضية:</div>
                        <div class="value">${transaction.caseNumber}</div>
                    </div>
                    ` : ''}
                    <div class="row">
                        <div class="label"><span>📝</span> البيان:</div>
                        <div class="value">${transaction.description}</div>
                    </div>
                </div>
                
                <div class="amount-section">
                    <div class="amount-label">${isIncome ? 'المبلغ المستلم' : 'المبلغ المدفوع'}</div>
                    <div class="amount-value">${parseFloat(transaction.amount).toLocaleString('ar-IQ')}</div>
                    <div class="amount-words">دينار عراقي فقط لا غير</div>
                </div>
                
                <div class="signature">
                    <div class="sig-box">
                        <div class="sig-line"></div>
                        <div class="sig-label">${isIncome ? 'المستلم' : 'المستفيد'}</div>
                    </div>
                    <div class="sig-box">
                        <div class="sig-line"></div>
                        <div class="sig-label">المحاسب</div>
                    </div>
                    <div class="sig-box">
                        <div class="sig-line"></div>
                        <div class="sig-label">المدير</div>
                    </div>
                </div>
                
                <div class="footer">
                    <div style="font-weight:700;margin-bottom:8px">📅 تاريخ الإصدار: ${new Date().toLocaleString('ar-IQ', {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</div>
                    <div style="color:#999;font-size:0.85em">
                        سند إلكتروني صادر من نظام إدارة المحامين v5.0 Ultra Pro
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}

// ==================== التصدير PDF / Excel ====================
function exportToPDF(type) {
    if (!confirm('سيتم فتح نافذة جديدة للطباعة. يمكنك حفظها كـ PDF من قائمة الطباعة. هل تريد المتابعة؟')) return;
    
    let content = generatePDFContent(type);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
}

function exportToExcel(type) {
    const config = getExcelConfig(type);
    if (!config) {
        showToast('❌ نوع القسم غير معروف', 'error');
        return;
    }
    const { rows, headers, filename, colWidths } = config;
    if (!rows || rows.length === 0) {
        showToast('❌ لا توجد بيانات للتصدير', 'error');
        return;
    }

    if (window.XLSX && XLSX.utils && XLSX.writeFile) {
        const aoa = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        if (Array.isArray(colWidths)) ws['!cols'] = colWidths.map(w => ({ wch: w }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, filename);
        const dateStr = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `${filename}_${dateStr}.xlsx`);
        showToast('✅ تم إنشاء ملف Excel منظم', 'success');
    } else {
        const csv = convertToCSV(rows, headers);
        const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        showToast('✅ تم تصدير البيانات (CSV)', 'success');
    }
}

function convertToCSV(rows, headers) {
    if (!rows || rows.length === 0) return '';
    const hdrs = headers && headers.length ? headers : Object.keys(rows[0]);
    const lines = rows.map(item =>
        hdrs.map(h => {
            const value = item[h];
            if (value === null || value === undefined) return '';
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
    );
    return [hdrs.join(','), ...lines].join('\n');
}

function getExcelConfig(type) {
    const date = (d) => {
        try { return new Date(d).toLocaleDateString('ar-IQ'); } catch { return d || ''; }
    };
    if (type === 'lawyers') {
        const headers = ['الاسم','رقم الترخيص','الهاتف','البريد','التخصص'];
        const rows = (database.lawyers || []).map(l => [l.name, l.license, l.phone, l.email || '', l.specialty || '']);
        return { headers, rows, filename: 'المحامين', colWidths: [20, 18, 16, 24, 16] };
    }
    if (type === 'cases') {
        const headers = ['رقم القضية','العنوان','المحامي','الموكل','الحالة','الأتعاب','التاريخ'];
        const rows = (database.cases || []).map(c => [c.caseNumber, c.title, c.lawyer, c.client, getStatusText(c.status), c.fees || 0, date(c.date)]);
        return { headers, rows, filename: 'القضايا', colWidths: [14, 24, 18, 18, 12, 12, 14] };
    }
    if (type === 'clients') {
        const headers = ['الاسم','الهاتف','البريد','العنوان','الرصيد'];
        const rows = (database.clients || []).map(c => [c.name, c.phone, c.email || '', c.address || '', calculateClientBalance(c.name)]);
        return { headers, rows, filename: 'الموكلين', colWidths: [20, 16, 22, 24, 12] };
    }
    if (type === 'transactions') {
        const headers = ['التاريخ','النوع','الموكل','القضية','المبلغ','الوصف'];
        const rows = (database.transactions || []).map(t => [date(t.date), t.type, t.client || '', t.caseNumber || '', t.amount || 0, t.description || '']);
        return { headers, rows, filename: 'المعاملات', colWidths: [14, 14, 18, 18, 12, 32] };
    }
    return null;
}

function generatePDFContent(type) {
    const company = database.companyInfo || {};
    let tableContent = '';
    let title = '';
    
    if (type === 'lawyers') {
        title = 'تقرير المحامين';
        tableContent = `
            <table>
                <thead><tr><th>الاسم</th><th>رقم الترخيص</th><th>الهاتف</th><th>البريد</th><th>التخصص</th></tr></thead>
                <tbody>
                    ${database.lawyers.map(l => `<tr><td>${l.name}</td><td>${l.license}</td><td>${l.phone}</td><td>${l.email}</td><td>${l.specialty}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
    } else if (type === 'cases') {
        title = 'تقرير القضايا';
        tableContent = `
            <table>
                <thead><tr><th>رقم القضية</th><th>العنوان</th><th>المحامي</th><th>الموكل</th><th>الحالة</th><th>الأتعاب</th></tr></thead>
                <tbody>
                    ${database.cases.map(c => `<tr><td>${c.caseNumber}</td><td>${c.title}</td><td>${c.lawyer}</td><td>${c.client}</td><td>${getStatusText(c.status)}</td><td>${parseFloat(c.fees).toLocaleString('ar-IQ')}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
    } else if (type === 'clients') {
        title = 'تقرير الموكلين';
        tableContent = `
            <table>
                <thead><tr><th>الاسم</th><th>الهاتف</th><th>البريد</th><th>العنوان</th><th>الرصيد</th></tr></thead>
                <tbody>
                    ${database.clients.map(c => {
                        const balance = calculateClientBalance(c.name);
                        return `<tr><td>${c.name}</td><td>${c.phone}</td><td>${c.email || '-'}</td><td>${c.address || '-'}</td><td>${balance.toLocaleString('ar-IQ')}</td></tr>`;
                    }).join('')}
                </tbody>
            </table>
        `;
    } else if (type === 'transactions') {
        title = 'تقرير المعاملات المالية';
        tableContent = `
            <table>
                <thead><tr><th>التاريخ</th><th>النوع</th><th>الموكل</th><th>المبلغ</th><th>الوصف</th></tr></thead>
                <tbody>
                    ${database.transactions.map(t => `<tr><td>${new Date(t.date).toLocaleDateString('ar-IQ')}</td><td>${t.type}</td><td>${t.client || '-'}</td><td>${parseFloat(t.amount).toLocaleString('ar-IQ')}</td><td>${t.description}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
    }
    
    return `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #667eea; padding-bottom: 20px; }
                .logo { max-width: 150px; }
                h1 { color: #667eea; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #667eea; color: white; padding: 12px; text-align: right; }
                td { padding: 10px; border: 1px solid #ddd; text-align: right; }
                tr:nth-child(even) { background: #f9f9f9; }
                .footer { margin-top: 30px; text-align: center; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                ${company.logo ? `<img src="${company.logo}" class="logo">` : ''}
                <h1>${company.name || 'مكتب المحاماة'}</h1>
                <h2>${title}</h2>
            </div>
            ${tableContent}
            <div class="footer">
                <p>تاريخ الطباعة: ${new Date().toLocaleString('ar-IQ')}</p>
            </div>
        </body>
        </html>
    `;
}

// ==================== الصلاحيات المخصصة ====================
function manageCustomPermissions(userId) {
    if (currentUser.role !== 'admin') {
        showToast('⛔ هذه الميزة متاحة للمدير فقط', 'error');
        return;
    }
    
    const user = database.users.find(u => u.id === userId);
    if (!user || user.role === 'admin') {
        showToast('❌ لا يمكن تعديل صلاحيات المدير', 'error');
        return;
    }
    
    // الصلاحيات الحالية أو الافتراضية
    const currentPerms = user.customPermissions || PERMISSIONS[user.role];
    
    document.getElementById('modalTitle').textContent = `🔒 إدارة صلاحيات: ${user.name}`;
    document.getElementById('modalBody').innerHTML = `
        <div style="background:var(--card-bg);padding:20px;border-radius:12px;margin-bottom:20px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
                <span class="role-badge role-${user.role}">${getRoleName(user.role)}</span>
                <span style="color:var(--text-light)">الدور الافتراضي</span>
            </div>
            <p style="color:var(--text-light);margin:0;font-size:0.9em">
                💡 يمكنك تخصيص الصلاحيات لهذا المستخدم بشكل فردي أو استخدام صلاحيات الدور الافتراضية
            </p>
        </div>
        
        <form id="permissionsForm" onsubmit="saveCustomPermissions(event, ${userId})">
            <div style="display:grid;gap:20px">
                ${generatePermissionsTable('lawyers', 'المحامين', currentPerms)}
                ${generatePermissionsTable('cases', 'القضايا', currentPerms)}
                ${generatePermissionsTable('clients', 'الموكلين', currentPerms)}
                ${generatePermissionsTable('transactions', 'المعاملات المالية', currentPerms)}
                ${generatePermissionsTable('reports', 'التقارير', currentPerms)}
            </div>
            
            <div style="display:flex;gap:10px;margin-top:30px">
                <button type="submit" class="btn-primary" style="flex:1">💾 حفظ الصلاحيات المخصصة</button>
                <button type="button" class="btn-secondary" style="flex:1" onclick="resetToDefaultPermissions(${userId})">
                    🔄 استخدام الصلاحيات الافتراضية
                </button>
            </div>
        </form>
    `;
    showModal();
}

function generatePermissionsTable(module, moduleName, currentPerms) {
    const actions = {
        lawyers: ['view', 'add', 'edit', 'delete'],
        cases: ['view', 'add', 'edit', 'delete'],
        clients: ['view', 'add', 'edit', 'delete'],
        transactions: ['view', 'add', 'edit', 'delete'],
        reports: ['view', 'export']
    };
    
    const actionLabels = {
        view: '👁️ عرض',
        add: '➕ إضافة',
        edit: '✏️ تعديل',
        delete: '🗑️ حذف',
        export: '📥 تصدير'
    };
    
    const moduleActions = actions[module] || [];
    
    return `
        <div class="permission-group">
            <h4 style="margin-bottom:15px;color:var(--primary)">${moduleName}</h4>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">
                ${moduleActions.map(action => `
                    <label class="permission-checkbox">
                        <input 
                            type="checkbox" 
                            name="${module}_${action}" 
                            ${currentPerms[module]?.[action] ? 'checked' : ''}
                        >
                        <span>${actionLabels[action]}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
}

function saveCustomPermissions(e, userId) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const user = database.users.find(u => u.id === userId);
    if (!user) return;
    
    // بناء كائن الصلاحيات المخصصة
    const customPerms = {
        lawyers: {
            view: formData.get('lawyers_view') === 'on',
            add: formData.get('lawyers_add') === 'on',
            edit: formData.get('lawyers_edit') === 'on',
            delete: formData.get('lawyers_delete') === 'on'
        },
        cases: {
            view: formData.get('cases_view') === 'on',
            add: formData.get('cases_add') === 'on',
            edit: formData.get('cases_edit') === 'on',
            delete: formData.get('cases_delete') === 'on'
        },
        clients: {
            view: formData.get('clients_view') === 'on',
            add: formData.get('clients_add') === 'on',
            edit: formData.get('clients_edit') === 'on',
            delete: formData.get('clients_delete') === 'on'
        },
        transactions: {
            view: formData.get('transactions_view') === 'on',
            add: formData.get('transactions_add') === 'on',
            edit: formData.get('transactions_edit') === 'on',
            delete: formData.get('transactions_delete') === 'on'
        },
        reports: {
            view: formData.get('reports_view') === 'on',
            export: formData.get('reports_export') === 'on'
        },
        settings: { view: true, edit: false },
        users: { view: false, add: false, edit: false, delete: false }
    };
    
    user.customPermissions = customPerms;
    saveData();
    logActivity('custom_permissions', `تخصيص صلاحيات ${user.name}`);
    showToast('✅ تم حفظ الصلاحيات المخصصة بنجاح', 'success');
    
    // تحديث الصلاحيات فوراً إذا كان المستخدم الحالي
    if (userId === currentUser.id) {
        currentUser.customPermissions = customPerms;
        applyPermissions();
        // ضبط خيارات فلتر المعاملات للأنواع المدعومة من الخادم
        syncTransactionTypeFilterOptions();
    }
    
    showUsersManagement();
}

function resetToDefaultPermissions(userId) {
    if (!confirm('هل تريد إلغاء الصلاحيات المخصصة والعودة للصلاحيات الافتراضية للدور؟')) {
        return;
    }
    
    const user = database.users.find(u => u.id === userId);
    if (!user) return;
    
    user.customPermissions = null;
    saveData();
    logActivity('custom_permissions', `إعادة تعيين صلاحيات ${user.name} للافتراضية`);
    showToast('✅ تم إعادة تعيين الصلاحيات الافتراضية', 'success');
    
    // تحديث الصلاحيات فوراً إذا كان المستخدم الحالي
    if (userId === currentUser.id) {
        currentUser.customPermissions = null;
        applyPermissions();
    }
    
    showUsersManagement();
}

// ==================== إدارة الصلاحيات المتقدمة ====================
function renderPermissionsManagement() {
    if (currentUser.role !== 'admin') {
        document.getElementById('permissionsContent').innerHTML = `
            <div style="text-align:center;padding:50px;color:var(--text-light)">
                <div style="font-size:5em;margin-bottom:20px">🔒</div>
                <h2>غير مصرح</h2>
                <p>هذا القسم متاح للمدير فقط</p>
            </div>
        `;
        return;
    }
    
    const allUsers = database.users.filter(u => u.role !== 'admin');
    
    document.getElementById('permissionsContent').innerHTML = `
        <div class="permissions-dashboard">
            <div class="permissions-header" style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:30px;border-radius:15px;margin-bottom:30px">
                <h2 style="margin:0;font-size:2em">🔐 إدارة صلاحيات المستخدمين</h2>
                <p style="margin:10px 0 0;opacity:0.9">تحكم كامل في كل صلاحيات النظام - قم بتخصيص الصلاحيات لكل مستخدم بشكل فردي</p>
            </div>
            
            <!-- إحصائيات سريعة -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:30px">
                <div class="stat-card" style="background:linear-gradient(135deg,#3b82f6,#2563eb);color:white">
                    <div style="font-size:3em;font-weight:900">${database.users.filter(u => u.role === 'lawyer').length}</div>
                    <div style="opacity:0.9">👨‍⚖️ محامين</div>
                </div>
                <div class="stat-card" style="background:linear-gradient(135deg,#10b981,#059669);color:white">
                    <div style="font-size:3em;font-weight:900">${database.users.filter(u => u.role === 'accountant').length}</div>
                    <div style="opacity:0.9">💼 محاسبين</div>
                </div>
                <div class="stat-card" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:white">
                    <div style="font-size:3em;font-weight:900">${database.users.filter(u => u.customPermissions).length}</div>
                    <div style="opacity:0.9">🔧 صلاحيات مخصصة</div>
                </div>
                <div class="stat-card" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:white">
                    <div style="font-size:3em;font-weight:900">${allUsers.length}</div>
                    <div style="opacity:0.9">👥 إجمالي المستخدمين</div>
                </div>
            </div>
            
            <!-- قائمة المستخدمين مع الصلاحيات -->
            <div class="permissions-list">
                <h3 style="margin:30px 0 20px;color:var(--primary);border-right:4px solid var(--primary);padding-right:15px">
                    📋 قائمة المستخدمين والصلاحيات
                </h3>
                
                ${allUsers.length === 0 ? `
                    <div style="text-align:center;padding:50px;color:var(--text-light)">
                        <div style="font-size:4em;margin-bottom:15px">👥</div>
                        <p>لا يوجد مستخدمين حالياً</p>
                    </div>
                ` : `
                    <div style="display:grid;gap:20px">
                        ${allUsers.map(user => renderUserPermissionsCard(user)).join('')}
                    </div>
                `}
            </div>
            
            <!-- شرح الصلاحيات -->
            <div style="margin-top:40px;background:var(--bg);padding:25px;border-radius:12px;border:2px solid var(--border)">
                <h3 style="margin:0 0 20px;color:var(--info)">ℹ️ شرح الصلاحيات</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px">
                    <div>
                        <strong style="color:var(--primary)">👁️ عرض:</strong>
                        <p style="margin:5px 0 0;color:var(--text-light);font-size:0.9em">القدرة على عرض ورؤية البيانات</p>
                    </div>
                    <div>
                        <strong style="color:var(--success)">➕ إضافة:</strong>
                        <p style="margin:5px 0 0;color:var(--text-light);font-size:0.9em">القدرة على إضافة بيانات جديدة</p>
                    </div>
                    <div>
                        <strong style="color:var(--warning)">✏️ تعديل:</strong>
                        <p style="margin:5px 0 0;color:var(--text-light);font-size:0.9em">القدرة على تعديل البيانات الموجودة</p>
                    </div>
                    <div>
                        <strong style="color:var(--danger)">🗑️ حذف:</strong>
                        <p style="margin:5px 0 0;color:var(--text-light);font-size:0.9em">القدرة على حذف البيانات</p>
                    </div>
                    <div>
                        <strong style="color:var(--info)">📥 تصدير:</strong>
                        <p style="margin:5px 0 0;color:var(--text-light);font-size:0.9em">القدرة على تصدير التقارير</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderUserPermissionsCard(user) {
    const currentPerms = user.customPermissions || PERMISSIONS[user.role];
    const hasCustomPerms = !!user.customPermissions;
    
    const modules = [
        { key: 'lawyers', name: 'المحامين', icon: '👨‍⚖️' },
        { key: 'cases', name: 'القضايا', icon: '📁' },
        { key: 'clients', name: 'الموكلين', icon: '👥' },
        { key: 'transactions', name: 'المعاملات', icon: '💰' },
        { key: 'reports', name: 'التقارير', icon: '📈' }
    ];
    
    return `
        <div class="user-permissions-card" style="background:var(--card-bg);padding:25px;border-radius:12px;border:2px solid ${hasCustomPerms ? 'var(--warning)' : 'var(--border)'}">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:20px">
                <div>
                    <h3 style="margin:0;font-size:1.3em">${user.name}</h3>
                    <div style="display:flex;gap:10px;align-items:center;margin-top:8px">
                        <span class="role-badge role-${user.role}">${getRoleName(user.role)}</span>
                        ${hasCustomPerms ? '<span style="background:var(--warning);color:white;padding:4px 12px;border-radius:15px;font-size:0.85em">🔧 صلاحيات مخصصة</span>' : '<span style="background:var(--info);color:white;padding:4px 12px;border-radius:15px;font-size:0.85em">📋 صلاحيات افتراضية</span>'}
                    </div>
                    <div style="color:var(--text-light);font-size:0.9em;margin-top:5px">
                        📧 ${user.email || user.username}
                    </div>
                </div>
                <button class="btn-primary" onclick="manageCustomPermissions(${user.id})" style="font-size:0.9em">
                    🔒 تخصيص الصلاحيات
                </button>
            </div>
            
            <div class="permissions-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:15px">
                ${modules.map(module => {
                    const perms = currentPerms[module.key] || {};
                    const actions = module.key === 'reports' ? ['view', 'export'] : ['view', 'add', 'edit', 'delete'];
                    const activeActions = actions.filter(action => perms[action]);
                    const totalActions = actions.length;
                    const percentage = (activeActions.length / totalActions) * 100;
                    
                    return `
                        <div style="background:var(--bg);padding:15px;border-radius:10px;border:1px solid var(--border)">
                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                                <span style="font-size:1.5em">${module.icon}</span>
                                <strong style="font-size:0.9em">${module.name}</strong>
                            </div>
                            <div style="background:var(--border);height:6px;border-radius:3px;overflow:hidden;margin-bottom:8px">
                                <div style="background:${percentage === 100 ? 'var(--success)' : percentage > 0 ? 'var(--warning)' : 'var(--danger)'};height:100%;width:${percentage}%;transition:width 0.3s"></div>
                            </div>
                            <div style="font-size:0.85em;color:var(--text-light)">
                                ${actions.map(action => {
                                    const icons = {view: '👁️', add: '➕', edit: '✏️', delete: '🗑️', export: '📥'};
                                    return `<span style="color:${perms[action] ? 'var(--success)' : 'var(--danger)'}">${icons[action]}</span>`;
                                }).join(' ')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            ${hasCustomPerms ? `
                <div style="margin-top:15px;text-align:center">
                    <button class="btn-secondary" onclick="resetToDefaultPermissions(${user.id})" style="font-size:0.85em">
                        🔄 إعادة للصلاحيات الافتراضية
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

function exportData() {
    if (!checkPermission('reports', 'export')) return;
    
    // إزالة البيانات الحساسة قبل التصدير
    const exportData = { ...database };
    exportData.users = database.users.map(u => ({
        id: u.id,
        username: u.username,
        name: u.name,
        email: u.email,
        role: u.role
        // كلمة المرور محذوفة للأمان
    }));
    
    logActivity('export_data', 'تم تصدير البيانات');
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lawyer_system_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('✅ تم تصدير البيانات بنجاح', 'success');
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const imported = JSON.parse(event.target.result);
            database = { ...database, ...imported };
            saveData();
            loadData();
            updateDashboard();
            renderLawyers();
            renderCases();
            renderClients();
            renderTransactions();
            showToast('✅ تم استيراد البيانات بنجاح', 'success');
        } catch (error) {
            showToast('❌ فشل استيراد البيانات', 'error');
        }
    };
    reader.readAsText(file);
}

// ==================== Modal ====================
function showModal() {
    document.getElementById('modal').classList.add('show');
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

document.getElementById('modal')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// ==================== Toast ====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==================== التهيئة الأولية ====================
window.addEventListener('DOMContentLoaded', function() {
    console.log('✅ النظام جاهز v6.0 - Backend Integrated');
    
    // تحميل المظهر المحفوظ
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // استعادة حالة القائمة الجانبية
    const sidebarState = localStorage.getItem('sidebarHidden') === 'true';
    if (sidebarState) {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        const menuToggleBtn = document.getElementById('menuToggleBtn');
        
        if (sidebar) sidebar.classList.add('sidebar-hidden');
        if (mainContent) mainContent.classList.add('sidebar-collapsed');
        
        const icon = menuToggleBtn?.querySelector('.hamburger-icon');
        if (icon) icon.textContent = '☰';
    }
    
    // استعادة التوكن والتحقق من Backend
    authToken = localStorage.getItem('authToken');
    if (authToken) {
        useBackend = true;
        console.log('🔐 تم العثور على توكن مصادقة - الوضع: Backend');
    } else {
        console.log('💾 الوضع: محلي (localStorage)');
    }
    
    // التحقق من تسجيل الدخول السابق
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            const sessionUser = JSON.parse(savedUser);
            // استعادة كلمة المرور من قاعدة البيانات للوضع المحلي
            loadData();
            const fullUser = database.users.find(u => u.username === sessionUser.username);
            if (fullUser && !useBackend) {
                currentUser = fullUser;
            } else if (useBackend) {
                currentUser = sessionUser;
            } else {
                localStorage.removeItem('currentUser');
                return;
            }
            showApp();
        } catch (e) {
            console.error('خطأ في تحميل بيانات المستخدم');
            localStorage.removeItem('currentUser');
        }
    }
});

// ==================== النظام المالي للمحامين ====================

// حساب رصيد المحامي
function calculateLawyerBalance(lawyerId) {
    const lawyer = database.lawyers.find(l => l.id === lawyerId);
    if (!lawyer) return 0;
    
    // حساب المعاملات المتعلقة بالمحامي
    const lawyerTransactions = database.transactions.filter(t => 
        t.lawyerId === lawyerId || t.lawyer === lawyer.name || t.lawyerName === lawyer.name
    );
    
    let balance = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    
    lawyerTransactions.forEach(t => {
        const amount = parseFloat(t.amount) || 0;
        
        // معاملات خاصة بالمحامي
        switch(t.type) {
            case 'lawyer_salary': // دفع راتب
            case 'lawyer_payment': // دفع للمحامي
                balance -= amount; // نقص من الرصيد (مدين)
                totalExpense += amount;
                break;
            case 'lawyer_commission': // عمولة للمحامي
            case 'lawyer_bonus': // مكافأة
                balance += amount; // زيادة على الرصيد (دائن)
                totalIncome += amount;
                break;
            case 'lawyer_deduction': // خصم من المحامي
                balance += amount; // دائن (يجب أن يدفع)
                totalIncome += amount;
                break;
            // معاملات عامة مرتبطة بالمحامي
            case 'service_fee': // رسوم خدمة قام بها المحامي
            case 'income': // إيراد عام
            case 'payment_from_client': // دفعة من عميل
                totalIncome += amount;
                break;
            case 'expense': // مصروف
            case 'payment_to_client': // دفعة لموكل
                totalExpense += amount;
                break;
        }
    });
    
    return balance;
}

// حساب ملخص المحامين المالي
function calculateLawyersSummary() {
    let totalSalaries = 0;
    let totalCreditor = 0; // إجمالي الدائن
    let totalDebtor = 0;   // إجمالي المدين
    
    database.lawyers.forEach(lawyer => {
        totalSalaries += parseFloat(lawyer.salary) || 0;
        const balance = calculateLawyerBalance(lawyer.id);
        if (balance > 0) {
            totalCreditor += balance;
        } else if (balance < 0) {
            totalDebtor += Math.abs(balance);
        }
    });
    
    return {
        totalSalaries,
        totalCreditor,
        totalDebtor,
        netBalance: totalCreditor - totalDebtor
    };
}

// تقرير شامل للمحامي - للمدير فقط
function showLawyerFullReport(lawyerId) {
    if (!currentUser || currentUser.role !== 'admin') {
        showToast('⛔ هذه الميزة متاحة للمدير فقط', 'error');
        return;
    }
    
    const lawyer = database.lawyers.find(l => l.id === lawyerId);
    if (!lawyer) return;
    
    // جمع إحصائيات القضايا
    const allCases = database.cases.filter(c => c.lawyer === lawyer.name || c.lawyerId === lawyerId);
    const activeCases = allCases.filter(c => c.status === 'active');
    const pendingCases = allCases.filter(c => c.status === 'pending');
    const closedCases = allCases.filter(c => c.status === 'closed');
    
    // حساب المعاملات المالية
    const lawyerTransactions = database.transactions.filter(t => 
        t.lawyerId === lawyerId || t.lawyer === lawyer.name || t.lawyerName === lawyer.name
    );
    
    // الدائن (ما له)
    const credit = lawyerTransactions
        .filter(t => t.type === 'salary' || t.type === 'service_fee' || t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    // المدين (ما عليه)
    const debt = lawyerTransactions
        .filter(t => t.type === 'expense' || t.type === 'payment_to_client')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const netBalance = credit - debt;
    const salary = parseFloat(lawyer.salary) || 0;
    
    // حساب الأتعاب من القضايا
    const totalFees = allCases.reduce((sum, c) => sum + parseFloat(c.fees || 0), 0);
    
    // حساب المعاملات من القضايا
    const caseNumbers = allCases.map(c => c.caseNumber);
    const caseTransactions = database.transactions.filter(t => 
        t.caseNumber && caseNumbers.includes(t.caseNumber)
    );
    const caseIncome = caseTransactions
        .filter(t => t.type === 'payment_from_client' || t.type === 'service_fee')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const caseExpense = caseTransactions
        .filter(t => t.type === 'expense' || t.type === 'payment_to_client')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    document.getElementById('modalTitle').textContent = '📊 التقرير الإداري الشامل';
    document.getElementById('modalBody').innerHTML = `
        <div style="padding:10px">
            <div style="background:linear-gradient(135deg,#f093fb,#f5576c);color:white;padding:20px;border-radius:15px;margin-bottom:25px;text-align:center">
                <div style="font-size:2.5em;margin-bottom:10px">⚖️</div>
                <h2 style="margin:0;font-size:2em">${lawyer.name}</h2>
                <div style="opacity:0.9;margin-top:8px">${lawyer.specialty} | ${lawyer.license}</div>
                <div style="background:rgba(255,255,255,0.2);padding:8px 15px;border-radius:20px;display:inline-block;margin-top:10px">
                    🔒 تقرير خاص - مدير النظام فقط
                </div>
            </div>
            
            <!-- معلومات القضايا -->
            <h3 style="margin:25px 0 15px;color:var(--primary);border-right:4px solid var(--primary);padding-right:10px">📁 إحصائيات القضايا</h3>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin-bottom:25px">
                <div style="background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;padding:20px;border-radius:12px;text-align:center">
                    <div style="font-size:3em;font-weight:900">${allCases.length}</div>
                    <div style="opacity:0.9;font-size:0.95em">إجمالي القضايا</div>
                </div>
                <div style="background:linear-gradient(135deg,#10b981,#059669);color:white;padding:20px;border-radius:12px;text-align:center">
                    <div style="font-size:3em;font-weight:900">${activeCases.length}</div>
                    <div style="opacity:0.9;font-size:0.95em">قضايا نشطة</div>
                </div>
                <div style="background:linear-gradient(135deg,#f59e0b,#d97706);color:white;padding:20px;border-radius:12px;text-align:center">
                    <div style="font-size:3em;font-weight:900">${pendingCases.length}</div>
                    <div style="opacity:0.9;font-size:0.95em">قضايا معلقة</div>
                </div>
                <div style="background:linear-gradient(135deg,#6b7280,#4b5563);color:white;padding:20px;border-radius:12px;text-align:center">
                    <div style="font-size:3em;font-weight:900">${closedCases.length}</div>
                    <div style="opacity:0.9;font-size:0.95em">قضايا منتهية</div>
                </div>
            </div>
            
            <!-- الحالة المالية التفصيلية -->
            <h3 style="margin:25px 0 15px;color:var(--success);border-right:4px solid var(--success);padding-right:10px">💰 الحالة المالية التفصيلية</h3>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:15px;margin-bottom:20px">
                <div style="background:var(--bg);padding:20px;border-radius:12px;border:2px solid var(--border)">
                    <div style="color:var(--text-light);font-size:0.9em;margin-bottom:8px">💼 الراتب الشهري</div>
                    <div style="font-size:2em;font-weight:900;color:var(--primary)">${salary.toLocaleString('ar-IQ')} د.ع</div>
                </div>
                <div style="background:var(--bg);padding:20px;border-radius:12px;border:2px solid var(--border)">
                    <div style="color:var(--text-light);font-size:0.9em;margin-bottom:8px">💵 إجمالي الأتعاب المتفق عليها</div>
                    <div style="font-size:2em;font-weight:900;color:var(--info)">${totalFees.toLocaleString('ar-IQ')} د.ع</div>
                </div>
            </div>
            
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:20px">
                <div style="background:linear-gradient(135deg,#10b981,#059669);color:white;padding:20px;border-radius:12px;text-align:center;box-shadow:0 4px 15px rgba(16,185,129,0.3)">
                    <div style="font-size:0.9em;opacity:0.9;margin-bottom:5px">📈 الدائن (ما له)</div>
                    <div style="font-size:2em;font-weight:900">${credit.toLocaleString('ar-IQ')}</div>
                    <div style="opacity:0.8;font-size:0.85em;margin-top:5px">دينار عراقي</div>
                </div>
                <div style="background:linear-gradient(135deg,#ef4444,#dc2626);color:white;padding:20px;border-radius:12px;text-align:center;box-shadow:0 4px 15px rgba(239,68,68,0.3)">
                    <div style="font-size:0.9em;opacity:0.9;margin-bottom:5px">📉 المدين (ما عليه)</div>
                    <div style="font-size:2em;font-weight:900">${debt.toLocaleString('ar-IQ')}</div>
                    <div style="opacity:0.8;font-size:0.85em;margin-top:5px">دينار عراقي</div>
                </div>
                <div style="background:linear-gradient(135deg,${netBalance >= 0 ? '#8b5cf6,#7c3aed' : '#f59e0b,#d97706'});color:white;padding:20px;border-radius:12px;text-align:center;box-shadow:0 4px 15px ${netBalance >= 0 ? 'rgba(139,92,246,0.3)' : 'rgba(245,158,11,0.3)'}">
                    <div style="font-size:0.9em;opacity:0.9;margin-bottom:5px">📊 الرصيد الصافي</div>
                    <div style="font-size:2em;font-weight:900">${netBalance.toLocaleString('ar-IQ')}</div>
                    <div style="opacity:0.8;font-size:0.85em;margin-top:5px">${netBalance >= 0 ? 'رصيد موجب' : 'رصيد سالب'}</div>
                </div>
            </div>
            
            <!-- إيرادات ومصروفات القضايا -->
            <h3 style="margin:25px 0 15px;color:var(--info);border-right:4px solid var(--info);padding-right:10px">💼 إيرادات ومصروفات القضايا</h3>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:25px">
                <div style="background:var(--bg);padding:20px;border-radius:12px;border:2px solid var(--success)">
                    <div style="color:var(--text-light);font-size:0.9em;margin-bottom:8px">💰 الإيرادات من القضايا</div>
                    <div style="font-size:1.8em;font-weight:900;color:var(--success)">${caseIncome.toLocaleString('ar-IQ')} د.ع</div>
                </div>
                <div style="background:var(--bg);padding:20px;border-radius:12px;border:2px solid var(--danger)">
                    <div style="color:var(--text-light);font-size:0.9em;margin-bottom:8px">💸 المصروفات على القضايا</div>
                    <div style="font-size:1.8em;font-weight:900;color:var(--danger)">${caseExpense.toLocaleString('ar-IQ')} د.ع</div>
                </div>
                <div style="background:var(--bg);padding:20px;border-radius:12px;border:2px solid var(--primary)">
                    <div style="color:var(--text-light);font-size:0.9em;margin-bottom:8px">📈 صافي ربح القضايا</div>
                    <div style="font-size:1.8em;font-weight:900;color:var(--primary)">${(caseIncome - caseExpense).toLocaleString('ar-IQ')} د.ع</div>
                </div>
            </div>
            
            <!-- قائمة القضايا -->
            ${allCases.length > 0 ? `
                <h3 style="margin:25px 0 15px;color:var(--primary);border-right:4px solid var(--primary);padding-right:10px">📋 قائمة القضايا (${allCases.length})</h3>
                <div style="max-height:300px;overflow-y:auto;background:var(--bg);padding:15px;border-radius:12px">
                    ${allCases.map(c => `
                        <div style="background:var(--surface);padding:15px;border-radius:10px;margin-bottom:10px;border-right:4px solid ${
                            c.status === 'active' ? 'var(--success)' : 
                            c.status === 'pending' ? 'var(--warning)' : 
                            'var(--text-light)'
                        }">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                                <strong style="font-size:1.1em">${c.title}</strong>
                                <span class="status-${c.status}">${getStatusText(c.status)}</span>
                            </div>
                            <div style="color:var(--text-light);font-size:0.9em">
                                📋 ${c.caseNumber} • 👤 ${c.client} • 💰 ${parseFloat(c.fees || 0).toLocaleString('ar-IQ')} د.ع
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p style="text-align:center;color:var(--text-light);padding:20px">لا توجد قضايا لهذا المحامي</p>'}
            
            <!-- ملخص التقييم -->
            <div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:25px;border-radius:15px;margin-top:25px;text-align:center">
                <h3 style="margin:0 0 15px;font-size:1.5em">📊 ملخص التقييم الإداري</h3>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-top:20px">
                    <div>
                        <div style="font-size:2.5em;font-weight:900">${((closedCases.length / (allCases.length || 1)) * 100).toFixed(0)}%</div>
                        <div style="opacity:0.9;font-size:0.9em">معدل إنجاز القضايا</div>
                    </div>
                    <div>
                        <div style="font-size:2.5em;font-weight:900">${lawyerTransactions.length}</div>
                        <div style="opacity:0.9;font-size:0.9em">إجمالي المعاملات</div>
                    </div>
                    <div>
                        <div style="font-size:2.5em;font-weight:900">${activeCases.length}</div>
                        <div style="opacity:0.9;font-size:0.9em">قضايا قيد العمل</div>
                    </div>
                </div>
            </div>
            
            <div style="display:flex;gap:10px;margin-top:25px;justify-content:center">
                <button class="btn-primary" onclick="closeModal(); showSection('lawyers')">
                    إغلاق
                </button>
                <button class="btn-secondary" onclick="window.print()">
                    🖨️ طباعة التقرير
                </button>
            </div>
        </div>
    `;
    
    showModal();
}

// عرض النافذة المالية للمحامي
function showLawyerFinancials(lawyerId) {
    const lawyer = database.lawyers.find(l => l.id === lawyerId);
    if (!lawyer) return;
    
    // الحصول على جميع قضايا المحامي
    const lawyerCases = database.cases.filter(c => 
        c.lawyer === lawyer.name || c.lawyerId === lawyerId
    );
    const caseNumbers = lawyerCases.map(c => c.caseNumber);
    
    // الحصول على جميع المعاملات المرتبطة بالمحامي
    // 1. المعاملات المرتبطة مباشرة بالمحامي
    // 2. المعاملات المرتبطة بقضايا المحامي
    const lawyerTransactions = database.transactions.filter(t => 
        t.lawyerId === lawyerId || 
        t.lawyer === lawyer.name || 
        t.lawyerName === lawyer.name ||
        (t.caseNumber && caseNumbers.includes(t.caseNumber))
    );
    
    const balance = calculateLawyerBalance(lawyerId);
    
    // حساب التفاصيل
    let totalPaid = 0;
    let totalCommissions = 0;
    let totalDeductions = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let totalCasesFees = 0;
    let totalCasesExpenses = 0;
    
    lawyerTransactions.forEach(t => {
        const amount = parseFloat(t.amount) || 0;
        
        // المعاملات الخاصة بالمحامي
        if (t.type === 'lawyer_salary' || t.type === 'lawyer_payment') {
            totalPaid += amount;
        } else if (t.type === 'lawyer_commission' || t.type === 'lawyer_bonus') {
            totalCommissions += amount;
        } else if (t.type === 'lawyer_deduction') {
            totalDeductions += amount;
        }
        
        // المعاملات العامة والمرتبطة بالقضايا
        if (t.type === 'service_fee' || t.type === 'income' || t.type === 'payment_from_client') {
            totalIncome += amount;
            if (t.caseNumber && caseNumbers.includes(t.caseNumber)) {
                totalCasesFees += amount;
            }
        } else if (t.type === 'expense' || t.type === 'payment_to_client') {
            totalExpense += amount;
            if (t.caseNumber && caseNumbers.includes(t.caseNumber)) {
                totalCasesExpenses += amount;
            }
        }
    });
    
    openModal();
    document.getElementById('modalTitle').textContent = `💰 الحساب المالي الشامل - ${lawyer.name}`;
    
    const balanceClass = balance > 0 ? 'client-balance creditor' : balance < 0 ? 'client-balance debtor' : 'client-balance balanced';
    const balanceText = balance > 0 ? 'دائن (له)' : balance < 0 ? 'مدين (عليه)' : 'متوازن';
    const netCasesProfit = totalCasesFees - totalCasesExpenses;
    
    document.getElementById('modalBody').innerHTML = `
        <div style="margin-bottom: 30px;">
            <!-- معلومات أساسية -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; text-align: center;">
                    <div style="font-size: 0.9em; margin-bottom: 5px;">💵 الراتب الشهري</div>
                    <div style="font-size: 1.6em; font-weight: bold;">${(lawyer.salary || 0).toLocaleString('ar-IQ')} د.ع</div>
                </div>
                <div style="padding: 15px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border-radius: 12px; text-align: center;">
                    <div style="font-size: 0.9em; margin-bottom: 5px;">⚖️ عدد القضايا</div>
                    <div style="font-size: 1.6em; font-weight: bold;">${lawyerCases.length}</div>
                </div>
                <div class="${balanceClass}">
                    <div style="font-size: 0.9em; margin-bottom: 5px;">📊 الرصيد الحالي</div>
                    <div style="font-size: 1.6em; font-weight: bold;">${Math.abs(balance).toLocaleString('ar-IQ')} د.ع</div>
                    <div style="font-size: 0.85em;">${balanceText}</div>
                </div>
            </div>
            
            <!-- الإيرادات والمصروفات الإجمالية -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="padding: 15px; background: var(--success); color: white; border-radius: 10px; text-align: center;">
                    <div style="font-size: 0.85em;">💰 إجمالي الإيرادات</div>
                    <div style="font-size: 1.5em; font-weight: bold;">${totalIncome.toLocaleString('ar-IQ')} د.ع</div>
                    <small style="font-size: 0.75em;">جميع الإيرادات (قضايا + عام)</small>
                </div>
                <div style="padding: 15px; background: var(--danger); color: white; border-radius: 10px; text-align: center;">
                    <div style="font-size: 0.85em;">💸 إجمالي المصروفات</div>
                    <div style="font-size: 1.5em; font-weight: bold;">${totalExpense.toLocaleString('ar-IQ')} د.ع</div>
                    <small style="font-size: 0.75em;">جميع المصروفات (قضايا + عام)</small>
                </div>
            </div>
            
            <!-- معاملات القضايا -->
            <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 15px 0; color: #333;">📁 معاملات القضايا المرتبطة</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div style="background: white; padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 0.85em; color: #666;">💵 إيرادات القضايا</div>
                        <div style="font-size: 1.3em; font-weight: bold; color: var(--success);">${totalCasesFees.toLocaleString('ar-IQ')} د.ع</div>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 0.85em; color: #666;">💸 مصروفات القضايا</div>
                        <div style="font-size: 1.3em; font-weight: bold; color: var(--danger);">${totalCasesExpenses.toLocaleString('ar-IQ')} د.ع</div>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 0.85em; color: #666;">📊 صافي الربح</div>
                        <div style="font-size: 1.3em; font-weight: bold; color: ${netCasesProfit >= 0 ? 'var(--success)' : 'var(--danger)'};">${netCasesProfit.toLocaleString('ar-IQ')} د.ع</div>
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="padding: 15px; background: var(--success); color: white; border-radius: 10px; text-align: center;">
                    <div style="font-size: 0.85em;">💸 إجمالي المدفوع</div>
                    <div style="font-size: 1.4em; font-weight: bold;">${totalPaid.toLocaleString('ar-IQ')}</div>
                </div>
                <div style="padding: 15px; background: var(--info); color: white; border-radius: 10px; text-align: center;">
                    <div style="font-size: 0.85em;">⭐ العمولات</div>
                    <div style="font-size: 1.4em; font-weight: bold;">${totalCommissions.toLocaleString('ar-IQ')}</div>
                </div>
                <div style="padding: 15px; background: var(--warning); color: white; border-radius: 10px; text-align: center;">
                    <div style="font-size: 0.85em;">⚠️ الخصومات</div>
                    <div style="font-size: 1.4em; font-weight: bold;">${totalDeductions.toLocaleString('ar-IQ')}</div>
                </div>
            </div>
            
            <!-- قائمة القضايا التفصيلية -->
            ${lawyerCases.length > 0 ? `
                <h4 style="margin: 20px 0 10px;">⚖️ قضايا المحامي (${lawyerCases.length})</h4>
                <div style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>رقم القضية</th>
                                <th>العنوان</th>
                                <th>الموكل</th>
                                <th>الحالة</th>
                                <th>الإيرادات</th>
                                <th>المصروفات</th>
                                <th>الصافي</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lawyerCases.map(c => {
                                const caseTx = database.transactions.filter(t => t.caseNumber === c.caseNumber);
                                const caseIncome = caseTx.filter(t => t.type === 'service_fee' || t.type === 'income' || t.type === 'payment_from_client')
                                    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
                                const caseExpense = caseTx.filter(t => t.type === 'expense' || t.type === 'payment_to_client')
                                    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
                                const caseNet = caseIncome - caseExpense;
                                return `
                                <tr>
                                    <td><strong>${c.caseNumber}</strong></td>
                                    <td>${c.title}</td>
                                    <td>${c.client || '-'}</td>
                                    <td><span class="status-${c.status}">${getStatusText(c.status)}</span></td>
                                    <td class="transaction-income">${caseIncome.toLocaleString('ar-IQ')} د.ع</td>
                                    <td class="transaction-expense">${caseExpense.toLocaleString('ar-IQ')} د.ع</td>
                                    <td class="${caseNet >= 0 ? 'transaction-income' : 'transaction-expense'}">
                                        <strong>${caseNet.toLocaleString('ar-IQ')} د.ع</strong>
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
            
            <h4 style="margin: 20px 0 10px;">📋 جميع المعاملات المالية (${lawyerTransactions.length})</h4>
            ${lawyerTransactions.length > 0 ? `
                <div style="max-height: 400px; overflow-y: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>النوع</th>
                                <th>القضية</th>
                                <th>المبلغ</th>
                                <th>الوصف</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lawyerTransactions.slice().reverse().map(t => `
                                <tr>
                                    <td>${new Date(t.date).toLocaleDateString('ar-IQ')}</td>
                                    <td>${getTransactionTypeText(t.type)}</td>
                                    <td>${t.caseNumber ? `<strong>${t.caseNumber}</strong>` : '-'}</td>
                                    <td class="${t.type.includes('payment') || t.type.includes('salary') || t.type === 'expense' ? 'transaction-expense' : 'transaction-income'}">
                                        <strong>${parseFloat(t.amount).toLocaleString('ar-IQ')} د.ع</strong>
                                    </td>
                                    <td>${t.description || t.notes || '-'}</td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>
            ` : '<p style="text-align: center; color: var(--text-light); padding: 20px;">لا توجد معاملات مالية</p>'}
            
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button class="btn-primary" onclick="showAddLawyerTransaction(${lawyerId}, 'lawyer_payment')">💸 دفع راتب</button>
                <button class="btn-primary" onclick="showAddLawyerTransaction(${lawyerId}, 'lawyer_commission')">⭐ إضافة عمولة</button>
                <button class="btn-secondary" onclick="showAddLawyerTransaction(${lawyerId}, 'lawyer_deduction')">⚠️ خصم</button>
            </div>
        </div>
    `;
}

// إضافة معاملة مالية للمحامي
function showAddLawyerTransaction(lawyerId, type) {
    const lawyer = database.lawyers.find(l => l.id === lawyerId);
    if (!lawyer) return;
    
    openModal();
    const titles = {
        'lawyer_payment': '💸 دفع راتب',
        'lawyer_salary': '💰 راتب شهري',
        'lawyer_commission': '⭐ عمولة',
        'lawyer_bonus': '🎁 مكافأة',
        'lawyer_deduction': '⚠️ خصم'
    };
    
    document.getElementById('modalTitle').textContent = `${titles[type]} - ${lawyer.name}`;
    document.getElementById('modalBody').innerHTML = `
        <form id="lawyerTransactionForm" onsubmit="saveLawyerTransaction(event, ${lawyerId}, '${type}')">
            <div class="form-group">
                <label>💵 المبلغ (د.ع) *</label>
                <input type="number" name="amount" step="0.01" min="0" value="${type === 'lawyer_payment' ? lawyer.salary || 0 : ''}" required>
            </div>
            <div class="form-group">
                <label>📅 التاريخ *</label>
                <input type="date" name="date" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label>📝 ملاحظات</label>
                <textarea name="notes" rows="3"></textarea>
            </div>
            <button type="submit" class="btn-primary">حفظ</button>
        </form>
    `;
}

// حفظ معاملة مالية للمحامي
async function saveLawyerTransaction(e, lawyerId, type) {
    e.preventDefault();
    const form = e.target;
    const lawyer = database.lawyers.find(l => l.id === lawyerId);
    
    const transaction = {
        id: Date.now(),
        lawyerId: lawyerId,
        lawyer: lawyer.name,
        type: type,
        amount: parseFloat(form.amount.value),
        date: form.date.value,
        notes: form.notes.value,
        createdAt: new Date().toISOString()
    };
    
    database.transactions.push(transaction);
    saveData();
    closeModal();
    showToast('✅ تم حفظ المعاملة المالية بنجاح', 'success');
    
    // إعادة فتح نافذة الحساب المالي
    setTimeout(() => showLawyerFinancials(lawyerId), 300);
}

// الحصول على نص نوع المعاملة
function getTransactionTypeText(type) {
    const types = {
        'income': 'إيراد',
        'expense': 'مصروف',
        'payment_from_client': 'دفعة من عميل',
        'payment_to_client': 'دفعة لعميل',
        'service_fee': 'أتعاب خدمة',
        'salary': 'راتب',
        'commission': 'عمولة',
        'withdrawal': 'سحب',
        'lawyer_salary': 'راتب محامي',
        'lawyer_payment': 'دفع للمحامي',
        'lawyer_commission': 'عمولة محامي',
        'lawyer_bonus': 'مكافأة',
        'lawyer_deduction': 'خصم'
    };
    return types[type] || type;
}

// تحديث دالة تحميل المحامين
function loadLawyers() {
    const table = document.getElementById('lawyersTable');
    if (!table) return;
    
    table.innerHTML = database.lawyers.map((l, i) => {
        const balance = calculateLawyerBalance(l.id);
        const balanceClass = balance > 0 ? 'transaction-income' : balance < 0 ? 'transaction-expense' : '';
        return `
        <tr>
            <td>${i + 1}</td>
            <td><strong>${l.name}</strong></td>
            <td>${l.license || '-'}</td>
            <td>${l.specialty || '-'}</td>
            <td>${(l.salary || 0).toLocaleString('ar-IQ')} د.ع</td>
            <td class="${balanceClass}"><strong>${balance.toLocaleString('ar-IQ')} د.ع</strong></td>
            <td>${l.phone || '-'}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-view" onclick="showLawyerFinancials(${l.id})" title="الحساب المالي">💰</button>
                    <button class="btn-edit" onclick="editLawyer(${l.id})" title="تعديل">✏️</button>
                    <button class="btn-delete" onclick="deleteLawyer(${l.id})" title="حذف">🗑️</button>
                </div>
            </td>
        </tr>
    `}).join('');
    
    // إضافة صف الملخص المالي
    const summary = calculateLawyersSummary();
    table.innerHTML += `
        <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: bold;">
            <td colspan="4" style="text-align: center;">📊 الملخص المالي الإجمالي</td>
            <td>${summary.totalSalaries.toLocaleString('ar-IQ')} د.ع</td>
            <td class="${summary.netBalance > 0 ? 'status-active' : summary.netBalance < 0 ? 'status-closed' : ''}">
                ${summary.netBalance.toLocaleString('ar-IQ')} د.ع
            </td>
            <td colspan="2" style="font-size: 0.85em;">
                <div>دائن: ${summary.totalCreditor.toLocaleString('ar-IQ')} د.ع</div>
                <div>مدين: ${summary.totalDebtor.toLocaleString('ar-IQ')} د.ع</div>
            </td>
        </tr>
    `;
}

// تحديث دالة فلترة المحامين
function filterLawyers() {
    const search = document.getElementById('lawyerSearch')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#lawyersTable tr:not(:last-child)');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
}

// اختيار المحامي تلقائياً من القضية
// ==================== إدارة المدينين والدائنين ====================
function saveExchangeRate() {
    const rate = parseFloat(document.getElementById('exchangeRate')?.value || 1450);
    database.exchangeRate = rate;
    saveData();
    renderDebtorsCreditors();
    showToast('✅ تم حفظ سعر الصرف', 'success');
}

function renderDebtorsCreditors() {
    const rate = database.exchangeRate || parseFloat(document.getElementById('exchangeRate')?.value) || 1450;
    if (database.exchangeRate) {
        const input = document.getElementById('exchangeRate');
        if (input) input.value = database.exchangeRate;
    }
    
    // الحصول على الفلاتر
    const filterType = document.getElementById('debtorFilter')?.value || 'all';
    const sortType = document.getElementById('debtorSort')?.value || 'amount_desc';
    const searchTerm = document.getElementById('debtorSearch')?.value.toLowerCase() || '';
    
    // حساب رصيد كل زبون
    let clientsWithBalances = database.clients.map(client => {
        const balance = calculateClientBalance(client.name);
        const transactions = database.transactions.filter(t => t.client === client.name);
        return { ...client, balance, transactionCount: transactions.length };
    });
    
    // تطبيق البحث
    if (searchTerm) {
        clientsWithBalances = clientsWithBalances.filter(c => 
            c.name.toLowerCase().includes(searchTerm) || 
            c.phone.includes(searchTerm)
        );
    }
    
    // فصل المدينين والدائنين
    let debtors = clientsWithBalances.filter(c => c.balance > 0);
    let creditors = clientsWithBalances.filter(c => c.balance < 0);
    
    // تطبيق الفلتر
    if (filterType === 'debtors') {
        creditors = [];
    } else if (filterType === 'creditors') {
        debtors = [];
    }
    
    // تطبيق الترتيب
    const sortFn = (a, b) => {
        switch(sortType) {
            case 'amount_desc': return Math.abs(b.balance) - Math.abs(a.balance);
            case 'amount_asc': return Math.abs(a.balance) - Math.abs(b.balance);
            case 'name_asc': return a.name.localeCompare(b.name, 'ar');
            case 'name_desc': return b.name.localeCompare(a.name, 'ar');
            default: return 0;
        }
    };
    debtors.sort(sortFn);
    creditors.sort(sortFn);
    
    // تحديث الإحصائيات
    updateDebtorsStats(debtors, creditors, rate);
    
    // عرض المدينين بالدينار
    const debtorsIQD = document.getElementById('debtorsListIQD');
    if (debtorsIQD) {
        debtorsIQD.innerHTML = debtors.length > 0
            ? debtors.map((c, index) => `
                <div style="background:linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);border:2px solid #ffcdd2;border-radius:12px;padding:15px;margin-bottom:12px;box-shadow:0 3px 10px rgba(255,107,107,0.15);transition:all 0.3s;position:relative;overflow:hidden" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(255,107,107,0.25)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 3px 10px rgba(255,107,107,0.15)'">
                    <div style="position:absolute;top:-30px;right:-30px;width:80px;height:80px;background:rgba(255,107,107,0.1);border-radius:50%"></div>
                    <div style="position:relative;z-index:1">
                        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px">
                            <div style="flex:1">
                                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                                    <span style="background:#ff6b6b;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.85em">${index + 1}</span>
                                    <strong style="font-size:1.15em;color:#2c3e50">👤 ${c.name}</strong>
                                </div>
                                <div style="display:flex;gap:12px;margin-top:8px">
                                    <span style="font-size:0.9em;color:#5a6c7d;background:white;padding:4px 10px;border-radius:6px;display:inline-flex;align-items:center;gap:5px">
                                        <span>📞</span>${c.phone}
                                    </span>
                                    <span style="font-size:0.9em;color:#5a6c7d;background:white;padding:4px 10px;border-radius:6px;display:inline-flex;align-items:center;gap:5px">
                                        <span>📄</span>${c.transactionCount} معاملة
                                    </span>
                                </div>
                            </div>
                            <div style="text-align:left;background:white;padding:10px 15px;border-radius:10px;border:2px solid #ff6b6b">
                                <div style="font-weight:900;color:#ff6b6b;font-size:1.4em;line-height:1">${c.balance.toLocaleString('ar-IQ')}</div>
                                <div style="font-size:0.75em;color:#888;margin-top:2px">دينار عراقي</div>
                                <div style="font-size:0.9em;color:#ff6b6b;font-weight:700;margin-top:4px;padding-top:4px;border-top:1px solid #ffe5e5">$${(c.balance / rate).toFixed(2)}</div>
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:12px">
                            <button class="btn-primary" style="padding:8px;font-size:0.85em;border-radius:8px;font-weight:600;background:#667eea;border:none" onclick="viewClientAccount(${c.id})">💳 الحساب</button>
                            <button class="btn-secondary" style="padding:8px;font-size:0.85em;border-radius:8px;font-weight:600" onclick="showClientTransactions(${c.id})">📋 المعاملات</button>
                            <button style="padding:8px;font-size:0.85em;border-radius:8px;font-weight:600;background:#10b981;color:white;border:none;cursor:pointer" onclick="quickPayment(${c.id}, 'from')">💵 دفعة</button>
                        </div>
                    </div>
                </div>
            `).join('')
            : '<div style="text-align:center;padding:50px 20px;background:linear-gradient(135deg, #f5f7fa, #e8eef3);border-radius:12px;border:2px dashed #cbd5e0"><div style="font-size:3em;margin-bottom:10px">✅</div><p style="color:#718096;font-size:1.1em;font-weight:600;margin:0">لا يوجد مدينون حالياً</p><p style="color:#a0aec0;font-size:0.9em;margin:5px 0 0 0">جميع الحسابات مستوفاة</p></div>';
    }
    
    // عرض الدائنين بالدينار
    const creditorsIQD = document.getElementById('creditorsListIQD');
    if (creditorsIQD) {
        creditorsIQD.innerHTML = creditors.length > 0
            ? creditors.map((c, index) => `
                <div style="background:linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);border:2px solid #bae6fd;border-radius:12px;padding:15px;margin-bottom:12px;box-shadow:0 3px 10px rgba(72,219,251,0.15);transition:all 0.3s;position:relative;overflow:hidden" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(72,219,251,0.25)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 3px 10px rgba(72,219,251,0.15)'">
                    <div style="position:absolute;top:-30px;right:-30px;width:80px;height:80px;background:rgba(72,219,251,0.1);border-radius:50%"></div>
                    <div style="position:relative;z-index:1">
                        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px">
                            <div style="flex:1">
                                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                                    <span style="background:#48dbfb;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.85em">${index + 1}</span>
                                    <strong style="font-size:1.15em;color:#2c3e50">👤 ${c.name}</strong>
                                </div>
                                <div style="display:flex;gap:12px;margin-top:8px">
                                    <span style="font-size:0.9em;color:#5a6c7d;background:white;padding:4px 10px;border-radius:6px;display:inline-flex;align-items:center;gap:5px">
                                        <span>📞</span>${c.phone}
                                    </span>
                                    <span style="font-size:0.9em;color:#5a6c7d;background:white;padding:4px 10px;border-radius:6px;display:inline-flex;align-items:center;gap:5px">
                                        <span>📄</span>${c.transactionCount} معاملة
                                    </span>
                                </div>
                            </div>
                            <div style="text-align:left;background:white;padding:10px 15px;border-radius:10px;border:2px solid #48dbfb">
                                <div style="font-weight:900;color:#48dbfb;font-size:1.4em;line-height:1">${Math.abs(c.balance).toLocaleString('ar-IQ')}</div>
                                <div style="font-size:0.75em;color:#888;margin-top:2px">دينار عراقي</div>
                                <div style="font-size:0.9em;color:#48dbfb;font-weight:700;margin-top:4px;padding-top:4px;border-top:1px solid #e0f2fe">$${(Math.abs(c.balance) / rate).toFixed(2)}</div>
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:12px">
                            <button class="btn-primary" style="padding:8px;font-size:0.85em;border-radius:8px;font-weight:600;background:#667eea;border:none" onclick="viewClientAccount(${c.id})">💳 الحساب</button>
                            <button class="btn-secondary" style="padding:8px;font-size:0.85em;border-radius:8px;font-weight:600" onclick="showClientTransactions(${c.id})">📋 المعاملات</button>
                            <button style="padding:8px;font-size:0.85em;border-radius:8px;font-weight:600;background:#f59e0b;color:white;border:none;cursor:pointer" onclick="quickPayment(${c.id}, 'to')">💰 دفعة</button>
                        </div>
                    </div>
                </div>
            `).join('')
            : '<div style="text-align:center;padding:50px 20px;background:linear-gradient(135deg, #f0f9ff, #e0f2fe);border-radius:12px;border:2px dashed #bae6fd"><div style="font-size:3em;margin-bottom:10px">✅</div><p style="color:#0c4a6e;font-size:1.1em;font-weight:600;margin:0">لا يوجد دائنون حالياً</p><p style="color:#0369a1;font-size:0.9em;margin:5px 0 0 0">لا توجد مستحقات علينا</p></div>';
    }
    
    // عرض المدينين بالدولار
    const debtorsUSD = document.getElementById('debtorsListUSD');
    if (debtorsUSD) {
        debtorsUSD.innerHTML = debtors.length > 0
            ? debtors.map((c, index) => {
                const usd = (c.balance / rate).toFixed(2);
                return `
                    <div style="padding:12px;margin-bottom:8px;background:white;border-radius:10px;border:1px solid #fee;display:flex;justify-content:space-between;align-items:center;transition:all 0.2s;cursor:pointer" onmouseover="this.style.background='#fff5f5';this.style.borderColor='#ff6b6b'" onmouseout="this.style.background='white';this.style.borderColor='#fee'">
                        <div style="display:flex;align-items:center;gap:10px">
                            <span style="background:#ff6b6b;color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.75em">${index + 1}</span>
                            <div>
                                <div style="font-weight:700;color:#2c3e50;margin-bottom:2px">👤 ${c.name}</div>
                                <div style="font-size:0.8em;color:#718096">${c.transactionCount} معاملة</div>
                            </div>
                        </div>
                        <div style="text-align:left">
                            <div style="font-weight:900;color:#ff6b6b;font-size:1.3em">$${usd}</div>
                        </div>
                    </div>
                `;
            }).join('')
            : '<p style="text-align:center;color:#a0aec0;padding:30px;font-style:italic">— لا يوجد مدينون —</p>';
    }
    
    // عرض الدائنين بالدولار
    const creditorsUSD = document.getElementById('creditorsListUSD');
    if (creditorsUSD) {
        creditorsUSD.innerHTML = creditors.length > 0
            ? creditors.map((c, index) => {
                const usd = (Math.abs(c.balance) / rate).toFixed(2);
                return `
                    <div style="padding:12px;margin-bottom:8px;background:white;border-radius:10px;border:1px solid #e0f2fe;display:flex;justify-content:space-between;align-items:center;transition:all 0.2s;cursor:pointer" onmouseover="this.style.background='#f0f9ff';this.style.borderColor='#48dbfb'" onmouseout="this.style.background='white';this.style.borderColor='#e0f2fe'">
                        <div style="display:flex;align-items:center;gap:10px">
                            <span style="background:#48dbfb;color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.75em">${index + 1}</span>
                            <div>
                                <div style="font-weight:700;color:#2c3e50;margin-bottom:2px">👤 ${c.name}</div>
                                <div style="font-size:0.8em;color:#718096">${c.transactionCount} معاملة</div>
                            </div>
                        </div>
                        <div style="text-align:left">
                            <div style="font-weight:900;color:#48dbfb;font-size:1.3em">$${usd}</div>
                        </div>
                    </div>
                `;
            }).join('')
            : '<p style="text-align:center;color:#a0aec0;padding:30px;font-style:italic">— لا يوجد دائنون —</p>';
    }
}

function updateDebtorsStats(debtors, creditors, rate) {
    const totalDebtorsAmount = debtors.reduce((sum, c) => sum + c.balance, 0);
    const totalCreditorsAmount = creditors.reduce((sum, c) => sum + Math.abs(c.balance), 0);
    
    const countElem1 = document.getElementById('totalDebtorsCount');
    const amountElem1 = document.getElementById('totalDebtorsAmount');
    const countElem2 = document.getElementById('totalCreditorsCount');
    const amountElem2 = document.getElementById('totalCreditorsAmount');
    
    if (countElem1) countElem1.textContent = debtors.length;
    if (amountElem1) amountElem1.innerHTML = `${totalDebtorsAmount.toLocaleString('ar-IQ')} د.ع<br><span style="font-size:0.75em">$${(totalDebtorsAmount / rate).toFixed(2)}</span>`;
    if (countElem2) countElem2.textContent = creditors.length;
    if (amountElem2) amountElem2.innerHTML = `${totalCreditorsAmount.toLocaleString('ar-IQ')} د.ع<br><span style="font-size:0.75em">$${(totalCreditorsAmount / rate).toFixed(2)}</span>`;
}

function showClientTransactions(clientId) {
    const client = database.clients.find(c => c.id === clientId);
    if (!client) return;
    
    const transactions = database.transactions.filter(t => t.client === client.name);
    
    document.getElementById('modalTitle').textContent = `📋 معاملات ${client.name}`;
    document.getElementById('modalBody').innerHTML = `
        <div style="margin-bottom:15px">
            <strong>👤 الزبون:</strong> ${client.name}<br>
            <strong>📞 الهاتف:</strong> ${client.phone}<br>
            <strong>💰 الرصيد:</strong> <span style="color:${calculateClientBalance(client.name) > 0 ? 'var(--danger)' : 'var(--success)'};font-weight:bold">${calculateClientBalance(client.name).toLocaleString('ar-IQ')} د.ع</span>
        </div>
        
        ${transactions.length > 0 ? `
            <div style="max-height:400px;overflow-y:auto">
                <table class="data-table" style="font-size:0.9em">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>النوع</th>
                            <th>المبلغ</th>
                            <th>الوصف</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(t => `
                            <tr>
                                <td>${new Date(t.date).toLocaleDateString('ar-IQ')}</td>
                                <td>${getTransactionTypeText(t.type)}</td>
                                <td class="${t.type === 'payment_from_client' ? 'transaction-income' : 'transaction-expense'}">
                                    ${parseFloat(t.amount).toLocaleString('ar-IQ')} د.ع
                                </td>
                                <td>${t.description || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : '<p style="text-align:center;color:var(--text-light);padding:30px">لا توجد معاملات</p>'}
        
        <div style="margin-top:20px;display:flex;gap:10px">
            <button class="btn-primary" onclick="closeModal(); viewClientAccount(${clientId})">💳 عرض الحساب الكامل</button>
            <button class="btn-secondary" onclick="closeModal()">إغلاق</button>
        </div>
    `;
    showModal();
}

function quickPayment(clientId, type) {
    const client = database.clients.find(c => c.id === clientId);
    if (!client) return;
    
    const transactionType = type === 'from' ? 'payment_from_client' : 'payment_to_client';
    const title = type === 'from' ? '💵 تسجيل دفعة من الزبون' : '💰 تسجيل دفعة للزبون';
    
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = `
        <form id="quickPaymentForm" onsubmit="saveQuickPayment(event, ${clientId}, '${transactionType}')">
            <div style="background:var(--bg);padding:15px;border-radius:8px;margin-bottom:15px">
                <strong>👤 الزبون:</strong> ${client.name}<br>
                <strong>💰 الرصيد الحالي:</strong> <span style="color:${calculateClientBalance(client.name) > 0 ? 'var(--danger)' : 'var(--success)'}">${calculateClientBalance(client.name).toLocaleString('ar-IQ')} د.ع</span>
            </div>
            
            <div class="form-group">
                <label>💵 المبلغ *</label>
                <input type="number" name="amount" required min="0" step="1000" autofocus>
            </div>
            
            <div class="form-group">
                <label>📅 التاريخ *</label>
                <input type="date" name="date" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            
            <div class="form-group">
                <label>📝 الوصف</label>
                <textarea name="description" rows="3" placeholder="وصف الدفعة..."></textarea>
            </div>
            
            <button type="submit" class="btn-primary" style="width:100%">💾 حفظ الدفعة</button>
        </form>
    `;
    showModal();
}

async function saveQuickPayment(e, clientId, type) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const client = database.clients.find(c => c.id === clientId);
    
    const transaction = {
        type: type,
        amount: parseFloat(formData.get('amount')),
        description: formData.get('description') || `${type === 'payment_from_client' ? 'دفعة من' : 'دفعة لـ'} ${client.name}`,
        client: client.name,
        caseNumber: '',
        date: formData.get('date')
    };
    
    if (useBackend && authToken) {
        const typeMap = {
            'payment_from_client': 0,
            'payment_to_client': 1,
            'service_fee': 2,
            'expense': 3
        };
        
        const payload = {
            type: typeMap[transaction.type],
            amount: transaction.amount,
            notes: transaction.description,
            date: transaction.date,
            clientId: clientId
        };
        
        const result = await apiCall('/transactions', 'POST', payload);
        if (result) {
            await loadBackendData();
            closeModal();
            renderDebtorsCreditors();
            showToast('✅ تم تسجيل الدفعة بنجاح', 'success');
            return;
        }
    }
    
    transaction.id = Date.now();
    database.transactions.push(transaction);
    saveData();
    renderTransactions();
    renderClients();
    closeModal();
    renderDebtorsCreditors();
    showToast('✅ تم تسجيل الدفعة بنجاح', 'success');
}

function exportDebtorsExcel() {
    if (!(window.XLSX && XLSX.utils && XLSX.writeFile)) {
        showToast('⚠️ مكتبة Excel غير متاحة', 'warning');
        return;
    }
    
    const rate = database.exchangeRate || 1450;
    const clientsWithBalances = database.clients.map(client => {
        const balance = calculateClientBalance(client.name);
        return { ...client, balance };
    });
    
    const debtors = clientsWithBalances.filter(c => c.balance > 0).sort((a, b) => b.balance - a.balance);
    const creditors = clientsWithBalances.filter(c => c.balance < 0).sort((a, b) => a.balance - b.balance);
    
    const wb = XLSX.utils.book_new();
    
    // ورقة المدينين
    if (debtors.length > 0) {
        const debtorsHeaders = ['الاسم', 'الهاتف', 'المبلغ (د.ع)', 'المبلغ ($)'];
        const debtorsRows = debtors.map(c => [
            c.name,
            c.phone,
            c.balance,
            (c.balance / rate).toFixed(2)
        ]);
        debtorsRows.push(['', 'الإجمالي', debtors.reduce((s, c) => s + c.balance, 0), (debtors.reduce((s, c) => s + c.balance, 0) / rate).toFixed(2)]);
        
        const wsDebtors = XLSX.utils.aoa_to_sheet([debtorsHeaders, ...debtorsRows]);
        wsDebtors['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsDebtors, 'المدينون');
    }
    
    // ورقة الدائنين
    if (creditors.length > 0) {
        const creditorsHeaders = ['الاسم', 'الهاتف', 'المبلغ (د.ع)', 'المبلغ ($)'];
        const creditorsRows = creditors.map(c => [
            c.name,
            c.phone,
            Math.abs(c.balance),
            (Math.abs(c.balance) / rate).toFixed(2)
        ]);
        creditorsRows.push(['', 'الإجمالي', creditors.reduce((s, c) => s + Math.abs(c.balance), 0), (creditors.reduce((s, c) => s + Math.abs(c.balance), 0) / rate).toFixed(2)]);
        
        const wsCreditors = XLSX.utils.aoa_to_sheet([creditorsHeaders, ...creditorsRows]);
        wsCreditors['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsCreditors, 'الدائنون');
    }
    
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `المدينون_والدائنون_${dateStr}.xlsx`);
    showToast('✅ تم تصدير ملف Excel', 'success');
}

// ==================== تهيئة النظام ====================
function initializeApp() {
    console.log('🔄 جاري تهيئة النظام...');
    
    // تحقق من وجود جلسة نشطة
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('✅ تم استرجاع جلسة المستخدم:', currentUser.username || currentUser.name);
            loadData();
            showApp();
            updateDashboard();
            renderLawyers();
            renderCases();
            renderClients();
            renderTransactions();
            setupUXEnhancements();
            return;
        } catch (e) {
            console.warn('⚠️ جلسة تالفة - يتم مسح البيانات');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            currentUser = null;
            authToken = null;
        }
    }
    
    // بدء من الصفر - عرض شاشة تسجيل الدخول
    console.log('🔐 عرض شاشة تسجيل الدخول');
    document.body.classList.add('login-active');
    loadData();
    initializeLoginForm();
}

// تشغيل عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

console.log('✅ تم تحميل النظام بنجاح!');
