/** 默认版本 */
export const DefaultVerison = 90; 
/** 目前支持检测语言 */
export const supportLanguageList = [
    'javascript', 'typescript', 'typescriptreact', 'vue'
];
/** 默认报错提示指令 */
export const DiagnosticCommand = "chrome-compatibility";
/** 底部状态栏标题 */
export const BarText = 'Chrome Version: ';
/** 底部状态栏tooltip */
export const BarTooltip = 'Click to change Chrome version';
/** 底部状态栏command */
export const BarCommand = 'jsapi_check.changeChromeVersion';

export const CommonAPIs = [ 'Array', 'Object', 'Function', 'String', 'Number', 'Boolean', 'Promise', 'Map', 'Set',
    'Date', 'RegExp', 'Math', 'JSON', 'fetch', 'console', 'Error', 'Symbol', 'Intl']