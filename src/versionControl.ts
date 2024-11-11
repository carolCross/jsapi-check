import { DefaultVerison } from "@/utils";

export let chromeVersion = DefaultVerison;

/** 设置version */
export function setChromeVersion (version: number) {
    chromeVersion = version;
} 