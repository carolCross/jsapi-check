import { DefaultVerison } from "./config";

export let chromeVersion = DefaultVerison;

/** 设置version */
export function setChromeVersion (version: number) {
    chromeVersion = version;
} 