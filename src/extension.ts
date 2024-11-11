import * as vscode from "vscode";
import { statusBar, DiagnosticInstance, registerCommand } from '@/plugins';

/** 激活启动 */
export function activate(context: vscode.ExtensionContext) {
  /** 报错初始化事例 */
  const diagnosticInstanceInstance = new DiagnosticInstance({
    context
  });

  /** 初始化statusBar */
  const statusBarInstance = new statusBar({
    context,
    updateDiagnostics: diagnosticInstanceInstance.updateDiagnostics,
  });

  /** 注册通用命令 */
  registerCommand(context, diagnosticInstanceInstance.updateDiagnostics);

  // 初始化执行一次检测
  statusBarInstance.setUpdateDiagnostics();
}

export function deactivate() {}
