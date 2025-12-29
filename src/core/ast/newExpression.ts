import { isSupportApi, locToCodePoi } from '../../utils/index';
import { checkChromeCompatibility } from '../compatibility/compatibilityChecker';
import { DiagnosticPayload } from "../diagnostic/diagnosticTypes";
import { GlobalObjectNames } from "../../utils/constant";

const globalObjectNameSet = new Set(GlobalObjectNames);

function getCalleePath(callee: any): string[] | null {
  if (callee.type === "Identifier") {
    return [callee.name];
  }
  if (callee.type !== "MemberExpression" && callee.type !== "OptionalMemberExpression") {
    return null;
  }
  const parts: string[] = [];
  let current = callee;
  while (current && (current.type === "MemberExpression" || current.type === "OptionalMemberExpression")) {
    const property = current.property;
    if (!property) return null;
    if (current.computed && property.type !== "StringLiteral") return null;
    const propertyName =
      property.type === "Identifier"
        ? property.name
        : property.type === "StringLiteral"
          ? property.value
          : null;
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

/** 处理所有 new方法调用表达式 */
function dealNewExpression (
  path: CalleeType,
  code: string,
  callBack: (diagnostics?: DiagnosticPayload) => void,
  startLine?: number
) {
  const callee = path.node.callee;
  const calleePath = getCalleePath(callee);
  if (!calleePath) return;
  const normalizedPath = normalizeMemberPath(calleePath);
  if (!normalizedPath.length || !isSupportApi(normalizedPath[0])) return;
  const typeName = normalizedPath.join(".");
  const codePoi = locToCodePoi(callee?.loc, startLine);
  const diagnostics = codePoi ? checkChromeCompatibility(code, typeName, codePoi) : undefined;
  callBack && callBack(diagnostics);
}

export default dealNewExpression;
