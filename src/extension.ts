// import * as vscode from 'vscode';
// import { checkChromeCompatibility } from './compatibilityChecker';

// export function activate(context: vscode.ExtensionContext) {
//   let disposable = vscode.commands.registerCommand('extension.checkCompatibility', () => {
//     const editor = vscode.window.activeTextEditor;
//     if (editor) {
//       const document = editor.document;
//       if (document.languageId === 'javascript') {
//         const text = document.getText();
//         const diagnostics: vscode.Diagnostic[] = checkChromeCompatibility(text);
//         const diagnosticCollection = vscode.languages.createDiagnosticCollection('chrome-compatibility');
//         diagnosticCollection.set(document.uri, diagnostics);
//       }
//     }
//   });

//   context.subscriptions.push(disposable);
//  const diagnosticCollection = vscode.languages.createDiagnosticCollection('chrome-compatibility');

//   function updateDiagnostics(document: vscode.TextDocument) {
//     if (document.languageId === 'javascript') {
//       const text = document.getText();
//       const diagnostics: vscode.Diagnostic[] = checkChromeCompatibility(text);
//       diagnosticCollection.set(document.uri, diagnostics);
//     }
//   }

//   // 在文档打开时和内容改变时更新诊断
//   context.subscriptions.push(
//     vscode.workspace.onDidOpenTextDocument(updateDiagnostics),
//     vscode.workspace.onDidChangeTextDocument(e => updateDiagnostics(e.document)),
//     vscode.workspace.onDidCloseTextDocument(doc => diagnosticCollection.delete(doc.uri))
//   );

//   // 对当前已打开的文档执行一次检查
// }

// export function deactivate() {}

import * as vscode from 'vscode';
import { checkChromeCompatibility } from './compatibilityChecker';

let chromeVersion = 80; // 默认的 Chrome 版本

export function activate(context: vscode.ExtensionContext) {
  // 创建状态栏项
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = `Chrome Version: ${chromeVersion}`;
  statusBarItem.tooltip = 'Click to change Chrome version';
  statusBarItem.command = 'extension.changeChromeVersion';
  statusBarItem.show();


//    vscode.commands.registerCommand('extension.checkCompatibility', () => {
//     const editor = vscode.window.activeTextEditor;
//     if (editor) {
//       const document = editor.document;
//       if (document.languageId === 'javascript') {
//         const text = document.getText();
//         const diagnostics: vscode.Diagnostic[] = checkChromeCompatibility(text);
//         const diagnosticCollection = vscode.languages.createDiagnosticCollection('chrome-compatibility');
//         diagnosticCollection.set(document.uri, diagnostics);
//       }
//     }

//   vscode.commands.registerCommand('extension.changeChromeVersion', async (data) => {
// 	const editor = vscode.window.activeTextEditor;
//     if (editor) {
//       const document = editor.document;
//       if (document.languageId === 'javascript') {
//         const text = document.getText();
//         const diagnostics: vscode.Diagnostic[] = checkChromeCompatibility(text);
//         const diagnosticCollection = vscode.languages.createDiagnosticCollection('chrome-compatibility');
//         diagnosticCollection.set(document.uri, diagnostics);
//       }
//     }
// 	// console.log('data========', data);
// 	// chromeVersion = data;
//     // 命令的实现逻辑
//   });

  // 将状态栏项加入到扩展的订阅中
  context.subscriptions.push(statusBarItem);

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
      }
    })
  );
}

export function deactivate() {}

