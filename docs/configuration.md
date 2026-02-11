# 高级配置指南 (Configuration Guide)

**老T-Writer-OS** 提供了高度的定制化能力。通过修改 `config/` 和 `templates/` 下的文件，你可以完全掌控 AI 的生成效果。

---

## 1. 核心人设配置 (`config/source_persona.json`)

这是系统的“灵魂”文件，由 `/init-profile` 自动生成。

**文件示例**:
```json
{
  "name": "独立开发老T",
  "role": "全栈工程师",
  "core_style": "犀利、干货、拒绝说教",
  "background": "10年大厂经验，35岁被裁",
  "active_platforms": [
    "xiaohongshu",
    "zhihu",
    "tieba"
  ]
}
```

**修改建议**:
- 如果你觉得生成的文章“太软了”，可以在 `core_style` 中加入 `强硬`、`批判性`。
- 如果想修改笔名，直接修改 `name` 字段。
- **注意**: 修改此文件后，**必须**重新运行 `/init-profile` (或者手动运行 `node skills/setup_wizard.js`)，才能让更改应用到具体的 Agent 模板中。

---

## 2. 平台规则配置 (`config/platform_registry.json`)

在此文件中，定义每个平台的“物理约束”。

**文件示例**:
```json
"xiaohongshu": {
    "name": "小红书",
    "description": "表情包丰富，情绪化...",
    "template_file": "xiaohongshu_skeleton.md",
    "constraints": {
        "max_length": 1000,
        "forbidden_words": ["最", "第一", "绝对"],  // 违禁词库
        "emoji_density": "high"
    }
}
```

**高级玩法**:
- **添加新平台**: 你可以在这里添加一个 `bilibili` 节点，定义它的规则，然后在 `templates/` 下创建对应的骨架文件。
- **调整风控**: 如果你经常被平台限流，可以在 `forbidden_words` 里添加更多敏感词，让 AI 自动避坑。

---

## 3. 图片风格配置 (`config/image_styles.json`)

定义 `/render-images` 指令调用生图 API 时的提示词参数。

**文件示例**:
```json
{
  "xiaohongshu": {
    "style_prompt": "ins风，生活化，高饱和度，精美构图，柔光",
    "ratio": "3:4"
  },
  "toutiao": {
    "style_prompt": "写实摄影风格，高对比度，新闻纪实感，4k分辨率",
    "ratio": "16:9"
  }
}
```

**修改建议**:
- 如果你希望小红书的配图更二次元一点，将 `style_prompt` 改为 `动漫风格，日系插画，色彩明亮`。

---

## 4. 平台骨架模板 (`templates/*.md`)

这些 Markdown 文件定义了文章的**结构**。

**变量说明**:
- `{{user_role}}`: 必须保留。系统会在此处注入你的人设 Prompt。
- `{{platform_name}}`: 当前平台名称。

**修改示例 (修改知乎模板)**:
如果你不希望知乎文章总是以“谢邀”开头，可以编辑 `templates/zhihu_skeleton.md`，删除相关的 Prompt 指引。

```markdown
# Role: {{user_role}}

## 任务
请以知乎大V的风格，回答以下问题：{{topic}}

## 要求
1. 逻辑严密，分点论述。
2. 不要使用“谢邀”开头。(在这里添加你的自定义规则)
3. ...
```

---

## 5. 反 AI 词库 (`config/ai_blocklist.json`)

*(如果文件不存在，你可以手动创建它)*

定义 `/check-draft` 指令使用的敏感词库。

```json
{
  "blocklist": {
    "综上所述": "简单来说",
    "不可否认": "确实",
    "小编觉得": "我认为"
  }
}
```
左边是**检测词**，右边是**建议替换词**。
