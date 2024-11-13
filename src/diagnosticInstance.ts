import * as vscode from "vscode";
import { DiagnosticCommand, supportLanguageList } from "./utils/constant";
import {analyzeCode} from './astParse';

/** props */
type PropsType = {
  /** context 事例 */
  context: vscode.ExtensionContext;
};
/* 底部状态栏 */
export default class StatusBar {
  props = {} as PropsType;
  diagnosticCollection = {} as vscode.DiagnosticCollection;
  constructor(pr: PropsType) {
    this.props = pr;
    this.initDiagnostic();
  }
  /** 初始化 */
  initDiagnostic = () => {
    this.diagnosticCollection =
      vscode.languages.createDiagnosticCollection(DiagnosticCommand);
    this.props.context.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument(this.updateDiagnostics),
      vscode.workspace.onDidChangeTextDocument((e) =>
        this.updateDiagnostics(e.document)
      ),
      vscode.workspace.onDidCloseTextDocument((doc) =>
        this.diagnosticCollection.delete(doc.uri)
      )
    );
  };
  /** 更新检测 */
  updateDiagnostics = (document: vscode.TextDocument) => {
    const languageId = document.languageId;

    // 检查文件路径是否包含 node_modules
    if (document.uri.path.includes('node_modules')) {
      return;
    }
    // 检查文件行数是否超过 10000 行
    const lineCount = document.lineCount;
    if (lineCount > 10000) {
      return;
    }

    if (!supportLanguageList.includes(languageId)) {
      return;
    }

    this.diagnosticCollection.set(document.uri, []);

    let code = "";
    let startLine = 0;

    if (languageId === "vue") {
      const result = this.extractScriptFromVue(document.getText());
      code = result.code;
      startLine = result.startLine;
    } else {
      code = document.getText();
    }
    const diagnostics = analyzeCode(code, document?.uri.path, startLine);
    this.diagnosticCollection.set(document.uri, diagnostics);
  };
  /** 
   * @description: 处理vue文件
   * startLine 为js/ts 起始行数
   */
  extractScriptFromVue = (vueContent: string): { code: string, startLine: number } => {
    const scriptMatch = vueContent.match(/<script.*?>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    const scriptContent = scriptMatch[1];
    const beforeScript = vueContent.substring(0, scriptMatch.index);
    const startLine = beforeScript.split('\n').length - 1;
    return { code: scriptContent, startLine };
  }
  return { code: '', startLine: 0 };
  };
}
