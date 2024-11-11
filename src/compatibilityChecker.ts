import { Diagnostic, DiagnosticSeverity, Range, Position } from "vscode";
import bcd from "@mdn/browser-compat-data";
import { SourceLocation } from "@babel/types";
import { CommonAPIs } from "./utils/constant";
import { chromeVersion } from "./versionControl";

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

// `startPos` 和 `endPos` 是字符在字符串中的索引位置
function pickTextStartEndPoi(
  fullText: string,
  startPos: Record<"character", number>,
  endPos: Record<"character", number>
) {
  return fullText.substring(startPos.character, endPos.character);
}

/** 获取所有 可用的useApiList 排除为支持的api列表 */
function getAllUseApiList() {
  const javascript = bcd.javascript;
  const builtins = javascript.builtins;
  const allAPIs = getAllAPIs(builtins);
  const filterApis = filterCommonAPIs(allAPIs);
  const apiLists = filterApis.map((item) => ({
    ...item,
    path: `javascript.builtins.${item.path}`,
    label: item.path,
  }));
  return apiLists;
}

/** poi => position */
function generatePoiRange(code: CodePoi) {
  const startPoi = new Position(code.start.x - 1, code.start.y);
  const endPoi = new Position(code.end.x - 1, code.end.y);
  const range = new Range(startPoi, endPoi);
  return range;
}

/**
 * 字符串去匹配
 */
function getDiagnosticByRegExp(
  code: string,
  api: {
    path: string;
    label: string;
    name: string;
  }
): CodePoi | undefined {
  const regex = new RegExp(`\\b${api.name}\\b`, "g");
  let match;
  while ((match = regex.exec(code)) !== null) {
    const codeResult = code.substr(0, match.index).split("\n");
    const startPos = codeResult.reduce(
      (acc, line) => {
        acc.line++;
        acc.character = line.length;
        return acc;
      },
      { line: 0, character: 0 }
    );

    const param = {
      start: {
        x: startPos.line - 1,
        y: startPos.character,
      },
      end: {
        x: startPos.line - 1,
        y: startPos.character + api.name.length,
      },
    };
    return param;
  }
  return undefined;
}

type TypeDiagnosticsApi = {
  path: string;
  label: string;
  name: string;
};

/** 展示vscode提示错误信息 */
function showDiagnostics(
  code: string,
  api: TypeDiagnosticsApi | undefined,
  /** 代码高亮位置 如果未传则用字符串兜底去匹配 */
  codePoi?: CodePoi
): Diagnostic | undefined | void {
  if (!api) {
    return console.warn("未找到api======", api);
  }
  const { support, version, mdnUrl } = isSupportedInChrome(
    api.path,
    chromeVersion
  );
  if (!support) {
    function getDiagnostic(codePoi: CodePoi, api: TypeDiagnosticsApi) {
      if (!codePoi) return console.error("codePoi is null !");
      const range = generatePoiRange(codePoi);
      return new Diagnostic(
        range,
        `${api.label} not supported in Chrome ${chromeVersion}, The API is supported in Chrome ${version}.[Mdnurl](${mdnUrl})`,
        DiagnosticSeverity.Error
      );
    }
    if (codePoi) {
      return getDiagnostic(codePoi, api);
    } else {
      const codePoi = getDiagnosticByRegExp(code, api);
      if (!codePoi) return;
      return getDiagnostic(codePoi, api);
    }
  }
}

/** 检测浏览器兼容性 */
function checkChromeCompatibility(
  code: string,
  typeName: string,
  /** 代码高亮位置 */
  codePoi: CodePoi
): Diagnostic {
  const apisToCheck = getAllUseApiList();
  const api = (apisToCheck || []).find((item) => item.label === typeName);
  const diagnostic = showDiagnostics(code, api, codePoi);
  return diagnostic as Diagnostic;
}

export { checkChromeCompatibility };
