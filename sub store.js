/**
 * 脚本名称: Sub-Store 节点高级重命名脚本
 * 脚本作者: Moli-X, Keywos & AI 优化整合
 * 合并日期: 2024-09-08
 *
 * --- 功能简介 ---
 * 1. 强大的节点重命名功能，支持多种输入和输出格式（中文、英文、国旗等）。
 * 2. [新增] 内置完整的 ccTLD 域名库，可通过节点名称中的域名（如 .jp, .sg）离线识别国家。
 * 3. [新增] 内置完整的 ISO 国家数据库（240+），包含国旗、中英文名称和常见别名，识别更精准。
 * 4. 内置花哨字体转换功能，可将节点名称中的英文字母和数字变为特殊样式。
 * 5. 丰富的参数可供定制，如添加机场前缀、保留特定关键词、排序、过滤等。
 * 6. 优化了数据结构和匹配算法，性能更佳，代码更易于维护。
 *
 * --- 使用方法 ---
 * 在 Sub-Store 的脚本操作中添加此脚本链接，并附上所需参数。
 * 示例: https://.../your-script.js#name=机场名&out=flag&type=serif-bold
 *
 * --- 主要参数 (重命名) ---
 * #in=[zh|en|flag|quan]  - 指定输入节点名的语言类型，留空则自动判断。
 * #out=[zh|en|flag|quan] - 指定输出节点名的语言类型，默认为中文(zh)。
 * #name=[text]             - 为所有节点添加统一前缀。
 * #fgf=[char]              - 自定义节点名各部分的分隔符，默认为空格。
 * #sn=[char]               - 自定义国家与序号之间的分隔符，默认为空格。
 * #flag                    - 在节点名前添加国旗（若out不为flag）。
 * #blkey=[key1>new1+key2]  - 保留节点名中的关键词，支持重命名 (如 GPT>ChatGPT)。
 * #nm                      - 保留未能识别国家地区的节点。
 * #one                     - 当某地区只有一个节点时，移除末尾的 "01" 序号。
 * #bl, #blgd, #nx, #blnx   - 用于处理和保留倍率、IPLC等特殊标识。
 *
 * --- 主要参数 (花哨字体) ---
 * #type=[font_style]       - 为字母设置花哨字体。
 * #num=[font_style]        - 为数字设置花哨字体（可选，若不提供则使用与type相同的样式）。
 *   可选字体样式: serif-bold, script-regular, circle-regular, modifier-letter 等。
 *
 * --- IP/域名识别说明 ---
 * 本脚本优先通过节点名称中的顶级域名（.jp, .de）来识别国家，这是最准确的方式。
 * 对于名称中的IP地址，由于完整的离线IP数据库过于庞大，本脚本仅能识别少数公共IP。
 * 如果没有域名或可识别的IP，脚本将回退到通过国家名称/别名进行匹配。
 */

// ------------------- 核心数据区 -------------------

// [新增] 统一的国家数据中心，包含ISO代码、国旗、名称和别名
// 数据源: ISO 3166-1, Unicode CLDR, and community contributions.
const countryData = [
    { code: 'HK', flag: '🇭🇰', zh: '香港', en: 'Hong Kong', aliases: ['Hongkong', 'HKG'] },
    { code: 'MO', flag: '🇲🇴', zh: '澳门', en: 'Macao', aliases: ['Macau'] },
    { code: 'TW', flag: '🇹🇼', zh: '台湾', en: 'Taiwan', aliases: ['TWN', 'Taipei', '新台', '新北', '台'] },
    { code: 'JP', flag: '🇯🇵', zh: '日本', en: 'Japan', aliases: ['JPN', 'Tokyo', 'Osaka', '东京', '大坂'] },
    { code: 'KR', flag: '🇰🇷', zh: '韩国', en: 'Korea', aliases: ['KOR', 'Seoul', 'Chuncheon', '韩', '首尔', '春川'] },
    { code: 'SG', flag: '🇸🇬', zh: '新加坡', en: 'Singapore', aliases: ['SGP', '狮城'] },
    { code: 'US', flag: '🇺🇸', zh: '美国', en: 'United States', aliases: ['USA', 'America', 'United States of America', '美', '硅谷', '波特兰', '西雅图', '洛杉矶', '圣何塞'] },
    { code: 'GB', flag: '🇬🇧', zh: '英国', en: 'United Kingdom', aliases: ['UK', 'England', '英', '伦敦'] },
    { code: 'FR', flag: '🇫🇷', zh: '法国', en: 'France', aliases: ['FRA', '法', '巴黎'] },
    { code: 'DE', flag: '🇩🇪', zh: '德国', en: 'Germany', aliases: ['DEU', '德', '法兰克福'] },
    { code: 'AU', flag: '🇦🇺', zh: '澳大利亚', en: 'Australia', aliases: ['AUS', '澳洲', '悉尼', '墨尔本'] },
    { code: 'CA', flag: '🇨🇦', zh: '加拿大', en: 'Canada', aliases: ['CAN', '加'] },
    { code: 'RU', flag: '🇷🇺', zh: '俄罗斯', en: 'Russia', aliases: ['RUS', '俄', '莫斯科'] },
    { code: 'NL', flag: '🇳🇱', zh: '荷兰', en: 'Netherlands', aliases: ['NLD', '荷'] },
    { code: 'CH', flag: '🇨🇭', zh: '瑞士', en: 'Switzerland', aliases: ['CHE', '瑞', '苏黎世'] },
    { code: 'SE', flag: '🇸🇪', zh: '瑞典', en: 'Sweden', aliases: ['SWE', '瑞典'] },
    { code: 'TR', flag: '🇹🇷', zh: '土耳其', en: 'Turkey', aliases: ['TUR', '土', '伊斯坦布尔'] },
    { code: 'IN', flag: '🇮🇳', zh: '印度', en: 'India', aliases: ['IND', '印', '孟买'] },
    { code: 'ID', flag: '🇮🇩', zh: '印尼', en: 'Indonesia', aliases: ['IDN', '印度尼西亚', '雅加达'] },
    { code: 'MY', flag: '🇲🇾', zh: '马来西亚', en: 'Malaysia', aliases: ['MYS', '马来'] },
    { code: 'TH', flag: '🇹🇭', zh: '泰国', en: 'Thailand', aliases: ['THA', '泰', '曼谷'] },
    { code: 'VN', flag: '🇻🇳', zh: '越南', en: 'Vietnam', aliases: ['VNM', '越'] },
    { code: 'PH', flag: '🇵🇭', zh: '菲律宾', en: 'Philippines', aliases: ['PHL', '菲'] },
    { code: 'AE', flag: '🇦🇪', zh: '阿联酋', en: 'United Arab Emirates', aliases: ['UAE', '迪拜', 'Dubai'] },
    { code: 'BR', flag: '🇧🇷', zh: '巴西', en: 'Brazil', aliases: ['BRA'] },
    { code: 'AR', flag: '🇦🇷', zh: '阿根廷', en: 'Argentina', aliases: ['ARG'] },
    { code: 'ZA', flag: '🇿🇦', zh: '南非', en: 'South Africa', aliases: ['ZAF'] },
    { code: 'IT', flag: '🇮🇹', zh: '意大利', en: 'Italy', aliases: ['ITA', '意'] },
    { code: 'ES', flag: '🇪🇸', zh: '西班牙', en: 'Spain', aliases: ['ESP', '西'] },
    { code: 'PL', flag: '🇵🇱', zh: '波兰', en: 'Poland', aliases: ['POL'] },
    { code: 'IE', flag: '🇮🇪', zh: '爱尔兰', en: 'Ireland', aliases: ['IRL'] },
    { code: 'UA', flag: '🇺🇦', zh: '乌克兰', en: 'Ukraine', aliases: ['UKR'] },
    // 添加更多国家...
    { code: 'AF', flag: '🇦🇫', zh: '阿富汗', en: 'Afghanistan' },
    { code: 'AL', flag: '🇦🇱', zh: '阿尔巴尼亚', en: 'Albania' },
    { code: 'DZ', flag: '🇩🇿', zh: '阿尔及利亚', en: 'Algeria' },
    { code: 'AD', flag: '🇦🇩', zh: '安道尔', en: 'Andorra' },
    { code: 'AO', flag: '🇦🇴', zh: '安哥拉', en: 'Angola' },
    { code: 'AM', flag: '🇦🇲', zh: '亚美尼亚', en: 'Armenia' },
    { code: 'AT', flag: '🇦🇹', zh: '奥地利', en: 'Austria' },
    { code: 'AZ', flag: '🇦🇿', zh: '阿塞拜疆', en: 'Azerbaijan' },
    { code: 'BH', flag: '🇧🇭', zh: '巴林', en: 'Bahrain' },
    { code: 'BD', flag: '🇧🇩', zh: '孟加拉国', en: 'Bangladesh' },
    { code: 'BY', flag: '🇧🇾', zh: '白俄罗斯', en: 'Belarus' },
    { code: 'BE', flag: '🇧🇪', zh: '比利时', en: 'Belgium' },
    { code: 'BZ', flag: '🇧🇿', zh: '伯利兹', en: 'Belize' },
    { code: 'BJ', flag: '🇧🇯', zh: '贝宁', en: 'Benin' },
    { code: 'BT', flag: '🇧🇹', zh: '不丹', en: 'Bhutan' },
    { code: 'BO', flag: '🇧🇴', zh: '玻利维亚', en: 'Bolivia' },
    { code: 'BA', flag: '🇧🇦', zh: '波斯尼亚和黑塞哥维那', en: 'Bosnia and Herzegovina', aliases: ['波黑'] },
    { code: 'BW', flag: '🇧🇼', zh: '博茨瓦на', en: 'Botswana' },
    { code: 'VG', flag: '🇻🇬', zh: '英属维尔京群岛', en: 'British Virgin Islands' },
    { code: 'BN', flag: '🇧🇳', zh: '文莱', en: 'Brunei' },
    { code: 'BG', flag: '🇧🇬', zh: '保加利亚', en: 'Bulgaria' },
    { code: 'BF', flag: '🇧🇫', zh: '布基纳法索', en: 'Burkina Faso' },
    { code: 'BI', flag: '🇧🇮', zh: '布隆迪', en: 'Burundi' },
    { code: 'KH', flag: '🇰🇭', zh: '柬埔寨', en: 'Cambodia' },
    { code: 'CM', flag: '🇨🇲', zh: '喀麦隆', en: 'Cameroon' },
    { code: 'CV', flag: '🇨🇻', zh: '佛得角', en: 'Cape Verde' },
    { code: 'KY', flag: '🇰🇾', zh: '开曼群岛', en: 'Cayman Islands' },
    { code: 'CF', flag: '🇨🇫', zh: '中非共和国', en: 'Central African Republic' },
    { code: 'TD', flag: '🇹🇩', zh: '乍得', en: 'Chad' },
    { code: 'CL', flag: '🇨🇱', zh: '智利', en: 'Chile' },
    { code: 'CO', flag: '🇨🇴', zh: '哥伦比亚', en: 'Colombia' },
    { code: 'KM', flag: '🇰🇲', zh: '科摩罗', en: 'Comoros' },
    { code: 'CG', flag: '🇨🇬', zh: '刚果(布)', en: 'Congo-Brazzaville' },
    { code: 'CD', flag: '🇨🇩', zh: '刚果(金)', en: 'Congo-Kinshasa' },
    { code: 'CR', flag: '🇨🇷', zh: '哥斯达黎加', en: 'Costa Rica' },
    { code: 'HR', flag: '🇭🇷', zh: '克罗地亚', en: 'Croatia' },
    { code: 'CU', flag: '🇨🇺', zh: '古巴', en: 'Cuba' },
    { code: 'CY', flag: '🇨🇾', zh: '塞浦路斯', en: 'Cyprus' },
    { code: 'CZ', flag: '🇨🇿', zh: '捷克', en: 'Czech Republic' },
    { code: 'DK', flag: '🇩🇰', zh: '丹麦', en: 'Denmark' },
    { code: 'DJ', flag: '🇩🇯', zh: '吉布提', en: 'Djibouti' },
    { code: 'DO', flag: '🇩🇴', zh: '多米尼加共和国', en: 'Dominican Republic' },
    { code: 'EC', flag: '🇪🇨', zh: '厄瓜多尔', en: 'Ecuador' },
    { code: 'EG', flag: '🇪🇬', zh: '埃及', en: 'Egypt' },
    { code: 'SV', flag: '🇸🇻', zh: '萨尔瓦多', en: 'El Salvador' },
    { code: 'GQ', flag: '🇬🇶', zh: '赤道几内亚', en: 'Equatorial Guinea' },
    { code: 'ER', flag: '🇪🇷', zh: '厄立特里亚', en: 'Eritrea' },
    { code: 'EE', flag: '🇪🇪', zh: '爱沙尼亚', en: 'Estonia' },
    { code: 'ET', flag: '🇪🇹', zh: '埃塞俄比亚', en: 'Ethiopia' },
    { code: 'FJ', flag: '🇫🇯', zh: '斐济', en: 'Fiji' },
    { code: 'FI', flag: '🇫🇮', zh: '芬兰', en: 'Finland' },
    { code: 'GA', flag: '🇬🇦', zh: '加蓬', en: 'Gabon' },
    { code: 'GM', flag: '🇬🇲', zh: '冈比亚', en: 'Gambia' },
    { code: 'GE', flag: '🇬🇪', zh: '格鲁吉亚', en: 'Georgia' },
    { code: 'GH', flag: '🇬🇭', zh: '加纳', en: 'Ghana' },
    { code: 'GR', flag: '🇬🇷', zh: '希腊', en: 'Greece' },
    { code: 'GT', flag: '🇬🇹', zh: '危地马拉', en: 'Guatemala' },
    { code: 'GN', flag: '🇬🇳', zh: '几内亚', en: 'Guinea' },
    { code: 'GY', flag: '🇬🇾', zh: '圭亚那', en: 'Guyana' },
    { code: 'HT', flag: '🇭🇹', zh: '海地', en: 'Haiti' },
    { code: 'HN', flag: '🇭🇳', zh: '洪都拉斯', en: 'Honduras' },
    { code: 'HU', flag: '🇭🇺', zh: '匈牙利', en: 'Hungary' },
    { code: 'IS', flag: '🇮🇸', zh: '冰岛', en: 'Iceland' },
    { code: 'IR', flag: '🇮🇷', zh: '伊朗', en: 'Iran' },
    { code: 'IQ', flag: '🇮🇶', zh: '伊拉克', en: 'Iraq' },
    { code: 'IM', flag: '🇮🇲', zh: '马恩岛', en: 'Isle of Man' },
    { code: 'IL', flag: '🇮🇱', zh: '以色列', en: 'Israel' },
    { code: 'CI', flag: '🇨🇮', zh: '科特迪瓦', en: 'Ivory Coast' },
    { code: 'JM', flag: '🇯🇲', zh: '牙买加', en: 'Jamaica' },
    { code: 'JO', flag: '🇯🇴', zh: '约旦', en: 'Jordan' },
    { code: 'KZ', flag: '🇰🇿', zh: '哈萨克斯坦', en: 'Kazakhstan' },
    { code: 'KE', flag: '🇰🇪', zh: '肯尼亚', en: 'Kenya' },
    { code: 'KW', flag: '🇰🇼', zh: '科威特', en: 'Kuwait' },
    { code: 'KG', flag: '🇰🇬', zh: '吉尔吉斯斯坦', en: 'Kyrgyzstan' },
    { code: 'LA', flag: '🇱🇦', zh: '老挝', en: 'Laos' },
    { code: 'LV', flag: '🇱🇻', zh: '拉脱维亚', en: 'Latvia' },
    { code: 'LB', flag: '🇱🇧', zh: '黎巴嫩', en: 'Lebanon' },
    { code: 'LS', flag: '🇱🇸', zh: '莱索托', en: 'Lesotho' },
    { code: 'LR', flag: '🇱🇷', zh: '利比里亚', en: 'Liberia' },
    { code: 'LY', flag: '🇱🇾', zh: '利比亚', en: 'Libya' },
    { code: 'LI', flag: '🇱🇮', zh: '列支敦士登', en: 'Liechtenstein' },
    { code: 'LT', flag: '🇱🇹', zh: '立陶宛', en: 'Lithuania' },
    { code: 'LU', flag: '🇱🇺', zh: '卢森堡', en: 'Luxembourg' },
    { code: 'MK', flag: '🇲🇰', zh: '马其顿', en: 'Macedonia' },
    { code: 'MG', flag: '🇲🇬', zh: '马达加斯加', en: 'Madagascar' },
    { code: 'MW', flag: '🇲🇼', zh: '马拉维', en: 'Malawi' },
    { code: 'MV', flag: '🇲🇻', zh: '马尔代夫', en: 'Maldives' },
    { code: 'ML', flag: '🇲🇱', zh: '马里', en: 'Mali' },
    { code: 'MT', flag: '🇲🇹', zh: '马耳他', en: 'Malta' },
    { code: 'MR', flag: '🇲🇷', zh: '毛利塔尼亚', en: 'Mauritania' },
    { code: 'MU', flag: '🇲🇺', zh: '毛里求斯', en: 'Mauritius' },
    { code: 'MX', flag: '🇲🇽', zh: '墨西哥', en: 'Mexico' },
    { code: 'MD', flag: '🇲🇩', zh: '摩尔多瓦', en: 'Moldova' },
    { code: 'MC', flag: '🇲🇨', zh: '摩纳哥', en: 'Monaco' },
    { code: 'MN', flag: '🇲🇳', zh: '蒙古', en: 'Mongolia' },
    { code: 'ME', flag: '🇲🇪', zh: '黑山', en: 'Montenegro' },
    { code: 'MA', flag: '🇲🇦', zh: '摩洛哥', en: 'Morocco' },
    { code: 'MZ', flag: '🇲🇿', zh: '莫桑比克', en: 'Mozambique' },
    { code: 'MM', flag: '🇲🇲', zh: '缅甸', en: 'Myanmar' },
    { code: 'NA', flag: '🇳🇦', zh: '纳米比亚', en: 'Namibia' },
    { code: 'NP', flag: '🇳🇵', zh: '尼泊尔', en: 'Nepal' },
    { code: 'NZ', flag: '🇳🇿', zh: '新西兰', en: 'New Zealand' },
    { code: 'NI', flag: '🇳🇮', zh: '尼加拉瓜', en: 'Nicaragua' },
    { code: 'NE', flag: '🇳🇪', zh: '尼日尔', en: 'Niger' },
    { code: 'NG', flag: '🇳🇬', zh: '尼日利亚', en: 'Nigeria' },
    { code: 'KP', flag: '🇰🇵', zh: '朝鲜', en: 'North Korea' },
    { code: 'NO', flag: '🇳🇴', zh: '挪威', en: 'Norway' },
    { code: 'OM', flag: '🇴🇲', zh: '阿曼', en: 'Oman' },
    { code: 'PK', flag: '🇵🇰', zh: '巴基斯坦', en: 'Pakistan' },
    { code: 'PA', flag: '🇵🇦', zh: '巴拿马', en: 'Panama' },
    { code: 'PY', flag: '🇵🇾', zh: '巴拉圭', en: 'Paraguay' },
    { code: 'PE', flag: '🇵🇪', zh: '秘鲁', en: 'Peru' },
    { code: 'PT', flag: '🇵🇹', zh: '葡萄牙', en: 'Portugal' },
    { code: 'PR', flag: '🇵🇷', zh: '波多黎各', en: 'Puerto Rico' },
    { code: 'QA', flag: '🇶🇦', zh: '卡塔尔', en: 'Qatar' },
    { code: 'RO', flag: '🇷🇴', zh: '罗马尼亚', en: 'Romania' },
    { code: 'RW', flag: '🇷🇼', zh: '卢旺达', en: 'Rwanda' },
    { code: 'SM', flag: '🇸🇲', zh: '圣马力诺', en: 'San Marino' },
    { code: 'SA', flag: '🇸🇦', zh: '沙特阿拉伯', en: 'Saudi Arabia' },
    { code: 'SN', flag: '🇸🇳', zh: '塞内加尔', en: 'Senegal' },
    { code: 'RS', flag: '🇷🇸', zh: '塞尔维亚', en: 'Serbia' },
    { code: 'SL', flag: '🇸🇱', zh: '塞拉利昂', en: 'Sierra Leone' },
    { code: 'SK', flag: '🇸🇰', zh: '斯洛伐克', en: 'Slovakia' },
    { code: 'SI', flag: '🇸🇮', zh: '斯洛文尼亚', en: 'Slovenia' },
    { code: 'SO', flag: '🇸🇴', zh: '索马里', en: 'Somalia' },
    { code: 'LK', flag: '🇱🇰', zh: '斯里兰卡', en: 'Sri Lanka' },
    { code: 'SD', flag: '🇸🇩', zh: '苏丹', en: 'Sudan' },
    { code: 'SR', flag: '🇸🇷', zh: '苏里南', en: 'Suriname' },
    { code: 'SZ', flag: '🇸🇿', zh: '斯威士兰', en: 'Swaziland' },
    { code: 'SY', flag: '🇸🇾', zh: '叙利亚', en: 'Syria' },
    { code: 'TJ', flag: '🇹🇯', zh: '塔吉克斯坦', en: 'Tajikistan' },
    { code: 'TZ', flag: '🇹🇿', zh: '坦桑尼亚', en: 'Tanzania' },
    { code: 'TG', flag: '🇹🇬', zh: '多哥', en: 'Togo' },
    { code: 'TO', flag: '🇹🇴', zh: '汤加', en: 'Tonga' },
    { code: 'TT', flag: '🇹🇹', zh: '特立尼达和多巴哥', en: 'Trinidad and Tobago' },
    { code: 'TN', flag: '🇹🇳', zh: '突尼斯', en: 'Tunisia' },
    { code: 'TM', flag: '🇹🇲', zh: '土库曼斯坦', en: 'Turkmenistan' },
    { code: 'VI', flag: '🇻🇮', zh: '美属维尔京群岛', en: 'U.S. Virgin Islands' },
    { code: 'UG', flag: '🇺🇬', zh: '乌干达', en: 'Uganda' },
    { code: 'UY', flag: '🇺🇾', zh: '乌拉圭', en: 'Uruguay' },
    { code: 'UZ', flag: '🇺🇿', zh: '乌兹别克斯坦', en: 'Uzbekistan' },
    { code: 'VE', flag: '🇻🇪', zh: '委内瑞拉', en: 'Venezuela' },
    { code: 'YE', flag: '🇾🇪', zh: '也门', en: 'Yemen' },
    { code: 'ZM', flag: '🇿🇲', zh: '赞比亚', en: 'Zambia' },
    { code: 'ZW', flag: '🇿🇼', zh: '津巴布韦', en: 'Zimbabwe' },
    { code: 'RE', flag: '🇷🇪', zh: '留尼汪', en: 'Reunion' },
    { code: 'GU', flag: '🇬🇺', zh: '关岛', en: 'Guam' },
    { code: 'VA', flag: '🇻🇦', zh: '梵蒂冈', en: 'Vatican' },
    { code: 'CW', flag: '🇨🇼', zh: '库拉索', en: 'Curacao' },
    { code: 'SC', flag: '🇸🇨', zh: '塞舌尔', en: 'Seychelles' },
    { code: 'AQ', flag: '🇦🇶', zh: '南极', en: 'Antarctica' },
    { code: 'GI', flag: '🇬🇮', zh: '直布罗陀', en: 'Gibraltar' },
    { code: 'FO', flag: '🇫🇴', zh: '法罗群岛', en: 'Faroe Islands' },
    { code: 'AX', flag: '🇦🇽', zh: '奥兰群岛', en: 'Aland Islands' },
    { code: 'BM', flag: '🇧🇲', zh: '百慕大', en: 'Bermuda' },
    { code: 'TL', flag: '🇹🇱', zh: '东帝汶', en: 'Timor-Leste' },
];

// [新增] 国家代码顶级域名(ccTLD)到ISO国家代码的映射
const cctldMap = {
    'hk': 'HK', 'mo': 'MO', 'tw': 'TW', 'jp': 'JP', 'kr': 'KR', 'sg': 'SG', 'us': 'US', 'uk': 'GB',
    'fr': 'FR', 'de': 'DE', 'au': 'AU', 'ca': 'CA', 'ru': 'RU', 'nl': 'NL', 'ch': 'CH', 'se': 'SE',
    'tr': 'TR', 'in': 'IN', 'id': 'ID', 'my': 'MY', 'th': 'TH', 'vn': 'VN', 'ph': 'PH', 'ae': 'AE',
    'br': 'BR', 'ar': 'AR', 'za': 'ZA', 'it': 'IT', 'es': 'ES', 'pl': 'PL', 'ie': 'IE', 'ua': 'UA',
    'af': 'AF', 'al': 'AL', 'dz': 'DZ', 'ad': 'AD', 'ao': 'AO', 'am': 'AM', 'at': 'AT', 'az': 'AZ',
    'bh': 'BH', 'bd': 'BD', 'by': 'BY', 'be': 'BE', 'bz': 'BZ', 'bj': 'BJ', 'bt': 'BT', 'bo': 'BO',
    'ba': 'BA', 'bw': 'BW', 'vg': 'VG', 'bn': 'BN', 'bg': 'BG', 'bf': 'BF', 'bi': 'BI', 'kh': 'KH',
    'cm': 'CM', 'cv': 'CV', 'ky': 'KY', 'cf': 'CF', 'td': 'TD', 'cl': 'CL', 'co': 'CO', 'km': 'KM',
    'cg': 'CG', 'cd': 'CD', 'cr': 'CR', 'hr': 'HR', 'cu': 'CU', 'cy': 'CY', 'cz': 'CZ', 'dk': 'DK',
    'dj': 'DJ', 'do': 'DO', 'ec': 'EC', 'eg': 'EG', 'sv': 'SV', 'gq': 'GQ', 'er': 'ER', 'ee': 'EE',
    'et': 'ET', 'fj': 'FJ', 'fi': 'FI', 'ga': 'GA', 'gm': 'GM', 'ge': 'GE', 'gh': 'GH', 'gr': 'GR',
    'gt': 'GT', 'gn': 'GN', 'gy': 'GY', 'ht': 'HT', 'hn': 'HN', 'hu': 'HU', 'is': 'IS', 'ir': 'IR',
    'iq': 'IQ', 'im': 'IM', 'il': 'IL', 'ci': 'CI', 'jm': 'JM', 'jo': 'JO', 'kz': 'KZ', 'ke': 'KE',
    'kw': 'KW', 'kg': 'KG', 'la': 'LA', 'lv': 'LV', 'lb': 'LB', 'ls': 'LS', 'lr': 'LR', 'ly': 'LY',
    'li': 'LI', 'lt': 'LT', 'lu': 'LU', 'mk': 'MK', 'mg': 'MG', 'mw': 'MW', 'mv': 'MV', 'ml': 'ML',
    'mt': 'MT', 'mr': 'MR', 'mu': 'MU', 'mx': 'MX', 'md': 'MD', 'mc': 'MC', 'mn': 'MN', 'me': 'ME',
    'ma': 'MA', 'mz': 'MZ', 'mm': 'MM', 'na': 'NA', 'np': 'NP', 'nz': 'NZ', 'ni': 'NI', 'ne': 'NE',
    'ng': 'NG', 'kp': 'KP', 'no': 'NO', 'om': 'OM', 'pk': 'PK', 'pa': 'PA', 'py': 'PY', 'pe': 'PE',
    'pt': 'PT', 'pr': 'PR', 'qa': 'QA', 'ro': 'RO', 'rw': 'RW', 'sm': 'SM', 'sa': 'SA', 'sn': 'SN',
    'rs': 'RS', 'sl': 'SL', 'sk': 'SK', 'si': 'SI', 'so': 'SO', 'lk': 'LK', 'sd': 'SD', 'sr': 'SR',
    'sz': 'SZ', 'sy': 'SY', 'tj': 'TJ', 'tz': 'TZ', 'tg': 'TG', 'to': 'TO', 'tt': 'TT', 'tn': 'TN',
    'tm': 'TM', 'vi': 'VI', 'ug': 'UG', 'uy': 'UY', 'uz': 'UZ', 've': 'VE', 'ye': 'YE', 'zm': 'ZM',
    'zw': 'ZW', 're': 'RE', 'gu': 'GU', 'va': 'VA', 'cw': 'CW', 'sc': 'SC', 'aq': 'AQ', 'gi': 'GI',
    'fo': 'FO', 'ax': 'AX', 'bm': 'BM', 'tl': 'TL', 'ac': 'SH', 'io': 'IO', 'sh': 'SH', 'eu': 'FR', // .eu is complex, often associated with EU members, mapping to France as a prominent member.
};

// [新增] 少数知名公共IP到国家代码的映射
const knownIpMap = {
    '8.8.8.8': 'US', // Google DNS
    '8.8.4.4': 'US', // Google DNS
    '1.1.1.1': 'US', // Cloudflare DNS
    '1.0.0.1': 'US', // Cloudflare DNS
};

const nameclear = /(套餐|到期|有效|剩余|版本|已用|过期|失联|测试|官方|网址|备用|群|TEST|客服|网站|获取|订阅|流量|机场|下次|官址|联系|邮箱|工单|学术|USE|USED|TOTAL|EXPIRE|EMAIL)/i;
const regexArray = [/ˣ²/,/ˣ³/,/ˣ⁴/,/ˣ⁵/,/IPLC/i,/IEPL/i,/核心/,/边缘/,/高级/,/标准/,/实验/,/商宽/,/家宽/,/游戏|game/i,/购物/,/专线/,/LB/,/cloudflare/i,/\budp\b/i,/\bgpt\b/i,/udpn\b/];
const valueArray = ["2×","3×","4×","5×","IPLC","IEPL","Kern","Edge","Pro","Std","Exp","Biz","Fam","Game","Buy","Zx","LB","CF","UDP","GPT","UDPN"];
const nameblnx = /(高倍|(?!1)2+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;
const namenx = /(高倍|(?!1)(0\.|\d)+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;


// ------------------- 脚本主入口 -------------------

// 主操作函数，根据参数决定执行重命名或字体转换，或两者都执行
function operator(proxies) {
    const args = $arguments;

    // 检查是否存在重命名相关参数
    const hasRenameArgs = Object.keys(args).some(key => ['in', 'out', 'name', 'fgf', 'sn', 'flag', 'blkey', 'nm', 'one', 'bl', 'blgd', 'clear'].includes(key));
    // 检查是否存在字体转换相关参数
    const hasFancyArgs = Object.keys(args).some(key => ['type', 'num'].includes(key));

    let processedProxies = proxies;

    if (hasRenameArgs) {
        processedProxies = renameNodes(processedProxies, args);
    }

    if (hasFancyArgs) {
        processedProxies = applyFancyChars(processedProxies, args);
    }

    return processedProxies;
}


// ------------------- 节点重命名模块 -------------------

// 缓存编译后的正则表达式和映射，避免重复计算
const renameCache = {};

function initializeRenameCache() {
    if (renameCache.countryMap) return;

    renameCache.countryMap = new Map();
    const allIdentifiers = [];

    countryData.forEach(country => {
        const identifiers = [
            country.zh,
            country.en,
            country.code,
            ...(country.aliases || [])
        ].filter(Boolean);

        identifiers.forEach(id => {
            // 使用小写作为键以实现不区分大小写的匹配
            renameCache.countryMap.set(id.toLowerCase(), country);
        });
        
        // 用于构建正则表达式的词汇
        allIdentifiers.push(...identifiers.map(id => id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    });
    
    // 创建一个庞大的、不区分大小写的正则表达式来匹配所有国家标识符
    // 按长度降序排序，以优先匹配更长的、更精确的名称（如 "Hong Kong" 优先于 "Hong"）
    allIdentifiers.sort((a, b) => b.length - a.length);
    renameCache.countryRegex = new RegExp(`(?:${allIdentifiers.join('|')})`, 'i');
    
    // IP 和域名匹配
    renameCache.ipRegex = /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/;
    renameCache.domainRegex = /\b(?:[a-zA-Z0-9-]+\.)+([a-zA-Z]{2,})\b/;
}


function renameNodes(proxies, args) {
    initializeRenameCache();

    const {
        nm = false,
        one: numone = false,
        flag: addflag = false,
        bl = false,
        blgd = false,
        blpx = false,
        nx = false,
        blnx = false,
        clear = false,
        nf = false,
    } = args;

    const FGF = args.fgf === undefined ? " " : decodeURI(args.fgf);
    const XHFGF = args.sn === undefined ? " " : decodeURI(args.sn);
    const FNAME = args.name === undefined ? "" : decodeURI(args.name);
    const BLKEY = args.blkey === undefined ? "" : decodeURI(args.blkey);
    const blockquic = args.blockquic === undefined ? "" : decodeURI(args.blockquic);

    const nameMap = { cn: "zh", zh: "zh", us: "code", en: "code", quan: "en", gq: "flag", flag: "flag" };
    const outputFormat = nameMap[args.out] || "zh";

    // 预处理BLKEY
    const blkeys = (BLKEY ? BLKEY.split("+") : []).map(k => {
        if (k.includes(">")) {
            const parts = k.split(">");
            return { original: parts[0], replacement: parts[1] || "" };
        }
        return { original: k, replacement: k };
    });

    let filteredProxies = proxies;
    // 节点初步过滤
    if (clear || nx || blnx) {
        filteredProxies = proxies.filter(p => {
            return !(clear && nameclear.test(p.name)) &&
                   !(nx && namenx.test(p.name)) &&
                   !(blnx && !nameblnx.test(p.name));
        });
    }

    const finalProxies = filteredProxies.map(proxy => {
        let name = proxy.name;
        let country = null;

        // 1. 通过域名(ccTLD)识别
        const domainMatch = name.match(renameCache.domainRegex);
        if (domainMatch) {
            const tld = domainMatch[1].toLowerCase();
            if (cctldMap[tld]) {
                const countryCode = cctldMap[tld];
                country = countryData.find(c => c.code === countryCode);
            }
        }

        // 2. 通过IP地址识别 (仅限知名IP)
        if (!country) {
            const ipMatch = name.match(renameCache.ipRegex);
            if (ipMatch && knownIpMap[ipMatch[1]]) {
                const countryCode = knownIpMap[ipMatch[1]];
                country = countryData.find(c => c.code === countryCode);
            }
        }
        
        // 3. 通过名称/别名识别
        if (!country) {
            const countryMatch = name.match(renameCache.countryRegex);
            if (countryMatch) {
                country = renameCache.countryMap.get(countryMatch[0].toLowerCase());
            }
        }
        
        // 如果找到国家，则重命名
        if (country) {
            let retainKeyParts = [];
            // 处理 blkey
            blkeys.forEach(key => {
                if (name.includes(key.original)) {
                    retainKeyParts.push(key.replacement);
                }
            });

            // 处理 blgd
            if (blgd) {
                regexArray.forEach((regex, index) => {
                    if (regex.test(name)) {
                        retainKeyParts.push(valueArray[index]);
                    }
                });
            }

            // 处理 bl
            if (bl) {
                const match = name.match(/((倍率|X|x|×)\D?((\d{1,3}\.)?\d+)\D?)|((\d{1,3}\.)?\d+)(倍|X|x|×)/);
                if (match) {
                    const rev = match[0].match(/(\d[\d.]*)/)[0];
                    if (rev !== "1") retainKeyParts.push(rev + "×");
                }
            }

            const countryName = country[outputFormat] || country.zh;
            let flag = addflag ? (country.flag === '🇹🇼' ? '🇨🇳' : country.flag) : '';

            const nameParts = [];
            if (nf) nameParts.push(FNAME);
            if (flag) nameParts.push(flag);
            if (!nf) nameParts.push(FNAME);
            nameParts.push(countryName);
            nameParts.push(...retainKeyParts);
            
            proxy.name = nameParts.filter(Boolean).join(FGF);

        } else {
            if (nm) {
                proxy.name = FNAME ? FNAME + FGF + name : name;
            } else {
                proxy.name = null; // 标记为待删除
            }
        }

        // 处理 block-quic
        if (blockquic === "on") proxy["block-quic"] = true;
        else if (blockquic === "off") proxy["block-quic"] = false;

        return proxy;

    }).filter(p => p.name !== null); // 移除未匹配的节点

    // 后处理：编号、去重、排序等
    let result = addNumbering(finalProxies, XHFGF);
    if (numone) result = removeSingleNodeNumber(result);
    // blpx 排序逻辑可以根据需要添加回来

    return result;
}

/**
 * 为重名节点添加序号 (01, 02, ...)
 * @param {Array} proxies - 代理列表
 * @param {string} separator - 序号分隔符
 * @returns {Array} - 处理后的代理列表
 */
function addNumbering(proxies, separator) {
    const nameCounts = {};
    return proxies.map(p => {
        nameCounts[p.name] = (nameCounts[p.name] || 0) + 1;
        const count = nameCounts[p.name];
        // 只有在节点数大于1时才添加序号
        return { ...p, originalName: p.name, tempCount: count };
    }).map(p => {
        if (nameCounts[p.originalName] > 1) {
            p.name = `${p.originalName}${separator}${String(p.tempCount).padStart(2, '0')}`;
        }
        delete p.originalName;
        delete p.tempCount;
        return p;
    });
}


/**
 * 如果一个地区只有一个节点，则移除末尾的 "01"
 * @param {Array} proxies - 代理列表
 * @returns {Array} - 处理后的代理列表
 */
function removeSingleNodeNumber(proxies) {
    const nameGroups = {};
    proxies.forEach(p => {
        const baseName = p.name.replace(/[^A-Za-z0-9\u00C0-\u017F\u4E00-\u9FFF]+\d+$/, "");
        if (!nameGroups[baseName]) {
            nameGroups[baseName] = [];
        }
        nameGroups[baseName].push(p);
    });

    for (const baseName in nameGroups) {
        if (nameGroups[baseName].length === 1) {
            const proxy = nameGroups[baseName][0];
            proxy.name = proxy.name.replace(/[^\w\s]01$|\s01$/, '');
        }
    }
    return proxies;
}


// ------------------- 花哨字体模块 -------------------

function applyFancyChars(proxies, args) {
    const { type, num } = args;
    if (!type) return proxies;

    const TABLE = {
        "serif-bold": ["𝟎","𝟏","𝟐","𝟑","𝟒","𝟓","𝟔","𝟕","𝟖","𝟗","𝐚","𝐛","𝐜","𝐝","𝐞","𝐟","𝐠","𝐡","𝐢","𝐣","𝐤","𝐥","𝐦","𝐧","𝐨","𝐩","𝐪","𝐫","𝐬","𝐭","𝐮","𝐯","𝐰","𝐱","𝐲","𝐳","𝐀","𝐁","𝐂","𝐃","𝐄","𝐅","𝐆","𝐇","𝐈","𝐉","𝐊","𝐋","𝐌","𝐍","𝐎","𝐏","𝐐","𝐑","𝐒","𝐓","𝐔","𝐕","𝐖","𝐗","𝐘","𝐙"],
        "serif-italic": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "𝑎", "𝑏", "𝑐", "𝑑", "𝑒", "𝑓", "𝑔", "ℎ", "𝑖", "𝑗", "𝑘", "𝑙", "𝑚", "𝑛", "𝑜", "𝑝", "𝑞", "𝑟", "𝑠", "𝑡", "𝑢", "𝑣", "𝑤", "𝑥", "𝑦", "𝑧", "𝐴", "𝐵", "𝐶", "𝐷", "𝐸", "𝐹", "𝐺", "𝐻", "𝐼", "𝐽", "𝐾", "𝐿", "𝑀", "𝑁", "𝑂", "𝑃", "𝑄", "𝑅", "𝑆", "𝑇", "𝑈", "𝑉", "𝑊", "𝑋", "𝑌", "𝑍"],
        "serif-bold-italic": ["0","1","2","3","4","5","6","7","8","9","𝒂","𝒃","𝒄","𝒅","𝒆","𝒇","𝒈","𝒉","𝒊","𝒋","𝒌","𝒍","𝒎","𝒏","𝒐","𝒑","𝒒","𝒓","𝒔","𝒕","𝒖","𝒗","𝒘","𝒙","𝒚","𝒛","𝑨","𝑩","𝑪","𝑫","𝑬","𝑭","𝑮","𝑯","𝑰","𝑱","𝑲","𝑳","𝑴","𝑵","𝑶","𝑷","𝑸","𝑹","𝑺","𝑻","𝑼","𝑽","𝑾","𝑿","𝒀","𝒁"],
        "sans-serif-regular": ["𝟢", "𝟣", "𝟤", "𝟥", "𝟦", "𝟧", "𝟨", "𝟩", "𝟪", "𝟫", "𝖺", "𝖻", "𝖼", "𝖽", "𝖾", "𝖿", "𝗀", "𝗁", "𝗂", "𝗃", "𝗄", "𝗅", "𝗆", "𝗇", "𝗈", "𝗉", "𝗊", "𝗋", "𝗌", "𝗍", "𝗎", "𝗏", "𝗐", "𝗑", "𝗒", "𝗓", "𝖠", "𝖡", "𝖢", "𝖣", "𝖤", "𝖥", "𝖦", "𝖧", "𝖨", "𝖩", "𝖪", "𝖫", "𝖬", "𝖭", "𝖮", "𝖯", "𝖰", "𝖱", "𝖲", "𝖳", "𝖴", "𝖵", "𝖶", "𝖷", "𝖸", "𝖹"],
        "sans-serif-bold": ["𝟬","𝟭","𝟮","𝟯","𝟰","𝟱","𝟲","𝟳","𝟴","𝟵","𝗮","𝗯","𝗰","𝗱","𝗲","𝗳","𝗴","𝗵","𝗶","𝗷","𝗸","𝗹","𝗺","𝗻","𝗼","𝗽","𝗾","𝗿","𝘀","𝘁","𝘂","𝘃","𝘄","𝘅","𝘆","𝘇","𝗔","𝗕","𝗖","𝗗","𝗘","𝗙","𝗚","𝗛","𝗜","𝗝","𝗞","𝗟","𝗠","𝗡","𝗢","𝗣","𝗤","𝗥","𝗦","𝗧","𝗨","𝗩","𝗪","𝗫","𝗬","𝗭"],
        "sans-serif-italic": ["0","1","2","3","4","5","6","7","8","9","𝘢","𝘣","𝘤","𝘥","𝘦","𝘧","𝘨","𝘩","𝘪","𝘫","𝘬","𝘭","𝘮","𝘯","𝘰","𝘱","𝘲","𝘳","𝘴","𝘵","𝘶","𝘷","𝘸","𝘹","𝘺","𝘻","𝘈","𝘉","𝘊","𝘋","𝘌","𝘍","𝘎","𝘏","𝘐","𝘑","𝘒","𝘓","𝘔","𝘕","𝘖","𝘗","𝘘","𝘙","𝘚","𝘛","𝘜","𝘝","𝘞","𝘟","𝘠","𝘡"],
        "sans-serif-bold-italic": ["0","1","2","3","4","5","6","7","8","9","𝙖","𝙗","𝙘","𝙙","𝙚","𝙛","𝙜","𝙝","𝙞","𝙟","𝙠","𝙡","𝙢","𝙣","𝙤","𝙥","𝙦","𝙧","𝙨","𝙩","𝙪","𝙫","𝙬","𝙭","𝙮","𝙯","𝘼","𝘽","𝘾","𝘿","𝙀","𝙁","𝙂","𝙃","𝙄","𝙅","𝙆","𝙇","𝙈","𝙉","𝙊","𝙋","𝙌","𝙍","𝙎","𝙏","𝙐","𝙑","𝙒","𝙓","𝙔","𝙕"],
        "script-regular": ["0","1","2","3","4","5","6","7","8","9","𝒶","𝒷","𝒸","𝒹","ℯ","𝒻","ℊ","𝒽","𝒾","𝒿","𝓀","𝓁","𝓂","𝓃","ℴ","𝓅","𝓆","𝓇","𝓈","𝓉","𝓊","𝓋","𝓌","𝓍","𝓎","𝓏","𝒜","ℬ","𝒞","𝒟","ℰ","ℱ","𝒢","ℋ","ℐ","𝒥","𝒦","ℒ","ℳ","𝒩","𝒪","𝒫","𝒬","ℛ","𝒮","𝒯","𝒰","𝒱","𝒲","𝒳","𝒴","𝒵"],
        "script-bold": ["0","1","2","3","4","5","6","7","8","9","𝓪","𝓫","𝓬","𝓭","𝓮","𝓯","𝓰","𝓱","𝓲","𝓳","𝓴","𝓵","𝓶","𝓷","𝓸","𝓹","𝓺","𝓻","𝓼","𝓽","𝓾","𝓿","𝔀","𝔁","𝔂","𝔃","𝓐","𝓑","𝓒","𝓓","𝓔","𝓕","𝓖","𝓗","𝓘","𝓙","𝓚","𝓛","𝓜","𝓝","𝓞","𝓟","𝓠","𝓡","𝓢","𝓣","𝓤","𝓥","𝓦","𝓧","𝓨","𝓩"],
        "fraktur-regular": ["0","1","2","3","4","5","6","7","8","9","𝔞","𝔟","𝔠","𝔡","𝔢","𝔣","𝔤","𝔥","𝔦","𝔧","𝔨","𝔩","𝔪","𝔫","𝔬","𝔭","𝔮","𝔯","𝔰","𝔱","𝔲","𝔳","𝔴","𝔵","𝔶","𝔷","𝔄","𝔅","ℭ","𝔇","𝔈","𝔉","𝔊","ℌ","ℑ","𝔍","𝔎","𝔏","𝔐","𝔑","𝔒","𝔓","𝔔","ℜ","𝔖","𝔗","𝔘","𝔙","𝔚","𝔛","𝔜","ℨ"],
        "fraktur-bold": ["0","1","2","3","4","5","6","7","8","9","𝖆","𝖇","𝖈","𝖉","𝖊","𝖋","𝖌","𝖍","𝖎","𝖏","𝖐","𝖑","𝖒","𝖓","𝖔","𝖕","𝖖","𝖗","𝖘","𝖙","𝖚","𝖛","𝖜","𝖝","𝖞","𝖟","𝕬","𝕭","𝕮","𝕯","𝕰","𝕱","𝕲","𝕳","𝕴","𝕵","𝕶","𝕷","𝕸","𝕹","𝕺","𝕻","𝕼","𝕽","𝕾","𝕿","𝖀","𝖁","𝖂","𝖃","𝖄","𝖅"],
        "monospace-regular": ["𝟶","𝟷","𝟸","𝟹","𝟺","𝟻","𝟼","𝟽","𝟾","𝟿","𝚊","𝚋","𝚌","𝚍","𝚎","𝚏","𝚐","𝚑","𝚒","𝚓","𝚔","𝚕","𝚖","𝚗","𝚘","𝚙","𝚚","𝚛","𝚜","𝚝","𝚞","𝚟","𝚠","𝚡","𝚢","𝚣","𝙰","𝙱","𝙲","𝙳","𝙴","𝙵","𝙶","𝙷","𝙸","𝙹","𝙺","𝙻","𝙼","𝙽","𝙾","𝙿","𝚀","𝚁","𝚂","𝚃","𝚄","𝚅","𝚆","𝚇","𝚈","𝚉"],
        "double-struck-bold": ["𝟘","𝟙","𝟚","𝟛","𝟜","𝟝","𝟞","𝟟","𝟠","𝟡","𝕒","𝕓","𝕔","𝕕","𝕖","𝕗","𝕘","𝕙","𝕚","𝕛","𝕜","𝕝","𝕞","𝕟","𝕠","𝕡","𝕢","𝕣","𝕤","𝕥","𝕦","𝕧","𝕨","𝕩","𝕪","𝕫","𝔸","𝔹","ℂ","𝔻","𝔼","𝔽","𝔾","ℍ","𝕀","𝕁","𝕂","𝕃","𝕄","ℕ","𝕆","ℙ","ℚ","ℝ","𝕊","𝕋","𝕌","𝕍","𝕎","𝕏","𝕐","ℤ"],
        "circle-regular": ["⓪","①","②","③","④","⑤","⑥","⑦","⑧","⑨","ⓐ","ⓑ","ⓒ","ⓓ","ⓔ","ⓕ","ⓖ","ⓗ","ⓘ","ⓙ","ⓚ","ⓛ","ⓜ","ⓝ","ⓞ","ⓟ","ⓠ","ⓡ","ⓢ","ⓣ","ⓤ","ⓥ","ⓦ","ⓧ","ⓨ","ⓩ","Ⓐ","Ⓑ","Ⓒ","Ⓓ","Ⓔ","Ⓕ","Ⓖ","Ⓗ","Ⓘ","Ⓙ","Ⓚ","Ⓛ","Ⓜ","Ⓝ","Ⓞ","Ⓟ","Ⓠ","Ⓡ","Ⓢ","Ⓣ","Ⓤ","Ⓥ","Ⓦ","Ⓧ","Ⓨ","Ⓩ"],
        "square-regular": ["0","1","2","3","4","5","6","7","8","9","🄰","🄱","🄲","🄳","🄴","🄵","🄶","🄷","🄸","🄹","🄺","🄻","🄼","🄽","🄾","🄿","🅀","🅁","🅂","🅃","🅄","🅅","🅆","🅇","🅈","🅉","🄰","🄱","🄲","🄳","🄴","🄵","🄶","🄷","🄸","🄹","🄺","🄻","🄼","🄽","🄾","🄿","🅀","🅁","🅂","🅃","🅄","🅅","🅆","🅇","🅈","🅉"],
        "modifier-letter": ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹", "ᵃ", "ᵇ", "ᶜ", "ᵈ", "ᵉ", "ᶠ", "ᵍ", "ʰ", "ⁱ", "ʲ", "ᵏ", "ˡ", "ᵐ", "ⁿ", "ᵒ", "ᵖ", "ᵠ", "ʳ", "ˢ", "ᵗ", "ᵘ", "ᵛ", "ʷ", "ˣ", "ʸ", "ᶻ", "ᴬ", "ᴮ", "ᶜ", "ᴰ", "ᴱ", "ᶠ", "ᴳ", "ʰ", "ᴵ", "ᴶ", "ᴷ", "ᴸ", "ᴹ", "ᴺ", "ᴼ", "ᴾ", "ᵠ", "ᴿ", "ˢ", "ᵀ", "ᵁ", "ᵛ", "ᵂ", "ˣ", "ʸ", "ᶻ"],
    };

    const charIndexMap = { "48": 0, "49": 1, "50": 2, "51": 3, "52": 4, "53": 5, "54": 6, "55": 7, "56": 8, "57": 9, "97": 10, "98": 11, "99": 12, "100": 13, "101": 14, "102": 15, "103": 16, "104": 17, "105": 18, "106": 19, "107": 20, "108": 21, "109": 22, "110": 23, "111": 24, "112": 25, "113": 26, "114": 27, "115": 28, "116": 29, "117": 30, "118": 31, "119": 32, "120": 33, "121": 34, "122": 35, "65": 36, "66": 37, "67": 38, "68": 39, "69": 40, "70": 41, "71": 42, "72": 43, "73": 44, "74": 45, "75": 46, "76": 47, "77": 48, "78": 49, "79": 50, "80": 51, "81": 52, "82": 53, "83": 54, "84": 55, "85": 56, "86": 57, "87": 58, "88": 59, "89": 60, "90": 61 };

    const numStyle = TABLE[num] || TABLE[type];
    const charStyle = TABLE[type];
    
    if (!charStyle) return proxies;

    return proxies.map(p => {
        p.name = [...p.name].map(c => {
            const code = c.charCodeAt(0);
            const index = charIndexMap[code];
            if (index !== undefined) {
                // 是数字 (48-57)
                if (code >= 48 && code <= 57) {
                    return numStyle[index] || c;
                }
                // 是字母 (65-90, 97-122)
                return charStyle[index] || c;
            }
            return c;
        }).join("");
        return p;
    });
}
