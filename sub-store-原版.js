/**
 * 更新日期：2024-04-05 15:30:15 (增强版：IP地理位置解析)
 * 用法：Sub-Store 脚本操作添加
 * rename.js 以下是此脚本支持的参数，必须以 # 为开头多个参数使用"&"连接，参考上述地址为例使用参数。 禁用缓存url#noCache
 *
 *** 主要参数
 * [in=] 自动判断机场节点名类型 优先级 zh(中文) -> flag(国旗) -> quan(英文全称) -> en(英文简写)
 * 如果不准的情况, 可以加参数指定:
 *
 * [ipgeo]  启用IP地理位置解析（支持域名和IP，联网查询真实位置）
 * [nm]     【已废弃】保留没有匹配到的节点（现在默认保留所有节点）
 * [in=zh]  或in=cn识别中文
 * [in=en]  或in=us 识别英文缩写
 * [in=flag] 或in=gq 识别国旗 如果加参数 in=flag 则识别国旗 脚本操作前面不要添加国旗操作 否则移除国旗后面脚本识别不到
 * [in=quan] 识别英文全称

 *
 * [out=]   输出节点名可选参数: (cn或zh ，us或en ，gq或flag ，quan) 对应：(中文，英文缩写 ，国旗 ，英文全称) 默认中文 例如 [out=en] 或 out=us 输出英文缩写
 *** 分隔符参数
 *
 * [fgf=]   节点名前缀或国旗分隔符，默认为空格；
 * [sn=]    设置国家与序号之间的分隔符，默认为空格；
 * 序号参数
 * [one]    清理只有一个节点的地区的01
 * [flag]   给节点前面加国旗
 *
 *** 前缀参数
 * [name=]  节点添加机场名称前缀；
 * [nf]     把 name= 的前缀值放在最前面
 *** 保留参数
 * [blkey=iplc+gpt+NF+IPLC] 用+号添加多个关键词 保留节点名的自定义字段 需要区分大小写!
 * 如果需要修改 保留的关键词 替换成别的 可以用 > 分割 例如 [#blkey=GPT>新名字+其他关键词] 这将把【GPT】替换成【新名字】
 * 例如      https://raw.githubusercontent.com/Keywos/rule/main/rename.js#flag&blkey=GPT>新名字+NF
 * [blgd]   保留: 家宽 IPLC ˣ² 等
 * [bl]     正则匹配保留 [0.1x, x0.2, 6x ,3倍]等标识
 * [nx]     保留1倍率与不显示倍率的
 * [blnx]   只保留高倍率
 * [clear]  清理乱名
 * [blpx]   如果用了上面的bl参数,对保留标识后的名称分组排序,如果没用上面的bl参数单独使用blpx则不起任何作用
 * [blockquic] blockquic=on 阻止; blockquic=off 不阻止
 */

// const inArg = {'blkey':'iplc+GPT>GPTnewName+NF+IPLC', 'flag':true };
const inArg = $arguments; // console.log(inArg)
const nx = inArg.nx || false,
  bl = inArg.bl || false,
  nf = inArg.nf || false,
  key = inArg.key || false,
  blgd = inArg.blgd || false,
  blpx = inArg.blpx || false,
  blnx = inArg.blnx || false,
  numone = inArg.one || false,
  debug = inArg.debug || false,
  clear = inArg.clear || false,
  addflag = inArg.flag || false,
  nm = inArg.nm || false,
  ipgeo = inArg.ipgeo || false;

const FGF = inArg.fgf == undefined ? " " : decodeURI(inArg.fgf),
  XHFGF = inArg.sn == undefined ? " " : decodeURI(inArg.sn),
  FNAME = inArg.name == undefined ? "" : decodeURI(inArg.name),
  BLKEY = inArg.blkey == undefined ? "" : decodeURI(inArg.blkey),
  blockquic = inArg.blockquic == undefined ? "" : decodeURI(inArg.blockquic),
  nameMap = {
    cn: "cn",
    zh: "cn",
    us: "us",
    en: "us",
    quan: "quan",
    gq: "gq",
    flag: "gq",
  },
  inname = nameMap[inArg.in] || "",
  outputName = nameMap[inArg.out] || "";
// prettier-ignore
const FG = ['🇭🇰','🇲🇴','🇹🇼','🇯🇵','🇰🇷','🇸🇬','🇺🇸','🇬🇧','🇫🇷','🇩🇪','🇦🇺','🇦🇪','🇦🇫','🇦🇱','🇩🇿','🇦🇴','🇦🇷','🇦🇲','🇦🇹','🇦🇿','🇧🇭','🇧🇩','🇧🇾','🇧🇪','🇧🇿','🇧🇯','🇧🇹','🇧🇴','🇧🇦','🇧🇼','🇧🇷','🇻🇬','🇧🇳','🇧🇬','🇧🇫','🇧🇮','🇰🇭','🇨🇲','🇨🇦','🇨🇻','🇰🇾','🇨🇫','🇹🇩','🇨🇱','🇨🇴','🇰🇲','🇨🇬','🇨🇩','🇨🇷','🇭🇷','🇨🇾','🇨🇿','🇩🇰','🇩🇯','🇩🇴','🇪🇨','🇪🇬','🇸🇻','🇬🇶','🇪🇷','🇪🇪','🇪🇹','🇫🇯','🇫🇮','🇬🇦','🇬🇲','🇬🇪','🇬🇭','🇬🇷','🇬🇱','🇬🇹','🇬🇳','🇬🇾','🇭🇹','🇭🇳','🇭🇺','🇮🇸','🇮🇳','🇮🇩','🇮🇷','🇮🇶','🇮🇪','🇮🇲','🇮🇱','🇮🇹','🇨🇮','🇯🇲','🇯🇴','🇰🇿','🇰🇪','🇰🇼','🇰🇬','🇱🇦','🇱🇻','🇱🇧','🇱🇸','🇱🇷','🇱🇾','🇱🇹','🇱🇺','🇲🇰','🇲🇬','🇲🇼','🇲🇾','🇲🇻','🇲🇱','🇲🇹','🇲🇷','🇲🇺','🇲🇽','🇲🇩','🇲🇨','🇲🇳','🇲🇪','🇲🇦','🇲🇿','🇲🇲','🇳🇦','🇳🇵','🇳🇱','🇳🇿','🇳🇮','🇳🇪','🇳🇬','🇰🇵','🇳🇴','🇴🇲','🇵🇰','🇵🇦','🇵🇾','🇵🇪','🇵🇭','🇵🇹','🇵🇷','🇶🇦','🇷🇴','🇷🇺','🇷🇼','🇸🇲','🇸🇦','🇸🇳','🇷🇸','🇸🇱','🇸🇰','🇸🇮','🇸🇴','🇿🇦','🇪🇸','🇱🇰','🇸🇩','🇸🇷','🇸🇿','🇸🇪','🇨🇭','🇸🇾','🇹🇯','🇹🇿','🇹🇭','🇹🇬','🇹🇴','🇹🇹','🇹🇳','🇹🇷','🇹🇲','🇻🇮','🇺🇬','🇺🇦','🇺🇾','🇺🇿','🇻🇪','🇻🇳','🇾🇪','🇿🇲','🇿🇼','🇦🇩','🇷🇪','🇵🇱','🇬🇺','🇻🇦','🇱🇮','🇨🇼','🇸🇨','🇦🇶','🇬🇮','🇨🇺','🇫🇴','🇦🇽','🇧🇲','🇹🇱']
// prettier-ignore
const EN = ['HK','MO','TW','JP','KR','SG','US','GB','FR','DE','AU','AE','AF','AL','DZ','AO','AR','AM','AT','AZ','BH','BD','BY','BE','BZ','BJ','BT','BO','BA','BW','BR','VG','BN','BG','BF','BI','KH','CM','CA','CV','KY','CF','TD','CL','CO','KM','CG','CD','CR','HR','CY','CZ','DK','DJ','DO','EC','EG','SV','GQ','ER','EE','ET','FJ','FI','GA','GM','GE','GH','GR','GL','GT','GN','GY','HT','HN','HU','IS','IN','ID','IR','IQ','IE','IM','IL','IT','CI','JM','JO','KZ','KE','KW','KG','LA','LV','LB','LS','LR','LY','LT','LU','MK','MG','MW','MY','MV','ML','MT','MR','MU','MX','MD','MC','MN','ME','MA','MZ','MM','NA','NP','NL','NZ','NI','NE','NG','KP','NO','OM','PK','PA','PY','PE','PH','PT','PR','QA','RO','RU','RW','SM','SA','SN','RS','SL','SK','SI','SO','ZA','ES','LK','SD','SR','SZ','SE','CH','SY','TJ','TZ','TH','TG','TO','TT','TN','TR','TM','VI','UG','UA','UY','UZ','VE','VN','YE','ZM','ZW','AD','RE','PL','GU','VA','LI','CW','SC','AQ','GI','CU','FO','AX','BM','TL'];
// prettier-ignore
const ZH = ['香港','澳门','台湾','日本','韩国','新加坡','美国','英国','法国','德国','澳大利亚','阿联酋','阿富汗','阿尔巴尼亚','阿尔及利亚','安哥拉','阿根廷','亚美尼亚','奥地利','阿塞拜疆','巴林','孟加拉国','白俄罗斯','比利时','伯利兹','贝宁','不丹','玻利维亚','波斯尼亚和黑塞哥维那','博茨瓦纳','巴西','英属维京群岛','文莱','保加利亚','布基纳法索','布隆迪','柬埔寨','喀麦隆','加拿大','佛得角','开曼群岛','中非共和国','乍得','智利','哥伦比亚','科摩罗','刚果(布)','刚果(金)','哥斯达黎加','克罗地亚','塞浦路斯','捷克','丹麦','吉布提','多米尼加共和国','厄瓜多尔','埃及','萨尔瓦多','赤道几内亚','厄立特里亚','爱沙尼亚','埃塞俄比亚','斐济','芬兰','加蓬','冈比亚','格鲁吉亚','加纳','希腊','格陵兰','危地马拉','几内亚','圭亚那','海地','洪都拉斯','匈牙利','冰岛','印度','印尼','伊朗','伊拉克','爱尔兰','马恩岛','以色列','意大利','科特迪瓦','牙买加','约旦','哈萨克斯坦','肯尼亚','科威特','吉尔吉斯斯坦','老挝','拉脱维亚','黎巴嫩','莱索托','利比里亚','利比亚','立陶宛','卢森堡','马其顿','马达加斯加','马拉维','马来','马尔代夫','马里','马耳他','毛利塔尼亚','毛里求斯','墨西哥','摩尔多瓦','摩纳哥','蒙古','黑山共和国','摩洛哥','莫桑比克','缅甸','纳米比亚','尼泊尔','荷兰','新西兰','尼加拉瓜','尼日尔','尼日利亚','朝鲜','挪威','阿曼','巴基斯坦','巴拿马','巴拉圭','秘鲁','菲律宾','葡萄牙','波多黎各','卡塔尔','罗马尼亚','俄罗斯','卢旺达','圣马力诺','沙特阿拉伯','塞内加尔','塞尔维亚','塞拉利昂','斯洛伐克','斯洛文尼亚','索马里','南非','西班牙','斯里兰卡','苏丹','苏里南','斯威士兰','瑞典','瑞士','叙利亚','塔吉克斯坦','坦桑尼亚','泰国','多哥','汤加','特立尼达和多巴哥','突尼斯','土耳其','土库曼斯坦','美属维尔京群岛','乌干达','乌克兰','乌拉圭','乌兹别克斯坦','委内瑞拉','越南','也门','赞比亚','津巴布韦','安道尔','留尼汪','波兰','关岛','梵蒂冈','列支敦士登','库拉索','塞舌尔','南极','直布罗陀','古巴','法罗群岛','奥兰群岛','百慕达','东帝汶'];
// prettier-ignore
const QC = ['Hong Kong','Macao','Taiwan','Japan','Korea','Singapore','United States','United Kingdom','France','Germany','Australia','Dubai','Afghanistan','Albania','Algeria','Angola','Argentina','Armenia','Austria','Azerbaijan','Bahrain','Bangladesh','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','British Virgin Islands','Brunei','Bulgaria','Burkina-faso','Burundi','Cambodia','Cameroon','Canada','CapeVerde','CaymanIslands','Central African Republic','Chad','Chile','Colombia','Comoros','Congo-Brazzaville','Congo-Kinshasa','CostaRica','Croatia','Cyprus','Czech Republic','Denmark','Djibouti','Dominican Republic','Ecuador','Egypt','EISalvador','Equatorial Guinea','Eritrea','Estonia','Ethiopia','Fiji','Finland','Gabon','Gambia','Georgia','Ghana','Greece','Greenland','Guatemala','Guinea','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Isle of Man','Israel','Italy','Ivory Coast','Jamaica','Jordan','Kazakstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Lithuania','Luxembourg','Macedonia','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Mauritania','Mauritius','Mexico','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar(Burma)','Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','NorthKorea','Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines','Portugal','PuertoRico','Qatar','Romania','Russia','Rwanda','SanMarino','SaudiArabia','Senegal','Serbia','SierraLeone','Slovakia','Slovenia','Somalia','SouthAfrica','Spain','SriLanka','Sudan','Suriname','Swaziland','Sweden','Switzerland','Syria','Tajikstan','Tanzania','Thailand','Togo','Tonga','TrinidadandTobago','Tunisia','Turkey','Turkmenistan','U.S.Virgin Islands','Uganda','Ukraine','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe','Andorra','Reunion','Poland','Guam','Vatican','Liechtensteins','Curacao','Seychelles','Antarctica','Gibraltar','Cuba','Faroe Islands','Ahvenanmaa','Bermuda','Timor-Leste'];
const specialRegex = [
  /(\d\.)?\d+×/,
  /IPLC|IEPL|Kern|Edge|Pro|Std|Exp|Biz|Fam|Game|Buy|Zx|LB|Game/,
];
const nameclear =
  /(套餐|到期|有效|剩余|版本|已用|过期|失联|测试|官方|网址|备用|群|TEST|客服|网站|获取|订阅|流量|机场|下次|官址|联系|邮箱|工单|学术|USE|USED|TOTAL|EXPIRE|EMAIL)/i;
// prettier-ignore
const regexArray=[/ˣ²/, /ˣ³/, /ˣ⁴/, /ˣ⁵/, /ˣ⁶/, /ˣ⁷/, /ˣ⁸/, /ˣ⁹/, /ˣ¹⁰/, /ˣ²⁰/, /ˣ³⁰/, /ˣ⁴⁰/, /ˣ⁵⁰/, /IPLC/i, /IEPL/i, /核心/, /边缘/, /高级/, /标准/, /实验/, /商宽/, /家宽/, /游戏|game/i, /购物/, /专线/, /LB/, /cloudflare/i, /\budp\b/i, /\bgpt\b/i,/udpn\b/];
// prettier-ignore
const valueArray= [ "2×","3×","4×","5×","6×","7×","8×","9×","10×","20×","30×","40×","50×","IPLC","IEPL","Kern","Edge","Pro","Std","Exp","Biz","Fam","Game","Buy","Zx","LB","CF","UDP","GPT","UDPN"];
const nameblnx = /(高倍|(?!1)2+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;
const namenx = /(高倍|(?!1)(0\.|\d)+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;
const keya =
  /港|Hong|HK|新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|土耳其|TR|Turkey|Korea|KR|🇸🇬|🇭🇰|🇯🇵|🇺🇸|🇰🇷|🇹🇷/i;
const keyb =
  /(((1|2|3|4)\d)|(香港|Hong|HK) 0[5-9]|((新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|土耳其|TR|Turkey|Korea|KR) 0[3-9]))/i;
const rurekey = {
  GB: /UK/g,
  "B-G-P": /BGP/g,
  "Russia Moscow": /Moscow/g,
  "Korea Chuncheon": /Chuncheon|Seoul/g,
  "Hong Kong": /Hongkong|HONG KONG/gi,
  "United Kingdom London": /London|Great Britain/g,
  "Dubai United Arab Emirates": /United Arab Emirates/g,
  "Taiwan TW 台湾 🇹🇼": /(台|Tai\s?wan|TW).*?🇨🇳|🇨🇳.*?(台|Tai\s?wan|TW)/g,
  "United States": /USA|Los Angeles|San Jose|Silicon Valley|Michigan/g,
  澳大利亚: /澳洲|墨尔本|悉尼|土澳|(深|沪|呼|京|广|杭)澳/g,
  德国: /(深|沪|呼|京|广|杭)德(?!.*(I|线))|法兰克福|滬德/g,
  香港: /(深|沪|呼|京|广|杭)港(?!.*(I|线))/g,
  日本: /(深|沪|呼|京|广|杭|中|辽)日(?!.*(I|线))|东京|大坂/g,
  新加坡: /狮城|(深|沪|呼|京|广|杭)新/g,
  美国: /(深|沪|呼|京|广|杭)美|波特兰|芝加哥|哥伦布|纽约|硅谷|俄勒冈|西雅图|芝加哥/g,
  波斯尼亚和黑塞哥维那: /波黑共和国/g,
  印尼: /印度尼西亚|雅加达/g,
  印度: /孟买/g,
  阿联酋: /迪拜|阿拉伯联合酋长国/g,
  孟加拉国: /孟加拉/g,
  捷克: /捷克共和国/g,
  台湾: /新台|新北|台(?!.*线)/g,
  Taiwan: /Taipei/g,
  韩国: /春川|韩|首尔/g,
  Japan: /Tokyo|Osaka/g,
  英国: /伦敦/g,
  India: /Mumbai/g,
  Germany: /Frankfurt/g,
  Switzerland: /Zurich/g,
  俄罗斯: /莫斯科/g,
  土耳其: /伊斯坦布尔/g,
  泰国: /泰國|曼谷/g,
  法国: /巴黎/g,
  G: /\d\s?GB/gi,
  Esnc: /esnc/gi,
};

let GetK = false, AMK = []
function ObjKA(i) {
  GetK = true
  AMK = Object.entries(i)
}

// IP地理位置缓存
const ipGeoCache = {};

// 内置IP段数据库（覆盖常用地区，离线可用）
// 格式：[起始IP数值, 结束IP数值, 国家代码]
const ipRangeDatabase = [
  // 香港 (HK)
  [0x2B000000, 0x2BFFFFFF, 'HK'], // 43.0.0.0 - 43.255.255.255 (扩大范围)
  [0x7C3C0000, 0x7C3FFFFF, 'HK'], // 124.60.0.0 - 124.63.255.255
  [0xCB000000, 0xCB00FFFF, 'HK'], // 203.0.0.0 - 203.0.255.255
  [0xD20A0000, 0xD20AFFFF, 'HK'], // 210.10.0.0 - 210.10.255.255
  
  // 台湾 (TW)
  [0x3C000000, 0x3CFFFFFF, 'TW'], // 60.0.0.0 - 60.255.255.255
  [0x7C600000, 0x7C7FFFFF, 'TW'], // 124.96.0.0 - 124.127.255.255
  [0xD3C00000, 0xD3FFFFFF, 'TW'], // 211.192.0.0 - 211.255.255.255
  
  // 日本 (JP)
  [0x0E000000, 0x0EFFFFFF, 'JP'], // 14.0.0.0 - 14.255.255.255
  [0x1B000000, 0x1BFFFFFF, 'JP'], // 27.0.0.0 - 27.255.255.255
  [0x31000000, 0x31FFFFFF, 'JP'], // 49.0.0.0 - 49.255.255.255
  [0x3E000000, 0x3EFFFFFF, 'JP'], // 62.0.0.0 - 62.255.255.255
  [0x72000000, 0x72FFFFFF, 'JP'], // 114.0.0.0 - 114.255.255.255
  [0x85000000, 0x85FFFFFF, 'JP'], // 133.0.0.0 - 133.255.255.255
  
  // 韩国 (KR)
  [0x01000000, 0x01FFFFFF, 'KR'], // 1.0.0.0 - 1.255.255.255
  [0x1C000000, 0x1CFFFFFF, 'KR'], // 28.0.0.0 - 28.255.255.255
  [0x3A000000, 0x3AFFFFFF, 'KR'], // 58.0.0.0 - 58.255.255.255
  [0x6E000000, 0x6EFFFFFF, 'KR'], // 110.0.0.0 - 110.255.255.255
  [0xB9000000, 0xB9FFFFFF, 'KR'], // 185.0.0.0 - 185.255.255.255
  
  // 新加坡 (SG)
  [0x08000000, 0x08FFFFFF, 'SG'], // 8.0.0.0 - 8.255.255.255
  [0x2B5C0000, 0x2B5FFFFF, 'SG'], // 43.92.0.0 - 43.95.255.255
  [0x67000000, 0x67FFFFFF, 'SG'], // 103.0.0.0 - 103.255.255.255
  [0xAC000000, 0xACFFFFFF, 'SG'], // 172.0.0.0 - 172.255.255.255
  
  // 美国 (US)
  [0x03000000, 0x03FFFFFF, 'US'], // 3.0.0.0 - 3.255.255.255
  [0x04000000, 0x04FFFFFF, 'US'], // 4.0.0.0 - 4.255.255.255
  [0x08080808, 0x08080808, 'US'], // 8.8.8.8 (Google DNS)
  [0x0C000000, 0x0CFFFFFF, 'US'], // 12.0.0.0 - 12.255.255.255
  [0x12000000, 0x12FFFFFF, 'US'], // 18.0.0.0 - 18.255.255.255
  [0x17000000, 0x17FFFFFF, 'US'], // 23.0.0.0 - 23.255.255.255
  [0x22000000, 0x22FFFFFF, 'US'], // 34.0.0.0 - 34.255.255.255
  [0x32000000, 0x32FFFFFF, 'US'], // 50.0.0.0 - 50.255.255.255
  [0x42000000, 0x42FFFFFF, 'US'], // 66.0.0.0 - 66.255.255.255
  [0x68000000, 0x68FFFFFF, 'US'], // 104.0.0.0 - 104.255.255.255
  [0x6C000000, 0x6CFFFFFF, 'US'], // 108.0.0.0 - 108.255.255.255
  [0x8D000000, 0x8DFFFFFF, 'US'], // 141.0.0.0 - 141.255.255.255
  [0x9C000000, 0x9CFFFFFF, 'US'], // 156.0.0.0 - 156.255.255.255
  [0xA2000000, 0xA2FFFFFF, 'US'], // 162.0.0.0 - 162.255.255.255
  [0xC6000000, 0xC6FFFFFF, 'US'], // 198.0.0.0 - 198.255.255.255
  
  // 英国 (GB)
  [0x02000000, 0x02FFFFFF, 'GB'], // 2.0.0.0 - 2.255.255.255
  [0x05000000, 0x05FFFFFF, 'GB'], // 5.0.0.0 - 5.255.255.255
  [0x50000000, 0x50FFFFFF, 'GB'], // 80.0.0.0 - 80.255.255.255
  
  // 德国 (DE)
  [0x2E000000, 0x2EFFFFFF, 'DE'], // 46.0.0.0 - 46.255.255.255
  [0x4E000000, 0x4EFFFFFF, 'DE'], // 78.0.0.0 - 78.255.255.255
  
  // 法国 (FR)
  [0x25000000, 0x25FFFFFF, 'FR'], // 37.0.0.0 - 37.255.255.255
  [0x4F000000, 0x4FFFFFFF, 'FR'], // 79.0.0.0 - 79.255.255.255
  
  // 俄罗斯 (RU)
  [0x1F000000, 0x1FFFFFFF, 'RU'], // 31.0.0.0 - 31.255.255.255
  [0x25000000, 0x25FFFFFF, 'RU'], // 37.0.0.0 - 37.255.255.255
  [0x4F000000, 0x4FFFFFFF, 'RU'], // 79.0.0.0 - 79.255.255.255
  [0x5E000000, 0x5EFFFFFF, 'RU'], // 94.0.0.0 - 94.255.255.255
  
  // 印度 (IN)
  [0x0D000000, 0x0DFFFFFF, 'IN'], // 13.0.0.0 - 13.255.255.255
  [0x1B000000, 0x1BFFFFFF, 'IN'], // 27.0.0.0 - 27.255.255.255
  
  // 澳大利亚 (AU)
  [0x01000000, 0x01FFFFFF, 'AU'], // 1.0.0.0 - 1.255.255.255
  [0x0B000000, 0x0BFFFFFF, 'AU'], // 11.0.0.0 - 11.255.255.255
  
  // 加拿大 (CA)
  [0x18000000, 0x18FFFFFF, 'CA'], // 24.0.0.0 - 24.255.255.255
  [0x40000000, 0x40FFFFFF, 'CA'], // 64.0.0.0 - 64.255.255.255
];

// IP字符串转数值
function ipToNumber(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return 0;
  return (parseInt(parts[0]) << 24) + (parseInt(parts[1]) << 16) + 
         (parseInt(parts[2]) << 8) + parseInt(parts[3]);
}

// 通过IP段匹配国家（离线，速度快）
function getCountryByIPRange(ip) {
  const ipNum = ipToNumber(ip);
  if (ipNum === 0) return null;
  
  // 二分查找或线性查找IP段
  for (const [start, end, countryCode] of ipRangeDatabase) {
    if (ipNum >= start && ipNum <= end) {
      console.log(`[IPGeo-Offline] ✓ ${ip} -> ${countryCode} (IP段匹配)`);
      return countryCode;
    }
  }
  
  return null;
}

// 提取节点的IP或域名
function extractHost(proxy) {
  // 优先从nodeName中提取IP（处理 "40 - 198.41.209.120" 这种格式）
  if (proxy.name) {
    // 匹配节点名中的IP地址
    const ipMatch = proxy.name.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
    if (ipMatch) {
      return ipMatch[1];
    }
    // 匹配节点名中的域名（简单匹配）
    const domainMatch = proxy.name.match(/([a-z0-9-]+\.[a-z0-9-.]+)/i);
    if (domainMatch) {
      return domainMatch[1];
    }
  }
  // 备用：从代理配置中提取
  return proxy.server || proxy.hostname || proxy.host || '';
}

// 检查是否为IP地址
function isIPAddress(str) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(str);
}

// 检查是否为有效的域名
function isDomain(str) {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(str);
}

// 解析IP地理位置（混合方案：离线优先 + 在线备用）
async function getIPGeo(host) {
  if (!host) return null;
  
  // 检查缓存
  if (ipGeoCache[host]) {
    console.log(`[IPGeo] 缓存命中: ${host} -> ${ipGeoCache[host].countryCode}`);
    return ipGeoCache[host];
  }
  
  let ip = host;
  
  // 如果是域名，尝试DNS解析（仅在开启在线查询时）
  if (!isIPAddress(host)) {
    console.log(`[IPGeo] 检测到域名: ${host}，将使用在线查询`);
    // 域名直接跳过离线IP段匹配，使用在线 API
  } else {
    // 方案1: 离线IP段匹配（最快，无需联网）
    const countryCode = getCountryByIPRange(ip);
    if (countryCode) {
      const result = {
        country: countryCodeMap[countryCode] || countryCode,
        countryCode: countryCode
      };
      ipGeoCache[host] = result;
      return result;
    }
    
    console.log(`[IPGeo] IP段未匹配: ${ip}，尝试在线查询`);
  }
  
  // 方案2: 在线 API查询（备用方案）
  // 检测$http是否可用
  const hasHttp = typeof $http !== 'undefined' && $http && typeof $http.get === 'function';
  if (!hasHttp) {
    console.log('[IPGeo] $http.get 不可用，跳过在线查询');
    ipGeoCache[host] = null;
    return null;
  }
  
  // 多个API备用方案
  const apis = [
    {
      name: 'ipapi.co',
      url: `https://ipapi.co/${host}/json/`,
      parse: (data) => ({
        country: data.country_name,
        countryCode: data.country_code
      })
    },
    {
      name: 'ip-api.com',
      url: `http://ip-api.com/json/${host}?fields=status,country,countryCode`,
      parse: (data) => data.status === 'success' ? {
        country: data.country,
        countryCode: data.countryCode
      } : null
    }
  ];
  
  // 依次尝试每个API
  for (const api of apis) {
    try {
      console.log(`[IPGeo-Online] 尝试 ${api.name}: ${host}`);
      
      const response = await $http.get({
        url: api.url,
        timeout: 10000
      });
      
      if (!response || !response.body) {
        console.log(`[IPGeo-Online] ✗ ${api.name} 无响应`);
        continue;
      }
      
      const data = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
      const result = api.parse(data);
      
      if (result && result.countryCode) {
        console.log(`[IPGeo-Online] ✓ ${api.name} 成功: ${host} -> ${result.countryCode}`);
        ipGeoCache[host] = result;
        return result;
      }
    } catch (error) {
      console.log(`[IPGeo-Online] ✗ ${api.name} 异常: ${error.message || error}`);
      continue;
    }
  }
  
  console.log(`[IPGeo] ✗ 无法获取位置: ${host}`);
  ipGeoCache[host] = null;
  return null;
}

// 国家代码到中文名称映射（补充常见国家）
const countryCodeMap = {
  'HK': '香港', 'MO': '澳门', 'TW': '台湾', 'CN': '中国',
  'JP': '日本', 'KR': '韩国', 'SG': '新加坡',
  'US': '美国', 'GB': '英国', 'FR': '法国', 'DE': '德国',
  'AU': '澳大利亚', 'CA': '加拿大', 'RU': '俄罗斯',
  'IN': '印度', 'BR': '巴西', 'IT': '意大利', 'ES': '西班牙',
  'NL': '荷兰', 'CH': '瑞士', 'SE': '瑞典', 'NO': '挪威',
  'TR': '土耳其', 'TH': '泰国', 'VN': '越南', 'MY': '马来',
  'ID': '印尼', 'PH': '菲律宾', 'AE': '阿联酋', 'SA': '沙特阿拉伯'
};

async function operator(pro) {
  const Allmap = {};
  const outList = getList(outputName);
  let inputList,
    retainKey = "";
  if (inname !== "") {
    inputList = [getList(inname)];
  } else {
    inputList = [ZH, FG, QC, EN];
  }

  inputList.forEach((arr) => {
    arr.forEach((value, valueIndex) => {
      Allmap[value] = outList[valueIndex];
    });
  });

  if (clear || nx || blnx || key) {
    pro = pro.filter((res) => {
      const resname = res.name;
      const shouldKeep =
        !(clear && nameclear.test(resname)) &&
        !(nx && namenx.test(resname)) &&
        !(blnx && !nameblnx.test(resname)) &&
        !(key && !(keya.test(resname) && /2|4|6|7/i.test(resname)));
      return shouldKeep;
    });
  }

  const BLKEYS = BLKEY ? BLKEY.split("+") : "";

  // 如果启用IP地理位置解析，批量查询所有节点
  if (ipgeo) {
    console.log('[IPGeo] ===========================================');
    console.log('[IPGeo] 开始解析节点IP地理位置');
    console.log('[IPGeo] 模式: 离线IP段匹配优先 + 在线查询备用');
    console.log(`[IPGeo] 总节点数: ${pro.length}`);
    console.log('[IPGeo] ===========================================');
    
    let offlineSuccess = 0;
    let onlineSuccess = 0;
    let failCount = 0;
    let filteredCount = 0; // 被过滤的节点
    
    for (let i = pro.length - 1; i >= 0; i--) {
      const e = pro[i];
      const host = extractHost(e);
      
      // 检查是否为有效的IP或域名
      if (!host || (!isIPAddress(host) && !isDomain(host))) {
        console.log(`[IPGeo] ✗ 过滤无效节点: "${e.name}" (非IP/域名)`);
        pro.splice(i, 1); // 移除节点
        filteredCount++;
        continue;
      }
      
      if (host) {
        // 保存原始节点名，用于提取关键词
        const originalName = e.name;
        
        const geoInfo = await getIPGeo(host);
        if (geoInfo && geoInfo.countryCode) {
          const countryName = countryCodeMap[geoInfo.countryCode] || geoInfo.country;
          e._geoCountry = countryName;
          e._geoCode = geoInfo.countryCode;
          
          // 提取关键词（从原始节点名）
          let keywords = '';
          if (BLKEY) {
            const matched = BLKEYS.filter(keyword => {
              const key = keyword.includes('>') ? keyword.split('>')[0] : keyword;
              return originalName.includes(key);
            });
            if (matched.length > 0) {
              keywords = matched.map(k => k.includes('>') ? k.split('>')[1] : k).join(' ');
            }
          }
          
          // 重新组合节点名：国家 + 关键词
          e.name = keywords ? `${countryName} ${keywords}` : countryName;
          
          if (isIPAddress(host) && getCountryByIPRange(host)) {
            offlineSuccess++;
          } else {
            onlineSuccess++;
          }
        } else {
          console.log(`[IPGeo] ✗ 跳过: ${host}`);
          failCount++;
        }
      }
    }
    
    console.log('[IPGeo] ===========================================');
    console.log(`[IPGeo] 解析完成!`);
    console.log(`[IPGeo] 离线IP段匹配: ${offlineSuccess} 个`);
    console.log(`[IPGeo] 在线查询成功: ${onlineSuccess} 个`);
    console.log(`[IPGeo] 无法识别: ${failCount} 个`);
    console.log(`[IPGeo] 过滤无效节点: ${filteredCount} 个`);
    console.log(`[IPGeo] 总成功率: ${((offlineSuccess + onlineSuccess) / (pro.length + filteredCount) * 100).toFixed(1)}%`);
    console.log('[IPGeo] ===========================================');
    
    if (offlineSuccess + onlineSuccess === 0 && failCount > 0) {
      console.log('[IPGeo] ⚠️ 警告: 所有节点均未识别！');
      console.log('[IPGeo] 可能原因:');
      console.log('[IPGeo]  1. IP段数据库未覆盖这些IP（请反馈以便添加）');
      console.log('[IPGeo]  2. 域名节点且在线查询失败（需开启代理）');
    }
  }

  pro.forEach((e) => {
    let bktf = false, ens = e.name
    // 预处理 防止预判或遗漏
    Object.keys(rurekey).forEach((ikey) => {
      if (rurekey[ikey].test(e.name)) {
        e.name = e.name.replace(rurekey[ikey], ikey);
      if (BLKEY) {
        bktf = true
        let BLKEY_REPLACE = "",
        re = false;
      BLKEYS.forEach((i) => {
        if (i.includes(">") && ens.includes(i.split(">")[0])) {
          if (rurekey[ikey].test(i.split(">")[0])) {
              e.name += " " + i.split(">")[0]
            }
          if (i.split(">")[1]) {
            BLKEY_REPLACE = i.split(">")[1];
            re = true;
          }
        } else {
          if (ens.includes(i)) {
             e.name += " " + i
            }
        }
        retainKey = re
        ? BLKEY_REPLACE
        : BLKEYS.filter((items) => e.name.includes(items));
      });}
      }
    });
    if (blockquic == "on") {
      e["block-quic"] = "on";
    } else if (blockquic == "off") {
      e["block-quic"] = "off";
    } else {
      delete e["block-quic"];
    }

    // 自定义
    if (!bktf && BLKEY) {
      let BLKEY_REPLACE = "",
        re = false;
      BLKEYS.forEach((i) => {
        if (i.includes(">") && e.name.includes(i.split(">")[0])) {
          if (i.split(">")[1]) {
            BLKEY_REPLACE = i.split(">")[1];
            re = true;
          }
        }
      });
      retainKey = re
        ? BLKEY_REPLACE
        : BLKEYS.filter((items) => e.name.includes(items));
    }

    let ikey = "",
      ikeys = "";
    // 保留固定格式 倍率
    if (blgd) {
      regexArray.forEach((regex, index) => {
        if (regex.test(e.name)) {
          ikeys = valueArray[index];
        }
      });
    }

    // 正则 匹配倍率
    if (bl) {
      const match = e.name.match(
        /((倍率|X|x|×)\D?((\d{1,3}\.)?\d+)\D?)|((\d{1,3}\.)?\d+)(倍|X|x|×)/
      );
      if (match) {
        const rev = match[0].match(/(\d[\d.]*)/)[0];
        if (rev !== "1") {
          const newValue = rev + "×";
          ikey = newValue;
        }
      }
    }

    !GetK && ObjKA(Allmap)
    // 匹配 Allkey 地区
    const findKey = AMK.find(([key]) =>
      e.name.includes(key)
    )
    
    let firstName = "",
      nNames = "";

    if (nf) {
      firstName = FNAME;
    } else {
      nNames = FNAME;
    }
    if (findKey?.[1]) {
      const findKeyValue = findKey[1];
      let keyover = [],
        usflag = "";
      if (addflag) {
        const index = outList.indexOf(findKeyValue);
        if (index !== -1) {
          usflag = FG[index];
          usflag = usflag === "🇹🇼" ? "🇨🇳" : usflag;
        }
      }
      keyover = keyover
        .concat(firstName, usflag, nNames, findKeyValue, retainKey, ikey, ikeys)
        .filter((k) => k !== "");
      e.name = keyover.join(FGF);
    } else {
      // 优化：默认保留未匹配的节点，添加前缀（如果有）
      if (FNAME) {
        e.name = FNAME + FGF + e.name;
      }
      // 如果 nm=false 且想要过滤，需显式设置，否则保留原节点名
    }
  });
  // 优化：只过滤掉显式标记为null的节点（现在不会有null的情况）
  // 如果需要过滤未匹配节点，请使用参数控制
  pro = pro.filter((e) => e.name !== null && e.name !== "");
  jxh(pro);
  numone && oneP(pro);
  blpx && (pro = fampx(pro));
  key && (pro = pro.filter((e) => !keyb.test(e.name)));
  return pro;
}

// prettier-ignore
function getList(arg) { switch (arg) { case 'us': return EN; case 'gq': return FG; case 'quan': return QC; default: return ZH; }}
// prettier-ignore
function jxh(e) { const n = e.reduce((e, n) => { const t = e.find((e) => e.name === n.name); if (t) { t.count++; t.items.push({ ...n, name: `${n.name}${XHFGF}${t.count.toString().padStart(2, "0")}`, }); } else { e.push({ name: n.name, count: 1, items: [{ ...n, name: `${n.name}${XHFGF}01` }], }); } return e; }, []);const t=(typeof Array.prototype.flatMap==='function'?n.flatMap((e) => e.items):n.reduce((acc, e) => acc.concat(e.items),[])); e.splice(0, e.length, ...t); return e;}
// prettier-ignore
function oneP(e) { const t = e.reduce((e, t) => { const n = t.name.replace(/[^A-Za-z0-9\u00C0-\u017F\u4E00-\u9FFF]+\d+$/, ""); if (!e[n]) { e[n] = []; } e[n].push(t); return e; }, {}); for (const e in t) { if (t[e].length === 1 && t[e][0].name.endsWith("01")) {/* const n = t[e][0]; n.name = e;*/ t[e][0].name= t[e][0].name.replace(/[^.]01/, "") } } return e; }
// prettier-ignore
function fampx(pro) { const wis = []; const wnout = []; for (const proxy of pro) { const fan = specialRegex.some((regex) => regex.test(proxy.name)); if (fan) { wis.push(proxy); } else { wnout.push(proxy); } } const sps = wis.map((proxy) => specialRegex.findIndex((regex) => regex.test(proxy.name)) ); wis.sort( (a, b) => sps[wis.indexOf(a)] - sps[wis.indexOf(b)] || a.name.localeCompare(b.name) ); wnout.sort((a, b) => pro.indexOf(a) - pro.indexOf(b)); return wnout.concat(wis);}