import { Diagnostic, DiagnosticSeverity, Range, Position } from "vscode";
import bcd from "@mdn/browser-compat-data";
import { CommonAPIs } from "./config";

type APIInfo = { name: string; path: string };

/** support api in Chrome */
function isSupportedInChrome(
  apiPath: string,
  version: number = 30
): {
  /** 是否支持 */
  support: boolean;
  /** mdnUrl  */
  mdnUrl: boolean;
  /** 当前版本 */
  version: string[];
} {
  const supportData = apiPath
    .split(".")
    .reduce((obj: any, key) => obj[key], bcd);
  const chromeSupport = supportData.__compat.support.chrome;
  if (Array.isArray(chromeSupport)) {
    const reuslt = chromeSupport.some(
      (support) =>
        typeof support.version_added === "string" &&
        parseFloat(support.version_added) <= version
    );
    return {
      support: reuslt,
      mdnUrl: supportData.__compat.mdn_url,
      version: chromeSupport.map((support) => support.version_added),
    };
  } else {
    const reuslt =
      typeof chromeSupport.version_added === "string" &&
      parseFloat(chromeSupport.version_added) <= version;
    return {
      support: reuslt,
      mdnUrl: supportData.__compat.mdn_url,
      version: [chromeSupport.version_added],
    };
  }
}

/** 获取所有api 列表 */
function getAllAPIs(
  data: any,
  pathPrefix: string = "",
  visited = new WeakSet()
): APIInfo[] {
  // return apiList;
  let apiList: APIInfo[] = [];

  if (typeof data === "object" && data !== null && !visited.has(data)) {
    visited.add(data);

    for (const key in data) {
      const title = pathPrefix + key;
      const joinTitleArray = title.split(".");
      const hasApi = CommonAPIs.some((label) => joinTitleArray.includes(label));
      if (
        hasApi &&
        data[key] &&
        typeof data[key] === "object" &&
        data[key].__compat
      ) {
        apiList.push({ name: pathPrefix + key, path: pathPrefix + key });
      }
      const subPathPrefix = pathPrefix + key + ".";
      apiList = apiList.concat(getAllAPIs(data[key], subPathPrefix, visited));
    }
  }

  return apiList;
}

function filterCommonAPIs(allAPIs: APIInfo[]): APIInfo[] {
  const filterData = [] as APIInfo[];
  allAPIs.forEach((api) => {
    const joinArr = api.path.split(".");
    if (joinArr.length > 0) {
      const [first, ...rest] = joinArr;
      if (rest.length) {
        filterData.push({
          name: rest.join("."),
          path: api.path,
        });
      }
    }
  });

  return filterData;
}

function checkChromeCompatibility(
  code: string,
  chromeVersion: number,
  fileType?: "vue" | string
): Diagnostic[] {
  console.log('fileType----', fileType);
  const diagnostics: Diagnostic[] = [];
  const allAPIs = getAllAPIs(bcd.javascript.builtins);
  const filterApis = filterCommonAPIs(allAPIs);
  //   const apisToCheck =[
  //     { name: 'matchAll', path: 'javascript.builtins.String.matchAll' },
  //     { name: 'includes', path: 'javascript.builtins.String.includes' },
  //     // 添加其他需要检查的 API
  //   ];
  const apisToCheck = filterApis.map((item) => ({
    ...item,
    path: `javascript.builtins.${item.path}`,
    label: item.path,
  }));

  apisToCheck.forEach((api) => {
    const { support, version, mdnUrl } = isSupportedInChrome(api.path, chromeVersion);
    if (!support) {
      const regex = new RegExp(`\\b${api.name}\\b`, "g");
      let match;
      while ((match = regex.exec(code)) !== null) {
        const startPos = code
          .substr(0, match.index)
          .split("\n")
          .reduce(
            (acc, line) => {
              acc.line++;
              acc.character = line.length;
              return acc;
            },
            { line: 0, character: 0 }
          );

        const endPos = new Position(
          startPos.line,
          startPos.character + api.name.length
        );
        const range = new Range(
          new Position(startPos.line, startPos.character),
          endPos
        );
        const diagnostic = new Diagnostic(
          range,
          `${api.label} not supported in Chrome ${chromeVersion}, The API is supported in Chrome ${version}.[Mdnurl](${mdnUrl})`,
          DiagnosticSeverity.Error
        );
        diagnostics.push(diagnostic);
      }
    }
  });

  return diagnostics;
}

export { checkChromeCompatibility };
