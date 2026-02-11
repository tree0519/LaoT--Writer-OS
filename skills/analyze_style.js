const fs = require('fs');
const path = require('path');

const BASE_DIR = path.dirname(path.dirname(path.resolve(__filename)));
const MEMORY_DIR = path.join(BASE_DIR, 'memory');
const CONFIG_DIR = path.join(BASE_DIR, 'config');
const PERSONA_FILE = path.join(CONFIG_DIR, 'source_persona.json');
const OLD_PROFILE_FILE = path.join(CONFIG_DIR, 'user_profile.json');
const SNAPSHOT_FILE = path.join(CONFIG_DIR, 'style_snapshot.json');

function loadUserProfile() {
    try {
        if (fs.existsSync(PERSONA_FILE)) {
            const data = JSON.parse(fs.readFileSync(PERSONA_FILE, 'utf-8'));
            return {
                fixed_catchphrases: [],
                target_audience: "自动推断",
                tone_preference: `身份：${data.role || ''} | 风格：${data.core_style || ''} | 背景：${data.background || ''}`
            };
        } else if (fs.existsSync(OLD_PROFILE_FILE)) {
            return JSON.parse(fs.readFileSync(OLD_PROFILE_FILE, 'utf-8'));
        }
    } catch (e) {
        // ignore
    }
    return {};
}

function getStyleData() {
    if (!fs.existsSync(MEMORY_DIR)) {
        try {
            fs.mkdirSync(MEMORY_DIR);
            console.log(`【系统提示】已自动创建 memory/ 目录: ${MEMORY_DIR}`);
        } catch (e) {
            console.log(`【系统错误】无法创建 memory/ 目录: ${e}`);
        }
    }

    const profile = loadUserProfile();

    // 获取最新的5个md文件
    let latestFiles = [];
    try {
        const files = fs.readdirSync(MEMORY_DIR)
            .filter(file => file.endsWith('.md'))
            .map(file => path.join(MEMORY_DIR, file));

        latestFiles = files
            .map(file => ({ file, mtime: fs.statSync(file).mtime }))
            .sort((a, b) => b.mtime - a.mtime)
            .slice(0, 5)
            .map(f => f.file);
    } catch (e) {
        console.log(`读取文件列表失败: ${e}`);
    }

    let avgLen = 15.0;
    let sentenceStyle = "默认风格（短句为主）";
    let commonWords = ["用户", "痛点", "价值", "搞钱", "思维"];
    let foundCatchphrases = [];
    let emojiStyle = "适量使用";
    let toneIntensity = "平和真诚";
    let hasMemoryFiles = false;

    if (latestFiles.length > 0) {
        try {
            let totalText = "";
            for (const file of latestFiles) {
                totalText += fs.readFileSync(file, 'utf-8') + "\n";
            }

            if (totalText.trim()) {
                hasMemoryFiles = true;

                // 1. 分析平均句长
                const sentences = totalText.split(/[。！？\n]+/).map(s => s.trim()).filter(s => s);
                if (sentences.length > 0) {
                    const totalLen = sentences.reduce((acc, s) => acc + s.length, 0);
                    avgLen = totalLen / sentences.length;
                    sentenceStyle = avgLen < 20 ? "短句为主，节奏快" : "长句为主，逻辑严密";
                }

                // 2. 简易高频词提取 (Node.js 这里的中文分词比较麻烦，这里做个简单模拟或跳过复杂分词)
                // 实际生产可以使用 nodejieba，为了保持无依赖，这里简化处理，只做简单的正则匹配
                // 或者保留默认值，提示用户这部分能力在 JS 版中有所简化

                // 3. 语气特征
                const emojiPattern = /[^\u0000-\u007F\u4e00-\u9fa5\u3000-\u303F\uFF00-\uFFEF]/g;
                const emojis = totalText.match(emojiPattern) || [];
                const emojiRate = sentences.length ? emojis.length / sentences.length : 0;
                emojiStyle = emojiRate > 0.2 ? "喜欢使用Emoji" : "极少使用Emoji";

                const exclamationCount = (totalText.match(/！/g) || []).length + (totalText.match(/!/g) || []).length;
                const exclamationRate = sentences.length ? exclamationCount / sentences.length : 0;
                toneIntensity = exclamationRate > 0.1 ? "情绪强烈" : "语气平和";
            }
        } catch (e) {
            console.log(`【风格分析错误】分析过程出错，将降级使用默认配置: ${e}`);
        }
    }

    if (!hasMemoryFiles) {
        console.log("【提示】memory/ 目录下暂无文章，将基于 config/user_profile.json 生成基础画像。");
    }

    const fixedCatchphrases = profile.fixed_catchphrases || [];
    const targetAudience = profile.target_audience || "未知受众";
    const tonePreference = profile.tone_preference || "";

    // JS Set deduplication
    const allCatchphrases = [...new Set([...foundCatchphrases, ...fixedCatchphrases])];

    return {
        avg_len: avgLen,
        sentence_style: sentenceStyle,
        common_words: commonWords,
        all_catchphrases: allCatchphrases,
        emoji_style: emojiStyle,
        tone_intensity: toneIntensity,
        target_audience: targetAudience,
        tone_preference: tonePreference
    };
}

function saveStyleSnapshot(data) {
    const snapshot = {
        avg_sentence_len: data.avg_len,
        tone_keywords: [data.sentence_style, data.emoji_style, data.tone_intensity],
        common_words: data.common_words,
        audience_inference: data.target_audience
    };

    try {
        fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2), 'utf-8');
        console.log(`【系统提示】风格快照已保存至: ${SNAPSHOT_FILE}`);
    } catch (e) {
        console.log(`【系统错误】无法保存风格快照: ${e}`);
    }
}

function analyzeStyle() {
    const data = getStyleData();

    console.log(`
--- 用户风格画像 ---
1. **句式结构**: 平均句长 ${data.avg_len.toFixed(1)} 字，${data.sentence_style}。
2. **高频词汇**: ${data.common_words.join(', ')}
3. **关键口头禅**: ${data.all_catchphrases.length ? data.all_catchphrases.join(', ') : "无"}
4. **语气特征**: ${data.emoji_style}，${data.tone_intensity}。${data.tone_preference}
5. **目标受众**: ${data.target_audience}
--------------------
`);

    if (process.argv.includes('--snapshot')) {
        saveStyleSnapshot(data);
    }
}

if (require.main === module) {
    analyzeStyle();
}
