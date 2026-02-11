const fs = require('fs');
const path = require('path');

const BASE_DIR = path.dirname(path.dirname(path.resolve(__filename)));
const HISTORY_FILE = path.join(BASE_DIR, 'memory', 'history_log.json');
const SNAPSHOT_FILE = path.join(BASE_DIR, 'config', 'style_snapshot.json');
const BLOCKLIST_FILE = path.join(BASE_DIR, 'config', 'ai_blocklist.json');

function loadJson(filePath) {
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (e) {
            return null;
        }
    }
    return null;
}

function logArticle(topic, platform, summary = "") {
    let history = loadJson(HISTORY_FILE) || [];

    const entry = {
        "date": new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        "topic": topic,
        "platform": platform,
        "summary": summary
    };

    history.unshift(entry);

    if (history.length > 100) {
        history = history.slice(0, 100);
    }

    try {
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
        console.log(`✅ 已记录历史轨迹: [${platform}] ${topic}`);
    } catch (e) {
        console.log(`❌ 记录历史失败: ${e}`);
    }
}

function getContext() {
    console.log("\nLoading Memory Context...\n");

    // 1. 读取显性偏好 (ai_blocklist.json)
    let blocklistStr = "";
    if (fs.existsSync(BLOCKLIST_FILE)) {
        try {
            const blockData = JSON.parse(fs.readFileSync(BLOCKLIST_FILE, 'utf-8'));
            if (blockData.blocklist) {
                blocklistStr = "⛔ [禁止词汇] (config/ai_blocklist.json):\n";
                for (const [k, v] of Object.entries(blockData.blocklist)) {
                    blocklistStr += `- 禁止 '${k}', 建议使用 '${v}'\n`;
                }
                console.log("📝 [显性规则] 已加载 config/ai_blocklist.json");
            }
        } catch (e) {
            console.log(`⚠️ [显性规则] 读取 blocklist 失败: ${e}`);
        }
    }

    if (!blocklistStr) {
        console.log("⚪ [显性规则] 无配置 (config/ai_blocklist.json)");
    }

    // 2. 读取风格快照
    const snapshot = loadJson(SNAPSHOT_FILE);
    let snapshotStr = "";
    if (snapshot) {
        const toneKeywords = snapshot.tone_keywords ? snapshot.tone_keywords.join(', ') : '';
        const commonWords = snapshot.common_words ? snapshot.common_words.join(', ') : '';
        snapshotStr = `
风格快照 (Style Snapshot):
- 平均句长: ${snapshot.avg_sentence_len || 'N/A'}
- 语气关键词: ${toneKeywords}
- 高频词: ${commonWords}
- 受众: ${snapshot.audience_inference || 'N/A'}
`;
        console.log("🎭 [隐性风格] 已加载 config/style_snapshot.json");
    } else {
        console.log("⚪ [隐性风格] 未找到快照 (建议运行 node skills/analyze_style.js --snapshot)");
    }

    // 3. 读取最近历史
    const history = loadJson(HISTORY_FILE);
    let recentHistoryStr = "";
    if (history && history.length > 0) {
        recentHistoryStr = "最近创作轨迹 (Recent History):\n";
        history.slice(0, 3).forEach(h => {
            recentHistoryStr += `- ${h.date}: [${h.platform}] ${h.topic}\n`;
        });
        console.log(`📜 [轨迹记忆] 已加载最近 ${Math.min(history.length, 3)} 条记录`);
    } else {
        console.log("⚪ [轨迹记忆] 无记录");
    }

    const finalContext = `
================ SYSTEM MEMORY INJECTION ================
${blocklistStr}

${snapshotStr}

${recentHistoryStr}
=========================================================
`;
    return finalContext;
}

if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length > 0) {
        const cmd = args[0];
        if (cmd === "log") {
            // node skills/memory_manager.js log "Topic" "Platform" "Summary"
            if (args.length >= 3) {
                logArticle(args[1], args[2], args.length > 3 ? args[3] : "");
            }
        } else if (cmd === "get") {
            console.log(getContext());
        }
    }
}
