import { Diagnostic } from "vscode";
import {  isSupportApi, locToCodePoi, astNodeToJsType, handleTypeAnnotation } from '@/utils';
import { checkChromeCompatibility } from "../compatibilityChecker";

/** 处理所有 分析方法调用表达式 */
function dealCallExpression(
  path: CalleeType,
  code: string,
  callBack: (diagnostics?: Diagnostic) => any | undefined,
  variableTypes: Map<string, string>
) {
  const { callee } = path.node;
  console.log('variableTypes======', variableTypes);
  if (callee.type === "MemberExpression") {
    const typeName = callee.property.name;
    // 检查typeName调用的对象
    const objectNode = callee.object;
    const objectType = objectNode.type;
    let parentType;

    // 判断具体type {parentType.childType} 如 String.matchAll等
    function getDiagnosticsByType (type: string) {
      const parentType = astNodeToJsType(type);
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
      const keyType = `${objectNode.loc.start.line}${objectNode.name}`;
      if (objectNode.name && variableTypes.has(keyType)) {
        parentType = variableTypes.get(keyType) || objectNode.type;
      } else {
        const binding = path.scope.getBinding(objectNode.name);
        if (
          binding
        ) {
          // 如果是变量声明器
          switch (binding.path.node.type) {
            // 变量类型
            case "VariableDeclarator":
              const init = binding.path.node.init;
              if (init.type) {
                const newKeyType = `${init.loc.start.line}${objectNode.name}`;
                parentType = variableTypes.get(newKeyType) || init.type;
              }
              break;
            // 赋值表达式
            case "Identifier":
              const node = binding.path.node;
              if (node.type === 'Identifier' && node.typeAnnotation) {
                const data =  node.typeAnnotation?.typeAnnotation;
                const astNode = handleTypeAnnotation(data);
                // 如果ts类型为any，则根据表达式进行类型推断
                if (astNode?.name === 'any') {
                  const expressionType = init.expression.type;
                  parentType = expressionType
                  // const type = 
                  // variableTypes[url].set(keyType, expression);
                } else if(astNode?.type) {
                  parentType = astNode.type
                  // variableTypes[url].set(keyType, astNode.type);
                }
              }
              break;
          
            default:
              break;
          }

          // if (binding.path.node.type === "VariableDeclarator" &&
          //   binding.path.node.init) {
          //     const init = binding.path.node.init;
          //     if (init.type) {
          //       const newKeyType = `${init.loc.start.line}${objectNode.name}`;
          //       parentType = variableTypes.get(newKeyType) || init.type;
          //     }
          //   } else if ()
        } else {
          parentType = objectNode.type;
        }
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

export default dealCallExpression;

