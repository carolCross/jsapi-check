/** 常量列表 */

/** 默认版本 */
export const DefaultVerison = 69; 
/** 目前支持检测语言 */
export const supportLanguageList = [
    'javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'vue'
];
/** 默认报错提示指令 */
export const DiagnosticCommand = "chrome-compatibility";
/** 内建对象根类型 */
export const BuiltinRootAPIs = [
    'Array', 'Object', 'Function', 'String', 'Number', 'Boolean', 'Promise', 'Map', 'Set',
    'Date', 'RegExp', 'Math', 'JSON', 'Error', 'Symbol', 'Intl', 'AggregateError', 'BigInt',
    'ArrayBuffer', 'SharedArrayBuffer', 'DataView', 'Atomics', 'Proxy', 'Reflect',
    'WeakMap', 'WeakSet', 'WeakRef', 'FinalizationRegistry',
    'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array',
    'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array'
];
/** 常用 Web API 根类型 */
export const WebRootAPIs = [
    'fetch', 'console', 'URL', 'URLSearchParams', 'AbortController', 'AbortSignal', 'Headers', 'Request', 'Response',
    'FormData', 'File', 'FileReader', 'Blob', 'WebSocket', 'XMLHttpRequest', 'Navigator', 'Worker', 'Crypto',
    'TextEncoder', 'TextDecoder', 'Performance'
];
/** Web API 别名（运行时全局名 -> BCD 根节点名） */
export const WebRootAliases: Record<string, string> = {
    navigator: 'Navigator',
    performance: 'Performance',
    crypto: 'Crypto'
};
/** 全局对象前缀（用于 window/globalThis/self.xxx 处理） */
export const GlobalObjectNames = ['window', 'globalThis', 'self'];
/** 当前支持检测类型 */
export const SupportedRootAPIs = [
    ...BuiltinRootAPIs,
    ...WebRootAPIs,
    ...Object.keys(WebRootAliases)
];
    /** 底部状态栏标题 */
export const InputStatusBarText = 'Chrome 版本: ';
/** 底部状态栏tooltip */
export const InputStatusTooltip = '更换chrome版本';
/** 底部状态栏command */
export const InputStatusCommand = 'jsapi_check.changeChromeVersion';

/** 底部状态栏标题 */
export const ModeStatusBarText = '当前模式: ';
/** 底部状态栏tooltip */
export const ModeStatusTooltip = '请选择开发者模式';
/** 底部状态栏command */
export const ModeStatusCommand = 'jsapi_check.changeMode';

/** 版本控制 */
export const ModeChromeVersionMap = {
    alipayhk: DefaultVerison,
    wechat: 107
}
