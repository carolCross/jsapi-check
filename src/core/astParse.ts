import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import dealNewExpression from './ast/newExpression';
// import dealVariableDeclarator from './ast/variableDeclarator';
import dealCallExpression from './ast/callExpression';
import handleTypeAnnotation from '../utils/tsTypeToAstNode';
import { DiagnosticPayload } from "./diagnostic/diagnosticTypes";
// import dealFucExpression from './ast/functionExpression';

/**
 * 分析code
 * @param code  代码
 * @param url 文件地址
 * @param startLine 起始点行数
 * @returns 
 */
export function analyzeCode(code: string, url: string, startLine?: number) {
  const ast = parse(code, {
    sourceType: "unambiguous",
    plugins: ["typescript", "jsx", "classProperties", "optionalChaining", "nullishCoalescingOperator"], // Add plugins as needed
    errorRecovery: true,
  });

  // 所有变量集合
  const variableTypes = {} as Record<string, Map<string, string>>;
  variableTypes[url] = new Map();
  const diagnosticsList = [] as DiagnosticPayload[];
  /** 处理回调diagnostic列表 */
  function diagnosticsCallBack (diagnostic?: DiagnosticPayload) {
    if (diagnostic) {
      diagnosticsList.push(diagnostic); 
    }
  }
  traverse(ast, {
    /** 变量自定义 */
    VariableDeclarator(path: CalleeType) {
      const { id, init } = path.node;
      const keyLine = id.loc?.start.line ?? 0;
      const keyType = `${keyLine}${id.name}`;
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
        if (!binding) return;
        const bindNode = binding.path.node;
        const init = binding.path.node.init;
        // 赋值是优先查询变量作用于域中绑定类型字段
        if (bindNode.type === "VariableDeclarator" && bindNode.init) { 
          const initLine = init.loc?.start.line ?? 0;
          const newKeyType = `${initLine}${bindNode.id.name}`;
          variableTypes[url].set(newKeyType, right.type);
        }
      } else if (left.type === "MemberExpression") {
        if (left.object.type === "Identifier") {
          const objectName = left.object.name;
          const propertyName =
            left.property.type === "Identifier" ? left.property.name : undefined;
          const binding = path.scope.getBinding(objectName);
          if (binding && propertyName) {
            const bindLine = binding.path.node.loc?.start.line ?? 0;
            const keyType = `${bindLine}${objectName}.${propertyName}`;
            variableTypes[url].set(keyType, right.type);
          }
        }
      }
    },
    // 处理所有new方法调用表达式
    NewExpression: (path: CalleeType) => dealNewExpression(path, code, diagnosticsCallBack),
    // 分析方法调用表达式
    CallExpression: (path: CalleeType) => dealCallExpression(path, code, diagnosticsCallBack, variableTypes[url], startLine),
    OptionalCallExpression: (path: CalleeType) => dealCallExpression(path, code, diagnosticsCallBack, variableTypes[url], startLine),
    // 分析function调用表达式
    // FunctionExpression(path) {
    //   console.log('Found a FunctionExpression:', path.node);
    // },
    // FunctionExpression: (path: CalleeType) => dealFucExpression(path, code, diagnosticsCallBack),
  });
  
  return diagnosticsList;
}
