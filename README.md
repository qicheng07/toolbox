# 多功能工具箱

一个轻量级的 Web 应用,提供计算器、待办清单、密码生成器等实用工具集合。

## 项目简介

多功能工具箱是一个基于原生 HTML/CSS/JavaScript 开发的单页应用,旨在为用户提供便捷的在线工具集合。项目采用模块化设计,代码结构清晰,易于维护和扩展。

### 主要特性

- 纯前端实现,无需后端支持
- 数据本地持久化存储
- 支持深浅色主题切换
- 移动端友好,响应式设计
- 支持 GitHub Pages 部署

## 功能清单

### 1. 计算器

- 基础四则运算(加减乘除)
- 百分比计算
- 正负号切换
- 计算历史记录(最近20条)
- 支持键盘输入
- 点击历史记录快速填充

### 2. 待办清单

- 添加/删除/完成任务
- 任务优先级设置(高/中/低)
- 任务筛选(全部/未完成/已完成)
- 任务完成率统计
- 数据持久化存储

### 3. 密码生成器

- 可调节密码长度(8-32位)
- 自定义字符类型(大小写字母、数字、特殊符号)
- 密码强度指示(弱/中/强)
- 一键复制功能
- 历史记录(最近10条)
- 使用加密随机数生成

### 4. 关于我

- 个人信息展示
- 技能标签云
- 项目经历时间轴
- 联系方式链接

### 5. 数据管理

- 全局数据导出(JSON格式备份)
- 数据导入恢复
- 使用统计面板
- 最近使用记录

### 6. 主题切换

- 深色/浅色主题
- 跟随系统主题
- 快捷键切换(Ctrl/Cmd + Shift + T)
- 主题状态持久化

## 技术栈

- **前端**: 原生 HTML5 / CSS3 / JavaScript (ES6+)
- **存储**: localStorage
- **部署**: GitHub Pages

## 项目结构

```
toolbox/
├── index.html              # 主HTML文件
├── css/
│   ├── base.css           # 基础样式、变量、重置
│   ├── theme.css          # 主题相关样式
│   ├── components.css     # 通用组件样式
│   ├── calculator.css     # 计算器样式
│   ├── todo.css           # 待办清单样式
│   ├── password.css       # 密码生成器样式
│   ├── about.css          # 关于我页面样式
│   └── responsive.css     # 响应式样式
├── js/
│   ├── utils.js           # 工具函数
│   ├── storage.js         # 数据持久化模块
│   ├── theme.js           # 主题切换模块
│   ├── calculator.js      # 计算器模块
│   ├── todo.js            # 待办清单模块
│   ├── password.js        # 密码生成器模块
│   ├── stats.js           # 统计面板模块
│   └── main.js            # 主入口文件
├── docs/
│   └── PRD.md             # 产品需求文档
└── README.md              # 项目说明文档
```

## 快速开始

### 本地运行

1. 克隆项目到本地

```bash
git clone https://github.com/your-username/toolbox.git
cd toolbox
```

2. 使用本地服务器打开

可以使用 VS Code 的 Live Server 插件,或者使用 Python 的简单服务器:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

3. 在浏览器中访问 `http://localhost:8000`

### 部署到 GitHub Pages

1. 将代码推送到 GitHub 仓库

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. 在 GitHub 仓库设置中启用 GitHub Pages
   - 进入仓库的 Settings 页面
   - 找到 Pages 选项
   - Source 选择 `main` 分支
   - 点击 Save

3. 等待几分钟后,访问 `https://your-username.github.io/toolbox/`

## 数据存储说明

应用使用 localStorage 进行数据持久化,存储键名如下:

| 键名 | 用途 | 数据类型 |
|------|------|---------|
| `toolbox_global_theme` | 全局主题设置 | string |
| `toolbox_global_stats` | 全局统计数据 | object |
| `toolbox_calculator_history` | 计算器历史记录 | array |
| `toolbox_todo_tasks` | 待办任务列表 | array |
| `toolbox_password_config` | 密码生成器配置 | object |
| `toolbox_password_history` | 密码生成历史 | array |
| `toolbox_recent_used` | 最近使用记录 | array |

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge
- 移动端浏览器

## 开发规范

### 代码规范

- 遵循 Airbnb JavaScript Style Guide
- 使用 ESLint 进行代码检查
- 每个文件不超过 300 行代码
- 函数单一职责,不超过 30 行

### 命名规范

- 变量/函数: camelCase
- 类/组件: PascalCase
- 常量: SCREAMING_SNAKE_CASE
- CSS 类名: kebab-case

### Git 提交规范

使用语义化提交信息:

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

## 性能优化

- 使用 CSS 变量实现主题切换,减少重绘
- 事件委托减少事件监听器数量
- 防抖/节流处理频繁操作
- 懒加载非关键资源
- 最小化 DOM 操作

## 安全性

- 密码生成使用 `crypto.getRandomValues()` 加密随机数
- XSS 防护: 转义用户输入
- localStorage 不存储敏感信息
- 外部链接使用 `rel="noopener noreferrer"`

## 后续规划

- [ ] 添加更多实用工具
- [ ] 支持多语言
- [ ] 添加 PWA 支持
- [ ] 数据云同步
- [ ] 更多主题选择

## 作者

前端开发者 - [GitHub](https://github.com)

## 许可证

MIT License

---

**感谢使用多功能工具箱!** 如有问题或建议,欢迎提 Issue 或 PR。