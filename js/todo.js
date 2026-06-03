/**
 * 待办清单模块
 * 实现任务的增删改查和状态管理
 */

const Todo = {
    tasks: [],
    currentFilter: 'all',

    /**
     * 初始化待办清单
     */
    init() {
        this.loadTasks();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    },

    /**
     * 加载任务列表
     */
    loadTasks() {
        this.tasks = Storage.getTodoTasks();
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 添加任务按钮
        const addBtn = document.getElementById('addTaskBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addTask());
        }

        // 输入框回车事件
        const input = document.getElementById('taskInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addTask();
                }
            });
        }

        // 筛选按钮
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.setFilter(filter);
            });
        });
    },

    /**
     * 添加任务
     */
    addTask() {
        const input = document.getElementById('taskInput');
        const prioritySelect = document.getElementById('prioritySelect');

        if (!input) return;

        const content = input.value.trim();
        if (!content) {
            Utils.showToast('请输入任务内容', 'warning');
            input.focus();
            return;
        }

        const task = {
            id: Utils.generateId(),
            content: content,
            completed: false,
            createdAt: Date.now(),
            completedAt: null,
            priority: prioritySelect ? prioritySelect.value : 'medium'
        };

        this.tasks.push(task);
        Storage.saveTodoTasks(this.tasks);

        // 清空输入框
        input.value = '';
        input.focus();

        // 重新渲染
        this.renderTasks();
        this.updateStats();

        // 更新统计
        Storage.updateToolStats('todo');

        Utils.showToast('任务添加成功', 'success');
    },

    /**
     * 删除任务
     * @param {string} id - 任务ID
     */
    deleteTask(id) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            this.tasks.splice(index, 1);
            Storage.saveTodoTasks(this.tasks);
            this.renderTasks();
            this.updateStats();
            Utils.showToast('任务已删除', 'success');
        }
    },

    /**
     * 切换任务完成状态
     * @param {string} id - 任务ID
     */
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? Date.now() : null;
            Storage.saveTodoTasks(this.tasks);
            this.renderTasks();
            this.updateStats();

            // 更新统计
            Storage.updateToolStats('todo');
        }
    },

    /**
     * 设置筛选条件
     * @param {string} filter - 筛选条件 'all' | 'active' | 'completed'
     */
    setFilter(filter) {
        this.currentFilter = filter;

        // 更新按钮状态
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.renderTasks();
    },

    /**
     * 获取筛选后的任务列表
     * @returns {Array} 筛选后的任务数组
     */
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            case 'all':
            default:
                return this.tasks;
        }
    },

    /**
     * 渲染任务列表
     */
    renderTasks() {
        const container = document.getElementById('taskList');
        if (!container) return;

        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            const emptyText = this.currentFilter === 'all'
                ? '暂无待办任务'
                : this.currentFilter === 'active'
                    ? '暂无未完成任务'
                    : '暂无已完成任务';
            container.innerHTML = `<div class="empty-state">${emptyText}</div>`;
            return;
        }

        // 按创建时间倒序排列
        const sortedTasks = [...filteredTasks].sort((a, b) => b.createdAt - a.createdAt);

        container.innerHTML = sortedTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-content">${this.escapeHtml(task.content)}</div>
                <span class="priority-tag ${task.priority}">${this.getPriorityText(task.priority)}</span>
                <div class="task-actions">
                    <button class="task-action-btn delete" title="删除">🗑️</button>
                </div>
            </div>
        `).join('');

        // 绑定事件
        container.querySelectorAll('.task-item').forEach(item => {
            const id = item.dataset.id;

            // 复选框点击
            const checkbox = item.querySelector('.task-checkbox');
            checkbox.addEventListener('change', () => this.toggleTask(id));

            // 删除按钮点击
            const deleteBtn = item.querySelector('.task-action-btn.delete');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTask(id);
            });
        });
    },

    /**
     * 更新统计信息
     */
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        // 更新页面显示
        const taskCountEl = document.getElementById('taskCount');
        const completedCountEl = document.getElementById('completedCount');

        if (taskCountEl) {
            taskCountEl.textContent = `总计: ${total} 项任务`;
        }

        if (completedCountEl) {
            completedCountEl.textContent = `已完成: ${completed} 项`;
        }

        // 更新全局统计中的完成率
        const stats = Storage.getStats();
        stats.todo.completedRate = rate / 100;
        Storage.save(Storage.KEYS.GLOBAL_STATS, stats);
    },

    /**
     * 获取优先级文本
     * @param {string} priority - 优先级
     * @returns {string} 优先级文本
     */
    getPriorityText(priority) {
        const map = {
            high: '高',
            medium: '中',
            low: '低'
        };
        return map[priority] || '中';
    },

    /**
     * HTML转义
     * @param {string} text - 要转义的文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
