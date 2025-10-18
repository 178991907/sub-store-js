// --- 极简测试脚本 ---
function operator(proxies, $arguments) {
    proxies.forEach(p => {
        p.name = "[TEST] " + p.name;
    });
    return proxies;
}
