/*
 * V-Pro v1.1
 *
 * 机场订阅链接转换，节点（批量）重命名，筛选，排序，去除重复节点
 *
 * (c) 2022-2023 V-Pro, https://github.com/V-Pro/sub-store-scripts
 *
 * This script is released under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


// ============================== V-Pro v1.1 ==============================
//
// V-Pro v1.1
//
// ========================================================================

const version = "V-Pro v1.1";

function operator(proxies, $arguments) {

    const flag = $arguments.flag === "true"; //是否开启添加国旗emoji，默认不开启
    const name = $arguments.name; //重命名后的机场名
    const regular = $arguments.regular; //重命名时正则匹配
    const replacement = $arguments.replacement; //重命名时正则替换
    const prefix = $arguments.prefix; //重命名时添加前缀
    const suffix = $arguments.suffix; //重命名时添加后缀
    const replace = $arguments.replace === "true"; //是否开启替换，默认不开启
    const sn = $arguments.sn; //序号分隔符，默认"-"
    const fgf = $arguments.fgf; //机场名与序号分隔符，默认"-"
    const nm = $arguments.nm === "true"; //是否开启保留未匹配地区节点，默认不开启
    const index = $arguments.index === "true"; //是否开启添加序号，默认不开启
    const sort = $arguments.sort === "true"; //是否开启排序，默认不开启
    const dedup = $arguments.dedup === "true"; //是否开启去除重复节点，默认不开启

    const regions = {
        "ARE": ["阿联酋", "AE", "United Arab Emirates"],
        "AFG": ["阿富汗", "AF", "Afghanistan"],
        "ALB": ["阿尔巴尼亚", "AL", "Albania"],
        "ARM": ["亚美尼亚", "AM", "Armenia"],
        "AGO": ["安哥拉", "AO", "Angola"],
        "ARG": ["阿根廷", "AR", "Argentina"],
        "AUT": ["奥地利", "AT", "Austria"],
        "AUS": ["澳大利亚", "AU", "Australia", "Sydney", "AU", "维多利亚", "墨尔本", "悉尼", "土澳"],
        "ABW": ["阿鲁巴", "AW", "Aruba"],
        "AZE": ["阿塞拜疆", "AZ", "Azerbaijan"],
        "BIH": ["波黑", "BA", "Bosnia and Herzegovina"],
        "BGD": ["孟加拉", "BD", "Bangladesh"],
        "BEL": ["比利时", "BE", "Belgium"],
        "BGR": ["保加利亚", "BG", "Bulgaria"],
        "BHR": ["巴林", "BH", "Bahrain"],
        "BMU": ["百慕大", "BM", "Bermuda"],
        "BRA": ["巴西", "BR", "Brazil", "圣保罗"],
        "BLR": ["白俄罗斯", "BY", "Belarus"],
        "CAN": ["加拿大", "CA", "Canada", "CAN", "Waterloo", "CA", "蒙特利尔", "多伦多", "温哥华", "滑铁卢"],
        "CHE": ["瑞士", "CH", "Switzerland", "苏黎世"],
        "CHL": ["智利", "CL", "Chile"],
        "COL": ["哥伦比亚", "CO", "Colombia"],
        "CRI": ["哥斯达黎加", "CR", "Costa Rica"],
        "CYP": ["塞浦路斯", "CY", "Cyprus"],
        "CZE": ["捷克", "CZ", "Czechia", "Czech Republic"],
        "DEU": ["德国", "DE", "Germany", "DE", "法兰克福", "德"],
        "DNK": ["丹麦", "DK", "Denmark"],
        "EST": ["爱沙尼亚", "EE", "Estonia"],
        "EGY": ["埃及", "EG", "Egypt"],
        "ESP": ["西班牙", "ES", "Spain"],
        "FIN": ["芬兰", "FI", "Finland", "赫尔辛基"],
        "FJI": ["斐济", "FJ", "Fiji"],
        "FRA": ["法国", "FR", "France", "巴黎"],
        "GBR": ["英国", "GB", "United Kingdom", "UK", "London", "GB", "英", "伦敦"],
        "GEO": ["格鲁吉亚", "GE", "Georgia"],
        "GHA": ["加纳", "GH", "Ghana"],
        "GRC": ["希腊", "GR", "Greece"],
        "HKG": ["香港", "HK", "Hong Kong", "HKG", "HONG KONG", "HongKong", "深港", "沪港", "京港", "港"],
        "HND": ["洪都拉斯", "HN", "Honduras"],
        "HRV": ["克罗地亚", "HR", "Croatia"],
        "HUN": ["匈牙利", "HU", "Hungary"],
        "IDN": ["印尼", "ID", "Indonesia", "雅加达"],
        "IRL": ["爱尔兰", "IE", "Ireland"],
        "ISR": ["以色列", "IL", "Israel"],
        "IND": ["印度", "IN", "India", "孟买"],
        "IRQ": ["伊拉克", "IQ", "Iraq"],
        "IRN": ["伊朗", "IR", "Iran"],
        "ISL": ["冰岛", "IS", "Iceland"],
        "ITA": ["意大利", "IT", "Italy", "米兰"],
        "JPN": ["日本", "JP", "Japan", "JP", "Tokyo", "Osaka", "Saitama", "JP", "日本", "东京", "大阪", "埼玉", "沪日", "深日", "广日", "日"],
        "KOR": ["韩国", "KR", "South Korea", "Korea", "Seoul", "KR", "韩", "首尔"],
        "KHM": ["柬埔寨", "KH", "Cambodia"],
        "KAZ": ["哈萨克斯坦", "KZ", "Kazakhstan"],
        "LAO": ["老挝", "LA", "Laos"],
        "LKA": ["斯里兰卡", "LK", "Sri Lanka"],
        "LTU": ["立陶宛", "LT", "Lithuania"],
        "LUX": ["卢森堡", "LU", "Luxembourg"],
        "LVA": ["拉脱维亚", "LV", "Latvia"],
        "MAC": ["澳门", "MO", "Macau", "Macao"],
        "MYS": ["马来西亚", "MY", "Malaysia", "吉隆坡"],
        "MDA": ["摩尔多瓦", "MD", "Moldova"],
        "MEX": ["墨西哥", "MX", "Mexico"],
        "MKD": ["马其顿", "MK", "Macedonia"],
        "MNG": ["蒙古", "MN", "Mongolia"],
        "NLD": ["荷兰", "NL", "Netherlands", "阿姆斯特丹"],
        "NOR": ["挪威", "NO", "Norway"],
        "NZL": ["新西兰", "NZ", "New Zealand"],
        "PHL": ["菲律宾", "PH", "Philippines", "菲律宾"],
        "PAK": ["巴基斯坦", "PK", "Pakistan"],
        "POL": ["波兰", "PL", "Poland"],
        "ROU": ["罗马尼亚", "RO", "Romania"],
        "RUS": ["俄罗斯", "RU", "Russia", "RU", "Moscow", "St. Petersburg", "新西伯利亚", "伯力", "莫斯科", "圣彼得堡", "罗斯", "俄"],
        "SAU": ["沙特", "SA", "Saudi Arabia"],
        "SWE": ["瑞典", "SE", "Sweden"],
        "SGP": ["新加坡", "SG", "Singapore", "SG", "狮城", "新"],
        "SVN": ["斯洛文尼亚", "SI", "Slovenia"],
        "SVK": ["斯洛伐克", "SK", "Slovakia"],
        "THA": ["泰国", "TH", "Thailand", "曼谷"],
        "TUR": ["土耳其", "TR", "Turkey", "伊斯坦布尔"],
        "TWN": ["台湾", "TW", "Taiwan", "TW", "Taipei", "Taiwan", "TW", "台湾", "台北", "台中", "新北", "彰化", "台"],
        "UKR": ["乌克兰", "UA", "Ukraine"],
        "USA": ["美国", "US", "United States", "USA", "America", "United States", "US", "美国", "美", "亚特兰大", "水牛城", "芝加哥", "达拉斯", "丹佛", "洛杉矶", "迈阿密", "纽约", "凤凰城", "圣何塞", "西雅图", "圣克拉拉", "硅谷", "华盛顿"],
        "UZB": ["乌兹别克斯坦", "UZ", "Uzbekistan"],
        "VNM": ["越南", "VN", "Vietnam"],
        "ZAF": ["南非", "ZA", "South Africa", "约翰内斯堡"],
        "SRB": ["塞尔维亚", "RS", "Serbia"],
        "PER": ["秘鲁", "PE", "Peru"],
        "MCO": ["摩纳哥", "MC", "Monaco"],
        "IMN": ["马恩岛", "IM", "Isle of Man"],
        "GGY": ["根西岛", "GG", "Guernsey"],
        "JEY": ["泽西岛", "JE", "Jersey"],
        "PRT": ["葡萄牙", "PT", "Portugal"],
        "PAN": ["巴拿马", "PA", "Panama"],
        "NPL": ["尼泊尔", "NP", "Nepal"],
        "LIE": ["列支敦士登", "LI", "Liechtenstein"],
        "LBN": ["黎巴嫩", "LB", "Lebanon"],
        "ISL": ["冰岛", "IS", "Iceland"],
        "GTM": ["危地马拉", "GT", "Guatemala"],
        "BGR": ["保加利亚", "BG", "Bulgaria"],
        "BOL": ["玻利维亚", "BO", "Bolivia"],
        "BHR": ["巴林", "BH", "Bahrain"],
        "AND": ["安道尔", "AD", "Andorra"],
        "CHN": ["中国", "CN", "China", "回国", "中国", "江苏", "北京", "上海", "广州", "深圳", "杭州", "常州", "徐州", "青岛", "枣庄", "宁波", "镇江", "back", "Back", "CN"],
    };

    const flag_list = {
        "ARE": "🇦🇪", "AFG": "🇦🇫", "ALB": "🇦🇱", "ARM": "🇦🇲", "AGO": "🇦🇴", "ARG": "🇦🇷", "AUT": "🇦🇹", "AUS": "🇦🇺", "ABW": "🇦🇼", "AZE": "🇦🇿",
        "BIH": "🇧🇦", "BGD": "🇧🇩", "BEL": "🇧🇪", "BGR": "🇧🇬", "BHR": "🇧🇭", "BMU": "🇧🇲", "BRA": "🇧🇷", "BLR": "🇧🇾",
        "CAN": "🇨🇦", "CHE": "🇨🇭", "CHL": "🇨🇱", "COL": "🇨🇴", "CRI": "🇨🇷", "CYP": "🇨🇾", "CZE": "🇨🇿",
        "DEU": "🇩🇪", "DNK": "🇩🇰",
        "EST": "🇪🇪", "EGY": "🇪🇬", "ESP": "🇪🇸",
        "FIN": "🇫🇮", "FJI": "🇫🇯", "FRA": "🇫🇷",
        "GBR": "🇬🇧", "GEO": "🇬🇪", "GHA": "🇬🇭", "GRC": "🇬🇷",
        "HKG": "🇭🇰", "HND": "🇭🇳", "HRV": "🇭🇷", "HUN": "🇭🇺",
        "IDN": "🇮🇩", "IRL": "🇮🇪", "ISR": "🇮🇱", "IND": "🇮🇳", "IRQ": "🇮🇶", "IRN": "🇮🇷", "ISL": "🇮🇸", "ITA": "🇮🇹",
        "JPN": "🇯🇵",
        "KOR": "🇰🇷", "KHM": "🇰🇭", "KAZ": "🇰🇿",
        "LAO": "🇱🇦", "LKA": "🇱🇰", "LTU": "🇱🇹", "LUX": "🇱🇺", "LVA": "🇱🇻",
        "MAC": "🇲🇴", "MYS": "🇲🇾", "MDA": "🇲🇩", "MEX": "🇲🇽", "MKD": "🇲🇰", "MNG": "🇲🇳",
        "NLD": "🇳🇱", "NOR": "🇳🇴", "NZL": "🇳🇿",
        "PHL": "🇵🇭", "PAK": "🇵🇰", "POL": "🇵🇱",
        "ROU": "🇷🇴", "RUS": "🇷🇺",
        "SAU": "🇸🇦", "SWE": "🇸🇪", "SGP": "🇸🇬", "SVN": "🇸🇮", "SVK": "🇸🇰",
        "THA": "🇹🇭", "TUR": "🇹🇷", "TWN": "🇹🇼",
        "UKR": "🇺🇦", "USA": "🇺🇸", "UZB": "🇺🇿",
        "VNM": "🇻🇳",
        "ZAF": "🇿🇦",
        "SRB": "🇷🇸",
        "PER": "🇵🇪",
        "MCO": "🇲🇨",
        "IMN": "🇮🇲",
        "GGY": "🇬🇬",
        "JEY": "🇯🇪",
        "PRT": "🇵🇹",
        "PAN": "🇵🇦",
        "NPL": "🇳🇵",
        "LIE": "🇱🇮",
        "LBN": "🇱🇧",
        "GTM": "🇬🇹",
        "BOL": "🇧🇴",
        "AND": "🇦🇩",
        "CHN": "🇨🇳",
    };

    const region_names = {};
    for (const code in regions) {
        const names = regions[code];
        for (const name of names) {
            region_names[name.toUpperCase()] = code;
        }
    }

    const proxies_new = [];
    const region_counts = {};
    const region_sort = [];

    for (const p of proxies) {
        let name = p.name;
        if (replace) {
            name = name.replace(new RegExp(regular, "g"), replacement);
        }
        if (prefix) {
            name = prefix + name;
        }
        if (suffix) {
            name = name + suffix;
        }

        let region_code = null;
        for (const region_name in region_names) {
            if (name.toUpperCase().includes(region_name)) {
                region_code = region_names[region_name];
                break;
            }
        }

        if (region_code) {
            if (region_counts[region_code]) {
                region_counts[region_code]++;
            } else {
                region_counts[region_code] = 1;
                region_sort.push(region_code);
            }
            p.name = region_code + " " + region_counts[region_code];
            proxies_new.push(p);
        } else if (nm) {
            proxies_new.push(p);
        }
    }

    const region_map = {};
    for (const p of proxies_new) {
        const match = p.name.match(/^([A-Z]{3})\s(\d+)$/);
        if (match) {
            const region_code = match[1];
            const count = region_counts[region_code];
            if (count > 0) {
                if (!region_map[region_code]) {
                    region_map[region_code] = [];
                }
                region_map[region_code].push(p);
            }
        }
    }

    const sn_separator = sn ? sn : "-";
    const fgf_separator = fgf ? fgf : "-";

    const final_proxies = [];
    for (const region_code of region_sort) {
        const region_proxies = region_map[region_code];
        if (region_proxies) {
            for (let i = 0; i < region_proxies.length; i++) {
                const p = region_proxies[i];
                let new_name = "";
                if (flag) {
                    new_name += flag_list[region_code] + fgf_separator;
                }
                if (name) {
                    new_name += name + fgf_separator;
                }
                new_name += regions[region_code][0];
                if (index) {
                    new_name += sn_separator + (i + 1).toString().padStart(2, "0");
                }
                p.name = new_name;
                final_proxies.push(p);
            }
        }
    }

    if (nm) {
        for (const p of proxies) {
            let found = false;
            for (const fp of final_proxies) {
                if (p.name === fp.name) {
                    found = true;
                    break;
                }
            }
            let is_renamed = false;
            for (const region_code of region_sort) {
                if (region_map[region_code] && region_map[region_code].some(rp => rp.name.includes(regions[region_code][0]))) {
                    is_renamed = true;
                    break;
                }
            }
            const match = p.name.match(/^([A-Z]{3})\s(\d+)$/);
            if (!match && !final_proxies.find(fp => fp.name === p.name)) {
                let is_processed = false;
                for (const region_code of region_sort) {
                    const region_proxies = region_map[region_code];
                    if (region_proxies) {
                        for (const rp of region_proxies) {
                            if (rp.name.includes(p.name)) {
                                is_processed = true;
                                break;
                            }
                        }
                    }
                    if (is_processed) {
                        break;
                    }
                }
                if (!is_processed) {
                    let original_name_exists = false;
                    for (const keyword in region_names) {
                        if (p.name.toUpperCase().includes(keyword)) {
                            original_name_exists = true;
                            break;
                        }
                    }
                    if (!original_name_exists) {
                        final_proxies.push(p);
                    }
                }
            }
        }
        const unprocessed_proxies = proxies.filter(p => !final_proxies.find(fp => fp.server === p.server && fp.port === p.port));
        final_proxies.push(...unprocessed_proxies);
    }

    if (sort) {
        final_proxies.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
    }

    if (dedup) {
        const unique_proxies = [];
        const map = new Map();
        for (const p of final_proxies) {
            if (!map.has(p.name)) {
                map.set(p.name, true);
                unique_proxies.push(p);
            }
        }
        return unique_proxies;
    }

    return final_proxies;
}
