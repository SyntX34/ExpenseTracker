(function() {
    'use strict';
    const descInput = document.getElementById('descInput');
    const amountInput = document.getElementById('amountInput');
    const typeInput = document.getElementById('typeInput');
    const addBtn = document.getElementById('addBtn');
    const clearBtn = document.getElementById('clearBtn');
    const transactionList = document.getElementById('transactionList');
    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpenseEl = document.getElementById('totalExpense');
    const balanceEl = document.getElementById('balance');

    let transactions = [];

    function loadFromStorage() {
        const stored = localStorage.getItem('expenseTrackerData');
        if (stored) {
            try {
                transactions = JSON.parse(stored);
            } catch (e) {
                transactions = [];
            }
        } else {
            transactions = [
                { id: Date.now() - 100000, desc: 'Salary', amount: 45000, type: 'income' },
                { id: Date.now() - 200000, desc: 'Groceries', amount: 3200, type: 'expense' },
                { id: Date.now() - 300000, desc: 'Rent', amount: 12000, type: 'expense' },
                { id: Date.now() - 400000, desc: 'Freelance', amount: 8000, type: 'income' },
            ];
            saveToStorage();
        }
    }

    function saveToStorage() {
        localStorage.setItem('expenseTrackerData', JSON.stringify(transactions));
    }

    function render() {
        if (transactions.length === 0) {
            transactionList.innerHTML = '<p class="empty-msg">No transactions yet. Add one above!</p>';
        } else {
            let html = '';
            const sorted = [...transactions].reverse();
            sorted.forEach(t => {
                const icon = t.type === 'income' ? '📈' : '📉';
                const sign = t.type === 'income' ? '+' : '-';
                const amountClass = t.type === 'income' ? 'income' : 'expense';
                const iconClass = t.type === 'income' ? 'income' : 'expense';
                html += `
                    <div class="transaction-item" data-id="${t.id}">
                        <div class="transaction-info">
                            <div class="transaction-icon ${iconClass}">${icon}</div>
                            <span class="transaction-desc">${escapeHtml(t.desc)}</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:0.8rem;">
                            <span class="transaction-amount ${amountClass}">${sign} ₹ ${formatNumber(t.amount)}</span>
                            <button class="transaction-delete" data-id="${t.id}">✕</button>
                        </div>
                    </div>
                `;
            });
            transactionList.innerHTML = html;

            document.querySelectorAll('.transaction-delete').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    const id = parseInt(this.dataset.id, 10);
                    deleteTransaction(id);
                });
            });
        }

        updateStats();
        saveToStorage();
    }

    function updateStats() {
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === 'income') totalIncome += t.amount;
            else totalExpense += t.amount;
        });

        const balance = totalIncome - totalExpense;

        totalIncomeEl.textContent = '₹ ' + formatNumber(totalIncome);
        totalExpenseEl.textContent = '₹ ' + formatNumber(totalExpense);
        balanceEl.textContent = '₹ ' + formatNumber(balance);

        if (balance > 0) balanceEl.style.color = '#0f973d';
        else if (balance < 0) balanceEl.style.color = '#d92d20';
        else balanceEl.style.color = '#2c6cf0';
    }

    function addTransaction() {
        const desc = descInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const type = typeInput.value;

        if (!desc) {
            alert('Please enter a description.');
            descInput.focus();
            return;
        }

        if (!amount || amount <= 0) {
            alert('Please enter a valid amount.');
            amountInput.focus();
            return;
        }

        const transaction = {
            id: Date.now(),
            desc: desc,
            amount: amount,
            type: type
        };

        transactions.push(transaction);
        render();

        descInput.value = '';
        amountInput.value = '';
        descInput.focus();
    }

    function deleteTransaction(id) {
        if (confirm('Delete this transaction?')) {
            transactions = transactions.filter(t => t.id !== id);
            render();
        }
    }

    function clearAll() {
        if (transactions.length === 0) return;
        if (confirm('Delete ALL transactions? This cannot be undone.')) {
            transactions = [];
            render();
        }
    }

    function formatNumber(num) {
        return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function handleEnter(e) {
        if (e.key === 'Enter') {
            addTransaction();
        }
    }

    addBtn.addEventListener('click', addTransaction);
    clearBtn.addEventListener('click', clearAll);

    descInput.addEventListener('keydown', handleEnter);
    amountInput.addEventListener('keydown', handleEnter);

    loadFromStorage();
    render();

    console.log('📊 Expense Tracker loaded successfully!');
    console.log(`📝 ${transactions.length} transactions loaded.`);

})();