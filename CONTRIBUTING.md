# 贡献指南 (Contributing Guide)

感谢你对 **老T-Writer-OS** 感兴趣！我们需要你的帮助来让这个项目变得更好。

## 🤝 如何参与贡献

### 1. 提交 Issue (Report Bugs or Request Features)
- **Bug 反馈**: 如果你发现了 Bug，请先搜索现有的 Issues，确保没有重复。如果没有，请创建一个新的 Issue，并详细描述复现步骤。
- **功能建议**: 如果你有新的想法，欢迎提交 Feature Request。

### 2. 提交代码 (Pull Requests)
如果你想修复 Bug 或贡献新功能，请遵循以下流程：

1.  **Fork** 本仓库到你的 GitHub 账号。
2.  **Clone** 到本地：
    ```bash
    git clone https://github.com/your-username/laot-writer-os.git
    ```
3.  创建新的分支 (Branch)：
    ```bash
    git checkout -b feat/my-new-feature
    ```
4.  提交你的修改 (Commit)：
    ```bash
    git commit -m 'feat: 添加了B站文案生成模板'
    ```
    > **注意**: 请遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。
5.  推送到你的远程仓库 (Push)：
    ```bash
    git push origin feat/my-new-feature
    ```
6.  在 GitHub 上发起 **Pull Request** 到 `main` 分支。

## 💻 开发环境设置

1.  确保安装 Node.js (v14+)
2.  安装依赖（如果有的话，目前主要是原生模块，无需 npm install）
3.  运行测试指令确保环境正常：
    ```bash
    node skills/setup_wizard.js --help
    ```

## 📐 代码风格
- JS 代码请保持简洁，尽量使用 ES6+ 语法。
- Markdown 模板请遵循现有的结构（Role -> 任务 -> 要求）。

## 🛡️ 安全漏洞
如果你发现了安全漏洞，请不要直接提交 Issue，请发送邮件至 (你的邮箱) 或通过私信联系。

感谢你的每一份贡献！❤️
