import { DiagnosticPayload } from "../diagnostic/diagnosticTypes";
import { isSupportApi, locToCodePoi } from "../../utils/index";
import { checkBrowserCompatibility } from "../compatibility/compatibilityChecker";
import astNodeToJsType from "../../utils/astNodeToJsType";
import handleTypeAnnotation from '../../utils/tsTypeToAstNode';
import { GlobalObjectNames } from "../../utils/constant";

const globalObjectNameSet = new Set(GlobalObjectNames);

function getMemberPropertyName(member: any): string | null {
  if (!member?.property) return null;
  if (member.computed && member.property.type !== "StringLiteral") return null;
  if (member.property.type === "Identifier") return member.property.name;
  if (member.property.type === "StringLiteral") return member.property.value;
  return null;
}

function getMemberPath(member: any): string[] | null {
  const parts: string[] = [];
  let current = member;
  while (current && (current.type === "MemberExpression" || current.type === "OptionalMemberExpression")) {
    const propertyName = getMemberPropertyName(current);
    if (!propertyName) return null;
    parts.unshift(propertyName);
    const objectNode = current.object;
    if (objectNode.type === "Identifier") {
      parts.unshift(objectNode.name);
      return parts;
    }
    if (objectNode.type === "MemberExpression" || objectNode.type === "OptionalMemberExpression") {
      current = objectNode;
      continue;
    }
    return null;
  }
  return null;
}

function normalizeMemberPath(path: string[]): string[] {
  if (path.length > 0 && globalObjectNameSet.has(path[0])) {
    return path.slice(1);
  }
  return path;
}

/** 处理所有 分析方法调用表达式 */
function dealCallExpression(
  path: CalleeType,
  code: string,
  callBack: (diagnostics?: DiagnosticPayload) => any | undefined,
  variableTypes: Map<string, string>,
  /** 起始行数 */
  startLine?: number
) {
  const { callee } = path.node;
  if (callee.type === "Identifier") {
    const typeName = callee.name;
    if (isSupportApi(typeName)) {
      const codePoi = locToCodePoi(callee?.loc, startLine);
      const diagnostics = codePoi
        ? checkBrowserCompatibility(code, typeName, codePoi)
        : undefined;
      callBack && callBack(diagnostics);
    }
    return;
  }

  if (callee.type === "MemberExpression" || callee.type === "OptionalMemberExpression") {
    const memberPath = getMemberPath(callee);
    if (memberPath) {
      const normalizedPath = normalizeMemberPath(memberPath);
      if (normalizedPath.length && isSupportApi(normalizedPath[0])) {
        const directTypeName = normalizedPath.join(".");
        const codePoi = locToCodePoi(callee?.loc, startLine);
        const diagnostics = codePoi
          ? checkBrowserCompatibility(code, directTypeName, codePoi)
          : undefined;
        if (diagnostics) {
          callBack && callBack(diagnostics);
        }
        return;
      }
    }
    const typeName = getMemberPropertyName(callee);
    if (!typeName) return;
    // 检查typeName调用的对象
    const objectNode = callee.object;
    const objectType = objectNode.type;
    let parentType;


    // 如果是标识符查看该标识符的绑定信息  意思是定义的变量如 arr  obj 等 
    if (objectType === "Identifier") {
      const keyLine = objectNode.loc?.start.line ?? 0;
      const keyType = `${keyLine}${objectNode.name}`;
      if (objectNode.name && variableTypes.has(keyType)) {
        parentType = variableTypes.get(keyType) || objectNode.type;
      } else if (objectNode.name && isSupportApi(objectNode.name)) {
        parentType = objectNode.name;
      } else {
        const binding = path.scope.getBinding(objectNode.name);
        if (binding) {
          // 如果是变量声明器
          switch (binding.path.node.type) {
            // 变量类型
            case "VariableDeclarator":
              const init = binding.path.node.init;
              if (init?.type) {
                const initLine = init.loc?.start.line ?? 0;
                const newKeyType = `${initLine}${objectNode.name}`;
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
                  parentType = "unknown";
                } else if (astNode?.type) {
                  parentType = astNode.type;
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

    if (!parentType) {
      parentType = objectNode.type;
    }
    const diagnostics = getDiagnosticsByType(code, callee, typeName, parentType, startLine);
    callBack && callBack(diagnostics);

  }
}

  // 判断具体type {parentType.childType} 如 String.matchAll等
  function getDiagnosticsByType (code: string, callee: any, typeName: string, type: string, startLine?: number) {
    if (!type) return undefined;
    const resolvedType = isSupportApi(type) ? type : astNodeToJsType(type);
    const parentType = resolvedType;
    const fullTypeName = `${parentType}.${typeName}`;
    if (parentType === "unknown") return undefined;
    const isSupport = isSupportApi(fullTypeName);
    if (isSupport) {
      const codePoi = locToCodePoi(callee?.loc, startLine);
      let diagnostics;
      if (codePoi) {
        diagnostics = checkBrowserCompatibility(code, fullTypeName, codePoi);
      }
      return diagnostics;
    }
    return undefined
  }

export default dealCallExpression;
