import { Diagnostic, DiagnosticSeverity, Range, Position } from 'vscode';
import bcd from '@mdn/browser-compat-data';

// const chromeVersion = 39; // 设置目标 Chrome 版本

/** support api in Chrome */
function isSupportedInChrome(apiPath: string, version: number = 30): {
    support: boolean;
    version: string[];
} {
  const supportData = apiPath.split('.').reduce((obj: any, key) => obj[key], bcd);
  const chromeSupport = supportData.__compat.support.chrome;
  console.log('chromeSupport========', chromeSupport);
  if (Array.isArray(chromeSupport)) {
    const reuslt =  chromeSupport.some(support => typeof support.version_added === 'string' && parseFloat(support.version_added) <= version);
    return {
        support: reuslt,
        version: chromeSupport.map(support => support.version_added),
    }
  } else {
    const reuslt = typeof chromeSupport.version_added === 'string' && parseFloat(chromeSupport.version_added) <= version;
    return {
        support: reuslt,
        version: [chromeSupport.version_added],
    }
  }
}

/** 获取所有api 列表 */
// function getAllAPIs(data: any, pathPrefix: string = ''): { name: string, path: string }[] { 
//     let apiList: { name: string, path: string }[] = [];

//     for (const key in data) {
//       if (data[key].__compat) {
//         apiList.push({ name: key, path: pathPrefix + key });
//       }
//       // 递归遍历子对象
//       const subPathPrefix = pathPrefix + key + '.';
//       apiList = apiList.concat(getAllAPIs(data[key], subPathPrefix));
//     }
  
//     return apiList;
// }

function checkChromeCompatibility(code: string, chromeVersion?: number): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
//   const allAPIs = getAllAPIs(bcd.javascript.builtins);
//   console.log('allAPIs======', allAPIs);
  const apisToCheck = [
    { name: 'matchAll', path: 'javascript.builtins.String.matchAll' },
    { name: 'includes', path: 'javascript.builtins.String.includes' },
    // 添加其他需要检查的 API
  ];

  apisToCheck.forEach(api => {
    const { support, version } = isSupportedInChrome(api.path, chromeVersion);
    if (!support) {
        const regex = new RegExp(`\\b${api.name}\\b`, 'g');
        let match;
        while ((match = regex.exec(code)) !== null) {
          const startPos = code.substr(0, match.index).split('\n').reduce((acc, line) => {
            acc.line++;
            acc.character = line.length;
            return acc;
          }, { line: 0, character: 0 });
  
          const endPos = new Position(startPos.line, startPos.character + api.name.length);
          const range = new Range(new Position(startPos.line, startPos.character), endPos);
          const diagnostic = new Diagnostic(range, `${api.name} not supported in Chrome ${chromeVersion}, The API is supported in Chrome ${version}. `, DiagnosticSeverity.Error);
          diagnostics.push(diagnostic);
        }
    }
  });

  return diagnostics;
}

export { checkChromeCompatibility };
