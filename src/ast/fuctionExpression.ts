import { Diagnostic } from "vscode";
import { isSupportApi, locToCodePoi } from "../utils";
import { checkChromeCompatibility } from "../compatibilityChecker";

/** 获取字段类型 */
function getFieldTypeVariableDeclaratorType(type: string) {
  // 基础类型推断
  let inferredType;
  switch (type) {
    case "NumericLiteral":
      inferredType = "Number";
      break;
    case "StringLiteral":
      inferredType = "String";
      break;
    case "BooleanLiteral":
      inferredType = "Boolean";
      break;
    case "ArrayExpression":
      inferredType = "Array";
      break;
    case "ObjectExpression":
      inferredType = "Object";
      break;
    default:
      inferredType = "unknown";
      break;
  }
  return inferredType;
}

/** 处理所有fuc调用表达式 */
function dealFucDeclarator(
  path: CalleeType,
  code: string,
  callBack: (diagnostics?: Diagnostic) => any | undefined
) {
  const { callee } = path.node;
  if (callee.type === "MemberExpression") {
    const typeName = callee.property.name;
    // 检查typeName调用的对象
    const objectNode = callee.object;
    const objectType = objectNode.type;
    let parentType;

    // 判断具体type {parentType.childType} 如 String.matchAll等
    function getDiagnosticsByType (type: string) {
      const parentType = getFieldTypeVariableDeclaratorType(type);
      const fullTypeName = `${parentType}.${typeName}`;
      if (parentType === "unknown") return undefined;
      const isSupport = isSupportApi(fullTypeName);
      if (isSupport) {
        const codePoi = locToCodePoi(callee?.loc);
        let diagnostics;
        if (codePoi) {
          diagnostics = checkChromeCompatibility(code, fullTypeName, codePoi);
        }
        return diagnostics;
      }
      return undefined
    }

    // 如果是标识符查看该标识符的绑定信息  意思是定义的变量如 arr  obj 等 
    if (objectType === "Identifier") {
      // let diagnostics 
      const binding = path.scope.getBinding(objectNode.name);
      if (
        binding &&
        binding.path.node.type === "VariableDeclarator" &&
        binding.path.node.init
      ) {
        parentType = binding.path.node.init.type;
      } else {
        parentType = objectNode.type;
      }

      // // 进一步分析，比如检查参数等
      // if (path.node.arguments.length > 0) {
      //   const arg = path.node.arguments[0];
      //   console.log(`${typeName} type1: ${parentType}`, arg);
      // }
    } else {
      parentType = objectType;
    }

    const diagnostics = getDiagnosticsByType(parentType);
    callBack && callBack(diagnostics);

  }
}

export default dealFucDeclarator;
