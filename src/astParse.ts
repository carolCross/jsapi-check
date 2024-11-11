import { Diagnostic } from "vscode";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import dealNewExpression, { CalleeType } from './ast/newExpression';
// import dealVariableDeclarator from './ast/variableDeclarator';
import dealCallExpression from './ast/callExpression';
import handleTypeAnnotation from './utils/tsTypeToAstNode';
import dealFucExpression from './ast/fuctionExpression';

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
      const keyType = `${id.loc.start.line}${id.name}`;
      if (id.type === "Identifier" && init) {
        if (init.type === 'TSAsExpression') {
          const astNode = handleTypeAnnotation(init.typeAnnotation);
          // 如果ts类型为any，则根据表达式进行类型推断
          if (astNode?.name === 'any') {
            const expression = init.expression.type;
            variableTypes[url].set(keyType, expression);
          } else if(astNode?.type) {
            variableTypes[url].set(keyType, astNode.type);
          }
        } else {
          variableTypes[url].set(keyType, init.type);
        }
      }
    },
    /** 赋值表达式 */
    AssignmentExpression(path: CalleeType) {
      const { left, right } = path.node;
      if (left.type === "Identifier") {
        const binding = path.scope.getBinding(left.name);
        const bindNode = binding.path.node;
        const init = binding.path.node.init;
        if (binding && bindNode.type === "VariableDeclarator" && bindNode.init) { 
          const newKeyType = `${init.loc.start.line}${bindNode.id.name}`;
          variableTypes[url].set(newKeyType, right.type);
        }
        // const keyType = `${left.loc.start.line}${left.name}`;
        // parentType = variableTypes.get(newKeyType) || init.type;
          // if (binding.path.node.type === "VariableDeclarator" &&) {
          // const keyType = `${left.loc.start.line}${left.name}`;
          // variableTypes[url].set(keyType, right.type);
        // }
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