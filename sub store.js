async function operator(proxies, targetPlatform, env) {
  // --- 全局参数配置 ---
  // 这些参数可以通过在 Sub Store 的脚本链接末尾添加 &key=value 的形式来覆盖
  const {
    lang = 'zh-CN',            // 优选语言, 'zh-CN' 为中文
    concurrency = 8,           // 查询 IP 时的并发请求数
    maxPerMinute = 45,         // ip-api.com 免费 API 的每分钟请求上限
    retryDelayMs = 60000,      // 遇到 API 限制后, 等待多少毫秒再重试 (60000ms = 1分钟)
    numbering = true,          // 是否在节点名称后添加序号 (true/false)
    start = 1,                 // 序号起始编号
    customText = '',           // 额外在节点名称中添加的自定义文本, 如 'BIP'
    prefer = 'ip-api',         // 优先使用的查询方式。'ip-api' (在线) 或 'mmdb' (离线)。建议保持默认'ip-api'以建立缓存
  } = (typeof $arguments === 'object' ? $arguments : {}) || {};

  // --- 内部工具与缓存定义 ---
  const cacheKey = '#geo-country-cache'; // 定义用于在 Sub Store 中存储 IP 查询结果的缓存键
  const cache = scriptResourceCache.get(cacheKey) || {}; // 尝试从缓存中读取已有的 IP 数据

  // 尝试初始化本地 MMDB 查询工具, 作为备用方案
  const mmdb = (() => {
    try { return new ProxyUtils.MMDB(); } catch (e) { return null; }
  })();

  // --- 核心功能函数 ---

  // 暂停函数
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  // 判断是否为纯 IP 地址
  const isIPLiteral = (h) => /^(\d{1,3}\.){3}\d{1,3}$/.test(h) || /^[0-9a-fA-F:]+$/.test(h);
  // 清理主机名中的无效字符
  const cleanHost = (h = '') => (h || '').replace(/^\[|]$/g, '').trim();

  // 将国家代码 (ISO) 转换为国旗 Emoji
  const isoToFlag = (iso) => {
    if (!iso || iso.length !== 2) return '';
    const codePoints = [...iso.toUpperCase()].map(c => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  // 国家代码到名称的映射 (中文/英文)
  const nameOfISO = (iso, zh = true) => {
    const MAP_ZH = { HK:'香港', MO:'澳门', TW:'台湾', JP:'日本', KR:'韩国', US:'美国', GB:'英国', SG:'新加坡' };
    const MAP_EN = { HK:'Hong Kong', MO:'Macau', TW:'Taiwan', JP:'Japan', KR:'South Korea', US:'United States', GB:'United Kingdom', SG:'Singapore' };
    return (zh ? MAP_ZH : MAP_EN)[iso] || iso;
  };

  // 统一的 HTTP GET 请求函数, 兼容多种环境
  async function httpGetJSON(url) {
    try {
      if (typeof $httpClient !== 'undefined') {
        return new Promise(resolve => {
          $httpClient.get({ url }, (err, resp, body) => {
            if (err || resp.status === 429) return resolve({ status: 'fail', message: 'too many requests' });
            try { resolve(JSON.parse(body)); } catch(e) { resolve(null); }
          });
        });
      }
      if (typeof fetch !== 'undefined') {
        const resp = await fetch(url);
        return resp.status === 429 ? { status: 'fail', message: 'too many requests' } : await resp.json();
      }
    } catch(e) { return null; }
    return null;
  }

  // **在线查询 IP 地理位置**
  async function lookupCountryOnline(ip) {
    // 只请求需要的字段：国家和国家代码, 节约流量
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?lang=${lang}&fields=status,country,countryCode,message`;
    try {
      const data = await httpGetJSON(url);
      if (data && data.status === 'success') {
        // 查询成功, 返回结果
        return { code: (data.countryCode || '').toUpperCase(), name: data.country, rateLimited: false };
      }
      // 检查是否是由于 API 访问频率过高导致的失败
      if (data && (data.message || '').toLowerCase().includes('too many requests')) {
        return { code: undefined, name: undefined, rateLimited: true };
      }
    } catch (e) { /* 网络错误, 将会回退到离线查询 */ }
    return { code: undefined, name: undefined, rateLimited: false };
  }

  // **离线查询 IP 地理位置 (使用 MMDB)**
  function lookupCountryOffline(ip) {
    try {
      const iso = mmdb?.geoip(ip);
      if (iso) {
        const isoUp = iso.toUpperCase();
        return { code: isoUp, name: nameOfISO(isoUp, lang.startsWith('zh')), rateLimited: false };
      }
    } catch (e) { /* 忽略错误 */ }
    return { code: undefined, name: undefined, rateLimited: false };
  }

  // **并发控制器**
  async function runWithConcurrency(items, limit, worker) {
    const results = new Array(items.length);
    let idx = 0;
    const runOne = async () => {
      while (idx < items.length) {
        const cur = idx++;
        const item = items[cur];
        try {
          results[cur] = await worker(item);
        } catch (e) {
          results[cur] = { code: undefined, name: undefined, rateLimited: false };
        }
      }
    };
    const workers = Array(Math.min(limit, items.length)).fill(0).map(runOne);
    await Promise.all(workers);
    return results;
  }

  // --- 主逻辑开始 ---

  // 1. 收集所有唯一的、需要查询的 IP 地址
  const ips = [...new Set(
    proxies
      .map(p => cleanHost(p._IP || p.server))
      .filter(h => isIPLiteral(h))
  )];
  
  // 过滤掉缓存中已有的 IP, 只查询未知的
  const unknown = ips.filter(ip => !cache[ip] || !cache[ip].code);
  const zh = lang.startsWith('zh');

  if (prefer === 'mmdb') {
    // 如果设置为 mmdb 优先, 则只进行一次离线查询
    const results = await runWithConcurrency(unknown, concurrency, lookupCountryOffline);
    results.forEach((r, i) => cache[unknown[i]] = { code: r.code, name: r.name });
    scriptResourceCache.set(cacheKey, cache); // 将新结果存入缓存
  } else {
    // **默认的在线查询逻辑, 带速率控制和重试**
    while (unknown.length > 0) {
      const minuteStart = Date.now();
      // 每次最多取 maxPerMinute 个IP进行查询
      const batch = unknown.splice(0, maxPerMinute);
      const results = await runWithConcurrency(batch, concurrency, lookupCountryOnline);

      const needNext = [];
      for (let i = 0; i < batch.length; i++) {
        const ip = batch[i];
        const r = results[i] || {};
        if (r.rateLimited) {
          needNext.push(ip); // 因API限制失败, 准备下一分钟重试
        } else if (r.code) {
          cache[ip] = { code: r.code, name: r.name }; // 在线查询成功, 存入缓存
        } else {
          // 在线查询失败 (如私有地址), 尝试用离线方式回退
          const off = lookupCountryOffline(ip);
          cache[ip] = { code: off.code, name: off.name };
        }
      }
      
      // 将本轮失败的IP放回待查询列表的最前面
      if (needNext.length > 0) {
        unknown.unshift(...needNext);
      }
      
      // **关键: 将查询结果写入持久化缓存**
      scriptResourceCache.set(cacheKey, cache);

      // 如果还有未查询的IP, 计算需要等待的时间, 直到满1分钟
      if (unknown.length > 0) {
        const elapsed = Date.now() - minuteStart;
        const wait = Math.max(retryDelayMs - elapsed, 5000); // 确保最少等待5秒
        await sleep(wait); // 等待, 以便API速率限制重置
      }
    }
  }

  // 2. 使用查询结果重命名所有节点
  let seq = start;
  const renamed = proxies.map((p) => {
    const host = cleanHost(p._IP || p.server);
    const info = cache[host] || {}; // 从缓存中获取地理信息
    const iso = info.code && info.code.toUpperCase();
    const flag = isoToFlag(iso) || '';
    const countryName = iso ? (info.name || nameOfISO(iso, zh)) : (zh ? '未知' : 'Unknown');

    const num = numbering ? ` ${String(seq).padStart(2, '0')}` : '';
    if (numbering) seq++;

    const extra = customText ? ` ${customText}` : '';
    
    // 最终拼接节点名: [国旗] [国家] [自定义文本] [序号]
    p.name = `${flag ? flag + ' ' : ''}${countryName}${extra}${num}`.trim();
    
    return p;
  });

  return renamed;
}