import { SupportedRootAPIs } from "./constant";
import { SourceLocation } from '@babel/types';

/** 是否支持当前Api */
export const isSupportApi = (fieldType: string): boolean => {
  if (!fieldType) {
    return false;
  }
  const firstApi = fieldType.split(".")?.[0] || "unknow";
  return SupportedRootAPIs.includes(firstApi);
};

/** loc 生成code poi startLine 为起始行数 */
export const locToCodePoi = (loc: SourceLocation, startLine?: number): CodePoi | null => {
  if (!loc) return null
  const start = loc.start;
  const end = loc.end;
  return {
    start: {
      x: start.line + (startLine || 0),
      y: start.column,
    },
    end: {
        x: end.line + (startLine || 0),
        y: end.column,
    }
  }
}
