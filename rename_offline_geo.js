// V15 - Final Graduation Version (with Mixed Separator Logic)
function operator(proxies, $arguments) {
    // --- 默认配置 (当URL中未提供参数时使用) ---
    const defaultConfig = {
        customText: '',      // 自定义文字内容
        flag: true,          // 是否显示旗帜
        out:  'zh',          // 地区名称语言: 'zh' 或 'en'
        enableNumbering: true, // 是否开启编号
        separator: ' ',      // 自定义分隔符, 默认为空格
        keepUnidentified: false 
    };

    // --- 核心逻辑: 将URL传入的参数与默认配置合并 ---
    const config = { ...defaultConfig, ...$arguments };
    
    // 将可能为字符串的布尔值转为真正的布尔值
    config.flag = config.flag === 'true' || config.flag === true;
    config.enableNumbering = config.enableNumbering === 'true' || config.enableNumbering === true;
    config.keepUnidentified = config.keepUnidentified === 'true' || config.keepUnidentified === true;

    // 自定义域名映射规则
    const customDomainMap = {
        'yd': 'HK', 'dx': 'HK', 'lt': 'HK', 'cm': 'CM', 'wto': 'US', 
        'visasg': 'SG', 'openai': 'US', 'shopify': 'US', 'bp': 'US', 'qms': 'US', 'sy': 'US'
    };

    // --- 脚本核心代码 (无需修改以下内容) ---
    const countryData = [
        { code: 'HK', flag: '🇭🇰', en: 'Hong Kong', zh: '香港' }, { code: 'TW', flag: '🇹🇼', en: 'Taiwan', zh: '台湾' },
        { code: 'JP', flag: '🇯🇵', en: 'Japan', zh: '日本' }, { code: 'KR', flag: '🇰🇷', en: 'Korea', zh: '韩国' },
        { code: 'SG', flag: '🇸🇬', en: 'Singapore', zh: '新加坡' }, { code: 'US', flag: '🇺🇸', en: 'United States', zh: '美国' },
        { code: 'GB', flag: '🇬🇧', en: 'United Kingdom', zh: '英国' }, { code: 'DE', flag: '🇩🇪', en: 'Germany', zh: '德国' },
        { code: 'FR', flag: '🇫🇷', en: 'France', zh: '法国' }, { code: 'CA', flag: '🇨🇦', en: 'Canada', zh: '加拿大' },
        { code: 'AU', flag: '🇦🇺', en: 'Australia', zh: '澳大利亚' }, { code: 'RU', flag: '🇷🇺', en: 'Russia', zh: '俄罗斯' },
        { code: 'IN', flag: '🇮🇳', en: 'India', zh: '印度' }, { code: 'BR', flag: '🇧🇷', en: 'Brazil', zh: '巴西' },
        { code: 'NL', flag: '🇳🇱', en: 'Netherlands', zh: '荷兰' }, { code: 'IT', flag: '🇮🇹', en: 'Italy', zh: '意大利' },
        { code: 'CH', flag: '🇨🇭', en: 'Switzerland', zh: '瑞士' }, { code: 'SE', flag: '🇸🇪', en: 'Sweden', zh: '瑞典' },
        { code: 'TR', flag: '🇹🇷', en: 'Turkey', zh: '土耳其' }, { code: 'VN', flag: '🇻🇳', en: 'Vietnam', zh: '越南' },
        { code: 'TH', flag: '🇹🇭', en: 'Thailand', zh: '泰国' }, { code: 'MY', flag: '🇲🇾', en: 'Malaysia', zh: '马来西亚' },
        { code: 'ID', flag: '🇮🇩', en: 'Indonesia', zh: '印尼' }, { code: 'PH', flag: '🇵🇭', en: 'Philippines', zh: '菲律宾' },
        { code: 'AE', flag: '🇦🇪', en: 'United Arab Emirates', zh: '阿联酋' }, { code: 'ZA', flag: '🇿🇦', en: 'South Africa', zh: '南非' },
        { code: 'AR', flag: '🇦🇷', en: 'Argentina', zh: '阿根廷' }, { code: 'ES', flag: '🇪🇸', en: 'Spain', zh: '西班牙' },
        { code: 'PL', flag: '🇵🇱', en: 'Poland', zh: '波兰' }, { code: 'IE', flag: '🇮🇪', en: 'Ireland', zh: '爱尔兰' },
        { code: 'RO', flag: '🇷🇴', en: 'Romania', zh: '罗马尼亚' }, { code: 'LT', flag: '🇱🇹', en: 'Lithuania', zh: '立陶宛' },
        { code: 'CM', flag: '🇨🇲', en: 'Cameroon', zh: '喀麦隆' }
    ];
    const ipDB = [ { start: 1753403392, end: 1753403647, code: 'HK' }, { start: 3232301312, end: 3232301567, code: 'TW' } ];
    const counters = {};
    const getCountryByCode = (code) => countryData.find(c => c.code === code);
    const getRegionInfo = (server) => {
        const ipMatch = server.match(/\d{1,3}(\.\d{1,3}){3}/);
        if (ipMatch) {
            const cleanIP = ipMatch[0];
            const ipNum = cleanIP.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
            const record = ipDB.find(r => ipNum >= r.start && ipNum <= r.end);
            return record ? getCountryByCode(record.code) : getCountryByCode('US');
        }
        const parts = server.split('.');
        for (const part of parts) { if (customDomainMap[part]) return getCountryByCode(customDomainMap[part]); }
        return null;
    };
    const newProxies = proxies.map(p => {
        const cleanServer = p.server.split(':')[0].toLowerCase();
        const regionInfo = getRegionInfo(cleanServer);
        if (regionInfo) {
            // --- 【核心命名逻辑】分段拼接 ---

            // 1. 拼接基础部分 (旗帜 + 地区名), 强制使用空格
            const baseParts = [];
            if (config.flag) baseParts.push(regionInfo.flag);
            const regionName = config.out === 'zh' ? regionInfo.zh : regionInfo.en;
            baseParts.push(regionName);
            const baseName = baseParts.join(' '); // 固定使用空格

            // 2. 收集可选的附加部分
            const additionalParts = [];
            if (config.customText) {
                additionalParts.push(config.customText);
            }
            if (config.enableNumbering) {
                counters[regionInfo.code] = (counters[regionInfo.code] || 0) + 1;
                additionalParts.push(String(counters[regionInfo.code]).padStart(2, '0'));
            }

            // 3. 组合最终名称
            let finalName = baseName;
            if (additionalParts.length > 0) {
                // 只有当存在附加部分时, 才使用 separator 连接它们
                finalName += config.separator + additionalParts.join(config.separator);
            }
            
            p.name = finalName;
            return p;
        }
        return config.keepUnidentified ? p : null;
    }).filter(p => p !== null);
    return newProxies.length > 0 ? newProxies : proxies;
}
