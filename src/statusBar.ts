import * as vscode from "vscode";
import { chromeVersion, setChromeVersion } from './versionControl';
import { BarText, BarTooltip, BarCommand } from "./config";

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
  statusBarItem = {} as vscode.StatusBarItem;
  constructor(pr: PropsType) {
    this.props = pr;
    this.initStatusBar();
  }
  /** 加载状态栏 */
  initStatusBar = () => {
    // 创建状态栏项
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.text = `${BarText}${chromeVersion}`;
    this.statusBarItem.tooltip = BarTooltip;
    this.statusBarItem.command = BarCommand;
    // 显示状态栏项
    this.statusBarItem.show();
    this.props.context.subscriptions.push(this.statusBarItem);
    this.initChromeVersion();
  };
  /**  注册ChromeVerison 版本 */
  initChromeVersion = () => {
    const chromeVersionCommand = vscode.commands.registerCommand(
      BarCommand,
      async () => {
        const input = await vscode.window.showInputBox({
          prompt: "Enter the target Chrome version",
          value: chromeVersion.toString(),
          validateInput: (value) =>
            isNaN(Number(value)) ? "Please enter a valid number" : null,
        });

        if (input) {
          setChromeVersion(parseInt(input, 10));
          this.statusBarItem.text = `Chrome Version: ${chromeVersion}`;
          vscode.window.showInformationMessage(
            `Chrome version set to ${chromeVersion}`
          );
          this.setUpdateDiagnostics();
        }
      }
    );
    this.props.context.subscriptions.push(chromeVersionCommand);
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
