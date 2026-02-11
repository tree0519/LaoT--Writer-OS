const fs = require('fs');
const path = require('path');

const BASE_DIR = path.dirname(path.dirname(path.resolve(__filename)));
const CONFIG_DIR = path.join(BASE_DIR, 'config');
const IMAGE_CONFIG_FILE = path.join(CONFIG_DIR, 'image_styles.json');

function loadImageConfig() {
    try {
        if (fs.existsSync(IMAGE_CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(IMAGE_CONFIG_FILE, 'utf-8'));
        }
    } catch (e) {
        console.log(`读取图片配置失败: ${e}`);
    }
    return {};
}

function renderImages(filePath) {
    // 1. 读取文章内容
    let content;
    try {
        content = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
        console.log(`无法读取文件 ${filePath}: ${e}`);
        return;
    }

    // 2. 识别平台（根据文件夹路径）
    const platform = path.basename(path.dirname(filePath));

    const config = loadImageConfig();
    const platformConfig = config[platform] || {};
    const stylePrompt = platformConfig.style_prompt || "高清，摄影风格";

    console.log(`🖼️  正在处理图片：${path.basename(filePath)}`);
    console.log(`📝 识别平台: ${platform} | 风格: ${stylePrompt}`);

    // 3. 查找所有 ![IMAGE_GEN: ...] 标签
    const pattern = /!\[IMAGE_GEN:\s*(.*?)\]/g;
    const matches = [...content.matchAll(pattern)];

    if (matches.length === 0) {
        console.log("✅ 未发现需要生成的图片标签。");
        return;
    }

    console.log(`🔍 发现 ${matches.length} 处图片需求，准备生成...`);

    let newContent = content;

    // 4. 模拟生成过程
    matches.forEach((match, i) => {
        const desc = match[1];
        console.log(`   [${i + 1}/${matches.length}]正在生成: ${desc}...`);

        const fullPrompt = `${desc}, ${stylePrompt}`;

        // 模拟耗时 (Node.js 中通常使用 setTimeout，但为了同步流程这里简单模拟)
        const start = Date.now();
        while (Date.now() - start < 1000) {}

        const imageFilename = `assets/images/${path.basename(filePath, path.extname(filePath))}_${i + 1}.png`;
        const originalTag = match[0]; // ![IMAGE_GEN: ...]
        const newTag = `![${desc}](${imageFilename})\n> *[AI 配图生成提示词: ${fullPrompt}]*\n`;

        newContent = newContent.replace(originalTag, newTag);
    });

    // 5. 回写文件
    try {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log("✅ 图片生成完毕，文章已更新！");
    } catch (e) {
        console.log(`回写文件失败: ${e}`);
    }
}

if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log("用法: node skills/render_images.js <file_path>");
    } else {
        renderImages(args[0]);
    }
}
