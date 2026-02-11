const fs = require('fs');
const path = require('path');

// 定义项目路径
const BASE_DIR = path.dirname(path.dirname(path.resolve(__filename)));
const CONFIG_DIR = path.join(BASE_DIR, 'config');
const TEMPLATES_DIR = path.join(BASE_DIR, 'templates');
const AGENTS_DIR = path.join(BASE_DIR, 'agents');
const PERSONA_FILE = path.join(CONFIG_DIR, 'source_persona.json');

function ensureDirs() {
    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR);
    if (!fs.existsSync(AGENTS_DIR)) fs.mkdirSync(AGENTS_DIR);
    if (!fs.existsSync(TEMPLATES_DIR)) fs.mkdirSync(TEMPLATES_DIR);
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

function loadPersona() {
    try {
        return JSON.parse(fs.readFileSync(PERSONA_FILE, 'utf-8'));
    } catch (e) {
        console.error("无法读取 source_persona.json:", e);
        return null;
    }
}

// Main execution for manual generation mode
ensureDirs();
const persona = loadPersona();
if (persona) {
    generateAgents(persona);
} else {
    console.error("请确保 config/source_persona.json 文件存在");
}