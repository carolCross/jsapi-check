import { CommonAPIs } from "./constant";
import { SourceLocation } from '@babel/types';

/** 是否支持当前Api */
export const isSupportApi = (fieldType: string): boolean => {
  if (!fieldType) {
    return false;
  }
  const firstApi = fieldType.split(".")?.[0] || "unknow";
  return CommonAPIs.includes(firstApi);
};

/** loc 生成code poi */
export const locToCodePoi = (loc: SourceLocation): CodePoi | null => {
  if (!loc) return null
  const start = loc.start;
  const end = loc.end;
  return {
    start: {
      x: start.line,
      y: start.column,
  },
  end: {
      x: end.line,
      y: end.column,
  }
  }
}
