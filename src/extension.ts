import * as vscode from 'vscode';
import { checkChromeCompatibility } from './compatibilityChecker';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.checkCompatibility', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      if (document.languageId === 'javascript') {
        const text = document.getText();
        const diagnostics: vscode.Diagnostic[] = checkChromeCompatibility(text);
        const diagnosticCollection = vscode.languages.createDiagnosticCollection('chrome-compatibility');
        diagnosticCollection.set(document.uri, diagnostics);
      }
    }
  });

  context.subscriptions.push(disposable);
 const diagnosticCollection = vscode.languages.createDiagnosticCollection('chrome-compatibility');

  function updateDiagnostics(document: vscode.TextDocument) {
    if (document.languageId === 'javascript') {
      const text = document.getText();
      const diagnostics: vscode.Diagnostic[] = checkChromeCompatibility(text);
      diagnosticCollection.set(document.uri, diagnostics);
    }
  }

  // 在文档打开时和内容改变时更新诊断
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(updateDiagnostics),
    vscode.workspace.onDidChangeTextDocument(e => updateDiagnostics(e.document)),
    vscode.workspace.onDidCloseTextDocument(doc => diagnosticCollection.delete(doc.uri))
  );

  // 对当前已打开的文档执行一次检查
}

export function deactivate() {}
