import { Diagnostic } from "vscode";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import dealNewExpression, { CalleeType } from './ast/newExpression';
// import dealVariableDeclarator from './ast/variableDeclarator';
import dealCallExpression from './ast/callExpression';

export function analyzeCode(code: string) {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"], // Add plugins as needed
  });

  const diagnosticsList = [] as Diagnostic[];
  /** 处理回调diagnostic列表 */
  function diagnosticsCallBack (diagnostic?: Diagnostic) {
    if (diagnostic) {
      diagnosticsList.push(diagnostic); 
    }
  }

  traverse(ast, {
    // 处理所有new方法调用表达式
    NewExpression: (path: CalleeType) => dealNewExpression(path, code, diagnosticsCallBack),
    // 分析方法调用表达式
    CallExpression: (path: CalleeType) => dealCallExpression(path, code, diagnosticsCallBack),
  });
  
  return diagnosticsList;
}