{\rtf1\ansi\ansicpg936\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset134 PingFangSC-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 /**\
 * \'ba\'cf\'b2\'a2\'c8\'d5\'c6\'da\'a3\'ba2024-09-08 \
 * \'d0\'de\'b8\'c4\'a3\'ba\'d3\'c5\'cf\'c8\'ca\'b6\'b1\'f0IP\'ba\'cd\'d3\'f2\'c3\'fb\'bd\'da\'b5\'e3\'a3\'ac\'cd\'a8\'b9\'fd\'b1\'be\'b5\'d8\'ca\'fd\'be\'dd\'bf\'e2\'ca\'b6\'b1\'f0\'b5\'d8\'c0\'ed\'ce\'bb\'d6\'c3\
 * \'d3\'c3\'b7\'a8\'a3\'baSub-Store \'bd\'c5\'b1\'be\'b2\'d9\'d7\'f7\'cc\'ed\'bc\'d3\
 */\
\
const inArg = $arguments;\
const nx = inArg.nx || false,\
  bl = inArg.bl || false,\
  nf = inArg.nf || false,\
  key = inArg.key || false,\
  blgd = inArg.blgd || false,\
  blpx = inArg.blpx || false,\
  blnx = inArg.blnx || false,\
  numone = inArg.one || false,\
  debug = inArg.debug || false,\
  clear = inArg.clear || false,\
  addflag = inArg.flag || false,\
  nm = inArg.nm || false;\
\
const FGF = inArg.fgf == undefined ? " " : decodeURI(inArg.fgf),\
  XHFGF = inArg.sn == undefined ? " " : decodeURI(inArg.sn),\
  FNAME = inArg.name == undefined ? "" : decodeURI(inArg.name),\
  BLKEY = inArg.blkey == undefined ? "" : decodeURI(inArg.blkey),\
  blockquic = inArg.blockquic == undefined ? "" : decodeURI(inArg.blockquic);\
\
// IP\'ba\'cd\'d3\'f2\'c3\'fb\'ca\'b6\'b1\'f0\'cf\'e0\'b9\'d8\'ba\'af\'ca\'fd\
function isIPAddress(str) \{\
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.)\{3\}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;\
  return ipRegex.test(str);\
\}\
\
function isDomain(str) \{\
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\\-]\{0,61\}[a-zA-Z0-9])?\\.)+[a-zA-Z]\{2,\}$/;\
  return domainRegex.test(str);\
\}\
\
// \'b1\'be\'b5\'d8IP/\'d3\'f2\'c3\'fb\'b5\'bd\'b9\'fa\'bc\'d2\'b5\'c4\'d3\'b3\'c9\'e4\'ca\'fd\'be\'dd\'bf\'e2\'a3\'a8\'bc\'f2\'bb\'af\'b0\'e6\'a3\'a9\
const localGeoDB = \{\
  // IP\'b6\'ce\'b5\'bd\'b9\'fa\'bc\'d2\'d3\'b3\'c9\'e4\
  ipRanges: \{\
    '1.0.0.0-1.255.255.255': 'AU',\
    '8.0.0.0-8.255.255.255': 'US',\
    '14.0.0.0-14.255.255.255': 'CN',\
    '23.0.0.0-23.255.255.255': 'US',\
    '27.0.0.0-27.255.255.255': 'CN',\
    '31.0.0.0-31.255.255.255': 'GB',\
    '36.0.0.0-36.255.255.255': 'CN',\
    '42.0.0.0-42.255.255.255': 'CN',\
    '49.0.0.0-49.255.255.255': 'CN',\
    '58.0.0.0-58.255.255.255': 'CN',\
    '59.0.0.0-59.255.255.255': 'CN',\
    '60.0.0.0-60.255.255.255': 'CN',\
    '61.0.0.0-61.255.255.255': 'CN',\
    '101.0.0.0-101.255.255.255': 'CN',\
    '103.0.0.0-103.255.255.255': 'CN',\
    '110.0.0.0-110.255.255.255': 'CN',\
    '111.0.0.0-111.255.255.255': 'CN',\
    '112.0.0.0-112.255.255.255': 'CN',\
    '112.0.0.0-112.255.255.255': 'CN',\
    '113.0.0.0-113.255.255.255': 'CN',\
    '114.0.0.0-114.255.255.255': 'CN',\
    '115.0.0.0-115.255.255.255': 'CN',\
    '116.0.0.0-116.255.255.255': 'CN',\
    '117.0.0.0-117.255.255.255': 'CN',\
    '118.0.0.0-118.255.255.255': 'CN',\
    '119.0.0.0-119.255.255.255': 'CN',\
    '120.0.0.0-120.255.255.255': 'CN',\
    '121.0.0.0-121.255.255.255': 'CN',\
    '122.0.0.0-122.255.255.255': 'CN',\
    '123.0.0.0-123.255.255.255': 'CN',\
    '124.0.0.0-124.255.255.255': 'CN',\
    '125.0.0.0-125.255.255.255': 'CN',\
    '183.0.0.0-183.255.255.255': 'CN',\
    '202.0.0.0-202.255.255.255': 'CN',\
    '203.0.0.0-203.255.255.255': 'CN',\
    '210.0.0.0-210.255.255.255': 'CN',\
    '211.0.0.0-211.255.255.255': 'CN',\
    '218.0.0.0-218.255.255.255': 'CN',\
    '219.0.0.0-219.255.255.255': 'CN',\
    '220.0.0.0-220.255.255.255': 'CN',\
    '221.0.0.0-221.255.255.255': 'CN',\
    '222.0.0.0-222.255.255.255': 'CN',\
    '192.168.0.0-192.168.255.255': 'PRIVATE',\
    '10.0.0.0-10.255.255.255': 'PRIVATE',\
    '172.16.0.0-172.31.255.255': 'PRIVATE',\
  \},\
  \
  // \'d3\'f2\'c3\'fb\'ba\'f3\'d7\'ba\'b5\'bd\'b9\'fa\'bc\'d2\'d3\'b3\'c9\'e4\
  domainSuffixes: \{\
    '.cn': 'CN',\
    '.hk': 'HK',\
    '.mo': 'MO',\
    '.tw': 'TW',\
    '.jp': 'JP',\
    '.kr': 'KR',\
    '.sg': 'SG',\
    '.us': 'US',\
    '.uk': 'GB',\
    '.fr': 'FR',\
    '.de': 'DE',\
    '.au': 'AU',\
    '.ae': 'AE',\
    '.ca': 'CA',\
    '.de': 'DE',\
    '.fr': 'FR',\
    '.it': 'IT',\
    '.es': 'ES',\
    '.ru': 'RU',\
    '.in': 'IN',\
    '.br': 'BR',\
    '.mx': 'MX',\
    '.id': 'ID',\
  \},\
  \
  // \'d2\'d1\'d6\'aa\'d3\'f2\'c3\'fb\'b5\'bd\'b9\'fa\'bc\'d2\'d3\'b3\'c9\'e4\
  knownDomains: \{\
    'google.com': 'US',\
    'youtube.com': 'US',\
    'facebook.com': 'US',\
    'amazon.com': 'US',\
    'microsoft.com': 'US',\
    'apple.com': 'US',\
    'netflix.com': 'US',\
    'cloudflare.com': 'US',\
    'akamai.com': 'US',\
    'fastly.com': 'US',\
  \}\
\};\
\
// IP\'b5\'d8\'d6\'b7\'d7\'aa\'ca\'fd\'d7\'d6\
function ipToNumber(ip) \{\
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;\
\}\
\
// \'cd\'a8\'b9\'fd\'b1\'be\'b5\'d8\'ca\'fd\'be\'dd\'bf\'e2\'bb\'f1\'c8\'a1IP/\'d3\'f2\'c3\'fb\'b5\'c4\'b9\'fa\'bc\'d2\'b4\'fa\'c2\'eb\
function getCountryFromLocalDB(input) \{\
  // \'bc\'ec\'b2\'e9\'ca\'c7\'b7\'f1\'ca\'c7IP\'b5\'d8\'d6\'b7\
  if (isIPAddress(input)) \{\
    const ipNum = ipToNumber(input);\
    \
    for (const [range, country] of Object.entries(localGeoDB.ipRanges)) \{\
      const [start, end] = range.split('-').map(ipToNumber);\
      if (ipNum >= start && ipNum <= end) \{\
        return country;\
      \}\
    \}\
    return 'UNKNOWN';\
  \}\
  \
  // \'bc\'ec\'b2\'e9\'ca\'c7\'b7\'f1\'ca\'c7\'d3\'f2\'c3\'fb\
  if (isDomain(input)) \{\
    // \'cf\'c8\'bc\'ec\'b2\'e9\'d2\'d1\'d6\'aa\'d3\'f2\'c3\'fb\
    for (const [domain, country] of Object.entries(localGeoDB.knownDomains)) \{\
      if (input.includes(domain)) \{\
        return country;\
      \}\
    \}\
    \
    // \'bc\'ec\'b2\'e9\'d3\'f2\'c3\'fb\'ba\'f3\'d7\'ba\
    for (const [suffix, country] of Object.entries(localGeoDB.domainSuffixes)) \{\
      if (input.endsWith(suffix)) \{\
        return country;\
      \}\
    \}\
  \}\
  \
  return 'UNKNOWN';\
\}\
\
// \'b4\'d3\'bd\'da\'b5\'e3\'d0\'c5\'cf\'a2\'d6\'d0\'cc\'e1\'c8\'a1IP\'bb\'f2\'d3\'f2\'c3\'fb\
function extractIPOrDomain(proxy) \{\
  // \'d3\'c5\'cf\'c8\'b4\'d3server\'d7\'d6\'b6\'ce\'bb\'f1\'c8\'a1\
  if (proxy.server && (isIPAddress(proxy.server) || isDomain(proxy.server))) \{\
    return proxy.server;\
  \}\
  \
  // \'b4\'d3name\'d7\'d6\'b6\'ce\'b3\'a2\'ca\'d4\'cc\'e1\'c8\'a1\
  const name = proxy.name || '';\
  \
  // \'b3\'a2\'ca\'d4\'c6\'a5\'c5\'e4IP\'b5\'d8\'d6\'b7\
  const ipMatch = name.match(/(\\d\{1,3\}\\.\\d\{1,3\}\\.\\d\{1,3\}\\.\\d\{1,3\})/);\
  if (ipMatch) \{\
    return ipMatch[1];\
  \}\
  \
  // \'b3\'a2\'ca\'d4\'c6\'a5\'c5\'e4\'d3\'f2\'c3\'fb\
  const domainMatch = name.match(/([a-zA-Z0-9]([a-zA-Z0-9\\-]\{0,61\}[a-zA-Z0-9])?\\.)+[a-zA-Z]\{2,\}/);\
  if (domainMatch) \{\
    return domainMatch[0];\
  \}\
  \
  return null;\
\}\
\
// \'b9\'fa\'bc\'d2\'b4\'fa\'c2\'eb\'d3\'b3\'c9\'e4\'b1\'ed\
const countryMaps = \{\
  // \'bc\'f2\'d0\'b4\'b5\'bd\'c8\'ab\'b3\'c6\'d3\'b3\'c9\'e4\
  EN: ['HK','MO','TW','JP','KR','SG','US','GB','FR','DE','AU','AE','AF','AL','DZ','AO','AR','AM','AT','AZ','BH','BD','BY','BE','BZ','BJ','BT','BO','BA','BW','BR','VG','BN','BG','BF','BI','KH','CM','CA','CV','KY','CF','TD','CL','CO','KM','CG','CD','CR','HR','CY','CZ','DK','DJ','DO','EC','EG','SV','GQ','ER','EE','ET','FJ','FI','GA','GM','GE','GH','GR','GL','GT','GN','GY','HT','HN','HU','IS','IN','ID','IR','IQ','IE','IM','IL','IT','CI','JM','JO','KZ','KE','KW','KG','LA','LV','LB','LS','LR','LY','LT','LU','MK','MG','MW','MY','MV','ML','MT','MR','MU','MX','MD','MC','MN','ME','MA','MZ','MM','NA','NP','NL','NZ','NI','NE','NG','KP','NO','OM','PK','PA','PY','PE','PH','PT','PR','QA','RO','RU','RW','SM','SA','SN','RS','SL','SK','SI','SO','ZA','ES','LK','SD','SR','SZ','SE','CH','SY','TJ','TZ','TH','TG','TO','TT','TN','TR','TM','VI','UG','UA','UY','UZ','VE','VN','YE','ZM','ZW','AD','RE','PL','GU','VA','LI','CW','SC','AQ','GI','CU','FO','AX','BM','TL'],\
  \
  // \'b9\'fa\'c6\'ec\'d3\'b3\'c9\'e4\
  FG: ['\uc0\u55356 \u56813 \u55356 \u56816 ','\u55356 \u56818 \u55356 \u56820 ','\u55356 \u56825 \u55356 \u56828 ','\u55356 \u56815 \u55356 \u56821 ','\u55356 \u56816 \u55356 \u56823 ','\u55356 \u56824 \u55356 \u56812 ','\u55356 \u56826 \u55356 \u56824 ','\u55356 \u56812 \u55356 \u56807 ','\u55356 \u56811 \u55356 \u56823 ','\u55356 \u56809 \u55356 \u56810 ','\u55356 \u56806 \u55356 \u56826 ','\u55356 \u56806 \u55356 \u56810 ','\u55356 \u56806 \u55356 \u56811 ','\u55356 \u56806 \u55356 \u56817 ','\u55356 \u56809 \u55356 \u56831 ','\u55356 \u56806 \u55356 \u56820 ','\u55356 \u56806 \u55356 \u56823 ','\u55356 \u56806 \u55356 \u56818 ','\u55356 \u56806 \u55356 \u56825 ','\u55356 \u56806 \u55356 \u56831 ','\u55356 \u56807 \u55356 \u56813 ','\u55356 \u56807 \u55356 \u56809 ','\u55356 \u56807 \u55356 \u56830 ','\u55356 \u56807 \u55356 \u56810 ','\u55356 \u56807 \u55356 \u56831 ','\u55356 \u56807 \u55356 \u56815 ','\u55356 \u56807 \u55356 \u56825 ','\u55356 \u56807 \u55356 \u56820 ','\u55356 \u56807 \u55356 \u56806 ','\u55356 \u56807 \u55356 \u56828 ','\u55356 \u56807 \u55356 \u56823 ','\u55356 \u56827 \u55356 \u56812 ','\u55356 \u56807 \u55356 \u56819 ','\u55356 \u56807 \u55356 \u56812 ','\u55356 \u56807 \u55356 \u56811 ','\u55356 \u56807 \u55356 \u56814 ','\u55356 \u56816 \u55356 \u56813 ','\u55356 \u56808 \u55356 \u56818 ','\u55356 \u56808 \u55356 \u56806 ','\u55356 \u56808 \u55356 \u56827 ','\u55356 \u56816 \u55356 \u56830 ','\u55356 \u56808 \u55356 \u56811 ','\u55356 \u56825 \u55356 \u56809 ','\u55356 \u56808 \u55356 \u56817 ','\u55356 \u56808 \u55356 \u56820 ','\u55356 \u56816 \u55356 \u56818 ','\u55356 \u56808 \u55356 \u56812 ','\u55356 \u56808 \u55356 \u56809 ','\u55356 \u56808 \u55356 \u56823 ','\u55356 \u56813 \u55356 \u56823 ','\u55356 \u56808 \u55356 \u56830 ','\u55356 \u56808 \u55356 \u56831 ','\u55356 \u56809 \u55356 \u56816 ','\u55356 \u56809 \u55356 \u56815 ','\u55356 \u56809 \u55356 \u56820 ','\u55356 \u56810 \u55356 \u56808 ','\u55356 \u56810 \u55356 \u56812 ','\u55356 \u56824 \u55356 \u56827 ','\u55356 \u56812 \u55356 \u56822 ','\u55356 \u56810 \u55356 \u56823 ','\u55356 \u56810 \u55356 \u56810 ','\u55356 \u56810 \u55356 \u56825 ','\u55356 \u56811 \u55356 \u56815 ','\u55356 \u56811 \u55356 \u56814 ','\u55356 \u56812 \u55356 \u56806 ','\u55356 \u56812 \u55356 \u56818 ','\u55356 \u56812 \u55356 \u56810 ','\u55356 \u56812 \u55356 \u56813 ','\u55356 \u56812 \u55356 \u56823 ','\u55356 \u56812 \u55356 \u56817 ','\u55356 \u56812 \u55356 \u56825 ','\u55356 \u56812 \u55356 \u56819 ','\u55356 \u56812 \u55356 \u56830 ','\u55356 \u56813 \u55356 \u56825 ','\u55356 \u56813 \u55356 \u56819 ','\u55356 \u56813 \u55356 \u56826 ','\u55356 \u56814 \u55356 \u56824 ','\u55356 \u56814 \u55356 \u56819 ','\u55356 \u56814 \u55356 \u56809 ','\u55356 \u56814 \u55356 \u56823 ','\u55356 \u56814 \u55356 \u56822 ','\u55356 \u56814 \u55356 \u56810 ','\u55356 \u56814 \u55356 \u56818 ','\u55356 \u56814 \u55356 \u56817 ','\u55356 \u56814 \u55356 \u56825 ','\u55356 \u56808 \u55356 \u56814 ','\u55356 \u56815 \u55356 \u56818 ','\u55356 \u56815 \u55356 \u56820 ','\u55356 \u56816 \u55356 \u56831 ','\u55356 \u56816 \u55356 \u56810 ','\u55356 \u56816 \u55356 \u56828 ','\u55356 \u56816 \u55356 \u56812 ','\u55356 \u56817 \u55356 \u56806 ','\u55356 \u56817 \u55356 \u56827 ','\u55356 \u56817 \u55356 \u56807 ','\u55356 \u56817 \u55356 \u56824 ','\u55356 \u56817 \u55356 \u56823 ','\u55356 \u56817 \u55356 \u56830 ','\u55356 \u56817 \u55356 \u56825 ','\u55356 \u56817 \u55356 \u56826 ','\u55356 \u56818 \u55356 \u56816 ','\u55356 \u56818 \u55356 \u56812 ','\u55356 \u56818 \u55356 \u56828 ','\u55356 \u56818 \u55356 \u56830 ','\u55356 \u56818 \u55356 \u56827 ','\u55356 \u56818 \u55356 \u56817 ','\u55356 \u56818 \u55356 \u56825 ','\u55356 \u56818 \u55356 \u56823 ','\u55356 \u56818 \u55356 \u56826 ','\u55356 \u56818 \u55356 \u56829 ','\u55356 \u56818 \u55356 \u56809 ','\u55356 \u56818 \u55356 \u56808 ','\u55356 \u56818 \u55356 \u56819 ','\u55356 \u56818 \u55356 \u56810 ','\u55356 \u56818 \u55356 \u56806 ','\u55356 \u56818 \u55356 \u56831 ','\u55356 \u56818 \u55356 \u56818 ','\u55356 \u56819 \u55356 \u56806 ','\u55356 \u56819 \u55356 \u56821 ','\u55356 \u56819 \u55356 \u56817 ','\u55356 \u56819 \u55356 \u56831 ','\u55356 \u56819 \u55356 \u56814 ','\u55356 \u56819 \u55356 \u56810 ','\u55356 \u56819 \u55356 \u56812 ','\u55356 \u56816 \u55356 \u56821 ','\u55356 \u56819 \u55356 \u56820 ','\u55356 \u56820 \u55356 \u56818 ','\u55356 \u56821 \u55356 \u56816 ','\u55356 \u56821 \u55356 \u56806 ','\u55356 \u56821 \u55356 \u56830 ','\u55356 \u56821 \u55356 \u56810 ','\u55356 \u56821 \u55356 \u56813 ','\u55356 \u56821 \u55356 \u56825 ','\u55356 \u56821 \u55356 \u56823 ','\u55356 \u56822 \u55356 \u56806 ','\u55356 \u56823 \u55356 \u56820 ','\u55356 \u56823 \u55356 \u56826 ','\u55356 \u56823 \u55356 \u56828 ','\u55356 \u56824 \u55356 \u56818 ','\u55356 \u56824 \u55356 \u56806 ','\u55356 \u56824 \u55356 \u56819 ','\u55356 \u56823 \u55356 \u56824 ','\u55356 \u56824 \u55356 \u56817 ','\u55356 \u56824 \u55356 \u56816 ','\u55356 \u56824 \u55356 \u56814 ','\u55356 \u56824 \u55356 \u56820 ','\u55356 \u56831 \u55356 \u56806 ','\u55356 \u56810 \u55356 \u56824 ','\u55356 \u56817 \u55356 \u56816 ','\u55356 \u56824 \u55356 \u56809 ','\u55356 \u56824 \u55356 \u56823 ','\u55356 \u56824 \u55356 \u56831 ','\u55356 \u56824 \u55356 \u56810 ','\u55356 \u56808 \u55356 \u56813 ','\u55356 \u56824 \u55356 \u56830 ','\u55356 \u56825 \u55356 \u56815 ','\u55356 \u56825 \u55356 \u56831 ','\u55356 \u56825 \u55356 \u56813 ','\u55356 \u56825 \u55356 \u56812 ','\u55356 \u56825 \u55356 \u56820 ','\u55356 \u56825 \u55356 \u56825 ','\u55356 \u56825 \u55356 \u56819 ','\u55356 \u56825 \u55356 \u56823 ','\u55356 \u56825 \u55356 \u56818 ','\u55356 \u56827 \u55356 \u56814 ','\u55356 \u56826 \u55356 \u56812 ','\u55356 \u56826 \u55356 \u56806 ','\u55356 \u56826 \u55356 \u56830 ','\u55356 \u56826 \u55356 \u56831 ','\u55356 \u56827 \u55356 \u56810 ','\u55356 \u56827 \u55356 \u56819 ','\u55356 \u56830 \u55356 \u56810 ','\u55356 \u56831 \u55356 \u56818 ','\u55356 \u56831 \u55356 \u56828 ','\u55356 \u56806 \u55356 \u56809 ','\u55356 \u56823 \u55356 \u56810 ','\u55356 \u56821 \u55356 \u56817 ','\u55356 \u56812 \u55356 \u56826 ','\u55356 \u56827 \u55356 \u56806 ','\u55356 \u56817 \u55356 \u56814 ','\u55356 \u56808 \u55356 \u56828 ','\u55356 \u56824 \u55356 \u56808 ','\u55356 \u56806 \u55356 \u56822 ','\u55356 \u56812 \u55356 \u56814 ','\u55356 \u56808 \u55356 \u56826 ','\u55356 \u56811 \u55356 \u56820 ','\u55356 \u56806 \u55356 \u56829 ','\u55356 \u56807 \u55356 \u56818 ','\u55356 \u56825 \u55356 \u56817 '],\
  \
  // \'d6\'d0\'ce\'c4\'d3\'b3\'c9\'e4\
  ZH: ['\'cf\'e3\'b8\'db','\'b0\'c4\'c3\'c5','\'cc\'a8\'cd\'e5','\'c8\'d5\'b1\'be','\'ba\'ab\'b9\'fa','\'d0\'c2\'bc\'d3\'c6\'c2','\'c3\'c0\'b9\'fa','\'d3\'a2\'b9\'fa','\'b7\'a8\'b9\'fa','\'b5\'c2\'b9\'fa','\'b0\'c4\'b4\'f3\'c0\'fb\'d1\'c7','\'b0\'a2\'c1\'aa\'c7\'f5','\'b0\'a2\'b8\'bb\'ba\'b9','\'b0\'a2\'b6\'fb\'b0\'cd\'c4\'e1\'d1\'c7','\'b0\'a2\'b6\'fb\'bc\'b0\'c0\'fb\'d1\'c7','\'b0\'b2\'b8\'e7\'c0\'ad','\'b0\'a2\'b8\'f9\'cd\'a2','\'d1\'c7\'c3\'c0\'c4\'e1\'d1\'c7','\'b0\'c2\'b5\'d8\'c0\'fb','\'b0\'a2\'c8\'fb\'b0\'dd\'bd\'ae','\'b0\'cd\'c1\'d6','\'c3\'cf\'bc\'d3\'c0\'ad\'b9\'fa','\'b0\'d7\'b6\'ed\'c2\'de\'cb\'b9','\'b1\'c8\'c0\'fb\'ca\'b1','\'b2\'ae\'c0\'fb\'d7\'c8','\'b1\'b4\'c4\'fe','\'b2\'bb\'b5\'a4','\'b2\'a3\'c0\'fb\'ce\'ac\'d1\'c7','\'b2\'a8\'cb\'b9\'c4\'e1\'d1\'c7\'ba\'cd\'ba\'da\'c8\'fb\'b8\'e7\'ce\'ac\'c4\'c7','\'b2\'a9\'b4\'c4\'cd\'df\'c4\'c9','\'b0\'cd\'ce\'f7','\'d3\'a2\'ca\'f4\'ce\'ac\'be\'a9\'c8\'ba\'b5\'ba','\'ce\'c4\'c0\'b3','\'b1\'a3\'bc\'d3\'c0\'fb\'d1\'c7','\'b2\'bc\'bb\'f9\'c4\'c9\'b7\'a8\'cb\'f7','\'b2\'bc\'c2\'a1\'b5\'cf','\'bc\'ed\'c6\'d2\'d5\'af','\'bf\'a6\'c2\'f3\'c2\'a1','\'bc\'d3\'c4\'c3\'b4\'f3','\'b7\'f0\'b5\'c3\'bd\'c7','\'bf\'aa\'c2\'fc\'c8\'ba\'b5\'ba','\'d6\'d0\'b7\'c7\'b9\'b2\'ba\'cd\'b9\'fa','\'d5\'a7\'b5\'c3','\'d6\'c7\'c0\'fb','\'b8\'e7\'c2\'d7\'b1\'c8\'d1\'c7','\'bf\'c6\'c4\'a6\'c2\'de','\'b8\'d5\'b9\'fb(\'b2\'bc)','\'b8\'d5\'b9\'fb(\'bd\'f0)','\'b8\'e7\'cb\'b9\'b4\'ef\'c0\'e8\'bc\'d3','\'bf\'cb\'c2\'de\'b5\'d8\'d1\'c7','\'c8\'fb\'c6\'d6\'c2\'b7\'cb\'b9','\'bd\'dd\'bf\'cb','\'b5\'a4\'c2\'f3','\'bc\'aa\'b2\'bc\'cc\'e1','\'b6\'e0\'c3\'d7\'c4\'e1\'bc\'d3\'b9\'b2\'ba\'cd\'b9\'fa','\'b6\'f2\'b9\'cf\'b6\'e0\'b6\'fb','\'b0\'a3\'bc\'b0','\'c8\'f8\'b6\'fb\'cd\'df\'b6\'e0','\'b3\'e0\'b5\'c0\'bc\'b8\'c4\'da\'d1\'c7','\'b6\'f2\'c1\'a2\'cc\'d8\'c0\'ef\'d1\'c7','\'b0\'ae\'c9\'b3\'c4\'e1\'d1\'c7','\'b0\'a3\'c8\'fb\'b6\'ed\'b1\'c8\'d1\'c7','\'ec\'b3\'bc\'c3','\'b7\'d2\'c0\'bc','\'bc\'d3\'c5\'ee','\'b8\'d4\'b1\'c8\'d1\'c7','\'b8\'f1\'c2\'b3\'bc\'aa\'d1\'c7','\'bc\'d3\'c4\'c9','\'cf\'a3\'c0\'b0','\'b8\'f1\'c1\'ea\'c0\'bc','\'ce\'a3\'b5\'d8\'c2\'ed\'c0\'ad','\'bc\'b8\'c4\'da\'d1\'c7','\'b9\'e7\'d1\'c7\'c4\'c7','\'ba\'a3\'b5\'d8','\'ba\'e9\'b6\'bc\'c0\'ad\'cb\'b9','\'d0\'d9\'d1\'c0\'c0\'fb','\'b1\'f9\'b5\'ba','\'d3\'a1\'b6\'c8','\'d3\'a1\'c4\'e1','\'d2\'c1\'c0\'ca','\'d2\'c1\'c0\'ad\'bf\'cb','\'b0\'ae\'b6\'fb\'c0\'bc','\'c2\'ed\'b6\'f7\'b5\'ba','\'d2\'d4\'c9\'ab\'c1\'d0','\'d2\'e2\'b4\'f3\'c0\'fb','\'bf\'c6\'cc\'d8\'b5\'cf\'cd\'df','\'d1\'c0\'c2\'f2\'bc\'d3','\'d4\'bc\'b5\'a9','\'b9\'fe\'c8\'f8\'bf\'cb\'cb\'b9\'cc\'b9','\'bf\'cf\'c4\'e1\'d1\'c7','\'bf\'c6\'cd\'fe\'cc\'d8','\'bc\'aa\'b6\'fb\'bc\'aa\'cb\'b9\'cb\'b9\'cc\'b9','\'c0\'cf\'ce\'ce','\'c0\'ad\'cd\'d1\'ce\'ac\'d1\'c7','\'c0\'e8\'b0\'cd\'c4\'db','\'c0\'b3\'cb\'f7\'cd\'d0','\'c0\'fb\'b1\'c8\'c0\'ef\'d1\'c7','\'c0\'fb\'b1\'c8\'d1\'c7','\'c1\'a2\'cc\'d5\'cd\'f0','\'c2\'ac\'c9\'ad\'b1\'a4','\'c2\'ed\'c6\'e4\'b6\'d9','\'c2\'ed\'b4\'ef\'bc\'d3\'cb\'b9\'bc\'d3','\'c2\'ed\'c0\'ad\'ce\'ac','\'c2\'ed\'c0\'b4','\'c2\'ed\'b6\'fb\'b4\'fa\'b7\'f2','\'c2\'ed\'c0\'ef','\'c2\'ed\'b6\'fa\'cb\'fb','\'c3\'ab\'c0\'fb\'cb\'fe\'c4\'e1\'d1\'c7','\'c3\'ab\'c0\'ef\'c7\'f3\'cb\'b9','\'c4\'ab\'ce\'f7\'b8\'e7','\'c4\'a6\'b6\'fb\'b6\'e0\'cd\'df','\'c4\'a6\'c4\'c9\'b8\'e7','\'c3\'c9\'b9\'c5','\'ba\'da\'c9\'bd\'b9\'b2\'ba\'cd\'b9\'fa','\'c4\'a6\'c2\'e5\'b8\'e7','\'c4\'aa\'c9\'a3\'b1\'c8\'bf\'cb','\'c3\'e5\'b5\'e9','\'c4\'c9\'c3\'d7\'b1\'c8\'d1\'c7','\'c4\'e1\'b2\'b4\'b6\'fb','\'ba\'c9\'c0\'bc','\'d0\'c2\'ce\'f7\'c0\'bc','\'c4\'e1\'bc\'d3\'c0\'ad\'b9\'cf','\'c4\'e1\'c8\'d5\'b6\'fb','\'c4\'e1\'c8\'d5\'c0\'fb\'d1\'c7','\'b3\'af\'cf\'ca','\'c5\'b2\'cd\'fe','\'b0\'a2\'c2\'fc','\'b0\'cd\'bb\'f9\'cb\'b9\'cc\'b9','\'b0\'cd\'c4\'c3\'c2\'ed','\'b0\'cd\'c0\'ad\'b9\'e7','\'c3\'d8\'c2\'b3','\'b7\'c6\'c2\'c9\'b1\'f6','\'c6\'cf\'cc\'d1\'d1\'c0','\'b2\'a8\'b6\'e0\'c0\'e8\'b8\'f7','\'bf\'a8\'cb\'fe\'b6\'fb','\'c2\'de\'c2\'ed\'c4\'e1\'d1\'c7','\'b6\'ed\'c2\'de\'cb\'b9','\'c2\'ac\'cd\'fa\'b4\'ef','\'ca\'a5\'c2\'ed\'c1\'a6\'c5\'b5','\'c9\'b3\'cc\'d8\'b0\'a2\'c0\'ad\'b2\'ae','\'c8\'fb\'c4\'da\'bc\'d3\'b6\'fb','\'c8\'fb\'b6\'fb\'ce\'ac\'d1\'c7','\'c8\'fb\'c0\'ad\'c0\'fb\'b0\'ba','\'cb\'b9\'c2\'e5\'b7\'a5\'bf\'cb','\'cb\'b9\'c2\'e5\'ce\'c4\'c4\'e1\'d1\'c7','\'cb\'f7\'c2\'ed\'c0\'ef','\'c4\'cf\'b7\'c7','\'ce\'f7\'b0\'e0\'d1\'c0','\'cb\'b9\'c0\'ef\'c0\'bc\'bf\'a8','\'cb\'d5\'b5\'a4','\'cb\'d5\'c0\'ef\'c4\'cf','\'cb\'b9\'cd\'fe\'ca\'bf\'c0\'bc','\'c8\'f0\'b5\'e4','\'c8\'f0\'ca\'bf','\'d0\'f0\'c0\'fb\'d1\'c7','\'cb\'fe\'bc\'aa\'bf\'cb\'cb\'b9\'cc\'b9','\'cc\'b9\'c9\'a3\'c4\'e1\'d1\'c7','\'cc\'a9\'b9\'fa','\'b6\'e0\'b8\'e7','\'cc\'c0\'bc\'d3','\'cc\'d8\'c1\'a2\'c4\'e1\'b4\'ef\'ba\'cd\'b6\'e0\'b0\'cd\'b8\'e7','\'cd\'bb\'c4\'e1\'cb\'b9','\'cd\'c1\'b6\'fa\'c6\'e4','\'cd\'c1\'bf\'e2\'c2\'fc\'cb\'b9\'cc\'b9','\'c3\'c0\'ca\'f4\'ce\'ac\'b6\'fb\'be\'a9\'c8\'ba\'b5\'ba','\'ce\'da\'b8\'c9\'b4\'ef','\'ce\'da\'bf\'cb\'c0\'bc','\'ce\'da\'c0\'ad\'b9\'e7','\'ce\'da\'d7\'c8\'b1\'f0\'bf\'cb\'cb\'b9\'cc\'b9','\'ce\'af\'c4\'da\'c8\'f0\'c0\'ad','\'d4\'bd\'c4\'cf','\'d2\'b2\'c3\'c5','\'d4\'de\'b1\'c8\'d1\'c7','\'bd\'f2\'b0\'cd\'b2\'bc\'ce\'a4','\'b0\'b2\'b5\'c0\'b6\'fb','\'c1\'f4\'c4\'e1\'cd\'f4','\'b2\'a8\'c0\'bc','\'b9\'d8\'b5\'ba','\'e8\'f3\'b5\'d9\'b8\'d4','\'c1\'d0\'d6\'a7\'b6\'d8\'ca\'bf\'b5\'c7','\'bf\'e2\'c0\'ad\'cb\'f7','\'c8\'fb\'c9\'e0\'b6\'fb','\'c4\'cf\'bc\'ab','\'d6\'b1\'b2\'bc\'c2\'de\'cd\'d3','\'b9\'c5\'b0\'cd','\'b7\'a8\'c2\'de\'c8\'ba\'b5\'ba','\'b0\'c2\'c0\'bc\'c8\'ba\'b5\'ba','\'b0\'d9\'c4\'bd\'b4\'ef','\'b6\'ab\'b5\'db\'e3\'eb'],\
  \
  // \'d3\'a2\'ce\'c4\'c8\'ab\'b3\'c6\'d3\'b3\'c9\'e4\
  QC: ['Hong Kong','Macao','Taiwan','Japan','Korea','Singapore','United States','United Kingdom','France','Germany','Australia','Dubai','Afghanistan','Albania','Algeria','Angola','Argentina','Armenia','Austria','Azerbaijan','Bahrain','Bangladesh','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','British Virgin Islands','Brunei','Bulgaria','Burkina-faso','Burundi','Cambodia','Cameroon','Canada','CapeVerde','CaymanIslands','Central African Republic','Chad','Chile','Colombia','Comoros','Congo-Brazzaville','Congo-Kinshasa','CostaRica','Croatia','Cyprus','Czech Republic','Denmark','Djibouti','Dominican Republic','Ecuador','Egypt','EISalvador','Equatorial Guinea','Eritrea','Estonia','Ethiopia','Fiji','Finland','Gabon','Gambia','Georgia','Ghana','Greece','Greenland','Guatemala','Guinea','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Isle of Man','Israel','Italy','Ivory Coast','Jamaica','Jordan','Kazakstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Lithuania','Luxembourg','Macedonia','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Mauritania','Mauritius','Mexico','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar(Burma)','Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','NorthKorea','Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines','Portugal','PuertoRico','Qatar','Romania','Russia','Rwanda','SanMarino','SaudiArabia','Senegal','Serbia','SierraLeone','Slovakia','Slovenia','Somalia','SouthAfrica','Spain','SriLanka','Sudan','Suriname','Swaziland','Sweden','Switzerland','Syria','Tajikstan','Tanzania','Thailand','Togo','Tonga','TrinidadandTobago','Tunisia','Turkey','Turkmenistan','U.S.Virgin Islands','Uganda','Ukraine','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe','Andorra','Reunion','Poland','Guam','Vatican','Liechtensteins','Curacao','Seychelles','Antarctica','Gibraltar','Cuba','Faroe Islands','Ahvenanmaa','Bermuda','Timor-Leste']\
\};\
\
// \'bb\'f1\'c8\'a1\'ca\'e4\'b3\'f6\'b8\'f1\'ca\'bd\
function getOutputList(outputType) \{\
  switch(outputType) \{\
    case 'us': case 'en': return countryMaps.EN;\
    case 'gq': case 'flag': return countryMaps.FG;\
    case 'quan': return countryMaps.QC;\
    default: return countryMaps.ZH;\
  \}\
\}\
\
function operator(proxies) \{\
  const outputType = inArg.out || 'zh';\
  const outputList = getOutputList(outputType);\
  \
  // \'b4\'a6\'c0\'ed\'c3\'bf\'b8\'f6\'b4\'fa\'c0\'ed\'bd\'da\'b5\'e3\
  proxies.forEach((proxy, index) => \{\
    const ipOrDomain = extractIPOrDomain(proxy);\
    \
    if (ipOrDomain) \{\
      // \'cd\'a8\'b9\'fd\'b1\'be\'b5\'d8\'ca\'fd\'be\'dd\'bf\'e2\'bb\'f1\'c8\'a1\'b9\'fa\'bc\'d2\'b4\'fa\'c2\'eb\
      const countryCode = getCountryFromLocalDB(ipOrDomain);\
      \
      if (countryCode !== 'UNKNOWN' && countryCode !== 'PRIVATE') \{\
    // \'d4\'da\'b9\'fa\'bc\'d2\'b4\'fa\'c2\'eb\'c1\'d0\'b1\'ed\'d6\'d0\'d5\'d2\'b5\'bd\'b6\'d4\'d3\'a6\'b5\'c4\'cb\'f7\'d2\'fd\
    const countryIndex = countryMaps.EN.indexOf(countryCode);\
      \
      if (countryIndex !== -1) \{\
        const newName = outputList[countryIndex];\
        if (newName) \{\
          proxy.name = newName;\
        \}\
      \}\
    \}\
    \
    // \'c8\'e7\'b9\'fb\'ce\'de\'b7\'a8\'ca\'b6\'b1\'f0IP/\'d3\'f2\'c3\'fb\'bb\'f2\'d5\'df\'ca\'b6\'b1\'f0\'ca\'a7\'b0\'dc\'a3\'ac\'b3\'a2\'ca\'d4\'ca\'b9\'d3\'c3\'d4\'ad\'d3\'d0\'b5\'c4\'bd\'da\'b5\'e3\'c3\'fb\'b3\'c6\'c6\'a5\'c5\'e4\'c2\'df\'bc\'ad\
    if (!ipOrDomain || getCountryFromLocalDB(ipOrDomain) === 'UNKNOWN') \{\
      // \'d5\'e2\'c0\'ef\'bf\'c9\'d2\'d4\'cc\'ed\'bc\'d3\'d4\'ad\'d3\'d0\'b5\'c4\'bb\'fa\'b3\'a1\'bd\'da\'b5\'e3\'c3\'fb\'b3\'c6\'c6\'a5\'c5\'e4\'c2\'df\'bc\'ad\'d7\'f7\'ce\'aa\'b1\'b8\'d1\'a1\
      // \'ce\'aa\'c1\'cb\'bc\'f2\'bd\'e0\'a3\'ac\'d5\'e2\'c0\'ef\'ca\'a1\'c2\'d4\'c1\'cb\'d4\'ad\'d3\'d0\'b5\'c4\'b8\'b4\'d4\'d3\'c6\'a5\'c5\'e4\'c2\'df\'bc\'ad\
    \}\
  \});\
  \
  return proxies;\
\}\
\
// \'b5\'bc\'b3\'f6\'b2\'d9\'d7\'f7\'b7\'fb\
if (typeof $done !== "undefined") \{\
  const modifiedProxies = operator($proxies);\
  $done(\{ proxies: modifiedProxies \});\
\}\
}