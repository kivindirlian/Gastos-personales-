// Base de datos local
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Colores para categorías
const categoryColors = {
    comida: '#e74c3c',
    transporte: '#3498db',
    entretenimiento: '#9b59b6',
    compras: '#f39c12',
    servicios: '#1abc9c',
    salud: '#e67e22',
    otros: '#95a5a6'
};

const categoryNames = {
    comida: '🍔 Comida',
    transporte: '🚗 Transporte',
    entretenimiento: '🎬 Entretenimiento',
    compras: '🛍️ Compras',
    servicios: '💡 Servicios',
    salud: '🏥 Salud',
    otros: '📦 Otros'
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    setupInstallPrompt();
});

// Agregar gasto
function addExpense() {
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;

    if (!amount || amount <= 0) {
        alert('Por favor ingresa un monto válido');
        return;
    }

    const expense = {
        id: Date.now(),
        amount: amount,
        category: category,
        description: description || 'Sin descripción',
        date: new Date().toISOString()
    };

    expenses.unshift(expense);
    saveExpenses();
    updateUI();
    clearForm();
    
    // Feedback táctil
    if (navigator.vibrate) navigator.vibrate(50);
}

// Guardar en localStorage
function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Actualizar interfaz
function updateUI() {
    updateTotal();
    updateChart();
    updateList();
}

// Actualizar total
function updateTotal() {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    document.getElementById('totalAmount').textContent = formatMoney(total);
}

// Actualizar gráfico
function updateChart() {
    const container = document.getElementById('chartContainer');
    
    if (expenses.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay datos aún</div>';
        return;
    }

    // Agrupar por categoría
    const byCategory = {};
    expenses.forEach(exp => {
        byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
    });

    const total = Object.values(byCategory).reduce((a, b) => a + b, 0);
    
    let html = '';
    Object.entries(byCategory).forEach(([cat, amount]) => {
        const percentage = (amount / total * 100).toFixed(1);
        html += `
            <div class="category-bar">
                <div class="category-label">${categoryNames[cat]}</div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%; background: ${categoryColors[cat]}">
                        ${percentage > 15 ? percentage + '%' : ''}
                    </div>
                </div>
                <div class="category-amount">${formatMoney(amount)}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Actualizar lista
function updateList() {
    const container = document.getElementById('expenseList');
    
    if (expenses.length === 0) {
        container.innerHTML = '<div class="empty-state">Sin gastos registrados</div>';
        return;
    }

    const today = new Date().toDateString();
    
    let html = '';
    expenses.slice(0, 50).forEach(exp => {
        const date = new Date(exp.date);
        const dateStr = date.toDateString() === today ? 'Hoy' : date.toLocaleDateString('es-ES');
        
        html += `
            <div class="expense-item">
                <div class="expense-info">
                    <h4>${exp.description}</h4>
                    <span>${categoryNames[exp.category]} • ${dateStr}</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <div class="expense-amount">${formatMoney(exp.amount)}</div>
                    <button class="delete-btn" onclick="deleteExpense(${exp.id})">🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Eliminar gasto
function deleteExpense(id) {
    if (confirm('¿Eliminar este gasto?')) {
        expenses = expenses.filter(exp => exp.id !== id);
        saveExpenses();
        updateUI();
    }
}

// Limpiar formulario
function clearForm() {
    document.getElementById('amount').value = '';
    document.getElementById('description').value = '';
    document.getElementById('category').selectedIndex = 0;
}

// Formatear dinero
function formatMoney(amount) {
    return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Instalación de PWA
let deferredPrompt;

function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        document.getElementById('installBtn').classList.add('show');
    });

    window.addEventListener('appinstalled', () => {
        document.getElementById('installBtn').classList.remove('show');
        deferredPrompt = null;
    });
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Usuario instaló la app');
            }
            deferredPrompt = null;
        });
    }
}

// Registrar Service Worker para offline
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
        console.log('Service Worker no registrado', err);
    });
}
