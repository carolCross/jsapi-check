import { Expression } from '@babel/types';
import { isSupportApi } from '../utils';
import { checkChromeCompatibility } from '../compatibilityChecker';
// import { chromeVersion } from '../versionControl';

type CalleeType = {
    node: {
        callee: {
            object: {
                name?: string
            },
            property: {
                name?: string
            }
        } & Expression
    }
} | any

/** 处理所有 new方法调用表达式 */
function dealNewExpression (path: CalleeType, code: string, callBack: (diagnostics: any) => void) {
    const callee = path.node.callee;
    let typeName;
    if (callee.type === "Identifier") {// 单层
      typeName = callee.name;
    } else if (callee.type === "MemberExpression") { // 可以将其看作是new Intl.Locale 两层
      typeName = `${callee.object?.name}.${callee.property?.name}`;
    }
    const isSupport = isSupportApi(typeName);
    if (isSupport) {
       const diagnostics  = checkChromeCompatibility(code, typeName);
       callBack && callBack(diagnostics);
    }
}

export default dealNewExpression;