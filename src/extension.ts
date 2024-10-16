import * as vscode from 'vscode';

// 假设 checkChromeCompatibility 函数已定义在某个模块中
import { checkChromeCompatibility } from './compatibilityChecker';

let chromeVersion = 80; // 默认的 Chrome 版本

export function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('chrome-compatibility');

  // 创建状态栏项
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = `Chrome Version: ${chromeVersion}`;
  statusBarItem.tooltip = 'Click to change Chrome version';
  statusBarItem.command = 'extension.changeChromeVersion';
  statusBarItem.show();

  context.subscriptions.push(statusBarItem);

  function getFileType(fileName: string): string {
	if (fileName.endsWith('.js')) {return 'js';}
	if (fileName.endsWith('.ts')) {return 'ts';}
	if (fileName.endsWith('.vue')) {return 'vue';}
	if (fileName.endsWith('.tsx')) {return 'tsx';}
	return 'unknown';
  }
  
  function extractScriptFromVue(vueContent: string): string {
	const scriptMatch = vueContent.match(/<script.*?>([\s\S]*?)<\/script>/);
	return scriptMatch ? scriptMatch[1] : '';
  }

  function updateDiagnostics(document: vscode.TextDocument) {
	const fileName = document.fileName;
	const fileType = getFileType(fileName);

    // 清除上次的诊断信息
    // diagnosticCollection.clear();

	diagnosticCollection.set(document.uri, []);
  
	let code = '';
  
	if (fileType === 'vue') {
	  code = extractScriptFromVue(document.getText());
	} else {
	  code = document.getText();
	}
	const diagnostics = checkChromeCompatibility(code, chromeVersion, fileType);
	diagnosticCollection.set(document.uri, diagnostics);
  }

  // 在文档打开时和内容改变时更新诊断
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(updateDiagnostics),
    vscode.workspace.onDidChangeTextDocument(e => updateDiagnostics(e.document)),
    vscode.workspace.onDidCloseTextDocument(doc => diagnosticCollection.delete(doc.uri))
  );

  // 对当前已打开的文档执行一次检查
  vscode.workspace.textDocuments.forEach(updateDiagnostics);

  // 注册命令来更改 Chrome 版本
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.changeChromeVersion', async () => {
      const input = await vscode.window.showInputBox({
        prompt: 'Enter the target Chrome version',
        value: chromeVersion.toString(),
        validateInput: (value) => isNaN(Number(value)) ? 'Please enter a valid number' : null
      });

      if (input) {
        chromeVersion = parseInt(input, 10);
        statusBarItem.text = `Chrome Version: ${chromeVersion}`;
        vscode.window.showInformationMessage(`Chrome version set to ${chromeVersion}`);

        // 更新所有打开文档的诊断
        vscode.workspace.textDocuments.forEach(updateDiagnostics);
      }
    })
  );
}

export function deactivate() {}
