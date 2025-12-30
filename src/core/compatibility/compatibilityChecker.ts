import { DiagnosticPayload, DiagnosticRange } from "../diagnostic/diagnosticTypes";
import bcd from "@mdn/browser-compat-data";
import { BrowserLabelMap, BuiltinRootAPIs, WebRootAPIs, WebRootAliases } from "../../utils/constant";
import type { BrowserTarget } from "../../utils/constant";
import { browserTarget, browserVersion } from "../versionControl";

type APIInfo = { name: string; path: string };
type ApiIndexEntry = { label: string; path: string; name: string };

let apiIndexCache: Map<string, ApiIndexEntry> | null = null;

type BrowserSupportResult = {
  /** 是否支持 */
  support: boolean;
  /** mdnUrl  */
  mdnUrl: string | undefined;
  /** 当前版本 */
  version: string[];
};

/** support api in target browser */
function getBrowserSupport(
  apiPath: string,
  browser: BrowserTarget,
  version: number = 30
): BrowserSupportResult {
  const supportData = apiPath
    .split(".")
    .reduce((obj: any, key) => obj?.[key], bcd);
  const browserSupport = supportData?.__compat?.support?.[browser];
  if (!browserSupport) {
    return { support: false, mdnUrl: supportData?.__compat?.mdn_url, version: [] };
  }

  const parseVersion = (val: string) => {
    const cleaned = val.replace(/^≤\s*/, "");
    const parsed = parseFloat(cleaned);
    return Number.isNaN(parsed) ? null : parsed;
  };
  const isSupportedEntry = (support: { version_added?: any; version_removed?: any }) => {
    const added = support.version_added;
    if (added === true) return true;
    if (added === false || added == null) return false;
    if (typeof added === "string") {
      const addedVersion = parseVersion(added);
      if (addedVersion === null) return false;
      const removed = support.version_removed;
      if (typeof removed === "string") {
        const removedVersion = parseVersion(removed);
        if (removedVersion !== null && version >= removedVersion) return false;
      }
      return addedVersion <= version;
    }
    return false;
  };

  const toVersionLabel = (value: unknown) => {
    if (value === true || value == null) return "unknown";
    return String(value);
  };

  if (Array.isArray(browserSupport)) {
    const reuslt = browserSupport.some((support) => isSupportedEntry(support));
    return {
      support: reuslt,
      mdnUrl: supportData?.__compat?.mdn_url,
      version: browserSupport.map((support) => toVersionLabel(support.version_added)),
    };
  }

  const reuslt = isSupportedEntry(browserSupport);
  return {
    support: reuslt,
    mdnUrl: supportData?.__compat?.mdn_url,
    version: [toVersionLabel(browserSupport.version_added)],
  };
}

/** 获取所有api 列表 */
function getAllAPIs(
  data: any,
  pathPrefix: string = "",
  visited = new WeakSet(),
  rootAllowList?: string[]
): APIInfo[] {
  // return apiList;
  let apiList: APIInfo[] = [];

  if (typeof data === "object" && data !== null && !visited.has(data)) {
    visited.add(data);

    for (const key in data) {
      const title = pathPrefix + key;
      const joinTitleArray = title.split(".");
      const hasApi = rootAllowList
        ? rootAllowList.some((label) => joinTitleArray.includes(label))
        : true;
      if (
        hasApi &&
        data[key] &&
        typeof data[key] === "object" &&
        data[key].__compat
      ) {
        apiList.push({ name: pathPrefix + key, path: pathPrefix + key });
      }
      const subPathPrefix = pathPrefix + key + ".";
      apiList = apiList.concat(getAllAPIs(data[key], subPathPrefix, visited, rootAllowList));
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

function addApiIndexEntry(
  index: Map<string, ApiIndexEntry>,
  entry: { label: string; path: string; name?: string }
) {
  const name = entry.name ?? entry.label.split(".").pop() ?? entry.label;
  index.set(entry.label, { label: entry.label, path: entry.path, name });
}

/** 构建 API 索引（带缓存） */
function getApiIndex(): Map<string, ApiIndexEntry> {
  if (apiIndexCache) return apiIndexCache;

  const index = new Map<string, ApiIndexEntry>();
  const builtins = bcd?.javascript?.builtins;

  if (builtins) {
    const allAPIs = getAllAPIs(builtins, "", new WeakSet(), BuiltinRootAPIs);
    const filterApis = filterCommonAPIs(allAPIs);
    filterApis.forEach((item) => {
      addApiIndexEntry(index, {
        label: item.path,
        path: `javascript.builtins.${item.path}`,
        name: item.name,
      });
    });
  }

  WebRootAPIs.forEach((root) => {
    const rootData = (bcd as any)?.api?.[root];
    if (!rootData || typeof rootData !== "object") return;
    if (rootData.__compat) {
      addApiIndexEntry(index, { label: root, path: `api.${root}`, name: root });
    }
    const rootApis = getAllAPIs(rootData, `${root}.`, new WeakSet());
    const filterRootApis = filterCommonAPIs(rootApis);
    filterRootApis.forEach((item) => {
      const label = item.path;
      const path = `api.${item.path}`;
      addApiIndexEntry(index, { label, path, name: item.name });
      if (label.endsWith("_static")) {
        const alias = label.replace(/_static$/, "");
        addApiIndexEntry(index, { label: alias, path, name: item.name?.replace(/_static$/, "") });
      }
    });
  });

  Object.entries(WebRootAliases).forEach(([alias, root]) => {
    const rootPrefix = `${root}.`;
    const aliasEntries: ApiIndexEntry[] = [];
    for (const entry of index.values()) {
      if (entry.label === root) {
        aliasEntries.push({ label: alias, path: entry.path, name: alias });
      } else if (entry.label.startsWith(rootPrefix)) {
        const aliasLabel = `${alias}${entry.label.slice(root.length)}`;
        aliasEntries.push({ label: aliasLabel, path: entry.path, name: entry.name });
      }
    }
    aliasEntries.forEach((entry) => addApiIndexEntry(index, entry));
  });

  apiIndexCache = index;
  return index;
}

/** poi => position */
function generatePoiRange(code: CodePoi): DiagnosticRange {
  return {
    start: { line: code.start.x - 1, character: code.start.y },
    end: { line: code.end.x - 1, character: code.end.y },
  };
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
): DiagnosticPayload | undefined | void {
  if (!api) {
    return;
  }
  const { support, version, mdnUrl } = getBrowserSupport(
    api.path,
    browserTarget,
    browserVersion
  );
  if (!support) {
    const browserLabel = BrowserLabelMap[browserTarget];
    function getDiagnostic(codePoi: CodePoi, api: TypeDiagnosticsApi): DiagnosticPayload {
      if (!codePoi) {
        console.error("codePoi is null !");
      }
      return {
        range: generatePoiRange(codePoi),
        message: `${api.label} not supported in ${browserLabel} ${browserVersion}. Supported in ${browserLabel} ${version}.`,
        severity: "error",
        mdnUrl,
      };
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
function checkBrowserCompatibility(
  code: string,
  typeName: string,
  /** 代码高亮位置 */
  codePoi: CodePoi
): DiagnosticPayload | undefined {
  const api = getApiIndex().get(typeName);
  const diagnostic = showDiagnostics(code, api, codePoi);
  return diagnostic as DiagnosticPayload | undefined;
}

export { checkBrowserCompatibility };
