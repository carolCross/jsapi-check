import * as vscode from "vscode";
import { chromeVersion, setChromeVersion } from './versionControl';
import { InputStatusBarText, InputStatusTooltip, InputStatusCommand, ModeStatusBarText, ModeStatusCommand, ModeStatusTooltip, ModeChromeVersionMap } from "./utils/constant";

/** props */
type PropsType = {
  /** context 事例 */
  context: vscode.ExtensionContext;
  /** 回调 */
  updateDiagnostics: (document: vscode.TextDocument) => void;
};
/* 底部状态栏 */
export default class StatusBar {
  props = {} as PropsType;
  // 状态栏 输入修改版本
  inputStatusBar = {} as vscode.StatusBarItem;
  // 模式版本 选择模式
  modeStatusBar = {} as vscode.StatusBarItem;
  // 当前模式
  currentMode = 'alipayhk' as keyof typeof ModeChromeVersionMap;

  constructor(pr: PropsType) {
    this.props = pr;
    this.initStatusBar();
  }
  /** 加载状态栏 */
  initStatusBar = () => {
    // 创建状态栏项
    this.inputStatusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
   
    this.inputStatusBar.text = `${InputStatusBarText}${chromeVersion}`;
    this.inputStatusBar.tooltip = InputStatusTooltip;
    this.inputStatusBar.command = InputStatusCommand;
    // 显示状态栏项
    this.inputStatusBar.show();
    this.props.context.subscriptions.push(this.inputStatusBar);
    this.initChromeVersion();
    // 模式版本 选择模式
    this.modeStatusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.modeStatusBar.text = `${ModeStatusBarText}${this.currentMode}`;
    this.modeStatusBar.tooltip = ModeStatusTooltip;
    this.modeStatusBar.command = ModeStatusCommand;
    // 显示状态栏项
    this.modeStatusBar.show();
    this.props.context.subscriptions.push(this.modeStatusBar);
    this.initModeVersion();
  };
  /**  注册ChromeVerison 版本 */
  initChromeVersion = () => {
    const chromeVersionCommand = vscode.commands.registerCommand(
      InputStatusCommand,
      async () => {
        const input = await vscode.window.showInputBox({
          prompt: "请输入chrome版本号",
          value: chromeVersion.toString(),
          validateInput: (value) =>
            isNaN(Number(value)) ? "请输入正确的值" : null,
        });

        if (input) {
          setChromeVersion(parseInt(input, 10));
          this.inputStatusBar.text = `当前版本: ${chromeVersion}`;
          vscode.window.showInformationMessage(
            `chrome 设置为 ${chromeVersion}`
          );
          this.setUpdateDiagnostics();
        }
      }
    );
    this.props.context.subscriptions.push(chromeVersionCommand);
  };
  /**  注册ModeVerison 版本 */
  initModeVersion = () => {
    const chromeModeCommand = vscode.commands.registerCommand(
      ModeStatusCommand,
      async () => {
        const selectedMode = await vscode.window.showQuickPick(Object.keys(ModeChromeVersionMap), {
          placeHolder: '请选择一个开发模式'
        });
        if (selectedMode) {
          this.currentMode = selectedMode as keyof typeof ModeChromeVersionMap;
          setChromeVersion(ModeChromeVersionMap[this.currentMode]);
          this.modeStatusBar.text = `${ModeStatusBarText}${this.currentMode}`;
          this.inputStatusBar.text = `Chrome Version: ${ModeChromeVersionMap[this.currentMode]}`;
          vscode.window.showInformationMessage(`已切换到 ${selectedMode} 模式`);
          this.setUpdateDiagnostics();
        }
      }
    );
    this.props.context.subscriptions.push(chromeModeCommand);
  };

  /** 更新所有打开文档的诊断 */
  setUpdateDiagnostics = () => {
    vscode.workspace.textDocuments.forEach(this.updateDiagnostics);
  };
  /** 更新检测 */
  updateDiagnostics = (document: vscode.TextDocument) => {
    this.props?.updateDiagnostics(document);
  };
}
