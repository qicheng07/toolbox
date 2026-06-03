/**
 * 统计面板模块
 * 显示各工具的使用统计数据
 */

const Stats = {
    /**
     * 初始化统计面板
     */
    init() {
        this.bindEvents();
        this.updateStats();
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 打开统计面板
        const statsBtn = document.getElementById('statsBtn');
        if (statsBtn) {
            statsBtn.addEventListener('click', () => this.openPanel());
        }

        // 关闭统计面板
        const closeBtn = document.getElementById('closeStatsBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closePanel());
        }

        // 点击遮罩关闭
        const panel = document.getElementById('statsPanel');
        if (panel) {
            panel.addEventListener('click', (e) => {
                if (e.target === panel) {
                    this.closePanel();
                }
            });
        }

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePanel();
            }
        });
    },

    /**
     * 打开统计面板
     */
    openPanel() {
        const panel = document.getElementById('statsPanel');
        if (panel) {
            panel.classList.add('active');
            this.updateStats();
        }
    },

    /**
     * 关闭统计面板
     */
    closePanel() {
        const panel = document.getElementById('statsPanel');
        if (panel) {
            panel.classList.remove('active');
        }
    },

    /**
     * 更新统计数据
     */
    updateStats() {
        const stats = Storage.getStats();
        const tasks = Storage.getTodoTasks();

        // 计算器使用次数
        const calcUseCountEl = document.getElementById('calcUseCount');
        if (calcUseCountEl) {
            calcUseCountEl.textContent = stats.calculator?.useCount || 0;
        }

        // 待办任务总数
        const totalTaskCountEl = document.getElementById('totalTaskCount');
        if (totalTaskCountEl) {
            totalTaskCountEl.textContent = tasks.length;
        }

        // 待办完成率
        const completedTasks = tasks.filter(t => t.completed).length;
        const totalTasks = tasks.length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const taskCompletionRateEl = document.getElementById('taskCompletionRate');
        if (taskCompletionRateEl) {
            taskCompletionRateEl.textContent = `${completionRate}%`;
        }

        const progressFillEl = document.getElementById('taskProgressFill');
        if (progressFillEl) {
            progressFillEl.style.width = `${completionRate}%`;
        }

        // 密码生成次数
        const pwdGenCountEl = document.getElementById('pwdGenCount');
        if (pwdGenCountEl) {
            pwdGenCountEl.textContent = stats.password?.useCount || 0;
        }
    },

    /**
     * 获取最常用的工具
     * @returns {string} 工具名称
     */
    getMostUsedTool() {
        const stats = Storage.getStats();
        const tools = [
            { name: 'calculator', count: stats.calculator?.useCount || 0 },
            { name: 'todo', count: stats.todo?.useCount || 0 },
            { name: 'password', count: stats.password?.useCount || 0 }
        ];

        tools.sort((a, b) => b.count - a.count);
        return tools[0].count > 0 ? tools[0].name : null;
    }
};
