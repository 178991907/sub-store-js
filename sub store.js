// Async Operator: 使用 IP-API 的 region/regionName 重命名节点
async function operator(proxies) {
  // 1) 配置合并（优先使用 URL 中的 $arguments）
  const defaultConfig = {
    customText: '',
    flag: true,
    out: 'zh',                // 'zh' 或 'en'
    enableNumbering: true,
    separator: ' ',
    keepUnidentified: false,
    concurrency: 5,           // 并发查询数（建议 3~8）
    timeout: 6000             // 单次查询超时 ms
  };
  const args = typeof $arguments === 'object' ? $arguments : {};
  const config = { ...defaultConfig, ...args };

  // 2) 布尔/数字归一化
  const toBool = (v) => v === true || v === 'true';
  config.flag = toBool(config.flag);
  config.enableNumbering = toBool(config.enableNumbering);
  config.keepUnidentified = toBool(config.keepUnidentified);
  const toInt = (v, def) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : def;
  };
  config.concurrency = toInt(config.concurrency, defaultConfig.concurrency);
  config.timeout = toInt(config.timeout, defaultConfig.timeout);

  // 3) 常用国家旗帜与名称映射（补充即可）
  const COUNTRY = {
    HK: { flag: '🇭🇰', zh: '香港', en: 'Hong Kong' },
    TW: { flag: '🇹🇼', zh: '台湾', en: 'Taiwan' },
    JP: { flag: '🇯🇵', zh: '日本', en: 'Japan' },
    KR: { flag: '🇰🇷', zh: '韩国', en: 'Korea' },
    SG: { flag: '🇸🇬', zh: '新加坡', en: 'Singapore' },
    US: { flag: '🇺🇸', zh: '美国', en: 'United States' },
    GB: { flag: '🇬🇧', zh: '英国', en: 'United Kingdom' },
    DE: { flag: '🇩🇪', zh: '德国', en: 'Germany' },
    FR: { flag: '🇫🇷', zh: '法国', en: 'France' },
    CA: { flag: '🇨🇦', zh: '加拿大', en: 'Canada' },
    AU: { flag: '🇦🇺', zh: '澳大利亚', en: 'Australia' },
    RU: { flag: '🇷🇺', zh: '俄罗斯', en: 'Russia' },
    IN: { flag: '🇮🇳', zh: '印度', en: 'India' },
    BR: { flag: '🇧🇷', zh: '巴西', en: 'Brazil' },
    NL: { flag: '🇳🇱', zh: '荷兰', en: 'Netherlands' },
    IT: { flag: '🇮🇹', zh: '意大利', en: 'Italy' },
    CH: { flag: '🇨🇭', zh: '瑞士', en: 'Switzerland' },
    SE: { flag: '🇸🇪', zh: '瑞典', en: 'Sweden' },
    TR: { flag: '🇹🇷', zh: '土耳其', en: 'Turkey' },
    VN: { flag: '🇻🇳', zh: '越南', en: 'Vietnam' },
    TH: { flag: '🇹🇭', zh: '泰国', en: 'Thailand' },
    MY: { flag: '🇲🇾', zh: '马来西亚', en: 'Malaysia' },
    ID: { flag: '🇮🇩', zh: '印尼', en: 'Indonesia' },
    PH: { flag: '🇵🇭', zh: '菲律宾', en: 'Philippines' },
    AE: { flag: '🇦🇪', zh: '阿联酋', en: 'United Arab Emirates' },
    ZA: { flag: '🇿🇦', zh: '南非', en: 'South Africa' },
    AR: { flag: '🇦🇷', zh: '阿根廷', en: 'Argentina' },
    ES: { flag: '🇪🇸', zh: '西班牙', en: 'Spain' },
    PL: { flag: '🇵🇱', zh: '波兰', en: 'Poland' },
    IE: { flag: '🇮🇪', zh: '爱尔兰', en: 'Ireland' },
    RO: { flag: '🇷🇴', zh: '罗马尼亚', en: 'Romania' },
    LT: { flag: '🇱🇹', zh: '立陶宛', en: 'Lithuania' },
    CM: { flag: '🇨🇲', zh: '喀麦隆', en: 'Cameroon' }
  };

  // 4) 自定义域名关键词映射（你提供的）
  const customDomainMap = {
    yd: 'HK', dx: 'HK', lt: 'HK', cm: 'CM', wto: 'US',
    visasg: 'SG', openai: 'US', shopify: 'US', bp: 'US', qms: 'US', sy: 'US'
  };

  // 5) 工具函数
  const langParam = config.out === 'en' ? 'en' : 'zh-CN';
  const fields = 'status,message,query,country,countryCode,region,regionName,city';
  const counters = {};
  const cache = new Map();

  const cleanHost = (server) => {
    let host = String(server || '').trim();
    // 去掉端口与 IPv6 包裹
    host = host.split(':')[0].replace(/^\[/, '').replace(/\]$/, '');
    return host.toLowerCase();
  };
  const isIPLiteral = (host) =>
    /^(\d{1,3}(\.\d{1,3}){3})$/.test(host) || /^[0-9a-fA-F:]+$/.test(host);

  // 优先使用 Loon/Surge 的 $httpClient，其次 fetch，最后 Node http
  async function httpGetJSON(url, timeout = 6000) {
    if (typeof $httpClient !== 'undefined' && $httpClient?.get) {
      return await new Promise((resolve, reject) => {
        const req = $httpClient.get(
          { url, headers: { 'User-Agent': 'Sub-Store-Script/1.0' } },
          (err, resp, body) => {
            if (err) return reject(err);
            try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
          }
        );
        // 部分环境不支持设置超时，这里按需忽略
      });
    }
    if (typeof fetch === 'function') {
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const tid = ctrl ? setTimeout(() => ctrl.abort(), timeout) : null;
      try {
        const res = await fetch(url, { signal: ctrl?.signal, headers: { 'User-Agent': 'Sub-Store-Script/1.0' } });
        if (tid) clearTimeout(tid);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (e) {
        if (tid) clearTimeout(tid);
        throw e;
      }
    }
    const http = require('http');
    return await new Promise((resolve, reject) => {
      const req = http.get(url, { headers: { 'User-Agent': 'Sub-Store-Script/1.0' } }, (res) => {
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => {
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        });
      });
      req.setTimeout(timeout, () => { try { req.abort(); } catch (e) {} reject(new Error('Timeout')); });
      req.on('error', reject);
    });
  }

  async function lookupRegion(host) {
    if (!host) return null;
    if (cache.has(host)) return cache.get(host);

    // 先做域名关键词快速映射
    const parts = host.split('.');
    for (const part of parts) {
      const cc = customDomainMap[part];
      if (cc && COUNTRY[cc]) {
        const info = { countryCode: cc, regionName: COUNTRY[cc][config.out], country: COUNTRY[cc].en, query: null };
        cache.set(host, info);
        return info;
      }
    }

    // 直接查询 IP-API（支持域名/IPv4/IPv6）
    try {
      const url = `http://ip-api.com/json/${encodeURIComponent(host)}?lang=${langParam}&fields=${fields}`;
      const data = await httpGetJSON(url, config.timeout);
      if (data.status !== 'success') throw new Error(data.message || 'IP-API failed');
      const info = {
        countryCode: data.countryCode,
        region: data.region,
        regionName: data.regionName || data.country,
        country: data.country,
        query: data.query
      };
      cache.set(host, info);
      return info;
    } catch (e) {
      // 可选：当 host 是字面量 IP 且系统配置了 MMDB，走离线国家兜底（仅国家，不含省/州）
      try {
        if (isIPLiteral(host) && typeof ProxyUtils !== 'undefined' && ProxyUtils?.MMDB) {
          const mmdb = new ProxyUtils.MMDB({});
          const iso = mmdb.geoip(host);
          if (iso && COUNTRY[iso]) {
            const info = { countryCode: iso, regionName: COUNTRY[iso][config.out], country: COUNTRY[iso].en, query: host };
            cache.set(host, info);
            return info;
          }
        }
      } catch (_) {}
      return null;
    }
  }

  async function runWithConcurrency(items, fn, concurrency) {
    const results = new Array(items.length);
    let idx = 0;
    async function worker() {
      while (idx < items.length) {
        const i = idx++;
        try { results[i] = await fn(items[i]); } catch (_) { results[i] = null; }
      }
    }
    await Promise.all(Array.from({ length: concurrency }, worker));
    return results;
  }

  // 6) 批量查询
  const hosts = proxies.map((p) => cleanHost(p.server));
  const infos = await runWithConcurrency(hosts, lookupRegion, config.concurrency);

  // 7) 命名与返回
  const outIsZh = config.out === 'zh';
  const renamed = [];
  for (let i = 0; i < proxies.length; i++) {
    const p = { ...proxies[i] };
    const info = infos[i];
    if (!info) { if (config.keepUnidentified) renamed.push(p); continue; }

    const cc = info.countryCode || 'US';
    const flag = config.flag && COUNTRY[cc]?.flag ? COUNTRY[cc].flag : '';
    // 优先使用 regionName；缺省时回退到国家名
    const displayName =
      info.regionName ||
      (COUNTRY[cc] ? (outIsZh ? COUNTRY[cc].zh : COUNTRY[cc].en) : (outIsZh ? cc : cc));

    // 编号与附加文本
    const extraParts = [];
    if (config.customText) extraParts.push(config.customText);
    if (config.enableNumbering) {
      counters[cc] = (counters[cc] || 0) + 1;
      extraParts.push(String(counters[cc]).padStart(2, '0'));
    }

    const base = [flag, displayName].filter(Boolean).join(' '); // 旗帜与地区名之间固定空格
    p.name = extraParts.length ? base + config.separator + extraParts.join(config.separator) : base;
    renamed.push(p);
  }

  return renamed.length > 0 ? renamed : proxies;
}