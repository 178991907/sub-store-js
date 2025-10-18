// V-Pro 1.0 - Professional Renaming Script Framework
function operator(proxies, $arguments) {
    // --- 默认配置 ---
    const defaultConfig = {
        // 输入识别
        in: 'auto',   // auto, zh, en, flag, quan
        // 输出格式
        out: 'zh',    // zh, en, flag, quan
        // 国旗
        flag: false,
        // 前缀
        name: '',     // 前缀内容
        nf: false,    // 前缀是否前置 (name first)
        // 分隔符
        fgf: ' ',     // 旗帜/前缀 与 国家地区 之间的分隔符
        sn: ' ',      // 国家地区 与 序号 之间的分隔符
        // 编号
        one: false,   // (暂未实现) 清理单节点地区的序号
        // 保留与清理
        nm: false,    // (no match) 保留未匹配的节点
    };
    
    // --- 参数别名处理与合并 ---
    const params = { ...$arguments };
    const aliasMap = {
        'cn': 'zh', 'us': 'en', 'gq': 'flag',
        '保留': 'nm', '不匹配': 'nm',
        '前缀': 'name'
    };
    for (const key in aliasMap) {
        if (params[key] !== undefined) {
            params[aliasMap[key]] = params[key];
            delete params[key];
        }
    }
    const config = { ...defaultConfig, ...params };
    
    // 布尔值转换
    config.flag = config.flag === 'true' || config.flag === true;
    config.nf = config.nf === 'true' || config.nf === true;
    config.nm = config.nm === 'true' || config.nm === true;
    config.one = config.one === 'true' || config.one === true;

    // --- 核心数据 ---
    const countryData = [
        { code: 'HK', flag: '🇭🇰', en: 'HK', zh: '香港', quan: 'Hong Kong' },
        { code: 'TW', flag: '🇹🇼', en: 'TW', zh: '台湾', quan: 'Taiwan' },
        { code: 'JP', flag: '🇯🇵', en: 'JP', zh: '日本', quan: 'Japan' },
        { code: 'KR', flag: '🇰🇷', en: 'KR', zh: '韩国', quan: 'Korea' },
        { code: 'SG', flag: '🇸🇬', en: 'SG', zh: '新加坡', quan: 'Singapore' },
        { code: 'US', flag: '🇺🇸', en: 'US', zh: '美国', quan: 'United States' },
        { code: 'GB', flag: '🇬🇧', en: 'GB', zh: '英国', quan: 'United Kingdom' },
        { code: 'DE', flag: '🇩🇪', en: 'DE', zh: '德国', quan: 'Germany' },
        { code: 'FR', flag: '🇫🇷', en: 'FR', zh: '法国', quan: 'France' },
        { code: 'CA', flag: '🇨🇦', en: 'CA', zh: '加拿大', quan: 'Canada' },
        { code: 'AU', flag: '🇦🇺', en: 'AU', zh: '澳大利亚', quan: 'Australia' },
        { code: 'RU', flag: '🇷🇺', en: 'RU', zh: '俄罗斯', quan: 'Russia' },
        // ... 您可以继续添加更多国家
    ];

    const countryMatchers = {};
    countryData.forEach(c => {
        countryMatchers[c.zh] = c.code;
        countryMatchers[c.en] = c.code;
        countryMatchers[c.flag] = c.code;
        countryMatchers[c.quan] = c.code;
        // 添加不带空格的中文匹配，如 "日本"
        countryMatchers[c.zh.replace(/\s+/g, '')] = c.code;
    });
    
    // 正则表达式，用于匹配各种国家/地区名称
    const regex = {
        zh: new RegExp(`(?<zh>${countryData.map(c => c.zh.replace(/\s+/g, '')).join('|')})`),
        en: new RegExp(`\\b(?<en>${countryData.map(c => c.en).join('|')})\\b`, 'i'),
        flag: new RegExp(`(?<flag>${countryData.map(c => c.flag).join('|')})`),
        quan: new RegExp(`(?<quan>${countryData.map(c => c.quan).join('|')})`, 'i')
    };

    const counters = {};

    const newProxies = proxies.map(p => {
        let nodeName = p.name;
        let countryCode = null;

        // --- 1. 识别国家/地区 ---
        const findCountryCode = (name) => {
            const priority = config.in === 'auto' 
                ? ['zh', 'flag', 'quan', 'en'] 
                : [config.in];
            
            for (const type of priority) {
                const match = name.match(regex[type]);
                if (match) {
                    const key = match.groups[type];
                    // 对于英文全称和缩写，需要找到对应的 code
                    if (type === 'en' || type === 'quan') {
                        const foundCountry = countryData.find(c => c.en.toLowerCase() === key.toLowerCase() || c.quan.toLowerCase() === key.toLowerCase());
                        if (foundCountry) return foundCountry.code;
                    }
                    return countryMatchers[key];
                }
            }
            return null;
        };
        
        countryCode = findCountryCode(nodeName);

        // 如果未识别到，根据nm参数决定是否保留
        if (!countryCode) {
            return config.nm ? p : null;
        }

        // --- 2. 生成新名称 ---
        const countryInfo = countryData.find(c => c.code === countryCode);
        counters[countryCode] = (counters[countryCode] || 0) + 1;
        const number = String(counters[countryCode]).padStart(2, '0');

        const outputNameMap = {
            zh: countryInfo.zh,
            en: countryInfo.en,
            flag: countryInfo.flag,
            quan: countryInfo.quan
        };
        const regionName = outputNameMap[config.out] || countryInfo.zh;

        // --- 3. 组合最终名称 ---
        const parts = [];
        const prefixPart = [];
        const mainPart = [regionName];
        const suffixPart = [number];

        if (config.flag) prefixPart.push(countryInfo.flag);
        if (config.name && !config.nf) prefixPart.push(config.name);
        
        let finalName = "";

        if (config.nf && config.name) { // 前缀置于最前
            finalName = [config.name, ...prefixPart, ...mainPart].join(config.fgf) + config.sn + suffixPart.join(config.sn);
        } else { // 正常顺序
            finalName = [...prefixPart, ...mainPart].join(config.fgf) + config.sn + suffixPart.join(config.sn);
        }
        
        p.name = finalName.trim().replace(/\s+/g, ' '); // 清理多余空格
        return p;

    }).filter(p => p !== null);

    return newProxies.length > 0 ? newProxies : (config.nm ? proxies : []);
}
