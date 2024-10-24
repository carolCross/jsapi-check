const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

function analyzeCode(code: string) {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'js', 'ts'], // Add plugins as needed
  });

  traverse(ast, {
    VariableDeclarator(path: any) {
      const { id, init } = path.node;
      console.log(`Variable name: ${id.name}`);

      if (init) {
        // Basic type inference from initialization
        if (init.type === 'NumericLiteral') {
          console.log('Type: number');
        } else if (init.type === 'StringLiteral') {
          console.log('Type: string');
        } else {
          console.log('Type: unknown');
        }
      }
    },
  });
}

const code = `
var x = 10;
var y = 'hello';
`;
analyzeCode(code);

