# 开发者指南 (Developer Guide)

本指南面向希望对 **老T-Writer-OS** 进行二次开发或深入定制的用户。

---

## 1. 项目架构

系统采用了“配置文件驱动 + 脚本执行”的架构，核心逻辑由 Claude Agent (自然语言理解) 和 Node.js 脚本 (本地操作) 共同完成。

### 目录结构详解

```text
.
├── agents/          # (自动生成) 存放最终生成给 AI 使用的 Prompt 文件
│   ├── generic.md       # 通用底稿 Agent
│   ├── xiaohongshu.md   # 小红书 Agent
│   └── ...
├── config/          # 用户配置中心
│   ├── source_persona.json  # 核心人设数据 (由向导生成)
│   ├── platform_registry.json # 平台注册表 (定义有哪些平台及其规则)
│   ├── image_styles.json    # 图片风格配置
│   └── ai_blocklist.json    # (可选) 反 AI 词库
├── drafts/          # 文章存储
│   ├── generic/         # 通用底稿
│   ├── xiaohongshu/     # 小红书成品
│   └── ...
├── memory/          # (自动生成) 长期记忆
│   └── style_snapshot.json # 风格快照
├── skills/          # 核心功能脚本 (Node.js)
│   ├── setup_wizard.js  # 初始化向导 (对应 /init-profile)
│   ├── analyze_style.js # 风格分析器 (对应 /analyze-style)
│   ├── anti_ai_check.js # 质检脚本 (对应 /check-draft)
│   └── render_images.js # 图片渲染器 (对应 /render-images)
├── templates/       # 骨架模板 (Human Written)
│   ├── generic_skeleton.md
│   ├── xiaohongshu_skeleton.md
│   └── ...
├── CLAUDE.md        # 系统的“大脑”，定义了所有指令和 Agent 行为准则
└── README.md
```

---

## 2. 如何添加新平台？

假设你想添加一个名为 **Bilibili** 的平台。

### 方式一：极简模式 (Quick Add)
1.  在 `templates/` 目录下创建一个新文件 `bilibili_skeleton.md`。
2.  写入内容（记得包含 `{{user_role}}`）：
    ```markdown
    # Role: {{user_role}}
    请生成一篇适合 B站 的视频文案。
    要求：玩梗，弹幕互动多。
    ```
3.  运行 `/init-profile`。向导会自动扫描 `templates/` 目录，发现新文件并将其加入可选列表。

### 方式二：标准模式 (Recommended)
1.  编辑 `config/platform_registry.json`，注册平台元数据：
    ```json
    "bilibili": {
        "name": "哔哩哔哩",
        "description": "年轻化，二次元，弹幕互动",
        "template_file": "bilibili_skeleton.md",
        "constraints": {
            "max_length": 2000
        }
    }
    ```
2.  创建 `templates/bilibili_skeleton.md`。
3.  运行 `/init-profile`。此时向导会显示中文名称“哔哩哔哩”。

---

## 3. 核心脚本逻辑

### `skills/setup_wizard.js`
这是系统的初始化入口。
- **Interactive Mode**: 使用 `readline` 模块与用户交互，收集信息生成 `source_persona.json`。
- **Generator**: 读取 `source_persona.json` 和 `templates/*.md`，将人设描述注入到模板中，生成最终的 `agents/*.md`。

### `skills/analyze_style.js`
这是“老手模式”的核心。
- 扫描指定目录下的 Markdown 文件。
- 计算平均句长（判断是长句型还是短句型）。
- 统计标点符号使用率（判断语气强烈程度）。
- 简单的关键词提取。
- 生成 `memory/style_snapshot.json` 供 Agent 读取。

---

## 4. 自定义指令

所有指令都定义在 `CLAUDE.md` 文件中。如果你想添加一个新指令，例如 `/backup`：

1.  在 `skills/` 下写一个 `backup.js` 脚本。
2.  在 `CLAUDE.md` 的 `Commands` 列表中添加：
    - `/backup`: 备份所有草稿。执行: `node skills/backup.js`。

---

## 5. 贡献代码

欢迎提交 PR！请确保：
- 新增的 Skill 脚本在 Node.js v14+ 环境下可运行。
- 更新 `platform_registry.json` 时保持 JSON 格式合法。
