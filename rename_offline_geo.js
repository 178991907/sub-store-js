/*
 rename_offline_geo_substore.js
 Sub-Store 兼容版本 (ES5)
 功能：离线 IP/域名 -> 国家识别 + 节点重命名 + 花体转换（有限表）
 默认输出：国旗 + 中文（例如：🇸🇬 新加坡）
 通过 $arguments 获取参数（Sub-Store 环境）
*/

// -------------------- 读取参数 --------------------
var args = (typeof $arguments !== "undefined") ? $arguments : {};
function getArg(k, def) {
  if (!args) return def;
  if (typeof args[k] === "undefined") return def;
  return args[k];
}
var nx = getArg("nx", false);
var bl = getArg("bl", false);
var nf = getArg("nf", false);
var key = getArg("key", false);
var blgd = getArg("blgd", false);
var blpx = getArg("blpx", false);
var blnx = getArg("blnx", false);
var numone = getArg("one", false);
var debug = getArg("debug", false);
var clearOpt = getArg("clear", false);
var addflag = getArg("flag", false);
var nm = getArg("nm", false);
var fgf = getArg("fgf", " ");
var sn = getArg("sn", " ");
var FNAME_RAW = getArg("name", "");
var BLKEY_RAW = getArg("blkey", "");
var blockquic = getArg("blockquic", "");
var inArg = getArg("in", "");
var outArg = getArg("out", "");
var fontType = getArg("type", "");
var fontNumType = getArg("num", "");

// decode some
try { fgf = decodeURI(fgf); } catch (e) {}
try { sn = decodeURI(sn); } catch (e) {}
try { FNAME_RAW = decodeURI(FNAME_RAW); } catch (e) {}
try { BLKEY_RAW = decodeURI(BLKEY_RAW); } catch (e) {}
try { blockquic = decodeURI(blockquic); } catch (e) {}

var FGF = (typeof fgf === "undefined" || fgf === null) ? " " : fgf;
var XHFGF = (typeof sn === "undefined" || sn === null) ? " " : sn;
var FNAME = (typeof FNAME_RAW === "undefined" || FNAME_RAW === null) ? "" : FNAME_RAW;
var BLKEY = (typeof BLKEY_RAW === "undefined" || BLKEY_RAW === null) ? "" : BLKEY_RAW;

// nameMap 与输入输出映射（保持和原脚本兼容）
var nameMap = { cn: "cn", zh: "cn", us: "us", en: "us", quan: "quan", gq: "gq", flag: "gq" };
var inname = (inArg && nameMap[inArg]) ? nameMap[inArg] : "";
var outputName = (outArg && nameMap[outArg]) ? nameMap[outArg] : "";

// -------------------- 国家/地区库（简化但含常见200+） --------------------
// 说明：EN/ ZH / FG 数组索引对应。可扩展。
// 为代码可读性与稳定性，数组项间不要有末尾逗号。
var EN = ["HK","MO","TW","JP","KR","SG","US","GB","FR","DE","AU","AE","AF","AL","DZ","AO","AR","AM","AT","AZ","BH","BD","BY","BE","BZ","BJ","BT","BO","BA","BW","BR","VG","BN","BG","BF","BI","KH","CM","CA","CV","KY","CF","TD","CL","CO","KM","CG","CD","CR","HR","CY","CZ","DK","DJ","DO","EC","EG","SV","GQ","ER","EE","ET","FJ","FI","GA","GM","GE","GH","GR","GL","GT","GN","GY","HT","HN","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","CI","JM","JO","KZ","KE","KW","KG","LA","LV","LB","LS","LR","LY","LT","LU","MK","MG","MW","MY","MV","ML","MT","MR","MU","MX","MD","MC","MN","ME","MA","MZ","MM","NA","NP","NL","NZ","NI","NE","NG","KP","NO","OM","PK","PA","PY","PE","PH","PT","PR","QA","RO","RU","RW","SM","SA","SN","RS","SL","SK","SI","SO","ZA","ES","LK","SD","SR","SZ","SE","CH","SY","TJ","TZ","TH","TG","TO","TT","TN","TR","TM","VI","UG","UA","UY","UZ","VE","VN","YE","ZM","ZW","AD","RE","PL","GU","VA","LI","CW","SC","AQ","GI","CU","FO","AX","BM","TL","PR","BL","MF","BQ","SS","EH","XK","GG","JE","PN","SH","TC","UM","IO","GF","GP","MS","KY","FK","AI"];
var ZH = ["香港","澳门","台湾","日本","韩国","新加坡","美国","英国","法国","德国","澳大利亚","阿联酋","阿富汗","阿尔巴尼亚","阿尔及利亚","安哥拉","阿根廷","亚美尼亚","奥地利","阿塞拜疆","巴林","孟加拉国","白俄罗斯","比利时","伯利兹","贝宁","不丹","玻利维亚","波斯尼亚和黑塞哥维那","博茨瓦纳","巴西","英属维京群岛","文莱","保加利亚","布基纳法索","布隆迪","柬埔寨","喀麦隆","加拿大","佛得角","开曼群岛","中非共和国","乍得","智利","哥伦比亚","科摩罗","刚果(布)","刚果(金)","哥斯达黎加","克罗地亚","塞浦路斯","捷克","丹麦","吉布提","多米尼加共和国","厄瓜多尔","埃及","萨尔瓦多","赤道几内亚","厄立特里亚","爱沙尼亚","埃塞俄比亚","斐济","芬兰","加蓬","冈比亚","格鲁吉亚","加纳","希腊","格陵兰","危地马拉","几内亚","圭亚那","海地","洪都拉斯","匈牙利","冰岛","印度","印尼","伊朗","伊拉克","爱尔兰","马恩岛","以色列","意大利","科特迪瓦","牙买加","约旦","哈萨克斯坦","肯尼亚","科威特","吉尔吉斯斯坦","老挝","拉脱维亚","黎巴嫩","莱索托","利比里亚","利比亚","立陶宛","卢森堡","马其顿","马达加斯加","马拉维","马来西亚","马尔代夫","马里","马耳他","毛里塔尼亚","毛里求斯","墨西哥","摩尔多瓦","摩纳哥","蒙古","黑山共和国","摩洛哥","莫桑比克","缅甸","纳米比亚","尼泊尔","荷兰","新西兰","尼加拉瓜","尼日尔","尼日利亚","朝鲜","挪威","阿曼","巴基斯坦","巴拿马","巴拉圭","秘鲁","菲律宾","葡萄牙","波多黎各","卡塔尔","罗马尼亚","俄罗斯","卢旺达","圣马力诺","沙特阿拉伯","塞内加尔","塞尔维亚","塞拉利昂","斯洛伐克","斯洛文尼亚","索马里","南非","西班牙","斯里兰卡","苏丹","苏里南","斯威士兰","瑞典","瑞士","叙利亚","塔吉克斯坦","坦桑尼亚","泰国","多哥","汤加","特立尼达和多巴哥","突尼斯","土耳其","土库曼斯坦","美属维京群岛","乌干达","乌克兰","乌拉圭","乌兹别克斯坦","委内瑞拉","越南","也门","赞比亚","津巴布韦","安道尔","留尼汪","波兰","关岛","梵蒂冈","列支敦士登","库拉索","塞舌尔","南极","直布罗陀","古巴","法罗群岛","奥兰群岛","百慕达","东帝汶"];
var FG = ["🇭🇰","🇲🇴","🇹🇼","🇯🇵","🇰🇷","🇸🇬","🇺🇸","🇬🇧","🇫🇷","🇩🇪","🇦🇺","🇦🇪","🇦🇫","🇦🇱","🇩🇿","🇦🇴","🇦🇷","🇦🇲","🇦🇹","🇦🇿","🇧🇭","🇧🇩","🇧🇾","🇧🇪","🇧🇿","🇧🇯","🇧🇹","🇧🇴","🇧🇦","🇧🇼","🇧🇷","🇻🇬","🇧🇳","🇧🇬","🇧🇫","🇧🇮","🇰🇭","🇨🇲","🇨🇦","🇨🇻","🇰🇾","🇨🇫","🇹🇩","🇨🇱","🇨🇴","🇰🇲","🇨🇬","🇨🇩","🇨🇷","🇭🇷","🇨🇾","🇨🇿","🇩🇰","🇩🇯","🇩🇴","🇪🇨","🇪🇬","🇸🇻","🇬🇶","🇪🇷","🇪🇪","🇪🇹","🇫🇯","🇫🇮","🇬🇦","🇬🇲","🇬🇪","🇬🇭","🇬🇷","🇬🇱","🇬🇹","🇬🇳","🇬🇾","🇭🇹","🇭🇳","🇭🇺","🇮🇸","🇮🇳","🇮🇩","🇮🇷","🇮🇶","🇮🇪","🇮🇲","🇮🇱","🇮🇹","🇨🇮","🇯🇲","🇯🇴","🇰🇿","🇰🇪","🇰🇼","🇰🇬","🇱🇦","🇱🇻","🇱🇧","🇱🇸","🇱🇷","🇱🇾","🇱🇹","🇱🇺","🇲🇰","🇲🇬","🇲🇼","🇲🇾","🇲🇻","🇲🇱","🇲🇹","🇲🇷","🇲🇺","🇲🇽","🇲🇩","🇲🇨","🇲🇳","🇲🇪","🇲🇦","🇲🇿","🇲🇲","🇳🇦","🇳🇵","🇳🇱","🇳🇿","🇳🇮","🇳🇪","🇳🇬","🇰🇵","🇳🇴","🇴🇲","🇵🇰","🇵🇦","🇵🇾","🇵🇪","🇵🇭","🇵🇹","🇵🇷","🇶🇦","🇷🇴","🇷🇺","🇷🇼","🇸🇲","🇸🇦","🇸🇳","🇷🇸","🇸🇱","🇸🇰","🇸🇮","🇸🇴","🇿🇦","🇪🇸","🇱🇰","🇸🇩","🇸🇷","🇸🇿","🇸🇪","🇨🇭","🇸🇾","🇹🇯","🇹🇿","🇹🇭","🇹🇬","🇹🇴","🇹🇹","🇹🇳","🇹🇷","🇹🇲","🇻🇮","🇺🇬","🇺🇦","🇺🇾","🇺🇿","🇻🇪","🇻🇳","🇾🇪","🇿🇲","🇿🇼","🇦🇩","🇷🇪","🇵🇱","🇬🇺","🇻🇦","🇱🇮","🇨🇼","🇸🇨","🇦🇶","🇬🇮","🇨🇺","🇫🇴","🇦🇽","🇧🇲","🇹🇱"];

// 构建国家查表（code -> record）
var COUNTRY_DB = {};
for (var i = 0; i < EN.length; i += 1) {
  var code = (EN[i] || "").toString().toUpperCase();
  if (!code) continue;
  COUNTRY_DB[code] = { code: code, zh: (ZH[i] || code), flag: (FG[i] || ""), idx: i };
}

// 便捷反查（小写 -> ISO）
var COUNTRY_BY_TLD = {};
for (var k in COUNTRY_DB) {
  if (COUNTRY_DB.hasOwnProperty(k)) {
    COUNTRY_BY_TLD[k.toLowerCase()] = k;
  }
}

// -------------------- TLD 映射（multi-level 优先） --------------------
var TLD_MAP_BASE = {}; // clone small mapping from COUNTRY_BY_TLD
for (var tt in COUNTRY_BY_TLD) {
  if (COUNTRY_BY_TLD.hasOwnProperty(tt)) {
    TLD_MAP_BASE[tt] = COUNTRY_BY_TLD[tt];
  }
}
// 手动补充常用 multi-level
TLD_MAP_BASE["co.uk"] = "GB";
TLD_MAP_BASE["gov.uk"] = "GB";
TLD_MAP_BASE["com.au"] = "AU";
TLD_MAP_BASE["com.sg"] = "SG";
TLD_MAP_BASE["com.hk"] = "HK";
TLD_MAP_BASE["com.tw"] = "TW";
TLD_MAP_BASE["co.jp"] = "JP";
TLD_MAP_BASE["com.cn"] = "CN";

// 优先匹配列表（multi-level）
var TLD_PRIORITY = ["co.uk","gov.uk","com.au","com.sg","com.hk","com.tw","co.jp","com.cn"];

// -------------------- 轻量 IP CIDR 数据（示例） --------------------
// 注：体积受限，仅示例常见段。可扩充为完整 GeoIP CIDR 列表。
var IP_DB = [
  { cidr: "8.8.8.0/24", country: "US" },
  { cidr: "8.8.4.0/24", country: "US" },
  { cidr: "1.1.1.0/24", country: "AU" },
  { cidr: "114.114.114.0/24", country: "CN" },
  { cidr: "35.0.0.0/8", country: "US" },
  { cidr: "3.0.0.0/8", country: "US" }
];

// 将 CIDR 转为数值区间（IPv4）
function ipToInt(ip) {
  if (!ip) return null;
  var parts = ip.split(".");
  if (!parts || parts.length !== 4) return null;
  var n = 0;
  for (var i = 0; i < 4; i += 1) {
    var p = parseInt(parts[i], 10);
    if (isNaN(p) || p < 0 || p > 255) return null;
    n = (n << 8) + p;
  }
  // >>> 0 保证无符号
  return n >>> 0;
}
function cidrToRange(cidr) {
  var sp = cidr.split("/");
  var ip = sp[0];
  var prefix = (sp.length > 1) ? parseInt(sp[1], 10) : 32;
  var ipn = ipToInt(ip);
  if (ipn === null) return null;
  var shift = 32 - prefix;
  var start = (ipn >>> 0) & ((~0) << shift);
  start = start >>> 0;
  var end = (start + (Math.pow(2, shift) - 1)) >>> 0;
  return [start, end];
}
var IP_DB_RANGES = [];
for (var j = 0; j < IP_DB.length; j += 1) {
  var r = cidrToRange(IP_DB[j].cidr);
  if (r) IP_DB_RANGES.push({ start: r[0], end: r[1], country: IP_DB[j].country });
}
function lookupIpCountry(ip) {
  var ipn = ipToInt(ip);
  if (ipn === null) return null;
  for (var ii = 0; ii < IP_DB_RANGES.length; ii += 1) {
    var it = IP_DB_RANGES[ii];
    if (ipn >= it.start && ipn <= it.end) return it.country;
  }
  return null;
}

// -------------------- 域名 -> 国家识别 --------------------
function lookupDomainCountry(domain) {
  if (!domain || typeof domain !== "string") return null;
  domain = domain.trim().toLowerCase();
  domain = domain.replace(/:\d+$/, "");
  var parts = domain.split(".");
  if (!parts || parts.length < 2) return null;
  // multi-level 优先
  for (var t = 0; t < TLD_PRIORITY.length; t += 1) {
    var tl = TLD_PRIORITY[t];
    if (domain === tl || domain.indexOf("." + tl, domain.length - tl.length - 1) !== -1) {
      return TLD_MAP_BASE[tl] || null;
    }
  }
  // 最后一段
  var last = parts[parts.length - 1];
  if (TLD_MAP_BASE[last]) return TLD_MAP_BASE[last];
  // 第二段尝试
  var secondLast = parts[parts.length - 2];
  if (TLD_MAP_BASE[secondLast]) return TLD_MAP_BASE[secondLast];
  return null;
}

// -------------------- IP / 域名检测 --------------------
function isIPv4(str) {
  if (!str) return false;
  return /^((25[0-5]|2[0-4]\d|1?\d{1,2})\.){3}(25[0-5]|2[0-4]\d|1?\d{1,2})$/.test(str);
}
function isDomain(str) {
  if (!str) return false;
  return /^[a-z0-9\-]+(\.[a-z0-9\-]+)+(:\d+)?$/.test(str.toLowerCase());
}

// -------------------- 格式化国家显示 --------------------
function formatCountry(code) {
  if (!code) return { code: null, zh: "未知", flag: "", en: "unknown" };
  var c = (code || "").toString().toUpperCase();
  if (COUNTRY_DB[c]) return { code: c, zh: COUNTRY_DB[c].zh || c, flag: COUNTRY_DB[c].flag || "", en: c };
  return { code: c, zh: c, flag: "", en: c };
}

// -------------------- Fancy 字体（少量表） --------------------
var FANCY_TABLES = {
  "serif-bold": ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],
  "modifier-letter": ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]
};
// 注：上面仅占位。Duktape 与显示终端对 Unicode 花体兼容不一，若需要请替换为实际字符表。

function applyFancy(proxies, type, numType) {
  if (!type && !numType) return proxies;
  var tableType = FANCY_TABLES[type] || null;
  var tableNum = FANCY_TABLES[numType || type] || null;
  for (var i = 0; i < proxies.length; i += 1) {
    var name = proxies[i].name || "";
    var out = "";
    for (var k = 0; k < name.length; k += 1) {
      var ch = name.charAt(k);
      var code = name.charCodeAt(k);
      // 简化：只替换 ASCII 字母与数字
      if (code >= 48 && code <= 57 && tableNum) {
        // digit
        var idx = code - 48;
        out += (typeof tableNum[idx] !== "undefined") ? tableNum[idx] : ch;
      } else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
        var idx2 = (code >= 97) ? (code - 97 + 10) : (code - 65 + 36);
        if (tableType && typeof tableType[idx2] !== "undefined") out += tableType[idx2]; else out += ch;
      } else {
        out += ch;
      }
    }
    proxies[i].name = out;
  }
  return proxies;
}

// -------------------- 原有重命名逻辑（精简） --------------------
var specialRegex = [ /(\d\.)?\d+×/, /IPLC|IEPL|Kern|Edge|Pro|Std|Exp|Biz|Fam|Game|Buy|Zx|LB|Game/ ];
var nameclear = /(套餐|到期|有效|剩余|版本|已用|过期|失联|测试|官方|网址|备用|群|TEST|客服|网站|获取|订阅|流量|机场|下次|官址|联系|邮箱|工单|学术|USE|USED|TOTAL|EXPIRE|EMAIL)/i;
var regexArray = [/ˣ²/, /ˣ³/, /ˣ⁴/, /ˣ⁵/, /IPLC/i, /IEPL/i, /核心/, /边缘/];
var valueArray = ["2×","3×","4×","5×","IPLC","IEPL","Kern","Edge"];

// rurekey 简化（用于替换地名）
var rurekey = {
  "GB": /UK/g,
  "Hong Kong": /Hongkong|HONG KONG/gi,
  "United States": /USA|United States|Los Angeles|San Jose|Silicon Valley/g
};

// getList helper
function getList(arg) {
  if (arg === "us") return EN;
  if (arg === "gq") return FG;
  if (arg === "quan") return EN; // 简化：quan 走 EN 列表
  return ZH;
}

// buildAllMap 基于输出名构建 map
function buildAllMap(outName) {
  var Allmap = {};
  var outList = getList(outName);
  var inputLists;
  if (inname && inname !== "") {
    inputLists = [ getList(inname) ];
  } else {
    inputLists = [ ZH, FG, EN ];
  }
  for (var a = 0; a < inputLists.length; a += 1) {
    var arr = inputLists[a];
    for (var b = 0; b < arr.length; b += 1) {
      if (!arr[b]) continue;
      Allmap[arr[b]] = outList[b] || outList[b];
    }
  }
  return Allmap;
}

// addSequenceNumbers：给同名节点补序号
function addSequenceNumbers(list) {
  var map = {};
  for (var i = 0; i < list.length; i += 1) {
    var key = list[i].name || "";
    if (!map[key]) map[key] = [];
    map[key].push(list[i]);
  }
  var out = [];
  for (var k in map) {
    if (!map.hasOwnProperty(k)) continue;
    var arr = map[k];
    if (arr.length === 1) {
      var single = arr[0];
      if (numone && (single.name || "").match(/01$/)) {
        single.name = (single.name || "").replace(/[^.]01$/, "");
      }
      out.push(single);
    } else {
      for (var m = 0; m < arr.length; m += 1) {
        var it = arr[m];
        it.name = (it.name || "") + XHFGF + (("0" + (m+1)).slice(-2));
        out.push(it);
      }
    }
  }
  return out;
}

// fampx
function fampx(pro) {
  var wis = [], wnout = [];
  for (var i = 0; i < pro.length; i += 1) {
    var fan = false;
    for (var r = 0; r < specialRegex.length; r += 1) {
      if (specialRegex[r].test(pro[i].name || "")) { fan = true; break; }
    }
    if (fan) wis.push(pro[i]); else wnout.push(pro[i]);
  }
  return wnout.concat(wis);
}

// 主操作函数（Sub-Store 会调用 operator(proxies)）
function operator(proxies) {
  if (!proxies || !proxies.length) return proxies;
  var Allmap = buildAllMap(outputName);
  // 初筛
  if (clearOpt || nx || blnx || key) {
    var tmp = [];
    for (var i = 0; i < proxies.length; i += 1) {
      var rn = proxies[i].name || "";
      var keep = true;
      if (clearOpt && nameclear.test(rn)) keep = false;
      if (nx && (/(高倍|(?!1)(0\.|\d)+(x|倍)|ˣ²)/i).test(rn)) keep = false;
      if (blnx && !( /(高倍|(?!1)2+(x|倍)|ˣ²)/i).test(rn)) keep = false;
      if (key && !((/(港|Hong|HK|新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US)/i).test(rn))) keep = false;
      if (keep) tmp.push(proxies[i]);
    }
    proxies = tmp;
  }

  // 逐条处理
  for (var idx = 0; idx < proxies.length; idx += 1) {
    var p = proxies[idx];
    var originalName = p.name || "";
    var nameWorking = originalName;
    // rurekey 替换
    for (var rk in rurekey) {
      if (!rurekey.hasOwnProperty(rk)) continue;
      try {
        nameWorking = nameWorking.replace(rurekey[rk], rk);
      } catch (e) {}
    }
    // block-quic 设置
    if (blockquic === "on") p["block-quic"] = "on";
    else if (blockquic === "off") p["block-quic"] = "off";
    else delete p["block-quic"];
    // BLKEY 保留
    var retainKey = [];
    if (BLKEY) {
      var toks = BLKEY.split("+");
      for (var bt = 0; bt < toks.length; bt += 1) {
        var tk = toks[bt];
        if (!tk) continue;
        if (tk.indexOf(">") !== -1) {
          var sp = tk.split(">");
          var from = sp[0];
          var to = sp[1] || sp[0];
          if (nameWorking.indexOf(from) !== -1) retainKey.push(to);
        } else {
          if (nameWorking.indexOf(tk) !== -1) retainKey.push(tk);
        }
      }
    }
    // bl / blgd 倍率识别（简化）
    var ikey = "", ikeys = "";
    if (bl) {
      var mm = nameWorking.match(/((倍率|X|x|×)\D?((\d{1,3}\.)?\d+)\D?)|((\d{1,3}\.)?\d+)(倍|X|x|×)/);
      if (mm) {
        var rev = (mm[0].match(/(\d[\d.]*)/)||[])[0];
        if (rev && rev !== "1") ikey = rev + "×";
      }
    }
    if (blgd) {
      for (var rx = 0; rx < regexArray.length; rx += 1) {
        if (regexArray[rx].test(nameWorking)) { ikeys = valueArray[rx]; break; }
      }
    }

    // 离线地理识别逻辑
    var detectedCountry = null;
    // 1) Allmap（关键词）匹配
    for (var akey in Allmap) {
      if (!Allmap.hasOwnProperty(akey)) continue;
      if (nameWorking.indexOf(akey) !== -1) { detectedCountry = Allmap[akey]; break; }
    }
    if (!detectedCountry) {
      // tokenize by whitespace
      var tokens = nameWorking.split(/\s+/);
      // if single token and is IP
      if (tokens.length === 1 && isIPv4(tokens[0])) {
        detectedCountry = lookupIpCountry(tokens[0]);
      } else if (tokens.length === 1 && isDomain(tokens[0])) {
        detectedCountry = lookupDomainCountry(tokens[0]);
      } else {
        // scan tokens
        for (var tix = 0; tix < tokens.length; tix += 1) {
          var tk = tokens[tix];
          if (isIPv4(tk)) {
            var c = lookupIpCountry(tk);
            if (c) { detectedCountry = c; break; }
          }
          if (isDomain(tk)) {
            var d = lookupDomainCountry(tk);
            if (d) { detectedCountry = d; break; }
          }
        }
      }
    }

    // 构造输出名称（默认国旗 + 中文）
    var finalParts = [];
    if (nf && FNAME) finalParts.push(FNAME);
    if (detectedCountry) {
      var form = formatCountry(detectedCountry);
      if (addflag && form.flag) finalParts.push(form.flag);
      // 默认输出中文（国旗+中文）
      finalParts.push(form.zh || form.code);
    } else {
      if (nm) {
        if (!nf && FNAME) finalParts.push(FNAME);
        finalParts.push(nameWorking);
      } else {
        p.name = null;
        continue;
      }
    }
    // 附加保留关键词、倍率
    for (var ri = 0; ri < retainKey.length; ri += 1) finalParts.push(retainKey[ri]);
    if (ikey) finalParts.push(ikey);
    if (ikeys) finalParts.push(ikeys);
    if (!nf && FNAME && (!nm) && detectedCountry) {
      finalParts.push(FNAME);
    }
    var newName = "";
    for (var pi = 0; pi < finalParts.length; pi += 1) {
      if (finalParts[pi]) {
        if (newName.length > 0) newName += FGF;
        newName += finalParts[pi];
      }
    }
    p.name = (newName || null);
  } // end for proxies

  // 过滤掉 null name
  var outPro = [];
  for (var oi = 0; oi < proxies.length; oi += 1) {
    if (proxies[oi] && proxies[oi].name) outPro.push(proxies[oi]);
  }
  // 补序号
  outPro = addSequenceNumbers(outPro);
  // 排序/分组
  if (blpx) outPro = fampx(outPro);
  if (key) {
    var keepList = [];
    for (var ki = 0; ki < outPro.length; ki += 1) {
      if (!((/(香港|Hong|HK|新加坡|SG|Japan|JP|美国|US)/i).test(outPro[ki].name))) {
        keepList.push(outPro[ki]);
      }
    }
    outPro = keepList;
  }
  // fancy
  if (fontType || fontNumType) outPro = applyFancy(outPro, fontType, fontNumType);

  return outPro;
}

// 导出兼容
if (typeof module !== "undefined" && module.exports) {
  module.exports = { operator: operator };
} else {
  this.operator = operator;
}

// debug
if (debug) {
  try { console.log("rename_offline_geo_substore loaded"); } catch (e) {}
}