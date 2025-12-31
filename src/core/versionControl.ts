import { DefaultBrowser, DefaultBrowserVersionMap } from "../utils/constant";
import type { BrowserTarget } from "../utils/constant";

export let browserTarget: BrowserTarget = DefaultBrowser;
export let browserVersion = DefaultBrowserVersionMap[DefaultBrowser];

/** 设置浏览器类型 */
export function setBrowserTarget(target: BrowserTarget) {
    browserTarget = target;
}

/** 设置版本 */
export function setBrowserVersion(version: number) {
    browserVersion = version;
}
