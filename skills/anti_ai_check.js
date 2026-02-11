const fs = require('fs');
const path = require('path');

const BASE_DIR = path.dirname(path.dirname(path.resolve(__filename)));
const CONFIG_FILE = path.join(BASE_DIR, 'config', 'ai_blocklist.json');

function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        }
    } catch (e) {
        console.log(`❌ 配置文件格式错误: ${CONFIG_FILE}`);
        return null;
    }

    console.log(`⚠️  配置文件未找到: ${CONFIG_FILE}`);
    console.log("   将使用内置默认列表。");
    return null;
}

function checkAiFlavor(filePath) {
    const config = loadConfig();
    let aiPhrases;

    if (config && config.blocklist) {
        aiPhrases = config.blocklist;
    } else {
        // 降级默认配置
        aiPhrases = {
            "总而言之": "简单来说 / 一句话",
            "不可否认": "确实 / 没错",
            "综上所述": "所以说 / 总结一下"
        };
    }

    let content;
    try {
        content = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
        console.log(`读取文件失败: ${e}`);
        return;
    }

    const foundIssues = [];
    console.log(`正在检查文件: ${filePath} ...\n`);

    const lines = content.split('\n');
    lines.forEach((line, i) => {
        for (const [phrase, suggestion] of Object.entries(aiPhrases)) {
            if (line.includes(phrase)) {
                foundIssues.push({
                    line: i + 1,
                    phrase: phrase,
                    suggestion: suggestion,
                    content: line.trim()
                });
            }
        }
    });

    if (foundIssues.length > 0) {
        console.log("⚠️  发现疑似 AI 味过重的表达，建议修改：");
        console.log("-".repeat(50));
        foundIssues.forEach(issue => {
            console.log(`Line ${issue.line}: 发现了【${issue.phrase}】`);
            console.log(`   👉 建议改为：${issue.suggestion}`);
            console.log(`   原文片段：...${issue.content.substring(0, 30)}...`);
            console.log("-".repeat(50));
        });
        console.log(`\n共发现 ${foundIssues.length} 处问题。请根据建议手动修改或要求 AI 重写。`);
    } else {
        console.log("✅ 检查通过！未发现明显的 AI 味常用词。");
    }
}

if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log("用法: node skills/anti_ai_check.js <draft_file_path>");
    } else {
        checkAiFlavor(args[0]);
    }
}
