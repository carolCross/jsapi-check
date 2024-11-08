import { Diagnostic } from "vscode";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import dealNewExpression, { CalleeType } from './ast/newExpression';
// import dealVariableDeclarator from './ast/variableDeclarator';
import dealCallExpression from './ast/callExpression';
import handleTypeAnnotation from './utils/tsTypeToAstNode';
// import dealFucExpression from './ast/fuctionExpression';

/**
 * 分析code
 * @param code  代码
 * @param url 文件地址
 * @returns 
 */
export function analyzeCode(code: string, url: string) {
  const ast = parse(code, {
    sourceType: "unambiguous",
    plugins: ["typescript"], // Add plugins as needed
  });

  // 所有变量集合
  const variableTypes = {} as Record<string, Map<string, string>>;
  variableTypes[url] = new Map();
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
        if (init.type === 'TSAsExpression') {
          const astNode = handleTypeAnnotation(init.typeAnnotation);
          if (astNode?.type) {
            variableTypes[url].set(id.name, astNode.type);
          }
        } else {
          variableTypes[url].set(id.name, init.type);
        }
      }
    },
    /** 赋值表达式 */
    AssignmentExpression(path: CalleeType) {
      const { left, right } = path.node;
      if (left.type === "Identifier") {
        variableTypes[url].set(left.name, right.type);
      }
    },
    // 处理所有new方法调用表达式
    NewExpression: (path: CalleeType) => dealNewExpression(path, code, diagnosticsCallBack),
    // 分析方法调用表达式
    CallExpression: (path: CalleeType) => dealCallExpression(path, code, diagnosticsCallBack, variableTypes[url]),
     // 分析function调用表达式
    // FunctionExpression: (path: CalleeType) => dealFucExpression(path, code, diagnosticsCallBack),
  });
  
  return diagnosticsList;
}