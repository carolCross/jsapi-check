/** 常量列表 */

/** 默认版本 */
export const DefaultVerison = 76; 
/** 目前支持检测语言 */
export const supportLanguageList = [
    'javascript', 'typescript', 'typescriptreact', 'vue'
];
/** 默认报错提示指令 */
export const DiagnosticCommand = "chrome-compatibility";
/** 当前支持检测类型 */
export const CommonAPIs = [ 'Array', 'Object', 'Function', 'String', 'Number', 'Boolean', 'Promise', 'Map', 'Set',
    'Date', 'RegExp', 'Math', 'JSON', 'fetch', 'console', 'Error', 'Symbol', 'Intl']
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