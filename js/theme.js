/**
 * 主题切换模块
 * 管理深浅色主题切换
 */

const Theme = {
    currentTheme: 'light',

    /**
     * 初始化主题
     */
    init() {
        // 从localStorage读取主题设置
        const savedTheme = Storage.load(Storage.KEYS.GLOBAL_THEME);

        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            // 检测系统主题偏好
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.currentTheme = 'dark';
            }
        }

        this.applyTheme(this.currentTheme);
        this.bindEvents();
    },

    /**
     * 应用主题
     * @param {string} theme - 主题名称 'light' | 'dark'
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.updateThemeIcon();

        // 保存到localStorage
        Storage.save(Storage.KEYS.GLOBAL_THEME, theme);
    },

    /**
     * 切换主题
     */
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        Utils.showToast(`已切换到${newTheme === 'light' ? '浅色' : '深色'}主题`, 'success');
    },

    /**
     * 更新主题图标
     */
    updateThemeIcon() {
        const icon = document.getElementById('themeIcon');
        if (icon) {
            icon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        }
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 主题切换按钮
        const themeBtn = document.getElementById('themeBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.toggle());
        }

        // 快捷键: Ctrl/Cmd + Shift + T
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggle();
            }
        });

        // 监听系统主题变化
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // 只有在没有手动设置主题时才跟随系统
                const savedTheme = Storage.load(Storage.KEYS.GLOBAL_THEME);
                if (!savedTheme) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    },

    /**
     * 获取当前主题
     * @returns {string} 当前主题名称
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
};
