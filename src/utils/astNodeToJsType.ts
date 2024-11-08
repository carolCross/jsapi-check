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
          return 'Regexp';
      // case 'Identifier':
      //     return 'Identifier';
      // case 'CallExpression':
      //     return 'Call';
      // case 'MemberExpression':
      //     return 'Member';
      // case 'BinaryExpression':
      //     return 'Binary';
      // case 'UnaryExpression':
      //     return 'Unary';
      // case 'LogicalExpression':
      //     return 'Logical';
      // case 'ConditionalExpression':
      //     return 'Conditional';
      // case 'TemplateLiteral':
      //     return 'Template';
      // case 'TaggedTemplateExpression':
      //     return 'TaggedTemplate';
      case 'ClassExpression':
          return 'Class';
      // case 'NewExpression':
      //     return 'New';
      // case 'ThisExpression':
      //     return 'this';
      // case 'Super':
      //     return 'super';
      // case 'MetaProperty':
      //     return 'metaProperty';
      // case 'AwaitExpression':
      //     return 'await';
      // case 'Import':
      //     return 'import';
      // case 'JSXElement':
      //     return 'jsxElement';
      // case 'JSXFragment':
      //     return 'jsxFragment';
      default:
          return 'unknown';
  }
}

export default astNodeToJsType
