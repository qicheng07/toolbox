/**
 * 密码生成器模块
 * 实现随机密码生成、强度计算和历史记录
 */

const Password = {
    config: {
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
    },
    history: [],
    currentPassword: '',

    // 字符池定义
    CHAR_POOLS: {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    },

    /**
     * 初始化密码生成器
     */
    init() {
        this.loadConfig();
        this.loadHistory();
        this.bindEvents();
        this.renderHistory();
    },

    /**
     * 加载配置
     */
    loadConfig() {
        const savedConfig = Storage.getPasswordConfig();
        this.config = { ...this.config, ...savedConfig };
        this.updateConfigUI();
    },

    /**
     * 加载历史记录
     */
    loadHistory() {
        this.history = Storage.getPasswordHistory();
    },

    /**
     * 更新配置UI
     */
    updateConfigUI() {
        const lengthSlider = document.getElementById('passwordLength');
        const lengthValue = document.getElementById('lengthValue');
        const uppercase = document.getElementById('uppercase');
        const lowercase = document.getElementById('lowercase');
        const numbers = document.getElementById('numbers');
        const symbols = document.getElementById('symbols');

        if (lengthSlider) lengthSlider.value = this.config.length;
        if (lengthValue) lengthValue.textContent = this.config.length;
        if (uppercase) uppercase.checked = this.config.uppercase;
        if (lowercase) lowercase.checked = this.config.lowercase;
        if (numbers) numbers.checked = this.config.numbers;
        if (symbols) symbols.checked = this.config.symbols;
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 长度滑块
        const lengthSlider = document.getElementById('passwordLength');
        if (lengthSlider) {
            lengthSlider.addEventListener('input', (e) => {
                this.config.length = parseInt(e.target.value);
                document.getElementById('lengthValue').textContent = this.config.length;
                this.saveConfig();
            });
        }

        // 复选框
        ['uppercase', 'lowercase', 'numbers', 'symbols'].forEach(type => {
            const checkbox = document.getElementById(type);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.config[type] = e.target.checked;
                    this.saveConfig();
                });
            }
        });

        // 生成按钮
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generate());
        }

        // 复制按钮
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyPassword());
        }

        // 清空历史按钮
        const clearBtn = document.getElementById('clearPwdHistory');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearHistory());
        }
    },

    /**
     * 保存配置
     */
    saveConfig() {
        Storage.savePasswordConfig(this.config);
    },

    /**
     * 生成密码
     */
    generate() {
        // 验证至少选择一种字符类型
        const { uppercase, lowercase, numbers, symbols } = this.config;
        if (!uppercase && !lowercase && !numbers && !symbols) {
            Utils.showToast('请至少选择一种字符类型', 'warning');
            return;
        }

        // 构建字符池
        let charPool = '';
        const selectedTypes = [];

        if (uppercase) {
            charPool += this.CHAR_POOLS.uppercase;
            selectedTypes.push('uppercase');
        }
        if (lowercase) {
            charPool += this.CHAR_POOLS.lowercase;
            selectedTypes.push('lowercase');
        }
        if (numbers) {
            charPool += this.CHAR_POOLS.numbers;
            selectedTypes.push('numbers');
        }
        if (symbols) {
            charPool += this.CHAR_POOLS.symbols;
            selectedTypes.push('symbols');
        }

        // 生成密码
        let password = '';

        // 确保至少包含每个开启类型各1个字符
        selectedTypes.forEach(type => {
            const pool = this.CHAR_POOLS[type];
            password += pool[this.getRandomInt(0, pool.length - 1)];
        });

        // 填充剩余字符
        const remainingLength = this.config.length - selectedTypes.length;
        for (let i = 0; i < remainingLength; i++) {
            password += charPool[this.getRandomInt(0, charPool.length - 1)];
        }

        // 打乱字符顺序
        password = this.shuffleString(password);

        // 计算强度
        const strength = this.calculateStrength(password, selectedTypes.length);

        // 保存当前密码
        this.currentPassword = password;

        // 显示结果
        this.displayResult(password, strength);

        // 保存到历史
        this.saveToHistory(password, selectedTypes, strength);

        // 更新统计
        Storage.updateToolStats('password');

        Utils.showToast('密码生成成功', 'success');
    },

    /**
     * 获取随机整数
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机整数
     */
    getRandomInt(min, max) {
        // 使用加密随机数生成器
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return min + (array[0] % (max - min + 1));
    },

    /**
     * 打乱字符串
     * @param {string} str - 要打乱的字符串
     * @returns {string} 打乱后的字符串
     */
    shuffleString(str) {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = this.getRandomInt(0, i);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    },

    /**
     * 计算密码强度
     * @param {string} password - 密码
     * @param {number} typeCount - 字符类型数量
     * @returns {string} 强度等级 'weak' | 'medium' | 'strong'
     */
    calculateStrength(password, typeCount) {
        const length = password.length;

        // 弱: 长度<12 或 仅包含1种字符类型
        if (length < 12 || typeCount === 1) {
            return 'weak';
        }

        // 强: 长度>16 且 包含4种字符类型
        if (length > 16 && typeCount === 4) {
            return 'strong';
        }

        // 中: 其他情况
        return 'medium';
    },

    /**
     * 显示生成结果
     * @param {string} password - 密码
     * @param {string} strength - 强度
     */
    displayResult(password, strength) {
        const resultEl = document.getElementById('passwordResult');
        const strengthEl = document.getElementById('strengthIndicator');
        const copyBtn = document.getElementById('copyBtn');

        if (resultEl) {
            resultEl.textContent = password;
        }

        if (strengthEl) {
            const strengthText = {
                weak: '弱',
                medium: '中',
                strong: '强'
            };
            strengthEl.textContent = strengthText[strength];
            strengthEl.className = `strength-indicator ${strength}`;
        }

        if (copyBtn) {
            copyBtn.style.display = 'block';
        }
    },

    /**
     * 复制密码
     */
    async copyPassword() {
        if (!this.currentPassword) {
            Utils.showToast('请先生成密码', 'warning');
            return;
        }

        const success = await Utils.copyToClipboard(this.currentPassword);
        if (success) {
            Utils.showToast('密码已复制到剪贴板', 'success');
        } else {
            Utils.showToast('复制失败,请手动复制', 'error');
        }
    },

    /**
     * 保存到历史记录
     * @param {string} password - 密码
     * @param {Array} types - 字符类型数组
     * @param {string} strength - 强度
     */
    saveToHistory(password, types, strength) {
        const historyItem = {
            id: Utils.generateId(),
            password: password,
            config: {
                length: this.config.length,
                types: types
            },
            strength: strength,
            timestamp: Date.now()
        };

        this.history.push(historyItem);
        Storage.savePasswordHistory(this.history);
        this.renderHistory();
    },

    /**
     * 渲染历史记录
     */
    renderHistory() {
        const container = document.getElementById('pwdHistoryList');
        if (!container) return;

        if (this.history.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无历史记录</div>';
            return;
        }

        // 倒序显示,最新的在前
        const reversedHistory = [...this.history].reverse();

        container.innerHTML = reversedHistory.map(item => `
            <div class="pwd-history-item" data-id="${item.id}">
                <div class="password-text">${item.password}</div>
                <div class="password-meta">
                    <span>${Utils.formatRelativeTime(item.timestamp)}</span>
                    <span class="strength-indicator ${item.strength}">${{
                        weak: '弱', medium: '中', strong: '强'
                    }[item.strength]}</span>
                    <button class="copy-history-btn">复制</button>
                </div>
            </div>
        `).join('');

        // 绑定复制事件
        container.querySelectorAll('.copy-history-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const item = e.target.closest('.pwd-history-item');
                const password = item.querySelector('.password-text').textContent;
                const success = await Utils.copyToClipboard(password);
                if (success) {
                    Utils.showToast('密码已复制', 'success');
                } else {
                    Utils.showToast('复制失败', 'error');
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
        Storage.savePasswordHistory(this.history);
        this.renderHistory();
        Utils.showToast('历史记录已清空', 'success');
    }
};
