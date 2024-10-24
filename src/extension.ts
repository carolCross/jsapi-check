import * as vscode from "vscode";
import StatusBar from "./statusBar";
import DiagnosticInstance from "./diagnosticInstance";
import { registerCommand } from "./commandRegister";
/** 激活启动 */
export function activate(context: vscode.ExtensionContext) {
  /** 报错初始化事例 */
  const diagnosticInstanceInstance = new DiagnosticInstance({
    context
  });

  /** 初始化statusBar */
  const statusBarInstance = new StatusBar({
    context,
    updateDiagnostics: diagnosticInstanceInstance.updateDiagnostics,
  });

  /** 注册通用命令 */
  registerCommand(context, diagnosticInstanceInstance.updateDiagnostics);

  // 初始化执行一次检测
  statusBarInstance.setUpdateDiagnostics();
}

export function deactivate() {}
