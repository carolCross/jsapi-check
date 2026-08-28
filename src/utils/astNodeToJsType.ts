/**
 * 
 * @param astNodeToJsType 实现将NumericLiteral, StringLiteral, BooleanLiteral, ArrayExpression, ObjectExpression等类型 转换成 String Object Number等类型
 * @returns t.Node
 */
function astNodeToJsType(type: string): string {
  switch (type) {
      case 'StringLiteral':
          return 'String';
      case 'NumericLiteral':
          return 'Number';
      case 'BooleanLiteral':
          return 'Boolean';
      case 'ArrayExpression':
          return 'Array';
      case 'ObjectExpression':
          return 'Object';
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
          return 'Function';
      case 'NullLiteral':
          return 'Null';
      case 'RegExpLiteral':
          return 'RegExp';
      case 'ClassExpression':
          return 'Class';
      default:
          return 'unknown';
  }
}

export default astNodeToJsType
