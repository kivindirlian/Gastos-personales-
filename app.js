// ==================== DATOS ====================
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];

let currentTransactionType = 'income';

// ==================== COLORES Y ETIQUETAS ====================
const categoryColors = {
    comida: '#e74c3c',
    transporte: '#3498db',
    entretenimiento: '#9b59b6',
    compras: '#f39c12',
    servicios: '#1abc9c',
    salud: '#e67e22',
    ropa: '#34495e',
    educacion: '#16a085',
    otros: '#95a5a6',
    salario: '#2ecc71',
    freelance: '#27ae60',
    inversiones: '#1e8449',
    regalo: '#58d68d'
};

const categoryNames = {
    comida: '🍔 Comida',
    transporte: '🚗 Transporte',
    entretenimiento: '🎬 Entretenimiento',
    compras: '🛍️ Compras',
    servicios: '💡 Servicios',
    salud: '🏥 Salud',
    ropa: '👕 Ropa',
    educacion: '📚 Educación',
    otros: '📦 Otros',
    salario: '💼 Salario',
    freelance: '💻 Freelance',
    inversiones: '📈 Inversiones',
    regalo: '🎁 Regalo'
};

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    setupInstallPrompt();
    
    // Enter key en inputs
    document.getElementById('shoppingItem').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addShoppingItem();
    });
    
    document.getElementById('transDescription').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTransaction();
    });
});

// ==================== NAVEGACIÓN ====================
function showSection(section) {
    // Ocultar todas
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.bottom-nav-item').forEach(n => n.classList.remove('active'));
    
    // Mostrar seleccionada
    if (section === 'transactions') {
        document.getElementById('transactionsSection').classList.add('active');
        document.querySelectorAll('.bottom-nav-item')[0].classList.add('active');
    } else if (section === 'shopping') {
        document.getElementById('shoppingSection').classList.add('active');
        document.querySelectorAll('.bottom-nav-item')[1].classList.add('active');
    } else if (section === 'stats') {
        document.getElementById('statsSection').classList.add('active');
        document.querySelectorAll('.bottom-nav-item')[2].classList.add('active');
        updateStats();
    }
    
    updateUI();
}

// ==================== TRANSACCIONES ====================
function setTransactionType(type) {
    currentTransactionType = type;
    
    // Actualizar botones
    document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active', 'income', 'expense'));
    event.target.classList.add('active', type);
    
    // Mostrar/ocultar campos
    if (type === 'income') {
        document.getElementById('categoryGroup').style.display = 'none';
        document.getElementById('incomeSourceGroup').style.display = 'block';
    } else {
        document.getElementById('categoryGroup').style.display = 'block';
        document.getElementById('incomeSourceGroup').style.display = 'none';
    }
}

function addTransaction() {
    const amount = parseFloat(document.getElementById('transAmount').value);
    const description = document.getElementById('transDescription').value;
    
    if (!amount || amount <= 0) {
        alert('Por favor ingresa un monto válido');
        return;
    }
    
    let category;
    if (currentTransactionType === 'income') {
        category = document.getElementById('incomeSource').value;
    } else {
        category = document.getElementById('transCategory').value;
    }
    
    const transaction = {
        id: Date.now(),
        type: currentTransactionType,
        amount: amount,
        category: category,
        description: description || (currentTransactionType === 'income' ? 'Ingreso' : 'Gasto'),
        date: new Date().toISOString()
    };
    
    transactions.unshift(transaction);
    saveData();
    updateUI();
    clearTransactionForm();
    
    if (navigator.vibrate) navigator.vibrate(50);
}

function deleteTransaction(id) {
    if (confirm('¿Eliminar esta transacción?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveData();
        updateUI();
    }
}

function clearTransactionForm() {
    document.getElementById('transAmount').value = '';
    document.getElementById('transDescription').value = '';
}

// ==================== LISTA DE MERCADO ====================
function addShoppingItem() {
    const input = document.getElementById('shoppingItem');
    const text = input.value.trim();
    
    if (!text) return;
    
    const item = {
        id: Date.now(),
        text: text,
        checked: false,
        createdAt: new Date().toISOString()
    };
    
    shoppingList.push(item);
    saveData();
    updateShoppingList();
    input.value = '';
    
    if (navigator.vibrate) navigator.vibrate(30);
}

function toggleShoppingItem(id) {
    const item = shoppingList.find(i => i.id === id);
    if (item) {
        item.checked = !item.checked;
        saveData();
        updateShoppingList();
        
        if (item.checked && navigator.vibrate) navigator.vibrate(20);
    }
}

function deleteShoppingItem(id) {
    shoppingList = shoppingList.filter(i => i.id !== id);
    saveData();
    updateShoppingList();
}

// ==================== ACTUALIZAR UI ====================
function updateUI() {
    updateBalance();
    updateTransactionList();
    updateCategoryChart();
    updateShoppingList();
}

function updateBalance() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense;
    
    const balanceEl = document.getElementById('balanceAmount');
    balanceEl.textContent = formatMoney(balance);
    balanceEl.className = 'balance-amount ' + (balance >= 0 ? 'positive' : 'negative');
    
    document.getElementById('totalIncome').textContent = formatMoney(income);
    document.getElementById('totalExpense').textContent = formatMoney(expense);
}

function updateTransactionList() {
    const container = document.getElementById('transactionList');
    
    if (transactions.length === 0) {
        container.innerHTML = '<div class="empty-state">Sin transacciones</div>';
        return;
    }
    
    const today = new Date().toDateString();
    
    let html = '';
    transactions.slice(0, 30).forEach(t => {
        const date = new Date(t.date);
        const dateStr = date.toDateString() === today ? 'Hoy' : date.toLocaleDateString('es-ES');
        const categoryLabel = categoryNames[t.category] || t.category;
        
        html += `
            <div class="transaction-item">
                <div class="transaction-info">
                    <h4>${t.description}</h4>
                    <span>${categoryLabel} • ${dateStr}</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <div class="transaction-amount ${t.type}">
                        ${t.type === 'income' ? '+' : '-'}${formatMoney(t.amount)}
                    </div>
                    <button class="delete-btn" onclick="deleteTransaction(${t.id})">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function updateCategoryChart() {
    const container = document.getElementById('categoryChart');
    const expenses = transactions.filter(t => t.type === 'expense');
    
    if (expenses.length === 0) {
        container.innerHTML = '<div class="empty-state">Sin datos aún</div>';
        return;
    }
    
    // Agrupar por categoría
    const byCategory = {};
    expenses.forEach(t => {
        byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    
    const total = Object.values(byCategory).reduce((a, b) => a + b, 0);
    
    let html = '';
    Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, amount]) => {
            const percentage = (amount / total * 100).toFixed(1);
            html += `
                <div class="category-bar">
                    <div class="category-label">${categoryNames[cat] || cat}</div>
                    <div class="bar-wrapper">
                        <div class="bar-fill" style="width: ${percentage}%; background: ${categoryColors[cat] || '#95a5a6'}">
                            ${percentage > 20 ? percentage + '%' : ''}
                        </div>
                    </div>
                    <div class="category-value">${formatMoney(amount)}</div>
                </div>
            `;
        });
    
    container.innerHTML = html;
}

function updateShoppingList() {
    const container = document.getElementById('shoppingList');
    
    // Actualizar progreso
    const total = shoppingList.length;
    const checked = shoppingList.filter(i => i.checked).length;
    const percentage = total > 0 ? (checked / total * 100) : 0;
    
    document.getElementById('progressText').textContent = `${checked}/${total}`;
    document.getElementById('progressBar').style.width = percentage + '%';
    
    if (total === 0) {
        container.innerHTML = '<div class="empty-state">Tu lista está vacía</div>';
        return;
    }
    
    // Ordenar: pendientes primero, luego por fecha
    const sorted = [...shoppingList].sort((a, b) => {
        if (a.checked === b.checked) return b.id - a.id;
        return a.checked ? 1 : -1;
    });
    
    let html = '';
    sorted.forEach(item => {
        html += `
            <div class="shopping-item">
                <div class="checkbox-wrapper">
                    <input type="checkbox" 
                           ${item.checked ? 'checked' : ''} 
                           onchange="toggleShoppingItem(${item.id})">
                    <div class="custom-checkbox"></div>
                </div>
                <div class="shopping-item-text ${item.checked ? 'checked' : ''}">
                    ${item.text}
                </div>
                <button class="shopping-delete" onclick="deleteShoppingItem(${item.id})">🗑️</button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ==================== ESTADÍSTICAS ====================
function updateStats() {
    // Contadores
    document.getElementById('statTransactions').textContent = transactions.length;
    document.getElementById('statShopping').textContent = shoppingList.length;
    document.getElementById('statPending').textContent = shoppingList.filter(i => !i.checked).length;
    
    // Categorías únicas usadas
    const uniqueCategories = new Set(transactions.filter(t => t.type === 'expense').map(t => t.category));
    document.getElementById('statCategories').textContent = uniqueCategories.size;
    
    // Mayor gasto
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length > 0) {
        const topExpense = expenses.reduce((max, t) => t.amount > max.amount ? t : max);
        document.getElementById('topExpense').innerHTML = `
            <div class="transaction-item" style="border: none; padding: 10px 0;">
                <div class="transaction-info">
                    <h4>${topExpense.description}</h4>
                    <span>${categoryNames[topExpense.category]}</span>
                </div>
                <div class="transaction-amount expense">${formatMoney(topExpense.amount)}</div>
            </div>
        `;
    }
    
    // Mayor entrada
    const incomes = transactions.filter(t => t.type === 'income');
    if (incomes.length > 0) {
        const topIncome = incomes.reduce((max, t) => t.amount > max.amount ? t : max);
        document.getElementById('topIncome').innerHTML = `
            <div class="transaction-item" style="border: none; padding: 10px 0;">
                <div class="transaction-info">
                    <h4>${topIncome.description}</h4>
                    <span>${categoryNames[topIncome.category]}</span>
                </div>
                <div class="transaction-amount income">${formatMoney(topIncome.amount)}</div>
            </div>
        `;
    }
}

// ==================== UTILIDADES ====================
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
}

function formatMoney(amount) {
    return '$' + Math.abs(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// ==================== PWA ====================
let deferredPrompt;

function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        document.getElementById('installBtn').classList.add('show');
    });
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
            deferredPrompt = null;
            document.getElementById('installBtn').classList.remove('show');
        });
    }
}

// Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
}
