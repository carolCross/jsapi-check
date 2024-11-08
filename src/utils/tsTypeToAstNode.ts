import * as t from '@babel/types';

/**
 * 
 * @param typeAnnotation 实现将@babel/types typeAnnotation.type 类型转换成 NumericLiteral, StringLiteral, BooleanLiteral, ArrayExpression, ObjectExpression等类型
 * @returns t.Node
 */
 function handleTypeAnnotation(typeAnnotation: t.TSType): t.Node | any {
  switch (typeAnnotation.type) {
    case 'TSStringKeyword':
      console.log('Type is string');
      return t.stringLiteral('');
    case 'TSNumberKeyword':
      console.log('Type is number');
      return t.numericLiteral(0);
    case 'TSBooleanKeyword':
      console.log('Type is boolean');
      return t.booleanLiteral(true);
    case 'TSArrayType':
      console.log('Type is array');
      return t.arrayExpression([]);
    case 'TSTypeLiteral':
      console.log('Type is object');
      return t.objectExpression([]);
    case 'TSUnionType':
      console.log('Type is union');
       // @ts-ignore
      return t.unionTypeAnnotation(typeAnnotation.types.map(handleTypeAnnotation));
    case 'TSLiteralType':
      console.log('Type is literal');
      if (t.isStringLiteral(typeAnnotation.literal)) {
        return t.stringLiteral(typeAnnotation.literal.value);
      } else if (t.isNumericLiteral(typeAnnotation.literal)) {
        return t.numericLiteral(typeAnnotation.literal.value);
      } else if (t.isBooleanLiteral(typeAnnotation.literal)) {
        return t.booleanLiteral(typeAnnotation.literal.value);
      }
      break;
    case 'TSAnyKeyword':
      console.log('Type is any');
      return t.identifier('any');
    case 'TSUnknownKeyword':
      console.log('Type is unknown');
      return t.identifier('unknown');
    case 'TSNeverKeyword':
      console.log('Type is never');
      return t.identifier('never');
    case 'TSVoidKeyword':
      console.log('Type is void');
      return t.identifier('void');
    case 'TSNullKeyword':
      console.log('Type is null');
      return t.nullLiteral();
    case 'TSUndefinedKeyword':
      console.log('Type is undefined');
      return t.identifier('undefined');
    case 'TSTupleType':
      console.log('Type is tuple');
      // @ts-ignore
      return t.arrayExpression(typeAnnotation.elementTypes.map(handleTypeAnnotation));
    case 'TSObjectKeyword':
      console.log('Type is object');
      return t.objectExpression([]);
    case 'TSFunctionType':
      console.log('Type is function');
      return t.functionExpression(null, [], t.blockStatement([]));
    case 'TSIntersectionType':
      console.log('Type is intersection');
       // @ts-ignore
      return t.intersectionTypeAnnotation(typeAnnotation.types.map(handleTypeAnnotation));
    case 'TSConditionalType':
      console.log('Type is conditional');
      return t.conditionalExpression(
         // @ts-ignore
        handleTypeAnnotation(typeAnnotation.checkType),
        handleTypeAnnotation(typeAnnotation.trueType),
        handleTypeAnnotation(typeAnnotation.falseType)
      );
    case 'TSParenthesizedType':
      console.log('Type is parenthesized');
      return handleTypeAnnotation(typeAnnotation.typeAnnotation);
    case 'TSTypePredicate':
      console.log('Type is predicate');
      return t.identifier('predicate');
    case 'TSTypeQuery':
      console.log('Type is query');
      return t.identifier('query');
    case 'TSIndexedAccessType':
      console.log('Type is indexed access');
      return t.memberExpression(
         // @ts-ignore
        handleTypeAnnotation(typeAnnotation.objectType),
        handleTypeAnnotation(typeAnnotation.indexType)
      );
    case 'TSMappedType':
      console.log('Type is mapped');
      return t.identifier('mapped');
    case 'TSImportType':
      console.log('Type is import');
      return t.identifier('import');
    default:
      console.log(`Unsupported type annotation: ${typeAnnotation.type}`);
      return t.identifier('unsupported');
  }
}

export default handleTypeAnnotation
