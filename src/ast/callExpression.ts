import { Expression } from '@babel/types';
import { isSupportApi } from '../utils';
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
function dealVariableDeclarator (path: CalleeType, code: string, callBack: (diagnostics: any) => void) {
    const { callee } = path.node;
    if (
      callee.type === "MemberExpression"
    ) {
      const typeName = callee.property.name;
      // 检查typeName调用的对象
      const objectNode = callee.object;
      const objectType = objectNode.type;
      let parentType;
      // 如果是标识符，我们需要查找更多信息，可能需要查看该标识符的绑定信息 最重要的内容
      if (objectType === 'Identifier') {
        // 如果是标识符，我们需要查找更多信息，可能需要查看该标识符的绑定信息 最重要的内容
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

      console.log(`${typeName} type: ${parentType}`);

      // 进一步分析，比如检查参数等
      if (path.node.arguments.length > 0) {
        const arg = path.node.arguments[0];
        console.log(`${typeName} type: ${parentType}`, arg);
      }
    }
  }
}


export default dealVariableDeclarator;