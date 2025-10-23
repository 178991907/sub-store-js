async function operator(proxies, targetPlatform, env) {
  const {
    lang = 'zh-CN',
    concurrency = 8,           // 并发
    maxPerMinute = 45,         // ip-api 免费版预算
    retryDelayMs = 60000,      // 分钟间隔
    numbering = true,          // 是否编号
    start = 1,                 // 编号起始
    customText = '',           // 额外标注文本
    prefer = 'ip-api',         // 'ip-api' | 'mmdb'
  } = (typeof $arguments === 'object' ? $arguments : {}) || {};

  const cacheKey = '#geo-country-cache';
  const cache = scriptResourceCache.get(cacheKey) || {};

  const mmdb = (() => {
    try { return new ProxyUtils.MMDB(); } catch (e) { return null; }
  })();

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const isIPLiteral = (h) => /^(\d{1,3}\.){3}\d{1,3}$/.test(h) || /^[0-9a-fA-F:]+$/.test(h);
  const cleanHost = (h = '') => (h || '').replace(/^\[|]$/g, '').trim();

  const isoToFlag = (iso) => {
    if (!iso || iso.length !== 2) return '';
    const codePoints = [...iso.toUpperCase()].map(c => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const nameOfISO = (iso, zh = true) => {
    // 常见国家映射；未列出则使用 ISO 作为兜底
    const MAP_ZH = {
      CN:'中国', HK:'香港', MO:'澳门', TW:'台湾', JP:'日本', KR:'韩国',
      US:'美国', CA:'加拿大', GB:'英国', DE:'德国', FR:'法国', NL:'荷兰',
      RU:'俄罗斯', SG:'新加坡', AU:'澳大利亚', IN:'印度', ID:'印度尼西亚',
      TH:'泰国', VN:'越南', MY:'马来西亚', PH:'菲律宾', AE:'阿联酋'
    };
    const MAP_EN = {
      CN:'China', HK:'Hong Kong', MO:'Macau', TW:'Taiwan', JP:'Japan', KR:'South Korea',
      US:'United States', CA:'Canada', GB:'United Kingdom', DE:'Germany', FR:'France', NL:'Netherlands',
      RU:'Russia', SG:'Singapore', AU:'Australia', IN:'India', ID:'Indonesia',
      TH:'Thailand', VN:'Vietnam', MY:'Malaysia', PH:'Philippines', AE:'UAE'
    };
    const map = zh ? MAP_ZH : MAP_EN;
    return map[iso] || iso;
  };

  async function httpGetJSON(url) {
    // 1) $httpClient
    if (typeof $httpClient !== 'undefined') {
      return new Promise((resolve) => {
        $httpClient.get({ url }, (err, resp, body) => {
          if (err) return resolve(null);
          try {
            if (resp && resp.status === 429) return resolve({ status:'fail', message:'too many requests' });
            const json = JSON.parse(body || '{}');
            resolve(json);
          } catch (e) { resolve(null); }
        });
      });
    }
    // 2) fetch
    if (typeof fetch !== 'undefined') {
      const resp = await fetch(url);
      if (resp.status === 429) return { status:'fail', message:'too many requests' };
      return await resp.json();
    }
    // 3) Node http
    try {
      const http = eval('require("http")');
      return await new Promise((resolve) => {
        http.get(url, (res) => {
          if (res.statusCode === 429) return resolve({ status:'fail', message:'too many requests' });
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => {
            try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve(null); }
          });
        }).on('error', () => resolve(null));
      });
    } catch (e) { return null; }
  }

  async function lookupCountryOnline(ip) {
    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?lang=${lang}&fields=status,country,countryCode,message`;
    try {
      const data = await httpGetJSON(url);
      if (!data) return { code: undefined, name: undefined, rateLimited: false };
      if (data.status === 'success') {
        return { code: (data.countryCode || '').toUpperCase(), name: data.country, rateLimited: false };
      }
      const msg = (data.message || '').toLowerCase();
      if (msg.includes('too many requests')) {
        return { code: undefined, name: undefined, rateLimited: true };
      }
    } catch (e) { /* 网络错误，稍后回退 */ }
    return { code: undefined, name: undefined, rateLimited: false };
  }

  function lookupCountryOffline(ip) {
    try {
      const iso = mmdb?.geoip(ip);
      if (iso) {
        const isoUp = iso.toUpperCase();
        return { code: isoUp, name: nameOfISO(isoUp, lang.startsWith('zh')), rateLimited: false };
      }
    } catch (e) { /* ignore */ }
    return { code: undefined, name: undefined, rateLimited: false };
  }

  async function runWithConcurrency(items, limit, worker) {
    const results = new Array(items.length);
    let idx = 0;
    const runOne = async () => {
      while (idx < items.length) {
        const cur = idx++;
        const ip = items[cur];
        try {
          results[cur] = await worker(ip);
        } catch (e) {
          results[cur] = { code: undefined, name: undefined, rateLimited: false };
        }
      }
    };
    const workers = Array(Math.min(limit, items.length)).fill(0).map(runOne);
    await Promise.all(workers);
    return results;
  }

  // 收集唯一 IP：优先使用域名解析算子写入的 _IP，其次 server 字段
  const ips = [...new Set(
    proxies
      .map(p => cleanHost(p._IP || p.server))
      .filter(h => isIPLiteral(h))
  )];

  // 先用缓存填充
  const unknown = ips.filter(ip => !cache[ip] || !cache[ip].code);

  const zh = lang.startsWith('zh');

  if (prefer === 'mmdb') {
    // 严格离线：仅用 MMDB 一次性完成识别
    const results = await runWithConcurrency(unknown, concurrency, async (ip) => lookupCountryOffline(ip));
    for (let i = 0; i < unknown.length; i++) {
      const ip = unknown[i];
      const r = results[i] || {};
      cache[ip] = { code: r.code, name: r.name };
    }
    scriptResourceCache.set(cacheKey, cache);
  } else {
    // 在线模式：分钟预算 + 限速重试，失败回退 MMDB
    while (unknown.length > 0) {
      const minuteStart = Date.now();
      const batch = unknown.splice(0, maxPerMinute);
      const results = await runWithConcurrency(batch, concurrency, lookupCountryOnline);

      const needNext = [];
      for (let i = 0; i < batch.length; i++) {
        const ip = batch[i];
        const r = results[i] || {};
        if (r.rateLimited) {
          needNext.push(ip);                 // 受限，下一分钟再试
        } else if (r.code) {
          cache[ip] = { code: r.code, name: r.name }; // 在线成功
        } else {
          // 在线失败，尝试离线回退
          const off = lookupCountryOffline(ip);
          cache[ip] = { code: off.code, name: off.name };
        }
      }
      if (needNext.length > 0) {
        unknown.unshift(...needNext);
      }
      scriptResourceCache.set(cacheKey, cache);

      if (unknown.length > 0) {
        const elapsed = Date.now() - minuteStart;
        const wait = Math.max(retryDelayMs - elapsed, 5000);
        await sleep(wait);
      }
    }
  }

  // 重命名：仅国家与旗帜；可编号与自定义文本；不显示州/省
  let seq = start;
  const renamed = proxies.map((p) => {
    const host = cleanHost(p._IP || p.server);
    const info = cache[host] || {};
    const iso = info.code && info.code.toUpperCase();
    const flag = isoToFlag(iso) || ''; // 未识别不加旗帜
    const countryName = iso ? (info.name || nameOfISO(iso, zh)) : (zh ? '未知' : 'Unknown');

    // 清除旧旗帜，保留纯国家信息
    const base = ProxyUtils.removeFlag(p.name);

    const num = numbering ? ` ${String(seq).padStart(2, '0')}` : '';
    if (numbering) seq++;

    const extra = customText ? ` ${customText}` : '';
    // 最终仅显示国家与旗帜（按需编号与附加文本）
    p.name = `${flag ? flag + ' ' : ''}${countryName}${extra}${num}`.trim();

    return p;
  });

  return renamed;
}
