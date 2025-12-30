import * as vscode from "vscode";
import { browserVersion, setBrowserTarget, setBrowserVersion } from '../core/versionControl';
import {
  BrowserLabelMap,
  BrowserStatusBarText,
  BrowserStatusCommand,
  BrowserStatusTooltip,
  BrowserTargets,
  DefaultBrowser,
  DefaultBrowserVersionMap,
  InputStatusBarText,
  InputStatusTooltip,
  InputStatusCommand,
  ModeStatusBarText,
  ModeStatusCommand,
  ModeStatusTooltip,
  ModeChromeVersionMap
} from "../utils/constant";
import type { BrowserTarget } from "../utils/constant";

/** props */
type PropsType = {
  /** context 事例 */
  context: vscode.ExtensionContext;
  /** 回调 */
  updateDiagnostics: (document: vscode.TextDocument, options?: { force?: boolean }) => void;
};
/* 底部状态栏 */
export default class StatusBar {
  props = {} as PropsType;
  // 状态栏 输入修改版本
  inputStatusBar = {} as vscode.StatusBarItem;
  // 浏览器选择
  browserStatusBar = {} as vscode.StatusBarItem;
  // 模式版本 选择模式
  modeStatusBar = {} as vscode.StatusBarItem;
  // 当前模式
  currentMode = 'alipayhk' as keyof typeof ModeChromeVersionMap;
  // 当前浏览器
  currentBrowser = DefaultBrowser as BrowserTarget;

  constructor(pr: PropsType) {
    this.props = pr;
    this.initStatusBar();
  }

  private getVersionStorageKey = (browser: BrowserTarget) => `jsapi-check.browserVersion.${browser}`;

  private resolveBrowserVersion = (browser: BrowserTarget) => {
    if (browser === "chrome" && ModeChromeVersionMap[this.currentMode]) {
      return ModeChromeVersionMap[this.currentMode];
    }
    const storedVersion = this.props.context.globalState.get<number>(this.getVersionStorageKey(browser));
    if (typeof storedVersion === "number") {
      return storedVersion;
    }
    if (browser === "chrome") {
      const legacyVersion = this.props.context.globalState.get<number>("jsapi-check.chromeVersion");
      if (typeof legacyVersion === "number") {
        return legacyVersion;
      }
    }
    return DefaultBrowserVersionMap[browser];
  };

  private updateStatusBarText = () => {
    const browserLabel = BrowserLabelMap[this.currentBrowser];
    this.inputStatusBar.text = `${browserLabel} ${InputStatusBarText}${browserVersion}`;
    this.browserStatusBar.text = `${BrowserStatusBarText}${browserLabel}`;
  };

  /** 加载状态栏 */
  initStatusBar = () => {
    const storedBrowser = this.props.context.globalState.get<BrowserTarget>("jsapi-check.browserTarget");
    if (storedBrowser && BrowserTargets.includes(storedBrowser)) {
      this.currentBrowser = storedBrowser;
    }

    const storedMode = this.props.context.globalState.get<keyof typeof ModeChromeVersionMap>("jsapi-check.mode");
    if (storedMode && ModeChromeVersionMap[storedMode]) {
      this.currentMode = storedMode;
    }

    setBrowserTarget(this.currentBrowser);
    setBrowserVersion(this.resolveBrowserVersion(this.currentBrowser));

    // 创建状态栏项
    this.inputStatusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      101
    );

    this.inputStatusBar.tooltip = InputStatusTooltip;
    this.inputStatusBar.command = InputStatusCommand;
    // 显示状态栏项
    this.inputStatusBar.show();
    this.props.context.subscriptions.push(this.inputStatusBar);
    this.initBrowserVersion();

    // 浏览器选择
    this.browserStatusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      102
    );
    this.browserStatusBar.tooltip = BrowserStatusTooltip;
    this.browserStatusBar.command = BrowserStatusCommand;
    this.browserStatusBar.show();
    this.props.context.subscriptions.push(this.browserStatusBar);
    this.initBrowserSelection();

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

    this.updateStatusBarText();
  };

  /**  注册浏览器版本 */
  initBrowserVersion = () => {
    const browserVersionCommand = vscode.commands.registerCommand(
      InputStatusCommand,
      async () => {
        const browserLabel = BrowserLabelMap[this.currentBrowser];
        const input = await vscode.window.showInputBox({
          prompt: `请输入${browserLabel}版本号`,
          value: browserVersion.toString(),
          validateInput: (value) => {
            if (!value.trim()) {
              return "请输入正确的值";
            }
            return Number.isNaN(Number(value)) ? "请输入正确的值" : null;
          },
        });

        if (input) {
          const parsedVersion = Number.parseFloat(input);
          if (Number.isNaN(parsedVersion)) {
            return;
          }
          setBrowserVersion(parsedVersion);
          this.updateStatusBarText();
          await this.props.context.globalState.update(this.getVersionStorageKey(this.currentBrowser), browserVersion);
          await this.props.context.globalState.update("jsapi-check.browserTarget", this.currentBrowser);
          if (this.currentBrowser === "chrome") {
            await this.props.context.globalState.update("jsapi-check.chromeVersion", browserVersion);
          }
          vscode.window.showInformationMessage(
            `${browserLabel} 设置为 ${browserVersion}`
          );
          this.setUpdateDiagnostics();
        }
      }
    );
    this.props.context.subscriptions.push(browserVersionCommand);
  };

  /**  注册浏览器选择 */
  initBrowserSelection = () => {
    const browserSelectionCommand = vscode.commands.registerCommand(
      BrowserStatusCommand,
      async () => {
        const options = BrowserTargets.map((target) => ({
          label: BrowserLabelMap[target],
          description: target,
          target
        }));
        const selected = await vscode.window.showQuickPick(options, {
          placeHolder: '请选择目标浏览器'
        });
        if (selected) {
          this.currentBrowser = selected.target;
          setBrowserTarget(this.currentBrowser);
          setBrowserVersion(this.resolveBrowserVersion(this.currentBrowser));
          await this.props.context.globalState.update("jsapi-check.browserTarget", this.currentBrowser);
          await this.props.context.globalState.update(this.getVersionStorageKey(this.currentBrowser), browserVersion);
          if (this.currentBrowser === "chrome") {
            await this.props.context.globalState.update("jsapi-check.chromeVersion", browserVersion);
          }
          this.updateStatusBarText();
          this.setUpdateDiagnostics();
        }
      }
    );
    this.props.context.subscriptions.push(browserSelectionCommand);
  };

  /**  注册ModeVerison 版本 */
  initModeVersion = () => {
    const chromeModeCommand = vscode.commands.registerCommand(
      ModeStatusCommand,
      async () => {
        if (this.currentBrowser !== "chrome") {
          vscode.window.showInformationMessage("开发模式仅适用于 Chrome");
          return;
        }
        const selectedMode = await vscode.window.showQuickPick(Object.keys(ModeChromeVersionMap), {
          placeHolder: '请选择一个开发模式'
        });
        if (selectedMode) {
          this.currentMode = selectedMode as keyof typeof ModeChromeVersionMap;
          setBrowserVersion(ModeChromeVersionMap[this.currentMode]);
          this.modeStatusBar.text = `${ModeStatusBarText}${this.currentMode}`;
          this.updateStatusBarText();
          await this.props.context.globalState.update("jsapi-check.mode", this.currentMode);
          await this.props.context.globalState.update(this.getVersionStorageKey("chrome"), browserVersion);
          await this.props.context.globalState.update("jsapi-check.chromeVersion", browserVersion);
          vscode.window.showInformationMessage(`已切换到 ${selectedMode} 模式`);
          this.setUpdateDiagnostics();
        }
      }
    );
    this.props.context.subscriptions.push(chromeModeCommand);
  };

  /** 更新所有打开文档的诊断 - 性能优化版本 */
  setUpdateDiagnostics = () => {
    // 性能优化：只处理当前激活的文档，避免一次性处理所有文件
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      this.updateDiagnostics(activeEditor.document, { force: true });
    }

    // 可选：延迟处理其他文档，避免阻塞UI
    setTimeout(() => {
      const documents = vscode.window.visibleTextEditors.map((editor) => editor.document);
      // 限制同时处理的文件数量，避免卡顿
      const maxFiles = 3;
      const filesToProcess = documents.slice(0, maxFiles);

      filesToProcess.forEach((doc, index) => {
        // 错开处理时间，避免同时解析
        setTimeout(() => {
          this.updateDiagnostics(doc, { force: true });
        }, index * 100); // 每个文件间隔100ms
      });
    }, 500); // 延迟500ms开始处理
  };
  /** 更新检测 */
  updateDiagnostics = (document: vscode.TextDocument, options?: { force?: boolean }) => {
    this.props?.updateDiagnostics(document, options);
  };
}
