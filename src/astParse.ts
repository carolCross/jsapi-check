import { Diagnostic } from "vscode";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import dealNewExpression, { CalleeType } from './ast/newExpression';
// import dealVariableDeclarator from './ast/variableDeclarator';
import dealCallExpression from './ast/callExpression';
// import dealFucExpression from './ast/fuctionExpression';

const variableTypes = new Map<string, string>();

/** 分析code */
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
    /** 变量自定义 */
    VariableDeclarator(path: CalleeType) {
      const { id, init } = path.node;
      if (id.type === "Identifier" && init) {
        variableTypes.set(id.name, init.type);
      }
    },
    /** 赋值表达式 */
    AssignmentExpression(path: CalleeType) {
      const { left, right } = path.node;
      if (left.type === "Identifier") {
        variableTypes.set(left.name, right.type);
      }
    },
    // 处理所有new方法调用表达式
    NewExpression: (path: CalleeType) => dealNewExpression(path, code, diagnosticsCallBack),
    // 分析方法调用表达式
    CallExpression: (path: CalleeType) => dealCallExpression(path, code, diagnosticsCallBack, variableTypes),
     // 分析function调用表达式
    // FunctionExpression: (path: CalleeType) => dealFucExpression(path, code, diagnosticsCallBack),
  });
  
  return diagnosticsList;
}