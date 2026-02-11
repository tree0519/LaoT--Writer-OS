# 指令手册 (Command Manual)

本手册详细介绍了 **老T-Writer-OS** 的所有可用指令及其参数。

> **注意**: 所有指令均以 `/` 开头。如果在执行时看到 `Unknown skill` 错误，请忽略并继续等待执行结果。

---

## 0. 核心配置指令

### `/init-profile`
**功能**: 启动交互式初始化向导。
**适用场景**: 首次使用，或者想重新创建一个新的人设。
**执行逻辑**:
1. 运行 `node skills/setup_wizard.js`。
2. 依次询问笔名、核心身份、写作风格、背景故事。
3. 询问需要启用的平台（如知乎、小红书等）。
4. 生成 `config/source_persona.json` 配置文件。
5. 根据 `templates/` 下的骨架模板，自动生成 `agents/` 下的具体平台人设 Prompt。

### `/init-from-history [dir_path]`
**功能**: 基于历史文章自动分析并生成人设。
**参数**:
- `dir_path`: 包含 Markdown 文章的目录路径（例如 `./my_articles/`）。
**适用场景**: 你已经有一批写好的文章，想让 AI 模仿你的风格。
**详细使用步骤**:
1.  准备一个目录，里面放入你过去写的几篇代表作（必须是 `.md` 格式）。
2.  运行指令 `/init-from-history [目录路径]`。
3.  脚本会自动读取该目录下的文章内容。
4.  分析你的平均句长（判断长短句偏好）、标点符号使用率（判断语气强烈程度）、是否喜欢用 Emoji。
5.  自动推断出一个初步的人设（风格关键词），并保存到 `config/source_persona.json`。
6.  **注意**: 自动分析只能提取“文风”特征。具体的身份背景（如“我是个程序员”）无法精准推断，建议分析完成后，手动修改 `config/source_persona.json` 进行补充。

---

## 1. 写作与分发指令

### `/write-draft [topic]`
**功能**: 生成一篇**通用风格**的文章草稿。
**参数**:
- `topic`: 文章选题或标题（建议用引号包裹，如 `"为什么程序员要尽早做副业"`）。
**适用场景**: 只有选题灵感，还没想好发哪个平台，先写一篇底稿。
**输出**: `drafts/generic/YYYYMMDD_[Topic].md`
**特点**:
- 不带特定平台风格（如“谢邀”、“家人们”）。
- 侧重于观点输出、逻辑构建和素材填充。

### `/adapt-article [source_file] [platform] [instruction?]`
**功能**: 将现有的草稿改编为特定平台的风格。
**参数**:
- `source_file`: 源文件路径（例如 `drafts/generic/20260210_test.md`）。
- `platform`: 目标平台代码（必须在 `config/platform_registry.json` 中定义，如 `xiaohongshu`, `zhihu`）。
- `instruction` (可选): 额外的改编指令（例如 `"语气再犀利一点"`, `"多加点emoji"`）。
**输出**: `drafts/[platform]/YYYYMMDD_[Topic].md`

### `/write-article [topic] [platform?]`
**功能**: 全自动一键分发。
**参数**:
- `topic`: 文章选题。
- `platform` (可选): 指定分发平台。如果不填，默认分发到所有已启用的平台。
**执行逻辑**:
1. 自动调用 `/write-draft` 生成通用底稿。
2. 自动调用 `/adapt-article` 将底稿分发到目标平台。

---

## 2. 贴吧连载指令

### `/continue-thread [series_id?]`
**功能**: 贴吧模式专用，读取上一楼内容进行续写（盖楼）。
**参数**:
- `series_id` (可选): 连载系列的标识符。如果不填，默认查找最近一次编辑的贴吧草稿。
**适用场景**: 写长篇故事、连载小说、直播贴。
**执行逻辑**:
1. 读取 `drafts/tieba/` 下该系列的上一篇草稿。
2. 提取 `<!-- MEMORY_START -->` 块中的剧情摘要和情绪状态。
3. 生成新的楼层内容，并更新摘要。

---

## 3. 辅助工具指令

### `/render-images [file_path]`
**功能**: 扫描文章中的图片占位符，生成真实的图片链接。
**参数**:
- `file_path`: 需要处理的 Markdown 文件路径。
**执行逻辑**:
1. 扫描文件中形如 `![IMAGE_GEN: 一个程序员在敲代码]` 的占位符。
2. 根据 `config/image_styles.json` 中定义的平台风格，拼接提示词。
3. (模拟) 调用生图 API，返回图片 URL。
4. 替换原文中的占位符为真实图片链接。

### `/check-draft [file_path]`
**功能**: 检查文章的“含 AI 量”。
**参数**:
- `file_path`: 需要检查的文件路径。
**执行逻辑**:
1. 运行 `node skills/anti_ai_check.js [file_path]`。
2. 扫描是否存在“综上所述”、“不可否认”、“总之”等 AI 常用连接词。
3. 输出检查报告和修改建议。

### `/analyze-style`
**功能**: 运行风格分析脚本，查看当前的人设画像。
**执行逻辑**:
1. 运行 `node skills/analyze_style.js`。
2. 读取 `memory/` 下最近生成的文章。
3. 输出当前的句长、语气、常用词分析结果。
