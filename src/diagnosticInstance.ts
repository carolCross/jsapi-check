import * as vscode from "vscode";
import { DiagnosticCommand, supportLanguageList } from "./config";
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

    if (!supportLanguageList.includes(languageId)) {
      return;
    }

    this.diagnosticCollection.set(document.uri, []);

    let code = "";

    if (languageId === "vue") {
      code = this.extractScriptFromVue(document.getText());
    } else {
      code = document.getText();
    }
    const diagnostics = analyzeCode(code);
    // const diagnostics = checkChromeCompatibility(
    //   code,
    //   chromeVersion,
    //   // languageId
    // );
    this.diagnosticCollection.set(document.uri, diagnostics);
  };
  /** 处理vue文件 */
  extractScriptFromVue = (vueContent: string): string => {
    const scriptMatch = vueContent.match(/<script.*?>([\s\S]*?)<\/script>/);
    return scriptMatch ? scriptMatch[1] : "";
  };
}
