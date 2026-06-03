/**
 * 主入口文件
 * 初始化所有模块和处理全局事件
 */

const App = {
    currentTab: 'calculator',

    /**
     * 应用初始化
     */
    init() {
        // 初始化各模块
        Theme.init();
        Calculator.init();
        Todo.init();
        Password.init();
        Stats.init();

        // 绑定全局事件
        this.bindEvents();

        // 初始化最近使用记录
        this.initRecentUsed();

        console.log('多功能工具箱已初始化');
    },

    /**
     * 绑定全局事件
     */
    bindEvents() {
        // Tab切换
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // 导出按钮
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.openExportModal());
        }

        // 关闭导出模态框
        const closeExportModal = document.getElementById('closeExportModal');
        if (closeExportModal) {
            closeExportModal.addEventListener('click', () => this.closeExportModal());
        }

        // 导出数据按钮
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => this.exportData());
        }

        // 导入数据按钮
        const importDataBtn = document.getElementById('importDataBtn');
        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => {
                const fileInput = document.getElementById('importFile');
                if (fileInput) {
                    fileInput.click();
                }
            });
        }

        // 文件选择
        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.addEventListener('change', (e) => this.importData(e));
        }

        // 点击模态框外部关闭
        const modal = document.getElementById('exportModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeExportModal();
                }
            });
        }

        // ESC关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeExportModal();
            }
        });
    },

    /**
     * 切换Tab
     * @param {string} tab - Tab名称
     */
    switchTab(tab) {
        // 更新按钮状态
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // 更新面板显示
        const panels = document.querySelectorAll('.tab-panel');
        panels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tab}-panel`);
        });

        // 更新当前Tab
        this.currentTab = tab;

        // 更新最近使用记录
        Storage.updateRecentUsed(tab);

        // 更新统计数据
        Stats.updateStats();
    },

    /**
     * 初始化最近使用记录
     */
    initRecentUsed() {
        // 如果没有记录,添加默认记录
        const recent = Storage.getRecentUsed();
        if (recent.length === 0) {
            Storage.updateRecentUsed('calculator');
        }
    },

    /**
     * 打开导出模态框
     */
    openExportModal() {
        const modal = document.getElementById('exportModal');
        if (modal) {
            modal.classList.add('active');
        }
    },

    /**
     * 关闭导出模态框
     */
    closeExportModal() {
        const modal = document.getElementById('exportModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * 导出数据
     */
    exportData() {
        try {
            const data = Storage.exportAllData();
            const jsonStr = JSON.stringify(data, null, 2);

            // 生成文件名
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
            const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
            const filename = `toolbox_backup_${dateStr}_${timeStr}.json`;

            // 下载文件
            Utils.downloadFile(jsonStr, filename);

            Utils.showToast('数据导出成功', 'success');
            this.closeExportModal();
        } catch (error) {
            console.error('导出失败:', error);
            Utils.showToast('数据导出失败', 'error');
        }
    },

    /**
     * 导入数据
     * @param {Event} e - 文件选择事件
     */
    async importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const content = await Utils.readFile(file);
            const data = JSON.parse(content);

            // 验证数据格式
            if (!data.version || !data.data) {
                throw new Error('数据格式不正确');
            }

            // 导入数据(使用覆盖模式)
            const success = Storage.importData(data, 'overwrite');

            if (success) {
                Utils.showToast('数据导入成功,页面将刷新', 'success');

                // 刷新页面以应用新数据
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                throw new Error('数据导入失败');
            }
        } catch (error) {
            console.error('导入失败:', error);
            Utils.showToast('数据导入失败,请检查文件格式', 'error');
        }

        // 清空文件选择
        e.target.value = '';
    }
};

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
