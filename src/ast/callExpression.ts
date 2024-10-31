import { Diagnostic } from "vscode";
import { Expression } from '@babel/types';
import { isSupportApi, locToCodePoi } from '../utils';
import { checkChromeCompatibility } from '../compatibilityChecker';

type CalleeType = {
    node: {
        callee: {
            object: {
                name?: string
            },
            property: {
                name?: string
            }
        } & Expression
    }
} | any

/** 获取字段类型 */
function getFieldTypeVariableDeclaratorType (type: string) {
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

/** 处理所有 分析方法调用表达式 */
function dealVariableDeclarator (path: CalleeType, code: string, callBack: (diagnostics?: Diagnostic) => any) {
    const { callee } = path.node;
    if (
      callee.type === "MemberExpression"
    ) {
      const typeName = callee.property.name;
      // 检查typeName调用的对象
      const objectNode = callee.object;
      const objectType = objectNode.type;
      let parentType;
      // 如果是标识符查看该标识符的绑定信息 最重要的内容
      if (objectType === 'Identifier') {
        const binding = path.scope.getBinding(objectNode.name);
        if (
          binding &&
          binding.path.node.type === "VariableDeclarator" &&
          binding.path.node.init
        ) {
          const initType = binding.path.node.init.type;
          parentType =  getFieldTypeVariableDeclaratorType(initType);
      } else {
        parentType = getFieldTypeVariableDeclaratorType(objectNode.type);
      }

      if (parentType === 'unknown') return false

      const fullTypeName = `${parentType}.${typeName}`;

      const isSupport = isSupportApi(fullTypeName);
      if (isSupport) {
        const codePoi = locToCodePoi(callee?.loc);
        let diagnostics
        if (codePoi) {
          diagnostics  = checkChromeCompatibility(code, fullTypeName, codePoi);
         }
         callBack && callBack(diagnostics);
      }

      console.log(`${typeName} type2: ${parentType}`);

      // // 进一步分析，比如检查参数等
      // if (path.node.arguments.length > 0) {
      //   const arg = path.node.arguments[0];
      //   console.log(`${typeName} type1: ${parentType}`, arg);
      // }
    }
  }
}


export default dealVariableDeclarator;