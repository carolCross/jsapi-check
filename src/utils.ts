import { CommonAPIs } from "./config";

/** 是否支持当前Api */
export const isSupportApi = (fieldType: string): boolean => {
  if (!fieldType) {
    return false;
  }
  const firstApi = fieldType.split(".")?.[0] || "unknow";
  return CommonAPIs.includes(firstApi);
};
