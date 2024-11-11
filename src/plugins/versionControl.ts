import { DefaultVerison } from "@/utils";

/** 全局版本控制 */
export let chromeVersion = DefaultVerison;

/** 设置version */
export function setChromeVersion (version: number) {
    chromeVersion = version;
} 