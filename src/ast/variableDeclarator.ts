
/** 处理所有 分析变量声明器 */
function dealVariableDeclarator (path: CalleeType) {
    const node = path.node;
      const { id, init } = node;
      if (init) {
        // 基础类型推断
        let inferredType;
        switch (init.type) {
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
        console.log(`Variable name: ${node}, Type: ${inferredType}`);
      }
}

export default dealVariableDeclarator;