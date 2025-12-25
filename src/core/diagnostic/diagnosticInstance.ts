import * as vscode from "vscode";
import { DiagnosticCommand, supportLanguageList } from "../../utils/constant";
import { chromeVersion } from "../versionControl";
import { analyzeCode } from '../astParse';

/** props */
type PropsType = {
  /** context 事例 */
  context: vscode.ExtensionContext;
};

/* 诊断实例 */
export default class DiagnosticInstance {
  props = {} as PropsType;
  diagnosticCollection = {} as vscode.DiagnosticCollection;
  // 性能优化：添加防抖和缓存
  private updateTimeouts = new Map<string, NodeJS.Timeout>();
  private fileCache = new Map<
    string,
    {
      content: string;
      diagnostics: vscode.Diagnostic[];
      timestamp: number;
      version: number;
      chromeVersion: number;
    }
  >();
  private runId = 0;
  private latestRunByUri = new Map<string, number>();
  private pendingParses = new Map<
    string,
    {
      document: vscode.TextDocument;
      code: string;
      startLine: number;
      uri: string;
      fullContent: string;
      version: number;
      runId: number;
    }
  >();
  private isParsing = false;
  private readonly CACHE_TTL = 5000; // 缓存5秒
  private readonly DEBOUNCE_DELAY = 300; // 防抖300ms
  
  constructor(pr: PropsType) {
    this.props = pr;
    this.initDiagnostic();
  }
  /** 初始化 */
  initDiagnostic = () => {
    this.diagnosticCollection =
      vscode.languages.createDiagnosticCollection(DiagnosticCommand);
    
    // 只监听用户主动打开的文件，不自动扫描工作区
    this.props.context.subscriptions.push(
      // 用户打开文件时检测
      vscode.workspace.onDidOpenTextDocument((doc) => {
        if (this.isDocumentVisible(doc)) {
          this.updateDiagnostics(doc);
        }
      }),
      // 切换编辑器时检测
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
          this.updateDiagnostics(editor.document);
        }
      }),
      // 用户修改文件时检测（带防抖）
      vscode.workspace.onDidChangeTextDocument((e) => {
        // 防抖处理，避免频繁更新
        this.debouncedUpdate(e.document);
      }),
      // 用户关闭文件时清理
      vscode.workspace.onDidCloseTextDocument((doc) => {
        this.diagnosticCollection.delete(doc.uri);
        this.fileCache.delete(doc.uri.toString()); // 清理缓存
        const uri = doc.uri.toString();
        const timeout = this.updateTimeouts.get(uri);
        if (timeout) {
          clearTimeout(timeout);
          this.updateTimeouts.delete(uri);
        }
        this.pendingParses.delete(uri);
      })
    );
  };

  private isDocumentVisible = (document: vscode.TextDocument) => {
    return vscode.window.visibleTextEditors.some(
      (editor) => editor.document.uri.toString() === document.uri.toString()
    );
  };

  /** 防抖更新 */
  private debouncedUpdate = (document: vscode.TextDocument) => {
    const uri = document.uri.toString();
    const existing = this.updateTimeouts.get(uri);
    if (existing) {
      clearTimeout(existing);
    }
    const timeout = setTimeout(() => {
      this.updateTimeouts.delete(uri);
      this.updateDiagnostics(document);
    }, this.DEBOUNCE_DELAY);
    this.updateTimeouts.set(uri, timeout);
  };
  /** 更新检测 */
  updateDiagnostics = (document: vscode.TextDocument, options?: { force?: boolean }) => {
    const languageId = document.languageId;
    const uri = document.uri.toString();
    const filePath = document.uri.fsPath;

    // 性能保护：检查文件行数是否过大
    const lineCount = document.lineCount;
    if (lineCount > 10000) {
      console.log(`跳过大文件检测: ${filePath} (${lineCount} 行)`);
      return;
    }

    // 性能保护：对于 node_modules 中的文件，增加额外的行数限制
    if (document.uri.path.includes('node_modules') && lineCount > 5000) {
      console.log(`跳过大型 node_modules 文件: ${filePath} (${lineCount} 行)`);
      return;
    }

    if (!supportLanguageList.includes(languageId)) {
      return;
    }

    // 性能优化：检查缓存
    const currentContent = document.getText();
    const cached = this.fileCache.get(uri);
    if (
      !options?.force &&
      cached &&
      cached.content === currentContent &&
      cached.version === document.version &&
      cached.chromeVersion === chromeVersion &&
      Date.now() - cached.timestamp < this.CACHE_TTL
    ) {
      // 使用缓存的结果
      this.diagnosticCollection.set(document.uri, cached.diagnostics);
      return;
    }

    // 清空当前诊断
    this.diagnosticCollection.set(document.uri, []);

    let code = "";
    let startLine = 0;

    if (languageId === "vue") {
      const result = this.extractScriptFromVue(currentContent);
      code = result.code;
      startLine = result.startLine;
    } else {
      code = currentContent;
    }

    // 异步解析，避免阻塞UI
    const currentRunId = ++this.runId;
    this.latestRunByUri.set(uri, currentRunId);
    this.enqueueParse(code, document, startLine, uri, currentContent, currentRunId);
  };

  /** 异步解析队列 */
  private enqueueParse = (
    code: string,
    document: vscode.TextDocument,
    startLine: number,
    uri: string,
    fullContent: string,
    runId: number
  ) => {
    this.pendingParses.set(uri, {
      document,
      code,
      startLine,
      uri,
      fullContent,
      version: document.version,
      runId
    });
    this.processQueue();
  };

  private processQueue = async () => {
    if (this.isParsing) return;
    this.isParsing = true;
    try {
      while (this.pendingParses.size > 0) {
        const [uri, task] = this.pendingParses.entries().next().value as [
          string,
          {
            document: vscode.TextDocument;
            code: string;
            startLine: number;
            uri: string;
            fullContent: string;
            version: number;
            runId: number;
          }
        ];
        this.pendingParses.delete(uri);

        if (task.document.version !== task.version) {
          continue;
        }

        const diagnostics = await new Promise<vscode.Diagnostic[]>((resolve) => {
          Promise.resolve().then(() => {
            resolve(analyzeCode(task.code, task.document?.uri.path, task.startLine));
          });
        });

        if (this.latestRunByUri.get(task.uri) !== task.runId) {
          continue;
        }

        this.diagnosticCollection.set(task.document.uri, diagnostics);
        this.fileCache.set(task.uri, {
          content: task.fullContent,
          diagnostics,
          timestamp: Date.now(),
          version: task.version,
          chromeVersion
        });
      }
    } catch (error) {
      console.error('解析代码时出错:', error);
    } finally {
      this.isParsing = false;
      if (this.pendingParses.size > 0) {
        this.processQueue();
      }
    }
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

  /** 清理缓存 */
  clearCache = () => {
    this.fileCache.clear();
  };
}
