import { Diagnostic, DiagnosticSeverity, Range, Position } from 'vscode';
import bcd from '@mdn/browser-compat-data';

type APIInfo = { name: string, path: string };

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
function getAllAPIs(data: any, pathPrefix: string = '', visited = new WeakSet()): APIInfo[] {
    // return apiList;
    let apiList: APIInfo[] = [];

    if (typeof data === 'object' && data !== null && !visited.has(data)) {
        visited.add(data);

        for (const key in data) {
            if (data[key] && typeof data[key] === 'object' && data[key].__compat) {
                apiList.push({ name: pathPrefix + key, path: pathPrefix + key });
            }
            const subPathPrefix = pathPrefix + key + '.';
            apiList = apiList.concat(getAllAPIs(data[key], subPathPrefix, visited));
        }
    }

    return apiList;
}

function filterCommonAPIs(allAPIs: APIInfo[]): APIInfo[] {
    const commonAPIs = [
        'Array', 'Object', 'Function', 'String', 'Number', 'Boolean', 'Promise', 'Map', 'Set',
        'Date', 'RegExp', 'Math', 'JSON', 'fetch', 'console', 'Error', 'Symbol', 'Intl'
    ];
    // const commonAPIs = ['String'];
    const filterData = [] as APIInfo[];

    commonAPIs.forEach(objName => {
      allAPIs.forEach(api => {
        // const name =  api.name.split('.')?.[0] || '';
        const isHas = api.path.includes(objName) && objName !== api.path;
        // const isHas = commonAPIs.some(item => name.includes(item) && item !== api.path);
        const joinArr = api.path.split('.');
        if (joinArr.length > 0 && isHas) {
          const [first, ...rest] = joinArr;
          filterData.push({
            name: rest.join('.'),
            path: api.path
          })
        }
        // if (isHas) {
        //   filterData.push({
        //     name: api.name.split('.'),
        //     path: api.path
        //   })
        // }
      })
    })

    return filterData


    // allAPIs.forEach(api => {
    //   const name =  api.name.split('.')?.[0] || '';
    //   const isHas = commonAPIs.some(item => name.includes(item) && item !== api.path);
    //   if (isHas) {
    //     filterData.push({
    //       name: api.name.split('.'),
    //       path: api.path
    //     })
    //   }
    // })

  //   const filterData = allAPIs.filter((api: any) => {
  //     const name = api.name.split('.')?.[0] || '';
  //     return commonAPIs.some(item => name.includes(item) && item !== api.path);
  // });
    
    // return 
}


function checkChromeCompatibility(code: string, chromeVersion: number, fileType?: 'vue' | string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const allAPIs = getAllAPIs(bcd.javascript.builtins);
  const filterApis = filterCommonAPIs(allAPIs);
//   const apisToCheck =[
//     { name: 'matchAll', path: 'javascript.builtins.String.matchAll' },
//     { name: 'includes', path: 'javascript.builtins.String.includes' },
//     // 添加其他需要检查的 API
//   ];
  const apisToCheck = filterApis.map(item => ({
    ...item,
    path: `javascript.builtins.${item.path}`
  }));
  console.log('allAPIs======', apisToCheck);

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
          const diagnostic = new Diagnostic(range, `${api.path} not supported in Chrome ${chromeVersion}, The API is supported in Chrome ${version}. `, DiagnosticSeverity.Error);
          diagnostics.push(diagnostic);
        }
    }
  });

  return diagnostics;
}

export { checkChromeCompatibility };
