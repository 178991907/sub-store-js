// V-Pro 1.1 - Professional Renaming Script with Enhanced Matching
function operator(proxies, $arguments) {
    // --- 默认配置 ---
    const defaultConfig = {
        in: 'auto', out: 'zh', flag: false, name: '', nf: false,
        fgf: ' ', sn: ' ', one: false, nm: false,
    };
    
    // --- 参数别名处理与合并 ---
    const params = { ...$arguments };
    const aliasMap = {
        'cn': 'zh', 'us': 'en', 'gq': 'flag',
        '保留': 'nm', '不匹配': 'nm', '前缀': 'name'
    };
    for (const key in aliasMap) {
        if (params[key] !== undefined) {
            params[aliasMap[key]] = params[key];
            delete params[key];
        }
    }
    const config = { ...defaultConfig, ...params };
    
    // 布尔值转换
    ['flag', 'nf', 'nm', 'one'].forEach(key => {
        config[key] = String(config[key]) === 'true';
    });

    // --- 核心数据：国家/地区信息与自定义匹配规则 ---
    const countryData = [
        // --- 基础规则 ---
        { code: 'HK', flag: '🇭🇰', en: 'HK', zh: '香港', quan: 'Hong Kong' },
        { code: 'TW', flag: '🇹🇼', en: 'TW', zh: '台湾', quan: 'Taiwan' },
        { code: 'JP', flag: '🇯🇵', en: 'JP', zh: '日本', quan: 'Japan' },
        { code: 'SG', flag: '🇸🇬', en: 'SG', zh: '新加坡', quan: 'Singapore' },
        { code: 'US', flag: '🇺🇸', en: 'US', zh: '美国', quan: 'United States' },
        { code: 'GB', flag: '🇬🇧', en: 'GB', zh: '英国', quan: 'United Kingdom' },
        // ... 您可以继续添加更多国家

        // --- 核心修改：在这里添加您的自定义匹配规则 ---
        // 格式: { code: '国家代码', keywords: ['关键词1', '关键词2'] }
        // 规则: 只要节点名包含了 keywords 列表中的任何一个词，就会被识别为对应的国家。
        { code: 'HK', keywords: ['移动', '电信', '联通', '港', 'HK', 'Hong Kong'] },
        { code: 'SG', keywords: ['visasg', '狮城', '新加坡', 'SG', 'Singapore'] },
        { code: 'US', keywords: ['wto', 'openai', 'shopify', '美', 'US', 'United States'] },
        { code: 'JP', keywords: ['日', '东京', '大阪', 'JP', 'Japan'] }
    ];

    // --- 数据处理与正则生成 ---
    const countryMap = new Map();
    countryData.forEach(c => {
        const baseInfo = { code: c.code, flag: c.flag, en: c.en, zh: c.zh, quan: c.quan };
        // 如果已有code，合并信息
        if (countryMap.has(c.code)) {
            Object.assign(countryMap.get(c.code), baseInfo);
        } else {
            countryMap.set(c.code, baseInfo);
        }
        // 处理关键词
        if (c.keywords) {
            const current = countryMap.get(c.code);
            current.keywords = [...(current.keywords || []), ...c.keywords];
        }
    });

    const matchers = [];
    countryMap.forEach((data, code) => {
        const keywords = new Set(data.keywords || []);
        if (data.zh) keywords.add(data.zh);
        if (data.en) keywords.add(data.en);
        if (data.flag) keywords.add(data.flag);
        if (data.quan) keywords.add(data.quan);
        
        // 创建一个包含所有关键词的正则，不区分大小写
        const regex = new RegExp([...keywords].join('|'), 'i');
        matchers.push({ code, regex });
    });

    const counters = {};

    const newProxies = proxies.map(p => {
        let nodeName = p.name;
        let countryCode = null;

        // --- 1. 识别国家/地区 ---
        for (const matcher of matchers) {
            if (matcher.regex.test(nodeName)) {
                countryCode = matcher.code;
                break;
            }
        }

        if (!countryCode) {
            return config.nm ? p : null; // 如果未识别到，根据nm参数决定是否保留
        }

        // --- 2. 生成新名称 ---
        const countryInfo = countryMap.get(countryCode);
        counters[countryCode] = (counters[countryCode] || 0) + 1;
        const number = String(counters[countryCode]).padStart(2, '0');

        const outputNameMap = { zh: countryInfo.zh, en: countryInfo.en, flag: countryInfo.flag, quan: countryInfo.quan };
        const regionName = outputNameMap[config.out] || countryInfo.zh;

        // --- 3. 组合最终名称 ---
        const parts = [];
        if (config.flag) parts.push(countryInfo.flag);
        if (config.name && !config.nf) parts.push(config.name);
        parts.push(regionName);

        let finalName;
        if (config.nf && config.name) {
            finalName = [config.name, ...parts].join(config.fgf) + config.sn + number;
        } else {
            finalName = parts.join(config.fgf) + config.sn + number;
        }
        
        p.name = finalName.trim().replace(/\s+/g, ' ');
        return p;

    }).filter(p => p !== null);

    return newProxies.length > 0 ? newProxies : (config.nm ? proxies : []);
}
