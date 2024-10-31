import { Diagnostic } from "vscode";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import dealNewExpression from './ast/newExpression';
import dealVariableDeclarator from './ast/variableDeclarator';
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
    NewExpression: path => dealNewExpression(path, code, diagnosticsCallBack),
    // 分析方法调用表达式
    CallExpression: path => dealCallExpression(path, code, diagnosticsCallBack),
  });
  
  
  return diagnosticsList;
}

// 分析变量声明器
// VariableDeclarator: path => dealVariableDeclarator(path, code, diagnosticsCallBack),

// VariableDeclarator(path) {
//   const node = path.node;
//   const { id, init } = node;
//   if (init) {
//     // 基础类型推断
//     let inferredType;
//     switch (init.type) {
//       case "NumericLiteral":
//         inferredType = "Number";
//         break;
//       case "StringLiteral":
//         inferredType = "String";
//         break;
//       case "BooleanLiteral":
//         inferredType = "Boolean";
//         break;
//       case "ArrayExpression":
//         inferredType = "Array";
//         break;
//       case "ObjectExpression":
//         inferredType = "Object";
//         break;
//       default:
//         inferredType = "unknown";
//         break;
//     }
//     console.log(`Variable name: ${node}, Type: ${inferredType}`);
//   }
// },
// CallExpression(path) {
//   const { callee } = path.node;
//   if (
//     callee.type === "MemberExpression" &&
//     callee.property.name === "matchAll"
//   ) {
//     console.log("matchAll method called");

//     // 检查matchAll调用的对象
//     const objectNode = callee.object;
//     let objectType;

//     // 根据对象节点的类型推断str的类型
//     switch (objectNode.type) {
//       case "StringLiteral":
//         objectType = "String (literal)";
//         break;
//       case "TemplateLiteral":
//         objectType = "String (template)";
//         break;
//       case "Identifier":
//         // 如果是标识符，我们需要查找更多信息，可能需要查看该标识符的绑定信息 最重要的内容
//         const binding = path.scope.getBinding(objectNode.name);
//         if (
//           binding &&
//           binding.path.node.type === "VariableDeclarator" &&
//           binding.path.node.init
//         ) {
//           const initType = binding.path.node.init.type;
//           objectType =
//             initType === "StringLiteral" ? "String (literal)" : "Other";
//         } else {
//           objectType = "Identifier (unknown type)";
//         }
//         break;
//       default:
//         objectType = "Unknown";
//         break;
//     }

//     console.log(`matchAll called on an object of type: ${objectType}`);

//     // 进一步分析，比如检查参数等
//     if (path.node.arguments.length > 0) {
//       const arg = path.node.arguments[0];
//       console.log(`matchAll called with argument of type: ${arg.type}`);
//     }
//   }
// },