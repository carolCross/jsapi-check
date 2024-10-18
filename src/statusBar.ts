import * as vscode from 'vscode';


/** props */
type PropsType = {
    /** 版本 */
    chromeVersion?: number
}

/* 底部状态栏 */
export default class StatusBar {
    props = {} as PropsType;
    constructor(pr: PropsType) {
        this.props = pr;
        this.initStatusBar();
    }


/** 加载状态栏 */
initStatusBar = () => {
// 创建状态栏项
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = `Chrome Version: ${this.props.chromeVersion}`;
    statusBarItem.tooltip = 'Click to change Chrome version';
    statusBarItem.command = 'jsapi_check.changeChromeVersion';
    // 显示状态栏项
    statusBarItem.show();
}
}