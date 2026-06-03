/**
 * 数据持久化模块
 * 统一管理localStorage存储
 */

const Storage = {
    // 存储键名常量
    KEYS: {
        GLOBAL_THEME: 'toolbox_global_theme',
        GLOBAL_STATS: 'toolbox_global_stats',
        CALCULATOR_HISTORY: 'toolbox_calculator_history',
        TODO_TASKS: 'toolbox_todo_tasks',
        PASSWORD_CONFIG: 'toolbox_password_config',
        PASSWORD_HISTORY: 'toolbox_password_history',
        RECENT_USED: 'toolbox_recent_used'
    },

    /**
     * 保存数据到localStorage
     * @param {string} key - 存储键名
     * @param {any} data - 要存储的数据
     */
    save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
        } catch (error) {
            console.error(`保存数据失败 [${key}]:`, error);
            Utils.showToast('数据保存失败', 'error');
        }
    },

    /**
     * 从localStorage读取数据
     * @param {string} key - 存储键名
     * @param {any} defaultValue - 默认值
     * @returns {any} 读取的数据
     */
    load(key, defaultValue = null) {
        try {
            const serialized = localStorage.getItem(key);
            if (serialized === null) {
                return defaultValue;
            }
            return JSON.parse(serialized);
        } catch (error) {
            console.error(`读取数据失败 [${key}]:`, error);
            return defaultValue;
        }
    },

    /**
     * 删除localStorage中的数据
     * @param {string} key - 存储键名
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`删除数据失败 [${key}]:`, error);
        }
    },

    /**
     * 清空所有应用数据
     */
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            this.remove(key);
        });
    },

    /**
     * 获取全局统计数据
     * @returns {Object} 统计数据
     */
    getStats() {
        return this.load(this.KEYS.GLOBAL_STATS, {
            calculator: { useCount: 0, lastUsed: null },
            todo: { useCount: 0, lastUsed: null, completedRate: 0 },
            password: { useCount: 0, lastUsed: null }
        });
    },

    /**
     * 更新工具使用统计
     * @param {string} tool - 工具名称 'calculator' | 'todo' | 'password'
     */
    updateToolStats(tool) {
        const stats = this.getStats();
        if (stats[tool]) {
            stats[tool].useCount = (stats[tool].useCount || 0) + 1;
            stats[tool].lastUsed = new Date().toISOString();
            this.save(this.KEYS.GLOBAL_STATS, stats);
        }
    },

    /**
     * 获取计算器历史记录
     * @returns {Array} 历史记录数组
     */
    getCalculatorHistory() {
        return this.load(this.KEYS.CALCULATOR_HISTORY, []);
    },

    /**
     * 保存计算器历史记录
     * @param {Array} history - 历史记录数组
     */
    saveCalculatorHistory(history) {
        // 最多保留20条记录
        const limitedHistory = history.slice(-20);
        this.save(this.KEYS.CALCULATOR_HISTORY, limitedHistory);
    },

    /**
     * 获取待办任务列表
     * @returns {Array} 任务列表
     */
    getTodoTasks() {
        return this.load(this.KEYS.TODO_TASKS, []);
    },

    /**
     * 保存待办任务列表
     * @param {Array} tasks - 任务列表
     */
    saveTodoTasks(tasks) {
        this.save(this.KEYS.TODO_TASKS, tasks);
    },

    /**
     * 获取密码生成器配置
     * @returns {Object} 配置对象
     */
    getPasswordConfig() {
        return this.load(this.KEYS.PASSWORD_CONFIG, {
            length: 16,
            uppercase: true,
            lowercase: true,
            numbers: true,
            symbols: true
        });
    },

    /**
     * 保存密码生成器配置
     * @param {Object} config - 配置对象
     */
    savePasswordConfig(config) {
        this.save(this.KEYS.PASSWORD_CONFIG, config);
    },

    /**
     * 获取密码生成历史
     * @returns {Array} 历史记录数组
     */
    getPasswordHistory() {
        return this.load(this.KEYS.PASSWORD_HISTORY, []);
    },

    /**
     * 保存密码生成历史
     * @param {Array} history - 历史记录数组
     */
    savePasswordHistory(history) {
        // 最多保留10条记录
        const limitedHistory = history.slice(-10);
        this.save(this.KEYS.PASSWORD_HISTORY, limitedHistory);
    },

    /**
     * 获取最近使用的工具列表
     * @returns {Array} 工具列表
     */
    getRecentUsed() {
        return this.load(this.KEYS.RECENT_USED, []);
    },

    /**
     * 更新最近使用的工具
     * @param {string} tool - 工具名称
     */
    updateRecentUsed(tool) {
        let recent = this.getRecentUsed();
        // 移除重复项
        recent = recent.filter(item => item !== tool);
        // 添加到开头
        recent.unshift(tool);
        // 最多保留5个
        recent = recent.slice(0, 5);
        this.save(this.KEYS.RECENT_USED, recent);
    },

    /**
     * 导出所有数据
     * @returns {Object} 完整数据对象
     */
    exportAllData() {
        const now = new Date();
        const timestamp = now.toISOString();

        return {
            version: '3.0',
            exportTime: timestamp,
            appInfo: {
                name: '多功能工具箱',
                version: '3.0.0'
            },
            data: {
                global: {
                    theme: this.load(this.KEYS.GLOBAL_THEME, 'light'),
                    stats: this.getStats(),
                    recentUsed: this.getRecentUsed()
                },
                calculator: {
                    history: this.getCalculatorHistory()
                },
                todo: {
                    tasks: this.getTodoTasks()
                },
                password: {
                    config: this.getPasswordConfig(),
                    history: this.getPasswordHistory()
                }
            }
        };
    },

    /**
     * 导入数据
     * @param {Object} data - 要导入的数据
     * @param {string} mode - 导入模式 'overwrite' | 'merge'
     * @returns {boolean} 是否成功
     */
    importData(data, mode = 'overwrite') {
        try {
            // 验证数据格式
            if (!data.version || !data.data) {
                throw new Error('数据格式不正确');
            }

            if (mode === 'overwrite') {
                // 覆盖模式:清空现有数据
                this.clearAll();
            }

            // 导入全局数据
            if (data.data.global) {
                if (data.data.global.theme) {
                    this.save(this.KEYS.GLOBAL_THEME, data.data.global.theme);
                }
                if (data.data.global.stats) {
                    this.save(this.KEYS.GLOBAL_STATS, data.data.global.stats);
                }
                if (data.data.global.recentUsed) {
                    this.save(this.KEYS.RECENT_USED, data.data.global.recentUsed);
                }
            }

            // 导入计算器数据
            if (data.data.calculator && data.data.calculator.history) {
                if (mode === 'merge') {
                    const existing = this.getCalculatorHistory();
                    const merged = [...existing, ...data.data.calculator.history];
                    const unique = merged.filter((item, index, self) =>
                        index === self.findIndex(t => t.id === item.id)
                    );
                    this.saveCalculatorHistory(unique);
                } else {
                    this.saveCalculatorHistory(data.data.calculator.history);
                }
            }

            // 导入待办数据
            if (data.data.todo && data.data.todo.tasks) {
                if (mode === 'merge') {
                    const existing = this.getTodoTasks();
                    const merged = [...existing, ...data.data.todo.tasks];
                    const unique = merged.filter((item, index, self) =>
                        index === self.findIndex(t => t.id === item.id)
                    );
                    this.saveTodoTasks(unique);
                } else {
                    this.saveTodoTasks(data.data.todo.tasks);
                }
            }

            // 导入密码生成器数据
            if (data.data.password) {
                if (data.data.password.config) {
                    this.savePasswordConfig(data.data.password.config);
                }
                if (data.data.password.history) {
                    if (mode === 'merge') {
                        const existing = this.getPasswordHistory();
                        const merged = [...existing, ...data.data.password.history];
                        const unique = merged.filter((item, index, self) =>
                            index === self.findIndex(t => t.id === item.id)
                        );
                        this.savePasswordHistory(unique);
                    } else {
                        this.savePasswordHistory(data.data.password.history);
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }
};
