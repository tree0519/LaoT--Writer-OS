# 快速开始 (Quick Start)

本指南将帮助你从零开始，在 5 分钟内完成环境配置，并生成第一篇个性化文章。

---

## 1. 准备工作

确保你的电脑上已经安装了：
- **Node.js** (v14 或更高版本)
- **Git**
- 一个好用的终端 (VS Code Terminal, iTerm2, cmd 等)

---

## 2. 初始化人设 (必选)

在开始写作之前，系统需要知道“你是谁”。这里有两种方式：

### 方式 A：我是新手 (交互式向导)

如果你还没有任何历史文章，推荐使用此方式。

1.  在项目根目录下打开终端。
2.  输入指令：
    ```bash
    /init-profile
    ```
    *(注：如果你的终端不支持 `/` 开头指令，请运行 `node skills/setup_wizard.js`)*

3.  跟随屏幕提示操作：
    - **笔名**: 建议输入 `独立开发老T` (或你自己的昵称)。
    - **核心身份**: 例如 `全栈工程师`、`创业者`、`产品经理`。
    - **写作风格**: 例如 `犀利`、`干货`、`幽默`、`拒绝说教`。
    - **启用平台**: 直接回车启用所有平台，或输入 `xiaohongshu, zhihu` 指定平台。

4.  完成后，系统会自动生成 `agents/` 目录下的配置文件。

### 方式 B：我是老手 (历史文章克隆)

如果你有一堆已经写好的 Markdown 文章，让系统自动学习你的风格。

1.  准备一个文件夹，放入你的 Markdown 文章（例如 `./my_articles/`）。
2.  输入指令：
    ```bash
    /init-from-history ./my_articles/
    ```
    *(注：实际执行 `node skills/setup_wizard.js analyze ./my_articles/`)*

3.  系统会分析你的用词习惯、句长分布，自动提取人设。

---

## 3. 撰写第一篇文章

现在，让我们来写一篇关于“副业”的文章。

### 步骤 1：生成通用底稿

先写一篇不带平台属性的草稿，把核心观点立住。

```bash
/write-draft "为什么技术栈太杂反而不好找工作"
```

执行后，你会看到类似这样的输出：
> ✅ 通用草稿已生成: drafts/generic/20260210_tech_stack.md

打开这个文件，检查内容是否符合你的预期。你可以在这里手动修改观点或补充案例。

### 步骤 2：一键分发

将底稿改编分发到所有平台：

```bash
/write-article "为什么技术栈太杂反而不好找工作"
```
或者手动指定分发：
```bash
/adapt-article drafts/generic/20260210_tech_stack.md xiaohongshu "语气要焦虑一点"
```

### 步骤 3：查看成果

去 `drafts/` 目录下查看生成的文章：
- `drafts/xiaohongshu/`: 应该充满了 emoji 和短句。
- `drafts/zhihu/`: 应该是逻辑严密的问答风格。
- `drafts/toutiao/`: 标题应该很“震惊”。

---

## 4. 进阶玩法

### 自动配图
如果文章中有 `![IMAGE_GEN: ...]` 标记，运行：
```bash
/render-images drafts/xiaohongshu/20260210_tech_stack.md
```
系统会生成真实的图片链接。

### 贴吧连载
如果你想写一个连载故事：
1. 先写第一楼：`/write-draft "老T创业记第一章"` -> 改编到贴吧。
2. 续写第二楼：`/continue-thread`。系统会自动读取上一楼的剧情摘要进行续写。

---

## 5. 常见问题

**Q: 输入指令后提示 `Unknown skill` 怎么办？**
A: 这是正常的。这是 Claude Agent 的机制，它会尝试寻找内置 Skill，找不到时会报错，但我们的 Agent 会拦截这个指令并执行本地脚本。请忽略报错，继续等待执行结果。

**Q: 生成的文章 AI 味太重怎么办？**
A:
1. 运行 `/check-draft [file]` 查看具体是哪些词有问题。
2. 重新运行 `/init-profile`，在风格描述里强调“拒绝说教”、“多用口语”。
3. 检查 `config/source_persona.json`，手动微调 Prompt。
