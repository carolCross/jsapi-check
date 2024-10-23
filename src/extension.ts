import * as vscode from 'vscode';
import { DefaultVerison } from './config';
import StatusBar from './statusBar';
import { checkChromeCompatibility } from './compatibilityChecker';
import { registerCommand } from './commandRegister';
let chromeVersion = DefaultVerison;
/** 激活启动 */
export function activate(context: vscode.ExtensionContext) {

  registerCommand(context, updateDiagnostics);

  const diagnosticCollection = vscode.languages.createDiagnosticCollection('chrome-compatibility');

  /** 初始化statusBar */
  const statusBar = new StatusBar({
    chromeVersion,
    context,
    updateDiagnostics,
    updateChromeVserion,
  });

  /** 文件类型 */
  function getFileType(fileName: string): string {
    if (fileName.endsWith('.js')) {return 'js';}
    if (fileName.endsWith('.ts')) {return 'ts';}
    if (fileName.endsWith('.vue')) {return 'vue';}
    if (fileName.endsWith('.tsx')) {return 'tsx';}
    if (fileName.endsWith('.jsx')) {return 'jsx';}
    return 'unknown';
  }
  
  /** 处理vue文件 */
  function extractScriptFromVue(vueContent: string): string {
    const scriptMatch = vueContent.match(/<script.*?>([\s\S]*?)<\/script>/);
    return scriptMatch ? scriptMatch[1] : '';
  }
  /** 更新version */
  function updateChromeVserion(version: number) {
    chromeVersion = version
  }

  function updateDiagnostics(document: vscode.TextDocument) {
	const fileName = document.fileName;
  const languageId =  document.languageId;
	const fileType = getFileType(fileName);

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
  statusBar.setUpdateDiagnostics();
}

export function deactivate() {}
