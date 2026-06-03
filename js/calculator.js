/**
 * 计算器模块
 * 实现基础计算功能和历史记录
 */

const Calculator = {
    expression: '',
    result: '0',
    history: [],

    /**
     * 初始化计算器
     */
    init() {
        this.loadHistory();
        this.bindEvents();
        this.renderHistory();
    },

    /**
     * 加载历史记录
     */
    loadHistory() {
        this.history = Storage.getCalculatorHistory();
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 计算器按钮点击事件
        const buttons = document.querySelectorAll('.calc-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const value = e.target.dataset.value;
                this.handleInput(value);
            });
        });

        // 键盘输入事件
        document.addEventListener('keydown', (e) => {
            // 只在计算器页面激活时响应
            const panel = document.getElementById('calculator-panel');
            if (!panel.classList.contains('active')) return;

            this.handleKeyboardInput(e);
        });

        // 清空历史按钮
        const clearBtn = document.getElementById('clearCalcHistory');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearHistory());
        }
    },

    /**
     * 处理输入
     * @param {string} value - 输入值
     */
    handleInput(value) {
        if (value === 'C') {
            this.clear();
        } else if (value === '±') {
            this.toggleSign();
        } else if (value === '%') {
            this.percentage();
        } else if (value === '=') {
            this.calculate();
        } else {
            this.appendValue(value);
        }
    },

    /**
     * 处理键盘输入
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyboardInput(e) {
        const key = e.key;

        // 数字和小数点
        if (/^[0-9.]$/.test(key)) {
            this.appendValue(key);
        }
        // 运算符
        else if (['+', '-', '*', '/'].includes(key)) {
            const operator = key === '*' ? '×' : key === '/' ? '÷' : key;
            this.appendValue(operator);
        }
        // 等号或回车
        else if (key === '=' || key === 'Enter') {
            e.preventDefault();
            this.calculate();
        }
        // 退格
        else if (key === 'Backspace') {
            this.backspace();
        }
        // Escape清空
        else if (key === 'Escape') {
            this.clear();
        }
    },

    /**
     * 追加值到表达式
     * @param {string} value - 要追加的值
     */
    appendValue(value) {
        // 防止连续运算符
        const operators = ['+', '-', '×', '÷'];
        if (operators.includes(value) && operators.includes(this.expression.slice(-1))) {
            this.expression = this.expression.slice(0, -1);
        }

        // 防止多个小数点
        if (value === '.') {
            const parts = this.expression.split(/[+\-×÷]/);
            const lastPart = parts[parts.length - 1];
            if (lastPart.includes('.')) return;
        }

        this.expression += value;
        this.updateDisplay();
    },

    /**
     * 计算结果
     */
    calculate() {
        if (!this.expression) return;

        try {
            // 替换显示符号为计算符号
            let calcExpression = this.expression
                .replace(/×/g, '*')
                .replace(/÷/g, '/');

            // 计算结果
            const result = eval(calcExpression);

            // 检查结果是否有效
            if (!isFinite(result)) {
                throw new Error('无效的计算结果');
            }

            // 保存到历史记录
            this.saveToHistory(this.expression, result);

            // 更新显示
            this.result = this.formatResult(result);
            this.expression = '';
            this.updateDisplay();

            // 更新统计
            Storage.updateToolStats('calculator');
        } catch (error) {
            Utils.showToast('计算错误', 'error');
            this.clear();
        }
    },

    /**
     * 格式化结果
     * @param {number} num - 数字
     * @returns {string} 格式化后的字符串
     */
    formatResult(num) {
        // 保留最多8位小数
        const rounded = Math.round(num * 100000000) / 100000000;
        return rounded.toString();
    },

    /**
     * 清空
     */
    clear() {
        this.expression = '';
        this.result = '0';
        this.updateDisplay();
    },

    /**
     * 退格
     */
    backspace() {
        this.expression = this.expression.slice(0, -1);
        this.updateDisplay();
    },

    /**
     * 切换正负号
     */
    toggleSign() {
        if (this.expression) {
            if (this.expression.startsWith('-')) {
                this.expression = this.expression.slice(1);
            } else {
                this.expression = '-' + this.expression;
            }
            this.updateDisplay();
        }
    },

    /**
     * 百分比
     */
    percentage() {
        if (this.expression) {
            try {
                const result = eval(this.expression.replace(/×/g, '*').replace(/÷/g, '/')) / 100;
                this.expression = this.formatResult(result);
                this.updateDisplay();
            } catch (error) {
                Utils.showToast('计算错误', 'error');
            }
        }
    },

    /**
     * 更新显示
     */
    updateDisplay() {
        const expressionEl = document.getElementById('calcExpression');
        const resultEl = document.getElementById('calcResult');

        if (expressionEl) {
            expressionEl.textContent = this.expression;
        }

        if (resultEl) {
            resultEl.textContent = this.result;
        }
    },

    /**
     * 保存到历史记录
     * @param {string} expression - 表达式
     * @param {number} result - 结果
     */
    saveToHistory(expression, result) {
        const historyItem = {
            id: Utils.generateId(),
            expression: expression,
            result: result,
            timestamp: Date.now()
        };

        this.history.push(historyItem);
        Storage.saveCalculatorHistory(this.history);
        this.renderHistory();
    },

    /**
     * 渲染历史记录
     */
    renderHistory() {
        const container = document.getElementById('calcHistoryList');
        if (!container) return;

        if (this.history.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无历史记录</div>';
            return;
        }

        // 倒序显示,最新的在前
        const reversedHistory = [...this.history].reverse();

        container.innerHTML = reversedHistory.map(item => `
            <div class="calc-history-item" data-id="${item.id}">
                <div class="expression">${item.expression}</div>
                <div class="result">= ${item.result}</div>
                <div class="time">${Utils.formatRelativeTime(item.timestamp)}</div>
            </div>
        `).join('');

        // 绑定点击事件
        container.querySelectorAll('.calc-history-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                const historyItem = this.history.find(h => h.id === id);
                if (historyItem) {
                    this.expression = historyItem.expression;
                    this.result = historyItem.result.toString();
                    this.updateDisplay();
                }
            });
        });
    },

    /**
     * 清空历史记录
     */
    clearHistory() {
        if (this.history.length === 0) {
            Utils.showToast('暂无历史记录', 'warning');
            return;
        }

        this.history = [];
        Storage.saveCalculatorHistory(this.history);
        this.renderHistory();
        Utils.showToast('历史记录已清空', 'success');
    }
};
