// V20 - The Ultimate Universal Version (Handles All Scenarios)
async function operator(proxies, $arguments) {
    // --- 默认配置 ---
    const defaultConfig = {
        customText: '',      // 自定义文字内容
        flag: true,          // 是否显示旗帜
        out:  'zh',          // 地区名称语言: 'zh' 或 'en'
        enableNumbering: true, // 是否开启编号
        separator: ' ',      // 自定义分隔符
        keepUnidentified: false, // 是否保留未识别地区节点
        
        // --- 模式一：读取 Sub-Store 内置数据 ---
        ipApiKey: '',       // (此路不通, 忽略)
        countryCodeKey: '', // (此路不通, 忽略)
        
        // --- 模式二：启用脚本自己的后备 API 查询 (我们的唯一方案) ---
        enableFallbackApi: false, // 是否启用后备API查询, 在URL中设为 true 来开启
        fallbackApiUrl: 'http://ip-api.com/json/{query}?lang=zh-CN&fields=status,countryCode'
    };

    // --- 核心逻辑: 将URL传入的参数与默认配置合并 ---
    const config = { ...defaultConfig, ...$arguments };
  
    // 标准化布尔值
    config.flag = config.flag === 'true' || config.flag === true;
    config.enableNumbering = config.enableNumbering === 'true' || config.enableNumbering === true;
    config.keepUnidentified = config.keepUnidentified === 'true' || config.keepUnidentified === true;
    config.enableFallbackApi = config.enableFallbackApi === 'true' || config.enableFallbackApi === true;

    // 自定义域名映射规则 (作为补充)
    const customDomainMap = {
        'yd': 'HK', 'dx': 'HK', 'lt': 'HK', 'cm': 'CM', 'wto': 'US', 
        'visasg': 'SG', 'openai': 'US', 'shopify': 'US', 'bp': 'US', 'qms': 'US', 'sy': 'US'
    };

    // --- 脚本核心代码 ---
    const countryData = [ { code: 'HK', flag: '🇭🇰', en: 'Hong Kong', zh: '香港' }, { code: 'TW', flag: '🇹🇼', en: 'Taiwan', zh: '台湾' }, { code: 'JP', flag: '🇯🇵', en: 'Japan', zh: '日本' }, { code: 'KR', flag: '🇰🇷', en: 'Korea', zh: '韩国' }, { code: 'SG', flag: '🇸🇬', en: 'Singapore', zh: '新加坡' }, { code: 'US', flag: '🇺🇸', en: 'United States', zh: '美国' }, { code: 'GB', flag: '🇬🇧', en: 'United Kingdom', zh: '英国' }, { code: 'DE', flag: '🇩🇪', en: 'Germany', zh: '德国' }, { code: 'FR', flag: '🇫🇷', en: 'France', zh: '法国' }, { code: 'CA', flag: '🇨🇦', en: 'Canada', zh: '加拿大' }, { code: 'AU', flag: '🇦🇺', en: 'Australia', zh: '澳大利亚' }, { code: 'RU', flag: '🇷🇺', en: 'Russia', zh: '俄罗斯' }, { code: 'IN', flag: '🇮🇳', en: 'India', zh: '印度' }, { code: 'BR', flag: '🇧🇷', en: 'Brazil', zh: '巴西' }, { code: 'NL', flag: '🇳🇱', en: 'Netherlands', zh: '荷兰' }, { code: 'IT', flag: '🇮🇹', en: 'Italy', zh: '意大利' }, { code: 'CH', flag: '🇨🇭', en: 'Switzerland', zh: '瑞士' }, { code: 'SE', flag: '🇸🇪', en: 'Sweden', zh: '瑞典' }, { code: 'TR', flag: '🇹🇷', en: 'Turkey', zh: '土耳其' }, { code: 'VN', flag: '🇻🇳', en: 'Vietnam', zh: '越南' }, { code: 'TH', flag: '🇹🇭', en: 'Thailand', zh: '泰国' }, { code: 'MY', flag: '🇲🇾', en: 'Malaysia', zh: '马来西亚' }, { code: 'ID', flag: '🇮🇩', en: 'Indonesia', zh: '印尼' }, { code: 'PH', flag: '🇵🇭', en: 'Philippines', zh: '菲律宾' }, { code: 'AE', flag: '🇦🇪', en: 'United Arab Emirates', zh: '阿联酋' }, { code: 'ZA', flag: '🇿🇦', en: 'South Africa', zh: '南非' }, { code: 'AR', flag: '🇦🇷', en: 'Argentina', zh: '阿根廷' }, { code: 'ES', flag: '🇪🇸', en: 'Spain', zh: '西班牙' }, { code: 'PL', flag: '🇵🇱', en: 'Poland', zh: '波兰' }, { code: 'IE', flag: '🇮🇪', en: 'Ireland', zh: '爱尔兰' }, { code: 'RO', flag: '🇷🇴', en: 'Romania', zh: '罗马尼亚' }, { code: 'LT', flag: '🇱🇹', en: 'Lithuania', zh: '立陶宛' }, { code: 'CM', flag: '🇨🇲', en: 'Cameroon', zh: '喀麦隆' } ];
    const counters = {};
    const getCountryByCode = (code) => code ? countryData.find(c => c.code.toUpperCase() === code.toUpperCase()) : null;
    
    const getRegionInfo = async (proxy) => {
        // 模式一: (已被证明无效, 跳过)
        if (config.ipApiKey && config.countryCodeKey && proxy[config.ipApiKey]) {
            // ...
        }

        const server = proxy.server.split(':')[0].toLowerCase();

        // 域名规则匹配 (作为补充)
        const parts = server.split('.');
        for (const part of parts) {
            if (customDomainMap[part]) {
                return getCountryByCode(customDomainMap[part]);
            }
        }
        
        // 模式二: 如果前面都失败了, 并且用户开启了后备 API, 则自己查询
        if (config.enableFallbackApi) {
            try {
                // 判断是否为IP地址, 避免查询域名
                const isIpAddress = /^((\d{1,3}\.){3}\d{1,3})$/.test(server);
                if (isIpAddress) {
                    const url = config.fallbackApiUrl.replace('{query}', server);
                    const response = await $httpClient.get(url);
                    const data = JSON.parse(response.body);
                    if (data.status === 'success' && data.countryCode) {
                        return getCountryByCode(data.countryCode);
                    }
                }
            } catch (error) {
                console.log(`Fallback IP API query failed for ${server}: ${error.message}`);
            }
        }
        
        return null; // 所有方法都失败
    };

    // --- 主处理流程 ---
    const processedProxiesPromises = proxies.map(async (p) => {
        const regionInfo = await getRegionInfo(p);
        if (regionInfo) {
            const baseParts = [];
            if (config.flag) baseParts.push(regionInfo.flag);
            const regionName = config.out === 'zh' ? regionInfo.zh : regionInfo.en;
            baseParts.push(regionName);
            const baseName = baseParts.join(' ');
            const additionalParts = [];
            if (config.customText) additionalParts.push(config.customText);
            if (config.enableNumbering) {
                counters[regionInfo.code] = (counters[regionInfo.code] || 0) + 1;
                additionalParts.push(String(counters[regionInfo.code]).padStart(2, '0'));
            }
            let finalName = baseName;
            if (additionalParts.length > 0) {
                finalName += config.separator + additionalParts.join(config.separator);
            }
            p.name = finalName;
            return p;
        }
        return config.keepUnidentified ? p : null;
    });

    const resolvedProxies = await Promise.all(resolvedProxies);
    const newProxies = resolvedProxies.filter(p => p !== null);
    return newProxies.length > 0 ? newProxies : proxies;
}
