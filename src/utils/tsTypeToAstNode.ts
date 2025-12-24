import * as t from '@babel/types';

/**
 * 
 * @param typeAnnotation 实现将@babel/types typeAnnotation.type 类型转换成 NumericLiteral, StringLiteral, BooleanLiteral, ArrayExpression, ObjectExpression等类型
 * @returns t.Node
 */
 function handleTypeAnnotation(typeAnnotation: t.TSType): t.Node | any {
  switch (typeAnnotation.type) {
    case 'TSStringKeyword':
      return t.stringLiteral('');
    case 'TSNumberKeyword':
      return t.numericLiteral(0);
    case 'TSBooleanKeyword':
      return t.booleanLiteral(true);
    case 'TSArrayType':
      return t.arrayExpression([]);
    case 'TSTypeLiteral':
      return t.objectExpression([]);
    case 'TSUnionType':
       // @ts-ignore
      return t.unionTypeAnnotation(typeAnnotation.types.map(handleTypeAnnotation));
    case 'TSLiteralType':
      if (t.isStringLiteral(typeAnnotation.literal)) {
        return t.stringLiteral(typeAnnotation.literal.value);
      } else if (t.isNumericLiteral(typeAnnotation.literal)) {
        return t.numericLiteral(typeAnnotation.literal.value);
      } else if (t.isBooleanLiteral(typeAnnotation.literal)) {
        return t.booleanLiteral(typeAnnotation.literal.value);
      }
      break;
    case 'TSAnyKeyword':
      return t.identifier('any');
    case 'TSUnknownKeyword':
      return t.identifier('unknown');
    case 'TSNeverKeyword':
      return t.identifier('never');
    case 'TSVoidKeyword':
      return t.identifier('void');
    case 'TSNullKeyword':
      return t.nullLiteral();
    case 'TSUndefinedKeyword':
      return t.identifier('undefined');
    case 'TSTupleType':
      // @ts-ignore
      return t.arrayExpression(typeAnnotation.elementTypes.map(handleTypeAnnotation));
    case 'TSObjectKeyword':
      return t.objectExpression([]);
    case 'TSFunctionType':
      return t.functionExpression(null, [], t.blockStatement([]));
    case 'TSIntersectionType':
       // @ts-ignore
      return t.intersectionTypeAnnotation(typeAnnotation.types.map(handleTypeAnnotation));
    case 'TSConditionalType':
      return t.conditionalExpression(
         // @ts-ignore
        handleTypeAnnotation(typeAnnotation.checkType),
        handleTypeAnnotation(typeAnnotation.trueType),
        handleTypeAnnotation(typeAnnotation.falseType)
      );
    case 'TSParenthesizedType':
      return handleTypeAnnotation(typeAnnotation.typeAnnotation);
    case 'TSTypePredicate':
      return t.identifier('predicate');
    case 'TSTypeQuery':
      return t.identifier('query');
    case 'TSIndexedAccessType':
      return t.memberExpression(
         // @ts-ignore
        handleTypeAnnotation(typeAnnotation.objectType),
        handleTypeAnnotation(typeAnnotation.indexType)
      );
    case 'TSMappedType':
      return t.identifier('mapped');
    case 'TSImportType':
      return t.identifier('import');
    default:
      return t.identifier('unsupported');
  }
}

export default handleTypeAnnotation
