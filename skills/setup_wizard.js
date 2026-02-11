const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 定义项目路径
const BASE_DIR = path.dirname(path.dirname(path.resolve(__filename)));
const CONFIG_DIR = path.join(BASE_DIR, 'config');
const TEMPLATES_DIR = path.join(BASE_DIR, 'templates');
const AGENTS_DIR = path.join(BASE_DIR, 'agents');
const PERSONA_FILE = path.join(CONFIG_DIR, 'source_persona.json');
const REGISTRY_FILE = path.join(CONFIG_DIR, 'platform_registry.json');

function ensureDirs() {
    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR);
    if (!fs.existsSync(AGENTS_DIR)) fs.mkdirSync(AGENTS_DIR);
    if (!fs.existsSync(TEMPLATES_DIR)) fs.mkdirSync(TEMPLATES_DIR);
}

function getPlatformRegistry() {
    if (fs.existsSync(REGISTRY_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
        } catch (e) {
            console.error("Error reading platform registry:", e);
        }
    }
    return {};
}

function getAvailablePlatforms() {
    const registry = getPlatformRegistry();
    const platforms = new Set(Object.keys(registry));

    // Also scan for files that might not be in registry
    if (fs.existsSync(TEMPLATES_DIR)) {
        const files = fs.readdirSync(TEMPLATES_DIR);
        files.forEach(file => {
            if (file.endsWith('_skeleton.md') && file !== 'generic_skeleton.md' && file !== 'default_skeleton.md') {
                const platform = file.replace('_skeleton.md', '');
                platforms.add(platform);
            }
        });
    }
    return Array.from(platforms);
}

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function interactiveMode() {
    console.log("🚀 欢迎使用 老T-Writer-OS 初始化向导！");
    console.log("我们将帮助您建立自己独特的写作人设。\n");

    let personaData = {};
    if (fs.existsSync(PERSONA_FILE)) {
        try {
            personaData = JSON.parse(fs.readFileSync(PERSONA_FILE, 'utf-8'));
            console.log("📝 检测到已有配置，将基于现有配置进行修改。\n");
        } catch (e) {
            // ignore
        }
    }

    const name = (await askQuestion(`1. 请输入您的笔名/昵称 (当前: ${personaData.name || '空'}): `)).trim() || personaData.name;
    const role = (await askQuestion(`2. 请输入您的核心身份/人设 (当前: ${personaData.role || '空'}): `)).trim() || personaData.role;
    const style = (await askQuestion(`3. 请描述您的写作风格 (当前: ${personaData.core_style || '空'}): `)).trim() || personaData.core_style;
    const bg = (await askQuestion(`4. 一句话描述您的背景 (当前: ${personaData.background || '空'}): `)).trim() || personaData.background;

    const availablePlatforms = getAvailablePlatforms();
    const registry = getPlatformRegistry();

    console.log("\n现有平台模板:");
    if (availablePlatforms.length === 0) {
        console.log("(暂无模板，请在 templates/ 目录添加 *_skeleton.md 文件)");
    } else {
        availablePlatforms.forEach(p => {
             const desc = registry[p] ? `(${registry[p].name} - ${registry[p].description})` : "";
             const isEnabled = (personaData.active_platforms || []).includes(p) ? "[已启用]" : "[未启用]";
             console.log(`- ${p} ${desc} ${isEnabled}`);
        });
    }

    console.log("\n💡 提示: 如果您输入新的平台名称，系统将自动基于【万能模板】为您创建配置。");

    const defaultPlatforms = personaData.active_platforms ? personaData.active_platforms.join(', ') : '';
    const platformsInput = (await askQuestion(`5. 请选择要启用的平台 (用逗号分隔，回车保持不变: ${defaultPlatforms || '全部'}): `)).trim();

    let selectedPlatforms;
    if (!platformsInput) {
        selectedPlatforms = personaData.active_platforms || availablePlatforms;
    } else {
        selectedPlatforms = platformsInput.replace('，', ',').split(',').map(p => p.trim()).filter(p => p);
    }

    const newPersonaData = {
        "name": name,
        "role": role,
        "core_style": style,
        "background": bg,
        "active_platforms": selectedPlatforms
    };

    savePersona(newPersonaData);
    generateAgents(newPersonaData);
}

function analysisMode(sourcePath) {
    console.log(`🕵️  正在分析目录: ${sourcePath} ...`);

    // Check if directory exists
    if (!fs.existsSync(sourcePath)) {
        console.log(`❌ 目录不存在: ${sourcePath}`);
        return;
    }

    // List all markdown files
    let files;
    try {
        files = fs.readdirSync(sourcePath).filter(file => file.endsWith('.md'));
    } catch (e) {
        console.log(`❌ 无法读取目录: ${e.message}`);
        return;
    }

    if (files.length === 0) {
        console.log("⚠️  该目录下没有找到 Markdown (.md) 文件。");
        return;
    }

    console.log(`📚 找到 ${files.length} 篇文章，开始分析...`);

    // Analyze content
    let totalText = "";
    files.forEach(file => {
        try {
            const content = fs.readFileSync(path.join(sourcePath, file), 'utf-8');
            totalText += content + "\n";
        } catch (e) {
            console.log(`⚠️  无法读取文件 ${file}: ${e.message}`);
        }
    });

    if (!totalText.trim()) {
        console.log("❌ 所有文件内容为空，无法分析。");
        return;
    }

    // Basic Analysis (This logic mirrors analyze_style.js but is simplified for persona extraction)
    const sentences = totalText.split(/[。！？\n]+/).map(s => s.trim()).filter(s => s);
    let avgLen = 0;
    if (sentences.length > 0) {
        const totalLen = sentences.reduce((acc, s) => acc + s.length, 0);
        avgLen = totalLen / sentences.length;
    }

    const emojiPattern = /[^\u0000-\u007F\u4e00-\u9fa5\u3000-\u303F\uFF00-\uFFEF]/g;
    const emojis = totalText.match(emojiPattern) || [];
    const emojiRate = sentences.length ? emojis.length / sentences.length : 0;
    const exclamationCount = (totalText.match(/！/g) || []).length + (totalText.match(/!/g) || []).length;
    const exclamationRate = sentences.length ? exclamationCount / sentences.length : 0;

    // Infer styles
    let inferredStyle = [];
    if (avgLen < 15) inferredStyle.push("短句为主");
    else if (avgLen > 30) inferredStyle.push("长句为主");
    else inferredStyle.push("长短句结合");

    if (emojiRate > 0.2) inferredStyle.push("Emoji丰富");
    if (exclamationRate > 0.1) inferredStyle.push("情绪强烈");
    else inferredStyle.push("语气平和");

    // Construct inferred persona
    const inferredPersona = {
        name: "独立开发老T", // Default fallback
        role: "内容创作者", // Default fallback
        core_style: inferredStyle.join("、"),
        background: "基于历史文章自动推断",
        active_platforms: getAvailablePlatforms()
    };

    console.log("\n🤖 分析完成！推断出的人设信息如下：");
    console.log("--------------------------------------------------");
    console.log(`笔名: ${inferredPersona.name}`);
    console.log(`人设: ${inferredPersona.role}`);
    console.log(`风格: ${inferredPersona.core_style}`);
    console.log(`背景: ${inferredPersona.background}`);
    console.log("--------------------------------------------------");

    console.log("\n⚠️  注意: 自动分析只能提取风格特征，无法准确推断您的具体身份和背景。");
    console.log("建议您后续手动编辑 config/source_persona.json 进行微调。");

    // Save automatically in this simplified version
    savePersona(inferredPersona);
    generateAgents(inferredPersona);
}

function savePersona(data) {
    ensureDirs();
    fs.writeFileSync(PERSONA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n💾 人设配置已保存: ${PERSONA_FILE}`);
}

function generateAgents(persona) {
    console.log("\n⚙️  正在生成 Agent 模板...");

    const userRoleDesc = `${persona['name']} (${persona['role']})。背景：${persona['background']}。风格：${persona['core_style']}。`;

    // 强制生成 generic.md
    try {
        const genericSkeleton = path.join(TEMPLATES_DIR, "generic_skeleton.md");
        const genericAgent = path.join(AGENTS_DIR, "generic.md");

        if (fs.existsSync(genericSkeleton)) {
            const content = fs.readFileSync(genericSkeleton, 'utf-8');
            const newContent = content.replace("{{user_role}}", userRoleDesc);
            fs.writeFileSync(genericAgent, newContent, 'utf-8');
            console.log(`✅ 已生成: generic.md (基础底稿模板)`);

            const genericDraftDir = path.join(BASE_DIR, 'drafts', 'generic');
            if (!fs.existsSync(genericDraftDir)) {
                fs.mkdirSync(genericDraftDir, { recursive: true });
                console.log(`   📂 已创建草稿目录: drafts/generic`);
            }
        } else {
            console.log(`⚠️  未找到 generic_skeleton.md，请检查 templates 目录。`);
        }
    } catch (e) {
        console.log(`❌ 生成 generic 模板失败: ${e}`);
    }

    for (const platform of persona['active_platforms']) {
        let skeletonPath = path.join(TEMPLATES_DIR, `${platform}_skeleton.md`);
        const targetPath = path.join(AGENTS_DIR, `${platform}.md`);

        let usingDefault = false;
        if (!fs.existsSync(skeletonPath)) {
            const defaultSkeletonPath = path.join(TEMPLATES_DIR, "default_skeleton.md");
            if (fs.existsSync(defaultSkeletonPath)) {
                console.log(`⚠️  ${platform} 专属模板不存在，将使用【万能模板】生成...`);
                skeletonPath = defaultSkeletonPath;
                usingDefault = true;
            } else {
                console.log(`❌ 跳过 ${platform}: 既无专属模板也无万能模板`);
                continue;
            }
        }

        try {
            const content = fs.readFileSync(skeletonPath, 'utf-8');
            let newContent = content.replace("{{user_role}}", userRoleDesc);

            if (usingDefault) {
                newContent = newContent.replace("{{platform_name}}", platform);
            }

            fs.writeFileSync(targetPath, newContent, 'utf-8');
            console.log(`✅ 已生成: ${platform}.md`);

            const draftDir = path.join(BASE_DIR, 'drafts', platform);
            if (!fs.existsSync(draftDir)) {
                fs.mkdirSync(draftDir, { recursive: true });
                console.log(`   📂 已创建草稿目录: drafts/${platform}`);
            }
        } catch (e) {
            console.log(`❌ 生成失败 ${platform}: ${e}`);
        }
    }

    console.log("\n🎉 初始化完成！您现在可以使用 /write-article 指令开始创作了。");
}

// Main execution
if (process.argv.length > 2 && process.argv[2] === "analyze") {
    if (process.argv.length < 4) {
        console.log("用法: node skills/setup_wizard.js analyze <dir_path>");
    } else {
        analysisMode(process.argv[3]);
    }
} else {
    ensureDirs(); // Ensure dirs before starting interactive mode to populate templates
    interactiveMode();
}
